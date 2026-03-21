import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const offlineStorageMocks = vi.hoisted(() => ({
  clearAllData: vi.fn<() => Promise<void>>(),
}));

vi.mock('../../lib/offline-storage', () => ({
  offlineStorage: offlineStorageMocks,
}));

import { TeardownCoordinator } from '../TeardownCoordinator';

type MutableDeleteRequest = {
  onsuccess: null | (() => void);
  onerror: null | (() => void);
  onblocked: null | (() => void);
};

function mockDeleteDatabase(failing: Set<string>) {
  return vi.spyOn(indexedDB, 'deleteDatabase').mockImplementation((name: string) => {
    const req: MutableDeleteRequest = {
      onsuccess: null,
      onerror: null,
      onblocked: null,
    };

    queueMicrotask(() => {
      if (failing.has(name)) {
        req.onerror?.();
      } else {
        req.onsuccess?.();
      }
    });

    return req as unknown as IDBOpenDBRequest;
  });
}

function installServiceWorkerMock(shouldFail = false) {
  Object.defineProperty(globalThis.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      getRegistrations: vi.fn(async () => {
        if (shouldFail) throw new Error('service worker registry unavailable');
        return [
          { unregister: vi.fn(async () => true) },
          { unregister: vi.fn(async () => true) },
        ];
      }),
    },
  });
}

function installCachesMock(initial: string[] = ['app-cache', 'asset-cache']) {
  const names = [...initial];
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: {
      keys: vi.fn(async () => [...names]),
      delete: vi.fn(async (name: string) => {
        const idx = names.indexOf(name);
        if (idx >= 0) names.splice(idx, 1);
        return true;
      }),
    },
  });
}

describe('TeardownCoordinator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    offlineStorageMocks.clearAllData.mockResolvedValue(undefined);

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('pain-tracker-storage', 'canary');

    installServiceWorkerMock(false);
    installCachesMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns ok=true only after full wipe and verification success', async () => {
    const dbSpy = mockDeleteDatabase(new Set());

    const coordinator = new TeardownCoordinator();
    const report = await coordinator.run({
      canaryKey: 'pain-tracker-storage',
      knownDatabases: ['pain-tracker-audit'],
      clearSecureStorage: vi.fn(),
    });

    expect(report.ok).toBe(true);
    expect(offlineStorageMocks.clearAllData).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalled();
    expect(report.verification).toMatchObject({
      cachesRemaining: 0,
      unresolvedDatabases: [],
      localStorageRemnants: 0,
      sessionStorageRemnants: 0,
      canaryKeyPresent: false,
    });
  });

  it('returns red-alert report when any sector fails but still executes other sectors', async () => {
    installServiceWorkerMock(true);
    mockDeleteDatabase(new Set());

    const coordinator = new TeardownCoordinator();
    const report = await coordinator.run({
      canaryKey: 'pain-tracker-storage',
      knownDatabases: ['pain-tracker-audit'],
      clearSecureStorage: vi.fn(),
    });

    expect(report.ok).toBe(false);
    expect(offlineStorageMocks.clearAllData).toHaveBeenCalledTimes(1);
    expect(report.sectors.some(s => s.sector === 'service-workers' && s.ok === false)).toBe(true);
    expect(report.sectors.some(s => s.sector === 'caches' && s.ok === true)).toBe(true);
    expect(report.sectors.some(s => s.sector === 'offline-storage' && s.ok === true)).toBe(true);
  });

  it('flags unresolved indexeddb deletion as degraded verification', async () => {
    mockDeleteDatabase(new Set(['pain-tracker-audit']));

    const coordinator = new TeardownCoordinator();
    const report = await coordinator.run({
      canaryKey: 'pain-tracker-storage',
      knownDatabases: ['pain-tracker-audit'],
    });

    expect(report.ok).toBe(false);
    expect(report.verification.unresolvedDatabases).toContain('pain-tracker-audit');
    expect(report.sectors.some(s => s.sector === 'indexeddb' && s.ok === false)).toBe(true);
  });

  it('flags canary persistence even when no sector throws', async () => {
    mockDeleteDatabase(new Set());
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'pain-tracker-storage') return 'still-here';
      return null;
    });

    const coordinator = new TeardownCoordinator();
    const report = await coordinator.run({
      canaryKey: 'pain-tracker-storage',
      knownDatabases: ['pain-tracker-audit'],
    });

    expect(report.ok).toBe(false);
    expect(report.verification.canaryKeyPresent).toBe(true);
  });

  it('runs pre-indexeddb teardown hook before deleting databases', async () => {
    const dbSpy = mockDeleteDatabase(new Set());
    const preIndexedDbTeardown = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    const coordinator = new TeardownCoordinator();
    const report = await coordinator.run({
      canaryKey: 'pain-tracker-storage',
      knownDatabases: ['pain-tracker-audit'],
      beforeIndexedDbTeardown: preIndexedDbTeardown,
    });

    expect(report.sectors.some(s => s.sector === 'indexeddb')).toBe(true);
    expect(preIndexedDbTeardown).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalled();
  });
});

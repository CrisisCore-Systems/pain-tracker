import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pwaManager } from '../utils/pwa-utils';
// Stub offlineStorage to avoid indexedDB reference errors in jsdom
vi.mock('../lib/offline-storage', () => ({
  offlineStorage: {
    init: vi.fn().mockResolvedValue(undefined),
    exportData: vi.fn().mockResolvedValue({ syncQueue: [] }),
    addToSyncQueue: vi.fn().mockResolvedValue(undefined),
    getStorageUsage: vi.fn().mockResolvedValue({ used: 0, quota: 0 }),
    clearAllData: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock service worker environment
class MockServiceWorkerRegistration {
  listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  installing: { state: string; addEventListener: (t: string, cb: (...args: unknown[]) => void) => void } | null = null;
  addEventListener(type: string, cb: (...args: unknown[]) => void) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(cb);
  }
}

// Provide minimal navigator mock
const originalNavigator = globalThis.navigator;

beforeEach(() => {
  (globalThis as unknown as { navigator: unknown }).navigator = {
    serviceWorker: {
      register: async () => {
        // Return mock registration
        const reg = new MockServiceWorkerRegistration();
        reg.installing = { state: 'installed', addEventListener: (_: string, cb: (...args: unknown[]) => void) => cb() };
        return reg;
      },
      addEventListener: () => {}
    },
    storage: { persist: async () => false },
  };
  // Force capability so __test_registerSW path proceeds
  // Internal capability override for test; cast through unknown to avoid any
  const internalCaps = (pwaManager as unknown as { capabilities: { serviceWorker: boolean } }).capabilities;
  internalCaps.serviceWorker = true;
});

describe('PWA service worker registration', () => {
  it('registers service worker via test hook', async () => {
    await pwaManager.__test_registerSW();
    // Access internal for assertion (non-public in prod; acceptable in tests)
    // @ts-expect-error internal access for test
    expect(pwaManager.swRegistration).toBeTruthy();
  });
});

import { afterAll } from 'vitest';
afterAll(() => { if (originalNavigator) (globalThis as unknown as { navigator: Navigator }).navigator = originalNavigator; });

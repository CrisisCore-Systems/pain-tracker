import { describe, it, expect, vi, beforeEach } from 'vitest';

type SyncQueueItem = {
  id: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  priority: string;
  type: string;
  retryCount: number;
  timestamp: string;
};

type BackgroundSyncTestShim = {
  isOnline: boolean;
  syncInProgress: boolean;
};

// Vitest hoists vi.mock() calls, so any referenced values must be created via vi.hoisted().
const offlineStorageMocks = vi.hoisted(() => ({
  getSyncQueue: vi.fn<() => Promise<Array<SyncQueueItem>>>(),
  addToSyncQueue: vi.fn().mockResolvedValue(1),
  removeSyncQueueItem: vi.fn<(id: number) => Promise<void>>(),
  updateSyncQueueItem: vi.fn().mockResolvedValue(undefined),
  getUnsyncedData: vi.fn().mockResolvedValue([]),
}));

vi.mock('../lib/offline-storage', () => ({
  offlineStorage: offlineStorageMocks,
}));

// Import after mocks.
import { backgroundSync } from '../lib/background-sync';

function okResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({}),
  } as unknown as Response;
}

describe('background sync local-only guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Ensure async mocks have sensible defaults for each test.
    offlineStorageMocks.getUnsyncedData.mockResolvedValue([]);
    offlineStorageMocks.updateSyncQueueItem.mockResolvedValue(undefined);
    offlineStorageMocks.removeSyncQueueItem.mockResolvedValue(undefined);
    offlineStorageMocks.addToSyncQueue.mockResolvedValue(1);

    // Ensure the singleton considers us online.
    const shim = backgroundSync as unknown as BackgroundSyncTestShim;
    shim.isOnline = true;
    shim.syncInProgress = false;

    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });

  it('clears queued items during sync when local-only mode is active', async () => {
    offlineStorageMocks.getSyncQueue.mockResolvedValueOnce([
      {
        id: 1,
        url: 'https://evil.example/collect',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"x":1}',
        priority: 'high',
        type: 'api-request',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      },
    ]);

    const stats = await backgroundSync.syncAllPendingData();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(offlineStorageMocks.removeSyncQueueItem).toHaveBeenCalledWith(1);
    expect(stats.skippedCount).toBe(1);
    expect(stats.errors[0]).toContain('Sync disabled: No authorized destination.');
  });

  it('does not replay even allowlisted /api queue items in local-only mode', async () => {
    offlineStorageMocks.getSyncQueue.mockResolvedValueOnce([
      {
        id: 2,
        url: '/api/pain-entries',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Extra': 'nope' },
        body: '{"pain":5}',
        priority: 'high',
        type: 'api-request',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      },
    ]);

    const stats = await backgroundSync.syncAllPendingData();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(offlineStorageMocks.removeSyncQueueItem).toHaveBeenCalledWith(2);
    expect(stats.skippedCount).toBe(1);
  });

  it('refuses to enqueue any URL in local-only mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await backgroundSync.queueForSync('/api/pain-entries', 'POST', { x: 1 }, 'high');

    expect(offlineStorageMocks.addToSyncQueue).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
});

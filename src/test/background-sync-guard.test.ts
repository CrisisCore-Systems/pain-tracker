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

describe('background sync replay guard', () => {
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

  it('drops and never replays cross-origin queue items', async () => {
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
    expect(stats.failureCount).toBe(1);
  });

  it('replays same-origin /api queue items', async () => {
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

    await backgroundSync.syncAllPendingData();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const call = (globalThis.fetch as unknown as { mock: { calls: Array<[string, RequestInit]> } }).mock.calls[0];
    expect(call[0]).toBe('/api/pain-entries');

    // Ensure header sanitization drops unexpected headers.
    expect(call[1].headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('refuses to enqueue disallowed URLs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await backgroundSync.queueForSync('https://evil.example/collect', 'POST', { x: 1 }, 'high');

    expect(offlineStorageMocks.addToSyncQueue).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
});

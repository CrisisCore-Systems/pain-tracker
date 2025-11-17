import { describe, it, expect, beforeEach } from 'vitest';
import {
  getQueue,
  queueFailedRequest,
  processQueue,
  type OfflineQueueDeps,
} from '../lib/offline/queue';

// Minimal in-memory cache mock
class MemoryCache {
  store = new Map<string, Response>();
  async match(key: string | Request) {
    return this.store.get(typeof key === 'string' ? key : key.url);
  }
  async put(key: string | Request, response: Response) {
    this.store.set(typeof key === 'string' ? key : key.url, response);
  }
}

describe('offline queue', () => {
  let cache: MemoryCache;
  let deps: OfflineQueueDeps;
  let fetchCalls: Array<{ input: string | Request; init?: RequestInit }>;

  beforeEach(() => {
    cache = new MemoryCache();
    fetchCalls = [];
    deps = {
      openCache: async () => cache,
      fetchFn: async (input, init) => {
        fetchCalls.push({ input, init });
        // Simulate success for POST /ok, failure otherwise
        if (typeof input === 'string' && input.includes('/ok')) {
          return new Response('ok', { status: 200 });
        }
        return new Response('fail', { status: 500 });
      },
      log: () => {},
    };
  });

  it('queues failed request and retrieves it', async () => {
    const req = new Request('https://example.com/api/pain-entries', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });
    const queued = await queueFailedRequest(req, deps);
    expect(queued.url).toContain('/api/pain-entries');
    const q = await getQueue(deps);
    expect(q.length).toBe(1);
  });

  it('processes queue removing successful items and leaving failures', async () => {
    // Queue two requests: one that will succeed, one fail
    await queueFailedRequest(new Request('https://x.test/ok', { method: 'POST', body: '1' }), deps);
    await queueFailedRequest(
      new Request('https://x.test/fail', { method: 'POST', body: '2' }),
      deps
    );
    const result = await processQueue(deps);
    expect(result.processed).toBe(1);
    expect(result.remaining).toBe(1);
    const after = await getQueue(deps);
    expect(after.length).toBe(1);
    expect(after[0].url).toContain('/fail');
  });
});

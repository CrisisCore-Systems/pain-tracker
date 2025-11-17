/**
 * Offline request queue utilities extracted from service worker for unit testing.
 * Provides dependency injection for fetch and caches to enable deterministic tests.
 */
export interface QueuedRequestData {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

export interface OfflineQueueDeps {
  openCache(name: string): Promise<CacheLike>;
  fetchFn(input: Request | string, init?: RequestInit): Promise<Response>;
  log?: (...args: unknown[]) => void;
}

export interface CacheLike {
  match(key: string | Request): Promise<Response | undefined>;
  put(key: string | Request, response: Response): Promise<void>;
}

const DEFAULT_QUEUE_CACHE = 'offline-queue';
const QUEUE_KEY = 'offline-requests';

export async function getQueue(deps: OfflineQueueDeps): Promise<QueuedRequestData[]> {
  try {
    const cache = await deps.openCache(DEFAULT_QUEUE_CACHE);
    const existing = await cache.match(QUEUE_KEY);
    if (existing) {
      const json = await existing.json();
      return Array.isArray(json) ? json : [];
    }
  } catch (e) {
    deps.log?.('offline-queue:getQueue error', e);
  }
  return [];
}

export async function saveQueue(queue: QueuedRequestData[], deps: OfflineQueueDeps): Promise<void> {
  try {
    const cache = await deps.openCache(DEFAULT_QUEUE_CACHE);
    await cache.put(
      QUEUE_KEY,
      new Response(JSON.stringify(queue), { headers: { 'Content-Type': 'application/json' } })
    );
  } catch (e) {
    deps.log?.('offline-queue:saveQueue error', e);
  }
}

export async function queueFailedRequest(
  req: Request,
  deps: OfflineQueueDeps
): Promise<QueuedRequestData> {
  const data: QueuedRequestData = {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    body: req.method !== 'GET' ? await req.clone().text() : null,
    timestamp: Date.now(),
  };
  const queue = await getQueue(deps);
  queue.push(data);
  await saveQueue(queue, deps);
  return data;
}

export interface ProcessResult {
  processed: number;
  remaining: number;
}

export async function processQueue(deps: OfflineQueueDeps): Promise<ProcessResult> {
  const queue = await getQueue(deps);
  if (!queue.length) return { processed: 0, remaining: 0 };
  const remaining: QueuedRequestData[] = [];
  let processed = 0;
  for (const item of queue) {
    try {
      const res = await deps.fetchFn(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (res.ok) processed++;
      else remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }
  await saveQueue(remaining, deps);
  return { processed, remaining: remaining.length };
}

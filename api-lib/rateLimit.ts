// Simple in-memory rate limiter for serverless functions.
// NOTE: This is a basic implementation for demo/staging. In production behind multiple serverless
// instances, prefer a shared store (Redis) or a managed rate-limiting / WAF solution.
type Entry = { count: number; reset: number };

const store: Map<string, Entry> = new Map();

export function checkRateLimit(key: string, windowMs = 60 * 60 * 1000, max = 5): { ok: boolean; remaining: number; resetAt?: number } {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (existing.count >= max) {
    return { ok: false, remaining: 0, resetAt: existing.reset };
  }

  existing.count += 1;
  store.set(key, existing);
  return { ok: true, remaining: max - existing.count, resetAt: existing.reset };
}

export function getRateLimitStatus(key: string) {
  const e = store.get(key);
  if (!e) return { count: 0, resetAt: null };
  return { count: e.count, resetAt: e.reset };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

export default { checkRateLimit, getRateLimitStatus, resetRateLimit };

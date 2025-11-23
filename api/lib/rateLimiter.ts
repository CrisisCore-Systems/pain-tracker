/**
 * Simple in-memory rate limiter for API endpoints.
 * Not a replacement for production-grade rate limiting (use a shared store like Redis).
 */
import RedisRateLimiter from './rateLimiterRedis';

type Entry = { count: number; expiresAt: number };

export class MemoryRateLimiter {
  private map: Map<string, Entry> = new Map();
  isRateLimited(key: string | null | undefined, limit = 5): boolean {
    if (!key) return false;
    const now = Date.now();
    const entry = this.map.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= now) {
      this.map.delete(key);
      return false;
    }
    return entry.count >= limit;
  }
  increment(key: string | null | undefined, _limit = 5, windowMs = 1000 * 60 * 60) {
    if (!key) return;
    void _limit;
    const now = Date.now();
    const entry = this.map.get(key);
    if (!entry || entry.expiresAt <= now) {
      this.map.set(key, { count: 1, expiresAt: now + windowMs });
      return;
    }
    entry.count += 1;
    this.map.set(key, entry);
  }
  reset(key: string) { this.map.delete(key); }
  clear() { this.map.clear(); }
  getResetAt(key: string) { const entry = this.map.get(key); if (!entry) return null; return entry.expiresAt; }
}

// Export a simple interface-compatible object that may use Redis if configured
interface RateLimiterInterface {
  isRateLimited(key: string | null | undefined, limit?: number): Promise<boolean> | boolean;
  increment(key: string | null | undefined, limit?: number, windowMs?: number): Promise<void> | void;
  getResetAt(key: string | null | undefined): Promise<number | null> | number | null;
  reset(key: string | null | undefined): Promise<void> | void;
}
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS; // support both
let instance: RateLimiterInterface = new MemoryRateLimiter();
if (REDIS_URL) {
  try {
    // Initialize Redis-backed limiter
    const r = new RedisRateLimiter(REDIS_URL);
    instance = {
      isRateLimited: async (key: string | null | undefined, limit = 5) => await r.isRateLimited(key, limit),
      increment: async (key: string | null | undefined, limit = 5, windowMs = 1000 * 60 * 60) => await r.increment(key, limit, windowMs),
      getResetAt: async (key: string | null | undefined) => await r.getResetAt(key),
      reset: async (key: string | null | undefined) => await r.reset(key),
    };
  } catch (e) {
    console.warn('Failed to initialize Redis rate limiter, falling back to memory', e);
    instance = new MemoryRateLimiter();
  }
}

export default instance;

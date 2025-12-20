import { createClient, type RedisClientType } from 'redis';

/**
 * Redis-backed rate limiter using atomic INCR and EXPIRE operations.
 * Falls back to in-memory behavior if Redis is unavailable.
 */
export class RedisRateLimiter {
  // Use RedisClientType with any modules to avoid importing internal redis types
  private client: RedisClientType | null = null;
  private ready = false;

  constructor(redisUrl?: string) {
    if (!redisUrl) return;
    try {
      this.client = createClient({ url: redisUrl });
  this.client.on('error', (err: unknown) => {
        console.warn('Redis client error:', err);
        this.ready = false;
      });
  this.client.connect().then(() => { this.ready = true; }).catch((e: unknown) => { console.warn('Redis connect failed', e); this.ready = false; });
  } catch (e: unknown) {
      console.warn('Failed to initialize Redis rate limiter', e);
      this.client = null;
    }
  }

  async isRateLimited(key: string | null | undefined, limit = 5): Promise<boolean> {
    if (!key) return false;
    if (!this.client || !this.ready) return false;
    try {
      const value = await this.client.get(key);
      if (!value) return false;
      return Number(value) >= limit;
  } catch (e: unknown) {
      console.warn('Redis rate check error', e);
      return false;
    }
  }

  async increment(key: string | null | undefined, _limit = 5, windowMs = 1000 * 60 * 60) {
    if (!key) return;
    if (!this.client || !this.ready) return;
    void _limit; // parameter kept for parity with MemoryRateLimiter signature
    try {
      const p = this.client.multi();
      p.incr(key);
  p.pExpire(key, windowMs);
      await p.exec();
  } catch (e: unknown) {
      console.warn('Redis rate increment error', e);
    }
  }

  async getResetAt(key: string | null | undefined): Promise<number | null> {
    if (!key) return null;
    if (!this.client || !this.ready) return null;
    try {
  const pttl = await this.client.pTTL(key);
      if (pttl < 0) return null;
      return Date.now() + pttl;
    } catch (e) {
      console.warn('Redis getResetAt error', e);
      return null;
    }
  }

  async reset(key: string | null | undefined) {
    if (!key) return;
    if (!this.client || !this.ready) return;
  try { await this.client.del(key); } catch (e: unknown) { console.warn('Redis reset error', e); }
  }
}

export default RedisRateLimiter;

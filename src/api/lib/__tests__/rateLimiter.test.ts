import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRateLimiter } from '../../../../api/lib/rateLimiter';

describe('RateLimiter', () => {
  let limiter: MemoryRateLimiter;
  beforeEach(() => { limiter = new MemoryRateLimiter(); });
  afterEach(() => { limiter.clear(); vi.resetAllMocks(); });

  it('allows requests under the limit', () => {
    const key = 'user:1';
    expect(limiter.isRateLimited(key, 3)).toBe(false);
    limiter.increment(key, 3, 2000);
    expect(limiter.isRateLimited(key, 3)).toBe(false);
  });

  it('blocks when limit exceeded', () => {
    const key = 'user:2';
    for (let i = 0; i < 3; i++) limiter.increment(key, 3, 2000);
    expect(limiter.isRateLimited(key, 3)).toBe(true);
  });

  it('resets after window expires', async () => {
    const key = 'user:3';
    limiter.increment(key, 2, 50);
    limiter.increment(key, 2, 50);
    expect(limiter.isRateLimited(key, 2)).toBe(true);
    // wait for the window
    await new Promise(res => setTimeout(res, 60));
    expect(limiter.isRateLimited(key, 2)).toBe(false);
  });
});

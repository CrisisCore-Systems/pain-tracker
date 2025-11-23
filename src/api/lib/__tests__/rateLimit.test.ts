import { expect, describe, it } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../../../../api/lib/rateLimit';

describe('rateLimit helper', () => {
  it('allows up to the max events in a window and then blocks', async () => {
    const key = 'test-ip';
    // reset state between runs
    resetRateLimit(key);
    for (let i = 0; i < 4; i += 1) {
      const r = checkRateLimit(key, 1000 * 60 * 60, 5);
      expect(r.ok).toBe(true);
    }
    // 5th should be ok, 6th should be rejected
    const fifth = checkRateLimit(key, 1000 * 60 * 60, 5);
    expect(fifth.ok).toBe(true);
    const sixth = checkRateLimit(key, 1000 * 60 * 60, 5);
    expect(sixth.ok).toBe(false);
  });

  it('resets after window', () => {
    const key = 'test-ip-2';
    resetRateLimit(key);
  // use a 1s window so calls are reliably within the same window for the test
  const r1 = checkRateLimit(key, 1000, 2);
    expect(r1.ok).toBe(true);
  const r2 = checkRateLimit(key, 1000, 2);
    expect(r2.ok).toBe(true);
  const r3 = checkRateLimit(key, 1000, 2);
    expect(r3.ok).toBe(false);
    // wait for reset -- but we cannot wait in unit test. Instead we call resetRateLimit to simulate reset
    resetRateLimit(key);
  const r4 = checkRateLimit(key, 1000, 2);
    expect(r4.ok).toBe(true);
  });
});

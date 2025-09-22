import { describe, it, expect } from 'vitest';
import { estimateBytes, isLikelyExceedingLimit } from '../size';

describe('storage size helpers', () => {
  it('estimates bytes for strings and objects', () => {
    const s = 'hello world';
    const n = estimateBytes(s);
    expect(n).toBeGreaterThanOrEqual(11);

    const obj = { a: 'x'.repeat(1000) };
    expect(estimateBytes(obj)).toBeGreaterThan(1000);
  });

  it('detects when over limit', () => {
    const big = 'x'.repeat(60000);
    expect(isLikelyExceedingLimit(big, 50 * 1024)).toBe(true);
  });
});

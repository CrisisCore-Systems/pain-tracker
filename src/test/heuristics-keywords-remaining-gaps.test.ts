import { describe, it, expect } from 'vitest';
import { keywordHitCount, aggregateKeywordDensity, pearsonCorrelation } from '../lib/analytics/heuristics';

describe('heuristics keyword & correlation remaining branches', () => {
  it('keywordHitCount counts multiple keyword occurrences once each', () => {
    const text = 'Pain improved after rest and rest plus hydration';
    const hits = keywordHitCount(text, ['rest','hydration','sleep']);
    expect(hits).toBe(2); // rest present, hydration present, sleep absent
  });

  it('aggregateKeywordDensity handles empty notes array early return', () => {
    expect(aggregateKeywordDensity([], ['a'])).toBe(0);
  });

  it('pearsonCorrelation returns 0 for length mismatch', () => {
    expect(pearsonCorrelation([1,2,3],[1,2])).toBe(0);
  });
});

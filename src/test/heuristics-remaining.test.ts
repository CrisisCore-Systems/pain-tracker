import { describe, it, expect } from 'vitest';
import { keywordHitCount, aggregateKeywordDensity, boundedScore } from '../lib/analytics/heuristics';

describe('heuristics remaining coverage', () => {
  it('keywordHitCount counts multiple distinct keyword hits case-insensitively', () => {
    const text = 'Pain improved after REST and Hydration, REST again helped.';
    const hits = keywordHitCount(text, ['rest', 'hydration', 'sleep']);
    expect(hits).toBe(2); // rest + hydration (sleep missing)
  });

  it('aggregateKeywordDensity handles mixed notes and divides by total notes length', () => {
    const notes = ['Severe fatigue today', 'Minor fatigue but improved', 'No issues'];
    const density = aggregateKeywordDensity(notes, ['fatigue', 'flare']);
    // hits: first(1), second(1), third(0) => 2 / 3
    expect(density).toBeCloseTo(2/3, 5);
  });

  it('boundedScore clamps below min and above max', () => {
    expect(boundedScore(-50, 0, 10)).toBe(0);
    expect(boundedScore(500, 0, 10)).toBe(10);
    expect(boundedScore(5, 0, 10)).toBe(5);
  });
});

import { describe, it, expect } from 'vitest';
import {
  movingAverage,
  linearRegression,
  pearsonCorrelation,
  detectStdDevAnomalies,
} from '../lib/analytics/heuristics';

describe('analytics heuristics', () => {
  it('movingAverage computes windowed averages', () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5]);
  });

  it('movingAverage falls back to 0 when a window average is not finite', () => {
    expect(movingAverage([Number.NaN], 3)).toEqual([0]);
  });
  it('linearRegression slope positive for increasing series', () => {
    const r = linearRegression([1, 2, 3, 4, 5]);
    expect(r.slope).toBeGreaterThan(0);
    expect(r.r2).toBeGreaterThan(0.9);
  });
  it('pearsonCorrelation near 1 for identical sequences', () => {
    const c = pearsonCorrelation([1, 2, 3], [1, 2, 3]);
    expect(c).toBeGreaterThan(0.99);
  });
  it('detectStdDevAnomalies finds outliers', () => {
    const idx = detectStdDevAnomalies([1, 1, 1, 10]);
    expect(idx.length).toBe(1);
    expect(idx[0]).toBe(3);
  });
});

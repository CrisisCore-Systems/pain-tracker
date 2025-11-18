import { describe, it, expect } from 'vitest';
import {
  movingAverage,
  linearRegression,
  detectStdDevAnomalies,
  boundedScore,
  pearsonCorrelation,
} from '../lib/analytics/heuristics';

describe('heuristics additional edge coverage', () => {
  it('handles movingAverage window <=1 early return path', () => {
    const vals = [1, 2, 3];
    expect(movingAverage(vals, 1)).toEqual(vals); // window<=1 branch
  });

  it('linearRegression empty array branch', () => {
    expect(linearRegression([])).toEqual({ slope: 0, intercept: 0, r2: 0 });
  });

  it('linearRegression single element covers zero-denominator fallback', () => {
    const res = linearRegression([5]);
    expect(res.slope).toBe(0); // denominator fallback path used
    expect(res.intercept).toBe(5);
  });

  it('detectStdDevAnomalies length<2 early return', () => {
    expect(detectStdDevAnomalies([5])).toEqual([]);
  });

  it('boundedScore clamps extremes', () => {
    expect(boundedScore(-10)).toBe(0);
    expect(boundedScore(150)).toBe(100);
  });

  it('pearsonCorrelation zero variance returns 0 (den=0 path)', () => {
    expect(pearsonCorrelation([2, 2, 2], [3, 3, 3])).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import {
  movingAverage,
  linearRegression,
  detectStdDevAnomalies,
  pearsonCorrelation,
} from '../lib/analytics/heuristics';

describe('heuristics edge cases', () => {
  it('movingAverage handles empty and single element', () => {
    expect(movingAverage([])).toEqual([]);
    expect(movingAverage([5], 3)).toEqual([5]);
  });

  it('linearRegression returns zeros for empty', () => {
    expect(linearRegression([])).toEqual({ slope: 0, intercept: 0, r2: 0 });
  });

  it('detectStdDevAnomalies returns empty for <2 length', () => {
    expect(detectStdDevAnomalies([])).toEqual([]);
    expect(detectStdDevAnomalies([10])).toEqual([]);
  });

  it('pearsonCorrelation returns 0 for mismatched or empty arrays', () => {
    expect(pearsonCorrelation([], [])).toBe(0);
    expect(pearsonCorrelation([1, 2, 3], [1, 2])).toBe(0);
  });
});

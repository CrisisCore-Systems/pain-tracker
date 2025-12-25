/* eslint-disable @typescript-eslint/no-explicit-any */
import { detectCrisis, computeBaseline } from '../crisis';

function makeEntry(value: number, daysAgo = 0) {
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    intensity: value,
  } as any;
}

describe('crisis detection', () => {
  test('no entries -> no crisis', () => {
    const res = detectCrisis([] as any);
    expect(res.detected).toBe(false);
    expect(res.lastValue).toBeNull();
  });

  test('stable baseline -> no crisis for small increase', () => {
    const entries = [makeEntry(4, 3), makeEntry(4, 2), makeEntry(4, 1), makeEntry(5, 0)];
    const res = detectCrisis(entries as any);
    expect(res.detected).toBe(false);
  });

  test('significant increase triggers crisis', () => {
    const entries = [makeEntry(3, 7), makeEntry(4, 3), makeEntry(4, 2), makeEntry(4, 1), makeEntry(7, 0)];
    const res = detectCrisis(entries as any);
    expect(res.detected).toBe(true);
    expect(res.baseline).toBeGreaterThan(0);
    expect(res.lastValue).toBe(7);
  });

  test('baseline computation uses lookback window', () => {
    const entries = [makeEntry(1, 30), makeEntry(2, 20), makeEntry(8, 1), makeEntry(9, 0)];
    const baseline7 = computeBaseline(entries as any, 7);
    const baseline30 = computeBaseline(entries as any, 30);
    expect(baseline7).toBeGreaterThan(0);
    // When including older low values, a longer lookback may reduce the baseline
    expect(baseline30).toBeLessThanOrEqual(baseline7);
  });
});

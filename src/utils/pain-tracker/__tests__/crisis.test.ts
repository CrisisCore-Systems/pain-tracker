import { detectCrisis, computeBaseline } from '../crisis';
import { vi } from 'vitest';
import type { PainEntry } from '../../../types';

function makeEntry(value: number, daysAgo = 0): PainEntry {
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    baselineData: {
      pain: value,
      locations: [],
      symptoms: [],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 0,
      moodImpact: 0,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: '',
    intensity: value,
  };
}

describe('crisis detection', () => {
  test('no entries -> no crisis', () => {
    const res = detectCrisis([]);
    expect(res.detected).toBe(false);
    expect(res.lastValue).toBeNull();
  });

  test('stable baseline -> no crisis for small increase', () => {
    const entries = [makeEntry(4, 3), makeEntry(4, 2), makeEntry(4, 1), makeEntry(5, 0)];
    const res = detectCrisis(entries);
    expect(res.detected).toBe(false);
  });

  test('significant increase triggers crisis', () => {
    const entries = [makeEntry(3, 7), makeEntry(4, 3), makeEntry(4, 2), makeEntry(4, 1), makeEntry(7, 0)];
    const res = detectCrisis(entries);
    expect(res.detected).toBe(true);
    expect(res.baseline).toBeGreaterThan(0);
    expect(res.lastValue).toBe(7);
  });

  test('baseline computation uses lookback window', () => {
    const entries = [makeEntry(1, 30), makeEntry(2, 20), makeEntry(8, 1), makeEntry(9, 0)];
    const baseline7 = computeBaseline(entries, 7);
    const baseline30 = computeBaseline(entries, 30);
    expect(baseline7).toBeGreaterThan(0);
    // When including older low values, a longer lookback may reduce the baseline
    expect(baseline30).toBeLessThanOrEqual(baseline7);
  });

  test('baseline falls back to overall mean when lookback window has no valid entries', () => {
    const entries = [makeEntry(6, 10), makeEntry(4, 9)];
    const baseline = computeBaseline(entries, 1);
    expect(baseline).toBeCloseTo(5, 6);
  });

  test('baseline uses lookback-window values when available', () => {
    const entries = [makeEntry(2, 30), makeEntry(8, 0)];
    const baseline = computeBaseline(entries, 7);
    expect(baseline).toBeCloseTo(8, 6);
  });

  test('baseline source selection is stable across Date.now mocking', () => {
    const now = Date.parse('2026-01-01T12:00:00.000Z');
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(now);

    try {
      const inWindow: PainEntry[] = [
        { ...makeEntry(1, 0), timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(), intensity: 1 },
        { ...makeEntry(9, 0), timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), intensity: 9 },
      ];
      expect(computeBaseline(inWindow, 7)).toBeCloseTo(9, 6);

      const forceFallback: PainEntry[] = [
        {
          ...makeEntry(0, 0),
          timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
          // @ts-expect-error - intentional invalid data to exercise defensive code
          intensity: 'nope',
        },
        { ...makeEntry(4, 0), timestamp: new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString(), intensity: 4 },
      ];
      // lookbackDays=1 excludes both -> forces fallback to overall mean, with non-number intensity treated as 0.
      expect(computeBaseline(forceFallback, 1)).toBeCloseTo(2, 6);
    } finally {
      nowSpy.mockRestore();
    }
  });

  test('baseline short-circuits to 0 for undefined entries input', () => {
    // @ts-expect-error - intentional invalid input to exercise defensive code
    expect(computeBaseline(undefined, 7)).toBe(0);
  });

  test('fallback-to-overall-mean path treats non-number intensity as 0', () => {
    const ok = makeEntry(4, 9);
    const bad: PainEntry = {
      ...makeEntry(0, 10),
      // @ts-expect-error - intentional invalid data
      intensity: 'nope',
    };

    // lookbackDays=1 => window excludes these older entries; forces values.length===0.
    const baseline = computeBaseline([bad, ok], 1);
    expect(baseline).toBeCloseTo(2, 6);
  });

  test('non-numeric intensity is treated as 0 in baseline', () => {
    const bad: PainEntry = {
      ...makeEntry(5, 0),
      // @ts-expect-error - intentional invalid data to exercise defensive code
      intensity: 'nope',
    };
    const baseline = computeBaseline([bad], 7);
    expect(baseline).toBe(0);
  });

  test('baseline<=0 branch uses absolute threshold when baseline is not meaningful', () => {
    const stableZero: PainEntry = {
      ...makeEntry(0, 1),
      // intentional invalid data to exercise defensive code
      intensity: undefined,
    };
    const lastHighButInvalidTimestamp: PainEntry = {
      ...makeEntry(3, 0),
      timestamp: 'not-a-date',
    };

    const res = detectCrisis([stableZero, lastHighButInvalidTimestamp], {
      lookbackDays: 7,
      minAbsoluteIncrease: 2,
    });

    expect(res.baseline).toBe(0);
    expect(res.lastValue).toBe(3);
    expect(res.detected).toBe(true);
    expect(res.diff).toBeDefined();
  });
});

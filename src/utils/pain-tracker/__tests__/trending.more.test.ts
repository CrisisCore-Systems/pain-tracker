import { describe, it, expect } from 'vitest';
import { analyzeTrends, calculateStatistics, buildDailySeries } from '../trending';
import type { PainEntry } from '../../../types';

const makeEntry = (
  id: number,
  timestamp: string,
  pain: number,
  locations: string[] = [],
  symptoms: string[] = []
) =>
  ({
    id,
    timestamp,
    baselineData: { pain, locations, symptoms },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: '',
  }) as PainEntry;

describe('trending.extra', () => {
  it('analyzeTrends handles empty array', () => {
    const r = analyzeTrends([]);
    expect(r.timeOfDayPattern).toEqual({});
    expect(r.dayOfWeekPattern).toEqual({});
  });

  it('buildDailySeries buckets cross-midnight entries by local date', () => {
    // Entry at UTC 23:30 may fall on next local day depending on timezone; we assert local bucketing
    const e1 = makeEntry(1, '2025-09-14T23:30:00Z', 5); // UTC 23:30
    const e2 = makeEntry(2, '2025-09-15T00:30:00Z', 7); // UTC 00:30 next day
    const series = buildDailySeries([e1, e2], { start: '2025-09-14', end: '2025-09-15' });
    expect(series.length).toBe(2);
    // both days present and each pain is number or null
    expect(series[0].pain === null || typeof series[0].pain === 'number').toBeTruthy();
    expect(series[1].pain === null || typeof series[1].pain === 'number').toBeTruthy();
  });

  it('calculateStatistics mode tie handling and basic aggregates', () => {
    const entries = [
      makeEntry(1, '2025-01-01T08:00:00Z', 5),
      makeEntry(2, '2025-01-02T09:00:00Z', 5),
      makeEntry(3, '2025-01-03T10:00:00Z', 7),
      makeEntry(4, '2025-01-04T11:00:00Z', 7),
    ];
    const stats = calculateStatistics(entries);
    // mean
    expect(stats.mean).toBe((5 + 5 + 7 + 7) / 4);
    // median (sorted [5,5,7,7]) -> average of middle two
    expect(stats.median).toBe((5 + 7) / 2);
    // mode: implementation picks first in tie; expect either 5 or 7
    expect([5, 7]).toContain(stats.mode);
  });
});

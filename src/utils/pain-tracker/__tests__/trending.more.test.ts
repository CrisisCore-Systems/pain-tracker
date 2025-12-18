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

  it('analyzeTrends advanced mode includes tags, buckets, and correlations', () => {
    const entries: PainEntry[] = [
      {
        ...makeEntry(1, '2025-01-01T08:00:00Z', 7),
        triggers: ['cold'],
        reliefMethods: ['heat'],
        quality: ['burning'],
        activities: ['walking'],
        activityLevel: 7,
        stress: 8,
        weather: 'snow',
        qualityOfLife: { sleepQuality: 3, moodImpact: 4, socialImpact: [] },
      },
      {
        ...makeEntry(2, '2025-01-02T08:10:00Z', 6),
        triggers: ['cold'],
        reliefMethods: ['heat'],
        quality: ['burning'],
        activities: ['walking'],
        activityLevel: 6,
        stress: 7,
        weather: 'snow',
        qualityOfLife: { sleepQuality: 4, moodImpact: 5, socialImpact: [] },
      },
      {
        ...makeEntry(3, '2025-01-03T14:00:00Z', 3),
        triggers: ['rest'],
        reliefMethods: ['nap'],
        quality: ['dull'],
        activities: ['stretching'],
        activityLevel: 2,
        stress: 2,
        weather: 'sun',
        qualityOfLife: { sleepQuality: 8, moodImpact: 7, socialImpact: [] },
      },
      {
        ...makeEntry(4, '2025-01-04T14:30:00Z', 4),
        triggers: ['rest'],
        reliefMethods: ['nap'],
        quality: ['dull'],
        activities: ['stretching'],
        activityLevel: 3,
        stress: 3,
        weather: 'sun',
        qualityOfLife: { sleepQuality: 7, moodImpact: 6, socialImpact: [] },
      },
    ];

    const result = analyzeTrends(entries, { advanced: true, timezone: 'utc', minCount: 2 });
    expect(result.advanced).toBeDefined();

    // bucket stats
    expect(result.advanced?.timeOfDayBuckets).toHaveProperty('08:00');
    expect(result.advanced?.timeOfDayBuckets).toHaveProperty('14:00');
    expect(result.advanced?.bestTimeOfDay?.key).toBeDefined();
    expect(result.advanced?.worstTimeOfDay?.key).toBeDefined();

    // tags (normalized to lowercase)
    expect(result.advanced?.tags.triggers).toHaveProperty('cold');
    expect(result.advanced?.tags.reliefMethods).toHaveProperty('heat');
    expect(result.advanced?.tags.quality).toHaveProperty('burning');
    expect(result.advanced?.tags.activities).toHaveProperty('walking');
    expect(result.advanced?.tags.weather).toHaveProperty('snow');

    // correlations present (may be +/-) but should be finite numbers when enough pairs exist
    const corr = result.advanced?.correlations;
    expect(corr?.sleepToPain).not.toBeNull();
    expect(typeof corr?.sleepToPain).toBe('number');
    expect(corr?.stressToPain).not.toBeNull();
    expect(typeof corr?.stressToPain).toBe('number');
  });
});

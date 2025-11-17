import { describe, it, expect } from 'vitest';
import { analyzeTrends, calculateStatistics } from '../trending';
import type { PainEntry } from '../../../types';

const makeEntry = (id: number, timestamp: string, pain: number) =>
  ({
    id,
    timestamp,
    baselineData: { pain, locations: [], symptoms: [] },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: '',
  }) as PainEntry;

describe('trending.branch coverage', () => {
  it('averageChange negative results in increasing=false', () => {
    const entries = [
      makeEntry(1, '2025-01-01T08:00:00Z', 8),
      makeEntry(2, '2025-01-02T08:00:00Z', 6),
      makeEntry(3, '2025-01-03T08:00:00Z', 5),
    ];
    const r = analyzeTrends(entries);
    expect(r.painTrends.averageChange).toBeLessThanOrEqual(0);
    expect(r.painTrends.increasing).toBe(false);
  });

  it('averageChange positive results in increasing=true', () => {
    const entries = [
      makeEntry(1, '2025-01-01T08:00:00Z', 3),
      makeEntry(2, '2025-01-02T08:00:00Z', 5),
      makeEntry(3, '2025-01-03T08:00:00Z', 8),
    ];
    const r = analyzeTrends(entries);
    expect(r.painTrends.averageChange).toBeGreaterThanOrEqual(0);
    expect(r.painTrends.increasing).toBe(true);
  });

  it('calculateStatistics time range and entries count', () => {
    const entries = [
      makeEntry(1, '2025-02-01T08:00:00Z', 2),
      makeEntry(2, '2025-02-05T10:00:00Z', 4),
    ];
    const s = calculateStatistics(entries);
    expect(s.timeRangeStats.totalEntries).toBe(2);
    expect(s.timeRangeStats.duration).toBeGreaterThan(0);
  });
});

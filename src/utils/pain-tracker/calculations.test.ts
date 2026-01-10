import { describe, expect, it } from 'vitest';
import type { PainEntry } from '../../types';
import { aggregatePainData, calculatePainScore } from './calculations';

function makeEntry(params: {
  id: number;
  timestamp: string;
  pain: number;
  locations?: string[];
  symptoms?: string[];
  limitedActivities?: string[];
  mobilityAids?: string[];
}): PainEntry {
  return {
    id: params.id,
    timestamp: params.timestamp,
    baselineData: {
      pain: params.pain,
      locations: params.locations ?? [],
      symptoms: params.symptoms ?? [],
    },
    functionalImpact: {
      limitedActivities: params.limitedActivities ?? [],
      assistanceNeeded: [],
      mobilityAids: params.mobilityAids ?? [],
    },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: '',
  };
}

describe('pain-tracker calculations', () => {
  it('calculatePainScore computes factors and severity thresholds', () => {
    const low = makeEntry({
      id: 1,
      timestamp: '2026-01-01T08:00:00.000',
      pain: 2,
      locations: ['neck'],
      symptoms: ['fatigue'],
    });
    const moderate = makeEntry({
      id: 2,
      timestamp: '2026-01-02T08:00:00.000',
      pain: 4,
      locations: ['neck', 'shoulder'],
      symptoms: ['fatigue', 'nausea'],
    });
    const severe = makeEntry({
      id: 3,
      timestamp: '2026-01-03T08:00:00.000',
      pain: 8,
      locations: [],
      symptoms: [],
    });

    const lowScore = calculatePainScore(low);
    expect(lowScore.locationFactor).toBeCloseTo(0.5, 6);
    expect(lowScore.symptomFactor).toBeCloseTo(0.3, 6);
    expect(lowScore.severity).toBe('low');

    const moderateScore = calculatePainScore(moderate);
    expect(moderateScore.severity).toBe('moderate');

    const severeScore = calculatePainScore(severe);
    expect(severeScore.severity).toBe('severe');
  });

  it('aggregatePainData computes trend, time analysis, and functional summaries', () => {
    // Designed so worstTime reduce takes both comparator branches:
    // hourly averages: 08:00 -> 5, 09:00 -> 7, 10:00 -> 6
    const e0 = makeEntry({
      id: 1,
      timestamp: '2026-01-03T08:00:00.000',
      pain: 5,
      locations: ['lower back'],
      symptoms: ['fatigue'],
      limitedActivities: ['walking'],
      mobilityAids: ['cane'],
    });
    const e1 = makeEntry({
      id: 2,
      timestamp: '2026-01-03T09:00:00.000',
      pain: 7,
      locations: ['lower back'],
      symptoms: ['fatigue'],
      limitedActivities: ['walking'],
      mobilityAids: ['cane'],
    });
    const e2 = makeEntry({
      id: 3,
      timestamp: '2026-01-03T10:00:00.000',
      pain: 6,
      locations: ['neck'],
      symptoms: ['headache'],
      limitedActivities: ['lifting'],
      mobilityAids: [],
    });

    // Provide unsorted input to exercise internal sort logic.
    const result = aggregatePainData([e2, e0, e1]);

    expect(result.painTrend).toBe('worsening');
    expect(result.timeAnalysis.worstTime).toBe('9:00');
    expect(result.timeAnalysis.bestTime).toBe('8:00');

    expect(result.commonLocations[0]?.location).toBe('lower back');
    expect(result.commonSymptoms.length).toBeGreaterThan(0);

    expect(result.functionalImpactSummary.mostLimitedActivities).toContain('walking');
    expect(result.functionalImpactSummary.commonMobilityAids).toContain('cane');
  });

  it('aggregatePainData reports stable trend when pain is unchanged', () => {
    const a = makeEntry({ id: 1, timestamp: '2026-01-01T08:00:00.000', pain: 5 });
    const b = makeEntry({ id: 2, timestamp: '2026-01-02T08:00:00.000', pain: 5 });

    const result = aggregatePainData([b, a]);
    expect(result.painTrend).toBe('stable');
  });

  it('aggregatePainData reports improving trend when pain decreases over time', () => {
    const a = makeEntry({ id: 1, timestamp: '2026-01-01T08:00:00.000', pain: 7 });
    const b = makeEntry({ id: 2, timestamp: '2026-01-02T08:00:00.000', pain: 5 });

    const result = aggregatePainData([b, a]);
    expect(result.painTrend).toBe('improving');
  });

  it('aggregatePainData exercises both branches of bestTime reducer comparator', () => {
    // hourly averages: 08:00 -> 7, 09:00 -> 5, 10:00 -> 6
    // bestTime reducer: 7 < 5 => false, then 5 < 6 => true
    const e0 = makeEntry({ id: 1, timestamp: '2026-01-03T08:00:00.000', pain: 7 });
    const e1 = makeEntry({ id: 2, timestamp: '2026-01-03T09:00:00.000', pain: 5 });
    const e2 = makeEntry({ id: 3, timestamp: '2026-01-03T10:00:00.000', pain: 6 });

    const result = aggregatePainData([e2, e0, e1]);
    expect(result.timeAnalysis.bestTime).toBe('9:00');
  });
});

import { describe, it, expect } from 'vitest';
import { painAnalyticsService } from '../PainAnalyticsService';
import type { PainEntry } from '../../types';

function makeEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  const base: PainEntry = {
    id: `test-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    baselineData: { pain: 5, locations: [], symptoms: [] },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: '',
    ...overrides,
  };

  return {
    ...base,
    baselineData: { ...base.baselineData, ...(overrides.baselineData ?? {}) },
    medications: { ...base.medications, ...(overrides.medications ?? {}) },
  };
}

describe('PainAnalyticsService medication effectiveness', () => {
  it('does not invent effectiveness when none is recorded', () => {
    const now = Date.now();
    const entries: PainEntry[] = [
      makeEntry({
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 7, locations: [], symptoms: [] },
        medications: { current: [{ name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' }], changes: '', effectiveness: '' },
      }),
      makeEntry({
        timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 6, locations: [], symptoms: [] },
        medications: { current: [{ name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' }], changes: '', effectiveness: '' },
      }),
      makeEntry({
        timestamp: new Date(now).toISOString(),
        baselineData: { pain: 6, locations: [], symptoms: [] },
        medications: { current: [], changes: '', effectiveness: '' },
      }),
    ];

    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    expect(correlations.medicationEffectiveness).toEqual([]);
  });

  it('uses recorded effectiveness text when provided', () => {
    const now = Date.now();
    const entries: PainEntry[] = [
      makeEntry({
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 7, locations: [], symptoms: [] },
        medications: {
          current: [{ name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' }],
          changes: '',
          effectiveness: 'Very Effective',
        },
      }),
      makeEntry({
        timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        baselineData: { pain: 6, locations: [], symptoms: [] },
        medications: {
          current: [{ name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' }],
          changes: '',
          effectiveness: 'Very Effective',
        },
      }),
      makeEntry({
        timestamp: new Date(now).toISOString(),
        baselineData: { pain: 6, locations: [], symptoms: [] },
        medications: { current: [], changes: '', effectiveness: '' },
      }),
    ];

    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    expect(correlations.medicationEffectiveness.length).toBe(1);
    expect(correlations.medicationEffectiveness[0].medication).toBe('Naproxen');
    expect(correlations.medicationEffectiveness[0].effectivenessScore).toBeGreaterThan(0);
  });
});

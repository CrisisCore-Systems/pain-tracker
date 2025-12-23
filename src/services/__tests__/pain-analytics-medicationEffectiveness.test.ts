import { describe, it, expect } from 'vitest';
import { painAnalyticsService } from '../PainAnalyticsService';
import type { PainEntry } from '../../types';
import { makePainEntry } from '../../utils/pain-entry-factory';

describe('PainAnalyticsService medication effectiveness', () => {
  it('does not invent effectiveness when none is recorded', () => {
    const base = Date.UTC(2024, 0, 15, 12, 0, 0);
    const iso = (hoursFromBase: number) => new Date(base + hoursFromBase * 60 * 60 * 1000).toISOString();
    const naproxen = { name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' };

    const entries: PainEntry[] = Array.from({ length: 24 }, (_, i) => {
      const hasMed = i % 3 !== 0;
      return makePainEntry({
        id: `e-${i + 1}`,
        timestamp: iso(i - 24),
        baselineData: { pain: 4 + (i % 5), locations: [], symptoms: [] },
        medications: {
          current: hasMed ? [naproxen] : [],
          changes: '',
          effectiveness: '',
        },
      });
    });

    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    expect(correlations.medicationEffectiveness).toEqual([]);
  });

  it('uses recorded effectiveness text when provided', () => {
    const base = Date.UTC(2024, 0, 20, 8, 0, 0);
    const iso = (hoursFromBase: number) => new Date(base + hoursFromBase * 60 * 60 * 1000).toISOString();

    const entries: PainEntry[] = [
      // Filler (no meds)
      ...Array.from({ length: 10 }, (_, i) =>
        makePainEntry({
          id: `f-${i + 1}`,
          timestamp: iso(i - 20),
          baselineData: { pain: 5 + (i % 3), locations: [], symptoms: [] },
          medications: { current: [], changes: '', effectiveness: '' },
        })
      ),

      // Naproxen: mixed recorded effectiveness (avg should be 4.25)
      ...(['Very Effective', 'Very Effective', 'Very Effective', 'Very Effective', 'Very Effective', 'Somewhat Effective', 'Somewhat Effective', 'Somewhat Effective'] as const).map(
        (recorded, index) =>
          makePainEntry({
            id: `n-${index + 1}`,
            timestamp: iso(index - 5),
            baselineData: { pain: 6 + (index % 2), locations: [], symptoms: [] },
            medications: {
              current: [{ name: 'Naproxen', dosage: '', frequency: '', effectiveness: '' }],
              changes: '',
              effectiveness: recorded,
            },
          })
      ),

      // Gabapentin: consistently not effective (avg should be 1)
      ...Array.from({ length: 4 }, (_, index) =>
        makePainEntry({
          id: `g-${index + 1}`,
          timestamp: iso(index + 10),
          baselineData: { pain: 7, locations: [], symptoms: [] },
          medications: {
            current: [{ name: 'Gabapentin', dosage: '', frequency: '', effectiveness: '' }],
            changes: '',
            effectiveness: 'Not effective',
          },
        })
      ),
    ];

    const correlations = painAnalyticsService.analyzeCorrelations(entries);
    expect(correlations.medicationEffectiveness.length).toBe(2);

    const [first, second] = correlations.medicationEffectiveness;
    expect(first.medication).toBe('Naproxen');
    expect(first.effectivenessScore).toBeCloseTo(4.25, 5);

    expect(second.medication).toBe('Gabapentin');
    expect(second.effectivenessScore).toBeCloseTo(1, 5);
  });
});

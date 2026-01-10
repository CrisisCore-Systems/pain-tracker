import { describe, it, expect, vi, afterEach } from 'vitest';
import { predictPainAndFlares } from './predictionEngine';
import { makePainEntry } from '../pain-entry-factory';

describe('predictPainAndFlares', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns safe defaults for empty entries', () => {
    const result = predictPainAndFlares([]);

    expect(result.predictedPain).toBe(5);
    expect(result.confidence).toBe(0.5);
    expect(result.flareInDays).toBe(3);
    expect(result.flareConfidence).toBe(0.4);
    expect(result.medicationEffectiveness).toEqual([]);
    expect(result.methodology).toContain('Heuristic');
  });

  it('uses last entry baseline pain and maps medication effectiveness deterministically', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // effectiveness = 3

    const entries = [
      makePainEntry({ baselineData: { pain: 4, locations: [], symptoms: [] } }),
      makePainEntry({
        baselineData: { pain: 7, locations: [], symptoms: [] },
        medications: {
          current: [
            { name: 'Med A', dosage: '', frequency: '', effectiveness: '' },
            { name: 'Med B', dosage: '', frequency: '', effectiveness: '' },
          ],
          changes: '',
          effectiveness: '',
        },
      }),
    ];

    const result = predictPainAndFlares(entries);

    expect(result.predictedPain).toBe(7);
    expect(result.medicationEffectiveness).toEqual([
      { medication: 'Med A', effectiveness: 3, confidence: 0.5 },
      { medication: 'Med B', effectiveness: 3, confidence: 0.5 },
    ]);
  });
});

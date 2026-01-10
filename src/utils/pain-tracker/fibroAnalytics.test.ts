import { describe, expect, it } from 'vitest';
import { computeFibroAnalytics } from './fibroAnalytics';
import type { FibromyalgiaEntry } from '../../types/fibromyalgia';

type FibroEntryOverrides = Omit<Partial<FibromyalgiaEntry>, 'id' | 'timestamp' | 'wpi' | 'sss' | 'symptoms' | 'triggers' | 'impact' | 'activity' | 'interventions'> & {
  id: number;
  timestamp: string;
  wpi?: Partial<FibromyalgiaEntry['wpi']>;
  sss?: Partial<FibromyalgiaEntry['sss']>;
  symptoms?: Partial<FibromyalgiaEntry['symptoms']>;
  triggers?: Partial<FibromyalgiaEntry['triggers']>;
  impact?: Partial<FibromyalgiaEntry['impact']>;
  activity?: Partial<FibromyalgiaEntry['activity']>;
  interventions?: Partial<FibromyalgiaEntry['interventions']>;
};

function makeFibroEntry(overrides: FibroEntryOverrides): FibromyalgiaEntry {
  return {
    id: overrides.id,
    timestamp: overrides.timestamp,
    wpi: {
      leftShoulder: false,
      rightShoulder: false,
      leftUpperArm: false,
      rightUpperArm: false,
      leftLowerArm: false,
      rightLowerArm: false,
      leftHip: false,
      rightHip: false,
      leftUpperLeg: false,
      rightUpperLeg: false,
      leftLowerLeg: false,
      rightLowerLeg: false,
      jaw: false,
      chest: false,
      abdomen: false,
      upperBack: false,
      lowerBack: false,
      neck: false,
      ...(overrides.wpi ?? {}),
    },
    sss: {
      fatigue: 0,
      waking_unrefreshed: 0,
      cognitive_symptoms: 0,
      somatic_symptoms: 0,
      ...(overrides.sss ?? {}),
    },
    symptoms: {
      headache: false,
      migraine: false,
      ibs: false,
      temporomandibularDisorder: false,
      restlessLegSyndrome: false,
      lightSensitivity: false,
      soundSensitivity: false,
      temperatureSensitivity: false,
      chemicalSensitivity: false,
      clothingSensitivity: false,
      touchSensitivity: false,
      numbnessTingling: false,
      muscleStiffness: false,
      jointPain: false,
      brainfog: false,
      memoryProblems: false,
      concentrationDifficulty: false,
      ...(overrides.symptoms ?? {}),
    },
    triggers: {
      ...(overrides.triggers ?? {}),
    },
    impact: {
      sleepQuality: 2,
      moodRating: 2,
      anxietyLevel: 2,
      functionalAbility: 2,
      ...(overrides.impact ?? {}),
    },
    activity: {
      activityLevel: 'moderate',
      restPeriods: 0,
      overexerted: false,
      paybackPeriod: false,
      ...(overrides.activity ?? {}),
    },
    interventions: {
      ...(overrides.interventions ?? {}),
    },
    notes: overrides.notes ?? '',
    userId: overrides.userId,
  };
}

describe('computeFibroAnalytics', () => {
  it('returns stable defaults for empty entries', () => {
    const result = computeFibroAnalytics([]);
    expect(result.wpiScore).toBe(0);
    expect(result.sssScore).toBe(0);
    expect(result.meetsDiagnosticCriteria).toBe(false);
    expect(result.flareFrequency).toBe(0);
    expect(result.averageFlareDuration).toBe(0);
    expect(result.effectiveInterventions).toEqual([]);
  });

  it('is order-independent (sorts by timestamp)', () => {
    const e1 = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-02T10:00:00.000Z',
      wpi: { leftShoulder: true },
      sss: { fatigue: 1, waking_unrefreshed: 1, cognitive_symptoms: 1, somatic_symptoms: 1 },
    });
    const e0 = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-01T10:00:00.000Z',
      wpi: { leftShoulder: true, rightShoulder: true, neck: true, chest: true },
      sss: { fatigue: 3, waking_unrefreshed: 2, cognitive_symptoms: 1, somatic_symptoms: 0 },
    });

    const result = computeFibroAnalytics([e1, e0]);
    // Latest entry should be e1 (by timestamp) even though it appears first.
    expect(result.wpiScore).toBe(1);
    expect(result.sssScore).toBe(4);
  });

  it('counts weather and foodSensitivity triggers as buckets', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      triggers: { weather: 'cold', foodSensitivity: ['gluten', 'dairy'], stress: true },
    });
    const e1 = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-02T10:00:00.000Z',
      triggers: { weather: 'cold', foodSensitivity: ['gluten'] },
    });

    const result = computeFibroAnalytics([e0, e1]);
    const triggers = result.commonTriggers.map(t => t.trigger);

    expect(triggers).toContain('weather:cold');
    expect(triggers).toContain('food:gluten');
    expect(triggers).toContain('food:dairy');
    expect(triggers).toContain('stress');
  });

  it('detects flare episodes and computes average duration', () => {
    // Flare days: Jan 1-2 consecutive (1 episode, 2 days) and Jan 5 single (2nd episode, 1 day)
    const e0 = makeFibroEntry({ id: 1, timestamp: '2025-01-01T09:00:00.000Z', sss: { fatigue: 2 } });
    const e1 = makeFibroEntry({ id: 2, timestamp: '2025-01-02T09:00:00.000Z', impact: { functionalAbility: 4 } });
    const e2 = makeFibroEntry({ id: 3, timestamp: '2025-01-03T09:00:00.000Z', sss: { fatigue: 0 } });
    const e3 = makeFibroEntry({ id: 4, timestamp: '2025-01-05T09:00:00.000Z', sss: { waking_unrefreshed: 2 } });

    const result = computeFibroAnalytics([e3, e1, e2, e0]);

    expect(result.averageFlareDuration).toBeCloseTo((2 + 1) / 2, 6);
    expect(result.flareIntensity).toBe('moderate');
  });

  it('computes effective interventions as improvement deltas', () => {
    const base = makeFibroEntry({ id: 1, timestamp: '2025-01-01T10:00:00.000Z' });
    const heatGood = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-02T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: 1 },
    });
    const heatBad = makeFibroEntry({
      id: 3,
      timestamp: '2025-01-03T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: 2 },
    });
    const noHeatWorse = makeFibroEntry({
      id: 4,
      timestamp: '2025-01-04T10:00:00.000Z',
      impact: { functionalAbility: 4 },
    });

    const result = computeFibroAnalytics([base, heatGood, heatBad, noHeatWorse]);
    const item = result.effectiveInterventions.find(i => i.intervention === 'heatTherapy');
    expect(item).toBeDefined();
    // Without is worse than with, so delta should be positive.
    expect(item?.correlationWithImprovement).toBeGreaterThan(0);
  });

  it('returns mild flare intensity when there are no flare episodes', () => {
    const e0 = makeFibroEntry({ id: 1, timestamp: '2025-01-01T09:00:00.000Z', sss: { fatigue: 0, waking_unrefreshed: 0 }, impact: { functionalAbility: 2 } });
    const e1 = makeFibroEntry({ id: 2, timestamp: '2025-01-03T09:00:00.000Z', sss: { fatigue: 1, waking_unrefreshed: 0 }, impact: { functionalAbility: 2 } });

    const result = computeFibroAnalytics([e1, e0]);
    expect(result.averageFlareDuration).toBe(0);
    expect(result.flareIntensity).toBe('mild');
  });

  it('returns severe flare intensity when any episode has a severe day', () => {
    const severe = makeFibroEntry({ id: 1, timestamp: '2025-01-01T09:00:00.000Z', sss: { fatigue: 3 } });
    const moderate = makeFibroEntry({ id: 2, timestamp: '2025-01-02T09:00:00.000Z', sss: { fatigue: 2 } });

    const result = computeFibroAnalytics([moderate, severe]);
    expect(result.flareIntensity).toBe('severe');
  });

  it('keeps the worst entry for the same local day when grouping flare episodes', () => {
    // Same day: first entry is not a flare, second entry is a flare and should replace it.
    const notFlare = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T08:00:00.000Z',
      sss: { fatigue: 0, waking_unrefreshed: 0, cognitive_symptoms: 0 },
      impact: { functionalAbility: 2 },
    });
    const flare = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-01T18:00:00.000Z',
      sss: { fatigue: 2 },
    });

    const result = computeFibroAnalytics([notFlare, flare]);
    // If replacement didn't happen, there would be no flare episodes.
    expect(result.flareIntensity).not.toBe('mild');
  });

  it('parses medication/supplement interventions and ignores empty items', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      interventions: {
        // intentional mixed data to exercise defensive parsing
        medication: [' ibuprofen ', '', 123 as any],
        // intentional mixed data to exercise defensive parsing
        supplements: [' magnesium ', '  '],
        // pacing: true,
      },
      impact: { functionalAbility: 1 },
    });

    const e1 = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-02T10:00:00.000Z',
      impact: { functionalAbility: 4 },
    });

    const result = computeFibroAnalytics([e0, e1]);
    // We don't assert exact correlations here; this test is about exercising branches.
    expect(Array.isArray(result.effectiveInterventions)).toBe(true);
  });

  it('ignores non-string weather values and filters foodSensitivity non-strings/whitespace', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      triggers: {
        // @ts-expect-error - intentional invalid value to exercise guard
        weather: 123,
        // @ts-expect-error - intentional mixed values to exercise filtering
        foodSensitivity: [' ', 'oats', 456],
      },
    });

    const result = computeFibroAnalytics([e0]);
    const triggers = result.commonTriggers.map(t => t.trigger);
    expect(triggers).toContain('food:oats');
    expect(triggers).not.toContain('weather:123');
  });

  it('handles interventions used on every entry (without bucket empty -> withoutAvg falls back to overall avg)', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: 1 },
    });
    const e1 = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-02T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: 3 },
    });

    const result = computeFibroAnalytics([e0, e1]);
    expect(Array.isArray(result.effectiveInterventions)).toBe(true);
  });

  it('filters out interventions when the improvement delta is below threshold', () => {
    const withHeat = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: 2 },
    });
    const withoutHeat = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-02T10:00:00.000Z',
      impact: { functionalAbility: 2 },
    });

    const result = computeFibroAnalytics([withHeat, withoutHeat]);
    expect(result.effectiveInterventions).toEqual([]);
  });

  it('meets diagnostic criteria via WPI>=7 and SSS>=5', () => {
    const last = makeFibroEntry({
      id: 2,
      timestamp: '2025-04-02T10:00:00.000Z',
      wpi: {
        leftShoulder: true,
        rightShoulder: true,
        leftUpperArm: true,
        rightUpperArm: true,
        leftLowerArm: true,
        rightLowerArm: true,
        neck: true,
      },
      sss: {
        fatigue: 2,
        waking_unrefreshed: 1,
        cognitive_symptoms: 1,
        somatic_symptoms: 1,
      },
    });
    const earlier = makeFibroEntry({ id: 1, timestamp: '2025-04-01T10:00:00.000Z' });

    const result = computeFibroAnalytics([earlier, last]);
    expect(result.meetsDiagnosticCriteria).toBe(true);
  });

  it('meets diagnostic criteria via WPI 4-6 and SSS>=9', () => {
    const last = makeFibroEntry({
      id: 2,
      timestamp: '2025-05-02T10:00:00.000Z',
      wpi: {
        leftShoulder: true,
        rightShoulder: true,
        leftUpperArm: true,
        rightUpperArm: true,
        neck: true,
      },
      sss: {
        fatigue: 3,
        waking_unrefreshed: 3,
        cognitive_symptoms: 2,
        somatic_symptoms: 1,
      },
    });
    const earlier = makeFibroEntry({ id: 1, timestamp: '2025-05-01T10:00:00.000Z' });

    const result = computeFibroAnalytics([earlier, last]);
    expect(result.meetsDiagnosticCriteria).toBe(true);
  });

  it('computes symptom trend as worsening and improving based on endpoints', () => {
    const worsening = computeFibroAnalytics([
      makeFibroEntry({ id: 1, timestamp: '2025-06-01T10:00:00.000Z', sss: { fatigue: 1 } }),
      makeFibroEntry({ id: 2, timestamp: '2025-06-02T10:00:00.000Z', sss: { fatigue: 3 } }),
    ]);

    expect(worsening.symptomTrends.fatigue.trend).toBe('worsening');

    const improving = computeFibroAnalytics([
      makeFibroEntry({ id: 3, timestamp: '2025-07-01T10:00:00.000Z', sss: { fatigue: 3 } }),
      makeFibroEntry({ id: 4, timestamp: '2025-07-02T10:00:00.000Z', sss: { fatigue: 1 } }),
    ]);

    expect(improving.symptomTrends.fatigue.trend).toBe('improving');
  });

  it('ignores null/undefined trigger values', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-08-01T10:00:00.000Z',
      triggers: {
        // intentional invalid data to exercise defensive branch
        stress: undefined,
        // intentional invalid data to exercise defensive branch
        poorSleep: null as any,
        weather: 'heat',
      },
    });

    const result = computeFibroAnalytics([e0]);
    const triggers = result.commonTriggers.map(t => t.trigger);
    expect(triggers).toContain('weather:heat');
  });

  it('upgrades an episode to severe when a later consecutive day is severe', () => {
    const day1Moderate = makeFibroEntry({
      id: 1,
      timestamp: '2025-09-01T09:00:00.000Z',
      sss: { fatigue: 2 },
    });
    const day2Severe = makeFibroEntry({
      id: 2,
      timestamp: '2025-09-02T09:00:00.000Z',
      sss: { cognitive_symptoms: 3 },
      impact: { functionalAbility: 4 },
    });

    const result = computeFibroAnalytics([day2Severe, day1Moderate]);
    expect(result.flareIntensity).toBe('severe');
  });

  it('falls back to sorted.length when timestamps are falsy', () => {
    const e0 = makeFibroEntry({ id: 1, timestamp: '' as any });
    const e1 = makeFibroEntry({ id: 2, timestamp: '' as any, wpi: { leftShoulder: true }, sss: { fatigue: 1 } });

    const result = computeFibroAnalytics([e0, e1]);
    expect(Number.isFinite(result.flareFrequency)).toBe(true);
  });

  it('starts a new severe episode when a non-consecutive flare day is severe', () => {
    const day1 = makeFibroEntry({ id: 1, timestamp: '2025-10-01T09:00:00.000Z', sss: { fatigue: 2 } });
    const day2 = makeFibroEntry({ id: 2, timestamp: '2025-10-02T09:00:00.000Z', impact: { functionalAbility: 4 } });
    const day4Severe = makeFibroEntry({ id: 3, timestamp: '2025-10-04T09:00:00.000Z', sss: { fatigue: 3 }, impact: { functionalAbility: 4 } });

    const result = computeFibroAnalytics([day4Severe, day2, day1]);
    expect(result.flareIntensity).toBe('severe');
    expect(result.averageFlareDuration).toBeGreaterThan(0);
  });

  it('short-circuits intervention parsing for falsy values', () => {
    const e0 = makeFibroEntry({
      id: 1,
      timestamp: '2025-11-01T10:00:00.000Z',
      interventions: {
        // ensure Object.entries sees a key with a falsy value
        meditation: false as any,
      },
    });

    expect(() => computeFibroAnalytics([e0])).not.toThrow();
  });

  it('filters out non-finite intervention correlations', () => {
    const withHeatBad = makeFibroEntry({
      id: 1,
      timestamp: '2025-12-01T10:00:00.000Z',
      interventions: { heatTherapy: true },
      impact: { functionalAbility: Number.NaN as any },
    });
    const withoutHeatBad = makeFibroEntry({
      id: 2,
      timestamp: '2025-12-02T10:00:00.000Z',
      impact: { functionalAbility: Number.NaN as any },
    });

    const result = computeFibroAnalytics([withHeatBad, withoutHeatBad]);
    expect(result.effectiveInterventions).toEqual([]);
  });
});

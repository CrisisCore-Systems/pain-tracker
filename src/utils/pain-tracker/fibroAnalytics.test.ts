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
});

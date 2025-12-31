import { describe, expect, it } from 'vitest';
import { computeFibroDiagnosticHistory } from './fibroDiagnostic';
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
    triggers: { ...(overrides.triggers ?? {}) },
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
    interventions: { ...(overrides.interventions ?? {}) },
    notes: overrides.notes ?? '',
    userId: overrides.userId,
  };
}

describe('computeFibroDiagnosticHistory', () => {
  it('returns empty result for empty entries', () => {
    const result = computeFibroDiagnosticHistory([]);
    expect(result.latest).toBeNull();
    expect(result.history).toEqual([]);
  });

  it('sorts history by timestamp and selects correct latest', () => {
    const early = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      wpi: { leftShoulder: true, rightShoulder: true, neck: true, chest: true },
      sss: { fatigue: 3, waking_unrefreshed: 3, cognitive_symptoms: 3, somatic_symptoms: 0 },
    });

    const late = makeFibroEntry({
      id: 2,
      timestamp: '2025-01-10T10:00:00.000Z',
      wpi: { leftShoulder: true },
      sss: { fatigue: 1, waking_unrefreshed: 1, cognitive_symptoms: 1, somatic_symptoms: 1 },
    });

    const result = computeFibroDiagnosticHistory([late, early]);

    expect(result.history).toHaveLength(2);
    expect(result.history[0].date).toBe(early.timestamp);
    expect(result.latest?.date).toBe(late.timestamp);
    expect(result.latest?.wpi).toBe(1);
    expect(result.latest?.sss).toBe(4);
  });

  it('computes ACR meetsCriteria flag', () => {
    // wpi 7 and sss 5 should meet
    const entry = makeFibroEntry({
      id: 1,
      timestamp: '2025-01-01T10:00:00.000Z',
      wpi: {
        leftShoulder: true,
        rightShoulder: true,
        leftUpperArm: true,
        rightUpperArm: true,
        leftHip: true,
        rightHip: true,
        neck: true,
      },
      sss: { fatigue: 2, waking_unrefreshed: 1, cognitive_symptoms: 1, somatic_symptoms: 1 },
    });

    const result = computeFibroDiagnosticHistory([entry]);
    expect(result.latest?.meetsCriteria).toBe(true);
  });
});

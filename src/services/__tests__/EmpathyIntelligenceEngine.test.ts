import { describe, it, expect } from 'vitest';
import { empathyIntelligenceEngine } from '../EmpathyIntelligenceEngine';
import type { MoodEntry } from '../../types/quantified-empathy';

function buildMoodEntry(
  overrides: Partial<MoodEntry> & { notes: string; context: string }
): MoodEntry {
  const defaults: MoodEntry = {
    timestamp: new Date(),
    mood: 6,
    energy: 6,
    anxiety: 4,
    stress: 4,
    hopefulness: 6,
    selfEfficacy: 6,
    emotionalClarity: 6,
    emotionalRegulation: 6,
    context: overrides.context,
    triggers: [],
    copingStrategies: [],
    socialSupport: 'moderate',
    notes: overrides.notes,
  };

  const merged: MoodEntry = {
    ...defaults,
    ...overrides,
    timestamp: overrides.timestamp ?? defaults.timestamp,
    context: overrides.context,
    notes: overrides.notes,
    triggers: overrides.triggers ?? defaults.triggers,
    copingStrategies: overrides.copingStrategies ?? defaults.copingStrategies,
    socialSupport: overrides.socialSupport ?? defaults.socialSupport,
  };

  return merged;
}

describe('EmpathyIntelligenceEngine (spike)', () => {
  it('returns defaults for empty inputs', async () => {
    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'user-1',
      [],
      [] as any
    );
    expect(metrics).toBeTruthy();
    expect(metrics.emotionalIntelligence).toBeTruthy();
    expect(typeof metrics.emotionalIntelligence.selfAwareness).toBe('number');
    expect(metrics.emotionalIntelligence.selfAwareness).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
  });

  it('reflects mood in simple single-entry input', async () => {
    const moodEntry = {
      mood: 8,
      notes: 'I felt connected and empathetic towards others',
      context: 'social',
      emotionalClarity: 7,
      emotionalRegulation: 8,
      hopefulness: 7,
      anxiety: 2,
      socialSupport: 'some',
      copingStrategies: [],
    } as any;

    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'user-2',
      [],
      [moodEntry]
    );
    expect(metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.empathy).toBeLessThanOrEqual(100);
    // empathy should be influenced by mood entry presence
    expect(metrics.emotionalIntelligence.empathy).not.toBeNaN();
  });

  it('elevates motivation and boundaries when supportive actions are recorded', async () => {
    const entries: MoodEntry[] = [
      buildMoodEntry({
        context: 'support group gathering emotional connection',
        notes:
          'I helped my neighbor recover after surgery, checked in later, and felt their pain while staying grounded.',
        energy: 8,
        hopefulness: 8,
        copingStrategies: ['support others', 'community circle'],
        socialSupport: 'strong',
        emotionalRegulation: 7,
      }),
      buildMoodEntry({
        context: 'care team volunteer shift',
        notes:
          'Volunteered and organized meals, encouraged the family, then recharged and protected my space.',
        energy: 7,
        stress: 3,
        copingStrategies: ['scheduled downtime'],
        socialSupport: 'moderate',
        emotionalRegulation: 7,
      }),
      buildMoodEntry({
        context: 'family call',
        notes:
          'Listened deeply, mirrored feelings, and said no to an extra shift to protect my boundaries.',
        energy: 6,
        stress: 4,
        copingStrategies: ['boundary affirmation'],
        emotionalRegulation: 7,
      }),
    ];

    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'supportive-user',
      [],
      entries
    );

    expect(metrics.empathyKPIs.empathicMotivation).toBeGreaterThan(70);
    expect(metrics.empathyKPIs.boundaryMaintenance).toBeGreaterThan(55);
    expect(
      metrics.emotionalIntelligence.neuralEmpathyPatterns.mirrorNeuronActivity
    ).toBeGreaterThan(60);
    expect(
      metrics.emotionalIntelligence.neuralEmpathyPatterns.emotionalContagionResistance
    ).toBeGreaterThan(60);
  });

  it('reduces boundary and motivation scores when overwhelmed without recovery', async () => {
    const entries: MoodEntry[] = [
      buildMoodEntry({
        context: 'support group',
        notes: 'Absorbed their emotions and felt overwhelmed by others; too tired to help anymore.',
        anxiety: 8,
        stress: 8,
        energy: 3,
      }),
      buildMoodEntry({
        context: 'workplace caregiving',
        notes:
          'People pleasing took on too much, emotionally flooded, could not help myself afterwards.',
        anxiety: 7,
        stress: 7,
        energy: 4,
      }),
      buildMoodEntry({
        context: 'late-night call',
        notes: 'Stayed up listening but felt drained and detached, no time to rest or set limits.',
        anxiety: 7,
        stress: 8,
        energy: 3,
      }),
    ];

    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'overwhelmed-user',
      [],
      entries
    );

    expect(metrics.empathyKPIs.boundaryMaintenance).toBeLessThan(45);
    expect(metrics.empathyKPIs.empathicMotivation).toBeLessThan(60);
    expect(
      metrics.emotionalIntelligence.neuralEmpathyPatterns.emotionalContagionResistance
    ).toBeLessThan(55);
  });
});

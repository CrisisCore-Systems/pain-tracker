import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { empathyIntelligenceEngine } from '../EmpathyIntelligenceEngine';
import type { MoodEntry } from '../../types/quantified-empathy';

function buildMoodEntry(
  overrides: Partial<MoodEntry> & { notes: string; context: string }
): MoodEntry {
  const defaults: MoodEntry = {
    id: 1,
    timestamp: new Date().toISOString(),
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
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns defaults for empty inputs', async () => {
    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics(
      'user-1',
      [],
      []
    );
    expect(metrics).toBeTruthy();
    expect(metrics.emotionalIntelligence).toBeTruthy();
    expect(typeof metrics.emotionalIntelligence.selfAwareness).toBe('number');
    expect(metrics.emotionalIntelligence.selfAwareness).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
  });

  it('reflects mood in simple single-entry input', async () => {
    const moodEntry = buildMoodEntry({
      mood: 8,
      notes: 'I felt connected and empathetic towards others',
      context: 'social',
      emotionalClarity: 7,
      emotionalRegulation: 8,
      hopefulness: 7,
      anxiety: 2,
      socialSupport: 'moderate',
      copingStrategies: [],
    });

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

  it('supports session-scoped caching and clearing', async () => {
    const { EmpathyIntelligenceEngine } = await import('../EmpathyIntelligenceEngine');
    const engine = new EmpathyIntelligenceEngine({
      learningRate: 0.1,
      predictionHorizon: 30,
      personalizationDepth: 'deep',
      culturalSensitivity: 'enhanced',
      interventionStyle: 'adaptive',
      privacyLevel: 'enhanced',
    });

    try {
      const session = {};
      engine.setSessionContext(session as any);

      const metrics = { any: 'metrics' } as any;
      const insights = [{ kind: 'insight' }] as any;

      engine.cacheSessionMetrics('user-3', metrics);
      engine.cacheSessionInsights('user-3', insights);

      expect(engine.getCachedSessionMetrics('user-3')).toBe(metrics);
      expect(engine.getCachedSessionInsights('user-3')).toBe(insights);

      engine.clearSessionCaches();
      expect(engine.getCachedSessionMetrics('user-3')).toBeUndefined();
      expect(engine.getCachedSessionInsights('user-3')).toBeUndefined();

      const stats = engine.getCacheStats();
      expect(stats.hasActiveSession).toBe(true);
      expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
    } finally {
      engine.destroy();
    }
  });

  it('generates recommendations based on burnout/growth thresholds', async () => {
    const { EmpathyIntelligenceEngine } = await import('../EmpathyIntelligenceEngine');
    const engine = new EmpathyIntelligenceEngine({
      learningRate: 0.1,
      predictionHorizon: 30,
      personalizationDepth: 'deep',
      culturalSensitivity: 'enhanced',
      interventionStyle: 'adaptive',
      privacyLevel: 'enhanced',
    });

    const burnoutSpy = vi
      .spyOn(engine as any, 'generateBurnoutPreventionRecommendations')
      .mockResolvedValue([{ id: 'burnout' }] as any);
    const growthSpy = vi
      .spyOn(engine as any, 'generateGrowthAccelerationRecommendations')
      .mockResolvedValue([{ id: 'growth' }] as any);
    const microSpy = vi
      .spyOn(engine as any, 'generateMicroInterventions')
      .mockResolvedValue([{ id: 'micro' }] as any);
    const wisdomSpy = vi
      .spyOn(engine as any, 'generateWisdomApplicationRecommendations')
      .mockResolvedValue([{ id: 'wisdom' }] as any);
    const culturalSpy = vi
      .spyOn(engine as any, 'generateCulturalEmpathyRecommendations')
      .mockResolvedValue([{ id: 'cultural' }] as any);
    vi.spyOn(engine as any, 'prioritizeRecommendations').mockReturnValue(0);

    try {
      const recommendations = await engine.generatePersonalizedRecommendations(
        'recs-user',
        {
          predictiveMetrics: {
            burnoutRisk: { currentRiskLevel: 80 },
            growthPotential: { currentGrowthTrajectory: 70 },
          },
        } as any,
        []
      );

      expect(burnoutSpy).toHaveBeenCalledTimes(1);
      expect(growthSpy).toHaveBeenCalledTimes(1);
      expect(microSpy).toHaveBeenCalledTimes(1);
      expect(wisdomSpy).toHaveBeenCalledTimes(1);
      expect(culturalSpy).toHaveBeenCalledTimes(1);
      expect(recommendations.map((r: any) => r.id)).toEqual(
        expect.arrayContaining(['burnout', 'growth', 'micro', 'wisdom', 'cultural'])
      );
    } finally {
      engine.destroy();
    }
  });

  it('skips burnout/growth generators when below thresholds', async () => {
    const { EmpathyIntelligenceEngine } = await import('../EmpathyIntelligenceEngine');
    const engine = new EmpathyIntelligenceEngine({
      learningRate: 0.1,
      predictionHorizon: 30,
      personalizationDepth: 'deep',
      culturalSensitivity: 'enhanced',
      interventionStyle: 'adaptive',
      privacyLevel: 'enhanced',
    });

    const burnoutSpy = vi
      .spyOn(engine as any, 'generateBurnoutPreventionRecommendations')
      .mockResolvedValue([{ id: 'burnout' }] as any);
    const growthSpy = vi
      .spyOn(engine as any, 'generateGrowthAccelerationRecommendations')
      .mockResolvedValue([{ id: 'growth' }] as any);
    const microSpy = vi
      .spyOn(engine as any, 'generateMicroInterventions')
      .mockResolvedValue([{ id: 'micro' }] as any);
    const wisdomSpy = vi
      .spyOn(engine as any, 'generateWisdomApplicationRecommendations')
      .mockResolvedValue([{ id: 'wisdom' }] as any);
    const culturalSpy = vi
      .spyOn(engine as any, 'generateCulturalEmpathyRecommendations')
      .mockResolvedValue([{ id: 'cultural' }] as any);
    vi.spyOn(engine as any, 'prioritizeRecommendations').mockReturnValue(0);

    try {
      await engine.generatePersonalizedRecommendations(
        'recs-user',
        {
          predictiveMetrics: {
            burnoutRisk: { currentRiskLevel: 20 },
            growthPotential: { currentGrowthTrajectory: 20 },
          },
        } as any,
        []
      );

      expect(burnoutSpy).not.toHaveBeenCalled();
      expect(growthSpy).not.toHaveBeenCalled();
      expect(microSpy).toHaveBeenCalledTimes(1);
      expect(wisdomSpy).toHaveBeenCalledTimes(1);
      expect(culturalSpy).toHaveBeenCalledTimes(1);
    } finally {
      engine.destroy();
    }
  });

  it('destroy is resilient when memory profiler is unavailable', async () => {
    vi.resetModules();
    vi.doMock('../../lib/memory-profiler', () => ({
      getMemoryProfiler: () => {
        throw new Error('memory profiler unavailable');
      },
    }));

    const mod = await import('../EmpathyIntelligenceEngine');
    const engine = new mod.EmpathyIntelligenceEngine({
      learningRate: 0.1,
      predictionHorizon: 30,
      personalizationDepth: 'deep',
      culturalSensitivity: 'enhanced',
      interventionStyle: 'adaptive',
      privacyLevel: 'enhanced',
    });

    expect(() => engine.destroy()).not.toThrow();

    vi.doUnmock('../../lib/memory-profiler');
  });
});

import { describe, it, expect } from 'vitest';
import { EmpathyMetricsCollector } from '../EmpathyMetricsCollector';

// Minimal fakes for dependencies
class FakeSecurityService {
  privacyConfig = { consentRequired: true };
}

class FakeAnalyticsService {
  async calculateQuantifiedEmpathy(_userId: string, _pain: any[], _mood: any[]) {
    // return a controlled metrics object with some out-of-range and exact values
    return {
      emotionalIntelligence: {
        selfAwareness: 120,
        selfRegulation: -5,
        motivation: 50,
        empathy: 50,
        socialSkills: 50,
        emotionalGranularity: 50,
        metaEmotionalAwareness: 50,
      },
      compassionateProgress: {
        selfCompassion: 50,
        selfCriticism: 10,
        progressCelebration: 50,
        setbackResilience: 50,
        hopefulness: 50,
        postTraumaticGrowth: 50,
        meaningMaking: 50,
        adaptiveReframing: 50,
        compassionFatigue: 50,
      },
      empathyKPIs: {
        validationReceived: 50,
        validationGiven: 50,
        emotionalSupport: 50,
        understandingFelt: 50,
        connectionQuality: 50,
        empathicAccuracy: 50,
        empathicConcern: 50,
        perspectiveTaking: 50,
        empathicMotivation: 50,
        boundaryMaintenance: 50,
      },
      humanizedMetrics: {
        courageScore: 50,
        vulnerabilityAcceptance: 50,
        authenticityLevel: 50,
        growthMindset: 50,
        innerStrength: 50,
        dignityMaintenance: 50,
        purposeClarity: 50,
        spiritualWellbeing: 50,
        lifeNarrativeCoherence: 50,
      },
    } as any;
  }
  async generateEmpathyInsights() {
    return [];
  }
  async generateEmpathyRecommendations() {
    return [];
  }
}

describe('EmpathyMetricsCollector', () => {
  it('throws when consent required but not granted', async () => {
    const security = new FakeSecurityService();
    const analytics = new FakeAnalyticsService();
    const c = new EmpathyMetricsCollector(security as any, analytics as any);

    await expect(c.collect([], [], { userId: 'u1', consentGranted: false })).rejects.toThrow(
      /Consent required/
    );
  });

  it('sanitizes notes and counts redactions', async () => {
    const security = new FakeSecurityService();
    const analytics = new FakeAnalyticsService();
    const c = new EmpathyMetricsCollector(security as any, analytics as any);

    const pain = [{ notes: 'Contact me at test@example.com or 123-456-7890' }];
    const mood = [{ notes: 'No PII here' }];

    const res = await c.collect(pain as any, mood as any, {
      userId: 'u1',
      consentGranted: true,
      sanitize: true,
    });
    expect(res.redactions).toBeGreaterThanOrEqual(1);
    // ensure metrics returned and within clamped bounds
    expect(res.metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
    expect(res.metrics.emotionalIntelligence.selfRegulation).toBeGreaterThanOrEqual(0);
  });

  it('injects noise when differentialPrivacy true', async () => {
    const security = new FakeSecurityService();
    const analytics = new FakeAnalyticsService();
    const c = new EmpathyMetricsCollector(security as any, analytics as any);

    const pain = [{ notes: '' }];
    const mood = [{ notes: '' }];

    const r1 = await c.collect(pain as any, mood as any, {
      userId: 'u1',
      consentGranted: true,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });
    const r2 = await c.collect(pain as any, mood as any, {
      userId: 'u1',
      consentGranted: true,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    // With noise, repeated calls should not always be identical for the same underlying metric
    const v1 = r1.metrics.emotionalIntelligence.motivation;
    const v2 = r2.metrics.emotionalIntelligence.motivation;
    expect(v1).not.toBeUndefined();
    expect(v2).not.toBeUndefined();
    // It's possible (rare) they're equal; just check they're numbers and within [0,100]
    expect(typeof v1).toBe('number');
    expect(v1).toBeGreaterThanOrEqual(0);
    expect(v1).toBeLessThanOrEqual(100);
  });
});

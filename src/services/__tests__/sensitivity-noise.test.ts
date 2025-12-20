import { describe, it, expect } from 'vitest';

import { EmpathyMetricsCollector } from '../EmpathyMetricsCollector';
import type { QuantifiedEmpathyMetrics } from '../../types/quantified-empathy';
import type { SecurityService } from '../SecurityService';
import type { EmpathyDrivenAnalyticsService } from '../EmpathyDrivenAnalytics';

// Import module to access and mutate the sensitivity map for testing
import * as CollectorModule from '../EmpathyMetricsCollector';

class FakeSecurityService {
  privacyConfig = { consentRequired: false };
}
class FakeAnalyticsService {
  /* not used in this test */
}

describe('sensitivity-aware noise', () => {
  it('produces larger average absolute noise for higher sensitivity', () => {
    const collector = new EmpathyMetricsCollector(
      new FakeSecurityService() as unknown as SecurityService,
      new FakeAnalyticsService() as unknown as EmpathyDrivenAnalyticsService
    );

    const baseMetrics = {
      emotionalIntelligence: {
        selfAwareness: 50,
        selfRegulation: 50,
        motivation: 50,
        empathy: 50,
        socialSkills: 50,
        emotionalGranularity: 50,
        metaEmotionalAwareness: 50,
      },
      compassionateProgress: Object.fromEntries(
        [
          'selfCompassion',
          'selfCriticism',
          'progressCelebration',
          'setbackResilience',
          'hopefulness',
          'postTraumaticGrowth',
          'meaningMaking',
          'adaptiveReframing',
          'compassionFatigue',
        ].map(k => [k, 50])
      ),
      empathyKPIs: Object.fromEntries(
        [
          'validationReceived',
          'validationGiven',
          'emotionalSupport',
          'understandingFelt',
          'connectionQuality',
          'empathicAccuracy',
          'empathicConcern',
          'perspectiveTaking',
          'empathicMotivation',
          'boundaryMaintenance',
        ].map(k => [k, 50])
      ),
      humanizedMetrics: Object.fromEntries(
        [
          'courageScore',
          'vulnerabilityAcceptance',
          'authenticityLevel',
          'growthMindset',
          'innerStrength',
          'dignityMaintenance',
          'purposeClarity',
          'spiritualWellbeing',
          'lifeNarrativeCoherence',
        ].map(k => [k, 50])
      ),
    };

    const trials = 300;
    const epsilon = 1.0;

    // helper to sample mean absolute deviation for a given sensitivity for the 'motivation' metric
    const sampleMeanAbs = (sensitivity: number) => {
      // mutate sensitivity map in module
      (CollectorModule as unknown as { METRIC_SENSITIVITY: Record<string, number> }).
        METRIC_SENSITIVITY['emotionalIntelligence.motivation'] = sensitivity;

      let sum = 0;
      for (let i = 0; i < trials; i++) {
        const out = (
          collector as unknown as {
            guardMetrics: (
              metrics: QuantifiedEmpathyMetrics,
              differentialPrivacy: boolean,
              epsilon: number
            ) => QuantifiedEmpathyMetrics;
          }
        ).guardMetrics(baseMetrics as unknown as QuantifiedEmpathyMetrics, true, epsilon);
        const diff = Math.abs((out.emotionalIntelligence.motivation ?? 50) - 50);
        sum += diff;
      }
      return sum / trials;
    };

    const mean1 = sampleMeanAbs(1);
    const mean3 = sampleMeanAbs(3);

    // With higher sensitivity, mean absolute noise should be larger
    expect(mean3).toBeGreaterThan(mean1);
  });
});

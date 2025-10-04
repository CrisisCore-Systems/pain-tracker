import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmpathyMetricsCollector } from '../EmpathyMetricsCollector';
import type { PainEntry } from '../../types';
import type { MoodEntry, QuantifiedEmpathyMetrics } from '../../types/quantified-empathy';
import type { EmpathyDrivenAnalyticsService } from '../EmpathyDrivenAnalytics';
import type { PrivacyBudgetManager } from '../PrivacyBudgetManager';
import type { AuditLogger } from '../AuditLogger';
import type { SecurityService } from '../SecurityService';

const securityStub = {
  privacyConfig: {
    consentRequired: false,
    minimumNoiseLevel: 0.2
  }
} as unknown as SecurityService;

const basePainEntry: PainEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
  baselineData: {
    pain: 6,
    locations: ['Lower back at 1234 Elm Street'],
    symptoms: ['stiffness']
  },
  functionalImpact: {
    limitedActivities: ['Jogging around the block'],
    assistanceNeeded: ['Temporary cane'],
    mobilityAids: ['Brace']
  },
  medications: {
    current: [
      {
        name: 'Gabapentin',
        dosage: '300mg',
        frequency: 'twice daily',
        effectiveness: 'helps with nighttime pain'
      }
    ],
    changes: 'None',
    effectiveness: 'moderate relief'
  },
  treatments: {
    recent: [
      {
        type: 'Physiotherapy',
        provider: 'Dr. caret@example.com Suite 400',
        date: '2025-09-15',
        effectiveness: 'encouraging'
      }
    ],
    effectiveness: 'Incremental',
    planned: ['Massage therapy']
  },
  qualityOfLife: {
    sleepQuality: 6,
    moodImpact: 5,
    socialImpact: ['Cancelled visit to 500 Main Street']
  },
  workImpact: {
    missedWork: 2,
    modifiedDuties: ['Remote mornings'],
    workLimitations: ['Avoid heavy lifting']
  },
  comparison: {
    worseningSince: '2025-08-01',
    newLimitations: ['Driving beyond 30 minutes']
  },
  notes: 'Contact me at 555-987-6543 or email me at person@example.com. Address: 987 Main Street, Apt 12.'
};

const baseMoodEntry: MoodEntry = {
  timestamp: new Date(),
  mood: 6,
  energy: 5,
  anxiety: 4,
  stress: 5,
  hopefulness: 7,
  selfEfficacy: 6,
  emotionalClarity: 6,
  emotionalRegulation: 5,
  context: 'Met friend near 321 Cedar Ave Apt 7B and shared phone 6045551122.',
  triggers: ['Unexpected phone call from 5553332211'],
  copingStrategies: ['deep breathing'],
  socialSupport: 'moderate',
  notes: 'Reach me at support@example.org or +1 604 555 7788 for details.'
};

function createStubMetrics(): QuantifiedEmpathyMetrics {
  return {
    emotionalIntelligence: {
      selfAwareness: 45,
      selfRegulation: 44,
      motivation: 46,
      empathy: 47,
      socialSkills: 48,
      emotionalGranularity: 49,
      metaEmotionalAwareness: 50,
      neuralEmpathyPatterns: {} as unknown as QuantifiedEmpathyMetrics['emotionalIntelligence']['neuralEmpathyPatterns']
    },
    compassionateProgress: {
      selfCompassion: 40,
      selfCriticism: 38,
      progressCelebration: 42,
      setbackResilience: 44,
      hopefulness: 41,
      postTraumaticGrowth: 43,
      meaningMaking: 45,
      adaptiveReframing: 46,
      compassionFatigue: 37,
      recoveryPatterns: {} as unknown as QuantifiedEmpathyMetrics['compassionateProgress']['recoveryPatterns']
    },
    empathyKPIs: {
      validationReceived: 55,
      validationGiven: 54,
      emotionalSupport: 52,
      understandingFelt: 53,
      connectionQuality: 51,
      empathicAccuracy: 50,
      empathicConcern: 49,
      perspectiveTaking: 48,
      empathicMotivation: 47,
      boundaryMaintenance: 46,
      culturalEmpathy: {} as unknown as QuantifiedEmpathyMetrics['empathyKPIs']['culturalEmpathy']
    },
    humanizedMetrics: {
      courageScore: 58,
      vulnerabilityAcceptance: 57,
      authenticityLevel: 56,
      growthMindset: 55,
      innerStrength: 54,
      dignityMaintenance: 53,
      purposeClarity: 52,
      spiritualWellbeing: 51,
      lifeNarrativeCoherence: 50,
      wisdomGained: {} as unknown as QuantifiedEmpathyMetrics['humanizedMetrics']['wisdomGained']
    },
    empathyIntelligence: {} as unknown as QuantifiedEmpathyMetrics['empathyIntelligence'],
    temporalPatterns: {} as unknown as QuantifiedEmpathyMetrics['temporalPatterns'],
    microEmpathyMoments: {} as unknown as QuantifiedEmpathyMetrics['microEmpathyMoments'],
    predictiveMetrics: {} as unknown as QuantifiedEmpathyMetrics['predictiveMetrics']
  } as QuantifiedEmpathyMetrics;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EmpathyMetricsCollector guardrails', () => {
  it('sanitizes nested text fields and reports redactions', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([])
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const collector = new EmpathyMetricsCollector(securityStub, analytics);
    const painEntries = [structuredClone(basePainEntry)];
    const moodEntries = [structuredClone(baseMoodEntry)];

    const result = await collector.collect(painEntries, moodEntries, {
      userId: 'test-user',
      consentGranted: true,
      sanitize: true
    });

    expect(result.redactions).toBeGreaterThan(0);
    expect(painEntries[0].notes).toContain('555-987-6543');

    const sanitizedPain = analyticsMocks.calculateQuantifiedEmpathy.mock.calls[0][1];
    expect(sanitizedPain[0].notes).not.toContain('555-987-6543');
    expect(sanitizedPain[0].baselineData.locations[0]).toContain('[REDACTED]');

    const sanitizedMood = analyticsMocks.calculateQuantifiedEmpathy.mock.calls[0][2];
    expect(sanitizedMood[0].context).not.toContain('321 Cedar Ave');
    expect(sanitizedMood[0].notes).toContain('[REDACTED]');
  });

  it('injects differential privacy noise when budget allows consumption', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([])
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true)
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-user',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5
    });

    expect(budgetManager.consume).toHaveBeenCalledWith('dp-user', 0.5);
    expect(result.noiseInjected).toBe(true);
    expect(result.metrics.emotionalIntelligence.selfAwareness).not.toEqual(metrics.emotionalIntelligence.selfAwareness);
    expect(auditLogMock).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'dp_budget_consumption',
      details: expect.objectContaining({ consumed: true, requestedEpsilon: 0.5 })
    }));

    randomSpy.mockRestore();
  });

  it('skips noise when privacy budget is denied', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([])
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(false)
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-user-denied',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5
    });

    expect(budgetManager.consume).toHaveBeenCalledWith('dp-user-denied', 0.5);
    expect(result.noiseInjected).toBe(false);
    expect(result.metrics.emotionalIntelligence.selfAwareness).toEqual(metrics.emotionalIntelligence.selfAwareness);
    expect(auditLogMock).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'dp_budget_denied',
      details: expect.objectContaining({ consumed: false })
    }));

    randomSpy.mockRestore();
  });
});

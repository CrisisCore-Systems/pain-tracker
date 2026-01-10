import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmpathyMetricsCollector } from '../EmpathyMetricsCollector';
import { createEmpathyCollector } from '../EmpathyMetricsCollector';
import type { PainEntry } from '../../types';
import type { MoodEntry, QuantifiedEmpathyMetrics } from '../../types/quantified-empathy';
import type { EmpathyDrivenAnalyticsService } from '../EmpathyDrivenAnalytics';
import type { PrivacyBudgetManager } from '../PrivacyBudgetManager';
import type { AuditLogger } from '../AuditLogger';
import type { SecurityService } from '../SecurityService';

const securityStub = {
  privacyConfig: {
    consentRequired: false,
    minimumNoiseLevel: 0.2,
  },
} as unknown as SecurityService;

const basePainEntry: PainEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
  baselineData: {
    pain: 6,
    locations: ['Lower back at 1234 Elm Street'],
    symptoms: ['stiffness'],
  },
  functionalImpact: {
    limitedActivities: ['Jogging around the block'],
    assistanceNeeded: ['Temporary cane'],
    mobilityAids: ['Brace'],
  },
  medications: {
    current: [
      {
        name: 'Gabapentin',
        dosage: '300mg',
        frequency: 'twice daily',
        effectiveness: 'helps with nighttime pain',
      },
    ],
    changes: 'None',
    effectiveness: 'moderate relief',
  },
  treatments: {
    recent: [
      {
        type: 'Physiotherapy',
        provider: 'Dr. caret@example.com Suite 400',
        date: '2025-09-15',
        effectiveness: 'encouraging',
      },
    ],
    effectiveness: 'Incremental',
    planned: ['Massage therapy'],
  },
  qualityOfLife: {
    sleepQuality: 6,
    moodImpact: 5,
    socialImpact: ['Cancelled visit to 500 Main Street'],
  },
  workImpact: {
    missedWork: 2,
    modifiedDuties: ['Remote mornings'],
    workLimitations: ['Avoid heavy lifting'],
  },
  comparison: {
    worseningSince: '2025-08-01',
    newLimitations: ['Driving beyond 30 minutes'],
  },
  notes:
    'Contact me at 555-987-6543 or email me at person@example.com. Address: 987 Main Street, Apt 12.',
};

const baseMoodEntry: MoodEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
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
  notes: 'Reach me at support@example.org or +1 604 555 7788 for details.',
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
      neuralEmpathyPatterns:
        {} as unknown as QuantifiedEmpathyMetrics['emotionalIntelligence']['neuralEmpathyPatterns'],
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
      recoveryPatterns:
        {} as unknown as QuantifiedEmpathyMetrics['compassionateProgress']['recoveryPatterns'],
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
      culturalEmpathy: {} as unknown as QuantifiedEmpathyMetrics['empathyKPIs']['culturalEmpathy'],
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
      wisdomGained: {} as unknown as QuantifiedEmpathyMetrics['humanizedMetrics']['wisdomGained'],
    },
    empathyIntelligence: {} as unknown as QuantifiedEmpathyMetrics['empathyIntelligence'],
    temporalPatterns: {} as unknown as QuantifiedEmpathyMetrics['temporalPatterns'],
    microEmpathyMoments: {} as unknown as QuantifiedEmpathyMetrics['microEmpathyMoments'],
    predictiveMetrics: {} as unknown as QuantifiedEmpathyMetrics['predictiveMetrics'],
  } as QuantifiedEmpathyMetrics;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EmpathyMetricsCollector guardrails', () => {
  it('requires consent when configured (consentRequired=true)', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const securityConsentRequired = {
      privacyConfig: {
        consentRequired: true,
        minimumNoiseLevel: 0.2,
      },
    } as unknown as SecurityService;

    const collector = new EmpathyMetricsCollector(securityConsentRequired, analytics);

    await expect(
      collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
        userId: 'needs-consent',
        consentGranted: false,
        sanitize: true,
      })
    ).rejects.toThrow(/Consent required/i);
  });

  it('sanitizes nested text fields and reports redactions', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const collector = new EmpathyMetricsCollector(securityStub, analytics);
    const painEntries = [structuredClone(basePainEntry)];
    const moodEntries = [structuredClone(baseMoodEntry)];

    const result = await collector.collect(painEntries, moodEntries, {
      userId: 'test-user',
      consentGranted: true,
      sanitize: true,
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

  it('sanitizes safely with circular refs and preserves Date objects', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const collector = new EmpathyMetricsCollector(securityStub, analytics);

    const circular: any = structuredClone(basePainEntry);
    circular.extra = { createdAt: new Date('2026-01-06T12:00:00.000Z') };
    circular.extra.self = circular;

    await expect(
      collector.collect([circular as PainEntry], [structuredClone(baseMoodEntry)], {
        userId: 'circular',
        consentGranted: true,
        sanitize: true,
      })
    ).resolves.toBeDefined();

    const sanitizedPain = analyticsMocks.calculateQuantifiedEmpathy.mock.calls[0][1] as any[];
    expect(sanitizedPain[0].extra.createdAt).toBeInstanceOf(Date);
  });

  it('injects differential privacy noise when budget allows consumption', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(
      securityStub,
      analytics,
      budgetManager,
      undefined,
      auditLogger
    );

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect(
      [structuredClone(basePainEntry)],
      [structuredClone(baseMoodEntry)],
      {
        userId: 'dp-user',
        consentGranted: true,
        sanitize: false,
        differentialPrivacy: true,
        noiseEpsilon: 0.5,
      }
    );

    expect(budgetManager.consume).toHaveBeenCalledWith('dp-user', 0.5);
    expect(result.noiseInjected).toBe(true);
    expect(result.metrics.emotionalIntelligence.selfAwareness).not.toEqual(
      metrics.emotionalIntelligence.selfAwareness
    );
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_consumption',
        details: expect.objectContaining({ consumed: true, requestedEpsilon: 0.5 }),
      })
    );

    randomSpy.mockRestore();
  });

  it('normalizes epsilon to default when requested epsilon is undefined', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-default-eps',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      // noiseEpsilon omitted
    });

    expect(budgetManager.consume).toHaveBeenCalledWith('dp-default-eps', 1.0);
  });

  it('skips budget/noise when normalized epsilon is non-positive', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-skip',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0,
    });

    expect(result.noiseInjected).toBe(false);
    expect(budgetManager.consume).not.toHaveBeenCalled();
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_skipped',
        details: expect.objectContaining({ reason: 'non_positive_epsilon' }),
      })
    );
  });

  it('supports async (Promise) privacy budget consumption', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockResolvedValue(true),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-async',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(result.noiseInjected).toBe(true);
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_consumption' })
    );

    randomSpy.mockRestore();
  });

  it('allows differential privacy noise when no budget manager is provided', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const collector = new EmpathyMetricsCollector(securityStub, analytics);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-no-budget-manager',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(result.noiseInjected).toBe(true);

    randomSpy.mockRestore();
  });

  it('logs dp_budget_error when budget consumption throws and denies noise', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn(() => {
        throw new Error('budget failure');
      }),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    const result = await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-error',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(result.noiseInjected).toBe(false);
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_error' })
    );
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_denied' })
    );
  });

  it('logs dp_budget_error when budget consumption throws a non-Error value', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn(() => {
        throw 'budget failure';
      }),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, auditLogger);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'dp-error-non-error',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_error',
        details: expect.objectContaining({ error: 'budget failure' }),
      })
    );
  });

  it('skips noise when privacy budget is denied', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(false),
    } as unknown as PrivacyBudgetManager;
    const auditLogMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: auditLogMock } as AuditLogger;

    const collector = new EmpathyMetricsCollector(
      securityStub,
      analytics,
      budgetManager,
      undefined,
      auditLogger
    );

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = await collector.collect(
      [structuredClone(basePainEntry)],
      [structuredClone(baseMoodEntry)],
      {
        userId: 'dp-user-denied',
        consentGranted: true,
        sanitize: false,
        differentialPrivacy: true,
        noiseEpsilon: 0.5,
      }
    );

    expect(budgetManager.consume).toHaveBeenCalledWith('dp-user-denied', 0.5);
    expect(result.noiseInjected).toBe(false);
    expect(result.metrics.emotionalIntelligence.selfAwareness).toEqual(
      metrics.emotionalIntelligence.selfAwareness
    );
    expect(auditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_denied',
        details: expect.objectContaining({ consumed: false }),
      })
    );

    randomSpy.mockRestore();
  });

  it('uses keyManager + append sink and stores userId as HMAC', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const appendMock = vi.fn().mockResolvedValue({} as any);
    const auditLogger = { append: appendMock } as unknown as AuditLogger;

    const keyManager = {
      getKey: vi.fn().mockResolvedValue('test-audit-key'),
    } as unknown as any;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, auditLogger);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'hmac-user',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(appendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_consumption',
        userIdHmac: expect.any(String),
      })
    );

    randomSpy.mockRestore();
  });

  it('logs dp_budget_audit_failure when keyManager fails and uses raw userId in fallback', async () => {
    const metrics = createStubMetrics();
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(metrics),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;
    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const logMock = vi.fn().mockResolvedValue(undefined);
    const auditLogger = { log: logMock } as unknown as AuditLogger;

    const keyManager = {
      getKey: vi.fn().mockRejectedValue(new Error('no key')),
    } as unknown as any;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, auditLogger);
    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'raw-user',
      consentGranted: true,
      sanitize: false,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });

    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_audit_failure',
        userId: 'raw-user',
      })
    );
  });

  it('normalizes non-finite epsilon to default and consumes budget', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager);

    const result = await collector.collect(
      [structuredClone(basePainEntry)],
      [structuredClone(baseMoodEntry)],
      {
        userId: 'epsilon-non-finite',
        consentGranted: true,
        sanitize: true,
        differentialPrivacy: true,
        noiseEpsilon: Number.NaN,
      }
    );

    expect(result.noiseInjected).toBe(true);
    expect((budgetManager as any).consume).toHaveBeenCalledWith('epsilon-non-finite', 1);
  });

  it('treats epsilon=0 as skip and does not consume budget', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager);

    const result = await collector.collect(
      [structuredClone(basePainEntry)],
      [structuredClone(baseMoodEntry)],
      {
        userId: 'epsilon-zero',
        consentGranted: true,
        sanitize: true,
        differentialPrivacy: true,
        noiseEpsilon: 0,
      }
    );

    expect(result.noiseInjected).toBe(false);
    expect((budgetManager as any).consume).not.toHaveBeenCalled();
  });

  it('supports async privacy budget manager outcomes (Promise path)', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockResolvedValue(false),
    } as unknown as PrivacyBudgetManager;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager);

    const result = await collector.collect(
      [structuredClone(basePainEntry)],
      [structuredClone(baseMoodEntry)],
      {
        userId: 'budget-promise',
        consentGranted: true,
        sanitize: true,
        differentialPrivacy: true,
        noiseEpsilon: 1,
      }
    );

    expect((budgetManager as any).consume).toHaveBeenCalled();
    expect(result.noiseInjected).toBe(false);
  });

  it('writes dp budget audit events via sink.append when available', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const keyManager = {
      getKey: vi.fn().mockResolvedValue(Buffer.from('audit-key')),
    } as any;

    const sink = {
      append: vi.fn().mockResolvedValue({} as any),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-append',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).append).toHaveBeenCalled();
  });

  it('writes dp budget audit events via sink.log when append is not available', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const keyManager = {
      getKey: vi.fn().mockResolvedValue('audit-key'),
    } as any;

    const sink = {
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-log',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).log).toHaveBeenCalled();
  });

  it('logs dp budget audit failure when key derivation fails', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const keyManager = {
      getKey: vi.fn().mockRejectedValue(new Error('no key')),
    } as any;

    const sink = {
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-fail',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_audit_failure' })
    );
  });

  it('logs dp budget audit failure when key derivation rejects with a non-Error value', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const keyManager = {
      getKey: vi.fn().mockRejectedValue('no key'),
    } as any;

    const sink = {
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-fail-non-error',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).log).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'dp_budget_audit_failure',
        details: expect.objectContaining({ error: 'no key' }),
      })
    );
  });

  it('writes dp budget audit via sink.log when keyManager is not provided', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const sink = {
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, undefined, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-no-key',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_consumption', userId: 'audit-no-key' })
    );
  });

  it('writes dp budget audit via sink.log when keyManager is present but has no getKey()', async () => {
    const analyticsMocks = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    };
    const analytics = analyticsMocks as unknown as EmpathyDrivenAnalyticsService;

    const budgetManager = {
      consume: vi.fn().mockReturnValue(true),
    } as unknown as PrivacyBudgetManager;

    const keyManager = {} as any;

    const sink = {
      log: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogger;

    const collector = new EmpathyMetricsCollector(securityStub, analytics, budgetManager, keyManager, sink);

    await collector.collect([structuredClone(basePainEntry)], [structuredClone(baseMoodEntry)], {
      userId: 'audit-no-getKey',
      consentGranted: true,
      sanitize: true,
      differentialPrivacy: true,
      noiseEpsilon: 1,
    });

    expect((sink as any).log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'dp_budget_consumption', userId: 'audit-no-getKey' })
    );
  });
});

describe('EmpathyMetricsCollector factory helper', () => {
  it('createEmpathyCollector returns an EmpathyMetricsCollector instance', () => {
    const analytics = {
      calculateQuantifiedEmpathy: vi.fn().mockResolvedValue(createStubMetrics()),
      generateEmpathyInsights: vi.fn().mockResolvedValue([]),
      generateEmpathyRecommendations: vi.fn().mockResolvedValue([]),
    } as unknown as EmpathyDrivenAnalyticsService;

    const collector = createEmpathyCollector(securityStub, analytics);
    expect(collector).toBeInstanceOf(EmpathyMetricsCollector);
  });
});

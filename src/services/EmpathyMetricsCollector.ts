import { SecurityService } from './SecurityService';
import { EmpathyDrivenAnalyticsService } from './EmpathyDrivenAnalytics';
import { PrivacyBudgetManager } from './PrivacyBudgetManager';
import { KeyManager } from './KeyManagement';
import { AuditLogger } from './AuditLogger';
import { createHmac } from 'crypto';
import type { AuditEvent } from './SecureAuditSink';
import type { PainEntry } from '../types';
import type {
  MoodEntry,
  QuantifiedEmpathyMetrics,
  EmpathyInsight,
  EmpathyRecommendation,
} from '../types/quantified-empathy';

export interface EmpathyCollectionOptions {
  userId: string;
  consentGranted: boolean; // explicit consent flag from UI/privacy layer
  sanitize?: boolean;
  differentialPrivacy?: boolean;
  noiseEpsilon?: number; // per-collection epsilon to consume from budget
}

export interface EmpathyCollectionResult {
  metrics: QuantifiedEmpathyMetrics;
  insights: EmpathyInsight[];
  recommendations: EmpathyRecommendation[];
  redactions: number; // count of redacted tokens
  noiseInjected: boolean;
}

// Extended PII-ish pattern set (conservative; expand as needed)
const PII_PATTERNS: RegExp[] = [
  /\b\d{3}-\d{3}-\d{4}\b/g, // phone (US-like)
  /\b\+?\d{7,15}\b/g, // international-ish phone numbers
  /\b\d{10}\b/g, // raw 10 digit
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // credit cards
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN / SIN style IDs
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, // email
  /\b(?:street|st\.|ave|road|rd\.|drive|dr\.|lane|ln\.|boulevard|blvd|suite|unit|apt)\b/gi, // address hints
  /\b\d{3}\s?\d{2}\s?\d{4}\b/g, // other common national id formats (loose)
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g, // UUIDs
];

const DEFAULT_NOISE_EPSILON = 1.0;
const MIN_NOISE_EPSILON = 0.1;
const MAX_NOISE_EPSILON = 5;

type SanitizedResult<T> = { value: T; redactions: number };

type SinkLike = {
  append?: (event: Partial<AuditEvent>) => Promise<AuditEvent>;
  log?: (event: {
    timestamp: string;
    eventType: string;
    userId?: string;
    details?: Record<string, unknown>;
  }) => Promise<void>;
};

function sanitizeText(input: string): { text: string; redactions: number } {
  let redactions = 0;
  let output = input.slice(0, 2000); // length cap
  for (const pattern of PII_PATTERNS) {
    output = output.replace(pattern, () => {
      redactions++;
      return '[REDACTED]';
    });
  }
  output = output.replace(/[^\S\r\n]{2,}/g, ' ');
  output = output.replace(/\n{3,}/g, '\n\n');
  output = output.replace(/\u200B+/g, '');
  return { text: output.trim(), redactions };
}

function sanitizeDeep<T>(input: T): SanitizedResult<T> {
  const seen = new WeakMap<object, SanitizedResult<unknown>>();

  const walk = (value: unknown): SanitizedResult<unknown> => {
    if (typeof value === 'string') {
      const { text, redactions } = sanitizeText(value);
      return { value: text, redactions };
    }

    if (Array.isArray(value)) {
      let total = 0;
      const sanitized = value.map(item => {
        const result = walk(item);
        total += result.redactions;
        return result.value;
      });
      return { value: sanitized, redactions: total };
    }

    if (value && typeof value === 'object') {
      if (value instanceof Date) {
        return { value, redactions: 0 };
      }

      const cached = seen.get(value as object);
      if (cached) {
        return cached;
      }

      const clone: Record<string, unknown> = {};
      const record: SanitizedResult<unknown> = { value: clone, redactions: 0 };
      seen.set(value as object, record);

      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const result = walk(child);
        clone[key] = result.value;
        record.redactions += result.redactions;
      }

      return record;
    }

    return { value, redactions: 0 };
  };

  const result = walk(input);
  return { value: result.value as T, redactions: result.redactions };
}

function normalizeEpsilon(
  requested: number | undefined,
  minimumFromConfig: number | undefined
): number {
  const min = Math.max(MIN_NOISE_EPSILON, minimumFromConfig ?? MIN_NOISE_EPSILON);
  if (!Number.isFinite(requested)) {
    return Math.max(min, DEFAULT_NOISE_EPSILON);
  }
  const magnitude = Math.abs(requested as number);
  if (magnitude === 0) {
    return 0;
  }
  return Math.min(MAX_NOISE_EPSILON, Math.max(min, magnitude));
}

function sampleLaplace(scale: number): number {
  // Draw from Laplace(0, scale) using inverse CDF
  const u = Math.random() - 0.5; // uniform (-0.5, 0.5)
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// Sensitivity map per metric path (tune these based on metric semantics).
export const METRIC_SENSITIVITY: Record<string, number> = {
  // emotionalIntelligence
  'emotionalIntelligence.selfAwareness': 1,
  'emotionalIntelligence.selfRegulation': 1,
  'emotionalIntelligence.motivation': 1,
  'emotionalIntelligence.empathy': 1,
  'emotionalIntelligence.socialSkills': 1,
  'emotionalIntelligence.emotionalGranularity': 1,
  'emotionalIntelligence.metaEmotionalAwareness': 1,
  // compassionateProgress
  'compassionateProgress.selfCompassion': 1,
  'compassionateProgress.selfCriticism': 1,
  'compassionateProgress.progressCelebration': 1,
  'compassionateProgress.setbackResilience': 1,
  'compassionateProgress.hopefulness': 1,
  'compassionateProgress.postTraumaticGrowth': 1,
  'compassionateProgress.meaningMaking': 1,
  'compassionateProgress.adaptiveReframing': 1,
  'compassionateProgress.compassionFatigue': 1,
  // empathyKPIs
  'empathyKPIs.validationReceived': 1,
  'empathyKPIs.validationGiven': 1,
  'empathyKPIs.emotionalSupport': 1,
  'empathyKPIs.understandingFelt': 1,
  'empathyKPIs.connectionQuality': 1,
  'empathyKPIs.empathicAccuracy': 1,
  'empathyKPIs.empathicConcern': 1,
  'empathyKPIs.perspectiveTaking': 1,
  'empathyKPIs.empathicMotivation': 1,
  'empathyKPIs.boundaryMaintenance': 1,
  // humanizedMetrics
  'humanizedMetrics.courageScore': 1,
  'humanizedMetrics.vulnerabilityAcceptance': 1,
  'humanizedMetrics.authenticityLevel': 1,
  'humanizedMetrics.growthMindset': 1,
  'humanizedMetrics.innerStrength': 1,
  'humanizedMetrics.dignityMaintenance': 1,
  'humanizedMetrics.purposeClarity': 1,
  'humanizedMetrics.spiritualWellbeing': 1,
  'humanizedMetrics.lifeNarrativeCoherence': 1,
};

function addNoise(value: number, epsilon: number, sensitivity = 1): number {
  // Laplace mechanism: scale = sensitivity / epsilon.
  const eps = Math.max(epsilon, 1e-6);
  const scale = sensitivity / eps;
  const noise = sampleLaplace(scale);
  const noisy = value + noise;
  return Math.min(100, Math.max(0, noisy));
}

export class EmpathyMetricsCollector {
  constructor(
    private security: SecurityService,
    private analytics: EmpathyDrivenAnalyticsService,
    private budgetManager?: PrivacyBudgetManager,
    private keyManager?: KeyManager,
    private auditLogger?: AuditLogger
  ) {}

  async collect(
    painEntries: PainEntry[],
    moodEntries: MoodEntry[],
    options: EmpathyCollectionOptions
  ): Promise<EmpathyCollectionResult> {
    const {
      userId,
      consentGranted,
      sanitize = true,
      differentialPrivacy = false,
      noiseEpsilon = DEFAULT_NOISE_EPSILON,
    } = options;

    if (this.security && this.security['privacyConfig']?.consentRequired && !consentGranted) {
      throw new Error('Consent required before collecting empathy metrics.');
    }

    let redactions = 0;
    const safePain = sanitize
      ? painEntries.map(entry => {
          const result = sanitizeDeep(entry);
          redactions += result.redactions;
          return result.value;
        })
      : painEntries.map(entry => ({ ...entry }));

    const safeMood = sanitize
      ? moodEntries.map(entry => {
          const result = sanitizeDeep(entry);
          redactions += result.redactions;
          return result.value;
        })
      : moodEntries.map(entry => ({ ...entry }));

    const metrics = await this.analytics.calculateQuantifiedEmpathy(userId, safePain, safeMood);
    const insights = await this.analytics.generateEmpathyInsights(
      userId,
      metrics,
      safePain,
      safeMood
    );
    const recommendations = await this.analytics.generateEmpathyRecommendations(
      userId,
      metrics,
      insights
    );

    // Range guard + optional noise (respect privacy budget if provided)
    let noiseInjected = false;
    let epsilonForNoise = 0;
    if (differentialPrivacy) {
      const minimumNoiseLevel = this.security?.['privacyConfig']?.minimumNoiseLevel;
      const normalizedEpsilon = normalizeEpsilon(noiseEpsilon, minimumNoiseLevel);

      if (normalizedEpsilon > 0) {
        const allowed = await this.consumePrivacyBudget(userId, normalizedEpsilon);
        noiseInjected = allowed;
        epsilonForNoise = allowed ? normalizedEpsilon : 0;
        await this.logBudgetEvent(userId, allowed ? 'dp_budget_consumption' : 'dp_budget_denied', {
          requestedEpsilon: normalizedEpsilon,
          consumed: allowed,
        });
      } else {
        await this.logBudgetEvent(userId, 'dp_budget_skipped', {
          requestedEpsilon: noiseEpsilon,
          reason: 'non_positive_epsilon',
        });
      }
    }

    const guarded = this.guardMetrics(metrics, noiseInjected, epsilonForNoise);

    return { metrics: guarded, insights, recommendations, redactions, noiseInjected };
  }

  private guardMetrics(
    metrics: QuantifiedEmpathyMetrics,
    noisy: boolean,
    epsilon: number
  ): QuantifiedEmpathyMetrics {
    const clamp = (v: number) => Math.min(100, Math.max(0, v));

    // Iterate shallow numeric leaves (manually for key sections to avoid perf cost)
    const applyNoiseMaybe = (v: number, metricPath?: string) => {
      if (!noisy) return clamp(v);
      const sensitivity = metricPath ? (METRIC_SENSITIVITY[metricPath] ?? 1) : 1;
      return addNoise(clamp(v), epsilon, sensitivity);
    };

    const emotionalIntelligence: typeof metrics.emotionalIntelligence = {
      ...metrics.emotionalIntelligence,
    };
    (
      [
        'selfAwareness',
        'selfRegulation',
        'motivation',
        'empathy',
        'socialSkills',
        'emotionalGranularity',
        'metaEmotionalAwareness',
      ] as const
    ).forEach(k => {
      emotionalIntelligence[k] = applyNoiseMaybe(
        emotionalIntelligence[k],
        `emotionalIntelligence.${k}`
      );
    });

    const compassionateProgress: typeof metrics.compassionateProgress = {
      ...metrics.compassionateProgress,
    };
    (
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
      ] as const
    ).forEach(k => {
      compassionateProgress[k] = applyNoiseMaybe(
        compassionateProgress[k],
        `compassionateProgress.${k}`
      );
    });

    const empathyKPIs: typeof metrics.empathyKPIs = { ...metrics.empathyKPIs };
    (
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
      ] as const
    ).forEach(k => {
      empathyKPIs[k] = applyNoiseMaybe(empathyKPIs[k], `empathyKPIs.${k}`);
    });

    const humanizedMetrics: typeof metrics.humanizedMetrics = { ...metrics.humanizedMetrics };
    (
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
      ] as const
    ).forEach(k => {
      humanizedMetrics[k] = applyNoiseMaybe(humanizedMetrics[k], `humanizedMetrics.${k}`);
    });

    return {
      ...metrics,
      emotionalIntelligence,
      compassionateProgress,
      empathyKPIs,
      humanizedMetrics,
    };
  }

  private async consumePrivacyBudget(userId: string, epsilon: number): Promise<boolean> {
    if (!this.budgetManager) {
      return true;
    }

    try {
      const outcome = (
        this.budgetManager.consume as unknown as (
          id: string,
          eps: number
        ) => boolean | Promise<boolean>
      )(userId, epsilon);
      if (outcome && typeof (outcome as Promise<boolean>).then === 'function') {
        return await outcome;
      }
      return !!outcome;
    } catch (error) {
      await this.logBudgetEvent(userId, 'dp_budget_error', {
        requestedEpsilon: epsilon,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  private async logBudgetEvent(
    userId: string,
    eventType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    if (!this.auditLogger) {
      return;
    }

    const timestamp = new Date().toISOString();
    const sink = this.auditLogger as unknown as SinkLike;

    if (this.keyManager && typeof (this.keyManager as KeyManager).getKey === 'function') {
      try {
        const auditKey = await this.keyManager.getKey('audit');
        const hmac = createHmac('sha256', auditKey).update(userId).digest('base64');
        if (sink?.append) {
          await sink.append({
            eventId: String(Date.now()),
            timestamp,
            eventType,
            userIdHmac: hmac,
            details,
          });
          return;
        }
        if (sink?.log) {
          await sink.log({ timestamp, eventType, userId: hmac, details });
          return;
        }
      } catch (error) {
        if (sink?.log) {
          await sink.log({
            timestamp: new Date().toISOString(),
            eventType: 'dp_budget_audit_failure',
            userId,
            details: { error: error instanceof Error ? error.message : String(error) },
          });
        }
        return;
      }
    }

    if (sink?.log) {
      await sink.log({ timestamp, eventType, userId, details });
    }
  }
}

// Factory helper
export function createEmpathyCollector(
  security: SecurityService,
  analytics: EmpathyDrivenAnalyticsService
) {
  return new EmpathyMetricsCollector(security, analytics);
}

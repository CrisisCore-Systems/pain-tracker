import { SecurityService } from './SecurityService';
import { EmpathyDrivenAnalyticsService } from './EmpathyDrivenAnalytics';
import { PrivacyBudgetManager } from './PrivacyBudgetManager';
import { KeyManager } from './KeyManagement';
import { AuditLogger } from './AuditLogger';
import { createHmac } from 'crypto';
import type { AuditEvent } from './SecureAuditSink';
import type { PainEntry } from '../types';
import type { MoodEntry, QuantifiedEmpathyMetrics, EmpathyInsight, EmpathyRecommendation } from '../types/quantified-empathy';

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
  /\b\+?\d{7,15}\b/g,        // international-ish phone numbers
  /\b\d{10}\b/g,             // raw 10 digit
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, // email
  /\b(?:street|st\.|ave|road|rd\.|drive|dr\.|lane|ln\.|boulevard|blvd)\b/gi, // address hints
  /\b\d{3}\s?\d{2}\s?\d{4}\b/g, // common national id formats (loose)
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g // UUIDs
];

function sanitizeText(input: string): { text: string; redactions: number } {
  let redactions = 0;
  let output = input.slice(0, 2000); // length cap
  for (const pattern of PII_PATTERNS) {
    output = output.replace(pattern, () => { redactions++; return '[REDACTED]'; });
  }
  return { text: output, redactions };
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
    private analytics: EmpathyDrivenAnalyticsService
  , private budgetManager?: PrivacyBudgetManager
  , private keyManager?: KeyManager
  , private auditLogger?: AuditLogger
  ) {}

  async collect(
    painEntries: PainEntry[],
    moodEntries: MoodEntry[],
    options: EmpathyCollectionOptions
  ): Promise< EmpathyCollectionResult > {
  const { userId, consentGranted, sanitize = true, differentialPrivacy = false, noiseEpsilon = 1.0 } = options;

    if (this.security && this.security['privacyConfig']?.consentRequired && !consentGranted) {
      throw new Error('Consent required before collecting empathy metrics.');
    }

    // Sanitize notes in copies only
    let redactions = 0;
    const safePain = painEntries.map(p => ({
      ...p,
      notes: sanitize && p.notes ? sanitizeText(p.notes).text : p.notes
    }));
    if (sanitize) {
      painEntries.forEach(p => { if (p.notes) redactions += sanitizeText(p.notes).redactions; });
    }

    const safeMood = moodEntries.map(m => ({
      ...m,
      notes: sanitize && m.notes ? sanitizeText(m.notes).text : m.notes
    }));
    if (sanitize) {
      moodEntries.forEach(m => { if (m.notes) redactions += sanitizeText(m.notes).redactions; });
    }

    const metrics = await this.analytics.calculateQuantifiedEmpathy(userId, safePain, safeMood);
  const insights = await this.analytics.generateEmpathyInsights(userId, metrics, safePain, safeMood);
    const recommendations = await this.analytics.generateEmpathyRecommendations(userId, metrics, insights);

    // Range guard + optional noise (respect privacy budget if provided)
    let noiseInjected = false;
    if (differentialPrivacy) {
      const eps = noiseEpsilon;
      let allowed = true;
      if (this.budgetManager) {
        // consume returns a Promise<boolean>
        allowed = await this.budgetManager.consume(userId, eps);
      }
      noiseInjected = !!allowed;
      // Audit budget consumption
      const event = { timestamp: new Date().toISOString(), eventType: 'dp_budget_consumption', userId, details: { requestedEpsilon: eps, consumed: noiseInjected } };
      if (this.keyManager && typeof (this.keyManager as KeyManager).getKey === 'function') {
        try {
          // request the audit key using the standard getKey interface; purpose 'audit' is conventional here
          const getKeyFn = (this.keyManager as KeyManager).getKey.bind(this.keyManager);
          const auditKey = await getKeyFn('audit');
          const hmac = createHmac('sha256', auditKey).update(userId).digest('base64');
          // prefer sinks that implement append (SecureAuditSink / InMemoryAuditSink)
          type SinkLike = { append?: (e: Partial<AuditEvent>) => Promise<AuditEvent>; log?: (e: { timestamp: string; eventType: string; userId?: string; details?: Record<string, unknown> }) => Promise<void> };
          const sink = this.auditLogger as unknown as SinkLike | undefined;
          if (sink?.append) {
            await sink.append({ eventId: String(Date.now()), timestamp: event.timestamp, eventType: event.eventType, userIdHmac: hmac, details: event.details });
          } else if (sink?.log) {
            await sink.log({ timestamp: event.timestamp, eventType: event.eventType, userId: hmac, details: event.details });
          }
        } catch (err) {
          // best-effort: do not block collection on audit failures; still log to legacy logger if present
          if (this.auditLogger && this.auditLogger.log) {
            await this.auditLogger.log({ timestamp: new Date().toISOString(), eventType: 'dp_budget_audit_failure', userId, details: { error: String(err) } });
          }
        }
      } else if (this.auditLogger && this.auditLogger.log) {
        await this.auditLogger.log({ timestamp: new Date().toISOString(), eventType: 'dp_budget_consumption', userId, details: { requestedEpsilon: eps, consumed: noiseInjected } });
      }
    }

    const guarded = this.guardMetrics(metrics, noiseInjected, noiseEpsilon);

    return { metrics: guarded, insights, recommendations, redactions, noiseInjected };
  }

  private guardMetrics(metrics: QuantifiedEmpathyMetrics, noisy: boolean, epsilon: number): QuantifiedEmpathyMetrics {
    const clamp = (v: number) => Math.min(100, Math.max(0, v));

    // Iterate shallow numeric leaves (manually for key sections to avoid perf cost)
    const applyNoiseMaybe = (v: number, metricPath?: string) => {
      if (!noisy) return clamp(v);
      const sensitivity = metricPath ? (METRIC_SENSITIVITY[metricPath] ?? 1) : 1;
      return addNoise(clamp(v), epsilon, sensitivity);
    };

  const emotionalIntelligence: typeof metrics.emotionalIntelligence = { ...metrics.emotionalIntelligence };
    (['selfAwareness','selfRegulation','motivation','empathy','socialSkills','emotionalGranularity','metaEmotionalAwareness'] as const)
  .forEach(k => { emotionalIntelligence[k] = applyNoiseMaybe(emotionalIntelligence[k], `emotionalIntelligence.${k}`); });

  const compassionateProgress: typeof metrics.compassionateProgress = { ...metrics.compassionateProgress };
    (['selfCompassion','selfCriticism','progressCelebration','setbackResilience','hopefulness','postTraumaticGrowth','meaningMaking','adaptiveReframing','compassionFatigue'] as const)
  .forEach(k => { compassionateProgress[k] = applyNoiseMaybe(compassionateProgress[k], `compassionateProgress.${k}`); });

  const empathyKPIs: typeof metrics.empathyKPIs = { ...metrics.empathyKPIs };
    (['validationReceived','validationGiven','emotionalSupport','understandingFelt','connectionQuality','empathicAccuracy','empathicConcern','perspectiveTaking','empathicMotivation','boundaryMaintenance'] as const)
  .forEach(k => { empathyKPIs[k] = applyNoiseMaybe(empathyKPIs[k], `empathyKPIs.${k}`); });

  const humanizedMetrics: typeof metrics.humanizedMetrics = { ...metrics.humanizedMetrics };
    (['courageScore','vulnerabilityAcceptance','authenticityLevel','growthMindset','innerStrength','dignityMaintenance','purposeClarity','spiritualWellbeing','lifeNarrativeCoherence'] as const)
  .forEach(k => { humanizedMetrics[k] = applyNoiseMaybe(humanizedMetrics[k], `humanizedMetrics.${k}`); });

    return { ...metrics, emotionalIntelligence, compassionateProgress, empathyKPIs, humanizedMetrics };
  }
}

// Factory helper
export function createEmpathyCollector(security: SecurityService, analytics: EmpathyDrivenAnalyticsService) {
  return new EmpathyMetricsCollector(security, analytics);
}

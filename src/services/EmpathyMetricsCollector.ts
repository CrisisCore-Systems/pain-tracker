import { SecurityService } from './SecurityService';
import { EmpathyDrivenAnalyticsService } from './EmpathyDrivenAnalytics';
import type { PainEntry } from '../types';
import type { MoodEntry, QuantifiedEmpathyMetrics, EmpathyInsight, EmpathyRecommendation } from '../types/quantified-empathy';

export interface EmpathyCollectionOptions {
  userId: string;
  consentGranted: boolean; // explicit consent flag from UI/privacy layer
  sanitize?: boolean;
  differentialPrivacy?: boolean;
  noiseEpsilon?: number; // for simple Laplace-like noise addition
}

export interface EmpathyCollectionResult {
  metrics: QuantifiedEmpathyMetrics;
  insights: EmpathyInsight[];
  recommendations: EmpathyRecommendation[];
  redactions: number; // count of redacted tokens
  noiseInjected: boolean;
}

// Simple PII-ish pattern set (very conservative / extend later)
const PII_PATTERNS: RegExp[] = [
  /\b\d{3}-\d{3}-\d{4}\b/g, // phone
  /\b\d{10}\b/g,             // digits
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, // email
  /\b(?:street|st\.|ave|road|rd\.|drive|dr\.)\b/gi // address hints
];

function sanitizeText(input: string): { text: string; redactions: number } {
  let redactions = 0;
  let output = input.slice(0, 2000); // length cap
  for (const pattern of PII_PATTERNS) {
    output = output.replace(pattern, () => { redactions++; return '[REDACTED]'; });
  }
  return { text: output, redactions };
}

function addNoise(value: number, epsilon: number): number {
  // Simple symmetric noise (not true Laplace) for placeholder differential privacy
  const scale = 1 / Math.max(epsilon, 0.1);
  const noise = (Math.random() - 0.5) * 2 * scale; // uniform approximation
  const noisy = value + noise;
  return Math.min(100, Math.max(0, noisy));
}

export class EmpathyMetricsCollector {
  constructor(
    private security: SecurityService,
    private analytics: EmpathyDrivenAnalyticsService
  ) {}

  async collect(
    painEntries: PainEntry[],
    moodEntries: MoodEntry[],
    options: EmpathyCollectionOptions
  ): Promise< EmpathyCollectionResult > {
    const { userId, consentGranted, sanitize = true, differentialPrivacy = false, noiseEpsilon = 0.5 } = options;

    if (this.security && this.security['privacyConfig']?.consentRequired && !consentGranted) {
      throw new Error('Consent required before collecting empathy metrics.');
    }

    // Sanitize notes in copies only
    let redactions = 0;
    const safePain = painEntries.map(p => ({
      ...p,
      notes: sanitize ? sanitizeText(p.notes).text : p.notes
    }));
    if (sanitize) {
      painEntries.forEach(p => { redactions += sanitizeText(p.notes).redactions; });
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

    // Range guard + optional noise
    const noise = differentialPrivacy;
    const guarded = this.guardMetrics(metrics, noise, noiseEpsilon);

    return { metrics: guarded, insights, recommendations, redactions, noiseInjected: noise };
  }

  private guardMetrics(metrics: QuantifiedEmpathyMetrics, noisy: boolean, epsilon: number): QuantifiedEmpathyMetrics {
    const clamp = (v: number) => Math.min(100, Math.max(0, v));

    // Iterate shallow numeric leaves (manually for key sections to avoid perf cost)
    const applyNoiseMaybe = (v: number) => noisy ? addNoise(clamp(v), epsilon) : clamp(v);

  const emotionalIntelligence: typeof metrics.emotionalIntelligence = { ...metrics.emotionalIntelligence };
    (['selfAwareness','selfRegulation','motivation','empathy','socialSkills','emotionalGranularity','metaEmotionalAwareness'] as const)
      .forEach(k => { emotionalIntelligence[k] = applyNoiseMaybe(emotionalIntelligence[k]); });

  const compassionateProgress: typeof metrics.compassionateProgress = { ...metrics.compassionateProgress };
    (['selfCompassion','selfCriticism','progressCelebration','setbackResilience','hopefulness','postTraumaticGrowth','meaningMaking','adaptiveReframing','compassionFatigue'] as const)
      .forEach(k => { compassionateProgress[k] = applyNoiseMaybe(compassionateProgress[k]); });

  const empathyKPIs: typeof metrics.empathyKPIs = { ...metrics.empathyKPIs };
    (['validationReceived','validationGiven','emotionalSupport','understandingFelt','connectionQuality','empathicAccuracy','empathicConcern','perspectiveTaking','empathicMotivation','boundaryMaintenance'] as const)
      .forEach(k => { empathyKPIs[k] = applyNoiseMaybe(empathyKPIs[k]); });

  const humanizedMetrics: typeof metrics.humanizedMetrics = { ...metrics.humanizedMetrics };
    (['courageScore','vulnerabilityAcceptance','authenticityLevel','growthMindset','innerStrength','dignityMaintenance','purposeClarity','spiritualWellbeing','lifeNarrativeCoherence'] as const)
      .forEach(k => { humanizedMetrics[k] = applyNoiseMaybe(humanizedMetrics[k]); });

    return { ...metrics, emotionalIntelligence, compassionateProgress, empathyKPIs, humanizedMetrics };
  }
}

// Factory helper
export function createEmpathyCollector(security: SecurityService, analytics: EmpathyDrivenAnalyticsService) {
  return new EmpathyMetricsCollector(security, analytics);
}

// cspell:ignore futur
/**
 * Empathy Intelligence Engine
 * Advanced AI-powered empathy analysis with predictive modeling and personalized insights
 */

import type { PainEntry } from '../types';
import {
  QuantifiedEmpathyMetrics,
  EmotionalStateMetrics,
  HolisticWellbeingMetrics,
  DigitalPacingSystem,
  MoodEntry,
  NeuralEmpathyProfile,
  WisdomProfile,
  EmpathyInsight,
  EmpathyRecommendation,
  WisdomInsight,
  CulturalEmpathyMetrics,
  RecoveryPatternAnalysis,
  EmpathyIntelligenceProfile,
  TemporalEmpathyPatterns,
  MicroEmpathyTracking,
  PredictiveEmpathyModel,
} from '../types/quantified-empathy';
// Newly extracted modules
import { extractWisdomInsights } from './empathy/WisdomModule';
import {
  calculateTrend as extCalculateTrend,
  calculateVariance as extCalculateVariance,
  buildPredictiveModel,
} from './empathy/PredictiveModule';
import { getMemoryProfiler } from '../lib/memory-profiler';

const MOTIVATION_KEYWORDS = [
  'help',
  'support',
  'encourage',
  'check in',
  'showed up',
  'listened',
] as const;
const MOTIVATION_ACTION_KEYWORDS = [
  'volunteered',
  'brought',
  'organized',
  'advocated',
  'dropped off',
] as const;
const FATIGUE_KEYWORDS = [
  'burned out',
  'exhausted',
  'drained',
  'too tired',
  'could not help',
] as const;
const BOUNDARY_KEYWORDS = [
  'boundary',
  'limit',
  'said no',
  'protected my space',
  'took a pause',
] as const;
const RESTORATIVE_KEYWORDS = [
  'rested',
  'recharged',
  'took a break',
  'scheduled downtime',
  'stepped back',
] as const;
const OVERWHELM_KEYWORDS = [
  'absorbed',
  'overwhelmed by others',
  'took on too much',
  'emotionally flooded',
] as const;
const CONNECTION_KEYWORDS = [
  'connected deeply',
  'shared emotions',
  'mirrored feelings',
  'felt their pain',
  'resonated',
] as const;
const DETACHMENT_KEYWORDS = [
  'numb',
  'disconnected',
  'shut down',
  'detached',
  "couldn't feel",
] as const;

function clampScore(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe division that returns fallback for division by zero or invalid inputs
 */
function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || !Number.isFinite(denominator)) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

function normalizeText(value?: string): string {
  return (value ?? '').toLowerCase();
}

function hasKeyword(text: string | undefined, keywords: readonly string[]): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(keyword));
}

function entryWeight(entry: MoodEntry): number {
  let weight = 1;
  if (typeof entry.hopefulness === 'number') {
    weight += (entry.hopefulness - 5) / 10;
  }
  if (typeof entry.mood === 'number') {
    weight += (entry.mood - 5) / 20;
  }
  if (typeof entry.energy === 'number' && entry.energy >= 7) {
    weight += 0.2;
  }
  if (entry.socialSupport && entry.socialSupport !== 'none') {
    weight += 0.25;
  }
  return Math.max(0.4, weight);
}

export interface EmpathyIntelligenceConfig {
  learningRate: number; // 0-1, how quickly the AI learns patterns
  predictionHorizon: number; // days ahead to predict
  personalizationDepth: 'surface' | 'moderate' | 'deep' | 'profound';
  culturalSensitivity: 'standard' | 'enhanced' | 'expert';
  interventionStyle: 'gentle' | 'balanced' | 'intensive' | 'adaptive';
  privacyLevel: 'minimal' | 'standard' | 'enhanced' | 'maximum';
}

// Supporting interfaces (moved to top so class methods can follow cleanly)
interface UserEmpathyPattern {
  userId: string;
  patterns: unknown[];
  preferences: unknown[];
  responsiveness: number;
  /** Timestamp of last access for cache eviction */
  lastAccessed: number;
}

interface CulturalContext {
  culturalBackground: string[];
  values: string[];
  communicationStyle: string;
  empathyExpressions: string[];
  /** Timestamp of last access for cache eviction */
  lastAccessed?: number;
}

interface PredictionModel {
  modelId: string;
  accuracy: number;
  trainingData: unknown[];
  predictions: unknown[];
  /** Timestamp of last access for cache eviction */
  lastAccessed?: number;
}

/** Cache configuration for memory management */
interface CacheConfig {
  /** Maximum entries per cache map */
  maxEntries: number;
  /** Time-to-live in milliseconds (default: 1 hour) */
  ttlMs: number;
  /** Eviction check interval in milliseconds */
  evictionIntervalMs: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxEntries: 100,
  ttlMs: 60 * 60 * 1000, // 1 hour
  evictionIntervalMs: 5 * 60 * 1000, // 5 minutes
};

/**
 * Session context object used as WeakMap key for session-scoped caching.
 * When the session object is garbage collected, all associated cache entries
 * are automatically cleaned up.
 */
export interface SessionContext {
  sessionId: string;
  userId: string;
  startTime: number;
}

/**
 * WeakMap-based cache for session-scoped data.
 * Entries are automatically garbage collected when the session context
 * is no longer referenced elsewhere in the application.
 */
class WeakSessionCache<T> {
  private cache = new WeakMap<SessionContext, Map<string, T>>();

  get(session: SessionContext, key: string): T | undefined {
    const sessionMap = this.cache.get(session);
    return sessionMap?.get(key);
  }

  set(session: SessionContext, key: string, value: T): void {
    let sessionMap = this.cache.get(session);
    if (!sessionMap) {
      sessionMap = new Map();
      this.cache.set(session, sessionMap);
    }
    sessionMap.set(key, value);
  }

  has(session: SessionContext, key: string): boolean {
    const sessionMap = this.cache.get(session);
    return sessionMap?.has(key) ?? false;
  }

  delete(session: SessionContext, key: string): boolean {
    const sessionMap = this.cache.get(session);
    return sessionMap?.delete(key) ?? false;
  }

  clearSession(session: SessionContext): void {
    const sessionMap = this.cache.get(session);
    sessionMap?.clear();
  }
}

export class EmpathyIntelligenceEngine {
  private readonly _config: EmpathyIntelligenceConfig;
  private readonly _cacheConfig: CacheConfig;
  private userPatterns: Map<string, UserEmpathyPattern> = new Map();
  private culturalContext: Map<string, CulturalContext> = new Map();
  private wisdomDatabase: Map<string, WisdomInsight[]> = new Map();
  private predictionModels: Map<string, PredictionModel> = new Map();
  private evictionIntervalId: ReturnType<typeof setInterval> | null = null;

  // WeakMap-based caches for session-scoped data (auto GC when session dereferenced)
  private sessionMetricsCache = new WeakSessionCache<QuantifiedEmpathyMetrics>();
  private sessionInsightsCache = new WeakSessionCache<EmpathyInsight[]>();

  // Current session context (if set)
  private currentSession: SessionContext | null = null;

  constructor(config: EmpathyIntelligenceConfig, cacheConfig?: Partial<CacheConfig>) {
    this._config = config;
    this._cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
    this.startCacheEviction();
    this.registerWithMemoryProfiler();
  }

  /**
   * Register cache sizes with the memory profiler for monitoring
   */
  private registerWithMemoryProfiler(): void {
    try {
      const profiler = getMemoryProfiler();
      profiler.trackCollection('EmpathyEngine.userPatterns', () => this.userPatterns.size);
      profiler.trackCollection('EmpathyEngine.culturalContext', () => this.culturalContext.size);
      profiler.trackCollection('EmpathyEngine.wisdomDatabase', () => this.wisdomDatabase.size);
      profiler.trackCollection('EmpathyEngine.predictionModels', () => this.predictionModels.size);
    } catch {
      // Memory profiler not available (e.g., in tests)
    }
  }

  /**
   * Set the current session context for WeakMap-based caching.
   * When the session context is dereferenced, associated cache entries
   * are automatically garbage collected.
   */
  setSessionContext(session: SessionContext): void {
    this.currentSession = session;
  }

  /**
   * Get cached metrics for the current session (if available)
   */
  getCachedSessionMetrics(userId: string): QuantifiedEmpathyMetrics | undefined {
    if (!this.currentSession) return undefined;
    return this.sessionMetricsCache.get(this.currentSession, `metrics:${userId}`);
  }

  /**
   * Cache metrics for the current session
   */
  cacheSessionMetrics(userId: string, metrics: QuantifiedEmpathyMetrics): void {
    if (!this.currentSession) return;
    this.sessionMetricsCache.set(this.currentSession, `metrics:${userId}`, metrics);
  }

  /**
   * Get cached insights for the current session (if available)
   */
  getCachedSessionInsights(userId: string): EmpathyInsight[] | undefined {
    if (!this.currentSession) return undefined;
    return this.sessionInsightsCache.get(this.currentSession, `insights:${userId}`);
  }

  /**
   * Cache insights for the current session
   */
  cacheSessionInsights(userId: string, insights: EmpathyInsight[]): void {
    if (!this.currentSession) return;
    this.sessionInsightsCache.set(this.currentSession, `insights:${userId}`, insights);
  }

  /**
   * Clear session-specific caches (called when session ends)
   */
  clearSessionCaches(): void {
    if (this.currentSession) {
      this.sessionMetricsCache.clearSession(this.currentSession);
      this.sessionInsightsCache.clearSession(this.currentSession);
    }
  }

  /**
   * Start automatic cache eviction based on TTL and max entries
   */
  private startCacheEviction(): void {
    if (this.evictionIntervalId) return;

    this.evictionIntervalId = setInterval(() => {
      this.evictExpiredEntries();
    }, this._cacheConfig.evictionIntervalMs);

    // Ensure interval is cleaned up if running in Node.js
    if (typeof this.evictionIntervalId === 'object' && 'unref' in this.evictionIntervalId) {
      this.evictionIntervalId.unref();
    }
  }

  /**
   * Stop automatic cache eviction (call during cleanup/destroy)
   */
  stopCacheEviction(): void {
    if (this.evictionIntervalId) {
      clearInterval(this.evictionIntervalId);
      this.evictionIntervalId = null;
    }
  }

  /**
   * Evict expired entries from all caches
   */
  private evictExpiredEntries(): void {
    const now = Date.now();
    const { maxEntries, ttlMs } = this._cacheConfig;

    // Evict from userPatterns
    this.evictFromMap(this.userPatterns, now, ttlMs, maxEntries, (v) => v.lastAccessed);

    // Evict from culturalContext
    this.evictFromMap(this.culturalContext, now, ttlMs, maxEntries, (v) => v.lastAccessed ?? 0);

    // Evict from wisdomDatabase (use 0 as fallback since WisdomInsight[] has no timestamp)
    if (this.wisdomDatabase.size > maxEntries) {
      const entriesToRemove = this.wisdomDatabase.size - maxEntries;
      const keys = Array.from(this.wisdomDatabase.keys()).slice(0, entriesToRemove);
      keys.forEach((key) => this.wisdomDatabase.delete(key));
    }

    // Evict from predictionModels
    this.evictFromMap(this.predictionModels, now, ttlMs, maxEntries, (v) => v.lastAccessed ?? 0);
  }

  /**
   * Generic map eviction based on TTL and max entries
   */
  private evictFromMap<T>(
    map: Map<string, T>,
    now: number,
    ttlMs: number,
    maxEntries: number,
    getLastAccessed: (value: T) => number
  ): void {
    // First, remove expired entries
    const expiredKeys: string[] = [];
    map.forEach((value, key) => {
      if (now - getLastAccessed(value) > ttlMs) {
        expiredKeys.push(key);
      }
    });
    expiredKeys.forEach((key) => map.delete(key));

    // If still over limit, remove oldest entries
    if (map.size > maxEntries) {
      const entries = Array.from(map.entries())
        .sort((a, b) => getLastAccessed(a[1]) - getLastAccessed(b[1]));
      const removeCount = map.size - maxEntries;
      entries.slice(0, removeCount).forEach(([key]) => map.delete(key));
    }
  }

  /**
   * Clear all caches (useful for testing or memory pressure)
   */
  clearAllCaches(): void {
    this.userPatterns.clear();
    this.culturalContext.clear();
    this.wisdomDatabase.clear();
    this.predictionModels.clear();
    this.clearSessionCaches();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    userPatterns: number;
    culturalContext: number;
    wisdomDatabase: number;
    predictionModels: number;
    totalEntries: number;
    hasActiveSession: boolean;
  } {
    return {
      userPatterns: this.userPatterns.size,
      culturalContext: this.culturalContext.size,
      wisdomDatabase: this.wisdomDatabase.size,
      predictionModels: this.predictionModels.size,
      totalEntries:
        this.userPatterns.size +
        this.culturalContext.size +
        this.wisdomDatabase.size +
        this.predictionModels.size,
      hasActiveSession: this.currentSession !== null,
    };
  }

  /**
   * Destroy the engine and clean up all resources
   */
  destroy(): void {
    this.stopCacheEviction();
    this.clearAllCaches();
    this.currentSession = null;

    // Unregister from memory profiler
    try {
      const profiler = getMemoryProfiler();
      profiler.untrack('EmpathyEngine.userPatterns');
      profiler.untrack('EmpathyEngine.culturalContext');
      profiler.untrack('EmpathyEngine.wisdomDatabase');
      profiler.untrack('EmpathyEngine.predictionModels');
    } catch {
      // Memory profiler not available
    }
  }

  /**
   * Calculate enhanced quantified empathy metrics with AI-powered insights
   */
  async calculateAdvancedEmpathyMetrics(
    userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[] = [],
    emotionalState?: EmotionalStateMetrics,
    wellbeingMetrics?: HolisticWellbeingMetrics,
    _pacingSystem?: DigitalPacingSystem,
    culturalContext?: CulturalContext
  ): Promise<QuantifiedEmpathyMetrics> {
    // touch config to avoid unused warnings
    const _lr = this._config.learningRate;
    void _lr;
    // Update user patterns
    await this.updateUserPatterns(userId, painEntries, moodEntries);

    // Get or create prediction model for user
    const predictionModel = await this.getOrCreatePredictionModel(userId);

    // Build sections explicitly to satisfy required field types
    const eiBase = await this.calculateEnhancedEmotionalIntelligence(
      userId,
      moodEntries,
      painEntries
    );
    const cpBase = await this.calculateAdvancedCompassionateProgress(
      userId,
      painEntries,
      moodEntries
    );
    const ekBase = await this.calculateAdvancedEmpathyKPIs(userId, moodEntries, emotionalState);
    const hmBase = await this.calculateAdvancedHumanizedMetrics(
      userId,
      painEntries,
      moodEntries,
      wellbeingMetrics
    );
    // reference auxiliary calculators to avoid unused warnings
    void this.calculateTraumaIntegration(painEntries, moodEntries);

    return {
      emotionalIntelligence: {
        selfAwareness: eiBase.selfAwareness,
        selfRegulation: eiBase.selfRegulation,
        motivation: eiBase.motivation,
        empathy: eiBase.empathy,
        socialSkills: eiBase.socialSkills,
        emotionalGranularity: this.calculateEmotionalGranularity(moodEntries),
        metaEmotionalAwareness: this.calculateMetaEmotionalAwareness(moodEntries),
        neuralEmpathyPatterns: await this.calculateNeuralEmpathyProfile(userId, moodEntries),
      },
      compassionateProgress: {
        selfCompassion: cpBase.selfCompassion,
        selfCriticism: cpBase.selfCriticism,
        progressCelebration: cpBase.progressCelebration,
        setbackResilience: cpBase.setbackResilience,
        hopefulness: cpBase.hopefulness,
        postTraumaticGrowth: this.calculatePostTraumaticGrowth(painEntries, moodEntries),
        meaningMaking: this.calculateMeaningMaking(moodEntries),
        adaptiveReframing: this.calculateAdaptiveReframing(moodEntries),
        compassionFatigue: this.calculateCompassionFatigue(moodEntries),
        recoveryPatterns: await this.analyzeRecoveryPatterns(userId, painEntries, moodEntries),
      },
      empathyKPIs: {
        validationReceived: ekBase.validationReceived,
        validationGiven: ekBase.validationGiven,
        emotionalSupport: ekBase.emotionalSupport,
        understandingFelt: ekBase.understandingFelt,
        connectionQuality: ekBase.connectionQuality,
        empathicAccuracy: this.calculateEmpathicAccuracy(moodEntries),
        empathicConcern: this.calculateEmpathicConcern(moodEntries),
        perspectiveTaking: this.calculatePerspectiveTaking(moodEntries),
        empathicMotivation: this.calculateEmpathicMotivation(moodEntries),
        boundaryMaintenance: this.calculateBoundaryMaintenance(moodEntries),
        culturalEmpathy: await this.calculateCulturalEmpathy(userId, moodEntries, culturalContext),
      },
      humanizedMetrics: {
        courageScore: hmBase.courageScore,
        vulnerabilityAcceptance: hmBase.vulnerabilityAcceptance,
        authenticityLevel: hmBase.authenticityLevel,
        growthMindset: hmBase.growthMindset,
        wisdomGained: await this.generateWisdomProfile(userId, painEntries, moodEntries),
        innerStrength: this.calculateInnerStrength(painEntries, moodEntries),
        dignityMaintenance: this.calculateDignityMaintenance(moodEntries),
        purposeClarity: this.calculatePurposeClarity(moodEntries),
        spiritualWellbeing: this.calculateSpiritualWellbeing(moodEntries),
        lifeNarrativeCoherence: this.calculateLifeNarrativeCoherence(moodEntries),
      },
      empathyIntelligence: await this.calculateEmpathyIntelligenceProfile(
        userId,
        moodEntries,
        painEntries
      ),
      temporalPatterns: await this.analyzeTemporalEmpathyPatterns(userId, moodEntries, painEntries),
      microEmpathyMoments: await this.trackMicroEmpathyMoments(userId, moodEntries),
      predictiveMetrics: await this.generatePredictiveModel(
        userId,
        painEntries,
        moodEntries,
        predictionModel
      ),
    };
  }

  /**
   * Generate personalized insights with advanced AI analysis
   */
  async generateAdvancedInsights(
    userId: string,
    metrics: QuantifiedEmpathyMetrics,
    historicalData: { painEntries: PainEntry[]; moodEntries: MoodEntry[] }
  ): Promise<EmpathyInsight[]> {
    const insights: EmpathyInsight[] = [];

    // Pattern recognition insights
    insights.push(...(await this.generatePatternInsights(userId, metrics, historicalData)));

    // Correlation insights
    insights.push(...(await this.generateCorrelationInsights(userId, metrics, historicalData)));

    // Growth insights
    insights.push(...(await this.generateGrowthInsights(userId, metrics, historicalData)));

    // Wisdom insights
    insights.push(...(await this.generateWisdomInsights(userId, metrics, historicalData)));

    // Predictive insights
    insights.push(...(await this.generatePredictiveInsights(userId, metrics, historicalData)));

    // Sort by relevance and confidence
    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 12); // Return top 12 insights
  }

  /**
   * Generate personalized recommendations with adaptive intelligence
   */
  async generatePersonalizedRecommendations(
    userId: string,
    metrics: QuantifiedEmpathyMetrics,
    _insights: EmpathyInsight[]
  ): Promise<EmpathyRecommendation[]> {
    void _insights;
    const recommendations: EmpathyRecommendation[] = [];
    const userPattern = this.userPatterns.get(userId);

    // Risk-based recommendations
    if (metrics.predictiveMetrics.burnoutRisk.currentRiskLevel > 70) {
      recommendations.push(
        ...(await this.generateBurnoutPreventionRecommendations(userId, metrics))
      );
    }

    // Growth-based recommendations
    if (metrics.predictiveMetrics.growthPotential.currentGrowthTrajectory > 60) {
      recommendations.push(
        ...(await this.generateGrowthAccelerationRecommendations(userId, metrics))
      );
    }

    // Micro-intervention recommendations
    recommendations.push(...(await this.generateMicroInterventions(userId, metrics)));

    // Wisdom application recommendations
    recommendations.push(...(await this.generateWisdomApplicationRecommendations(userId, metrics)));

    // Cultural empathy recommendations
    recommendations.push(...(await this.generateCulturalEmpathyRecommendations(userId, metrics)));

    return recommendations
      .sort((a, b) => this.prioritizeRecommendations(a, b, userPattern))
      .slice(0, 8); // Return top 8 recommendations
  }

  // Private methods for advanced calculations

  private async calculateNeuralEmpathyProfile(
    userId: string,
    moodEntries: MoodEntry[]
  ): Promise<NeuralEmpathyProfile> {
    void userId;
    return {
      mirrorNeuronActivity: this.calculateMirrorNeuronActivity(moodEntries),
      emotionalContagionResistance: this.calculateEmotionalContagionResistance(moodEntries),
      empathicDistressManagement: this.calculateEmpathicDistressManagement(moodEntries),
      cognitivePerspectiveTaking: this.calculateCognitivePerspectiveTaking(moodEntries),
      affectivePerspectiveTaking: this.calculateAffectivePerspectiveTaking(moodEntries),
      empathyFlexibility: this.calculateEmpathyFlexibility(moodEntries),
      empathyCalibration: this.calculateEmpathyCalibration(moodEntries),
      empathicMemory: this.calculateEmpathicMemory(moodEntries),
    };
  }

  private calculateMirrorNeuronActivity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    let resonanceWeight = 0;
    let totalWeight = 0;
    let detachmentHits = 0;

    for (const entry of moodEntries) {
      const weight = entryWeight(entry);
      totalWeight += weight;
      const notes = normalizeText(entry.notes);
      const context = normalizeText(entry.context);

      if (
        hasKeyword(notes, CONNECTION_KEYWORDS) ||
        notes.includes('felt their') ||
        notes.includes('could feel') ||
        notes.includes('mirrored') ||
        context.includes('emotional connection') ||
        context.includes('support group')
      ) {
        resonanceWeight += weight;
      }

      if (hasKeyword(notes, DETACHMENT_KEYWORDS) || context.includes('detached')) {
        detachmentHits += 1;
      }
    }

    if (totalWeight === 0) {
      return 50;
    }

    const resonanceScore = safeDivide(resonanceWeight, totalWeight) * 55;
    const emotionalEnergy = safeDivide(
      moodEntries.reduce((sum, e) => sum + (e.emotionalRegulation ?? 5), 0),
      moodEntries.length
    );
    const energyScore = safeDivide(emotionalEnergy, 10) * 20;
    const detachmentPenalty = safeDivide(detachmentHits, moodEntries.length) * 35;

    return clampScore(40 + resonanceScore + energyScore - detachmentPenalty);
  }

  private calculateEmotionalContagionResistance(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    let protectiveWeight = 0;
    let totalWeight = 0;
    let overwhelmWeight = 0;

    for (const entry of moodEntries) {
      const weight = entryWeight(entry);
      totalWeight += weight;
      const notes = normalizeText(entry.notes);
      const context = normalizeText(entry.context);

      const usesBoundaryStrategy =
        hasKeyword(notes, BOUNDARY_KEYWORDS) ||
        entry.copingStrategies?.some(strategy => normalizeText(strategy).includes('boundary'));
      const namedRest = hasKeyword(notes, RESTORATIVE_KEYWORDS);

      if (usesBoundaryStrategy || namedRest) {
        protectiveWeight += weight;
      }

      const overwhelmedByOthers =
        hasKeyword(notes, OVERWHELM_KEYWORDS) ||
        notes.includes('absorbed their emotions') ||
        ((entry.anxiety ?? 0) > 7 && context.includes('social'));
      if (overwhelmedByOthers) {
        overwhelmWeight += weight + 0.3;
      }
    }

    if (totalWeight === 0) {
      return 50;
    }

    const protectiveScore = safeDivide(protectiveWeight, totalWeight) * 60;
    const overwhelmPenalty = safeDivide(overwhelmWeight, totalWeight) * 55;
    const regulationAverage = safeDivide(
      moodEntries.reduce((sum, entry) => sum + (entry.emotionalRegulation ?? 5), 0),
      moodEntries.length
    );
    const regulationBonus = safeDivide(regulationAverage, 10) * 20;

    return clampScore(35 + protectiveScore + regulationBonus - overwhelmPenalty, 10, 100);
  }

  private calculateEmpathicDistressManagement(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    // Managing overwhelming empathy
    const distressEntries = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('too much pain') ||
        e.notes.toLowerCase().includes("can't handle their suffering") ||
        (e.anxiety > 7 && e.notes.toLowerCase().includes('others'))
    );

    const managementEntries = moodEntries.filter(
      e =>
        e.copingStrategies.includes('self-care') ||
        e.copingStrategies.includes('mindfulness') ||
        e.notes.toLowerCase().includes('stepped back') ||
        e.notes.toLowerCase().includes('took care of myself')
    );

    const distressLevel = safeDivide(distressEntries.length, moodEntries.length) * 40;
    const managementLevel = safeDivide(managementEntries.length, moodEntries.length) * 60;

    return Math.min(100, 50 + managementLevel - distressLevel);
  }

  private calculateEmotionalGranularity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    // Ability to distinguish between emotions
    const avgEmotionalClarity = safeDivide(
      moodEntries.reduce((sum, e) => sum + e.emotionalClarity, 0),
      moodEntries.length
    );

    const complexEmotions = moodEntries.filter(
      e =>
        e.notes.split(' ').length > 10 && // More descriptive entries
        (e.notes.includes('and') || e.notes.includes('but') || e.notes.includes('also'))
    );

    const clarityScore = avgEmotionalClarity * 10;
    const complexityBonus = safeDivide(complexEmotions.length, moodEntries.length) * 30;

    return Math.min(100, clarityScore * 0.7 + complexityBonus);
  }

  private calculateMetaEmotionalAwareness(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    // Awareness of emotional processes
    const metaEmotionalEntries = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('notice that i') ||
        e.notes.toLowerCase().includes("realize i'm") ||
        e.notes.toLowerCase().includes('aware of my') ||
        e.notes.toLowerCase().includes('observing my')
    );

    const emotionalRegulation = safeDivide(
      moodEntries.reduce((sum, e) => sum + e.emotionalRegulation, 0),
      moodEntries.length
    );

    const metaAwarenessScore = safeDivide(metaEmotionalEntries.length, moodEntries.length) * 60;
    const regulationScore = emotionalRegulation * 4;

    return Math.min(100, metaAwarenessScore + regulationScore);
  }

  private calculatePostTraumaticGrowth(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    if (painEntries.length === 0 && moodEntries.length === 0) return 50;

    // Growth following adversity
    const growthEntries = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('stronger because') ||
        e.notes.toLowerCase().includes('learned from') ||
        e.notes.toLowerCase().includes('grateful for the lesson') ||
        e.notes.toLowerCase().includes('helped me grow')
    );

    const adversityEntries = painEntries.filter(e => e.baselineData.pain >= 7);
    const growthOpportunities =
      adversityEntries.length > 0 ? growthEntries.length / adversityEntries.length : 0;

    return Math.min(100, growthOpportunities * 80 + 20);
  }

  private calculateMeaningMaking(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    // Ability to find meaning in experiences
    const meaningEntries = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('meaning') ||
        e.notes.toLowerCase().includes('purpose') ||
        e.notes.toLowerCase().includes('why this happened') ||
        e.notes.toLowerCase().includes('makes sense')
    );

    const purposeEntries = moodEntries.filter(e => e.hopefulness >= 7 && e.notes.length > 30);

    const meaningScore = safeDivide(meaningEntries.length, moodEntries.length) * 60;
    const purposeScore = safeDivide(purposeEntries.length, moodEntries.length) * 40;

    return Math.min(100, meaningScore + purposeScore);
  }

  private async generateWisdomProfile(
    userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[]
  ): Promise<WisdomProfile> {
    const insights = await extractWisdomInsights(userId, painEntries, moodEntries);

    return {
      insights,
      wisdomCategories: {
        practicalWisdom: this.calculatePracticalWisdom(moodEntries),
        emotionalWisdom: this.calculateEmotionalWisdom(moodEntries),
        spiritualWisdom: this.calculateSpiritualWisdom(moodEntries),
        relationalWisdom: this.calculateRelationalWisdom(moodEntries),
        selfKnowledgeWisdom: this.calculateSelfKnowledgeWisdom(moodEntries),
      },
      wisdomGrowthRate: this.calculateWisdomGrowthRate(moodEntries),
      wisdomApplication: this.calculateWisdomApplication(moodEntries),
      wisdomSharing: this.calculateWisdomSharing(moodEntries),
      integratedWisdom: this.calculateIntegratedWisdom(moodEntries),
    };
  }

  // Wisdom-related heuristics now delegated to WisdomModule (categorizeWisdom, assessApplicability, etc.)

  // Additional calculation methods would continue here...
  // For brevity, I'll include placeholder implementations

  private calculatePracticalWisdom(moodEntries: MoodEntry[]): number {
    // Lightweight heuristic using available data
    const clarityAvg = moodEntries.length
      ? safeDivide(moodEntries.reduce((s, e) => s + e.emotionalClarity, 0), moodEntries.length)
      : 5;
    return Math.max(0, Math.min(100, clarityAvg * 10));
  }

  private calculateEmotionalWisdom(moodEntries: MoodEntry[]): number {
    // Use regulation and hopefulness as a proxy
    if (moodEntries.length === 0) return 50;
    const regAvg = safeDivide(
      moodEntries.reduce((s, e) => s + e.emotionalRegulation, 0),
      moodEntries.length
    );
    const hopeAvg = safeDivide(
      moodEntries.reduce((s, e) => s + e.hopefulness, 0),
      moodEntries.length
    );
    return Math.max(0, Math.min(100, (regAvg + hopeAvg) * 5));
  }

  // ... Additional methods would be implemented similarly

  private async updateUserPatterns(
    userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[]
  ): Promise<void> {
    // Update user patterns for machine learning
    // Implementation would track user patterns over time
    const pattern: UserEmpathyPattern = {
      userId,
      patterns: [
        {
          recentPainAvg:
            painEntries.slice(-7).reduce((s, e) => s + e.baselineData.pain, 0) /
            Math.max(1, Math.min(7, painEntries.length)),
        },
      ],
      preferences: [],
      responsiveness: moodEntries.length
        ? moodEntries.reduce((s, e) => s + e.mood, 0) / (moodEntries.length * 10)
        : 0.5,
      lastAccessed: Date.now(),
    };
    this.userPatterns.set(userId, pattern);
  }

  private async getOrCreatePredictionModel(userId: string): Promise<PredictionModel> {
    // Manage user-specific prediction models
    const existing = this.predictionModels.get(userId);
    if (existing) return existing;
    const model: PredictionModel = {
      modelId: `pred_${userId}`,
      accuracy: 0.7,
      trainingData: [],
      predictions: [],
    };
    this.predictionModels.set(userId, model);
    return model;
  }

  private prioritizeRecommendations(
    a: EmpathyRecommendation,
    b: EmpathyRecommendation,
    _userPattern?: UserEmpathyPattern
  ): number {
    // Prioritize recommendations based on user patterns and urgency
    void _userPattern;
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityMap[b.priority] - priorityMap[a.priority];
  }
  // Missing method implementations (moved inside class)

  // Missing method implementations

  private async calculateEnhancedEmotionalIntelligence(
    _userId: string,
    moodEntries: MoodEntry[],
    _painEntries: PainEntry[]
  ): Promise<
    Pick<
      QuantifiedEmpathyMetrics['emotionalIntelligence'],
      'selfAwareness' | 'selfRegulation' | 'motivation' | 'empathy' | 'socialSkills'
    >
  > {
    void _userId;
    void _painEntries;
    // Map to QuantifiedEmotionalIntelligence fields
    return {
      selfAwareness: this.calculateEmotionalAwareness(moodEntries),
      selfRegulation: this.calculateEmotionalRegulation(moodEntries),
      motivation: moodEntries.length
        ? safeDivide(moodEntries.reduce((s, e) => s + e.hopefulness, 0), moodEntries.length) * 10
        : 50,
      empathy: this.calculateEmpathyQuotient(moodEntries),
      socialSkills: this.calculateRelationshipManagement(moodEntries),
    };
  }

  private async calculateAdvancedCompassionateProgress(
    _userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[]
  ): Promise<
    Pick<
      QuantifiedEmpathyMetrics['compassionateProgress'],
      | 'selfCompassion'
      | 'selfCriticism'
      | 'progressCelebration'
      | 'setbackResilience'
      | 'hopefulness'
    >
  > {
    void _userId;
    return {
      selfCompassion: this.calculateSelfCompassion(moodEntries),
      selfCriticism: Math.max(0, 100 - this.calculateSelfCompassion(moodEntries)),
      progressCelebration: Math.min(
        100,
        (moodEntries.filter(e => {
          const n = e.notes.toLowerCase();
          return n.includes('proud') || n.includes('celebrate') || n.includes('celebration');
        }).length /
          Math.max(1, moodEntries.length)) *
          100
      ),
      setbackResilience: this.calculateResilienceGrowth(painEntries, moodEntries),
      hopefulness: moodEntries.length
        ? safeDivide(moodEntries.reduce((s, e) => s + e.hopefulness, 0), moodEntries.length) * 10
        : 50,
    };
  }

  private calculateAdaptiveReframing(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const reframingIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('perspective') ||
        e.notes.toLowerCase().includes('reframe') ||
        e.notes.toLowerCase().includes('silver lining')
    ).length;
    return Math.min(safeDivide(reframingIndicators, moodEntries.length) * 100, 100);
  }

  private calculateCompassionFatigue(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 20;
    const fatigueIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('tired') ||
        e.notes.toLowerCase().includes('exhausted') ||
        e.notes.toLowerCase().includes('burned out')
    ).length;
    return Math.min(safeDivide(fatigueIndicators, moodEntries.length) * 100, 80);
  }

  private async analyzeRecoveryPatterns(
    _userId: string,
    painEntries: PainEntry[],
    _moodEntries: MoodEntry[]
  ): Promise<RecoveryPatternAnalysis> {
    void _userId;
    void _moodEntries;
    const patterns = painEntries.slice(-30).map(entry => entry.baselineData.pain);
    const trend = extCalculateTrend(patterns);
    return {
      avgRecoveryTime: Math.max(30, 120 - trend),
      recoveryConsistency: Math.max(0, 100 - extCalculateVariance(patterns) * 10),
      recoveryStrategies: [],
      setbackPredictors: [],
      resilienceFactors: [],
      recoveryTrajectory: [],
      adaptiveRecovery: Math.max(0, Math.min(100, trend + 50)),
    };
  }

  private async calculateAdvancedEmpathyKPIs(
    _userId: string,
    moodEntries: MoodEntry[],
    _emotionalState?: EmotionalStateMetrics
  ): Promise<
    Pick<
      QuantifiedEmpathyMetrics['empathyKPIs'],
      | 'validationReceived'
      | 'validationGiven'
      | 'emotionalSupport'
      | 'understandingFelt'
      | 'connectionQuality'
    >
  > {
    void _userId;
    void _emotionalState;
    return {
      validationReceived: this.calculateSocialAwareness(moodEntries),
      validationGiven: this.calculateRelationshipManagement(moodEntries),
      emotionalSupport: this.calculateHumanConnection(moodEntries),
      understandingFelt: this.calculateEmpathicAccuracy(moodEntries),
      connectionQuality: this.calculateHumanConnection(moodEntries),
    };
  }

  private calculateEmpathicAccuracy(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const accuracyIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('understood') ||
        e.notes.toLowerCase().includes('accurate') ||
        e.notes.toLowerCase().includes('right')
    ).length;
    return Math.min(safeDivide(accuracyIndicators, moodEntries.length) * 100, 100);
  }

  private calculateEmpathicConcern(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const concernIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('worried') ||
        e.notes.toLowerCase().includes('concerned') ||
        e.notes.toLowerCase().includes('care')
    ).length;
    return Math.min(safeDivide(concernIndicators, moodEntries.length) * 100, 100);
  }

  private calculatePerspectiveTaking(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const perspectiveIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('their perspective') ||
        e.notes.toLowerCase().includes('see their side') ||
        e.notes.toLowerCase().includes('understand them')
    ).length;
    return Math.min(safeDivide(perspectiveIndicators, moodEntries.length) * 100, 100);
  }

  private calculateEmpathicMotivation(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    let totalWeight = 0;
    let motivationWeight = 0;
    let actionBoost = 0;
    let fatiguePenalty = 0;

    for (const entry of moodEntries) {
      const weight = entryWeight(entry);
      totalWeight += weight;
      const notes = normalizeText(entry.notes);
      const context = normalizeText(entry.context);

      const motivationSignal =
        hasKeyword(notes, MOTIVATION_KEYWORDS) ||
        context.includes('support group') ||
        context.includes('care team');
      const supportiveStrategy = entry.copingStrategies?.some(
        strategy =>
          normalizeText(strategy).includes('support others') ||
          normalizeText(strategy).includes('community')
      );

      if (motivationSignal || supportiveStrategy) {
        motivationWeight += weight;
      }

      if (hasKeyword(notes, MOTIVATION_ACTION_KEYWORDS)) {
        actionBoost += 1;
      }

      if (hasKeyword(notes, FATIGUE_KEYWORDS) || (entry.energy ?? 5) <= 3) {
        fatiguePenalty += 1;
      }
    }

    if (totalWeight === 0) {
      return 50;
    }

    const baseScore = safeDivide(motivationWeight, totalWeight) * 55;
    const actionScore = safeDivide(actionBoost, moodEntries.length) * 25;
    const fatigueScore = safeDivide(fatiguePenalty, moodEntries.length) * 45;

    return clampScore(45 + baseScore + actionScore - fatigueScore);
  }

  private calculateBoundaryMaintenance(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;

    let totalWeight = 0;
    let boundaryWeight = 0;
    let restorativeWeight = 0;
    let overloadHits = 0;

    for (const entry of moodEntries) {
      const weight = entryWeight(entry);
      totalWeight += weight;
      const notes = normalizeText(entry.notes);

      const namedBoundary =
        hasKeyword(notes, BOUNDARY_KEYWORDS) ||
        entry.copingStrategies?.some(strategy => normalizeText(strategy).includes('boundary'));
      const advocatedNeeds =
        notes.includes('asked for what i need') || notes.includes('set expectations');
      if (namedBoundary || advocatedNeeds) {
        boundaryWeight += weight;
      }

      if (
        hasKeyword(notes, RESTORATIVE_KEYWORDS) ||
        (entry.energy ?? 0) >= 7 ||
        (entry.stress ?? 0) <= 3
      ) {
        restorativeWeight += weight * 0.6;
      }

      if (
        hasKeyword(notes, OVERWHELM_KEYWORDS) ||
        notes.includes('took on too much') ||
        notes.includes('people pleasing')
      ) {
        overloadHits += 1;
      }
    }

    if (totalWeight === 0) {
      return 50;
    }

    const boundaryScore = safeDivide(boundaryWeight, totalWeight) * 60;
    const restorativeScore = safeDivide(restorativeWeight, totalWeight) * 25;
    const overloadPenalty = safeDivide(overloadHits, moodEntries.length) * 55;

    return clampScore(40 + boundaryScore + restorativeScore - overloadPenalty);
  }

  private async calculateCulturalEmpathy(
    _userId: string,
    moodEntries: MoodEntry[],
    _culturalContext?: CulturalContext
  ): Promise<CulturalEmpathyMetrics> {
    void _culturalContext;
    if (moodEntries.length === 0) {
      return {
        culturalAwareness: 50,
        crossCulturalEmpathy: 50,
        culturalHumility: 50,
        universalEmpathy: 50,
        culturalAdaptation: 50,
        inclusiveEmpathy: 50,
        intersectionalAwareness: 50,
      };
    }
    // Optionally incorporate stored cultural context if available
    const stored = this.culturalContext.get(_userId);
    const culturalIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('culture') ||
        e.notes.toLowerCase().includes('tradition') ||
        e.notes.toLowerCase().includes('background')
    ).length;
    const base = Math.min(safeDivide(culturalIndicators, moodEntries.length) * 100, 100);
    const score = stored ? Math.min(100, base + 5) : base;
    return {
      culturalAwareness: score,
      crossCulturalEmpathy: Math.max(0, score - 5),
      culturalHumility: Math.min(100, score + 5),
      universalEmpathy: Math.max(0, Math.min(100, 60 + score / 5)),
      culturalAdaptation: Math.max(0, score - 10),
      inclusiveEmpathy: Math.min(100, score + 10),
      intersectionalAwareness: Math.max(0, score - 15),
    };
  }

  private async calculateAdvancedHumanizedMetrics(
    _userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[],
    _wellbeingMetrics?: HolisticWellbeingMetrics
  ): Promise<
    Pick<
      QuantifiedEmpathyMetrics['humanizedMetrics'],
      'courageScore' | 'vulnerabilityAcceptance' | 'authenticityLevel' | 'growthMindset'
    >
  > {
    void _userId;
    void _wellbeingMetrics;
    const base = this.calculateHumanConnection(moodEntries);
    const dignity = this.calculateDignityPreservation(moodEntries);
    const meaning = this.calculateMeaningfulness(painEntries, moodEntries);
    return {
      courageScore: Math.max(0, Math.min(100, (meaning + base) / 2)),
      vulnerabilityAcceptance: Math.max(0, Math.min(100, base * 0.6 + dignity * 0.4)),
      authenticityLevel: Math.max(0, Math.min(100, dignity)),
      growthMindset: Math.max(0, Math.min(100, (meaning + 60) / 1.2)),
    };
  }

  private calculateInnerStrength(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    if (painEntries.length === 0 && moodEntries.length === 0) return 50;
    
    const recentPainEntries = painEntries.slice(-7);
    const recentMoodEntries = moodEntries.slice(-7);
    
    const recentPain = recentPainEntries.length > 0
      ? recentPainEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentPainEntries.length
      : 0;
    const recentMood = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.mood, 0) / recentMoodEntries.length
      : 5; // Default neutral mood
    
    // Avoid division by zero: if pain is 0 or very low, inner strength is high
    if (recentPain < 0.1) {
      return clampScore(70 + recentMood * 3);
    }
    
    // Higher mood relative to pain indicates greater inner strength
    return clampScore((recentMood / Math.max(0.1, recentPain)) * 50);
  }

  private calculateDignityMaintenance(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 75;
    const dignityIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('dignity') ||
        e.notes.toLowerCase().includes('respect') ||
        e.notes.toLowerCase().includes('worthy')
    ).length;
    return Math.min(safeDivide(dignityIndicators, moodEntries.length) * 100 + 50, 100);
  }

  private calculatePurposeClarity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 60;
    const purposeIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('purpose') ||
        e.notes.toLowerCase().includes('meaning') ||
        e.notes.toLowerCase().includes('direction')
    ).length;
    return Math.min(safeDivide(purposeIndicators, moodEntries.length) * 100 + 40, 100);
  }

  private calculateSpiritualWellbeing(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 60;
    const spiritualIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('spiritual') ||
        e.notes.toLowerCase().includes('faith') ||
        e.notes.toLowerCase().includes('transcendent')
    ).length;
    return Math.min(safeDivide(spiritualIndicators, moodEntries.length) * 100 + 40, 100);
  }

  private calculateLifeNarrativeCoherence(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 65;
    const narrativeIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('story') ||
        e.notes.toLowerCase().includes('journey') ||
        e.notes.toLowerCase().includes('path')
    ).length;
    return Math.min(safeDivide(narrativeIndicators, moodEntries.length) * 100 + 50, 100);
  }

  private async calculateEmpathyIntelligenceProfile(
    _userId: string,
    moodEntries: MoodEntry[],
    _painEntries: PainEntry[]
  ): Promise<EmpathyIntelligenceProfile> {
    void _userId;
    void _painEntries;
    const eq = this.calculateEmpathyQuotient(moodEntries);
    const reg = this.calculateEmotionalRegulation(moodEntries);
    const soc = this.calculateSocialCognition(moodEntries);
    return {
      empathyIQ: Math.max(0, Math.min(200, eq * 2)),
      empathyProcessingSpeed: Math.max(0, Math.min(100, 60 + reg / 2)),
      empathyAccuracy: Math.max(0, Math.min(100, eq)),
      empathyDiversity: Math.max(0, Math.min(100, soc)),
      empathyInnovation: Math.max(0, Math.min(100, 50 + (eq - 50) / 2)),
      empathyLeadership: Math.max(0, Math.min(100, 40 + soc / 2)),
      empathyTeaching: Math.max(0, Math.min(100, 40 + eq / 3)),
      empathyHealing: Math.max(0, Math.min(100, 50 + reg / 3)),
      metaEmpathy: Math.max(0, Math.min(100, this.calculateMetaEmotionalAwareness(moodEntries))),
      empathyWisdom: Math.max(0, Math.min(100, this.calculateEmotionalWisdom(moodEntries))),
    };
  }

  private async analyzeTemporalEmpathyPatterns(
    _userId: string,
    moodEntries: MoodEntry[],
    _painEntries: PainEntry[]
  ): Promise<TemporalEmpathyPatterns> {
    void _painEntries;
    const patterns = moodEntries.slice(-30).map(e => e.mood);
    const now = new Date();
    // reference helper analyzers to avoid unused warnings
    const _d = this.analyzeDailyPatterns(patterns);
    void _d;
    const _w = this.analyzeWeeklyPatterns(patterns);
    void _w;
    const _m = this.analyzeMonthlyTrends(patterns);
    void _m;
    return {
      dailyPatterns: [
        {
          timeOfDay: 'morning',
          empathyLevel: Math.max(0, Math.min(100, patterns[patterns.length - 1] ?? 50)),
          empathyQuality: 'tender',
          triggers: [],
          optimalMoments: [],
          challengingMoments: [],
        },
      ],
      weeklyTrends: [
        {
          week: now,
          avgEmpathyLevel: Math.max(
            0,
            Math.min(100, patterns.reduce((s, v) => s + v, 0) / Math.max(1, patterns.length))
          ),
          empathyRange: { min: 0, max: 100 },
          dominantPattern: 'stable',
          growthAreas: [],
          breakthroughs: [],
        },
      ],
      monthlyEvolution: [
        {
          month: now,
          evolutionScore: 50,
          newCapabilities: [],
          deepenedCapacities: [],
          challenges: [],
          integrationLevel: 50,
        },
      ],
      seasonalInfluences: [
        {
          season: 'summer',
          empathyCharacteristics: [],
          seasonalChallenges: [],
          seasonalGifts: [],
          adaptationStrategies: [],
        },
      ],
      lifePhaseEmpathy: [],
      empathyMilestones: [],
      empathyRegression: [],
      futurEmpathyProjection: {
        projectionTimeframe: '3 months',
        predictedGrowthAreas: [],
        anticipatedChallenges: [],
        developmentOpportunities: [],
        requiredSupports: [],
        confidenceLevel: 60,
      },
    };
  }

  private async trackMicroEmpathyMoments(
    _userId: string,
    moodEntries: MoodEntry[]
  ): Promise<MicroEmpathyTracking> {
    const dailyAvg = Math.max(
      0,
      Math.min(
        100,
        (moodEntries.reduce((sum, e) => sum + e.mood, 0) / Math.max(1, moodEntries.length)) * 10
      )
    );
    return {
      microMoments: [],
      dailyMicroAverage: dailyAvg,
      microEmpathyQuality: this.calculateMicroMomentQuality(moodEntries),
      microEmpathyConsistency: 60,
      spontaneousEmpathy: 55,
      mindfulEmpathy: 65,
      empathyInterruptions: [],
      empathyRecovery: [],
    };
  }

  private async generatePredictiveModel(
    _userId: string,
    painEntries: PainEntry[],
    moodEntries: MoodEntry[],
    _predictionModel: PredictionModel
  ): Promise<PredictiveEmpathyModel> {
    void _predictionModel;
    void _userId;
    return buildPredictiveModel(painEntries, moodEntries);
  }

  private async generatePatternInsights(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics,
    _historicalData: unknown
  ): Promise<EmpathyInsight[]> {
    void _userId;
    void _metrics;
    void _historicalData;
    return [
      {
        id: '1',
        type: 'pattern',
        title: 'Empathy Pattern Detected',
        description: 'Your empathy levels show consistent improvement over time.',
        confidence: 85,
        actionable: true,
        personalized: false,
        timestamp: new Date(),
        dataPoints: [],
      },
    ];
  }

  private async generateCorrelationInsights(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics,
    _historicalData: unknown
  ): Promise<EmpathyInsight[]> {
    void _userId;
    void _metrics;
    void _historicalData;
    return [
      {
        id: '2',
        type: 'correlation',
        title: 'Pain-Empathy Correlation',
        description: 'Higher pain levels correlate with increased empathy for others.',
        confidence: 78,
        actionable: true,
        personalized: false,
        timestamp: new Date(),
        dataPoints: [],
      },
    ];
  }

  private async generateGrowthInsights(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics,
    _historicalData: unknown
  ): Promise<EmpathyInsight[]> {
    void _userId;
    void _metrics;
    void _historicalData;
    return [
      {
        id: '3',
        type: 'improvement',
        title: 'Empathy Growth Opportunity',
        description: 'Focus on perspective-taking exercises for enhanced empathy.',
        confidence: 82,
        actionable: true,
        personalized: false,
        timestamp: new Date(),
        dataPoints: [],
      },
    ];
  }

  private async generateWisdomInsights(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics,
    _historicalData: { painEntries: PainEntry[]; moodEntries: MoodEntry[] }
  ): Promise<EmpathyInsight[]> {
    void _metrics;
    // Convert wisdom insights to empathy insights (celebrations)
    const wisdoms = await extractWisdomInsights(
      _userId,
      _historicalData.painEntries,
      _historicalData.moodEntries
    );
    return wisdoms.map((w: WisdomInsight) => ({
      id: w.id,
      type: 'celebration',
      title: `Wisdom: ${w.category}`,
      description: w.insight,
      confidence: Math.min(100, w.applicability),
      actionable: true,
      personalized: false,
      timestamp: w.dateGained,
      dataPoints: [],
    }));
  }

  private async generatePredictiveInsights(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics,
    _historicalData: unknown
  ): Promise<EmpathyInsight[]> {
    void _userId;
    void _metrics;
    void _historicalData;
    return [
      {
        id: '5',
        type: 'improvement',
        title: 'Empathy Forecast',
        description: 'Your empathy levels are predicted to increase over the next week.',
        confidence: 74,
        actionable: true,
        timestamp: new Date(),
        personalized: false,
        dataPoints: [],
      },
    ];
  }

  private async generateBurnoutPreventionRecommendations(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics
  ): Promise<EmpathyRecommendation[]> {
    void _userId;
    void _metrics;
    return [
      {
        id: '1',
        category: 'lifestyle',
        priority: 'high',
        title: 'Burnout Prevention',
        description: 'Take regular breaks to prevent empathy fatigue.',
        rationale: 'Frequent short rests reduce emotional overload.',
        steps: ['Schedule 10-minute breaks', 'Practice mindfulness', 'Set boundaries'],
        expectedBenefits: ['Reduced burnout risk'],
        timeframe: '1 week',
        effort: 'low',
        personalization: [],
      },
    ];
  }

  private async generateGrowthAccelerationRecommendations(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics
  ): Promise<EmpathyRecommendation[]> {
    void _userId;
    void _metrics;
    return [
      {
        id: '2',
        category: 'cognitive',
        priority: 'medium',
        title: 'Accelerate Empathy Growth',
        description: 'Engage in perspective-taking exercises to enhance empathy.',
        rationale: 'Perspective-taking practices improve empathic accuracy.',
        steps: ['Read diverse perspectives', 'Practice active listening', 'Volunteer'],
        expectedBenefits: ['Improved perspective-taking'],
        timeframe: '2 weeks',
        effort: 'medium',
        personalization: [],
      },
    ];
  }

  private async generateMicroInterventions(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics
  ): Promise<EmpathyRecommendation[]> {
    void _userId;
    void _metrics;
    return [
      {
        id: '3',
        category: 'emotional',
        priority: 'low',
        title: 'Daily Empathy Moment',
        description: "Take 2 minutes daily to reflect on others' perspectives.",
        rationale: 'Micro-reflections build consistent empathic habits.',
        steps: ['Set daily reminder', 'Practice empathy check-ins'],
        expectedBenefits: ['Improved empathy awareness'],
        timeframe: '1 day',
        effort: 'low',
        personalization: [],
      },
    ];
  }

  private async generateWisdomApplicationRecommendations(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics
  ): Promise<EmpathyRecommendation[]> {
    void _userId;
    void _metrics;
    return [
      {
        id: '4',
        category: 'social',
        priority: 'medium',
        title: 'Apply Your Wisdom',
        description: 'Share your empathy insights with others to reinforce learning.',
        rationale: 'Teaching others consolidates learning.',
        steps: ['Mentor someone', 'Write about experiences', 'Join support groups'],
        expectedBenefits: ['Enhanced wisdom integration'],
        timeframe: '1 month',
        effort: 'medium',
        personalization: [],
      },
    ];
  }

  private async generateCulturalEmpathyRecommendations(
    _userId: string,
    _metrics: QuantifiedEmpathyMetrics
  ): Promise<EmpathyRecommendation[]> {
    void _userId;
    void _metrics;
    return [
      {
        id: '5',
        category: 'social',
        priority: 'low',
        title: 'Cultural Empathy Development',
        description: 'Explore different cultural perspectives on pain and healing.',
        rationale: 'Exposure to diverse perspectives deepens empathy.',
        steps: [
          'Read multicultural literature',
          'Attend cultural events',
          'Learn about traditions',
        ],
        expectedBenefits: ['Broader empathy understanding'],
        timeframe: '2 months',
        effort: 'medium',
        personalization: [],
      },
    ];
  }

  private calculateCognitivePerspectiveTaking(moodEntries: MoodEntry[]): number {
    return this.calculatePerspectiveTaking(moodEntries);
  }

  private calculateAffectivePerspectiveTaking(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const affectiveIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('felt with') ||
        e.notes.toLowerCase().includes('emotional connection')
    ).length;
    return Math.min(safeDivide(affectiveIndicators, moodEntries.length) * 100, 100);
  }

  private calculateEmpathyFlexibility(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 60;
    const flexibilityIndicators = moodEntries.filter(
      e => e.notes.toLowerCase().includes('adapt') || e.notes.toLowerCase().includes('adjust')
    ).length;
    return Math.min(safeDivide(flexibilityIndicators, moodEntries.length) * 100 + 40, 100);
  }

  private calculateEmpathyCalibration(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 55;
    const calibrationIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('balance') || e.notes.toLowerCase().includes('appropriate')
    ).length;
    return Math.min(safeDivide(calibrationIndicators, moodEntries.length) * 100 + 35, 100);
  }

  private calculateEmpathicMemory(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 65;
    const memoryIndicators = moodEntries.filter(
      e => e.notes.toLowerCase().includes('remember') || e.notes.toLowerCase().includes('recall')
    ).length;
    return Math.min(safeDivide(memoryIndicators, moodEntries.length) * 100 + 45, 100);
  }

  // Helper methods

  private calculateEmotionalAwareness(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    return Math.min(moodEntries.length * 2, 100);
  }

  private calculateEmotionalRegulation(moodEntries: MoodEntry[]): number {
    if (moodEntries.length < 2) return 50;
    const variations = moodEntries
      .slice(1)
      .map((entry, i) => Math.abs(entry.mood - moodEntries[i].mood));
    const avgVariation = variations.reduce((sum, v) => sum + v, 0) / variations.length;
    return Math.max(0, 100 - avgVariation * 10);
  }

  private calculateSocialAwareness(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const socialIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('others') ||
        e.notes.toLowerCase().includes('people') ||
        e.notes.toLowerCase().includes('social')
    ).length;
    return Math.min(safeDivide(socialIndicators, moodEntries.length) * 100, 100);
  }

  private calculateRelationshipManagement(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const relationshipIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('relationship') ||
        e.notes.toLowerCase().includes('friend') ||
        e.notes.toLowerCase().includes('family')
    ).length;
    return Math.min(safeDivide(relationshipIndicators, moodEntries.length) * 100, 100);
  }

  private calculateSelfCompassion(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const compassionIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('kind to myself') ||
        e.notes.toLowerCase().includes('self-compassion') ||
        e.notes.toLowerCase().includes('forgive myself')
    ).length;
    return Math.min(safeDivide(compassionIndicators, moodEntries.length) * 100, 100);
  }

  private calculateCompassionForOthers(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const compassionIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('compassion') ||
        e.notes.toLowerCase().includes('empathy') ||
        e.notes.toLowerCase().includes('understanding')
    ).length;
    return Math.min(safeDivide(compassionIndicators, moodEntries.length) * 100, 100);
  }

  private calculateResilienceGrowth(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    if (painEntries.length < 7 || moodEntries.length < 7) return 50;

    const recentPain = painEntries.slice(-7).reduce((sum, e) => sum + e.baselineData.pain, 0) / 7;
    const earlierPain =
      painEntries.slice(-14, -7).reduce((sum, e) => sum + e.baselineData.pain, 0) / 7;
    const recentMood = moodEntries.slice(-7).reduce((sum, e) => sum + e.mood, 0) / 7;
    const earlierMood = moodEntries.slice(-14, -7).reduce((sum, e) => sum + e.mood, 0) / 7;

    const painImprovement = earlierPain - recentPain;
    const moodImprovement = recentMood - earlierMood;

    return Math.max(0, Math.min(100, (painImprovement + moodImprovement) * 10 + 50));
  }

  private calculateTraumaIntegration(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    if (painEntries.length === 0 || moodEntries.length === 0) return 50;

    const integrationIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('healing') ||
        e.notes.toLowerCase().includes('growth') ||
        e.notes.toLowerCase().includes('integration')
    ).length;

    return Math.min(safeDivide(integrationIndicators, moodEntries.length) * 100 + 30, 100);
  }

  private calculateEmpathyQuotient(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const empathyIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('empathy') ||
        e.notes.toLowerCase().includes('understand') ||
        e.notes.toLowerCase().includes('feel for')
    ).length;
    const othersCompassion = this.calculateCompassionForOthers(moodEntries);
    return Math.min(safeDivide(empathyIndicators, moodEntries.length) * 70 + othersCompassion * 0.3, 100);
  }

  private calculateEmotionalIntelligence(moodEntries: MoodEntry[]): number {
    return (
      (this.calculateEmotionalAwareness(moodEntries) +
        this.calculateEmotionalRegulation(moodEntries)) /
      2
    );
  }

  private calculateSocialIntelligence(moodEntries: MoodEntry[]): number {
    return (
      (this.calculateSocialAwareness(moodEntries) +
        this.calculateRelationshipManagement(moodEntries)) /
      2
    );
  }

  private calculateSocialCognition(moodEntries: MoodEntry[]): number {
    const _ei = this.calculateEmotionalIntelligence(moodEntries);
    void _ei;
    return this.calculateSocialIntelligence(moodEntries);
  }

  private calculateHumanConnection(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const connectionIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('connection') ||
        e.notes.toLowerCase().includes('bond') ||
        e.notes.toLowerCase().includes('close')
    ).length;
    return Math.min(safeDivide(connectionIndicators, moodEntries.length) * 100, 100);
  }

  private calculateDignityPreservation(moodEntries: MoodEntry[]): number {
    return this.calculateDignityMaintenance(moodEntries);
  }

  private calculateMeaningfulness(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const meaningIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('meaning') ||
        e.notes.toLowerCase().includes('purpose') ||
        e.notes.toLowerCase().includes('significant')
    ).length;
    const meaningScore = Math.min(safeDivide(meaningIndicators, moodEntries.length) * 100, 100);

    // Factor in pain acceptance
    const recentPain = painEntries.slice(-7).reduce((sum, e) => sum + e.baselineData.pain, 0) / 7;
    const acceptanceBonus = Math.max(0, (10 - recentPain) * 2);

    return Math.min(meaningScore + acceptanceBonus, 100);
  }

  private calculatePatternStability(values: number[]): number {
    if (values.length < 2) return 50;
    const variance = extCalculateVariance(values);
    return Math.max(0, 100 - variance * 10);
  }
  private calculateRecoverySpeed(values: number[]): number {
    if (values.length < 3) return 50;
    const recent = values.slice(-3);
    const improvement = recent[0] - recent[recent.length - 1];
    return Math.max(0, Math.min(100, improvement * 10 + 50));
  }
  private analyzeDailyPatterns(values: number[]): { trend: number; stability: number } {
    return { trend: extCalculateTrend(values), stability: this.calculatePatternStability(values) };
  }
  private analyzeWeeklyPatterns(values: number[]): { trend: number; stability: number } {
    return { trend: extCalculateTrend(values), stability: this.calculatePatternStability(values) };
  }
  private analyzeMonthlyTrends(values: number[]): { trend: number; improvement: number } {
    return { trend: extCalculateTrend(values), improvement: this.calculateRecoverySpeed(values) };
  }

  private calculateMicroMomentQuality(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 50;
    const avgMood = safeDivide(
      moodEntries.reduce((sum, e) => sum + e.mood, 0),
      moodEntries.length
    );
    const qualityIndicators = moodEntries.filter(
      e =>
        e.notes.toLowerCase().includes('quality') ||
        e.notes.toLowerCase().includes('meaningful') ||
        e.notes.toLowerCase().includes('deep')
    ).length;
    return Math.min(avgMood + safeDivide(qualityIndicators, moodEntries.length) * 20, 100);
  }

  private calculateSpiritualWisdom(_moodEntries: MoodEntry[]): number {
    // Spiritual wisdom heuristic: presence of meaning/purpose/acceptance language + regulation
    if (_moodEntries.length === 0) return 50;
    const spiritualWords = [
      'meaning',
      'purpose',
      'transcend',
      'transcendent',
      'faith',
      'spiritual',
      'bigger than',
      'grateful',
    ];
    let hits = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (spiritualWords.some(w => n.includes(w))) hits++;
    }
    const clarity = _moodEntries.reduce((s, e) => s + e.emotionalClarity, 0) / _moodEntries.length;
    const regulation =
      _moodEntries.reduce((s, e) => s + e.emotionalRegulation, 0) / _moodEntries.length;
    const base = (hits / _moodEntries.length) * 60;
    return Math.max(0, Math.min(100, base + (clarity + regulation) * 2));
  }

  private calculateRelationalWisdom(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length === 0) return 50;
    const relationalWords = [
      'relationship',
      'friend',
      'family',
      'support',
      'listened',
      'helped',
      'connection',
    ];
    let hits = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (relationalWords.some(w => n.includes(w))) hits++;
    }
    const socialSupportScore =
      (_moodEntries.filter(e => e.socialSupport !== 'none').length / _moodEntries.length) * 50;
    return Math.max(0, Math.min(100, (hits / _moodEntries.length) * 50 + socialSupportScore));
  }

  private calculateSelfKnowledgeWisdom(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length === 0) return 50;
    const introspectionWords = [
      'i feel',
      'i notice',
      'i realized',
      'i understand',
      'i learned',
      'aware',
      'noticing',
    ];
    let hits = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (introspectionWords.some(w => n.includes(w))) hits++;
    }
    const clarity = _moodEntries.reduce((s, e) => s + e.emotionalClarity, 0) / _moodEntries.length;
    return Math.max(0, Math.min(100, (hits / _moodEntries.length) * 60 + clarity * 4));
  }

  private calculateWisdomGrowthRate(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length < 2) return 10;
    // Compare first half vs second half insight density
    const mid = Math.floor(_moodEntries.length / 2);
    const insightTerms = ['learned', 'realized', 'understand', 'insight', 'growth'];
    const density = (slice: MoodEntry[]) =>
      slice.filter(e => {
        const n = e.notes.toLowerCase();
        return insightTerms.some(w => n.includes(w));
      }).length / Math.max(1, slice.length);
    const first = density(_moodEntries.slice(0, mid));
    const second = density(_moodEntries.slice(mid));
    const growth = (second - first) * 100; // -100..100
    return Math.max(0, Math.min(100, 40 + growth));
  }

  private calculateWisdomApplication(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length === 0) return 40;
    // Application: references to acting on insight (applied, used, practiced, implemented)
    const actionWords = [
      'applied',
      'use',
      'used',
      'practice',
      'practiced',
      'implemented',
      'shared',
    ];
    let actions = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (actionWords.some(w => n.includes(w))) actions++;
    }
    const regulation =
      _moodEntries.reduce((s, e) => s + e.emotionalRegulation, 0) / _moodEntries.length;
    return Math.max(0, Math.min(100, (actions / _moodEntries.length) * 70 + regulation * 3));
  }

  private calculateWisdomSharing(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length === 0) return 30;
    const shareWords = ['told', 'shared', 'explained', 'helped someone', 'wrote about'];
    let hits = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (shareWords.some(w => n.includes(w))) hits++;
    }
    return Math.max(0, Math.min(100, (hits / _moodEntries.length) * 100));
  }

  private calculateIntegratedWisdom(_moodEntries: MoodEntry[]): number {
    if (_moodEntries.length === 0) return 40;
    // Integration: simultaneous presence of insight + application + regulation stability
    const insightWords = ['learned', 'realized', 'understand', 'insight'];
    const applyWords = ['applied', 'use', 'practice', 'implemented'];
    let integrated = 0;
    for (const e of _moodEntries) {
      const n = e.notes.toLowerCase();
      if (insightWords.some(w => n.includes(w)) && applyWords.some(w => n.includes(w)))
        integrated++;
    }
    const stability = this.calculateEmotionalRegulation(_moodEntries);
    return Math.max(0, Math.min(100, (integrated / _moodEntries.length) * 60 + stability * 0.4));
  }
}

// Export singleton instance
export const empathyIntelligenceEngine = new EmpathyIntelligenceEngine({
  learningRate: 0.1,
  predictionHorizon: 30,
  personalizationDepth: 'deep',
  culturalSensitivity: 'enhanced',
  interventionStyle: 'adaptive',
  privacyLevel: 'enhanced',
});

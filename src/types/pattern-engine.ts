/**
 * Advanced Pattern Recognition Engine Types
 *
 * Comprehensive type definitions for heuristic-based pain trend analysis,
 * trigger/symptom correlations, episode detection, and Quality of Life insights.
 * All analysis runs locally - no cloud dependencies.
 */

import type { PainEntry } from './pain-tracker';

// ============================================================================
// Core Data Types
// ============================================================================

export type PainIntensity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TrendResolution = 'daily' | 'weekly' | 'episode';

export type CorrelationStrength = 'none' | 'weak' | 'moderate' | 'strong';

export type CorrelationDirection = 'increases' | 'decreases' | 'neutral';

export type QoLMetric = 'sleep' | 'mood' | 'activity' | 'fatigue';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

// ============================================================================
// Time Series & Trends
// ============================================================================

/**
 * Single point in a time-series trend
 */
export interface TrendPoint {
  /** Date string (YYYY-MM-DD for daily/weekly) */
  date: string;
  /** Aggregated value (e.g., average pain) */
  value: number;
  /** Number of entries contributing to this point */
  count: number;
  /** Min/max range for visualization */
  range?: [number, number];
  /** Optional standard deviation */
  stdDev?: number;
}

/**
 * Complete trend data for a given resolution
 */
export interface TrendSeries {
  resolution: TrendResolution;
  points: TrendPoint[];
  /** Overall direction: positive = worsening, negative = improving */
  slope: number;
  /** Baseline value for comparison */
  baseline: number;
  /** Data quality/coverage assessment */
  confidence: ConfidenceLevel;
}

// ============================================================================
// Episode Detection (Flares & Patterns)
// ============================================================================

/**
 * Detected pain episode (flare or extended period)
 */
export interface PainEpisode {
  id: string;
  /** Start date (ISO string) */
  start: string;
  /** End date (ISO string) */
  end: string;
  /** Peak pain intensity during episode */
  peakPain: PainIntensity;
  /** Average pain across episode */
  avgPain: number;
  /** Number of entries in this episode */
  entryCount: number;
  /** Days to return to baseline after episode end (null if ongoing) */
  recoveryDays: number | null;
  /** Duration in days */
  durationDays: number;
  /** Episode classification */
  severity: 'mild' | 'moderate' | 'severe';
  /** Common triggers during this episode */
  associatedTriggers: string[];
  /** Common locations during this episode */
  associatedLocations: string[];
}

// ============================================================================
// Correlation Analysis
// ============================================================================

/**
 * Correlation between a trigger/symptom and pain levels
 */
export interface TriggerCorrelation {
  /** Trigger/symptom identifier */
  key: string;
  /** Human-readable label */
  label: string;
  /** Average pain delta when present vs absent */
  deltaPain: number;
  /** Number of observations where present */
  support: number;
  /** Confidence score (0-1) - how stable is this pattern */
  confidence: number;
  /** Correlation strength bucket */
  strength: CorrelationStrength;
  /** Direction of effect */
  direction: CorrelationDirection;
  /** Lag in days (for delayed effects, e.g., sleep affecting next-day pain) */
  lagDays?: number;
  /** Stability score: how consistently does this pattern hold */
  stabilityScore?: number;
}

/**
 * Bundle of triggers that correlate together
 */
export interface TriggerBundle {
  id: string;
  /** Triggers that co-occur */
  triggers: string[];
  /** Combined effect when bundle is present */
  combinedDelta: number;
  /** Co-occurrence frequency */
  coOccurrence: number;
  /** Strength of bundle effect */
  strength: CorrelationStrength;
}

// ============================================================================
// Quality of Life Patterns
// ============================================================================

/**
 * Quality of Life pattern insight
 */
export interface QoLPattern {
  id: string;
  /** Human-readable description */
  description: string;
  /** Which QoL dimension this relates to */
  metric: QoLMetric;
  /** Correlation with pain */
  correlation: CorrelationStrength;
  /** Number of supporting observations */
  evidenceCount: number;
  /** Average change in pain when QoL metric shifts */
  delta: number;
  /** Confidence in this pattern */
  confidence: ConfidenceLevel;
  /** Specific threshold or condition detected */
  condition?: string;
  /** Lag (e.g., poor sleep correlates with next-day pain) */
  lagDays?: number;
}

/**
 * QoL vs Pain dissonance detection
 */
export interface QoLDissonance {
  type: 'pain_stable_qol_declining' | 'pain_high_activity_high' | 'pain_improving_qol_stagnant';
  description: string;
  painTrend: 'improving' | 'stable' | 'worsening';
  qolTrend: 'improving' | 'stable' | 'declining';
  affectedMetrics: QoLMetric[];
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

// ============================================================================
// Insight Metadata
// ============================================================================

/**
 * Metadata for any generated insight
 */
export interface InsightMeta {
  /** Time window analyzed */
  dataWindow: {
    start: string;
    end: string;
  };
  /** Number of entries analyzed */
  entryCount: number;
  /** Quality/completeness of data */
  dataQuality: ConfidenceLevel;
  /** Warnings or caveats about the insight */
  cautions: string[];
  /** When this insight was generated */
  generatedAt: string;
}

// ============================================================================
// Pattern Engine Configuration
// ============================================================================

/**
 * Configuration for pattern analysis engine
 */
export interface PatternEngineConfig {
  /** Minimum entries required to compute trends */
  minEntriesForTrend: number;
  /** Minimum support count to surface a correlation */
  minSupportForCorrelation: number;
  /** Minimum confidence (0-1) to display a correlation */
  minConfidenceForDisplay: number;
  /** Pain threshold for episode detection (e.g., >= 6) */
  episodePainThreshold: number;
  /** Minimum consecutive days for an episode */
  episodeMinLengthDays: number;
  /** Days to look back for baseline calculation */
  baselineWindowDays: number;
  /** Enable lagged correlation detection (e.g., sleep -> next-day pain) */
  enableLaggedCorrelations: boolean;
  /** Maximum lag to test (in days) */
  maxLagDays: number;
  /** Enable QoL dissonance detection */
  enableQoLDissonance: boolean;
}

/**
 * Default conservative configuration
 */
export const DEFAULT_PATTERN_CONFIG: PatternEngineConfig = {
  minEntriesForTrend: 7,
  minSupportForCorrelation: 8,
  minConfidenceForDisplay: 0.6,
  episodePainThreshold: 6,
  episodeMinLengthDays: 2,
  baselineWindowDays: 30,
  enableLaggedCorrelations: true,
  maxLagDays: 3,
  enableQoLDissonance: true,
};

// ============================================================================
// Complete Pattern Analysis Result
// ============================================================================

/**
 * Comprehensive result from pattern analysis engine
 */
export interface PatternAnalysisResult {
  /** Original entries (filtered/cleaned) */
  cleanedEntries: PainEntry[];
  /** Daily aggregated trend */
  dailyTrend: TrendPoint[];
  /** Weekly rolling trend */
  weeklyTrend: TrendPoint[];
  /** Detected episodes/flares */
  episodes: PainEpisode[];
  /** Trigger correlations */
  triggerCorrelations: TriggerCorrelation[];
  /** Symptom correlations */
  symptomCorrelations: TriggerCorrelation[];
  /** Medication correlations */
  medicationCorrelations: TriggerCorrelation[];
  /** Location correlations */
  locationCorrelations: TriggerCorrelation[];
  /** Trigger bundles (co-occurring triggers) */
  triggerBundles: TriggerBundle[];
  /** Quality of Life patterns */
  qolPatterns: QoLPattern[];
  /** QoL dissonances detected */
  qolDissonances: QoLDissonance[];
  /** Metadata about the analysis */
  meta: InsightMeta;
  /** Configuration used */
  config: PatternEngineConfig;
}

// ============================================================================
// Statistical Helpers
// ============================================================================

/**
 * Basic statistical summary
 */
export interface StatisticalSummary {
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Baseline calculation result
 */
export interface BaselineResult {
  value: number;
  method: 'median' | 'mean' | 'mode';
  confidence: ConfidenceLevel;
  windowDays: number;
  entryCount: number;
}

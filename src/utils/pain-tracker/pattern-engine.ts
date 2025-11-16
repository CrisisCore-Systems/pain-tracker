/**
 * Advanced Pattern Recognition Engine
 * 
 * Heuristic-based engine for detecting pain trends, correlations, episodes,
 * and Quality of Life patterns. All computation runs locally - zero cloud deps.
 * 
 * Design principles:
 * - Transparent, explainable heuristics (not black-box ML)
 * - Trauma-informed messaging (confidence levels, gentle language)
 * - Clinically-aligned metrics (validated pain scales, evidence-based)
 * - Offline-first (100% local computation)
 */

import type { PainEntry } from '../../types/pain-tracker';
import {
  type PatternAnalysisResult,
  type PatternEngineConfig,
  type TrendPoint,
  type PainEpisode,
  type TriggerCorrelation,
  type QoLPattern,
  type QoLDissonance,
  type TriggerBundle,
  type BaselineResult,
  type StatisticalSummary,
  type CorrelationStrength,
  type CorrelationDirection,
  type ConfidenceLevel,
  type InsightMeta,
  type PainIntensity,
  DEFAULT_PATTERN_CONFIG,
} from '../../types/pattern-engine';

// ============================================================================
// Core Analysis Entry Point
// ============================================================================

/**
 * Analyze pain entries for patterns, correlations, and insights
 * @param entries - Raw pain entries
 * @param config - Engine configuration (uses defaults if not provided)
 * @returns Comprehensive pattern analysis
 */
export function analyzePatterns(
  entries: PainEntry[],
  config: Partial<PatternEngineConfig> = {}
): PatternAnalysisResult {
  const fullConfig: PatternEngineConfig = { ...DEFAULT_PATTERN_CONFIG, ...config };

  // Step 1: Clean and validate entries
  const cleanedEntries = cleanEntries(entries);

  // Step 2: Compute baseline
  const baseline = calculateBaseline(cleanedEntries, fullConfig.baselineWindowDays);

  // Step 3: Build time-series trends
  const dailyTrend = computeDailyTrend(cleanedEntries);
  const weeklyTrend = computeWeeklyTrend(dailyTrend);

  // Step 4: Detect episodes/flares
  const episodes = detectEpisodes(dailyTrend, baseline, fullConfig);

  // Step 5: Correlation analysis
  const triggerCorrelations = computeTriggerCorrelations(cleanedEntries, baseline, fullConfig);
  const symptomCorrelations = computeSymptomCorrelations(cleanedEntries, baseline, fullConfig);
  const medicationCorrelations = computeMedicationCorrelations(cleanedEntries, baseline, fullConfig);
  const locationCorrelations = computeLocationCorrelations(cleanedEntries, baseline, fullConfig);

  // Step 6: Trigger bundles (co-occurring triggers)
  const triggerBundles = detectTriggerBundles(cleanedEntries, fullConfig);

  // Step 7: Quality of Life patterns
  const qolPatterns = computeQoLPatterns(cleanedEntries, baseline, fullConfig);

  // Step 8: QoL dissonance detection
  const qolDissonances = fullConfig.enableQoLDissonance
    ? detectQoLDissonances(cleanedEntries, dailyTrend, qolPatterns)
    : [];

  // Step 9: Build metadata
  const meta: InsightMeta = {
    dataWindow: {
      start: cleanedEntries[0]?.timestamp || new Date().toISOString(),
      end: cleanedEntries[cleanedEntries.length - 1]?.timestamp || new Date().toISOString(),
    },
    entryCount: cleanedEntries.length,
    dataQuality: assessDataQuality(cleanedEntries, fullConfig),
    cautions: generateCautions(cleanedEntries, fullConfig),
    generatedAt: new Date().toISOString(),
  };

  return {
    cleanedEntries,
    dailyTrend,
    weeklyTrend,
    episodes,
    triggerCorrelations,
    symptomCorrelations,
    medicationCorrelations,
    locationCorrelations,
    triggerBundles,
    qolPatterns,
    qolDissonances,
    meta,
    config: fullConfig,
  };
}

// ============================================================================
// Step 1: Data Cleaning & Normalization
// ============================================================================

/**
 * Clean and validate entries, removing invalid data
 */
export function cleanEntries(entries: PainEntry[]): PainEntry[] {
  return entries
    .filter((entry) => {
      // Must have valid pain level
      const pain = entry.baselineData?.pain;
      if (pain === undefined || pain === null || pain < 0 || pain > 10) {
        return false;
      }

      // Must have valid timestamp
      try {
        const date = new Date(entry.timestamp);
        if (isNaN(date.getTime())) {
          return false;
        }
      } catch {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// ============================================================================
// Step 2: Baseline Calculation
// ============================================================================

/**
 * Calculate user's baseline pain level (robust to outliers)
 */
export function calculateBaseline(
  entries: PainEntry[],
  windowDays: number = 30
): BaselineResult {
  if (entries.length === 0) {
    return {
      value: 0,
      method: 'median',
      confidence: 'low',
      windowDays: 0,
      entryCount: 0,
    };
  }

  // Use recent window for baseline
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const recentEntries = entries.filter(
    (e) => now - new Date(e.timestamp).getTime() <= windowMs
  );

  const useEntries = recentEntries.length >= 7 ? recentEntries : entries;
  const painValues = useEntries.map((e) => e.baselineData.pain);

  // Use median for robustness
  const sorted = [...painValues].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const confidence: ConfidenceLevel =
    useEntries.length >= 30 ? 'high' : useEntries.length >= 14 ? 'medium' : 'low';

  return {
    value: median,
    method: 'median',
    confidence,
    windowDays: useEntries === recentEntries ? windowDays : entries.length,
    entryCount: useEntries.length,
  };
}

// ============================================================================
// Step 3: Trend Computation
// ============================================================================

/**
 * Compute daily trend (one point per calendar day)
 */
export function computeDailyTrend(entries: PainEntry[]): TrendPoint[] {
  if (entries.length === 0) return [];

  const dailyMap = new Map<string, { values: number[]; count: number }>();

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { values: [], count: 0 });
    }

    const bucket = dailyMap.get(dateKey)!;
    bucket.values.push(entry.baselineData.pain);
    bucket.count++;
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => {
      const sorted = [...data.values].sort((a, b) => a - b);
      const mean = data.values.reduce((sum, v) => sum + v, 0) / data.count;
      const variance =
        data.values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.count;
      const stdDev = Math.sqrt(variance);

      return {
        date,
        value: mean,
        count: data.count,
        range: [sorted[0], sorted[sorted.length - 1]] as [number, number],
        stdDev,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Compute weekly rolling average trend
 */
export function computeWeeklyTrend(dailyTrend: TrendPoint[]): TrendPoint[] {
  if (dailyTrend.length < 7) return [];

  const weeklyPoints: TrendPoint[] = [];
  const window = 7;

  for (let i = window - 1; i < dailyTrend.length; i++) {
    const slice = dailyTrend.slice(i - window + 1, i + 1);
    const values = slice.map((p) => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const totalCount = slice.reduce((sum, p) => sum + p.count, 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    weeklyPoints.push({
      date: dailyTrend[i].date,
      value: mean,
      count: totalCount,
      range: [minVal, maxVal],
    });
  }

  return weeklyPoints;
}

// ============================================================================
// Step 4: Episode Detection
// ============================================================================

/**
 * Detect pain episodes (flares or extended high-pain periods)
 */
export function detectEpisodes(
  dailyTrend: TrendPoint[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): PainEpisode[] {
  if (dailyTrend.length === 0) return [];

  const episodes: PainEpisode[] = [];
  let currentEpisode: {
    start: string;
    points: TrendPoint[];
  } | null = null;

  const threshold = Math.max(config.episodePainThreshold, baseline.value + 2);

  for (let idx = 0; idx < dailyTrend.length; idx++) {
    const point = dailyTrend[idx];
    const isHighPain = point.value >= threshold;

    if (isHighPain) {
      if (!currentEpisode) {
        currentEpisode = {
          start: point.date,
          points: [point],
        };
      } else {
        currentEpisode.points.push(point);
      }
    } else {
      if (currentEpisode && currentEpisode.points.length >= config.episodeMinLengthDays) {
        // Close episode
        const points = currentEpisode.points;
        const painValues = points.map((p) => p.value);
        const avgPain = painValues.reduce((sum, v) => sum + v, 0) / painValues.length;
        const peakPain = Math.max(...painValues) as number;

        // Calculate recovery days
        let recoveryDays: number | null = null;
        const episodeEndDate = new Date(points[points.length - 1].date);
        for (let j = idx; j < dailyTrend.length; j++) {
          const futurePoint = dailyTrend[j];
          const futureDate = new Date(futurePoint.date);
          if (futurePoint.value < baseline.value) {
            recoveryDays = Math.floor(
              (futureDate.getTime() - episodeEndDate.getTime()) / (24 * 60 * 60 * 1000)
            );
            break;
          }
        }

        const severity: PainEpisode['severity'] =
          peakPain >= 8 ? 'severe' : peakPain >= 6 ? 'moderate' : 'mild';

        episodes.push({
          id: `episode-${currentEpisode.start}`,
          start: currentEpisode.start,
          end: points[points.length - 1].date,
          peakPain: Math.min(10, Math.round(peakPain)) as PainIntensity,
          avgPain: Number(avgPain.toFixed(1)),
          entryCount: points.reduce((sum, p) => sum + p.count, 0),
          recoveryDays,
          durationDays: points.length,
          severity,
          associatedTriggers: [],
          associatedLocations: [],
        });
      }

      currentEpisode = null;
    }
  }

  // Handle ongoing episode at end
  if (currentEpisode && currentEpisode.points.length >= config.episodeMinLengthDays) {
    const points = currentEpisode.points;
    const painValues = points.map((p: TrendPoint) => p.value);
    const avgPain = painValues.reduce((sum: number, v: number) => sum + v, 0) / painValues.length;
    const peakPain = Math.max(...painValues);

    const severity: PainEpisode['severity'] =
      peakPain >= 8 ? 'severe' : peakPain >= 6 ? 'moderate' : 'mild';

    episodes.push({
      id: `episode-${currentEpisode.start}`,
      start: currentEpisode.start,
      end: points[points.length - 1].date,
      peakPain: Math.min(10, Math.round(peakPain)) as PainIntensity,
      avgPain: Number(avgPain.toFixed(1)),
      entryCount: points.reduce((sum: number, p: TrendPoint) => sum + p.count, 0),
      recoveryDays: null,
      durationDays: points.length,
      severity,
      associatedTriggers: [],
      associatedLocations: [],
    });
  }

  return episodes;
}

// ============================================================================
// Step 5: Correlation Analysis
// ============================================================================

/**
 * Compute correlation between triggers and pain levels
 */
export function computeTriggerCorrelations(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): TriggerCorrelation[] {
  return computeGenericCorrelations(
    entries,
    baseline,
    config,
    (entry) => entry.triggers || []
  );
}

/**
 * Compute correlation between symptoms and pain levels
 */
export function computeSymptomCorrelations(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): TriggerCorrelation[] {
  return computeGenericCorrelations(
    entries,
    baseline,
    config,
    (entry) => entry.baselineData.symptoms || []
  );
}

/**
 * Compute correlation between medications and pain changes
 */
export function computeMedicationCorrelations(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): TriggerCorrelation[] {
  const meds = entries.map((entry) =>
    entry.medications?.current?.map((m) => m.name) || []
  );

  return computeGenericCorrelations(
    entries,
    baseline,
    config,
    (entry, idx) => meds[idx] || []
  );
}

/**
 * Compute correlation between body locations and pain levels
 */
export function computeLocationCorrelations(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): TriggerCorrelation[] {
  return computeGenericCorrelations(
    entries,
    baseline,
    config,
    (entry) => entry.baselineData.locations || []
  );
}

/**
 * Generic correlation computation (reusable for triggers/symptoms/meds/locations)
 */
function computeGenericCorrelations(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig,
  extractor: (entry: PainEntry, idx: number) => string[]
): TriggerCorrelation[] {
  const itemStats = new Map<
    string,
    {
      withItem: number[];
      withoutItem: number[];
    }
  >();

  // Build with/without sets for each item
  entries.forEach((entry, idx) => {
    const items = extractor(entry, idx);
    const pain = entry.baselineData.pain;

    items.forEach((item) => {
      if (!itemStats.has(item)) {
        itemStats.set(item, { withItem: [], withoutItem: [] });
      }
      itemStats.get(item)!.withItem.push(pain);
    });

    // Add to "without" for all other items
    itemStats.forEach((stats, key) => {
      if (!items.includes(key)) {
        stats.withoutItem.push(pain);
      }
    });
  });

  // Compute correlations
  const correlations: TriggerCorrelation[] = [];

  itemStats.forEach((stats, key) => {
    const support = stats.withItem.length;

    if (support < config.minSupportForCorrelation) {
      return;
    }

    const meanWith =
      stats.withItem.reduce((sum, v) => sum + v, 0) / stats.withItem.length;
    const meanWithout =
      stats.withoutItem.length > 0
        ? stats.withoutItem.reduce((sum, v) => sum + v, 0) / stats.withoutItem.length
        : baseline.value;

    const delta = meanWith - meanWithout;

    // Calculate confidence (how stable is this pattern)
    const aboveBaseline = stats.withItem.filter((v) => v > baseline.value).length;
    const confidence = aboveBaseline / stats.withItem.length;

    // Calculate stability (consistency over time)
    const variance =
      stats.withItem.reduce((sum, v) => sum + Math.pow(v - meanWith, 2), 0) /
      stats.withItem.length;
    const stabilityScore = Math.max(0, 1 - variance / 10); // Normalize to 0-1

    const strength = bucketCorrelation(delta, confidence);
    const direction: CorrelationDirection =
      delta > 0.3 ? 'increases' : delta < -0.3 ? 'decreases' : 'neutral';

    if (strength !== 'none' && confidence >= config.minConfidenceForDisplay) {
      correlations.push({
        key,
        label: formatLabel(key),
        deltaPain: Number(delta.toFixed(2)),
        support,
        confidence: Number(confidence.toFixed(2)),
        strength,
        direction,
        stabilityScore: Number(stabilityScore.toFixed(2)),
      });
    }
  });

  return correlations.sort((a, b) => Math.abs(b.deltaPain) - Math.abs(a.deltaPain));
}

/**
 * Bucket correlation strength
 */
function bucketCorrelation(delta: number, confidence: number): CorrelationStrength {
  if (confidence < 0.5 || Math.abs(delta) < 0.3) return 'none';
  if (Math.abs(delta) < 0.7) return 'weak';
  if (Math.abs(delta) < 1.5) return 'moderate';
  return 'strong';
}

/**
 * Format label for display
 */
function formatLabel(key: string): string {
  return key
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// Step 6: Trigger Bundles (Co-occurring Triggers)
// ============================================================================

/**
 * Detect trigger bundles (triggers that often appear together)
 */
export function detectTriggerBundles(
  entries: PainEntry[],
  config: PatternEngineConfig
): TriggerBundle[] {
  const bundles: TriggerBundle[] = [];
  const triggerPairs = new Map<
    string,
    {
      count: number;
      totalDelta: number;
      baseline: number;
    }
  >();

  // Find all trigger pairs
  entries.forEach((entry) => {
    const triggers = entry.triggers || [];
    if (triggers.length < 2) return;

    for (let i = 0; i < triggers.length; i++) {
      for (let j = i + 1; j < triggers.length; j++) {
        const pair = [triggers[i], triggers[j]].sort().join('|');
        if (!triggerPairs.has(pair)) {
          triggerPairs.set(pair, { count: 0, totalDelta: 0, baseline: 0 });
        }

        const stats = triggerPairs.get(pair)!;
        stats.count++;
        stats.totalDelta += entry.baselineData.pain;
      }
    }
  });

  // Filter and format bundles
  triggerPairs.forEach((stats, pairKey) => {
    if (stats.count >= Math.max(3, config.minSupportForCorrelation / 2)) {
      const triggers = pairKey.split('|');
      const avgDelta = stats.totalDelta / stats.count;
      const strength = bucketCorrelation(avgDelta, stats.count / entries.length);

      if (strength !== 'none') {
        bundles.push({
          id: `bundle-${pairKey}`,
          triggers,
          combinedDelta: Number(avgDelta.toFixed(2)),
          coOccurrence: stats.count,
          strength,
        });
      }
    }
  });

  return bundles.sort((a, b) => Math.abs(b.combinedDelta) - Math.abs(a.combinedDelta));
}

// ============================================================================
// Step 7: Quality of Life Patterns
// ============================================================================

/**
 * Compute Quality of Life correlations with pain
 */
export function computeQoLPatterns(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig
): QoLPattern[] {
  const patterns: QoLPattern[] = [];

  // Sleep quality patterns
  const sleepPattern = analyzeQoLDimension(
    entries,
    baseline,
    config,
    'sleep',
    (e) => e.qualityOfLife?.sleepQuality,
    { goodThreshold: 7, poorThreshold: 3 }
  );
  if (sleepPattern) patterns.push(sleepPattern);

  // Mood patterns
  const moodPattern = analyzeQoLDimension(
    entries,
    baseline,
    config,
    'mood',
    (e) => e.qualityOfLife?.moodImpact,
    { goodThreshold: 3, poorThreshold: -2 }
  );
  if (moodPattern) patterns.push(moodPattern);

  // Activity patterns
  const activityPattern = analyzeQoLDimension(
    entries,
    baseline,
    config,
    'activity',
    (e) => e.activityLevel,
    { goodThreshold: 7, poorThreshold: 3 }
  );
  if (activityPattern) patterns.push(activityPattern);

  // NOTE: Fatigue patterns would require qualityOfLife.fatigueLevel in the type system
  // Can be added when that field is available in PainEntry.qualityOfLife

  return patterns;
}

/**
 * Analyze a single QoL dimension
 */
function analyzeQoLDimension(
  entries: PainEntry[],
  baseline: BaselineResult,
  config: PatternEngineConfig,
  metric: 'sleep' | 'mood' | 'activity' | 'fatigue',
  extractor: (entry: PainEntry) => number | undefined,
  thresholds: { goodThreshold: number; poorThreshold: number },
  inverse: boolean = false
): QoLPattern | null {
  const goodEntries: number[] = [];
  const poorEntries: number[] = [];
  let totalCount = 0;

  entries.forEach((entry) => {
    const value = extractor(entry);
    if (value === undefined || value === null) return;

    totalCount++;
    const pain = entry.baselineData.pain;

    if (inverse) {
      if (value <= thresholds.goodThreshold) goodEntries.push(pain);
      if (value >= thresholds.poorThreshold) poorEntries.push(pain);
    } else {
      if (value >= thresholds.goodThreshold) goodEntries.push(pain);
      if (value <= thresholds.poorThreshold) poorEntries.push(pain);
    }
  });

  if (totalCount < config.minSupportForCorrelation) return null;
  if (goodEntries.length < 3 && poorEntries.length < 3) return null;

  const meanGood =
    goodEntries.length > 0
      ? goodEntries.reduce((sum, v) => sum + v, 0) / goodEntries.length
      : baseline.value;
  const meanPoor =
    poorEntries.length > 0
      ? poorEntries.reduce((sum, v) => sum + v, 0) / poorEntries.length
      : baseline.value;

  const delta = meanGood - meanPoor;
  const evidenceCount = goodEntries.length + poorEntries.length;
  const confidence: ConfidenceLevel =
    evidenceCount >= 20 ? 'high' : evidenceCount >= 10 ? 'medium' : 'low';

  const strength = bucketCorrelation(delta, evidenceCount / totalCount);

  if (strength === 'none') return null;

  const description = generateQoLDescription(metric, delta, thresholds, inverse);

  return {
    id: `qol-${metric}`,
    description,
    metric,
    correlation: strength,
    evidenceCount,
    delta: Number(delta.toFixed(2)),
    confidence,
    condition: inverse
      ? `When ${metric} ≤ ${thresholds.goodThreshold}`
      : `When ${metric} ≥ ${thresholds.goodThreshold}`,
  };
}

/**
 * Generate human-readable QoL pattern description
 */
function generateQoLDescription(
  metric: string,
  delta: number,
  thresholds: { goodThreshold: number; poorThreshold: number },
  inverse: boolean
): string {
  const direction = delta < 0 ? 'lower' : 'higher';
  const magnitude = Math.abs(delta).toFixed(1);

  if (inverse) {
    return `When ${metric} is low (≤${thresholds.goodThreshold}), pain averages ${magnitude} points ${direction}.`;
  }

  return `When ${metric} is good (≥${thresholds.goodThreshold}), pain averages ${magnitude} points ${direction}.`;
}

// ============================================================================
// Step 8: QoL Dissonance Detection
// ============================================================================

/**
 * Detect dissonances between pain and QoL trends
 * @param entries - Pain entries
 * @param dailyTrend - Daily trend data
 * @param _qolPatterns - QoL patterns (reserved for future cross-referencing logic)
 */
export function detectQoLDissonances(
  entries: PainEntry[],
  dailyTrend: TrendPoint[],
  _qolPatterns: QoLPattern[] // eslint-disable-line @typescript-eslint/no-unused-vars
): QoLDissonance[] {
  const dissonances: QoLDissonance[] = [];

  if (entries.length < 14 || dailyTrend.length < 7) return dissonances;

  // Calculate trends
  const recentPain = dailyTrend.slice(-7);
  const previousPain = dailyTrend.slice(-14, -7);

  const recentPainAvg =
    recentPain.reduce((sum, p) => sum + p.value, 0) / recentPain.length;
  const previousPainAvg =
    previousPain.reduce((sum, p) => sum + p.value, 0) / previousPain.length;

  const painChange = recentPainAvg - previousPainAvg;
  let painTrend: 'improving' | 'stable' | 'worsening';
  if (painChange < -0.5) {
    painTrend = 'improving';
  } else if (painChange > 0.5) {
    painTrend = 'worsening';
  } else {
    painTrend = 'stable';
  }

  // Check sleep trend
  const recentEntries = entries.slice(-7);
  const previousEntries = entries.slice(-14, -7);

  const recentSleep = recentEntries
    .map((e) => e.qualityOfLife?.sleepQuality)
    .filter((v): v is number => v !== undefined);
  const previousSleep = previousEntries
    .map((e) => e.qualityOfLife?.sleepQuality)
    .filter((v): v is number => v !== undefined);

  if (recentSleep.length >= 3 && previousSleep.length >= 3) {
    const recentSleepAvg =
      recentSleep.reduce((sum, v) => sum + v, 0) / recentSleep.length;
    const previousSleepAvg =
      previousSleep.reduce((sum, v) => sum + v, 0) / previousSleep.length;

    const sleepChange = recentSleepAvg - previousSleepAvg;

    // Dissonance: Pain stable but sleep declining
    if (painTrend === 'stable' && sleepChange < -1.5) {
      dissonances.push({
        type: 'pain_stable_qol_declining',
        description: `Pain levels holding steady, but sleep quality declined by ${Math.abs(sleepChange).toFixed(1)} points in the past week.`,
        painTrend: 'stable',
        qolTrend: 'declining',
        affectedMetrics: ['sleep'],
        severity: Math.abs(sleepChange) > 2.5 ? 'high' : 'medium',
        recommendation:
          'Consider discussing sleep interventions with care team, as poor sleep may predict future pain increases.',
      });
    }
  }

  return dissonances;
}

// ============================================================================
// Utility: Data Quality Assessment
// ============================================================================

/**
 * Assess overall data quality/coverage
 */
function assessDataQuality(
  entries: PainEntry[],
  config: PatternEngineConfig
): ConfidenceLevel {
  if (entries.length >= 60) return 'high';
  if (entries.length >= config.minEntriesForTrend * 3) return 'medium';
  return 'low';
}

/**
 * Generate cautions about the analysis
 */
function generateCautions(entries: PainEntry[], config: PatternEngineConfig): string[] {
  const cautions: string[] = [];

  if (entries.length < config.minEntriesForTrend) {
    cautions.push(`Low sample size (${entries.length} entries). Add more entries for reliable trends.`);
  }

  if (entries.length < config.minSupportForCorrelation) {
    cautions.push('Not enough data for correlation analysis. Keep logging triggers and symptoms.');
  }

  const hasQoL = entries.some(
    (e) =>
      e.qualityOfLife?.sleepQuality !== undefined ||
      e.qualityOfLife?.moodImpact !== undefined ||
      e.activityLevel !== undefined
  );

  if (!hasQoL) {
    cautions.push('Quality of Life data missing. Log sleep, mood, and activity for richer insights.');
  }

  return cautions;
}

// ============================================================================
// Statistical Helpers
// ============================================================================

/**
 * Calculate comprehensive statistical summary
 */
export function calculateStatistics(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  // Calculate mode
  const frequency = new Map<number, number>();
  for (const v of values) {
    frequency.set(v, (frequency.get(v) || 0) + 1);
  }
  const mode = Array.from(frequency.entries()).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    [0, 0] as [number, number]
  )[0];

  // Calculate standard deviation
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    mode,
    stdDev: Number(stdDev.toFixed(2)),
    min: sorted[0],
    max: sorted.at(-1)!,
    count: values.length,
  };
}

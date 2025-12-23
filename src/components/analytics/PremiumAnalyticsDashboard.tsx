import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Filter,
  FileSpreadsheet,
  FileJson,
  ClipboardCheck,
  Shield,
  Lock,
  Mail,
  FileText,
  Sparkles,
  BarChart3,
  Waves,
  Moon,
  Sun,
  Heart,
  Pill,
} from 'lucide-react';
import type { PainEntry } from '../../types';
import {
  EmotionalValidation,
  ValidationHistory,
  useEmotionalValidation,
} from '../../validation-technology';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import { hipaaComplianceService } from '../../services/HIPAACompliance';
import type { AuditTrail } from '../../services/HIPAACompliance';
import { analyzePatterns } from '../../utils/pain-tracker/pattern-engine';
import type { PatternAnalysisResult } from '../../types/pattern-engine';
import { NerveSymptoms } from '../pain-tracker/NerveSymptoms';
import { FunctionalLimitations } from '../pain-tracker/FunctionalLimitations';
import { WeatherCorrelationPanel } from './WeatherCorrelationPanel';
import {
  Badge,
  type BadgeProps,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../design-system';

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimePatternStats {
  count: number;
  avgIntensity: number;
}

type TimePatterns = Record<TimePeriod, TimePatternStats>;

interface LocationStat {
  location: string;
  count: number;
  percentage: number;
}

interface TriggerStat {
  trigger: string;
  count: number;
  percentage: number;
}

interface DayOfWeekPattern {
  day: number;
  count: number;
  avgPain: number;
}

interface MonthlyTrendPoint {
  month: number;
  count: number;
  avgPain: number;
}

interface TriggerPainCorrelation {
  trigger: string;
  count: number;
  avgDelta: number;
}

interface MedicationEffectStat {
  medication: string;
  uses: number;
  avgReduction: number;
  effectiveness: number;
}

interface MedicationWindowInsight {
  id: string;
  label: string;
  avgReduction: number;
  confidence: number;
  count: number;
}

interface PredictedFlare {
  probability: number;
  timeframe: string;
  severity: 'high' | 'moderate' | 'low';
  recommendations: string[];
}

interface NextWeekForecast {
  projectedAverage: number;
  change: number;
  confidence: 'high' | 'medium' | 'low';
  narrative: string;
}

interface PersonalizedRecommendation {
  title: string;
  detail: string;
  category: 'flare' | 'trigger' | 'medication' | 'routine';
  emphasis: 'high' | 'medium' | 'low';
}

interface NumericSignalStats {
  count: number;
  avg: number;
  min: number;
  max: number;
}

interface AnalyticsSnapshot {
  avgPain: number;
  trend: number;
  volatility: number;
  goodDays: number;
  badDays: number;
  topLocations: LocationStat[];
  topTriggers: TriggerStat[];
  topReliefMethods: TriggerStat[];
  topActivities: TriggerStat[];
  topQualities: TriggerStat[];
  stressStats: NumericSignalStats;
  activityLevelStats: NumericSignalStats;
  weatherCount: number;
  timePatterns: TimePatterns;
  dayOfWeekPatterns: DayOfWeekPattern[];
  monthlyTrend: MonthlyTrendPoint[];
  triggerPainCorrelation: TriggerPainCorrelation[];
  medicationEffectiveness: MedicationEffectStat[];
  predictedFlare: PredictedFlare | null;
  riskScore: number;
  improvementScore: number;
  optimalMedicationWindow: MedicationWindowInsight | null;
  nextWeekForecast: NextWeekForecast | null;
  personalizedRecommendations: PersonalizedRecommendation[];
}

interface ReasoningNode {
  id: string;
  title: string;
  insight: string;
  confidence: 'high' | 'medium' | 'low';
  evidence?: string;
  action?: string;
  children?: ReasoningNode[];
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MEDICATION_WINDOWS = [
  { id: 'overnight', start: 0, end: 5, label: 'Midnight – 5 AM' },
  { id: 'early-morning', start: 5, end: 9, label: '5 AM – 9 AM' },
  { id: 'late-morning', start: 9, end: 12, label: '9 AM – Noon' },
  { id: 'early-afternoon', start: 12, end: 16, label: 'Noon – 4 PM' },
  { id: 'late-afternoon', start: 16, end: 19, label: '4 PM – 7 PM' },
  { id: 'evening', start: 19, end: 23, label: '7 PM – 11 PM' },
  { id: 'late-night', start: 23, end: 24, label: '11 PM – Midnight' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createInitialTimePatterns = (): TimePatterns => ({
  morning: { count: 0, avgIntensity: 0 },
  afternoon: { count: 0, avgIntensity: 0 },
  evening: { count: 0, avgIntensity: 0 },
  night: { count: 0, avgIntensity: 0 },
});

const createEmptyAnalyticsSnapshot = (): AnalyticsSnapshot => ({
  avgPain: 0,
  trend: 0,
  volatility: 0,
  goodDays: 0,
  badDays: 0,
  topLocations: [],
  topTriggers: [],
  topReliefMethods: [],
  topActivities: [],
  topQualities: [],
  stressStats: { count: 0, avg: 0, min: 0, max: 0 },
  activityLevelStats: { count: 0, avg: 0, min: 0, max: 0 },
  weatherCount: 0,
  timePatterns: createInitialTimePatterns(),
  dayOfWeekPatterns: [],
  monthlyTrend: [],
  triggerPainCorrelation: [],
  medicationEffectiveness: [],
  predictedFlare: null,
  riskScore: 0,
  improvementScore: 0,
  optimalMedicationWindow: null,
  nextWeekForecast: null,
  personalizedRecommendations: [],
});

type EnvRecord = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const getEnv = () => {
  try {
    const meta = import.meta as unknown;
    if (isRecord(meta) && 'env' in meta) {
      const env = (meta as { env?: unknown }).env;
      if (isRecord(env)) return env as EnvRecord;
    }
  } catch (_) {
    // ignore
  }

  const maybeProcess = (globalThis as unknown as { process?: unknown }).process;
  if (isRecord(maybeProcess) && 'env' in maybeProcess) {
    const env = (maybeProcess as { env?: unknown }).env;
    if (isRecord(env)) return env as EnvRecord;
  }

  return {} as EnvRecord;
};

const ENABLE_VALIDATION_EXPORT = (() => {
  const env = getEnv();

  const getEnvValue = (key: string): string | undefined => {
    const value = env[key];
    return typeof value === 'string' ? value : undefined;
  };

  return (
    getEnvValue('VITE_REACT_APP_ENABLE_VALIDATION') !== 'false' &&
    getEnvValue('REACT_APP_ENABLE_VALIDATION') !== 'false'
  );
})();

type AuditActionType = AuditTrail['actionType'];
type AuditOutcome = AuditTrail['outcome'];

const ClinicalPDFExportButtonLazy = React.lazy(() =>
  import('../export/ClinicalPDFExportButton').then(module => ({
    default: module.ClinicalPDFExportButton,
  }))
);

const DataExportModalLazy = React.lazy(() =>
  import('../export/DataExportModal').then(module => ({ default: module.DataExportModal }))
);

interface PremiumAnalyticsDashboardProps {
  entries: PainEntry[];
}

export const PremiumAnalyticsDashboard: React.FC<PremiumAnalyticsDashboardProps> = ({
  entries,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [view, setView] = useState<
    'overview' | 'patterns' | 'predictions' | 'clinical' | 'export' | 'insights'
  >('overview');

  // Filter entries by time range
  const filteredEntries = useMemo(() => {
    if (timeRange === 'all') return entries;

    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    return entries.filter(e => new Date(e.timestamp) >= cutoff);
  }, [entries, timeRange]);

  // Advanced Analytics Calculations
  const analytics = useMemo<AnalyticsSnapshot>(() => {
    if (filteredEntries.length === 0) {
      return createEmptyAnalyticsSnapshot();
    }

    // Basic metrics
    const avgPain =
      filteredEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / filteredEntries.length;

    // Trend calculation (comparing first half to second half)
    // Guard against tiny datasets where midpoint can be 0.
    const midpoint = Math.floor(filteredEntries.length / 2);
    const trend = (() => {
      if (filteredEntries.length < 2 || midpoint === 0) return 0;

      const firstHalf = filteredEntries.slice(0, midpoint);
      const secondHalf = filteredEntries.slice(midpoint);

      const firstHalfAvg =
        firstHalf.reduce((sum, e) => sum + e.baselineData.pain, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, e) => sum + e.baselineData.pain, 0) / secondHalf.length;

      if (!Number.isFinite(firstHalfAvg) || firstHalfAvg === 0) return 0;
      return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    })();

    // Volatility (standard deviation)
    const variance =
      filteredEntries.reduce((sum, e) => sum + Math.pow(e.baselineData.pain - avgPain, 2), 0) /
      filteredEntries.length;
    const volatility = Math.sqrt(variance);

    // Good vs Bad days
    const goodDays = filteredEntries.filter(e => e.baselineData.pain <= 3).length;
    const badDays = filteredEntries.filter(e => e.baselineData.pain >= 7).length;

    // Location frequency analysis
    const locationCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      entry.baselineData.locations?.forEach((loc: string) => {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });
    });
    const topLocations: LocationStat[] = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({
        location,
        count,
        percentage: (count / filteredEntries.length) * 100,
      }));

    // Trigger frequency analysis
    const triggerCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });
    const topTriggers: TriggerStat[] = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({
        trigger,
        count,
        percentage: (count / filteredEntries.length) * 100,
      }));

    // Relief methods frequency analysis
    const reliefCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      entry.reliefMethods?.forEach(method => {
        reliefCounts[method] = (reliefCounts[method] || 0) + 1;
      });
    });
    const topReliefMethods: TriggerStat[] = Object.entries(reliefCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({
        trigger,
        count,
        percentage: (count / filteredEntries.length) * 100,
      }));

    // Activities frequency analysis
    const activityCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      entry.activities?.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    const topActivities: TriggerStat[] = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({
        trigger,
        count,
        percentage: (count / filteredEntries.length) * 100,
      }));

    // Pain quality descriptors frequency analysis
    const qualityCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      entry.quality?.forEach(q => {
        qualityCounts[q] = (qualityCounts[q] || 0) + 1;
      });
    });
    const topQualities: TriggerStat[] = Object.entries(qualityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({
        trigger,
        count,
        percentage: (count / filteredEntries.length) * 100,
      }));

    // Numeric signal coverage (stress/activityLevel)
    const stressValues = filteredEntries
      .map(e => e.stress)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    const activityLevelValues = filteredEntries
      .map(e => e.activityLevel)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

    const makeNumericStats = (values: number[]): NumericSignalStats => {
      if (values.length === 0) return { count: 0, avg: 0, min: 0, max: 0 };
      const sum = values.reduce((s, v) => s + v, 0);
      return {
        count: values.length,
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    const stressStats = makeNumericStats(stressValues);
    const activityLevelStats = makeNumericStats(activityLevelValues);

    const weatherCount = filteredEntries.filter(e => !!e.weather && e.weather.trim() !== '').length;

    // Time-of-day patterns
    const timePatterns: TimePatterns = createInitialTimePatterns();

    // Day-of-week (0 Sunday - 6 Saturday)
    const dayOfWeekPatterns: Record<number, { count: number; totalPain: number }> = {
      0: { count: 0, totalPain: 0 },
      1: { count: 0, totalPain: 0 },
      2: { count: 0, totalPain: 0 },
      3: { count: 0, totalPain: 0 },
      4: { count: 0, totalPain: 0 },
      5: { count: 0, totalPain: 0 },
      6: { count: 0, totalPain: 0 },
    };

    // Monthly trend (1-12)
    const monthlyTrendBuckets: Record<number, { count: number; totalPain: number }> = {};

    // Trigger correlation accumulators
    const overallAvgPain = avgPain;
    const triggerPainDeltas: Record<string, { count: number; deltaSum: number }> = {};

    // Medication timing windows
    const medicationTimingBuckets: Record<
      string,
      { count: number; totalReduction: number; label: string }
    > = {};
    const getWindowForHour = (hour: number) => {
      return (
        MEDICATION_WINDOWS.find(window => hour >= window.start && hour < window.end) ??
        MEDICATION_WINDOWS[MEDICATION_WINDOWS.length - 1]
      );
    };

    filteredEntries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      const month = date.getMonth() + 1;
      let period: keyof typeof timePatterns;
      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else period = 'night';

      timePatterns[period].count++;
      timePatterns[period].avgIntensity += entry.baselineData.pain;

      dayOfWeekPatterns[dayOfWeek].count++;
      dayOfWeekPatterns[dayOfWeek].totalPain += entry.baselineData.pain;

      if (!monthlyTrendBuckets[month]) {
        monthlyTrendBuckets[month] = { count: 0, totalPain: 0 };
      }
      monthlyTrendBuckets[month].count++;
      monthlyTrendBuckets[month].totalPain += entry.baselineData.pain;

      if (entry.triggers && entry.triggers.length > 0) {
        const delta = entry.baselineData.pain - overallAvgPain;
        entry.triggers.forEach(trigger => {
          if (!triggerPainDeltas[trigger]) {
            triggerPainDeltas[trigger] = { count: 0, deltaSum: 0 };
          }
          triggerPainDeltas[trigger].count++;
          triggerPainDeltas[trigger].deltaSum += delta;
        });
      }
    });

    Object.keys(timePatterns).forEach(period => {
      const p = period as keyof typeof timePatterns;
      if (timePatterns[p].count > 0) {
        timePatterns[p].avgIntensity /= timePatterns[p].count;
      }
    });

    const dayOfWeekSummary: DayOfWeekPattern[] = Object.entries(dayOfWeekPatterns).map(
      ([day, data]) => ({
        day: Number(day),
        count: data.count,
        avgPain: data.count > 0 ? data.totalPain / data.count : 0,
      })
    );

    const monthlyTrend: MonthlyTrendPoint[] = Object.entries(monthlyTrendBuckets)
      .map(([month, data]) => ({
        month: Number(month),
        count: data.count,
        avgPain: data.count > 0 ? data.totalPain / data.count : 0,
      }))
      .sort((a, b) => a.month - b.month);

    const triggerPainCorrelation: TriggerPainCorrelation[] = Object.entries(triggerPainDeltas)
      .map(([trigger, data]) => ({
        trigger,
        count: data.count,
        avgDelta: data.deltaSum / data.count,
      }))
      .sort((a, b) => Math.abs(b.avgDelta) - Math.abs(a.avgDelta))
      .slice(0, 8);

    // Medication effectiveness (if tracked)
    const sortedForSequential = [...filteredEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const medicationData: Record<string, { uses: number; totalReduction: number }> = {};
    sortedForSequential.forEach((entry, idx) => {
      if (
        entry.medications &&
        entry.medications.current.length > 0 &&
        idx < sortedForSequential.length - 1
      ) {
        const nextEntry = sortedForSequential[idx + 1];
        const reduction = entry.baselineData.pain - nextEntry.baselineData.pain;
        if (!Number.isFinite(reduction) || reduction <= 0) return;
        const hour = new Date(entry.timestamp).getHours();
        const windowInfo = getWindowForHour(hour);

        if (!medicationTimingBuckets[windowInfo.id]) {
          medicationTimingBuckets[windowInfo.id] = {
            count: 0,
            totalReduction: 0,
            label: windowInfo.label,
          };
        }
        medicationTimingBuckets[windowInfo.id].count++;
        medicationTimingBuckets[windowInfo.id].totalReduction += reduction;

        entry.medications.current.forEach(med => {
          if (!medicationData[med.name]) {
            medicationData[med.name] = { uses: 0, totalReduction: 0 };
          }
          medicationData[med.name].uses++;
          medicationData[med.name].totalReduction += reduction;
        });
      }
    });

    const medicationEffectiveness: MedicationEffectStat[] = Object.entries(medicationData)
      .map(([medication, data]) => {
        const avgReduction = data.totalReduction / data.uses;
        // A lightweight, non-clinical visualization score derived from observed pain score changes.
        // This is intentionally NOT a “% effective” claim.
        const effectiveness = clamp((avgReduction / 3) * 100, 0, 100);
        return {
          medication,
          uses: data.uses,
          avgReduction,
          effectiveness,
        };
      })
      .sort((a, b) => b.effectiveness - a.effectiveness);

    const medicationTimingInsights: MedicationWindowInsight[] = Object.entries(
      medicationTimingBuckets
    )
      .map(([id, data]) => ({
        id,
        label: data.label,
        avgReduction: data.totalReduction / data.count,
        confidence: Math.min(1, data.count / 4),
        count: data.count,
      }))
      .filter(entry => entry.avgReduction > 0)
      .sort((a, b) => b.avgReduction - a.avgReduction);

    const optimalMedicationWindow = medicationTimingInsights[0] ?? null;

    // Flare prediction (simple heuristic)
    const recentEntries = filteredEntries.slice(-7); // Last 7 entries
    const recentAvg =
      recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length;
    const isIncreasing = recentEntries
      .slice(-3)
      .every((e, i, arr) => i === 0 || e.baselineData.pain >= arr[i - 1].baselineData.pain);

    const predictedFlare: PredictedFlare | null =
      recentAvg > 6 && isIncreasing
        ? {
            probability: Math.min(95, Math.round((recentAvg / 10) * 100)),
            timeframe: '24-48 hours',
            severity: recentAvg > 8 ? 'high' : 'moderate',
            recommendations: [
              'Consider preventive medication',
              'Reduce strenuous activities',
              'Ensure adequate rest',
              'Monitor trigger exposure',
            ],
          }
        : null;

    // Risk score (0-100)
    const riskScore = Math.min(
      100,
      Math.round(
        avgPain * 10 +
          volatility * 5 +
          (badDays / filteredEntries.length) * 30 +
          (isIncreasing ? 20 : 0)
      )
    );

    // Improvement score (0-100)
    const improvementScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 -
            avgPain * 10 -
            (trend > 0 ? trend : 0) +
            (goodDays / filteredEntries.length) * 30 -
            volatility * 5
        )
      )
    );

    const projectedChange =
      trend > 5 ? 0.8 : trend > 0 ? 0.4 : trend < -5 ? -0.7 : trend < 0 ? -0.3 : 0;
    const projectedAverage = clamp(avgPain + projectedChange, 0, 10);
    const confidence =
      filteredEntries.length >= 40 ? 'high' : filteredEntries.length >= 20 ? 'medium' : 'low';
    const trendDescriptor =
      projectedChange > 0.3 ? 'worsening' : projectedChange < -0.3 ? 'improving' : 'holding steady';
    const nextWeekForecast: NextWeekForecast = {
      projectedAverage,
      change: projectedChange,
      confidence,
      narrative: `Pain levels are ${trendDescriptor} based on the last ${filteredEntries.length} entries.`,
    };

    const personalizedRecommendations: PersonalizedRecommendation[] = [];

    if (predictedFlare) {
      personalizedRecommendations.push({
        title: 'Prepare for possible flare',
        detail: `Probability ${predictedFlare.probability}% in the next ${predictedFlare.timeframe}. Emphasize pacing and preventive care now.`,
        category: 'flare',
        emphasis: predictedFlare.severity === 'high' ? 'high' : 'medium',
      });
    }

    const toughestDay = [...dayOfWeekSummary]
      .filter(day => day.count > 0)
      .sort((a, b) => b.avgPain - a.avgPain)[0];

    if (toughestDay && toughestDay.avgPain - avgPain >= 1) {
      personalizedRecommendations.push({
        title: `${DAY_LABELS[toughestDay.day]} pattern`,
        detail: `Average pain ${toughestDay.avgPain.toFixed(1)} on ${DAY_LABELS[toughestDay.day]}. Schedule lighter duties or recovery blocks.`,
        category: 'routine',
        emphasis: 'medium',
      });
    }

    const aggravatingTrigger = triggerPainCorrelation.find(trigger => trigger.avgDelta > 1);
    if (aggravatingTrigger) {
      personalizedRecommendations.push({
        title: `${aggravatingTrigger.trigger} drives pain`,
        detail: `Pain averages +${aggravatingTrigger.avgDelta.toFixed(1)} when this trigger appears. Create a mitigation plan or log exposure notes.`,
        category: 'trigger',
        emphasis: 'high',
      });
    }

    const standoutMedication = medicationEffectiveness.find(med => med.avgReduction > 0.5);
    if (standoutMedication) {
      personalizedRecommendations.push({
        title: `${standoutMedication.medication} shows relief`,
        detail: `Average reduction ${standoutMedication.avgReduction.toFixed(1)} points across ${standoutMedication.uses} uses. Remember to document dosing accuracy.`,
        category: 'medication',
        emphasis: 'medium',
      });
    }

    if (optimalMedicationWindow && optimalMedicationWindow.avgReduction > 0.3) {
      personalizedRecommendations.push({
        title: 'Optimize medication timing',
        detail: `Greatest relief occurs around ${optimalMedicationWindow.label}. Aim to medicate within this window when feasible.`,
        category: 'medication',
        emphasis: 'medium',
      });
    }

    if (personalizedRecommendations.length === 0) {
      personalizedRecommendations.push({
        title: 'Keep logging for smarter predictions',
        detail:
          'More varied entries (triggers, medication notes, sleep quality) will unlock individualized recommendations.',
        category: 'routine',
        emphasis: 'low',
      });
    }

    return {
      avgPain,
      trend,
      volatility,
      goodDays,
      badDays,
      topLocations,
      topTriggers,
      topReliefMethods,
      topActivities,
      topQualities,
      stressStats,
      activityLevelStats,
      weatherCount,
      timePatterns,
      dayOfWeekPatterns: dayOfWeekSummary,
      monthlyTrend,
      triggerPainCorrelation,
      medicationEffectiveness,
      predictedFlare,
      riskScore,
      improvementScore,
      optimalMedicationWindow,
      nextWeekForecast,
      personalizedRecommendations,
    };
  }, [filteredEntries]);

  // Advanced pattern recognition using heuristic engine
  const patternAnalysis = useMemo<PatternAnalysisResult | null>(() => {
    if (filteredEntries.length === 0) {
      return null;
    }

    try {
      return analyzePatterns(filteredEntries);
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      return null;
    }
  }, [filteredEntries]);

  const reasoningTree = useMemo<ReasoningNode[]>(
    () => buildReasoningTree(analytics, filteredEntries.length),
    [analytics, filteredEntries.length]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-7 h-7" aria-hidden />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Premium Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Advanced insights powered by clinical-grade algorithms
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Share2 className="w-4 h-4" aria-hidden />}
                onClick={() => setView('export')}
              >
                Share
              </Button>
              <Button
                variant="default"
                size="sm"
                leftIcon={<Download className="w-4 h-4" aria-hidden />}
                onClick={() => setView('export')}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Time range">
            {[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
              { value: '1y', label: '1 year' },
              { value: 'all', label: 'All time' },
            ].map(option => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={timeRange === option.value ? 'secondary' : 'ghost'}
                aria-pressed={timeRange === option.value}
                onClick={() => setTimeRange(option.value as typeof timeRange)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2" aria-label="Analytics sections">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'patterns', label: 'Pattern analysis', icon: Waves },
              { id: 'predictions', label: 'Predictions', icon: Brain },
              { id: 'clinical', label: 'Clinical report', icon: Heart },
              { id: 'insights', label: 'AI insights', icon: Sparkles },
              { id: 'export', label: 'Export & share', icon: Download },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = view === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  size="sm"
                  variant={isActive ? 'secondary' : 'ghost'}
                  aria-current={isActive ? 'page' : undefined}
                  leftIcon={<Icon className="w-4 h-4" aria-hidden />}
                  onClick={() => setView(tab.id as typeof view)}
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'overview' && <OverviewView analytics={analytics} entries={filteredEntries} />}
        {view === 'patterns' && <PatternsView analytics={analytics} entries={filteredEntries} />}
        {view === 'predictions' && <PredictionsView analytics={analytics} />}
        {view === 'clinical' && (
          <ClinicalReportView analytics={analytics} entries={filteredEntries} />
        )}
        {view === 'insights' && (
          <InsightsView
            analytics={analytics}
            entries={filteredEntries}
            reasoningTree={reasoningTree}
            patternAnalysis={patternAnalysis}
          />
        )}
        {view === 'export' && <ExportView analytics={analytics} entries={filteredEntries} />}
      </main>
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({
  analytics,
  entries,
}) => {
  const goodDaysSubtitle =
    entries.length > 0
      ? `${((analytics.goodDays / entries.length) * 100).toFixed(0)}% of total`
      : 'No entries yet';

  const getIntensityBadgeVariant = (intensity: number) => {
    if (intensity >= 7) return 'destructive' as const;
    if (intensity >= 5) return 'warning' as const;
    if (intensity >= 3) return 'info' as const;
    return 'success' as const;
  };

  const getEffectivenessBadgeVariant = (effectiveness: number) => {
    if (effectiveness > 50) return 'success' as const;
    if (effectiveness > 20) return 'warning' as const;
    return 'destructive' as const;
  };

  const getEffectivenessBarClassName = (effectiveness: number) => {
    if (effectiveness > 50) return 'bg-success';
    if (effectiveness > 20) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Pain Level"
          value={analytics.avgPain.toFixed(1)}
          subtitle="out of 10"
          trend={analytics.trend}
          icon={Activity}
          color="blue"
        />

        <MetricCard
          title="Pain Volatility"
          value={analytics.volatility.toFixed(1)}
          subtitle="standard deviation"
          icon={Waves}
          color="purple"
        />

        <MetricCard
          title="Good Days"
          value={analytics.goodDays.toString()}
          subtitle={goodDaysSubtitle}
          icon={CheckCircle}
          color="green"
        />

        <MetricCard
          title="Risk Score"
          value={analytics.riskScore.toString()}
          subtitle="out of 100"
          trend={-analytics.improvementScore}
          icon={AlertTriangle}
          color={analytics.riskScore > 70 ? 'red' : analytics.riskScore > 40 ? 'yellow' : 'green'}
        />
      </div>

      {/* Flare Prediction Alert */}
      {analytics.predictedFlare && (
        <Card variant="outlined" className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 w-full">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                  <AlertTriangle className="w-6 h-6" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-xl">Flare risk detected</CardTitle>
                  <CardDescription>
                    Predicted within the next {analytics.predictedFlare.timeframe}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="shrink-0">
                {analytics.predictedFlare.probability}% probability
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Our predictive algorithm has identified an elevated flare likelihood based on your
              recent patterns.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Recommended actions</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {analytics.predictedFlare.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-success" aria-hidden />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Locations & Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pain Locations */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Most affected areas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topLocations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="h-8 w-8 justify-center rounded-lg flex-shrink-0"
                  >
                    {idx + 1}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground capitalize">{loc.location}</span>
                      <span className="text-sm text-muted-foreground">{loc.count} times</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${loc.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Triggers */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" aria-hidden />
              <CardTitle className="text-lg">Common triggers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topTriggers.length > 0 ? (
                analytics.topTriggers.map((trigger, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="h-8 w-8 justify-center rounded-lg flex-shrink-0"
                    >
                      {idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground capitalize">
                          {trigger.trigger}
                        </span>
                        <span className="text-sm text-muted-foreground">{trigger.count} times</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all"
                          style={{ width: `${trigger.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No triggers tracked yet. Start logging triggers to see patterns.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time of Day Patterns */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" aria-hidden />
            <CardTitle className="text-lg">Pain patterns by time of day</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(analytics.timePatterns).map(([period, data]) => {
              const icons: Record<TimePeriod, typeof Sun> = {
                morning: Sun,
                afternoon: Sun,
                evening: Moon,
                night: Moon,
              };
              const typedPeriod = period as TimePeriod;
              const Icon = icons[typedPeriod];
              const intensity = data.avgIntensity;
              const badgeVariant = getIntensityBadgeVariant(intensity);

              return (
                <Card key={period} variant="filled" padding="sm" className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-semibold text-foreground capitalize">{period}</span>
                    </div>
                    <div className="text-3xl font-semibold text-foreground">{data.avgIntensity.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">{data.count} entries</div>
                  </div>
                  <Badge variant={badgeVariant} className="shrink-0">
                    {badgeVariant === 'destructive'
                      ? 'High'
                      : badgeVariant === 'warning'
                        ? 'Moderate'
                        : badgeVariant === 'info'
                          ? 'Elevated'
                          : 'Low'}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Medication Effectiveness */}
      {analytics.medicationEffectiveness.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Observed relief after medication</CardTitle>
            </div>
            <CardDescription>
              Estimated from pain score change in the next logged entry (observational).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.medicationEffectiveness.map((med, idx) => {
                const badgeVariant = getEffectivenessBadgeVariant(med.effectiveness);
                const barClassName = getEffectivenessBarClassName(med.effectiveness);
                const reliefLabel =
                  med.avgReduction > 0 && med.avgReduction < 0.1
                    ? '<0.1'
                    : med.avgReduction.toFixed(1);
                const barWidth =
                  med.effectiveness > 0 && med.effectiveness < 1
                    ? 1
                    : Math.min(100, med.effectiveness);
                return (
                  <Card key={idx} variant="filled" padding="sm">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{med.medication}</div>
                        <div className="text-xs text-muted-foreground">{med.uses} uses</div>
                      </div>
                      <Badge variant={badgeVariant} className="shrink-0">
                        {reliefLabel} pts
                      </Badge>
                    </div>

                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${barClassName}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Avg reduction: {reliefLabel} points
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Patterns View - Advanced Analytics
const PatternsView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({
  analytics,
  entries,
}) => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const timeOfDayOrder: Array<{
    key: keyof typeof analytics.timePatterns;
    label: string;
    window: string;
    Icon: typeof Sun;
  }> = [
    { key: 'morning', label: 'Morning', window: '5a - 12p', Icon: Sun },
    { key: 'afternoon', label: 'Afternoon', window: '12p - 5p', Icon: Sun },
    { key: 'evening', label: 'Evening', window: '5p - 9p', Icon: Moon },
    { key: 'night', label: 'Night', window: '9p - 5a', Icon: Moon },
  ];

  const getSeverityBadgeVariant = (value: number) => {
    if (value >= 7) return 'destructive' as const;
    if (value >= 5) return 'warning' as const;
    if (value >= 3) return 'info' as const;
    return 'success' as const;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time & Day Patterns */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" aria-hidden />
                <CardTitle className="text-lg">Time & day patterns</CardTitle>
              </div>
              <Badge variant="info" className="shrink-0">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-5">
              Highlighting when pain is most likely to spike based on your historical entries.
            </CardDescription>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Time of day
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {timeOfDayOrder.map(({ key, label, window, Icon }) => {
                    const data = analytics.timePatterns[key];
                    const avg = data && data.count > 0 ? data.avgIntensity : null;
                    const badgeVariant = avg === null ? 'secondary' : getSeverityBadgeVariant(avg);
                    return (
                      <Card
                        key={String(key)}
                        variant="filled"
                        padding="sm"
                        className="flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{window}</p>
                        </div>
                        <Badge variant={badgeVariant}>
                          {avg === null ? '—' : avg.toFixed(1)}
                        </Badge>
                        <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Day of week
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {dayLabels.map((label, idx) => {
                    const data = analytics.dayOfWeekPatterns?.find(d => d.day === idx);
                    const avg = data && data.count > 0 ? data.avgPain : null;
                    const badgeVariant = avg === null ? 'secondary' : getSeverityBadgeVariant(avg);
                    return (
                      <Card
                        key={`${label}-${idx}`}
                        variant="filled"
                        padding="sm"
                        className="text-center"
                      >
                        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
                        <div className="mt-2 flex justify-center">
                          <Badge variant={badgeVariant}>{avg === null ? '—' : avg.toFixed(1)}</Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Impact Matrix */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" aria-hidden />
                <CardTitle className="text-lg">Trigger impact matrix</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">Δ Pain vs personal baseline</span>
            </div>
          </CardHeader>
          <CardContent>

          {analytics.triggerPainCorrelation && analytics.triggerPainCorrelation.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4 font-medium">Trigger</th>
                    <th className="py-2 pr-4 font-medium">Observations</th>
                    <th className="py-2 pr-4 font-medium">Avg Δ Pain</th>
                    <th className="py-2 pr-4 font-medium">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.triggerPainCorrelation.map(row => {
                    const severity =
                      Math.abs(row.avgDelta) >= 2
                        ? 'strong'
                        : Math.abs(row.avgDelta) >= 1
                          ? 'moderate'
                          : 'mild';
                    const positive = row.avgDelta > 0;
                    return (
                      <tr
                        key={row.trigger}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-3 pr-4 text-foreground capitalize">
                          {row.trigger}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.count}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={positive ? 'destructive' : 'success'}>
                            {positive ? '+' : ''}
                            {row.avgDelta.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {positive
                            ? `${severity} association with higher pain`
                            : `${severity} association with lower pain`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Log triggers alongside your entries to quantify how each factor raises or lowers your
              average pain.
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Context signals (optional fields) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Relief methods</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.topReliefMethods.length > 0 ? (
              <div className="space-y-3">
                {analytics.topReliefMethods.map((item, idx) => (
                  <div key={`${item.trigger}-${idx}`} className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-8 w-8 justify-center rounded-lg flex-shrink-0">
                      {idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{item.trigger}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add relief methods to entries to understand what consistently helps.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Pain quality</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.topQualities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.topQualities.map(item => (
                  <Badge key={item.trigger} variant="outline" className="capitalize">
                    {item.trigger} ({item.count})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Log pain quality (e.g., sharp, burning) to spot patterns.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Activities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.topActivities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.topActivities.map(item => (
                  <Badge key={item.trigger} variant="outline" className="capitalize">
                    {item.trigger} ({item.count})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Log activities to see which ones correlate with flare-ups or relief.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" aria-hidden />
            <CardTitle className="text-lg">Stress & activity level</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Optional signals that help explain why pain changes day-to-day.
          </CardDescription>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card variant="filled" padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Activity level</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.activityLevelStats.count > 0
                    ? `${analytics.activityLevelStats.count} logs · min ${analytics.activityLevelStats.min} · max ${analytics.activityLevelStats.max}`
                    : 'Not logged yet'}
                </p>
              </div>
              <Badge variant={analytics.activityLevelStats.count > 0 ? getSeverityBadgeVariant(analytics.activityLevelStats.avg) : 'secondary'}>
                {analytics.activityLevelStats.count > 0 ? analytics.activityLevelStats.avg.toFixed(1) : '—'}
              </Badge>
            </Card>

            <Card variant="filled" padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Stress</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.stressStats.count > 0
                    ? `${analytics.stressStats.count} logs · min ${analytics.stressStats.min} · max ${analytics.stressStats.max}`
                    : 'Not logged yet'}
                </p>
              </div>
              <Badge variant={analytics.stressStats.count > 0 ? getSeverityBadgeVariant(analytics.stressStats.avg) : 'secondary'}>
                {analytics.stressStats.count > 0 ? analytics.stressStats.avg.toFixed(1) : '—'}
              </Badge>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Seasonality Insight */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Seasonality & cyclical patterns</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">Based on monthly averages</span>
          </div>
        </CardHeader>
        <CardContent>

        {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {monthLabels.map((label, idx) => {
              const monthData = analytics.monthlyTrend.find(m => m.month === idx + 1);
              if (!monthData) {
                return (
                  <div
                    key={label}
                    className="px-4 py-2 rounded-full border border-dashed border-border text-muted-foreground text-sm"
                  >
                    {label}
                  </div>
                );
              }
              const value = monthData.avgPain;
              const badgeVariant = getSeverityBadgeVariant(value);
              return (
                <Badge key={label} variant={badgeVariant} className="px-4 py-2">
                  {label} · {value.toFixed(1)}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add entries across different months to spot seasonal pain cycles (e.g., winter
            flare-ups, summer relief).
          </p>
        )}
        </CardContent>
      </Card>

      {/* Weather correlation */}
      <WeatherCorrelationPanel entries={entries} />

      {/* Nerve Symptoms Analysis */}
      {entries.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <NerveSymptoms entries={entries} />
        </Card>
      )}
    </div>
  );
};

// Predictions View
const PredictionsView: React.FC<{ analytics: AnalyticsSnapshot }> = ({ analytics }) => {
  const flare = analytics.predictedFlare;
  const forecast = analytics.nextWeekForecast;
  const medicationWindow = analytics.optimalMedicationWindow;
  const recommendations = analytics.personalizedRecommendations || [];
  const medicationLeaders = (analytics.medicationEffectiveness || []).slice(0, 3);

  const aggravatingTrigger = analytics.triggerPainCorrelation?.find(item => item.avgDelta > 0);
  const stabilizingTrigger = analytics.triggerPainCorrelation
    ?.slice()
    .reverse()
    .find(item => item.avgDelta < 0);
  const toughestDay = analytics.dayOfWeekPatterns
    ?.filter(d => d.count > 0)
    .sort((a, b) => b.avgPain - a.avgPain)[0];

  const getSeverityBadgeVariant = (value: number) => {
    if (value >= 7) return 'destructive' as const;
    if (value >= 5) return 'warning' as const;
    if (value >= 3) return 'info' as const;
    return 'success' as const;
  };

  const getConfidenceBadgeVariant = (value?: 'high' | 'medium' | 'low') => {
    if (value === 'high') return 'success' as const;
    if (value === 'medium') return 'warning' as const;
    if (value === 'low') return 'secondary' as const;
    return 'secondary' as const;
  };

  const getEmphasisBadgeVariant = (value: 'high' | 'medium' | 'low') => {
    if (value === 'high') return 'destructive' as const;
    if (value === 'medium') return 'warning' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          variant="outlined"
          className={
            flare ? 'border-destructive/30 bg-destructive/5' : 'border-success/30 bg-success/5'
          }
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div>
                <CardDescription className="uppercase tracking-wide">Flare risk</CardDescription>
                <CardTitle className="text-2xl mt-1">
                  {flare ? `${flare.probability}%` : 'Stable'}
                </CardTitle>
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  flare ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}
              >
                <AlertTriangle className="w-6 h-6" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {flare
                ? `Next ${flare.timeframe} · Severity ${flare.severity}`
                : 'No immediate flare risk detected. Keep logging to maintain accuracy.'}
            </p>
            <div className="mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${flare ? 'bg-destructive' : 'bg-success'}`}
                  style={{ width: `${flare ? flare.probability : 20}%` }}
                />
              </div>
              {flare && (
                <ul className="mt-3 text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  {flare.recommendations.map((rec: string) => (
                    <li key={rec}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div>
                <CardDescription className="uppercase tracking-wide">7-day outlook</CardDescription>
                <CardTitle className="text-2xl mt-1">
                  {forecast?.projectedAverage?.toFixed(1) ?? '—'} / 10
                </CardTitle>
              </div>
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Brain className="w-6 h-6" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {forecast ? (
                <>
                  {`${forecast.change >= 0 ? '+' : ''}${forecast.change.toFixed(1)} change vs current average · `}
                  <Badge variant={getConfidenceBadgeVariant(forecast.confidence)}>
                    {forecast.confidence} confidence
                  </Badge>
                </>
              ) : (
                'Need more entries to project forward.'
              )}
            </p>
            {forecast?.narrative ? (
              <p className="text-sm text-muted-foreground mt-3">{forecast.narrative}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div>
                <CardDescription className="uppercase tracking-wide">
                  Optimal medication window
                </CardDescription>
                <CardTitle className="text-xl mt-1">
                  {medicationWindow ? medicationWindow.label : 'Need more data'}
                </CardTitle>
              </div>
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
                <Pill className="w-6 h-6" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {medicationWindow
                ? `Avg relief ${medicationWindow.avgReduction.toFixed(1)} points across ${medicationWindow.count} documented doses. Confidence ${(medicationWindow.confidence * 100).toFixed(0)}%.`
                : 'Log medication usage alongside pain levels to unlock timing insights.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <div>
                <CardDescription className="uppercase tracking-wide">
                  Personalized recommendations
                </CardDescription>
                <CardTitle className="text-2xl mt-1">Next best actions</CardTitle>
              </div>
              <Sparkles className="w-6 h-6 text-primary" aria-hidden />
            </div>
          </CardHeader>

          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keep logging detailed entries (triggers, meds, sleep) to unlock personalized
                guidance.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <Card key={`${rec.title}-${idx}`} variant="filled" padding="sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-semibold text-foreground">{rec.title}</div>
                      <Badge variant={getEmphasisBadgeVariant(rec.emphasis)} className="shrink-0">
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.detail}</p>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div>
              <CardDescription className="uppercase tracking-wide">Supporting signals</CardDescription>
              <CardTitle className="text-lg mt-1">What drives the model</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Card variant="filled" padding="sm" className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Most sensitive trigger</p>
                  <p className="text-sm font-semibold text-foreground">
                    {aggravatingTrigger ? aggravatingTrigger.trigger : 'Need more data'}
                  </p>
                </div>
                {aggravatingTrigger ? (
                  <Badge variant="destructive">+{aggravatingTrigger.avgDelta.toFixed(1)}</Badge>
                ) : null}
              </Card>

              <Card variant="filled" padding="sm" className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Most stable trigger</p>
                  <p className="text-sm font-semibold text-foreground">
                    {stabilizingTrigger ? stabilizingTrigger.trigger : 'Logging needed'}
                  </p>
                </div>
                {stabilizingTrigger ? (
                  <Badge variant="success">{stabilizingTrigger.avgDelta.toFixed(1)}</Badge>
                ) : null}
              </Card>

              <Card variant="filled" padding="sm" className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Peak pain day</p>
                  <p className="text-sm font-semibold text-foreground">
                    {toughestDay ? DAY_LABELS[toughestDay.day] : 'Need weekly coverage'}
                  </p>
                </div>
                {toughestDay ? (
                  <Badge variant={getSeverityBadgeVariant(toughestDay.avgPain)}>
                    {toughestDay.avgPain.toFixed(1)}
                  </Badge>
                ) : null}
              </Card>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Top relief sources
              </p>
              <div className="space-y-2">
                {medicationLeaders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Track medication usage to see which options your body responds to best.
                  </p>
                ) : (
                  medicationLeaders.map(med => (
                    <div key={med.medication} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{med.medication}</span>
                      <Badge variant="success">-{med.avgReduction.toFixed(1)}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Clinical Report View
const ClinicalReportView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({
  analytics,
  entries,
}) => {
  const totalEntries = entries.length;
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const dateFormatter = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
  const rangeStart = sortedEntries[0]?.timestamp;
  const rangeEnd = sortedEntries[sortedEntries.length - 1]?.timestamp;
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  const functionalSummary = entries.reduce(
    (acc, entry) => {
      if (entry.functionalImpact) {
        entry.functionalImpact.limitedActivities?.forEach(item => acc.limitedActivities.add(item));
        entry.functionalImpact.assistanceNeeded?.forEach(item => acc.assistanceNeeded.add(item));
        entry.functionalImpact.mobilityAids?.forEach(item => acc.mobilityAids.add(item));
      }
      if (entry.qualityOfLife) {
        if (typeof entry.qualityOfLife.sleepQuality === 'number') {
          acc.sleepTotal += entry.qualityOfLife.sleepQuality;
          acc.sleepCount += 1;
        }
        if (typeof entry.qualityOfLife.moodImpact === 'number') {
          acc.moodTotal += entry.qualityOfLife.moodImpact;
          acc.moodCount += 1;
        }
      }
      return acc;
    },
    {
      limitedActivities: new Set<string>(),
      assistanceNeeded: new Set<string>(),
      mobilityAids: new Set<string>(),
      sleepTotal: 0,
      sleepCount: 0,
      moodTotal: 0,
      moodCount: 0,
    }
  );

  const workSummary = entries.reduce(
    (acc, entry) => {
      if (entry.workImpact) {
        acc.missedDays += entry.workImpact.missedWork ?? 0;
        entry.workImpact.modifiedDuties?.forEach(item => acc.modifiedDuties.add(item));
        entry.workImpact.workLimitations?.forEach(item => acc.workLimitations.add(item));
      }
      return acc;
    },
    {
      missedDays: 0,
      modifiedDuties: new Set<string>(),
      workLimitations: new Set<string>(),
    }
  );

  const careTeamNotes = analytics.personalizedRecommendations?.slice(0, 3) ?? [];
  const medicationHighlights = analytics.medicationEffectiveness?.slice(0, 3) ?? [];
  const riskLevel =
    analytics.riskScore > 75 ? 'High' : analytics.riskScore > 50 ? 'Elevated' : 'Managed';

  const summaryBullets = [
    `Average reported pain ${analytics.avgPain.toFixed(1)}/10 with ${analytics.volatility.toFixed(1)} volatility`,
    `${analytics.goodDays} good days (${((analytics.goodDays / Math.max(totalEntries, 1)) * 100).toFixed(0)}% of period)`,
    analytics.predictedFlare
      ? `Flare risk ${analytics.predictedFlare.probability}% in next ${analytics.predictedFlare.timeframe}`
      : 'No imminent flare risk detected',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 w-full">
            <div>
              <CardDescription className="text-xs uppercase tracking-[0.2em]">
                Clinical summary
              </CardDescription>
              <CardTitle className="text-2xl mt-2">Pain management report</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {totalEntries > 0
                  ? `${dateFormatter(rangeStart)} – ${dateFormatter(rangeEnd)} (${totalEntries} entries)`
                  : 'Awaiting entries to generate report.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Card variant="filled" padding="sm" className="min-w-[140px]">
                <p className="text-xs text-muted-foreground">Risk level</p>
                <p className="font-semibold text-foreground">{riskLevel}</p>
              </Card>
              <Card variant="filled" padding="sm" className="min-w-[140px]">
                <p className="text-xs text-muted-foreground">Latest entry</p>
                <p className="font-semibold text-foreground">{dateFormatter(latestEntry?.timestamp)}</p>
              </Card>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pain overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
          {summaryBullets.map(bullet => (
            <div key={bullet} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" aria-hidden />
              <p className="text-sm text-muted-foreground">{bullet}</p>
            </div>
          ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Functional impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold">Limited Activities:</span>{' '}
              {functionalSummary.limitedActivities.size > 0
                ? Array.from(functionalSummary.limitedActivities).join(', ')
                : 'Not documented'}
            </p>
            <p>
              <span className="font-semibold">Assistance Needed:</span>{' '}
              {functionalSummary.assistanceNeeded.size > 0
                ? Array.from(functionalSummary.assistanceNeeded).join(', ')
                : 'Not documented'}
            </p>
            <p>
              <span className="font-semibold">Mobility Aids:</span>{' '}
              {functionalSummary.mobilityAids.size > 0
                ? Array.from(functionalSummary.mobilityAids).join(', ')
                : 'Not documented'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              WorkSafe BC readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold">Missed days:</span> {workSummary.missedDays}
            </li>
            <li>
              <span className="font-semibold">Modified duties:</span>{' '}
              {workSummary.modifiedDuties.size > 0
                ? Array.from(workSummary.modifiedDuties).join(', ')
                : 'None recorded'}
            </li>
            <li>
              <span className="font-semibold">Limitations:</span>{' '}
              {workSummary.workLimitations.size > 0
                ? Array.from(workSummary.workLimitations).join(', ')
                : 'None recorded'}
            </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 w-full">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Medication & treatment summary
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Last documented: {dateFormatter(latestEntry?.timestamp)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
          {medicationHighlights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Document medication usage along with pain score changes to surface effectiveness
              insights.
            </p>
          ) : (
            <div className="space-y-3">
              {medicationHighlights.map(med => (
                <Card key={med.medication} variant="filled" padding="sm">
                  <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{med.medication}</p>
                    <p className="text-xs text-muted-foreground">{med.uses} entries</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">-{med.avgReduction.toFixed(1)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Avg pain change</p>
                  </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {analytics.optimalMedicationWindow && (
            <Card
              variant="filled"
              padding="sm"
              className="mt-4 border-primary/20 bg-primary/5"
            >
              <p className="text-sm text-foreground">
                Optimal timing:{' '}
                <span className="font-semibold">{analytics.optimalMedicationWindow.label}</span> ·
                Avg relief {analytics.optimalMedicationWindow.avgReduction.toFixed(1)} · Confidence{' '}
                {(analytics.optimalMedicationWindow.confidence * 100).toFixed(0)}%
              </p>
            </Card>
          )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Provider notes & next steps
            </CardTitle>
          </CardHeader>
          <CardContent>
          {careTeamNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Log detailed context (triggers, interventions) to unlock provider-ready
              recommendations.
            </p>
          ) : (
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              {careTeamNotes.map((note, idx) => (
                <li key={`${note.title}-${idx}`}>
                  <p className="font-semibold text-foreground">{note.title}</p>
                  <p className="text-muted-foreground">{note.detail}</p>
                </li>
              ))}
            </ol>
          )}
          </CardContent>
        </Card>
      </div>

      <Card variant="filled">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Supporting evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="text-xs uppercase">Top pain locations</p>
            <p>
              {analytics.topLocations.length > 0
                ? analytics.topLocations.map(loc => `${loc.location} (${loc.count})`).join(', ')
                : 'Not captured'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase">Primary triggers</p>
            <p>
              {analytics.topTriggers.length > 0
                ? analytics.topTriggers
                    .map(trigger => `${trigger.trigger} (${trigger.count})`)
                    .join(', ')
                : 'Not documented'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase">Quality-of-life metrics</p>
            <p>
              Sleep avg:{' '}
              {functionalSummary.sleepCount > 0
                ? (functionalSummary.sleepTotal / functionalSummary.sleepCount).toFixed(1)
                : '—'}{' '}
              · Mood impact avg:{' '}
              {functionalSummary.moodCount > 0
                ? (functionalSummary.moodTotal / functionalSummary.moodCount).toFixed(1)
                : '—'}
            </p>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Functional Limitations Analysis */}
      {entries.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <FunctionalLimitations entries={entries} />
        </Card>
      )}
    </div>
  );
};

// Insights View - Tree of Thought reasoning
const InsightsView: React.FC<{
  analytics: AnalyticsSnapshot;
  entries: PainEntry[];
  reasoningTree: ReasoningNode[];
  patternAnalysis: PatternAnalysisResult | null;
}> = ({ analytics, entries, reasoningTree, patternAnalysis }) => {
  const entryConfidence = entries.length >= 60 ? 'high' : entries.length >= 25 ? 'medium' : 'low';
  const latestRecommendation = analytics.personalizedRecommendations[0];
  const confidenceBadgeVariant =
    entryConfidence === 'high' ? 'success' : entryConfidence === 'medium' ? 'warning' : 'destructive';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 w-full">
            <div>
              <CardDescription className="text-xs uppercase tracking-[0.3em]">
                Tree-of-thought reasoning
              </CardDescription>
              <CardTitle className="text-2xl mt-2">How conclusions are formed</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Each branch represents a reasoning step that connects raw entries to clinical
                guidance. Confidence is weighted by data coverage.
              </p>
            </div>
            <Badge variant={confidenceBadgeVariant} className="shrink-0">
              Data confidence: {entryConfidence}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ReasoningTree nodes={reasoningTree} depth={0} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2" variant="accented">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Sparkles className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-[0.4em]">
                  Highlighted thought
                </CardDescription>
                <CardTitle className="text-xl mt-1">
                  {latestRecommendation ? latestRecommendation.title : 'Keep logging insights'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestRecommendation
                ? latestRecommendation.detail
                : 'Log triggers, medications, and recovery context to unlock actionable insights.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Coverage snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Total entries analyzed</span>
              <span className="font-semibold text-foreground">{entries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Day-of-week coverage</span>
              <span className="font-semibold text-foreground">
                {analytics.dayOfWeekPatterns.filter(d => d.count > 0).length}/7 days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trigger signals tracked</span>
              <span className="font-semibold text-foreground">
                {analytics.triggerPainCorrelation.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Medication experiments</span>
              <span className="font-semibold text-foreground">
                {analytics.medicationEffectiveness.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Pattern Recognition Results */}
      {patternAnalysis && (
        <div className="space-y-6">
          <Card variant="accented">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                  <Brain className="w-6 h-6" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-xl">Heuristic pattern recognition</CardTitle>
                  <CardDescription>Advanced analysis powered by local algorithms</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="filled" padding="sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Trend slope</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {patternAnalysis.dailyTrend.length > 0
                      ? (
                          patternAnalysis.dailyTrend[patternAnalysis.dailyTrend.length - 1].value -
                          patternAnalysis.dailyTrend[0].value
                        ).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Recent trend direction</p>
                </Card>

                <Card variant="filled" padding="sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Episodes detected
                  </p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {patternAnalysis.episodes.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Flare patterns identified</p>
                </Card>

                <Card variant="filled" padding="sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Data quality</p>
                  <p className="text-2xl font-semibold text-foreground mt-1 capitalize">
                    {patternAnalysis.meta.dataQuality}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {patternAnalysis.meta.entryCount} entries analyzed
                  </p>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Episodes Timeline */}
          {patternAnalysis.episodes.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden />
                  <CardTitle className="text-lg">
                    Pain episodes ({patternAnalysis.episodes.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patternAnalysis.episodes.slice(0, 5).map((episode, idx) => (
                    <div key={idx} className="border-l-4 border-l-destructive pl-4 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground capitalize">
                            {episode.severity} severity
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {episode.durationDays} days • Peak: {episode.peakPain.toFixed(1)}/10
                          </p>
                        </div>
                        {episode.recoveryDays !== null && (
                          <div className="text-sm text-muted-foreground">
                            Recovery: {episode.recoveryDays}d
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trigger Correlations */}
          {patternAnalysis.triggerCorrelations.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" aria-hidden />
                  <CardTitle className="text-lg">Trigger correlations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patternAnalysis.triggerCorrelations.slice(0, 5).map((corr, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{corr.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {corr.support} occurrences • {corr.confidence.toFixed(0)}% confidence
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={corr.deltaPain > 0 ? 'destructive' : 'success'}>
                          {corr.deltaPain > 0 ? '+' : ''}
                          {corr.deltaPain.toFixed(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{corr.strength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QoL Patterns */}
          {patternAnalysis.qolPatterns.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" aria-hidden />
                  <CardTitle className="text-lg">Quality of life insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {patternAnalysis.qolPatterns.map((pattern, idx) => (
                    <Card key={idx} variant="filled" padding="sm">
                      <div className="flex items-center gap-2 mb-2">
                        {pattern.metric === 'sleep' && <Moon className="w-4 h-4" aria-hidden />}
                        {pattern.metric === 'mood' && <Sun className="w-4 h-4" aria-hidden />}
                        {pattern.metric === 'activity' && (
                          <Activity className="w-4 h-4" aria-hidden />
                        )}
                        <p className="font-semibold text-foreground capitalize">{pattern.metric}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 capitalize">
                        {pattern.correlation} correlation
                      </p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cautions */}
          {patternAnalysis.meta.cautions.length > 0 && (
            <Card variant="outlined" className="border-warning/30 bg-warning/10" padding="sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" aria-hidden />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Analysis notes</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {patternAnalysis.meta.cautions.map((caution, idx) => (
                      <li key={idx}>• {caution}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const ReasoningTree: React.FC<{ nodes: ReasoningNode[]; depth: number }> = ({ nodes, depth }) => {
  if (!nodes.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Not enough data yet. Add a few detailed entries to unlock automated reasoning.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nodes.map(node => (
        <Card key={node.id} variant="filled" padding="sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Step {depth + 1}
              </p>
              <h4 className="text-lg font-semibold text-foreground mt-1">{node.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{node.insight}</p>
              {node.evidence && (
                <p className="mt-2 text-xs text-muted-foreground">Evidence: {node.evidence}</p>
              )}
              {node.action && (
                <p className="mt-2 text-sm text-primary font-medium">Next action: {node.action}</p>
              )}
            </div>
            <Badge
              variant={
                node.confidence === 'high'
                  ? 'success'
                  : node.confidence === 'medium'
                    ? 'warning'
                    : 'destructive'
              }
              className="shrink-0"
            >
              {node.confidence} confidence
            </Badge>
          </div>

          {node.children && node.children.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-dashed border-border space-y-4">
              <ReasoningTree nodes={node.children} depth={depth + 1} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

const buildReasoningTree = (analytics: AnalyticsSnapshot, entryCount: number): ReasoningNode[] => {
  if (entryCount === 0) {
    return [
      {
        id: 'empty-state',
        title: 'No evidence yet',
        insight: 'Log at least one pain entry to begin automated reasoning.',
        confidence: 'low',
        action: 'Capture today’s pain level and triggers.',
      },
    ];
  }

  const coverageConfidence: ReasoningNode['confidence'] =
    entryCount >= 60 ? 'high' : entryCount >= 25 ? 'medium' : 'low';

  const patternNode: ReasoningNode = {
    id: 'patterns',
    title: 'Temporal & trigger patterns',
    insight: `Detected ${analytics.dayOfWeekPatterns.filter(d => d.count > 0).length}/7 day patterns and ${analytics.timePatterns.morning.count + analytics.timePatterns.afternoon.count + analytics.timePatterns.evening.count + analytics.timePatterns.night.count} time-of-day observations.`,
    confidence: coverageConfidence,
    evidence: analytics.triggerPainCorrelation[0]
      ? `${analytics.triggerPainCorrelation[0].trigger} shifts pain by ${analytics.triggerPainCorrelation[0].avgDelta.toFixed(1)}`
      : 'Need more trigger tagging',
    action: analytics.triggerPainCorrelation[0]
      ? `Mitigate ${analytics.triggerPainCorrelation[0].trigger} exposure on ${DAY_LABELS[analytics.dayOfWeekPatterns.sort((a, b) => b.avgPain - a.avgPain)[0]?.day ?? 0]}`
      : 'Log triggers alongside entries for richer pattern detection.',
    children: analytics.dayOfWeekPatterns
      .filter(day => day.count > 0)
      .slice(0, 2)
      .map(day => ({
        id: `day-${day.day}`,
        title: `${DAY_LABELS[day.day]} trend`,
        insight: `Average pain ${day.avgPain.toFixed(1)} with ${day.count} observations`,
        confidence: day.count >= 4 ? 'medium' : 'low',
        action:
          day.avgPain >= analytics.avgPain
            ? 'Prep pacing plan ahead of this day.'
            : 'Consider scheduling recovery work here.',
      })),
  };

  const riskNode: ReasoningNode = {
    id: 'risk',
    title: 'Risk posture & flare outlook',
    insight: `Risk score ${analytics.riskScore} with ${analytics.badDays} high-pain days.`,
    confidence: analytics.riskScore >= 70 ? 'high' : analytics.riskScore >= 40 ? 'medium' : 'low',
    evidence: analytics.predictedFlare
      ? `Flare probability ${analytics.predictedFlare.probability}% (${analytics.predictedFlare.timeframe})`
      : 'No imminent flare detected',
    action: analytics.predictedFlare
      ? analytics.predictedFlare.recommendations[0]
      : 'Maintain current pacing plan and continue monitoring.',
    children: [
      analytics.optimalMedicationWindow && {
        id: 'med-window',
        title: 'Medication timing',
        insight: `Best relief around ${analytics.optimalMedicationWindow.label}.`,
        confidence: analytics.optimalMedicationWindow.confidence >= 0.75 ? 'high' : 'medium',
        action: 'Align doses with this window when medically appropriate.',
      },
      analytics.medicationEffectiveness[0] && {
        id: 'med-effectiveness',
        title: `${analytics.medicationEffectiveness[0].medication} response`,
        insight: `Avg reduction ${analytics.medicationEffectiveness[0].avgReduction.toFixed(1)} points.`,
        confidence: analytics.medicationEffectiveness[0].uses >= 3 ? 'high' : 'medium',
        action: 'Document dosage notes for provider review.',
      },
    ].filter(Boolean) as ReasoningNode[],
  };

  const clinicalNode: ReasoningNode = {
    id: 'clinical',
    title: 'Clinical + WorkSafe readiness',
    insight: `${analytics.goodDays} managed days vs ${analytics.badDays} tough days.`,
    confidence: coverageConfidence,
    evidence: `Top locations: ${
      analytics.topLocations
        .slice(0, 2)
        .map(loc => loc.location)
        .join(', ') || 'N/A'
    }`,
    action: 'Use export tab to share WorkSafe-ready PDF.',
    children: analytics.personalizedRecommendations.slice(0, 2).map(rec => ({
      id: `rec-${rec.title}`,
      title: rec.title,
      insight: rec.detail,
      confidence: rec.emphasis === 'high' ? 'high' : rec.emphasis === 'medium' ? 'medium' : 'low',
      action:
        rec.category === 'medication'
          ? 'Confirm with care team before adjusting meds.'
          : 'Add notes after acting on this insight.',
    })),
  };

  return [
    {
      id: 'root',
      title: 'Premium analytics reasoning loop',
      insight: `Analyzed ${entryCount} entries with average pain ${analytics.avgPain.toFixed(1)}/10 and volatility ${analytics.volatility.toFixed(1)}.`,
      confidence: coverageConfidence,
      children: [patternNode, riskNode, clinicalNode],
    },
  ];
};

// Export View - Full workflow
const ExportView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({
  analytics,
  entries,
}) => {
  const [isQuickExporting, setIsQuickExporting] = useState<'csv' | 'json' | null>(null);
  const [quickExportError, setQuickExportError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyErrorMessage, setCopyErrorMessage] = useState<string>(
    'Clipboard unavailable. You can still select this summary and copy it whenever you feel ready to share.'
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showValidationHistory, setShowValidationHistory] = useState(false);
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    return !navigator.onLine;
  });
  const { preferences } = useTraumaInformed();
  const { validationHistory, addValidation, clearHistory } = useEmotionalValidation();

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [entries]
  );

  useEffect(() => {
    setShowValidationHistory(preferences.realTimeValidation);
  }, [preferences.realTimeValidation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const updateStatus = () => {
      if (typeof navigator === 'undefined') {
        setIsOffline(false);
        return;
      }
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const validationIsActive = useMemo(
    () => ENABLE_VALIDATION_EXPORT && preferences.realTimeValidation,
    [preferences.realTimeValidation]
  );

  const rangeLabel = useMemo(() => {
    if (sortedEntries.length === 0) {
      return 'No entries yet';
    }
    const start = new Date(sortedEntries[0].timestamp);
    const end = new Date(sortedEntries[sortedEntries.length - 1].timestamp);
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  }, [sortedEntries]);

  const rangeSlug = useMemo(() => {
    if (sortedEntries.length === 0) {
      return 'no-data';
    }
    const start = new Date(sortedEntries[0].timestamp).toISOString().split('T')[0];
    const end = new Date(sortedEntries[sortedEntries.length - 1].timestamp)
      .toISOString()
      .split('T')[0];
    return `${start}-to-${end}`;
  }, [sortedEntries]);

  const riskLevel =
    analytics.riskScore > 75 ? 'High' : analytics.riskScore > 50 ? 'Elevated' : 'Managed';
  const topTriggers =
    analytics.topTriggers
      ?.slice?.(0, 2)
      .map(trigger => trigger.trigger)
      .filter(Boolean)
      .join(', ') || 'Not captured';
  const topLocationsSummary =
    analytics.topLocations
      ?.slice?.(0, 2)
      .map(loc => loc.location)
      .filter(Boolean)
      .join(', ') || 'Not captured';
  const recommendation =
    analytics.personalizedRecommendations?.[0]?.detail ??
    'Keep logging detailed entries (triggers, interventions, medications) to unlock personalized recommendations.';
  const forecastLine = analytics.nextWeekForecast
    ? `${analytics.nextWeekForecast.projectedAverage.toFixed(1)}/10 avg (${analytics.nextWeekForecast.change >= 0 ? '+' : ''}${analytics.nextWeekForecast.change.toFixed(1)} change · confidence ${analytics.nextWeekForecast.confidence})`
    : 'Need more entries to forecast next week.';

  const shareSummary = useMemo(() => {
    if (sortedEntries.length === 0) {
      return 'No entries logged yet. Capture at least one day of pain data to unlock exportable summaries.';
    }
    return [
      `Pain Tracker clinical snapshot (${rangeLabel}, ${sortedEntries.length} entries)`,
      '',
      `• Avg pain ${analytics.avgPain.toFixed(1)}/10 · Volatility ${analytics.volatility.toFixed(1)}`,
      `• Good days ${analytics.goodDays} · Risk level ${riskLevel}`,
      `• Top locations: ${topLocationsSummary}`,
      `• Triggers to watch: ${topTriggers}`,
      `• Forecast: ${forecastLine}`,
      `• Recommendation: ${recommendation}`,
    ].join('\n');
  }, [
    analytics.avgPain,
    analytics.goodDays,
    analytics.volatility,
    forecastLine,
    rangeLabel,
    recommendation,
    riskLevel,
    sortedEntries.length,
    topLocationsSummary,
    topTriggers,
  ]);

  const logExportAudit = useCallback(
    async ({
      action,
      actionType = 'export',
      outcome = 'success',
      details = {},
    }: {
      action: string;
      actionType?: AuditActionType;
      outcome?: AuditOutcome;
      details?: Record<string, unknown>;
    }) => {
      try {
        await hipaaComplianceService.logAuditEvent({
          actionType,
          userId: 'local-user',
          userRole: 'patient',
          resourceType: 'PremiumAnalyticsExport',
          outcome,
          details: {
            action,
            timeRange: rangeLabel,
            entryCount: entries.length,
            ...details,
          },
        });
      } catch (error) {
        console.error('HIPAA audit logging failed', error);
      }
    },
    [entries.length, rangeLabel]
  );

  const handleQuickExport = useCallback(
    async (format: 'csv' | 'json') => {
      if (entries.length === 0) {
        setQuickExportError('Log at least one entry before exporting.');
        await logExportAudit({
          action: 'quick-export',
          outcome: 'failure',
          details: { reason: 'no-entries', format },
        });
        return;
      }

      setIsQuickExporting(format);
      setQuickExportError(null);

      try {
        const mod = await import('../../utils/pain-tracker/export');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `premium-analytics-${rangeSlug}-${timestamp}.${format === 'csv' ? 'csv' : 'json'}`;

        if (format === 'csv') {
          const csv = mod.exportToCSV(entries);
          mod.downloadData(csv, filename, 'text/csv;charset=utf-8');
        } else {
          const json = mod.exportToJSON(entries);
          mod.downloadData(json, filename, 'application/json;charset=utf-8');
        }
        await logExportAudit({
          action: 'quick-export',
          details: { format, filename },
        });
      } catch (error) {
        console.error('Quick export failed', error);
        setQuickExportError('Quick export failed. Try the advanced export workspace.');
        await logExportAudit({
          action: 'quick-export',
          outcome: 'failure',
          details: { format, error: error instanceof Error ? error.message : 'unknown-error' },
        });
      } finally {
        setIsQuickExporting(null);
      }
    },
    [entries, logExportAudit, rangeSlug]
  );

  const handleCopySummary = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareSummary);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = shareSummary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setShareStatus('copied');
      setCopyErrorMessage('');
      await logExportAudit({
        action: 'copy-clinical-summary',
        details: { channel: 'clipboard' },
      });
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (error) {
      console.error('Clipboard copy failed', error);
      setShareStatus('error');
      setCopyErrorMessage(
        error instanceof Error
          ? error.message
          : 'Clipboard is unavailable. You can still highlight the summary above and copy it manually if and when you choose to share it.'
      );
      await logExportAudit({
        action: 'copy-clinical-summary',
        outcome: 'failure',
        details: {
          error: error instanceof Error ? error.message : 'unknown-error',
          channel: 'clipboard',
        },
      });
    }
  }, [logExportAudit, shareSummary]);

  const handleOpenAdvancedModal = useCallback(() => {
    setShowAdvancedModal(true);
    logExportAudit({
      action: 'open-advanced-export-workspace',
      actionType: 'access',
      details: { isOffline },
    });
  }, [isOffline, logExportAudit]);

  const handleEmailShare = useCallback(async () => {
    if (isOffline) {
      setEmailError('Email composer unavailable offline. Try again once you reconnect.');
      await logExportAudit({
        action: 'compose-email-share',
        outcome: 'failure',
        details: { reason: 'offline' },
      });
      return;
    }
    if (typeof window === 'undefined') {
      setEmailError('Email composer unavailable in this environment.');
      await logExportAudit({
        action: 'compose-email-share',
        outcome: 'failure',
        details: { reason: 'no-window' },
      });
      return;
    }
    setEmailError(null);
    const subject = encodeURIComponent('Pain Tracker clinical snapshot');
    const body = encodeURIComponent(shareSummary);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    await logExportAudit({
      action: 'compose-email-share',
      details: { channel: 'email' },
    });
  }, [isOffline, logExportAudit, shareSummary]);

  return (
    <>
      <div className="space-y-6">
        {isOffline && (
          <Card
            variant="outlined"
            padding="sm"
            className="border-warning/30 bg-warning/10"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-foreground">Offline mode detected</p>
            <p className="text-sm text-muted-foreground">
              Quick downloads stay fully local. Email sharing is paused until you're back online,
              and the advanced export workspace will reopen with cached data only.
            </p>
          </Card>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 w-full">
                <div>
                  <CardDescription className="text-xs uppercase tracking-[0.2em]">
                    Clinical-grade exports
                  </CardDescription>
                  <CardTitle className="text-2xl mt-2">Share securely with care teams</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate WorkSafe BC-ready PDFs or quickly download data snapshots without
                    leaving the browser.
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                  <FileText className="w-6 h-6" aria-hidden />
                </div>
              </div>
            </CardHeader>
            <CardContent>

            <React.Suspense
              fallback={
                <Card variant="filled" padding="sm" className="mt-4">
                  <p className="text-sm text-muted-foreground">Preparing clinical export tools…</p>
                </Card>
              }
            >
              <ClinicalPDFExportButtonLazy entries={entries} className="mt-6" />
            </React.Suspense>

            <Button
              onClick={handleOpenAdvancedModal}
              variant="outline"
              fullWidth
              className="mt-4 border-dashed"
              leftIcon={<Filter className="w-4 h-4" aria-hidden />}
            >
              Open advanced export workspace
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Button
                onClick={() => handleQuickExport('csv')}
                disabled={isQuickExporting !== null}
                loading={isQuickExporting === 'csv'}
                leftIcon={<FileSpreadsheet className="w-5 h-5" aria-hidden />}
              >
                Quick CSV
              </Button>
              <Button
                onClick={() => handleQuickExport('json')}
                disabled={isQuickExporting !== null}
                loading={isQuickExporting === 'json'}
                variant="secondary"
                leftIcon={<FileJson className="w-5 h-5" aria-hidden />}
              >
                Quick JSON
              </Button>
            </div>

            {quickExportError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {quickExportError}
              </p>
            )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 w-full">
                <div>
                  <CardDescription className="text-xs uppercase tracking-[0.3em]">
                    Provider snapshot
                  </CardDescription>
                  <CardTitle className="text-2xl mt-2">Copy or email a clinical summary</CardTitle>
                </div>
                <Share2 className="w-6 h-6 text-primary" aria-hidden />
              </div>
            </CardHeader>
            <CardContent>

            <textarea
              readOnly
              value={shareSummary}
              className="mt-4 w-full min-h-[220px] rounded-2xl border border-border bg-muted/50 text-sm text-foreground p-4 font-mono"
            />

            {validationIsActive && (
              <div className="mt-4 space-y-3" aria-live="polite">
                <EmotionalValidation
                  text={shareSummary}
                  isActive={validationIsActive}
                  delay={1200}
                  onValidationGenerated={addValidation}
                />
                {validationHistory.length > 0 && (
                  <Card variant="filled" padding="sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        Recent validation messages
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="link"
                          size="xs"
                          onClick={() => setShowValidationHistory(prev => !prev)}
                        >
                          {showValidationHistory ? 'Hide history' : 'Show history'}
                        </Button>
                        <Button type="button" variant="ghost" size="xs" onClick={clearHistory}>
                          Clear
                        </Button>
                      </div>
                    </div>
                    {showValidationHistory && (
                      <div className="mt-2">
                        <ValidationHistory validations={validationHistory} onClear={clearHistory} />
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={handleCopySummary}
                variant={shareStatus === 'copied' ? 'success' : 'default'}
                leftIcon={<ClipboardCheck className="w-4 h-4" aria-hidden />}
              >
                {shareStatus === 'copied' ? 'Copied summary' : 'Copy summary'}
              </Button>
              <Button
                onClick={handleEmailShare}
                disabled={isOffline}
                variant="outline"
                leftIcon={<Mail className="w-4 h-4" aria-hidden />}
              >
                Compose secure email
              </Button>
            </div>

            {shareStatus === 'error' && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {copyErrorMessage ||
                  'Clipboard unavailable. Select the text above and copy manually instead.'}
              </p>
            )}
            {emailError && (
              <p className="text-sm text-warning mt-2" role="alert">
                {emailError}
              </p>
            )}
            </CardContent>
          </Card>
        </div>

        <Card variant="accented">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Shield className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-xl">Security-first export guarantees</CardTitle>
                <CardDescription>
                  Exports never leave your device unencrypted. You retain full control over every
                  download and share event.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                <span>
                  All exports are generated client-side with the same encryption posture as the
                  rest of the app.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                <span>
                  Audit trails are available through the HIPAA compliance service for every export
                  action.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                <span>
                  Use trauma-informed sharing prompts to maintain agency during clinical
                  conversations.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {showAdvancedModal && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-foreground/40 z-50">
              <Card padding="lg" className="max-w-sm w-full">
                <p className="text-sm text-muted-foreground">Loading export workspace…</p>
              </Card>
            </div>
          }
        >
          <DataExportModalLazy
            isOpen={showAdvancedModal}
            onClose={() => setShowAdvancedModal(false)}
            entries={entries}
            title="Clinical export workspace"
          />
        </React.Suspense>
      )}
    </>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
}) => {
  const iconToneClassName =
    color === 'red'
      ? 'bg-destructive/10 text-destructive'
      : color === 'yellow'
        ? 'bg-warning/10 text-warning'
        : color === 'green'
          ? 'bg-success/10 text-success'
          : 'bg-primary/10 text-primary';

  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const trendValue = hasTrend ? trend : 0;

  const trendBadgeVariant: BadgeProps['variant'] | null = !hasTrend
    ? null
    : trendValue > 0
      ? 'destructive'
      : trendValue < 0
        ? 'success'
        : 'secondary';

  return (
    <Card hover="scale">
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-semibold text-foreground mt-1">{value}</div>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconToneClassName}`}>
            <Icon className="w-6 h-6" aria-hidden />
          </div>
          {trendBadgeVariant ? (
            <Badge variant={trendBadgeVariant}>
              <span className="inline-flex items-center gap-1">
                {trendValue > 0 ? (
                  <TrendingUp className="w-3 h-3" aria-hidden />
                ) : trendValue < 0 ? (
                  <TrendingDown className="w-3 h-3" aria-hidden />
                ) : null}
                {Math.abs(trendValue).toFixed(1)}%
              </span>
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

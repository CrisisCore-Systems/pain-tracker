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
  Pill
} from 'lucide-react';
import type { PainEntry } from '../../types';
import { EmotionalValidation, ValidationHistory, useEmotionalValidation } from '../../validation-technology';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import { hipaaComplianceService } from '../../services/HIPAACompliance';
import type { AuditTrail } from '../../services/HIPAACompliance';
import { analyzePatterns } from '../../utils/pain-tracker/pattern-engine';
import type { PatternAnalysisResult } from '../../types/pattern-engine';

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

interface AnalyticsSnapshot {
  avgPain: number;
  trend: number;
  volatility: number;
  goodDays: number;
  badDays: number;
  topLocations: LocationStat[];
  topTriggers: TriggerStat[];
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
  { id: 'late-night', start: 23, end: 24, label: '11 PM – Midnight' }
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

const getEnv = () => {
  try {
    if (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env as Record<string, any>;
    }
  } catch (_) {
    // ignore
  }
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env as Record<string, any>;
  }
  return {} as Record<string, any>;
};

const ENABLE_VALIDATION_EXPORT = (() => {
  const env = getEnv();
  return env.VITE_REACT_APP_ENABLE_VALIDATION !== 'false' && env.REACT_APP_ENABLE_VALIDATION !== 'false';
})();

type AuditActionType = AuditTrail['actionType'];
type AuditOutcome = AuditTrail['outcome'];

const ClinicalPDFExportButtonLazy = React.lazy(() =>
  import('../export/ClinicalPDFExportButton').then((module) => ({ default: module.ClinicalPDFExportButton }))
);

const DataExportModalLazy = React.lazy(() =>
  import('../export/DataExportModal').then((module) => ({ default: module.DataExportModal }))
);

interface PremiumAnalyticsDashboardProps {
  entries: PainEntry[];
}

export const PremiumAnalyticsDashboard: React.FC<PremiumAnalyticsDashboardProps> = ({ entries }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [view, setView] = useState<'overview' | 'patterns' | 'predictions' | 'clinical' | 'export' | 'insights'>('overview');

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
    const avgPain = filteredEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / filteredEntries.length;
    
    // Trend calculation (comparing first half to second half)
    const midpoint = Math.floor(filteredEntries.length / 2);
    const firstHalfAvg = filteredEntries.slice(0, midpoint).reduce((sum, e) => sum + e.baselineData.pain, 0) / midpoint;
    const secondHalfAvg = filteredEntries.slice(midpoint).reduce((sum, e) => sum + e.baselineData.pain, 0) / (filteredEntries.length - midpoint);
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    // Volatility (standard deviation)
    const variance = filteredEntries.reduce((sum, e) => sum + Math.pow(e.baselineData.pain - avgPain, 2), 0) / filteredEntries.length;
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
        percentage: (count / filteredEntries.length) * 100
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
        percentage: (count / filteredEntries.length) * 100
      }));

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
    const medicationTimingBuckets: Record<string, { count: number; totalReduction: number; label: string }> = {};
    const getWindowForHour = (hour: number) => {
      return MEDICATION_WINDOWS.find(window => hour >= window.start && hour < window.end) ?? MEDICATION_WINDOWS[MEDICATION_WINDOWS.length - 1];
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

    const dayOfWeekSummary: DayOfWeekPattern[] = Object.entries(dayOfWeekPatterns).map(([day, data]) => ({
      day: Number(day),
      count: data.count,
      avgPain: data.count > 0 ? data.totalPain / data.count : 0,
    }));

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
    const medicationData: Record<string, { uses: number; totalReduction: number }> = {};
    filteredEntries.forEach((entry, idx) => {
      if (entry.medications && entry.medications.current.length > 0 && idx < filteredEntries.length - 1) {
        const nextEntry = filteredEntries[idx + 1];
        const reduction = entry.baselineData.pain - nextEntry.baselineData.pain;
        const hour = new Date(entry.timestamp).getHours();
        const windowInfo = getWindowForHour(hour);
        
        if (!medicationTimingBuckets[windowInfo.id]) {
          medicationTimingBuckets[windowInfo.id] = { count: 0, totalReduction: 0, label: windowInfo.label };
        }
        medicationTimingBuckets[windowInfo.id].count++;
        medicationTimingBuckets[windowInfo.id].totalReduction += reduction;

        entry.medications.current.forEach((med) => {
          if (!medicationData[med.name]) {
            medicationData[med.name] = { uses: 0, totalReduction: 0 };
          }
          medicationData[med.name].uses++;
          medicationData[med.name].totalReduction += reduction;
        });
      }
    });

    const medicationEffectiveness: MedicationEffectStat[] = Object.entries(medicationData)
      .map(([medication, data]) => ({
        medication,
        uses: data.uses,
        avgReduction: data.totalReduction / data.uses,
        effectiveness: ((data.totalReduction / data.uses) / 10) * 100 // as percentage
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness);

    const medicationTimingInsights: MedicationWindowInsight[] = Object.entries(medicationTimingBuckets)
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
    const recentAvg = recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length;
    const isIncreasing = recentEntries.slice(-3).every((e, i, arr) => i === 0 || e.baselineData.pain >= arr[i - 1].baselineData.pain);
    
    const predictedFlare: PredictedFlare | null = recentAvg > 6 && isIncreasing ? {
      probability: Math.min(95, Math.round((recentAvg / 10) * 100)),
      timeframe: '24-48 hours',
      severity: recentAvg > 8 ? 'high' : 'moderate',
      recommendations: [
        'Consider preventive medication',
        'Reduce strenuous activities',
        'Ensure adequate rest',
        'Monitor trigger exposure'
      ]
  } : null;

    // Risk score (0-100)
    const riskScore = Math.min(100, Math.round(
      (avgPain * 10) + 
      (volatility * 5) + 
      ((badDays / filteredEntries.length) * 30) +
      (isIncreasing ? 20 : 0)
    ));

    // Improvement score (0-100)
    const improvementScore = Math.max(0, Math.min(100, Math.round(
      100 - (avgPain * 10) - 
      (trend > 0 ? trend : 0) +
      ((goodDays / filteredEntries.length) * 30) -
      (volatility * 5)
    )));

    const projectedChange = trend > 5 ? 0.8 : trend > 0 ? 0.4 : trend < -5 ? -0.7 : trend < 0 ? -0.3 : 0;
    const projectedAverage = clamp(avgPain + projectedChange, 0, 10);
    const confidence = filteredEntries.length >= 40 ? 'high' : filteredEntries.length >= 20 ? 'medium' : 'low';
    const trendDescriptor = projectedChange > 0.3 ? 'worsening' : projectedChange < -0.3 ? 'improving' : 'holding steady';
    const nextWeekForecast: NextWeekForecast = {
      projectedAverage,
      change: projectedChange,
      confidence,
      narrative: `Pain levels are ${trendDescriptor} based on the last ${filteredEntries.length} entries.`
    };

    const personalizedRecommendations: PersonalizedRecommendation[] = [];

    if (predictedFlare) {
      personalizedRecommendations.push({
        title: 'Prepare for possible flare',
        detail: `Probability ${predictedFlare.probability}% in the next ${predictedFlare.timeframe}. Emphasize pacing and preventive care now.`,
        category: 'flare',
        emphasis: predictedFlare.severity === 'high' ? 'high' : 'medium'
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
        emphasis: 'medium'
      });
    }

    const aggravatingTrigger = triggerPainCorrelation.find(trigger => trigger.avgDelta > 1);
    if (aggravatingTrigger) {
      personalizedRecommendations.push({
        title: `${aggravatingTrigger.trigger} drives pain`,
        detail: `Pain averages +${aggravatingTrigger.avgDelta.toFixed(1)} when this trigger appears. Create a mitigation plan or log exposure notes.`,
        category: 'trigger',
        emphasis: 'high'
      });
    }

    const standoutMedication = medicationEffectiveness.find(med => med.avgReduction > 0.5);
    if (standoutMedication) {
      personalizedRecommendations.push({
        title: `${standoutMedication.medication} shows relief`,
        detail: `Average reduction ${standoutMedication.avgReduction.toFixed(1)} points across ${standoutMedication.uses} uses. Remember to document dosing accuracy.`,
        category: 'medication',
        emphasis: 'medium'
      });
    }

    if (optimalMedicationWindow && optimalMedicationWindow.avgReduction > 0.3) {
      personalizedRecommendations.push({
        title: 'Optimize medication timing',
        detail: `Greatest relief occurs around ${optimalMedicationWindow.label}. Aim to medicate within this window when feasible.`,
        category: 'medication',
        emphasis: 'medium'
      });
    }

    if (personalizedRecommendations.length === 0) {
      personalizedRecommendations.push({
        title: 'Keep logging for smarter predictions',
        detail: 'More varied entries (triggers, medication notes, sleep quality) will unlock individualized recommendations.',
        category: 'routine',
        emphasis: 'low'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Premium Analytics</h1>
                <p className="text-blue-100 mt-1">Advanced insights powered by clinical-grade algorithms</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-6">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
              { value: 'all', label: 'All Time' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as typeof timeRange)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${timeRange === option.value
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'patterns', label: 'Pattern Analysis', icon: Waves },
              { id: 'predictions', label: 'Predictions', icon: Brain },
              { id: 'clinical', label: 'Clinical Report', icon: Heart },
              { id: 'insights', label: 'AI Insights', icon: Sparkles },
              { id: 'export', label: 'Export & Share', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as typeof view)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                    ${view === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'overview' && <OverviewView analytics={analytics} entries={filteredEntries} />}
  {view === 'patterns' && <PatternsView analytics={analytics} />}
  {view === 'predictions' && <PredictionsView analytics={analytics} />}
        {view === 'clinical' && <ClinicalReportView analytics={analytics} entries={filteredEntries} />}
        {view === 'insights' && (
          <InsightsView 
            analytics={analytics} 
            entries={filteredEntries} 
            reasoningTree={reasoningTree}
            patternAnalysis={patternAnalysis}
          />
        )}
        {view === 'export' && <ExportView analytics={analytics} entries={filteredEntries} />}
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({ analytics, entries }) => {
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
          subtitle={`${((analytics.goodDays / entries.length) * 100).toFixed(0)}% of total`}
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
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">⚠️ Flare Risk Detected</h3>
              <p className="text-red-100 mb-4">
                Our predictive algorithm has identified a <strong>{analytics.predictedFlare.probability}% probability</strong> of a pain flare within the next <strong>{analytics.predictedFlare.timeframe}</strong>.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Recommended Actions:</p>
                <ul className="space-y-1 text-red-100">
                  {analytics.predictedFlare.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Locations & Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pain Locations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Most Affected Areas
          </h3>
          <div className="space-y-3">
            {analytics.topLocations.map((loc, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{loc.location}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{loc.count} times</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${loc.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Triggers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Common Triggers
          </h3>
          <div className="space-y-3">
            {analytics.topTriggers.length > 0 ? (
              analytics.topTriggers.map((trigger, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-lg flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{trigger.trigger}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{trigger.count} times</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${trigger.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No triggers tracked yet. Start logging triggers to see patterns!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Time of Day Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Pain Patterns by Time of Day
        </h3>
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
            const color = intensity >= 7 ? 'red' : intensity >= 5 ? 'yellow' : intensity >= 3 ? 'blue' : 'green';
            
            return (
              <div key={period} className={`p-4 rounded-xl border-2 ${
                color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${
                    color === 'red' ? 'text-red-600' :
                    color === 'yellow' ? 'text-yellow-600' :
                    color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{period}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {data.avgIntensity.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {data.count} entries
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medication Effectiveness */}
      {analytics.medicationEffectiveness.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Medication Effectiveness Analysis
          </h3>
          <div className="space-y-3">
            {analytics.medicationEffectiveness.map((med, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{med.medication}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{med.uses} uses</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        med.effectiveness > 50 ? 'bg-green-100 text-green-700' :
                        med.effectiveness > 20 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {med.effectiveness.toFixed(0)}% effective
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        med.effectiveness > 50 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        med.effectiveness > 20 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${Math.min(100, med.effectiveness)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Avg reduction: {med.avgReduction.toFixed(1)} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Patterns View - Advanced Analytics
const PatternsView: React.FC<{ analytics: AnalyticsSnapshot }> = ({ analytics }) => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const timeOfDayOrder: Array<{ key: keyof typeof analytics.timePatterns; label: string; window: string; Icon: typeof Sun }> = [
    { key: 'morning', label: 'Morning', window: '5a - 12p', Icon: Sun },
    { key: 'afternoon', label: 'Afternoon', window: '12p - 5p', Icon: Sun },
    { key: 'evening', label: 'Evening', window: '5p - 9p', Icon: Moon },
    { key: 'night', label: 'Night', window: '9p - 5a', Icon: Moon },
  ];

  const getSeverityColor = (value: number) => {
    if (value >= 7) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
    if (value >= 5) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
    if (value >= 3) return 'text-sky-600 bg-sky-50 dark:bg-sky-900/30';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time & Day Patterns */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Time & Day Patterns</h3>
            </div>
            <span className="text-xs uppercase tracking-wide text-indigo-500 font-semibold">Live</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Highlighting when pain is most likely to spike based on your historical entries.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Time of Day</h4>
              <div className="grid grid-cols-2 gap-2">
                {timeOfDayOrder.map(({ key, label, window, Icon }) => {
                  const data = analytics.timePatterns[key];
                  const avg = data && data.count > 0 ? data.avgIntensity : null;
                  return (
                    <div key={String(key)} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{window}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-sm font-semibold ${avg === null ? 'text-gray-400' : getSeverityColor(avg)}`}>
                        {avg === null ? '—' : avg.toFixed(1)}
                      </div>
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Day of Week</h4>
              <div className="grid grid-cols-7 gap-1">
                {dayLabels.map((label, idx) => {
                  const data = analytics.dayOfWeekPatterns?.find((d) => d.day === idx);
                  const avg = data && data.count > 0 ? data.avgPain : null;
                  return (
                    <div key={`${label}-${idx}`} className="p-2 rounded-lg text-center bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</div>
                      <div className={`mt-1 text-sm font-bold ${avg === null ? 'text-gray-400' : getSeverityColor(avg)}`}>
                        {avg === null ? '—' : avg.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Trigger Impact Matrix */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trigger Impact Matrix</h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Δ Pain vs personal baseline</span>
          </div>

          {analytics.triggerPainCorrelation && analytics.triggerPainCorrelation.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800/70">
                    <th className="py-2 pr-4 font-medium">Trigger</th>
                    <th className="py-2 pr-4 font-medium">Observations</th>
                    <th className="py-2 pr-4 font-medium">Avg Δ Pain</th>
                    <th className="py-2 pr-4 font-medium">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.triggerPainCorrelation.map((row) => {
                    const severity = Math.abs(row.avgDelta) >= 2 ? 'strong' : Math.abs(row.avgDelta) >= 1 ? 'moderate' : 'mild';
                    const positive = row.avgDelta > 0;
                    return (
                      <tr key={row.trigger} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                        <td className="py-3 pr-4 text-gray-900 dark:text-gray-100 capitalize">{row.trigger}</td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{row.count}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${positive ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'}`}>
                            {positive ? '+' : ''}{row.avgDelta.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-400">
                          {positive ? `${severity} association with higher pain` : `${severity} association with lower pain`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Log triggers alongside your entries to quantify how each factor raises or lowers your average pain.
            </div>
          )}
        </div>
      </div>

      {/* Seasonality Insight */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seasonality & Cyclical Patterns</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Based on monthly averages</span>
        </div>

        {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {monthLabels.map((label, idx) => {
              const monthData = analytics.monthlyTrend.find((m) => m.month === idx + 1);
              if (!monthData) {
                return (
                  <div key={label} className="px-4 py-2 rounded-full border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
                    {label}
                  </div>
                );
              }
              const value = monthData.avgPain;
              return (
                <div key={label} className={`px-4 py-2 rounded-full text-sm font-semibold ${getSeverityColor(value)} border border-transparent`}> 
                  {label} · {value.toFixed(1)}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add entries across different months to spot seasonal pain cycles (e.g., winter flare-ups, summer relief).
          </p>
        )}
      </div>
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

  const aggravatingTrigger = analytics.triggerPainCorrelation?.find((item) => item.avgDelta > 0);
  const stabilizingTrigger = analytics.triggerPainCorrelation?.slice().reverse().find((item) => item.avgDelta < 0);
  const toughestDay = analytics.dayOfWeekPatterns?.filter((d) => d.count > 0).sort((a, b) => b.avgPain - a.avgPain)[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">Flare Risk</p>
              <h3 className="text-2xl font-bold">{flare ? `${flare.probability}%` : 'Stable'}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-white/80">{flare ? `Next ${flare.timeframe} · Severity ${flare.severity}` : 'No immediate flare risk detected. Keep logging to maintain accuracy.'}</p>
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${flare ? flare.probability : 20}%` }} />
            </div>
            {flare && (
              <ul className="mt-3 text-sm space-y-1 text-white/80 list-disc list-inside">
                {flare.recommendations.map((rec: string) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-500">7-Day Outlook</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{forecast?.projectedAverage?.toFixed(1) ?? '—'} / 10</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {forecast ? `${forecast.change >= 0 ? '+' : ''}${forecast.change.toFixed(1)} change vs current average · Confidence ${forecast.confidence}` : 'Need more entries to project forward.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">{forecast?.narrative}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-purple-500">Optimal Medication Window</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{medicationWindow ? medicationWindow.label : 'Need more data'}</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Pill className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {medicationWindow
              ? `Avg relief ${medicationWindow.avgReduction.toFixed(1)} points across ${medicationWindow.count} documented doses. Confidence ${(medicationWindow.confidence * 100).toFixed(0)}%.`
              : 'Log medication usage alongside pain levels to unlock timing insights.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-500">Personalized Recommendations</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Next Best Actions</h3>
            </div>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep logging detailed entries (triggers, meds, sleep) to unlock personalized guidance.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={`${rec.title}-${idx}`} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      rec.emphasis === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                        : rec.emphasis === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{rec.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Supporting Signals</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What drives the model</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500">Most sensitive trigger</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{aggravatingTrigger ? aggravatingTrigger.trigger : 'Need more data'}</p>
              </div>
              {aggravatingTrigger && (
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-300">+{aggravatingTrigger.avgDelta.toFixed(1)}</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500">Most stable trigger</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{stabilizingTrigger ? stabilizingTrigger.trigger : 'Logging needed'}</p>
              </div>
              {stabilizingTrigger && (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{stabilizingTrigger.avgDelta.toFixed(1)}</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500">Peak pain day</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{toughestDay ? DAY_LABELS[toughestDay.day] : 'Need weekly coverage'}</p>
              </div>
              {toughestDay && (
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{toughestDay.avgPain.toFixed(1)}</span>
              )}
            </div>
          </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Top relief sources</p>
              <div className="space-y-2">
                {medicationLeaders.length === 0 ? (
                  <p className="text-sm text-gray-500">Track medication usage to see which options your body responds to best.</p>
                ) : (
                  medicationLeaders.map((med) => (
                    <div key={med.medication} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{med.medication}</span>
                      <span className="text-emerald-600 dark:text-emerald-300 font-semibold">-{med.avgReduction.toFixed(1)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Clinical Report View
const ClinicalReportView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({ analytics, entries }) => {
  const totalEntries = entries.length;
  const sortedEntries = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const dateFormatter = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const rangeStart = sortedEntries[0]?.timestamp;
  const rangeEnd = sortedEntries[sortedEntries.length - 1]?.timestamp;
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  const functionalSummary = entries.reduce((acc, entry) => {
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
  }, {
    limitedActivities: new Set<string>(),
    assistanceNeeded: new Set<string>(),
    mobilityAids: new Set<string>(),
    sleepTotal: 0,
    sleepCount: 0,
    moodTotal: 0,
    moodCount: 0
  });

  const workSummary = entries.reduce((acc, entry) => {
    if (entry.workImpact) {
      acc.missedDays += entry.workImpact.missedWork ?? 0;
      entry.workImpact.modifiedDuties?.forEach(item => acc.modifiedDuties.add(item));
      entry.workImpact.workLimitations?.forEach(item => acc.workLimitations.add(item));
    }
    return acc;
  }, {
    missedDays: 0,
    modifiedDuties: new Set<string>(),
    workLimitations: new Set<string>()
  });

  const careTeamNotes = analytics.personalizedRecommendations?.slice(0, 3) ?? [];
  const medicationHighlights = analytics.medicationEffectiveness?.slice(0, 3) ?? [];
  const riskLevel = analytics.riskScore > 75 ? 'High' : analytics.riskScore > 50 ? 'Elevated' : 'Managed';

  const summaryBullets = [
    `Average reported pain ${analytics.avgPain.toFixed(1)}/10 with ${analytics.volatility.toFixed(1)} volatility`,
    `${analytics.goodDays} good days (${((analytics.goodDays / Math.max(totalEntries, 1)) * 100).toFixed(0)}% of period)`,
    analytics.predictedFlare ? `Flare risk ${analytics.predictedFlare.probability}% in next ${analytics.predictedFlare.timeframe}` : 'No imminent flare risk detected',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Clinical Summary</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pain Management Report</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalEntries > 0 ? `${dateFormatter(rangeStart)} – ${dateFormatter(rangeEnd)} (${totalEntries} entries)` : 'Awaiting entries to generate report.'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500">Risk Level</p>
              <p className="font-semibold text-gray-900 dark:text-white">{riskLevel}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500">Latest Entry</p>
              <p className="font-semibold text-gray-900 dark:text-white">{dateFormatter(latestEntry?.timestamp)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Pain Overview</h3>
          {summaryBullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{bullet}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">Functional Impact</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold">Limited Activities:</span> {functionalSummary.limitedActivities.size > 0 ? Array.from(functionalSummary.limitedActivities).join(', ') : 'Not documented'}</p>
            <p><span className="font-semibold">Assistance Needed:</span> {functionalSummary.assistanceNeeded.size > 0 ? Array.from(functionalSummary.assistanceNeeded).join(', ') : 'Not documented'}</p>
            <p><span className="font-semibold">Mobility Aids:</span> {functionalSummary.mobilityAids.size > 0 ? Array.from(functionalSummary.mobilityAids).join(', ') : 'Not documented'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">WorkSafe BC Readiness</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li><span className="font-semibold">Missed days:</span> {workSummary.missedDays}</li>
            <li><span className="font-semibold">Modified duties:</span> {workSummary.modifiedDuties.size > 0 ? Array.from(workSummary.modifiedDuties).join(', ') : 'None recorded'}</li>
            <li><span className="font-semibold">Limitations:</span> {workSummary.workLimitations.size > 0 ? Array.from(workSummary.workLimitations).join(', ') : 'None recorded'}</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Medication & Treatment Summary</h3>
            <span className="text-xs text-gray-400">Last documented: {dateFormatter(latestEntry?.timestamp)}</span>
          </div>
          {medicationHighlights.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Document medication usage along with pain score changes to surface effectiveness insights.</p>
          ) : (
            <div className="space-y-3">
              {medicationHighlights.map((med) => (
                <div key={med.medication} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70">
                  <div>
                    <p className="font-semibold">{med.medication}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{med.uses} entries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-300">-{med.avgReduction.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg pain change</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {analytics.optimalMedicationWindow && (
            <div className="mt-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-4 text-sm text-indigo-900 dark:text-indigo-100">
              Optimal timing: <span className="font-semibold">{analytics.optimalMedicationWindow.label}</span> · Avg relief {analytics.optimalMedicationWindow.avgReduction.toFixed(1)} · Confidence {(analytics.optimalMedicationWindow.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-4">Provider Notes & Next Steps</h3>
          {careTeamNotes.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Log detailed context (triggers, interventions) to unlock provider-ready recommendations.</p>
          ) : (
            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {careTeamNotes.map((note, idx) => (
                <li key={`${note.title}-${idx}`}>
                  <p className="font-semibold text-gray-900 dark:text-white">{note.title}</p>
                  <p className="text-gray-600 dark:text-gray-400">{note.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Supporting Evidence</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="text-xs text-gray-500 uppercase">Top Pain Locations</p>
            <p>{analytics.topLocations.length > 0 ? analytics.topLocations.map((loc) => `${loc.location} (${loc.count})`).join(', ') : 'Not captured'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Primary Triggers</p>
            <p>{analytics.topTriggers.length > 0 ? analytics.topTriggers.map((trigger) => `${trigger.trigger} (${trigger.count})`).join(', ') : 'Not documented'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Quality-of-Life Metrics</p>
            <p>
              Sleep avg: {functionalSummary.sleepCount > 0 ? (functionalSummary.sleepTotal / functionalSummary.sleepCount).toFixed(1) : '—'} ·
              Mood impact avg: {functionalSummary.moodCount > 0 ? (functionalSummary.moodTotal / functionalSummary.moodCount).toFixed(1) : '—'}
            </p>
          </div>
        </div>
      </div>
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Tree-of-Thought Reasoning</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">How the dashboard reached its conclusions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Each branch represents a reasoning step that connects raw entries to clinical guidance. Confidence is weighted by data coverage.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            entryConfidence === 'high'
              ? 'bg-emerald-100 text-emerald-700'
              : entryConfidence === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'
          }`}>
            Data confidence: {entryConfidence}
          </div>
        </div>

        <div className="mt-6">
          <ReasoningTree nodes={reasoningTree} depth={0} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Highlighted Thought</p>
              <h4 className="text-xl font-bold">{latestRecommendation ? latestRecommendation.title : 'Keep logging insights'}</h4>
              <p className="text-sm text-white/80 mt-2">
                {latestRecommendation
                  ? latestRecommendation.detail
                  : 'Log triggers, medications, and recovery context to unlock actionable insights.'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Coverage Snapshot</p>
          <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span>Total entries analyzed</span>
              <span className="font-semibold">{entries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Day-of-week coverage</span>
              <span className="font-semibold">{analytics.dayOfWeekPatterns.filter((d) => d.count > 0).length}/7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trigger signals tracked</span>
              <span className="font-semibold">{analytics.triggerPainCorrelation.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Medication experiments</span>
              <span className="font-semibold">{analytics.medicationEffectiveness.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Pattern Recognition Results */}
      {patternAnalysis && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Heuristic Pattern Recognition</h3>
                <p className="text-sm text-white/80">Advanced analysis powered by local algorithms</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-white/70">Baseline</p>
                <p className="text-2xl font-bold">{patternAnalysis.baseline.value.toFixed(1)}</p>
                <p className="text-xs text-white/80 capitalize">{patternAnalysis.baseline.confidence} confidence</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-white/70">Episodes Detected</p>
                <p className="text-2xl font-bold">{patternAnalysis.episodes.length}</p>
                <p className="text-xs text-white/80">Flare patterns identified</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-white/70">Data Quality</p>
                <p className="text-2xl font-bold capitalize">{patternAnalysis.dataQuality}</p>
                <p className="text-xs text-white/80">{entries.length} entries analyzed</p>
              </div>
            </div>
          </div>

          {/* Episodes Timeline */}
          {patternAnalysis.episodes.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Pain Episodes ({patternAnalysis.episodes.length})
              </h4>
              <div className="space-y-3">
                {patternAnalysis.episodes.slice(0, 5).map((episode, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {episode.severity} Severity
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {episode.duration} days • Peak: {episode.peakIntensity.toFixed(1)}/10
                        </p>
                      </div>
                      {episode.recoveryDays !== null && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Recovery: {episode.recoveryDays}d
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trigger Correlations */}
          {patternAnalysis.triggerCorrelations.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Trigger Correlations
              </h4>
              <div className="space-y-3">
                {patternAnalysis.triggerCorrelations.slice(0, 5).map((corr, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{corr.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {corr.support} occurrences • {corr.confidence.toFixed(0)}% confidence
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${corr.delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {corr.delta > 0 ? '+' : ''}{corr.delta.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{corr.strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QoL Patterns */}
          {patternAnalysis.qolPatterns.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Quality of Life Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {patternAnalysis.qolPatterns.map((pattern, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {pattern.dimension === 'sleep' && <Moon className="w-4 h-4" />}
                      {pattern.dimension === 'mood' && <Sun className="w-4 h-4" />}
                      {pattern.dimension === 'activity' && <Activity className="w-4 h-4" />}
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{pattern.dimension}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.description}</p>
                    <p className="text-xs text-gray-500 mt-2 capitalize">{pattern.strength} correlation</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cautions */}
          {patternAnalysis.cautions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">Analysis Notes</p>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                    {patternAnalysis.cautions.map((caution, idx) => (
                      <li key={idx}>• {caution}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReasoningTree: React.FC<{ nodes: ReasoningNode[]; depth: number }> = ({ nodes, depth }) => {
  if (!nodes.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
        Not enough data yet. Add a few detailed entries to unlock automated reasoning.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Step {depth + 1}</p>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{node.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{node.insight}</p>
              {node.evidence && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Evidence: {node.evidence}
                </p>
              )}
              {node.action && (
                <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                  Next action: {node.action}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              node.confidence === 'high'
                ? 'bg-emerald-100 text-emerald-700'
                : node.confidence === 'medium'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
            }`}>
              {node.confidence} confidence
            </span>
          </div>

          {node.children && node.children.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-4">
              <ReasoningTree nodes={node.children} depth={depth + 1} />
            </div>
          )}
        </div>
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

  const coverageConfidence: ReasoningNode['confidence'] = entryCount >= 60 ? 'high' : entryCount >= 25 ? 'medium' : 'low';

  const patternNode: ReasoningNode = {
    id: 'patterns',
    title: 'Temporal & trigger patterns',
    insight: `Detected ${analytics.dayOfWeekPatterns.filter((d) => d.count > 0).length}/7 day patterns and ${analytics.timePatterns.morning.count + analytics.timePatterns.afternoon.count + analytics.timePatterns.evening.count + analytics.timePatterns.night.count} time-of-day observations.`,
    confidence: coverageConfidence,
    evidence: analytics.triggerPainCorrelation[0]
      ? `${analytics.triggerPainCorrelation[0].trigger} shifts pain by ${analytics.triggerPainCorrelation[0].avgDelta.toFixed(1)}`
      : 'Need more trigger tagging',
    action: analytics.triggerPainCorrelation[0]
      ? `Mitigate ${analytics.triggerPainCorrelation[0].trigger} exposure on ${DAY_LABELS[analytics.dayOfWeekPatterns.sort((a, b) => b.avgPain - a.avgPain)[0]?.day ?? 0]}`
      : 'Log triggers alongside entries for richer pattern detection.',
    children: analytics.dayOfWeekPatterns
      .filter((day) => day.count > 0)
      .slice(0, 2)
      .map((day) => ({
        id: `day-${day.day}`,
        title: `${DAY_LABELS[day.day]} trend`,
        insight: `Average pain ${day.avgPain.toFixed(1)} with ${day.count} observations`,
        confidence: day.count >= 4 ? 'medium' : 'low',
        action: day.avgPain >= analytics.avgPain
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
    evidence: `Top locations: ${analytics.topLocations.slice(0, 2).map((loc) => loc.location).join(', ') || 'N/A'}`,
    action: 'Use export tab to share WorkSafe-ready PDF.',
    children: analytics.personalizedRecommendations.slice(0, 2).map((rec) => ({
      id: `rec-${rec.title}`,
      title: rec.title,
      insight: rec.detail,
      confidence: rec.emphasis === 'high' ? 'high' : rec.emphasis === 'medium' ? 'medium' : 'low',
      action: rec.category === 'medication'
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
const ExportView: React.FC<{ analytics: AnalyticsSnapshot; entries: PainEntry[] }> = ({ analytics, entries }) => {
  const [isQuickExporting, setIsQuickExporting] = useState<'csv' | 'json' | null>(null);
  const [quickExportError, setQuickExportError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyErrorMessage, setCopyErrorMessage] = useState<string>('Clipboard unavailable. Select the summary text and copy manually.');
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
    () => [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
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
    const end = new Date(sortedEntries[sortedEntries.length - 1].timestamp).toISOString().split('T')[0];
    return `${start}-to-${end}`;
  }, [sortedEntries]);

  const riskLevel = analytics.riskScore > 75 ? 'High' : analytics.riskScore > 50 ? 'Elevated' : 'Managed';
  const topTriggers = analytics.topTriggers?.slice?.(0, 2).map((trigger) => trigger.trigger).filter(Boolean).join(', ') || 'Not captured';
  const topLocationsSummary = analytics.topLocations?.slice?.(0, 2).map((loc) => loc.location).filter(Boolean).join(', ') || 'Not captured';
  const recommendation = analytics.personalizedRecommendations?.[0]?.detail ??
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
  }, [analytics.avgPain, analytics.goodDays, analytics.volatility, forecastLine, rangeLabel, recommendation, riskLevel, sortedEntries.length, topLocationsSummary, topTriggers]);

  const logExportAudit = useCallback(
    async ({
      action,
      actionType = 'export',
      outcome = 'success',
      details = {}
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
            ...details
          }
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
          details: { reason: 'no-entries', format }
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
          mod.downloadData(
            csv,
            filename,
            'text/csv;charset=utf-8'
          );
        } else {
          const json = mod.exportToJSON(entries);
          mod.downloadData(
            json,
            filename,
            'application/json;charset=utf-8'
          );
        }
        await logExportAudit({
          action: 'quick-export',
          details: { format, filename }
        });
      } catch (error) {
        console.error('Quick export failed', error);
        setQuickExportError('Quick export failed. Try the advanced export workspace.');
        await logExportAudit({
          action: 'quick-export',
          outcome: 'failure',
          details: { format, error: error instanceof Error ? error.message : 'unknown-error' }
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
        details: { channel: 'clipboard' }
      });
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (error) {
      console.error('Clipboard copy failed', error);
      setShareStatus('error');
      setCopyErrorMessage(error instanceof Error ? error.message : 'Clipboard unavailable. Select the summary and copy manually.');
      await logExportAudit({
        action: 'copy-clinical-summary',
        outcome: 'failure',
        details: { error: error instanceof Error ? error.message : 'unknown-error', channel: 'clipboard' }
      });
    }
  }, [logExportAudit, shareSummary]);

  const handleOpenAdvancedModal = useCallback(() => {
    setShowAdvancedModal(true);
    logExportAudit({
      action: 'open-advanced-export-workspace',
      actionType: 'access',
      details: { isOffline }
    });
  }, [isOffline, logExportAudit]);

  const handleEmailShare = useCallback(async () => {
    if (isOffline) {
      setEmailError('Email composer unavailable offline. Try again once you reconnect.');
      await logExportAudit({
        action: 'compose-email-share',
        outcome: 'failure',
        details: { reason: 'offline' }
      });
      return;
    }
    if (typeof window === 'undefined') {
      setEmailError('Email composer unavailable in this environment.');
      await logExportAudit({
        action: 'compose-email-share',
        outcome: 'failure',
        details: { reason: 'no-window' }
      });
      return;
    }
    setEmailError(null);
    const subject = encodeURIComponent('Pain Tracker clinical snapshot');
    const body = encodeURIComponent(shareSummary);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    await logExportAudit({
      action: 'compose-email-share',
      details: { channel: 'email' }
    });
  }, [isOffline, logExportAudit, shareSummary]);

  return (
    <>
      <div className="space-y-6">
        {isOffline && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-900/20 p-4 text-amber-900 dark:text-amber-100" role="status" aria-live="polite">
            <p className="text-sm font-semibold">Offline mode detected</p>
            <p className="text-sm opacity-90">
              Quick downloads stay fully local. Email sharing is paused until you're back online, and the advanced export workspace will reopen with cached data only.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Clinical-Grade Exports</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Share securely with care teams</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Generate WorkSafe BC-ready PDFs or quickly download data snapshots without leaving the browser.
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>

            <React.Suspense
              fallback={
                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  Preparing clinical export tools…
                </div>
              }
            >
              <ClinicalPDFExportButtonLazy entries={entries} className="mt-6" />
            </React.Suspense>

            <button
              onClick={handleOpenAdvancedModal}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-blue-300 text-blue-700 dark:text-blue-200 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Open advanced export workspace
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => handleQuickExport('csv')}
                disabled={isQuickExporting !== null}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg disabled:opacity-60"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {isQuickExporting === 'csv' ? 'Preparing CSV…' : 'Quick CSV'}
              </button>
              <button
                onClick={() => handleQuickExport('json')}
                disabled={isQuickExporting !== null}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium shadow"
              >
                <FileJson className="w-5 h-5" />
                {isQuickExporting === 'json' ? 'Preparing JSON…' : 'Quick JSON'}
              </button>
            </div>

            {quickExportError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{quickExportError}</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Provider Snapshot</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Copy or email a clinical summary</h3>
              </div>
              <Share2 className="w-6 h-6 text-indigo-500" />
            </div>

            <textarea
              readOnly
              value={shareSummary}
              className="mt-4 w-full min-h-[220px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 p-4 font-mono"
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
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent validation messages</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs text-blue-600 dark:text-blue-300 hover:underline"
                          onClick={() => setShowValidationHistory((prev) => !prev)}
                        >
                          {showValidationHistory ? 'Hide history' : 'Show history'}
                        </button>
                        <button
                          type="button"
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={clearHistory}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    {showValidationHistory && (
                      <div className="mt-2">
                        <ValidationHistory validations={validationHistory} onClear={clearHistory} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleCopySummary}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white ${
                  shareStatus === 'copied'
                    ? 'bg-emerald-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                {shareStatus === 'copied' ? 'Copied summary' : 'Copy summary'}
              </button>
              <button
                onClick={handleEmailShare}
                disabled={isOffline}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isOffline ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Mail className="w-4 h-4" />
                Compose secure email
              </button>
            </div>

            {shareStatus === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
                {copyErrorMessage || 'Clipboard unavailable. Select the text above and copy manually instead.'}
              </p>
            )}
            {emailError && (
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2" role="alert">{emailError}</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Security-first export guarantees</h3>
              <p className="text-sm text-blue-100 mt-1">
                Exports never leave your device unencrypted. You retain full control over every download and share event.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>All exports are generated client-side with the same encryption posture as the rest of the app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Audit trails are available through the HIPAA compliance service for every export action.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Use trauma-informed sharing prompts to maintain agency during clinical conversations.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showAdvancedModal && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl text-gray-700 dark:text-gray-200">
                Loading export workspace…
              </div>
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    green: 'from-green-500 to-green-600 text-green-600',
    red: 'from-red-500 to-red-600 text-red-600',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            trend > 0 ? 'bg-red-100 text-red-700' : trend < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
};

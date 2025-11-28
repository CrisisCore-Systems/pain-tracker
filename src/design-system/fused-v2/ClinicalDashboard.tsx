import React, { useMemo } from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InsightChip } from './InsightChip';
import { RecommendedActions } from './RecommendedActions';
import type { PainEntry } from '../../types';
import '../tokens/fused-v2.css';

interface ClinicalDashboardProps {
  entries: PainEntry[];
  onLogNow: () => void;
  onViewCalendar: () => void;
  onViewAnalytics?: () => void;
  onExport: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}

export function ClinicalDashboard({
  entries,
  onLogNow,
  onViewCalendar,
  onViewAnalytics,
  onExport,
  onOpenSettings,
  onOpenHelp,
}: ClinicalDashboardProps) {
  const analytics = useMemo(() => {
    if (entries.length === 0) {
      return {
        avgPain: 0,
        delta: 0,
        sparkline: [],
        daysTracked: 0,
        variability: 0,
        lastEntry: null,
        insights: [],
      };
    }

    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = sorted.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
    const previous = sorted.filter(e => {
      const date = new Date(e.timestamp);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });

    const avgPain =
      recent.length > 0
        ? recent.reduce((sum, e) => sum + e.baselineData.pain, 0) / recent.length
        : 0;

    const prevAvgPain =
      previous.length > 0
        ? previous.reduce((sum, e) => sum + e.baselineData.pain, 0) / previous.length
        : avgPain;

    const delta = avgPain - prevAvgPain;

    // Sparkline (last 7 values)
    const sparkline = recent.slice(-7).map(e => e.baselineData.pain);

    // Variability (rolling SD)
    const mean = avgPain;
    const variance =
      recent.length > 1
        ? recent.reduce((sum, e) => sum + Math.pow(e.baselineData.pain - mean, 2), 0) /
          recent.length
        : 0;
    const variability = Math.sqrt(variance);

    // Days tracked
    const uniqueDays = new Set(recent.map(e => new Date(e.timestamp).toDateString())).size;

    // Generate insights
    const insights = [];

    if (delta < -0.5) {
      insights.push({
        statement: `Pain trending down ${Math.abs(delta).toFixed(1)} points vs last week`,
        confidence: delta < -1 ? 3 : 2,
        rationale: `Your 7-day average is ${avgPain.toFixed(1)}, compared to ${prevAvgPain.toFixed(1)} the previous week. This represents a ${Math.abs((delta / prevAvgPain) * 100).toFixed(0)}% improvement.`,
      });
    }

    if (variability > 2) {
      insights.push({
        statement: `High pain variability detected (SD: ${variability.toFixed(1)})`,
        confidence: 2,
        rationale: `Your pain levels vary significantly day-to-day. This could indicate external triggers or inconsistent management. Consider tracking context factors.`,
      });
    }

    if (uniqueDays >= 6) {
      insights.push({
        statement: `Excellent tracking consistency (${uniqueDays}/7 days)`,
        confidence: 3,
        rationale: `You've logged pain on ${uniqueDays} out of the last 7 days. Consistent tracking helps identify patterns and measure treatment effectiveness.`,
      });
    }

    return {
      avgPain,
      delta,
      sparkline,
      daysTracked: uniqueDays,
      variability,
      lastEntry: sorted[sorted.length - 1],
      insights: insights as Array<{ statement: string; confidence: 1 | 2 | 3; rationale: string }>,
    };
  }, [entries]);

  const getTimeSinceLastEntry = () => {
    if (!analytics.lastEntry) return 'Never';

    const diff = Date.now() - new Date(analytics.lastEntry.timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-surface-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-display text-ink-50 mb-1">Today</h1>
            <p className="text-small text-ink-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink-500" />
              <span className="text-small text-ink-400">
                Last entry: {getTimeSinceLastEntry()}
              </span>
            </div>

            {onViewAnalytics && (
              <button
                type="button"
                onClick={onViewAnalytics}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-800 text-ink-100 px-3 py-1.5 text-xs font-medium border border-surface-700 hover:bg-surface-700 transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                View analytics
              </button>
            )}

            {(onOpenSettings || onOpenHelp) && (
              <div className="flex items-center gap-2">
                {onOpenHelp && (
                  <button
                    type="button"
                    onClick={onOpenHelp}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 text-ink-100 border border-surface-700 hover:bg-surface-700 transition-colors"
                  >
                    Need help?
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 text-ink-100 border border-surface-700 hover:bg-surface-700 transition-colors"
                  >
                    Adjust settings
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Actions - AI-driven priority feed */}
        <RecommendedActions
          entries={entries}
          onLogNow={onLogNow}
          onViewCalendar={onViewCalendar}
          onViewAnalytics={onViewAnalytics || (() => {})}
          onExport={onExport}
        />

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Avg Pain (7d)"
            value={analytics.avgPain.toFixed(1)}
            unit="/10"
            delta={{
              value: -analytics.delta,
              direction: analytics.delta < -0.3 ? 'down' : analytics.delta > 0.3 ? 'up' : 'neutral',
              label: 'vs last week',
            }}
            sparkline={analytics.sparkline}
            severity={Math.round(analytics.avgPain) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
          />

          <MetricCard
            title="Tracking Streak"
            value={analytics.daysTracked}
            unit="days"
            delta={{
              value: analytics.daysTracked >= 5 ? 1 : -1,
              direction: analytics.daysTracked >= 5 ? 'up' : 'down',
              label: 'this week',
            }}
          />

          <MetricCard
            title="Variability Index"
            value={analytics.variability.toFixed(1)}
            delta={{
              value: 0,
              direction: 'neutral',
              label: 'rolling SD',
            }}
          />
        </div>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <div className="surface-card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary-500" />
              <h2 className="text-body-medium text-ink-100">Insights</h2>
            </div>
            <div className="space-y-2">
              {analytics.insights.map((insight, i) => (
                <InsightChip
                  key={i}
                  statement={insight.statement}
                  confidence={insight.confidence}
                  rationale={insight.rationale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="surface-card">
          <h2 className="text-body-medium text-ink-200 mb-3">Next Steps</h2>
          <div className="text-small text-ink-300 space-y-2">
            <p>• Continue daily tracking for pattern detection</p>
            <p>• Review calendar for weekly trends</p>
            <p>• Share 7-day report with provider before next visit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

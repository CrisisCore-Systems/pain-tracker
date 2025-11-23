import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Zap,
  HelpCircle,
  Download,
  Sparkles,
  Lightbulb,
  Feather,
  Trash2,
} from 'lucide-react';
import { Button, Badge } from '../../design-system';
import {
  EnhancedCard,
  MetricCard as EnhancedMetricCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
} from '../../design-system/components/EnhancedCard';
import { Loading } from '../../design-system/components/Loading';
import { PageTransition, StaggeredChildren } from '../../design-system/components/PageTransition';
import Chart from '../../design-system/components/Chart';
import { colorVar, colorVarAlpha } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { gradients, textGradients } from '../../design-system/theme/gradients';
import { formatNumber } from '../../utils/formatting';
import { isSameLocalDay, localDayStart } from '../../utils/dates';
import { Tooltip } from '../tutorials/Tooltip';
import DashboardMenu from './DashboardMenu';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { emptyStates } from '../../content/microcopy';
import DashboardContent from './DashboardContent';
import DashboardRecent from './DashboardRecent';
import { generateDashboardAIInsights, type InsightTone } from '../../utils/pain-tracker/insights';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

interface DashboardOverviewProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
  className?: string;
  PredictivePanelOverride?: React.ComponentType<{ entries: PainEntry[] }> | undefined;
}

function MetricCard({
  title,
  value,
  change,
  icon,
  className,
  tooltip,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: { value: number; label: string; trend: 'up' | 'down' | 'neutral' } | undefined;
  icon: React.ReactNode;
  className?: string;
  tooltip?: string;
  subtitle?: React.ReactNode;
}) {
  // Map trend to variant for EnhancedMetricCard
  const variant =
    change?.trend === 'down' ? 'success' : change?.trend === 'up' ? 'warning' : 'default';
  const trend = change?.trend === 'up' ? 'up' : change?.trend === 'down' ? 'down' : 'neutral';

  return (
    <div className={className}>
      <EnhancedMetricCard
        title={title}
        value={value}
        change={change ? { value: Math.abs(change.value), label: change.label } : undefined}
        icon={icon}
        trend={trend}
        variant={variant}
      />
      {tooltip && (
        <div className="text-xs text-muted-foreground mt-2 flex items-center space-x-2">
          <Tooltip content={tooltip}>
            <span className="inline-flex items-center">
              <HelpCircle className="h-3 w-3 mr-1" />
              {tooltip}
            </span>
          </Tooltip>
        </div>
      )}
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

export function DashboardOverview({ entries, allEntries, className, PredictivePanelOverride }: DashboardOverviewProps) {
  const [tab, setTab] = useState<'overview' | 'charts' | 'recent'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const { clearAllData } = usePainTrackerStore();

  const metrics = useMemo(() => {
    const activeEntries = entries ?? [];
    const referenceEntries = allEntries && allEntries.length > 0 ? allEntries : activeEntries;

    const todayStart = localDayStart(new Date());
    const weeklyWindowStart = new Date(todayStart);
    weeklyWindowStart.setDate(weeklyWindowStart.getDate() - 6);

    let filteredPainTotal = 0;
    let weeklyPainTotal = 0;
    let weeklyEntryCount = 0;
    let todayEntryCount = 0;

    const painDistributionBuckets = [0, 0, 0, 0];
    const dailyAggregates = new Map<number, { sum: number; count: number }>();

    activeEntries.forEach(entry => {
      const pain = entry.baselineData.pain;
      filteredPainTotal += pain;

      const entryDay = localDayStart(entry.timestamp);
      const entryDayKey = entryDay.getTime();

      if (isSameLocalDay(entry.timestamp, todayStart)) {
        todayEntryCount += 1;
      }

      if (entryDayKey >= weeklyWindowStart.getTime()) {
        weeklyPainTotal += pain;
        weeklyEntryCount += 1;
      }

      const aggregate = dailyAggregates.get(entryDayKey);
      if (aggregate) {
        aggregate.sum += pain;
        aggregate.count += 1;
      } else {
        dailyAggregates.set(entryDayKey, { sum: pain, count: 1 });
      }

      if (pain <= 2) painDistributionBuckets[0] += 1;
      else if (pain <= 5) painDistributionBuckets[1] += 1;
      else if (pain <= 8) painDistributionBuckets[2] += 1;
      else painDistributionBuckets[3] += 1;
    });

    const averagePainRaw = activeEntries.length > 0 ? filteredPainTotal / activeEntries.length : 0;
    const weeklyAverageRaw = weeklyEntryCount > 0 ? weeklyPainTotal / weeklyEntryCount : 0;

    const overallPainTotal = referenceEntries.reduce(
      (total, entry) => total + entry.baselineData.pain,
      0
    );
    const overallAverageRaw =
      referenceEntries.length > 0 ? overallPainTotal / referenceEntries.length : null;

    const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

    const weeklyTrend = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weeklyWindowStart);
      day.setDate(weeklyWindowStart.getDate() + index);
      const dayKey = day.getTime();
      const aggregate = dailyAggregates.get(dayKey);
      return {
        label: dateFormatter.format(day),
        avg: aggregate ? Math.round((aggregate.sum / aggregate.count) * 10) / 10 : null,
        count: aggregate?.count ?? 0,
      };
    });

    const recentActivity = activeEntries
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map(entry => {
        const entryWithQuality = entry as PainEntry & {
          qualityOfLife?: PainEntry['qualityOfLife'] | null;
        };

        return {
          id: entry.id,
          pain: entry.baselineData.pain,
          timestamp: entry.timestamp,
          symptoms: Array.isArray(entry.baselineData.symptoms) ? entry.baselineData.symptoms : [],
          qualityOfLife: entryWithQuality.qualityOfLife ?? null,
        };
      });

    let painTrend: { value: number; label: string; trend: 'up' | 'down' | 'neutral' } | null = null;
    if (overallAverageRaw !== null && activeEntries.length > 0) {
      const deltaPercent = (averagePainRaw - overallAverageRaw) * 10; // scale difference to 0-100 range
      const roundedDelta = Math.round(Math.abs(deltaPercent) * 10) / 10;
      if (roundedDelta >= 1) {
        painTrend = {
          value: roundedDelta,
          label: 'vs lifetime average',
          trend: deltaPercent > 0 ? 'up' : 'down',
        };
      }
    }

    return {
      totalEntries: referenceEntries.length,
      averagePain: formatNumber(Number(averagePainRaw), 1),
      overallAverage:
        overallAverageRaw !== null ? formatNumber(Number(overallAverageRaw), 1) : undefined,
      todayEntries: todayEntryCount,
      weeklyAverage: formatNumber(Number(weeklyAverageRaw), 1),
      painTrend,
      recentActivity,
      painDistribution: [
        { label: 'Mild', data: [painDistributionBuckets[0]] },
        { label: 'Moderate', data: [painDistributionBuckets[1]] },
        { label: 'Severe', data: [painDistributionBuckets[2]] },
        { label: 'Extreme', data: [painDistributionBuckets[3]] },
      ],
      weeklyTrend,
    } as const;
  }, [entries, allEntries]);

  const hasWeeklyData = metrics.weeklyTrend.some(day => day.count > 0);

  // Adaptive tone copy
  const noLogsHeadline = useAdaptiveCopy(emptyStates.noLogs.headline);
  const noLogsSubtext = useAdaptiveCopy(emptyStates.noLogs.subtext);
  const noTrendsHeadline = useAdaptiveCopy(emptyStates.noTrends.headline);
  const noTrendsSubtext = useAdaptiveCopy(emptyStates.noTrends.subtext);

  const aiInsights = useMemo(
    () => generateDashboardAIInsights(entries, { allEntries }),
    [entries, allEntries]
  );

  const toneStyles = useMemo<Record<InsightTone, { icon: React.ReactNode; accent: string }>>(
    () => ({
      celebration: {
        icon: <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />,
        accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      },
      'gentle-nudge': {
        icon: <Feather className="h-4 w-4 text-amber-500" aria-hidden="true" />,
        accent: 'bg-amber-500/10 text-amber-600 border-amber-400/30',
      },
      observation: {
        icon: <Lightbulb className="h-4 w-4 text-sky-500" aria-hidden="true" />,
        accent: 'bg-sky-500/10 text-sky-600 border-sky-400/30',
      },
    }),
    []
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Lazy-load PredictivePanel to keep initial bundle small; memoize to avoid recreating lazy wrapper
  const PredictivePanelLazy = React.useMemo(() => React.lazy(() => import('./PredictivePanelWrapper')), []);

  const encouragement = useMemo(() => {
    if (entries.length === 0) {
      return noLogsHeadline;
    }

    if (metrics.todayEntries === 0) {
      return noLogsSubtext;
    }

    if (Number(metrics.weeklyAverage) <= 4) {
      return 'Great job staying ahead of your pain patterns this week.';
    }

    return "Keep observing the shifts—small notes today help tomorrow's insights.";
  }, [entries.length, metrics.todayEntries, metrics.weeklyAverage, noLogsHeadline, noLogsSubtext]);

  const heroHighlights = useMemo(
    () => [
      {
        label: 'Total entries logged',
        value: metrics.totalEntries,
        icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: 'Weekly average',
        value: `${metrics.weeklyAverage}/10`,
        icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: "Today's entries",
        value: metrics.todayEntries,
        icon: <Calendar className="h-4 w-4" aria-hidden="true" />,
      },
    ],
    [metrics.totalEntries, metrics.weeklyAverage, metrics.todayEntries]
  );

  const lastEntryLabel = useMemo(() => {
    if (metrics.recentActivity.length === 0) {
      return 'Awaiting first entry';
    }
    const lastTimestamp = metrics.recentActivity[0]?.timestamp;
    if (!lastTimestamp) return 'Awaiting first entry';
    try {
      return new Date(lastTimestamp).toLocaleString();
    } catch {
      return 'Recently updated';
    }
  }, [metrics.recentActivity]);

  const handleExport = React.useCallback(async () => {
    try {
      setIsExporting(true);
      setLiveMessage('Preparing CSV export...');
      const mod = await import('../../features/export/exportCsv');
      const csv = mod.entriesToCsv(
        entries.map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          pain: e.baselineData.pain,
          notes: e.notes || '',
        }))
      );
      mod.downloadCsv(`pain-entries-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      setLiveMessage('CSV export ready. Download starting.');
    } catch (err) {
      setLiveMessage('CSV export failed.');
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
      setTimeout(() => setLiveMessage(null), 3000);
    }
  }, [entries]);

  const handleClearData = React.useCallback(() => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to delete ALL pain entries? This action cannot be undone.'
      )
    ) {
      clearAllData();
      setLiveMessage('All data cleared successfully.');
      setTimeout(() => setLiveMessage(null), 3000);
    }
  }, [clearAllData]);

  function getPainLevelColor(pain: number) {
    if (pain <= 2) return 'text-success bg-success-bg';
    if (pain <= 5) return 'text-warning bg-warning-bg';
    if (pain <= 8) return 'text-warning bg-warning-bg';
    return 'text-destructive bg-error-bg';
  }

  function getActivityIcon(pain: number) {
    if (pain <= 2) return <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />;
    if (pain <= 5) return <Activity className="h-4 w-4 text-warning" aria-hidden="true" />;
    if (pain <= 8) return <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />;
    return <Zap className="h-4 w-4 text-destructive" aria-hidden="true" />;
  }

  return (
    <div className={cn('dashboard-container space-y-8', className)} style={{ paddingTop: '12px' }}>
      <DashboardMenu active={tab} onChange={t => setTab(t)} />

      <PageTransition type="slideUp" duration={450}>
        <section
          className={cn(
            'relative overflow-hidden rounded-3xl border border-border/40 px-6 py-8 sm:px-10 sm:py-10',
            gradients.subtleLight,
            'dark:bg-gradient-to-br dark:from-gray-950 dark:via-blue-950/80 dark:to-purple-950 shadow-[0_35px_90px_-60px_rgba(59,130,246,0.65)]'
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, rgba(59,130,246,0.35), transparent 45%), radial-gradient(circle at 85% 30%, rgba(147,51,234,0.35), transparent 55%), radial-gradient(circle at 50% 80%, rgba(6,182,212,0.2), transparent 60%)',
            }}
          />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md dark:bg-white/10 dark:text-primary-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Empathy-driven insights
              </span>

              <h2
                className={cn(
                  'text-3xl sm:text-4xl font-bold leading-tight',
                  textGradients.primary
                )}
              >
                {greeting}, let&apos;s review your progress
              </h2>

              <p className="text-base text-muted-foreground max-w-xl">{encouragement}</p>

              <div className="flex flex-wrap gap-3">
                {heroHighlights.map(highlight => (
                  <div
                    key={highlight.label}
                    className={cn(
                      'group inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur-md transition-all duration-300',
                      'dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15 hover:-translate-y-1 hover:shadow-xl'
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                      {highlight.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {highlight.label}
                      </span>
                      <span className="text-lg font-semibold text-foreground">
                        {highlight.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full max-w-xs flex-col items-start gap-3 md:items-end">
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleExport}
                disabled={isExporting}
                className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 px-6 py-3 text-primary-foreground shadow-[0_20px_60px_-25px_rgba(59,130,246,0.9)] transition-transform duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Export currently filtered entries as CSV"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
                <span>{isExporting ? 'Preparing export…' : 'Export CSV'}</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClearData}
                className="relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm"
                aria-label="Delete all pain entries"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear All Data</span>
              </Button>

              <Badge
                variant="outline"
                className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm"
              >
                Last entry: {lastEntryLabel}
              </Badge>

              <p className="text-xs text-muted-foreground max-w-[18rem] text-left md:text-right">
                Exports are encrypted locally so you control what leaves your device.
              </p>
            </div>
          </div>
        </section>
      </PageTransition>

      <div aria-live="polite" className="sr-only" role="status">
        {liveMessage}
      </div>
      {liveMessage && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary shadow-sm transition-all">
          {liveMessage}
        </div>
      )}

      {/* Predictive panel for flare-up risk */}
      {entries.length > 0 && (
        <div>
          {/* Lazy-load PredictivePanel to keep initial bundle small */}
              <React.Suspense fallback={<Loading text="Loading predictive insights..." />}>
                {React.createElement(PredictivePanelOverride ?? PredictivePanelLazy, { entries })}
              </React.Suspense>
        </div>
      )}

      <EnhancedCard
        variant="glass"
        hoverable
        animated
        className="border border-border/40 bg-card/70 backdrop-blur-xl"
      >
        <EnhancedCardHeader icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}>
          <EnhancedCardTitle gradient>AI insight highlights</EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <StaggeredChildren className="grid grid-cols-1 gap-4 lg:grid-cols-3" delay={80}>
            {aiInsights.map(insight => {
              const tone = toneStyles[insight.tone] ?? toneStyles['observation'];
              const confidence = Math.round(clamp01(insight.confidence) * 100);
              return (
                <div
                  key={insight.id}
                  className={cn(
                    'flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                    'bg-white/80 dark:bg-slate-900/60 backdrop-blur',
                    tone.accent
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 shadow-inner dark:bg-slate-950/70">
                        {tone.icon}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                        {insight.metricLabel && insight.metricValue && (
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            <span className="text-foreground font-semibold">
                              {insight.metricValue}
                            </span>
                            <span className="ml-1 text-muted-foreground">
                              {insight.metricLabel}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px] font-medium">
                      Confidence ~{confidence}%
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {insight.summary}
                  </p>
                  {insight.detail && (
                    <p className="mt-2 text-xs text-muted-foreground/80">{insight.detail}</p>
                  )}
                </div>
              );
            })}
          </StaggeredChildren>
        </EnhancedCardContent>
      </EnhancedCard>

      {tab === 'overview' ? (
        <>
          {/* Key Metrics Row */}
          <StaggeredChildren
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
            delay={90}
          >
            <div className="space-y-2 transition-all duration-200 hover:-translate-y-1">
              <MetricCard
                title="Total Entries"
                value={metrics.totalEntries}
                icon={<BarChart3 className="h-6 w-6" />}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tooltip content="All-time total (not filtered)">
                  <span className="inline-flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" aria-hidden="true" />
                    All-time total
                  </span>
                </Tooltip>
                <span aria-hidden="true">•</span>
                <span>{entries.length} currently filtered</span>
              </div>
            </div>

            <div className="space-y-2 transition-all duration-200 hover:-translate-y-1">
              <MetricCard
                title="Average Pain"
                value={`${metrics.averagePain}/10`}
                change={metrics.painTrend || undefined}
                icon={<Target className="h-6 w-6" />}
              />
              <p className="text-xs text-muted-foreground">
                Pain levels averaged across the selected timeframe.
              </p>
            </div>

            <div className="space-y-2 transition-all duration-200 hover:-translate-y-1">
              <MetricCard
                title="Overall Average"
                value={`${metrics.overallAverage ?? metrics.averagePain}/10`}
                icon={<Activity className="h-6 w-6" />}
              />
              <p className="text-xs text-muted-foreground">
                Compares filtered data to your lifetime average.
              </p>
            </div>

            <div className="space-y-2 transition-all duration-200 hover:-translate-y-1">
              <MetricCard
                title="Today's Entries"
                value={metrics.todayEntries}
                icon={<Calendar className="h-6 w-6" />}
              />
              <p className="text-xs text-muted-foreground">
                {metrics.todayEntries === 0 ? noLogsSubtext : 'Entries captured so far today.'}
              </p>
            </div>

            <div className="space-y-2 transition-all duration-200 hover:-translate-y-1">
              <MetricCard
                title="Weekly Average"
                value={`${metrics.weeklyAverage}/10`}
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <p className="text-xs text-muted-foreground">
                Past 7 days including today. Track shifts over time.
              </p>
            </div>
          </StaggeredChildren>

          <StaggeredChildren className="grid grid-cols-1 gap-6 lg:grid-cols-2" delay={120}>
            <EnhancedCard
              variant="glass"
              hoverable
              animated
              className="relative overflow-hidden border border-border/40 bg-card/70 backdrop-blur-xl"
            >
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-40 opacity-25"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(circle at 30% 20%, rgba(59,130,246,0.45), transparent 60%)',
                }}
              />
              <EnhancedCardHeader icon={<BarChart3 className="h-5 w-5" />}>
                <EnhancedCardTitle gradient>Pain Distribution</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {entries.length > 0 ? (
                  <Chart
                    data={{
                      labels: metrics.painDistribution.map(d => d.label),
                      datasets: [
                        {
                          label: 'Entries',
                          data: metrics.painDistribution.map(d => d.data[0]),
                          backgroundColor: metrics.painDistribution.map(d =>
                            d.data[0] === 0 ? 'rgba(148,163,184,0.15)' : 'rgba(59,130,246,0.35)'
                          ),
                          borderColor: metrics.painDistribution.map(d =>
                            d.data[0] === 0 ? 'rgba(148,163,184,0.3)' : 'rgba(59,130,246,0.7)'
                          ),
                          borderWidth: 2,
                          borderRadius: 12,
                        },
                      ],
                    }}
                    type="bar"
                    height={200}
                    config={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          intersect: false,
                          backgroundColor: 'rgba(15,23,42,0.85)',
                          borderColor: 'rgba(59,130,246,0.35)',
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: 'rgba(148,163,184,0.9)' },
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(148,163,184,0.15)' },
                          ticks: { stepSize: 1, color: 'rgba(148,163,184,0.9)' },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" aria-hidden="true" />
                      <p className="font-medium">{noTrendsHeadline}</p>
                      <p className="text-sm mt-1">{noTrendsSubtext}</p>
                    </div>
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard
              variant="glass"
              hoverable
              animated
              className="border border-border/40 bg-card/70 backdrop-blur-xl"
            >
              <EnhancedCardHeader icon={<TrendingUp className="h-5 w-5" />}>
                <EnhancedCardTitle gradient>Weekly Trend</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {entries.length > 0 ? (
                  hasWeeklyData ? (
                    <Chart
                      data={{
                        labels: metrics.weeklyTrend.map(d => d.label),
                        datasets: [
                          {
                            label: 'Average Pain',
                            data: metrics.weeklyTrend.map(d => d.avg as number | null),
                            borderColor: colorVar('color-primary'),
                            backgroundColor: colorVarAlpha('color-primary', 0.18),
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: colorVar('color-primary'),
                            yAxisID: 'y',
                          },
                          {
                            label: 'Entry Count',
                            data: metrics.weeklyTrend.map(d => d.count),
                            borderColor: colorVar('color-accent'),
                            backgroundColor: colorVarAlpha('color-accent', 0.12),
                            fill: true,
                            tension: 0.3,
                            borderDash: [6, 4],
                            yAxisID: 'y1',
                          },
                        ],
                      }}
                      type="line"
                      height={200}
                      config={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(148,163,184,0.9)', usePointStyle: true },
                          },
                          tooltip: {
                            intersect: false,
                            mode: 'index',
                            backgroundColor: 'rgba(15,23,42,0.85)',
                            borderColor: 'rgba(147,51,234,0.35)',
                            borderWidth: 1,
                          },
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 1, color: 'rgba(148,163,184,0.9)' },
                            grid: { color: 'rgba(148,163,184,0.15)' },
                            title: {
                              display: true,
                              text: 'Pain Level',
                              color: 'rgba(148,163,184,0.9)',
                            },
                          },
                          y1: {
                            min: 0,
                            ticks: { stepSize: 1, color: 'rgba(148,163,184,0.9)' },
                            grid: { display: false },
                            position: 'right',
                            title: {
                              display: true,
                              text: 'Entries',
                              color: 'rgba(148,163,184,0.9)',
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: 'rgba(148,163,184,0.9)' },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp
                          className="mx-auto mb-2 h-12 w-12 opacity-50"
                          aria-hidden="true"
                        />
                        <p className="font-medium">{noTrendsHeadline}</p>
                        <p className="text-sm mt-1">{noTrendsSubtext}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex h-48 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp
                        className="mx-auto mb-2 h-12 w-12 opacity-50"
                        aria-hidden="true"
                      />
                      <p className="font-medium">{noTrendsHeadline}</p>
                      <p className="text-sm mt-1">{noTrendsSubtext}</p>
                    </div>
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </StaggeredChildren>

          {/* Recent Activity */}
          <EnhancedCard variant="glass" hoverable animated>
            <EnhancedCardHeader icon={<Clock className="h-5 w-5" />}>
              <EnhancedCardTitle>Recent Activity</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              {metrics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        {getActivityIcon(activity.pain)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Pain Level: {activity.pain}/10</span>
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                getPainLevelColor(activity.pain)
                              )}
                            >
                              {activity.pain <= 2
                                ? 'Mild'
                                : activity.pain <= 5
                                  ? 'Moderate'
                                  : activity.pain <= 8
                                    ? 'Severe'
                                    : 'Extreme'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                          {activity.symptoms && activity.symptoms.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Symptoms: {activity.symptoms.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      {activity.qualityOfLife && (
                        <div className="text-right text-sm">
                          <div>Sleep: {activity.qualityOfLife.sleepQuality}/10</div>
                          <div>Mood: {activity.qualityOfLife.moodImpact}/10</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Your recent pain entries will appear here</p>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </>
      ) : tab === 'charts' ? (
        <DashboardContent entries={entries} allEntries={allEntries} />
      ) : (
        <DashboardRecent entries={entries} />
      )}
    </div>
  );
}

export default DashboardOverview;

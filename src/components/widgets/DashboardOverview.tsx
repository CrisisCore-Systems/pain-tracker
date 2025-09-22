import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Chart } from '../../design-system/components/Chart';
import { buildRolling7DayChartData, RawEntry } from '../../design-system/utils/chart';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { formatNumber } from '../../utils/formatting';
import { Tooltip } from '../tutorials/Tooltip';
import { localDayStart, isSameLocalDay } from '../../utils/dates';

interface DashboardOverviewProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  className?: string;
  tooltip?: string;
  subtitle?: React.ReactNode;
}

function MetricCard({ title, value, change, icon, className, tooltip, subtitle }: MetricCardProps) {
  const TrendIcon = change?.trend === 'up' ? TrendingUp :
                   change?.trend === 'down' ? TrendingDown : Target;

  // For pain metrics: 'up' means pain increased (worse) and should be red;
  // 'down' means pain decreased (improvement) and should be green.
  const trendColor = change?.trend === 'up' ? 'text-red-600' :
                    change?.trend === 'down' ? 'text-green-600' : 'text-blue-600';

  return (
    <Card className={cn('relative transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        {/* tooltip icon anchored top-right so it doesn't crowd the heading */}
        {tooltip && (
          <div className="absolute top-3 right-3">
            <Tooltip content={tooltip}>
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
                style={{ backgroundColor: 'hsl(var(--metric-tooltip-bg))', color: 'hsl(var(--color-muted-foreground))' }}
              >
                <HelpCircle className="h-3 w-3" />
              </span>
            </Tooltip>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={cn('flex items-center text-sm mt-1', trendColor)}>
                <TrendIcon className="h-4 w-4 mr-1" />
                <span>{change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}{change.value}% {change.label}</span>
              </div>
            )}
            {/** subtitle is optional, used for friendlier empty states like "No entries yet today" */}
            {subtitle && (
              <div className="text-sm text-muted-foreground mt-2">{subtitle}</div>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview({ entries, allEntries, className }: DashboardOverviewProps) {
  interface TrendInfo {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label: string;
  }

  interface ComputedMetrics {
    totalEntries: number;
    averagePain: string;
    overallAverage?: string;
    todayEntries: number;
    weeklyAverage: string;
    painTrend: TrendInfo | null;
  recentActivity: Array<{ id: number; pain: number; timestamp: string; symptoms: string[]; qualityOfLife?: { sleepQuality: number; moodImpact: number; socialImpact: string[] } }>;
    painDistribution: Array<{ label: string; data: number[] }>;
  weeklyTrend: Array<{ label: string; avg: number | null; count: number }>;
  }
  

  const metrics = useMemo<ComputedMetrics>(() => {
    // If there are no entries at all (neither filtered nor global), return zeros
    if ((entries.length === 0) && (!allEntries || allEntries.length === 0)) {
      return {
        totalEntries: 0,
        averagePain: formatNumber(0, 1),
        todayEntries: 0,
        weeklyAverage: formatNumber(0, 1),
        painTrend: null,
        recentActivity: [],
          painDistribution: [],
    weeklyTrend: [] as Array<{ label: string; avg: number | null; count: number }>
      };
    }

  const now = new Date();
  // Normalize to local start of day for comparisons
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const DAY_MS = 24 * 60 * 60 * 1000;
  // For a 7-day window including today, start 6 days before today
  const sevenDayStart = new Date(today.getTime() - 6 * DAY_MS);
  // Previous 7-day window immediately before the current window
  const prevWeekStart = new Date(sevenDayStart.getTime() - 7 * DAY_MS);
  const prevWeekEnd = new Date(sevenDayStart.getTime() - DAY_MS);

    // Basic metrics
    // Total entries should reflect all-time totals when provided
    const totalEntries = allEntries?.length ?? entries.length;
    // Average pain should be computed over the displayed (filtered) entries
    const averagePainRaw = entries.length > 0
      ? entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length
      : 0;
    // Overall average (all time) is computed from allEntries when available
    const overallAverageRaw = (allEntries && allEntries.length > 0)
      ? allEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / allEntries.length
      : averagePainRaw;
    const clamp = (n: number) => Math.max(0, Math.min(10, n));
    const averagePain = clamp(averagePainRaw);
    const overallAverage = clamp(overallAverageRaw);

    // Today's entries - use local-day helper for timezone-safe comparisons
    const todayEntries = entries.filter(entry => isSameLocalDay(entry.timestamp, today)).length;

    // Weekly average - use a 7-day window including today (start = today - 6 days)
    const weeklyEntries = entries.filter(entry => {
      const d = localDayStart(entry.timestamp).getTime();
      return d >= sevenDayStart.getTime() && d <= today.getTime();
    });
    const weeklyAverageRaw = weeklyEntries.length > 0
      ? weeklyEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / weeklyEntries.length
      : 0;
    const weeklyAverage = clamp(weeklyAverageRaw);

    // Pain trend (last 7 days vs previous 7 days)
    // For trend comparison: current 7-day window vs previous 7-day window
    const lastWeekEntries = weeklyEntries; // already computed for sevenDayStart..today
    const previousWeekEntries = entries.filter(entry => {
      const d = localDayStart(entry.timestamp).getTime();
      return d >= prevWeekStart.getTime() && d <= prevWeekEnd.getTime();
    });

    const lastWeekAvg = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / lastWeekEntries.length
      : 0;

    const prevWeekAvg = previousWeekEntries.length > 0
      ? previousWeekEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / previousWeekEntries.length
      : 0;

  const trendPercent = prevWeekAvg > 0 ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100 : 0;

    // Recent activity (last 5 entries)
  const recentActivity = entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map(entry => ({
        id: entry.id,
        pain: entry.baselineData.pain,
        timestamp: entry.timestamp,
        symptoms: entry.baselineData.symptoms || [],
        qualityOfLife: entry.qualityOfLife
      }));

    // Pain distribution for chart
    const painRanges = [
      { range: '0-2', count: 0, label: 'Mild' },
      { range: '3-5', count: 0, label: 'Moderate' },
      { range: '6-8', count: 0, label: 'Severe' },
      { range: '9-10', count: 0, label: 'Extreme' }
    ];

    entries.forEach(entry => {
      const pain = entry.baselineData.pain;
      if (pain <= 2) painRanges[0].count++;
      else if (pain <= 5) painRanges[1].count++;
      else if (pain <= 8) painRanges[2].count++;
      else painRanges[3].count++;
    });

    const painDistribution = painRanges.map(range => ({
      label: range.label,
  data: [range.count]
    }));

    // Weekly trend data: use helper to build a rolling 7-day avg (normalized to local timezone)
    const rawEntriesForHelper: RawEntry[] = entries.map(e => ({ created_at: e.timestamp, pain_level: e.baselineData.pain }));
    const rolling = buildRolling7DayChartData(rawEntriesForHelper, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    // rolling.labels are localized short-date labels (month/day). Build counts per day separately.
    const weeklyTrend = rolling.labels.map((label, idx) => {
      const avg = rolling.datasets[0].data[idx] as number | null;
      // Count entries that fall on the same local day as the rolling label's date: reconstruct day from today offset
      const date = new Date(today.getTime() - (6 - idx) * DAY_MS);
      const count = entries.filter(entry => isSameLocalDay(entry.timestamp, date)).length;
      return { label: new Date(today.getTime() - (6 - idx) * DAY_MS).toLocaleDateString('en-US', { weekday: 'short' }), avg, count };
    });

    return {
      totalEntries,
  averagePain: formatNumber(Number(averagePain), 1),
  overallAverage: formatNumber(Number(overallAverage), 1),
      todayEntries,
  weeklyAverage: formatNumber(Number(weeklyAverage), 1),
      painTrend: {
        // Format change value to 1 decimal
        value: Number(formatNumber(Math.abs(trendPercent), 1)),
        // For pain, an upward trend means worse (use 'up' to represent increase in pain)
        trend: (trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
        label: 'vs last week'
      },
      recentActivity,
      painDistribution,
  weeklyTrend
    };
  }, [entries, allEntries]);

  // Whether weekly trend has any real data
  const hasWeeklyData = metrics.weeklyTrend.some(d => d.avg !== null && d.count > 0);

  const getPainLevelColor = (pain: number) => {
    if (pain <= 2) return 'text-green-600 bg-green-50';
    if (pain <= 5) return 'text-yellow-600 bg-yellow-50';
    if (pain <= 8) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getActivityIcon = (pain: number) => {
    if (pain <= 2) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (pain <= 5) return <Activity className="h-4 w-4 text-yellow-600" />;
    if (pain <= 8) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <Zap className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={cn('space-y-6', className)} style={{ paddingTop: '12px' }}>
      {/* Key Metrics Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--dashboard-gap)' }}>
        <div>
          <MetricCard
            title="Total Entries"
            value={metrics.totalEntries}
            icon={<BarChart3 className="h-6 w-6" />}
            className="relative"
          />
          <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
            <Tooltip content="All-time total (not filtered)">All-time total</Tooltip>
            <span className="mx-1">·</span>
            <span>Showing {entries.length} filtered</span>
            {/* Filter badge intentionally shown in AdvancedFilters near the search controls */}
          </div>
        </div>
        <MetricCard
          title="Average Pain"
          value={metrics.averagePain}
          change={metrics.painTrend || undefined}
          icon={<Target className="h-6 w-6" />}
        />
        <MetricCard
          title="Overall Average"
          value={metrics.overallAverage ?? metrics.averagePain}
          icon={<Activity className="h-6 w-6" />}
          tooltip="Average pain across all recorded entries (not just filtered view)"
        />
        <MetricCard
          title="Today's Entries"
          value={metrics.todayEntries}
          subtitle={metrics.todayEntries === 0 ? 'No entries yet today' : undefined}
          icon={<Calendar className="h-6 w-6" />}
        />
        <MetricCard
          title="Weekly Average"
          value={metrics.weeklyAverage}
          icon={<TrendingUp className="h-6 w-6" />}
          tooltip="Average pain over the past 7 days (includes today)"
        />
      </div>
  <TrendLegend hasWeeklyData={hasWeeklyData} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Pain Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <Chart
                data={{
                  labels: metrics.painDistribution.map(d => d.label),
                  datasets: [{
                    label: 'Entries',
                    data: metrics.painDistribution.map(d => d.data[0]),
                    backgroundColor: [
                      'hsl(var(--color-secondary))',
                      'hsl(var(--color-accent))',
                      'hsl(var(--color-warning))',
                      'hsl(var(--color-destructive))'
                    ]
                  }]
                }}
                type="bar"
                height={200}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No data available</p>
                  <p className="text-sm">Start tracking to see your pain distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              hasWeeklyData ? (
                <Chart
                  data={{
                    labels: metrics.weeklyTrend.map(d => d.label),
                    datasets: [
                      {
                        label: 'Average Pain',
                        data: metrics.weeklyTrend.map(d => d.avg as number | null),
                        borderColor: 'hsl(var(--color-primary))',
                        backgroundColor: 'hsl(var(--color-primary) / 0.1)',
                        fill: true,
                        yAxisID: 'y'
                      },
                      {
                        label: 'Entry Count',
                        data: metrics.weeklyTrend.map(d => d.count),
                        borderColor: 'hsl(var(--color-accent))',
                        backgroundColor: 'hsl(var(--color-accent) / 0.08)',
                        fill: false,
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  type="line"
                  height={200}
                  scales={{
                    y: { min: 0, max: 10, ticks: { stepSize: 1 }, title: { display: true, text: 'Pain Level' } },
                    y1: { min: 0, ticks: { stepSize: 1 }, position: 'right', title: { display: true, text: 'Entries' } }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No entries this week</p>
                    <p className="text-sm">Track pain over time to see trends</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No trend data</p>
                  <p className="text-sm">Track pain over time to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.pain)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Pain Level: {activity.pain}/10</span>
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getPainLevelColor(activity.pain))}>
                          {activity.pain <= 2 ? 'Mild' : activity.pain <= 5 ? 'Moderate' : activity.pain <= 8 ? 'Severe' : 'Extreme'}
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
        </CardContent>
      </Card>
    </div>
  );
}

function TrendLegend({ hasWeeklyData }: { hasWeeklyData?: boolean }) {
  return (
    <div className="flex items-center space-x-4 text-sm mt-3">
      <div className="flex items-center space-x-1">
        <span className="inline-block w-3 h-3 bg-red-600 rounded-full" />
        <span>↑ Worse</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="inline-block w-3 h-3 bg-green-600 rounded-full" />
        <span>↓ Improvement</span>
      </div>
      {!hasWeeklyData && (
        <div className="ml-4 text-sm text-muted-foreground">
          No entries this week
        </div>
      )}
    </div>
  );
}

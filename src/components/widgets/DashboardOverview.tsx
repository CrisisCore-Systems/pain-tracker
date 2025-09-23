import React, { useMemo, useState } from 'react';
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
import DashboardMenu from './DashboardMenu';
import DashboardContent from './DashboardContent';
import DashboardRecent from './DashboardRecent';
import { localDayStart, isSameLocalDay } from '../../utils/dates';

interface DashboardOverviewProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
  className?: string;
}

function MetricCard({ title, value, change, icon, className, tooltip, subtitle }: {
  title: string;
  value: string | number;
  change?: { value: number; label: string; trend: 'up' | 'down' | 'neutral' } | undefined;
  icon: React.ReactNode;
  className?: string;
  tooltip?: string;
  subtitle?: React.ReactNode;
}) {
  const TrendIcon = change?.trend === 'up' ? TrendingUp : change?.trend === 'down' ? TrendingDown : Target;
  const trendColor = change?.trend === 'up' ? 'text-red-600' : change?.trend === 'down' ? 'text-green-600' : 'text-blue-600';

  return (
    <Card className={cn('relative transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
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
            {subtitle && (
              <div className="text-sm text-muted-foreground mt-2">{subtitle}</div>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview({ entries, allEntries, className }: DashboardOverviewProps) {
  const [tab, setTab] = useState<'overview' | 'charts' | 'recent'>('overview');

  const metrics = useMemo(() => {
    const totalEntries = (allEntries?.length ?? entries.length) || 0;
    const today = new Date();
    const todayEntries = entries.filter(e => new Date(e.timestamp).toDateString() === today.toDateString()).length;
    const averagePain = entries.length > 0 ? entries.reduce((s, e) => s + e.baselineData.pain, 0) / entries.length : 0;
    const weekly = entries.slice(-7);
    const weeklyAvg = weekly.length > 0 ? weekly.reduce((s, e) => s + e.baselineData.pain, 0) / weekly.length : 0;

    const painDistribution = [0,0,0,0];
    entries.forEach(e => {
      const p = e.baselineData.pain;
      if (p <= 2) painDistribution[0]++;
      else if (p <= 5) painDistribution[1]++;
      else if (p <= 8) painDistribution[2]++;
      else painDistribution[3]++;
    });

    const recentActivity = entries.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0,5).map(e => ({
      id: e.id,
      pain: e.baselineData.pain,
      timestamp: e.timestamp,
      symptoms: (e as any).symptoms || [],
      qualityOfLife: (e as any).qualityOfLife
    }));

    const weeklyTrend = entries.length > 0 ? entries.slice(-7).map((e, idx) => ({ label: `Day ${idx+1}`, avg: e.baselineData.pain, count: 1 })) : [];

    return {
      totalEntries,
      averagePain: formatNumber(Number(averagePain), 1),
      overallAverage: undefined,
      todayEntries,
      weeklyAverage: formatNumber(Number(weeklyAvg), 1),
      painTrend: null,
      recentActivity,
      painDistribution: [
        { label: 'Mild', data: [painDistribution[0]] },
        { label: 'Moderate', data: [painDistribution[1]] },
        { label: 'Severe', data: [painDistribution[2]] },
        { label: 'Extreme', data: [painDistribution[3]] }
      ],
      weeklyTrend
    } as const;
  }, [entries, allEntries]);

  const hasWeeklyData = metrics.weeklyTrend.length > 0;

  function getPainLevelColor(pain: number) {
    if (pain <= 2) return 'text-green-600 bg-green-50';
    if (pain <= 5) return 'text-yellow-600 bg-yellow-50';
    if (pain <= 8) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }

  function getActivityIcon(pain: number) {
    if (pain <= 2) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (pain <= 5) return <Activity className="h-4 w-4 text-yellow-600" />;
    if (pain <= 8) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <Zap className="h-4 w-4 text-red-600" />;
  }

  return (
    <div className={cn('space-y-6', className)} style={{ paddingTop: '12px' }}>
      <DashboardMenu active={tab} onChange={(t) => setTab(t)} />

      {tab === 'overview' ? (
        <>
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
              </div>
            </div>

            <MetricCard title="Average Pain" value={metrics.averagePain} change={metrics.painTrend || undefined} icon={<Target className="h-6 w-6" />} />
            <MetricCard title="Overall Average" value={metrics.overallAverage ?? metrics.averagePain} icon={<Activity className="h-6 w-6" />} tooltip="Average pain across all recorded entries (not just filtered view)" />
            <MetricCard title="Today's Entries" value={metrics.todayEntries} subtitle={metrics.todayEntries === 0 ? 'No entries yet today' : undefined} icon={<Calendar className="h-6 w-6" />} />
            <MetricCard title="Weekly Average" value={metrics.weeklyAverage} icon={<TrendingUp className="h-6 w-6" />} tooltip="Average pain over the past 7 days (includes today)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <div className="text-sm text-muted-foreground mt-1">Symptoms: {activity.symptoms.join(', ')}</div>
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

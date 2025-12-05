import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Zap,
  Download,
  Trash2,
  Sparkles,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import { PageTransition } from '../../design-system/components/PageTransition';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { isSameLocalDay, localDayStart } from '../../utils/dates';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';

// Premium stat card data for consistent styling
const statCardConfigs = [
  { id: 'avgPain', colorClass: 'stat-card-sky', orbColor: 'orb-glow-sky' },
  { id: 'streak', colorClass: 'stat-card-purple', orbColor: 'orb-glow-purple' },
  { id: 'entries', colorClass: 'stat-card-emerald', orbColor: 'orb-glow-emerald' },
  { id: 'improvement', colorClass: 'stat-card-amber', orbColor: 'orb-glow-pink' },
] as const;

interface ModernDashboardProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
  className?: string;
}

export function ModernDashboard({ entries, className }: ModernDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { clearAllData } = usePainTrackerStore();

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeEntries = entries ?? [];
    const todayStart = localDayStart(new Date());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(todayStart);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Current metrics
    const recentEntries = activeEntries.filter(e => new Date(e.timestamp) >= weekAgo);
    const olderEntries = activeEntries.filter(
      e => new Date(e.timestamp) < weekAgo && new Date(e.timestamp) >= monthAgo
    );

    const avgPainRecent =
      recentEntries.length > 0
        ? recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length
        : 0;

    const avgPainOlder =
      olderEntries.length > 0
        ? olderEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / olderEntries.length
        : avgPainRecent;

    const painTrend = avgPainRecent - avgPainOlder;

    // Streak calculation
    let currentStreak = 0;
    const sortedEntries = [...activeEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let checkDate = new Date(todayStart);
    for (const entry of sortedEntries) {
      if (isSameLocalDay(new Date(entry.timestamp), checkDate)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (new Date(entry.timestamp) < checkDate) {
        break;
      }
    }

    // Best/Worst pain days
    const sortedByPain = [...activeEntries].sort(
      (a, b) => a.baselineData.pain - b.baselineData.pain
    );
    const bestDay = sortedByPain[0];
    const worstDay = sortedByPain[sortedByPain.length - 1];

    return {
      avgPainRecent,
      avgPainOlder,
      painTrend,
      totalEntries: activeEntries.length,
      weeklyEntries: recentEntries.length,
      currentStreak,
      bestDay,
      worstDay,
      improvementRate: painTrend !== 0 ? (painTrend / avgPainOlder) * 100 : 0,
    };
  }, [entries]);

  // Chart data
  const chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
      fill?: boolean;
    }>;
  } = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      labels: sorted.map(e =>
        new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Pain Level',
          data: sorted.map(e => e.baselineData.pain),
          borderColor: colorVar('--color-primary'),
          backgroundColor: colorVar('--color-primary') + '20',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [entries]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const mod = await import('../../features/export/exportCsv');
      const csv = mod.entriesToCsv(
        entries.map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          pain: e.baselineData.pain,
          notes: e.notes || '',
        }))
      );
      mod.downloadCsv(`pain-tracker-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ Delete all entries? This cannot be undone.')) {
      clearAllData();
      setShowActions(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend < -0.5) return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    if (trend > 0.5) return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  };

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        className
      )}
    >
      {/* Premium Dark Background - matches landing page */}
      <div className="absolute inset-0 hero-bg-mesh" />
      <div className="absolute inset-0 hero-grid-pattern" />
      <div className="absolute inset-0 hero-noise-overlay" />
      
      {/* Animated Orbs */}
      <div className="orb-container">
        <div 
          className="orb-glow orb-glow-sky" 
          style={{ width: '400px', height: '400px', top: '-5%', left: '5%' }}
        />
        <div 
          className="orb-glow orb-glow-purple" 
          style={{ width: '500px', height: '500px', top: '30%', right: '-10%', animationDelay: '5s' }}
        />
        <div 
          className="orb-glow orb-glow-emerald" 
          style={{ width: '300px', height: '300px', bottom: '10%', left: '20%', animationDelay: '10s' }}
        />
      </div>

      {/* Header with Glass Navigation */}
      <div className="sticky top-4 z-50 mx-auto max-w-7xl px-4 relative">
        <div className="glass-card-premium p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-sky-500 blur-xl opacity-40" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Dashboard Overview
                </h2>
                <p className="text-sm text-slate-400">Your pain tracking insights</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                </Button>

                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 glass-card-premium p-2">
                    <button
                      onClick={handleClearData}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <PageTransition type="fade" duration={300}>
          <div className="space-y-6">
            {/* Hero Stats Grid - Premium Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Average Pain Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    {getTrendIcon(metrics.painTrend)}
                  </div>
                  <div className="stat-counter stat-counter-sky mb-1">{metrics.avgPainRecent.toFixed(1)}</div>
                  <div className="text-sm text-slate-300 font-medium">Avg Pain (7d)</div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    {metrics.painTrend < 0 ? (
                      <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                    ) : metrics.painTrend > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-red-400" />
                    ) : (
                      <Minus className="h-3 w-3 text-slate-400" />
                    )}
                    <span>{Math.abs(metrics.painTrend).toFixed(1)} vs last period</span>
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <Award className="h-5 w-5 text-purple-400/60" />
                  </div>
                  <div className="stat-counter stat-counter-purple mb-1">{metrics.currentStreak}</div>
                  <div className="text-sm text-slate-300 font-medium">Day Streak</div>
                  <div className="text-xs text-slate-500 mt-2">Keep tracking daily!</div>
                </div>
              </div>

              {/* Total Entries Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400/60" />
                  </div>
                  <div className="stat-counter stat-counter-emerald mb-1">{metrics.totalEntries}</div>
                  <div className="text-sm text-slate-300 font-medium">Total Entries</div>
                  <div className="text-xs text-slate-500 mt-2">{metrics.weeklyEntries} this week</div>
                </div>
              </div>

              {/* Improvement Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                  metrics.improvementRate < 0 ? "from-emerald-500/10" : metrics.improvementRate > 0 ? "from-amber-500/10" : "from-slate-500/10"
                )} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-2.5 rounded-xl shadow-lg",
                      metrics.improvementRate < 0 
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                        : metrics.improvementRate > 0
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
                          : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30"
                    )}>
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    {metrics.improvementRate < 0 ? (
                      <TrendingDown className="h-5 w-5 text-emerald-400" />
                    ) : metrics.improvementRate > 0 ? (
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Minus className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className={cn(
                    "stat-counter mb-1",
                    metrics.improvementRate < 0 ? "stat-counter-emerald" : metrics.improvementRate > 0 ? "stat-counter-amber" : "text-slate-300"
                  )}>
                    {Math.abs(metrics.improvementRate).toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-300 font-medium">
                    {metrics.improvementRate < 0
                      ? 'Improving'
                      : metrics.improvementRate > 0
                        ? 'Needs Attention'
                        : 'Stable'}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">vs previous period</div>
                </div>
              </div>
            </div>

            {/* Pain Trend Chart - Premium Glass */}
            <div className="glass-card-premium p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Pain Trend</h3>
                    <p className="text-sm text-slate-400">Your pain levels over time</p>
                  </div>
                </div>
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 rounded-full px-3 py-1">
                  <span className="flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  Live Data
                </Badge>
              </div>
              <div className="h-64">
                <Chart type="line" data={chartData} height={256} />
              </div>
            </div>

            {/* Quick Insights - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.bestDay && (
                <div className="glass-card-premium p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">Best Day</h4>
                      <p className="text-2xl font-bold text-white">
                        {metrics.bestDay.baselineData.pain}/10
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(metrics.bestDay.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {metrics.worstDay && (
                <div className="glass-card-premium p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-300 mb-1">Challenging Day</h4>
                      <p className="text-2xl font-bold text-white">
                        {metrics.worstDay.baselineData.pain}/10
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(metrics.worstDay.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}

export default ModernDashboard;

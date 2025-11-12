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
  Minus
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import { PageTransition } from '../../design-system/components/PageTransition';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { isSameLocalDay, localDayStart } from '../../utils/dates';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';

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
    const olderEntries = activeEntries.filter(e => new Date(e.timestamp) < weekAgo && new Date(e.timestamp) >= monthAgo);
    
    const avgPainRecent = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length
      : 0;
    
    const avgPainOlder = olderEntries.length > 0
      ? olderEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / olderEntries.length
      : avgPainRecent;

    const painTrend = avgPainRecent - avgPainOlder;
    
    // Streak calculation
    let currentStreak = 0;
    const sortedEntries = [...activeEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
    const sortedByPain = [...activeEntries].sort((a, b) => a.baselineData.pain - b.baselineData.pain);
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
      improvementRate: painTrend !== 0 ? ((painTrend / avgPainOlder) * 100) : 0
    };
  }, [entries]);

  // Chart data
  const chartData: { labels: string[]; datasets: Array<{ label: string; data: number[]; borderColor?: string; backgroundColor?: string; tension?: number; fill?: boolean; }> } = useMemo(() => {
    const sorted = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      labels: sorted.map(e => new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Pain Level',
        data: sorted.map(e => e.baselineData.pain),
        borderColor: colorVar('--color-primary'),
        backgroundColor: colorVar('--color-primary') + '20',
        tension: 0.4,
        fill: true
      }]
    };
  }, [entries]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const mod = await import('../../features/export/exportCsv');
      const csv = mod.entriesToCsv(
        entries.map((e) => ({
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
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950', className)}>
      {/* Header with Actions */}
      <div className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-black/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your pain tracking summary</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="rounded-xl"
                >
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </Button>
                
                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-2">
                    <button
                      onClick={handleClearData}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageTransition type="fade" duration={300}>
          <div className="space-y-6">
              {/* Hero Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Pain Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="h-8 w-8 opacity-80" />
                      {getTrendIcon(metrics.painTrend)}
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {metrics.avgPainRecent.toFixed(1)}
                    </div>
                    <div className="text-sm opacity-90">Avg Pain (7d)</div>
                    <div className="text-xs opacity-75 mt-2">
                      {metrics.painTrend < 0 ? '↓' : metrics.painTrend > 0 ? '↑' : '→'} 
                      {' '}{Math.abs(metrics.painTrend).toFixed(1)} vs last period
                    </div>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="h-8 w-8 opacity-80" />
                      <Award className="h-6 w-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {metrics.currentStreak}
                    </div>
                    <div className="text-sm opacity-90">Day Streak</div>
                    <div className="text-xs opacity-75 mt-2">
                      Keep tracking daily!
                    </div>
                  </div>
                </div>

                {/* Total Entries Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="h-8 w-8 opacity-80" />
                      <CheckCircle2 className="h-6 w-6 opacity-60" />
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {metrics.totalEntries}
                    </div>
                    <div className="text-sm opacity-90">Total Entries</div>
                    <div className="text-xs opacity-75 mt-2">
                      {metrics.weeklyEntries} this week
                    </div>
                  </div>
                </div>

                {/* Improvement Card */}
                <div className={cn(
                  "group relative overflow-hidden rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105",
                  metrics.improvementRate < 0 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : metrics.improvementRate > 0
                    ? "bg-gradient-to-br from-orange-500 to-red-600"
                    : "bg-gradient-to-br from-gray-500 to-slate-600"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="h-8 w-8 opacity-80" />
                      {metrics.improvementRate < 0 ? (
                        <TrendingDown className="h-6 w-6" />
                      ) : metrics.improvementRate > 0 ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <Minus className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {Math.abs(metrics.improvementRate).toFixed(0)}%
                    </div>
                    <div className="text-sm opacity-90">
                      {metrics.improvementRate < 0 ? 'Improving' : metrics.improvementRate > 0 ? 'Needs Attention' : 'Stable'}
                    </div>
                    <div className="text-xs opacity-75 mt-2">
                      vs previous period
                    </div>
                  </div>
                </div>
              </div>

              {/* Pain Trend Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pain Trend</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your pain levels over time</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
                <div className="h-64">
                  <Chart
                    type="line"
                    data={chartData}
                    height={256}
                  />
                </div>
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.bestDay && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Best Day</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Pain level: {metrics.bestDay.baselineData.pain}/10
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {new Date(metrics.bestDay.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.worstDay && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-500 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Challenging Day</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Pain level: {metrics.worstDay.baselineData.pain}/10
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {new Date(metrics.worstDay.timestamp).toLocaleDateString()}
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

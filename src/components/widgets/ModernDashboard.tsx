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
  Minus,
  BarChart3,
  MessageCircle,
  Lightbulb,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge } from '../../design-system';
import { PageTransition } from '../../design-system/components/PageTransition';
import type { PainEntry } from '../../types';
import { isSameLocalDay, localDayStart } from '../../utils/dates';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';
import { exportToCSV, downloadData } from '../../utils/pain-tracker/export';
import { clearAllUserData } from '../../utils/clear-all-user-data';
import {
  describePainLevel,
  describeTrend,
  describeStreak,
  describeEntryCount,
  describeBestDay,
  describeChallengingDay,
  describeImprovementRate,
  generateHumanizedSummary,
  // New pattern analysis functions
  analyzeTimeOfDayPatterns,
  analyzeDayOfWeekPatterns,
  analyzeTriggerPatterns,
  generateComparativeInsight,
  getEnhancedGreeting,
} from '../../utils/humanize';

interface ModernDashboardProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
  className?: string;
}

export function ModernDashboard({ entries, className }: ModernDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Calculate metrics with humanized descriptions
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

    const improvementRate = painTrend !== 0 && avgPainOlder !== 0 
      ? (painTrend / avgPainOlder) * 100 
      : 0;

    // Generate humanized descriptions
    const painDescription = describePainLevel(avgPainRecent);
    const trendDescription = describeTrend(avgPainRecent, avgPainOlder, recentEntries.length >= 3);
    const streakDescription = describeStreak(currentStreak);
    const entryDescription = describeEntryCount(activeEntries.length, recentEntries.length);
    const improvementDescription = describeImprovementRate(improvementRate);
    const bestDayDescription = describeBestDay(bestDay);
    const worstDayDescription = describeChallengingDay(worstDay);
    const humanSummary = generateHumanizedSummary(
      avgPainRecent,
      painTrend,
      currentStreak,
      activeEntries.length
    );

    // NEW: Advanced pattern analysis
    const timeOfDayPatterns = analyzeTimeOfDayPatterns(activeEntries);
    const dayOfWeekPatterns = analyzeDayOfWeekPatterns(activeEntries);
    const triggerPatterns = analyzeTriggerPatterns(activeEntries);
    const weekComparison = generateComparativeInsight(recentEntries, olderEntries);
    const enhancedGreeting = getEnhancedGreeting(activeEntries);

    return {
      avgPainRecent,
      avgPainOlder,
      painTrend,
      totalEntries: activeEntries.length,
      weeklyEntries: recentEntries.length,
      currentStreak,
      bestDay,
      worstDay,
      improvementRate,
      // Humanized descriptions
      painDescription,
      trendDescription,
      streakDescription,
      entryDescription,
      improvementDescription,
      bestDayDescription,
      worstDayDescription,
      humanSummary,
      // NEW: Pattern analysis
      timeOfDayPatterns,
      dayOfWeekPatterns,
      triggerPatterns,
      weekComparison,
      enhancedGreeting,
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
      const csv = exportToCSV(entries);
      downloadData(
        csv,
        `pain-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`,
        'text/csv'
      );
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('⚠️ Delete all entries? This cannot be undone.')) {
      await clearAllUserData();
      setShowActions(false);
    }
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
                  {metrics.enhancedGreeting.greeting}
                </h2>
                <p className="text-sm text-slate-400">{metrics.enhancedGreeting.personalizedMessage}</p>
                {metrics.enhancedGreeting.dataInsight && (
                  <p className="text-xs text-sky-400 mt-1">{metrics.enhancedGreeting.dataInsight}</p>
                )}
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
      </div>      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <PageTransition type="fade" duration={300}>
          <div className="space-y-6">
            {/* Humanized Summary Card */}
            <div className="glass-card-premium p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-indigo-500/30 shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Your Week at a Glance</h3>
                  <p className="text-slate-300 leading-relaxed">{metrics.humanSummary}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      metrics.trendDescription.direction === 'improving' 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : metrics.trendDescription.direction === 'worsening'
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    )}>
                      {metrics.trendDescription.headline}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 rounded-full px-3 py-1 text-xs">
                      {metrics.entryDescription.dataQuality === 'rich' ? '📊 Rich data' : 
                       metrics.entryDescription.dataQuality === 'solid' ? '📈 Solid data' :
                       metrics.entryDescription.dataQuality === 'growing' ? '🌱 Growing data' : '🌟 Just starting'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Stats Grid - Premium Glass Cards with Humanized Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Average Pain Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg">{metrics.painDescription.emoji}</span>
                  </div>
                  <div className="stat-counter stat-counter-sky mb-1">{metrics.avgPainRecent.toFixed(1)}</div>
                  <div className="text-sm text-slate-300 font-medium">{metrics.painDescription.level} Pain</div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{metrics.painDescription.description}</p>
                </div>
              </div>

              {/* Streak Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    {metrics.streakDescription.milestone && (
                      <Award className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="stat-counter stat-counter-purple mb-1">{metrics.currentStreak}</div>
                  <div className="text-sm text-slate-300 font-medium">Day Streak</div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{metrics.streakDescription.encouragement}</p>
                </div>
              </div>

              {/* Total Entries Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400/60" />
                  </div>
                  <div className="stat-counter stat-counter-emerald mb-1">{metrics.totalEntries}</div>
                  <div className="text-sm text-slate-300 font-medium">{metrics.entryDescription.totalMessage}</div>
                  <p className="text-xs text-slate-500 mt-2">{metrics.entryDescription.weeklyMessage}</p>
                </div>
              </div>

              {/* Trend/Improvement Card */}
              <div className="glass-card-premium group p-6 relative overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                  metrics.improvementDescription.tone === 'positive' ? "from-emerald-500/10" : 
                  metrics.improvementDescription.tone === 'attention' ? "from-amber-500/10" : "from-slate-500/10"
                )} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "p-2.5 rounded-xl shadow-lg",
                      metrics.improvementDescription.tone === 'positive'
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                        : metrics.improvementDescription.tone === 'attention'
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
                          : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30"
                    )}>
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    {metrics.trendDescription.direction === 'improving' ? (
                      <TrendingDown className="h-5 w-5 text-emerald-400" />
                    ) : metrics.trendDescription.direction === 'worsening' ? (
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Minus className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold mb-1",
                    metrics.improvementDescription.tone === 'positive' ? "text-emerald-400" : 
                    metrics.improvementDescription.tone === 'attention' ? "text-amber-400" : "text-slate-300"
                  )}>
                    {metrics.improvementDescription.label}
                  </div>
                  <div className="text-sm text-slate-300 font-medium">{metrics.improvementDescription.description}</div>
                  <p className="text-xs text-slate-500 mt-2">{metrics.improvementDescription.suggestion}</p>
                </div>
              </div>
            </div>

            {/* Actionable Insight Card */}
            <div className="glass-card-premium p-6 border-l-4 border-l-sky-500">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30 shrink-0">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-sky-300 mb-1">What This Means For You</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{metrics.trendDescription.detail}</p>
                  <p className="text-slate-400 text-sm mt-2">
                    <span className="text-sky-400 font-medium">Suggested action:</span> {metrics.trendDescription.actionItem}
                  </p>
                </div>
              </div>
            </div>

            {/* NEW: Pattern Analysis Section */}
            {(metrics.timeOfDayPatterns.hasEnoughData || metrics.dayOfWeekPatterns.hasEnoughData || metrics.triggerPatterns.hasEnoughData) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Pattern Insights</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Time of Day Patterns */}
                  {metrics.timeOfDayPatterns.hasEnoughData && (
                    <div className="glass-card-premium p-5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-orange-500/30">
                            {metrics.timeOfDayPatterns.worstTimeOfDay?.includes('Morning') ? <Sunrise className="h-4 w-4 text-white" /> :
                             metrics.timeOfDayPatterns.worstTimeOfDay?.includes('Evening') ? <Sunset className="h-4 w-4 text-white" /> :
                             metrics.timeOfDayPatterns.worstTimeOfDay?.includes('Night') ? <Moon className="h-4 w-4 text-white" /> :
                             <Sun className="h-4 w-4 text-white" />}
                          </div>
                          <h4 className="text-sm font-semibold text-orange-300">Time of Day</h4>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-3">
                          {metrics.timeOfDayPatterns.insight}
                        </p>
                        {metrics.timeOfDayPatterns.bestTimeOfDay && metrics.timeOfDayPatterns.worstTimeOfDay && (
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="text-slate-400">Best: {metrics.timeOfDayPatterns.bestTimeOfDay.split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span className="text-slate-400">Tough: {metrics.timeOfDayPatterns.worstTimeOfDay.split(' ')[0]}</span>
                            </div>
                          </div>
                        )}
                        {metrics.timeOfDayPatterns.patterns.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2">
                            Based on{' '}
                            {metrics.timeOfDayPatterns.patterns.reduce(
                              (sum, p) => sum + (p.entryCount ?? 0),
                              0
                            )}{' '}
                            entries across {metrics.timeOfDayPatterns.patterns.length} time windows.
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/50">
                          {metrics.timeOfDayPatterns.recommendation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Day of Week Patterns */}
                  {metrics.dayOfWeekPatterns.hasEnoughData && (
                    <div className="glass-card-premium p-5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-sm font-semibold text-blue-300">Weekly Rhythm</h4>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-3">
                          {metrics.dayOfWeekPatterns.insight}
                        </p>
                        {metrics.dayOfWeekPatterns.bestDay && metrics.dayOfWeekPatterns.worstDay && (
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="text-slate-400">Best: {metrics.dayOfWeekPatterns.bestDay}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span className="text-slate-400">Tough: {metrics.dayOfWeekPatterns.worstDay}</span>
                            </div>
                          </div>
                        )}
                        {metrics.dayOfWeekPatterns.weekdayAvg !== null && metrics.dayOfWeekPatterns.weekendAvg !== null && (
                          <div className="flex gap-4 text-xs mt-2">
                            <span className="text-slate-500">Weekday avg: {metrics.dayOfWeekPatterns.weekdayAvg.toFixed(1)}</span>
                            <span className="text-slate-500">Weekend avg: {metrics.dayOfWeekPatterns.weekendAvg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trigger Patterns */}
                  {metrics.triggerPatterns.hasEnoughData && (
                    <div className="glass-card-premium p-5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-rose-600 shadow-lg shadow-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-sm font-semibold text-red-300">Trigger Analysis</h4>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-3">
                          {metrics.triggerPatterns.insight}
                        </p>
                        {metrics.triggerPatterns.correlations.length > 0 && (
                          <div className="space-y-2">
                            {metrics.triggerPatterns.correlations.slice(0, 3).map((corr) => (
                              <div key={corr.trigger} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 capitalize">{corr.trigger}</span>
                                <Badge className={cn(
                                  "text-xs px-2 py-0.5",
                                  corr.impact === 'strong' ? "bg-red-500/20 text-red-300" :
                                  corr.impact === 'moderate' ? "bg-amber-500/20 text-amber-300" :
                                  "bg-slate-500/20 text-slate-300"
                                )}>
                                  {corr.impact}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Week Comparison Card */}
                {metrics.weekComparison && (
                  <div className={cn(
                    "glass-card-premium p-5 border-l-4",
                    metrics.weekComparison.trend === 'better' ? "border-l-emerald-500" :
                    metrics.weekComparison.trend === 'worse' ? "border-l-amber-500" :
                    "border-l-slate-500"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl shadow-lg shrink-0",
                        metrics.weekComparison.trend === 'better' 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                          : metrics.weekComparison.trend === 'worse'
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
                            : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30"
                      )}>
                        {metrics.weekComparison.trend === 'better' ? (
                          <TrendingDown className="h-5 w-5 text-white" />
                        ) : metrics.weekComparison.trend === 'worse' ? (
                          <TrendingUp className="h-5 w-5 text-white" />
                        ) : (
                          <Minus className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "text-sm font-semibold mb-1",
                          metrics.weekComparison.trend === 'better' ? "text-emerald-300" :
                          metrics.weekComparison.trend === 'worse' ? "text-amber-300" :
                          "text-slate-300"
                        )}>
                          Week-over-Week Comparison
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{metrics.weekComparison.humanized}</p>
                        <p className="text-slate-400 text-xs mt-2">{metrics.weekComparison.encouragement}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn(
                          "text-2xl font-bold",
                          metrics.weekComparison.trend === 'better' ? "text-emerald-400" :
                          metrics.weekComparison.trend === 'worse' ? "text-amber-400" :
                          "text-slate-400"
                        )}>
                          {metrics.weekComparison.changePercent > 0 ? '+' : ''}{metrics.weekComparison.changePercent.toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-500">vs last week</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pain Trend Chart - Premium Glass */}
            <div className="glass-card-premium p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Pain Trend</h3>
                    <p className="text-sm text-slate-400">{metrics.trendDescription.encouragement}</p>
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

            {/* Quick Insights - Premium Cards with Humanized Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.bestDayDescription && (
                <div className="glass-card-premium p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-300 mb-1">Your Best Day</h4>
                        <p className="text-2xl font-bold text-white">{metrics.bestDayDescription.headline}</p>
                        <p className="text-xs text-slate-400 mt-1">{metrics.bestDayDescription.context}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 border-t border-slate-700/50 pt-3 mt-3">
                      {metrics.bestDayDescription.insight}
                    </p>
                  </div>
                </div>
              )}

              {metrics.worstDayDescription && (
                <div className="glass-card-premium p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-300 mb-1">Most Challenging Day</h4>
                        <p className="text-2xl font-bold text-white">{metrics.worstDayDescription.headline}</p>
                        <p className="text-xs text-slate-400 mt-1">{metrics.worstDayDescription.context}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 border-t border-slate-700/50 pt-3 mt-3">
                      {metrics.worstDayDescription.insight}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pain Level Legend */}
            <div className="glass-card-premium p-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Understanding Your Pain Scale</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[0, 2, 4, 6, 8, 10].map((level) => {
                  const desc = describePainLevel(level);
                  return (
                    <div key={level} className="text-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                      <span className="text-2xl mb-1 block">{desc.emoji}</span>
                      <span className="text-xs font-medium text-slate-300">{desc.level}</span>
                      <span className="text-xs text-slate-500 block">{level}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}

export default ModernDashboard;

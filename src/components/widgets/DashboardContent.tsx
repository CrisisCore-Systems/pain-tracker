import React, { useMemo } from 'react';
import Chart from '../../design-system/components/Chart';
import { BarChart3, TrendingUp, Activity, Calendar, Target } from 'lucide-react';
import { buildRolling7DayChartData, RawEntry } from '../../design-system/utils/chart';
import type { PainEntry } from '../../types';
import { formatNumber } from '../../utils/formatting';

interface DashboardContentProps {
  entries: PainEntry[];
  allEntries?: PainEntry[];
}

export function DashboardContent({ entries, allEntries }: DashboardContentProps) {
  const metrics = useMemo(() => {
    const totalEntries = allEntries?.length ?? entries.length;
    const averagePain =
      entries.length > 0
        ? entries.reduce((s, e) => s + e.baselineData.pain, 0) / entries.length
        : 0;
    const weekly = entries.slice(-7);
    const weeklyAvg =
      weekly.length > 0 ? weekly.reduce((s, e) => s + e.baselineData.pain, 0) / weekly.length : 0;

    const painRanges = [0, 0, 0, 0];
    entries.forEach(e => {
      const p = e.baselineData.pain;
      if (p <= 2) painRanges[0]++;
      else if (p <= 5) painRanges[1]++;
      else if (p <= 8) painRanges[2]++;
      else painRanges[3]++;
    });

    const rolling = buildRolling7DayChartData(
      entries.map(e => ({ created_at: e.timestamp, pain_level: e.baselineData.pain }) as RawEntry),
      {}
    );

    // Calculate trend
    const recentAvg = weekly.length > 0 
      ? weekly.reduce((s, e) => s + e.baselineData.pain, 0) / weekly.length 
      : 0;
    const olderEntries = entries.slice(-14, -7);
    const olderAvg = olderEntries.length > 0
      ? olderEntries.reduce((s, e) => s + e.baselineData.pain, 0) / olderEntries.length
      : recentAvg;
    const trendPct = olderAvg !== 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    return { totalEntries, averagePain, weeklyAvg, painRanges, rolling, trendPct };
  }, [entries, allEntries]);

  return (
    <div className="space-y-6 relative z-10">
      {/* Stats Cards - Premium Glass Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-premium p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Total Entries</span>
          </div>
          <div className="stat-counter stat-counter-sky text-3xl">{metrics.totalEntries}</div>
        </div>

        <div className="glass-card-premium p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Avg Pain</span>
          </div>
          <div className="stat-counter stat-counter-purple text-3xl">{formatNumber(Number(metrics.averagePain), 1)}</div>
        </div>

        <div className="glass-card-premium p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Weekly Avg</span>
          </div>
          <div className="stat-counter stat-counter-emerald text-3xl">{formatNumber(Number(metrics.weeklyAvg), 1)}</div>
        </div>

        <div className="glass-card-premium p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg shadow-lg ${
              metrics.trendPct < 0 
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30'
                : metrics.trendPct > 0
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30'
            }`}>
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Trend</span>
          </div>
          <div className={`stat-counter text-3xl ${
            metrics.trendPct < 0 ? 'stat-counter-emerald' : metrics.trendPct > 0 ? 'stat-counter-amber' : 'text-slate-300'
          }`}>
            {metrics.trendPct < 0 ? '↓' : metrics.trendPct > 0 ? '↑' : '→'} {Math.abs(metrics.trendPct).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Charts - Premium Glass Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-500/30">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Pain Distribution</h3>
          </div>
          <Chart
            data={{
              labels: ['Mild', 'Moderate', 'Severe', 'Extreme'],
              datasets: [{ label: 'Entries', data: metrics.painRanges }],
            }}
            type="bar"
            height={200}
          />
        </div>

        <div className="glass-card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Weekly Trend</h3>
          </div>
          <Chart
            data={{
              labels: metrics.rolling.labels || [],
              datasets: metrics.rolling.datasets || [],
            }}
            type="line"
            height={200}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;

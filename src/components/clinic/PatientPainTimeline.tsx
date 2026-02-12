import React, { useState, useMemo } from 'react';
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Brush,
} from 'recharts';
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Calendar,
  Pill,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
} from 'lucide-react';

interface PainEntry {
  id: string;
  timestamp: string;
  painLevel: number;
  location: string;
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood?: number;
  sleep?: number;
  notes?: string;
}

interface Intervention {
  id: string;
  date: string;
  type: 'medication' | 'therapy' | 'procedure' | 'lifestyle';
  name: string;
  dosage?: string;
  provider?: string;
  notes?: string;
}

interface PatientPainTimelineProps {
  patientId: string;
  patientName: string;
  entries: PainEntry[];
  interventions: Intervention[];
  dateRange?: { start: Date; end: Date };
}

export const PatientPainTimeline: React.FC<PatientPainTimelineProps> = ({
  patientName,
  entries,
  interventions,
}) => {
  const [viewMode, setViewMode] = useState<'trend' | 'correlation' | 'pattern'>('trend');
  const [timeFrame, setTimeFrame] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showInterventions, setShowInterventions] = useState(true);

  // Process data for charts
  const chartData = useMemo(() => {
    const now = new Date();
    const daysBack = timeFrame === '7d' ? 7 : timeFrame === '30d' ? 30 : timeFrame === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return entries
      .filter((entry) => new Date(entry.timestamp) >= cutoffDate)
      .map((entry) => ({
        date: new Date(entry.timestamp).toLocaleDateString(),
        timestamp: entry.timestamp,
        painLevel: entry.painLevel,
        mood: entry.mood || 0,
        sleep: entry.sleep || 0,
        hasMedication: (entry.medications?.length || 0) > 0,
        hasTriggers: (entry.triggers?.length || 0) > 0,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [entries, timeFrame]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const painLevels = chartData.map((d) => d.painLevel);
    const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;
    const maxPain = Math.max(...painLevels);
    const minPain = Math.min(...painLevels);

    // Calculate trend (simple linear regression)
    const n = painLevels.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = painLevels.reduce((a, b) => a + b, 0);
    const sumXY = painLevels.reduce((acc, y, x) => acc + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    const trend = slope < -0.05 ? 'improving' : slope > 0.05 ? 'worsening' : 'stable';

    return {
      avgPain: avgPain.toFixed(1),
      maxPain,
      minPain,
      trend,
      slope,
      dataPoints: n,
    };
  }, [chartData]);

  // Identify correlations
  const correlations = useMemo(() => {
    const results: { factor: string; impact: string; confidence: string }[] = [];

    // Medication effectiveness
    const withMed = chartData.filter((d) => d.hasMedication).map((d) => d.painLevel);
    const withoutMed = chartData.filter((d) => !d.hasMedication).map((d) => d.painLevel);
    if (withMed.length > 0 && withoutMed.length > 0) {
      const avgWithMed = withMed.reduce((a, b) => a + b, 0) / withMed.length;
      const avgWithoutMed = withoutMed.reduce((a, b) => a + b, 0) / withoutMed.length;
      const diff = avgWithoutMed - avgWithMed;
      if (diff > 0.5) {
        results.push({
          factor: 'Medication',
          impact: `Reduces pain by ${diff.toFixed(1)} points`,
          confidence: 'High',
        });
      }
    }

    // Mood-pain correlation
    const moodData = chartData.filter((d) => d.mood > 0);
    if (moodData.length > 5) {
      const correlation = calculateCorrelation(
        moodData.map((d) => d.mood),
        moodData.map((d) => d.painLevel)
      );
      if (Math.abs(correlation) > 0.5) {
        results.push({
          factor: 'Mood',
          impact: correlation < 0 ? 'Better mood = Lower pain' : 'Better mood = Higher pain',
          confidence: Math.abs(correlation) > 0.7 ? 'High' : 'Medium',
        });
      }
    }

    // Sleep-pain correlation
    const sleepData = chartData.filter((d) => d.sleep > 0);
    if (sleepData.length > 5) {
      const correlation = calculateCorrelation(
        sleepData.map((d) => d.sleep),
        sleepData.map((d) => d.painLevel)
      );
      if (Math.abs(correlation) > 0.5) {
        results.push({
          factor: 'Sleep Quality',
          impact: correlation < 0 ? 'Better sleep = Lower pain' : 'Poor sleep = Higher pain',
          confidence: Math.abs(correlation) > 0.7 ? 'High' : 'Medium',
        });
      }
    }

    return results;
  }, [chartData]);

  // Helper function for correlation
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Export functionality
  const handleExport = () => {
    const csvContent =
      'Date,Pain Level,Mood,Sleep,Medications,Triggers\n' +
      entries
        .map(
          (e) =>
            `${e.timestamp},${e.painLevel},${e.mood || ''},${e.sleep || ''},${e.medications?.join(';') || ''},${e.triggers?.join(';') || ''}`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName}-pain-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pain Timeline</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive view of {patientName}'s pain journey
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* View mode selector */}
        <div className="flex gap-2 mb-4">
          {(['trend', 'correlation', 'pattern'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Time frame selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((frame) => (
            <button
              key={frame}
              onClick={() => setTimeFrame(frame)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeFrame === frame
                  ? 'bg-slate-900 dark:bg-slate-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {frame === '7d' ? '7 days' : frame === '30d' ? '30 days' : frame === '90d' ? '90 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average Pain</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.avgPain}/10</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  {stats.trend === 'improving' ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Improving</span>
                    </>
                  ) : stats.trend === 'worsening' ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <span className="text-lg font-bold text-red-600">Worsening</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 text-amber-600" />
                      <span className="text-lg font-bold text-amber-600">Stable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Range</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.minPain} - {stats.maxPain}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Data Points</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.dataPoints}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Main chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {viewMode === 'trend' && 'Pain Level Trend'}
          {viewMode === 'correlation' && 'Multi-Factor Correlation'}
          {viewMode === 'pattern' && 'Pattern Analysis'}
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          {viewMode === 'trend' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--color-card))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '8px',
                  color: 'rgb(var(--color-card-foreground))',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="painLevel" stroke="#ef4444" strokeWidth={2} name="Pain Level" />
              <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2} name="Sleep Quality" />
              <Brush dataKey="date" height={30} stroke="#3b82f6" />
            </ComposedChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--color-card))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '8px',
                  color: 'rgb(var(--color-card-foreground))',
                }}
              />
              <Legend />
              <Bar dataKey="painLevel" fill="#ef4444" name="Pain Level" radius={[8, 8, 0, 0]} />
              <Brush dataKey="date" height={30} stroke="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Correlations insights */}
      {correlations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI-Detected Patterns</h3>
          </div>
          <div className="space-y-3">
            {correlations.map((corr, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{corr.factor}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{corr.impact}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                      corr.confidence === 'High'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {corr.confidence} Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interventions timeline */}
      {showInterventions && interventions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Treatment Interventions</h3>
            </div>
            <button
              onClick={() => setShowInterventions(!showInterventions)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showInterventions ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="space-y-3">
            {interventions.slice(0, 5).map((intervention) => (
              <div key={intervention.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    intervention.type === 'medication'
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : intervention.type === 'therapy'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : intervention.type === 'procedure'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                  }`}
                >
                  <Pill className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white">{intervention.name}</h4>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(intervention.date).toLocaleDateString()}
                    </span>
                  </div>
                  {intervention.dosage && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Dosage: {intervention.dosage}</p>
                  )}
                  {intervention.provider && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Provider: {intervention.provider}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Advanced Analytics Dashboard
 * Enhanced analytics with predictive insights, advanced visualizations, and interactive features
 */

import React, { useState, useMemo } from 'react';
import { isFeatureEnabled } from '../../config/beta';
import { formatNumber } from '../../utils/formatting';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Brain,
  Heart,
  Lightbulb,
  Download,
  Calendar,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../design-system';
import Chart from '../../design-system/components/Chart';
import { colorVar, colorVarAlpha } from '../../design-system/utils/theme';
import type { ChartPointMetaArray } from '../../design-system/types/chart';
import { rollingAverage, movingStdDev, detectAnomalies } from '../../utils/analytics';
import helpers from './helpers/analyticsHelpers';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';

interface AdvancedAnalyticsDashboardProps {
  entries: PainEntry[];
  className?: string;
}

interface PredictiveInsight {
  type: 'trend' | 'pattern' | 'anomaly' | 'forecast';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendation?: string;
}

interface AdvancedMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  description: string;
  chartData?: unknown[];
}

export function AdvancedAnalyticsDashboard({ entries, className }: AdvancedAnalyticsDashboardProps) {
  // Respect beta feature flag: if advanced analytics feature is disabled, render nothing
  if (!isFeatureEnabled('advancedAnalytics')) return null as any;
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showPredictions, setShowPredictions] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);

  // Advanced metrics calculation
  const advancedMetrics = useMemo(() => {
    if (entries.length === 0) return [];

    const now = new Date();
    const timeframeDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const days = timeframeDays[timeframe];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filteredEntries = entries.filter(entry =>
      new Date(entry.timestamp) >= startDate
    );

  const metrics: AdvancedMetric[] = [];

    // Pain Level Trends
  const avgPain = filteredEntries.length > 0 ? filteredEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / filteredEntries.length : 0;
    const prevPeriodAvg = entries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const prevStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
        return entryDate >= prevStart && entryDate < startDate;
      })
      .reduce((sum, entry) => sum + entry.baselineData.pain, 0) /
      Math.max(entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const prevStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
        return entryDate >= prevStart && entryDate < startDate;
      }).length, 1);

    const painChange = prevPeriodAvg > 0 ? ((avgPain - prevPeriodAvg) / prevPeriodAvg) * 100 : 0;

    metrics.push({
      id: 'pain-level',
      name: 'Average Pain Level',
      value: avgPain,
      change: painChange,
      trend: painChange > 5 ? 'up' : painChange < -5 ? 'down' : 'stable',
      category: 'Pain Management',
      description: 'Average pain intensity across all entries',
      chartData: generateTrendData(filteredEntries, 'pain')
    });

    // Entry Frequency
  const entriesPerDay = filteredEntries.length > 0 ? filteredEntries.length / days : 0;
    const prevEntriesPerDay = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const prevStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
      return entryDate >= prevStart && entryDate < startDate;
    }).length / days;

    const frequencyChange = prevEntriesPerDay > 0 ? ((entriesPerDay - prevEntriesPerDay) / prevEntriesPerDay) * 100 : 0;

    metrics.push({
      id: 'frequency',
      name: 'Entry Frequency',
      value: entriesPerDay,
      change: frequencyChange,
      trend: frequencyChange > 10 ? 'up' : frequencyChange < -10 ? 'down' : 'stable',
      category: 'Tracking Habits',
      description: 'Average entries per day',
      chartData: generateFrequencyData(filteredEntries, days)
    });

    // Pain Intensity Distribution
    const intensityDistribution = calculateIntensityDistribution(filteredEntries);
    metrics.push({
      id: 'intensity',
      name: 'Pain Distribution',
      value: intensityDistribution.variance,
      change: 0, // Would need historical comparison
      trend: 'stable',
      category: 'Pain Patterns',
      description: 'Variability in pain intensity levels',
      chartData: intensityDistribution.data
    });

    // Symptom Correlation
    const symptomCorrelation = calculateSymptomCorrelation(filteredEntries);
    metrics.push({
      id: 'symptoms',
      name: 'Symptom Patterns',
      value: symptomCorrelation.strength,
      change: 0,
      trend: 'stable',
      category: 'Symptom Analysis',
      description: 'Correlation between symptoms and pain levels',
      chartData: symptomCorrelation.data
    });

    // Quality of Life Impact
    const qolImpact = calculateQOLImpact(filteredEntries);
    metrics.push({
      id: 'quality-of-life',
      name: 'Quality of Life',
      value: qolImpact.average,
      change: qolImpact.change,
      trend: qolImpact.change > 5 ? 'up' : qolImpact.change < -5 ? 'down' : 'stable',
      category: 'Wellbeing',
      description: 'Impact on daily quality of life',
      chartData: qolImpact.trendData
    });

    return metrics;
  }, [entries, timeframe]);

  // Predictive insights
  const predictiveInsights = useMemo(() => {
    const insights: PredictiveInsight[] = [];

    if (entries.length < 7) return insights;

    // Trend analysis
    const recentEntries = entries.slice(-14);
    const painLevels = recentEntries.map(e => e.baselineData.pain);
    const trend = calculateTrend(painLevels);

    if (Math.abs(trend) > 0.5) {
      insights.push({
        type: 'trend',
        title: trend > 0 ? 'Increasing Pain Trend' : 'Decreasing Pain Trend',
  description: `Your pain levels have been ${trend > 0 ? 'increasing' : 'decreasing'} over the past 2 weeks with a slope of ${formatNumber(trend, 2)} points per day.`,
        confidence: Math.min(Math.abs(trend) * 20, 95),
        impact: Math.abs(trend) > 1 ? 'high' : 'medium',
        timeframe: 'Next 7 days',
        recommendation: trend > 0 ? 'Consider reviewing your pain management strategies' : 'Great progress! Keep up your current approach'
      });
    }

    // Pattern detection
    const patterns = detectPatterns(entries);
    if (patterns.timeOfDay) {
      insights.push({
        type: 'pattern',
        title: 'Time-based Pain Pattern',
  description: `Higher pain levels detected ${patterns.timeOfDay.time} (${formatNumber(patterns.timeOfDay.avgPain,1)}/10 avg)`,
        confidence: patterns.timeOfDay.confidence,
        impact: 'medium',
        timeframe: 'Daily pattern',
        recommendation: `Consider adjusting activities around ${patterns.timeOfDay.time}`
      });
    }

    // Forecast
    const forecast = generateForecast(entries);
    if (forecast.confidence > 70) {
      insights.push({
        type: 'forecast',
        title: 'Pain Level Forecast',
  description: `Projected average pain level for next week: ${formatNumber(forecast.predictedAvg,1)}/10`,
        confidence: forecast.confidence,
        impact: forecast.predictedAvg > 7 ? 'high' : 'medium',
        timeframe: 'Next 7 days',
        recommendation: forecast.predictedAvg > 7 ? 'Consider proactive pain management' : 'Continue current strategies'
      });
    }

    return insights;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // Helper functions (delegated to analyticsHelpers) — keeps this file small for linting
  function generateTrendData(entries: PainEntry[], type: string) {
    return helpers.generateTrendData(entries, type);
  }

  function generateFrequencyData(entries: PainEntry[], days: number) {
    return helpers.generateFrequencyData(entries, days);
  }

  function calculateIntensityDistribution(entries: PainEntry[]) {
    return helpers.calculateIntensityDistribution(entries);
  }

  function calculateSymptomCorrelation(entries: PainEntry[]) {
    return helpers.calculateSymptomCorrelation(entries);
  }

  function calculateQOLImpact(entries: PainEntry[]) {
    return helpers.calculateQOLImpact(entries);
  }

  function calculateTrend(values: number[]): number {
    return helpers.calculateTrend(values);
  }

  function detectPatterns(entries: PainEntry[]) {
    return helpers.detectPatterns(entries);
  }

  function generateForecast(entries: PainEntry[]) {
    return helpers.generateForecast(entries);
  }

  // Analytics: rolling averages, stddevs and anomalies for pain
  // Build per-day aggregates with metadata so charts and tooltips can show entries + flags
  const { dailyAverages, dailyMeta } = React.useMemo(() => {
    return helpers.buildDailyAggregates(entries);
  }, [entries]);

  const painValues = dailyAverages.map(d => d.value);
  const rolling7 = rollingAverage(painValues, 7);
  const std7 = movingStdDev(painValues, 7);
  const anomalies = detectAnomalies(painValues, 7, 2.5);

  // Color ramp helper: interpolate between neutral (#4b5563) and danger (#ef4444)
  function painColorForValue(v: number, alpha = 1) {
    const clamp = Math.max(0, Math.min(10, Number(v || 0))) / 10;
    const hexA = '#4b5563';
    const hexB = '#ef4444';
    const a = hexA.replace('#', '');
    const b = hexB.replace('#', '');
    const ra = parseInt(a.slice(0, 2), 16), ga = parseInt(a.slice(2, 4), 16), ba = parseInt(a.slice(4, 6), 16);
    const rb = parseInt(b.slice(0, 2), 16), gb = parseInt(b.slice(2, 4), 16), bb = parseInt(b.slice(4, 6), 16);
    const r = Math.round(ra + (rb - ra) * clamp);
    const g = Math.round(ga + (gb - ga) * clamp);
    const bcol = Math.round(ba + (bb - ba) * clamp);
    return `rgba(${r}, ${g}, ${bcol}, ${alpha})`;
  }

  function handleExportCSV() {
    try {
      const header = ['date', 'avg_pain', 'rolling7_avg', 'stddev7', 'is_anomaly'];
      const lines = [header.join(',')];
      for (let i = 0; i < dailyAverages.length; i++) {
        const d = dailyAverages[i];
        const row = [
          d.date,
          (d.value ?? '').toString(),
          (rolling7[i] ?? '').toString(),
          (std7[i] ?? '').toString(),
          anomalies.includes(i) ? '1' : '0'
        ];
        lines.push(row.join(','));
      }
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pain-analytics-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CSV export failed', err);
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (entries.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your pain to unlock advanced analytics and insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>Advanced Analytics Dashboard</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Predictive insights and advanced visualizations for your pain journey
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Timeframe Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                  className="w-32 justify-between"
                >
                  {timeframe === 'week' ? 'Past Week' :
                   timeframe === 'month' ? 'Past Month' :
                   timeframe === 'quarter' ? 'Past Quarter' : 'Past Year'}
                  <Calendar className="h-4 w-4 ml-2" />
                </Button>
                {showTimeframeDropdown && (
                  <div className="absolute top-full mt-1 w-32 bg-card border rounded-md shadow-lg z-10">
                    {[
                      { value: 'week', label: 'Past Week' },
                      { value: 'month', label: 'Past Month' },
                      { value: 'quarter', label: 'Past Quarter' },
                      { value: 'year', label: 'Past Year' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTimeframe(value as typeof timeframe);
                          setShowTimeframeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart Type Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChartTypeDropdown(!showChartTypeDropdown)}
                  className="w-32 justify-between"
                >
                  {chartType === 'line' ? 'Line Chart' : 'Bar Chart'}
                  <BarChart3 className="h-4 w-4 ml-2" />
                </Button>
                {showChartTypeDropdown && (
                  <div className="absolute top-full mt-1 w-32 bg-card border rounded-md shadow-lg z-10">
                    {[
                      { value: 'line', label: 'Line Chart' },
                      { value: 'bar', label: 'Bar Chart' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setChartType(value as typeof chartType);
                          setShowChartTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
              >
                {showPredictions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPredictions ? 'Hide' : 'Show'} Predictions
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm" onClick={() => handleExportCSV()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {advancedMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="text-2xl font-bold mb-1">
                {formatNumber(metric.value, metric.id === 'frequency' ? 1 : 1)}
                {metric.id === 'frequency' ? '/day' : metric.id === 'pain-level' ? '/10' : ''}
              </div>

              {metric.change !== 0 && (
                <div className={cn(
                  'text-xs flex items-center',
                  metric.change > 0 ? 'text-red-600' : 'text-green-600'
                )}>
                  {metric.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {formatNumber(Math.abs(metric.change), 1)}% vs previous period
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-2">{metric.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictive Insights */}
      {showPredictions && predictiveInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Predictive Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictiveInsights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border',
                    getImpactColor(insight.impact)
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {insight.type}
                    </Badge>
                    <span className="text-xs font-medium">
                      {insight.confidence}% confidence
                    </span>
                  </div>

                  <h4 className="font-medium mb-2">{insight.title}</h4>
                  <p className="text-sm mb-3">{insight.description}</p>

                  <div className="text-xs text-muted-foreground">
                    <div>Timeframe: {insight.timeframe}</div>
                    {insight.recommendation && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                        💡 {insight.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Trend Chart */}
        <Card className={cn(isFullscreen && 'lg:col-span-2')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Pain Level Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyAverages.length > 0 && (
                <Chart
                  data={{
                    labels: (function buildLabels() {
                      const days = dailyAverages.length;
                      // If short window (<=7) show Day 1..N for compact X-axis, otherwise show dates
                      if (days <= 7) return dailyAverages.map((_, i) => `Day ${i + 1}`);
                      return dailyAverages.map(d => d.date);
                    })(),
                    datasets: [
                      {
                        label: 'Average Pain Level',
                        data: dailyAverages.map(d => d.value),
                        // attach per-point metadata so Chart tooltip callbacks can read entries/notes/meds
                        _meta: dailyMeta as ChartPointMetaArray,
                        borderColor: painValues.map(v => painColorForValue(v, 1)),
                        backgroundColor: painValues.map(v => painColorForValue(v, 0.08)),
                        fill: false,
                        tension: 0.35,
                        // point styling uses ramp and anomaly emphasis
                        pointBackgroundColor: dailyAverages.map((d, i) => anomalies.includes(i) ? 'rgba(239,68,68,1)' : painColorForValue(d.value, 1)),
                        pointRadius: dailyAverages.map((_, i) => anomalies.includes(i) ? 6 : 4),
                        pointHoverRadius: dailyAverages.map((_, i) => anomalies.includes(i) ? 8 : 6),
                        yAxisID: 'y'
                      },
                      {
                        label: 'Entries',
                        data: dailyMeta.map(m => m.count),
                        borderColor: 'rgba(75,85,99,0.95)',
                        backgroundColor: 'rgba(75,85,99,0.12)',
                        borderWidth: 1,
                        tension: 0.2,
                        type: 'bar',
                        yAxisID: 'y1'
                      },
                      {
                        label: '7-day rolling avg',
                        data: rolling7,
                        borderColor: colorVar('color-accent'),
                        backgroundColor: 'transparent',
                        borderDash: [6, 4],
                        tension: 0.25,
                        pointRadius: 0,
                        fill: false,
                        yAxisID: 'y'
                      }
                    ]
                  }}
                  type="line"
                  height={isFullscreen ? 420 : 320}
                  // Provide additional scales and tooltip callbacks via Chart props' scales prop
                />
            )}
          </CardContent>
        </Card>

        {/* Pain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Pain Intensity Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedMetrics.find(m => m.id === 'intensity')?.chartData && (
              <Chart
                data={{
                  labels: (advancedMetrics.find(m => m.id === 'intensity')!.chartData as Array<{ label: string; value: number; percentage: number }>).map(d => d.label),
                  datasets: [{
                    label: 'Entries',
                    data: (advancedMetrics.find(m => m.id === 'intensity')!.chartData as Array<{ label: string; value: number; percentage: number }>).map(d => d.value),
                    backgroundColor: [
                      colorVar('color-secondary'),
                      colorVar('color-accent'),
                      colorVar('color-warning'),
                      colorVar('color-destructive')
                    ]
                  }]
                }}
                type="doughnut"
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Symptom Correlation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Symptom-Pain Correlation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedMetrics.find(m => m.id === 'symptoms')?.chartData && (
              <Chart
                data={{
                  labels: (advancedMetrics.find(m => m.id === 'symptoms')!.chartData as Array<{ symptom: string; avgPain: number; count: number }>).map(d => d.symptom),
                  datasets: [{
                    label: 'Average Pain Level',
                    data: (advancedMetrics.find(m => m.id === 'symptoms')!.chartData as Array<{ symptom: string; avgPain: number; count: number }>).map(d => d.avgPain),
                    backgroundColor: colorVar('color-primary')
                  }]
                }}
                type="bar"
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Quality of Life Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Quality of Life Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedMetrics.find(m => m.id === 'quality-of-life')?.chartData && (
              <Chart
                data={{
                  labels: (advancedMetrics.find(m => m.id === 'quality-of-life')!.chartData as Array<{ date: string; sleep: number; mood: number; average: number }>).map(d => d.date),
                  datasets: [
                    {
                      label: 'Sleep Quality',
                      data: (advancedMetrics.find(m => m.id === 'quality-of-life')!.chartData as Array<{ date: string; sleep: number; mood: number; average: number }>).map(d => d.sleep),
                      borderColor: colorVar('color-secondary'),
                      backgroundColor: colorVarAlpha('color-secondary', 0.1),
                      tension: 0.4
                    },
                    {
                      label: 'Mood Impact',
                      data: (advancedMetrics.find(m => m.id === 'quality-of-life')!.chartData as Array<{ date: string; sleep: number; mood: number; average: number }>).map(d => d.mood),
                      borderColor: colorVar('color-accent'),
                      backgroundColor: colorVarAlpha('color-accent', 0.1),
                      tension: 0.4
                    }
                  ]
                }}
                type="line"
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entry Frequency Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Entry Frequency Pattern</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {advancedMetrics.find(m => m.id === 'frequency')?.chartData && (
            <Chart
              data={{
                labels: (advancedMetrics.find(m => m.id === 'frequency')!.chartData as Array<{ date: string; value: number }>).map(d => {
                  const date = new Date(d.date);
                  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                }),
                datasets: [{
                  label: 'Entries per Day',
                  data: (advancedMetrics.find(m => m.id === 'frequency')!.chartData as Array<{ date: string; value: number }>).map(d => d.value),
                    backgroundColor: colorVar('color-primary'),
                    borderColor: colorVar('color-primary'),
                  borderWidth: 2
                }]
              }}
              type="bar"
              height={250}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

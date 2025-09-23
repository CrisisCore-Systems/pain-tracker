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
import { Chart } from '../../design-system/components/Chart';
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
  const avgPain = filteredEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / filteredEntries.length;
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
    const entriesPerDay = filteredEntries.length / days;
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

  // Helper functions
  function generateTrendData(entries: PainEntry[], type: string) {
    const dataByDate: { [key: string]: number[] } = {};

    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!dataByDate[date]) dataByDate[date] = [];

      if (type === 'pain') {
        dataByDate[date].push(entry.baselineData.pain);
      }
    });

    return Object.entries(dataByDate).map(([date, values]) => ({
      date,
      value: values.reduce((a, b) => a + b, 0) / values.length
    }));
  }

  function generateFrequencyData(entries: PainEntry[], days: number) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = entries.filter(entry =>
        new Date(entry.timestamp).toISOString().split('T')[0] === dateStr
      ).length;

      data.push({ date: dateStr, value: count });
    }

    return data;
  }

  function calculateIntensityDistribution(entries: PainEntry[]) {
    const ranges = [
      { min: 0, max: 2, label: 'Mild (0-2)', count: 0 },
      { min: 3, max: 5, label: 'Moderate (3-5)', count: 0 },
      { min: 6, max: 8, label: 'Severe (6-8)', count: 0 },
      { min: 9, max: 10, label: 'Extreme (9-10)', count: 0 }
    ];

    entries.forEach(entry => {
      const pain = entry.baselineData.pain;
      const range = ranges.find(r => pain >= r.min && pain <= r.max);
      if (range) range.count++;
    });

    const total = entries.length;
    const variance = ranges.reduce((acc, range) => {
      const proportion = range.count / total;
      return acc + (proportion * proportion);
    }, 0);

    return {
      variance: Math.sqrt(variance),
      data: ranges.map(range => ({
        label: range.label,
        value: range.count,
        percentage: total > 0 ? (range.count / total) * 100 : 0
      }))
    };
  }

  function calculateSymptomCorrelation(entries: PainEntry[]) {
    const symptomPainMap: { [key: string]: number[] } = {};

    entries.forEach(entry => {
      const pain = entry.baselineData.pain;
      const symptoms = entry.baselineData.symptoms || [];

      symptoms.forEach(symptom => {
        if (!symptomPainMap[symptom]) symptomPainMap[symptom] = [];
        symptomPainMap[symptom].push(pain);
      });
    });

    const correlations = Object.entries(symptomPainMap).map(([symptom, pains]) => ({
      symptom,
      avgPain: pains.reduce((a, b) => a + b, 0) / pains.length,
      count: pains.length
    })).sort((a, b) => b.avgPain - a.avgPain);

    return {
      strength: correlations.length > 0 ? correlations[0].avgPain : 0,
      data: correlations.slice(0, 5)
    };
  }

  function calculateQOLImpact(entries: PainEntry[]) {
    const qolEntries = entries.filter(e => e.qualityOfLife);
    if (qolEntries.length === 0) return { average: 0, change: 0, trendData: [] };

    const avgSleep = qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.sleepQuality || 0), 0) / qolEntries.length;
    const avgMood = qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.moodImpact || 0), 0) / qolEntries.length;

    const average = (avgSleep + avgMood) / 2;

    // Simple change calculation (would need more sophisticated analysis)
    const change = 0;

    const trendData = qolEntries.map(entry => ({
      date: new Date(entry.timestamp).toISOString().split('T')[0],
      sleep: entry.qualityOfLife?.sleepQuality || 0,
      mood: entry.qualityOfLife?.moodImpact || 0,
      average: ((entry.qualityOfLife?.sleepQuality || 0) + (entry.qualityOfLife?.moodImpact || 0)) / 2
    }));

    return { average, change, trendData };
  }

  function calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  function detectPatterns(entries: PainEntry[]) {
    const timePatterns: { [key: string]: { pains: number[], count: number } } = {};

    entries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

      if (!timePatterns[timeSlot]) {
        timePatterns[timeSlot] = { pains: [], count: 0 };
      }

      timePatterns[timeSlot].pains.push(entry.baselineData.pain);
      timePatterns[timeSlot].count++;
    });

    const avgByTime = Object.entries(timePatterns).map(([time, data]) => ({
      time,
      avgPain: data.pains.reduce((a, b) => a + b, 0) / data.pains.length,
      count: data.count
    })).sort((a, b) => b.avgPain - a.avgPain);

    if (avgByTime.length > 0 && avgByTime[0].count >= 3) {
      return {
        timeOfDay: {
          time: avgByTime[0].time,
          avgPain: avgByTime[0].avgPain,
          confidence: Math.min((avgByTime[0].count / entries.length) * 100, 90)
        }
      };
    }

    return {};
  }

  function generateForecast(entries: PainEntry[]) {
    if (entries.length < 7) return { predictedAvg: 0, confidence: 0 };

    const recent = entries.slice(-7);
    const avgPain = recent.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / recent.length;

    // Simple forecasting based on recent trend
    const trend = calculateTrend(recent.map(e => e.baselineData.pain));
    const predictedAvg = Math.max(0, Math.min(10, avgPain + trend * 7));

    const confidence = Math.min(recent.length * 10, 85);

    return { predictedAvg, confidence };
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

              <Button variant="outline" size="sm">
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
            {advancedMetrics.find(m => m.id === 'pain-level')?.chartData && (
              <Chart
                data={{
                  labels: (advancedMetrics.find(m => m.id === 'pain-level')!.chartData as Array<{ date: string; value: number }>).map(d => d.date),
                  datasets: [{
                    label: 'Average Pain Level',
                    data: (advancedMetrics.find(m => m.id === 'pain-level')!.chartData as Array<{ date: string; value: number }>).map(d => d.value),
                    borderColor: 'hsl(var(--color-primary))',
                    backgroundColor: 'hsl(var(--color-primary) / 0.1)',
                    fill: false,
                    tension: 0.4
                  }]
                }}
                type={chartType}
                height={isFullscreen ? 400 : 300}
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
                      'hsl(var(--color-secondary))',
                      'hsl(var(--color-accent))',
                      'hsl(var(--color-warning))',
                      'hsl(var(--color-destructive))'
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
                    backgroundColor: 'hsl(var(--color-primary))'
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
                      borderColor: 'hsl(var(--color-secondary))',
                      backgroundColor: 'hsl(var(--color-secondary) / 0.1)',
                      tension: 0.4
                    },
                    {
                      label: 'Mood Impact',
                      data: (advancedMetrics.find(m => m.id === 'quality-of-life')!.chartData as Array<{ date: string; sleep: number; mood: number; average: number }>).map(d => d.mood),
                      borderColor: 'hsl(var(--color-accent))',
                      backgroundColor: 'hsl(var(--color-accent) / 0.1)',
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
                  backgroundColor: 'hsl(var(--color-primary))',
                  borderColor: 'hsl(var(--color-primary))',
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

import type {
  ComparisonConfig,
  ComparisonResult,
  ComparisonStatistics,
  ComparisonInsight,
  ComparisonChart,
  ComparisonDataset,
  StatisticalMeasure,
  StatisticalComparison
} from '../../types/comparison';
import type { PainEntry } from '../../types';
import { formatNumber } from '../formatting';

/**
 * Data Comparison Engine
 * Core logic for comparing pain data across different dimensions
 */
export class DataComparisonEngine {
  /**
   * Calculate comprehensive comparison between datasets
   */
  static async compareDatasets(
    config: ComparisonConfig,
    datasets: ComparisonDataset[]
  ): Promise<ComparisonResult> {
    const statistics = this.calculateStatistics(datasets);
    const insights = this.generateInsights(statistics, config);
    const charts = this.generateCharts(datasets, config);

    return {
      id: `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      statistics,
      insights,
      charts,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Calculate statistical measures for comparison
   */
  private static calculateStatistics(datasets: ComparisonDataset[]): ComparisonStatistics {
    if (datasets.length < 2) {
      throw new Error('At least 2 datasets are required for comparison');
    }

    const [baseline, comparison] = datasets;

    // Calculate overall statistics
  const baselinePainLevels = baseline.entries.map((e: PainEntry) => e.baselineData.pain);
  const comparisonPainLevels = comparison.entries.map((e: PainEntry) => e.baselineData.pain);

    const baselineMean = this.calculateMean(baselinePainLevels);
    const comparisonMean = this.calculateMean(comparisonPainLevels);
    const difference = comparisonMean - baselineMean;
    const percentageChange = baselineMean !== 0 ? (difference / baselineMean) * 100 : 0;

    // Statistical significance (simplified t-test approximation)
    const statisticalSignificance = this.calculateStatisticalSignificance(
      baselinePainLevels,
      comparisonPainLevels
    );

    // Effect size (Cohen's d)
    const effectSize = this.calculateEffectSize(baselinePainLevels, comparisonPainLevels);

    // Calculate metrics by type
    const painStats = this.compareMetric(baselinePainLevels, comparisonPainLevels);

    // Quality of life metrics
    const moodStats = this.compareQualityOfLifeMetric(
      baseline.entries,
      comparison.entries,
      'moodImpact'
    );

    const sleepStats = this.compareQualityOfLifeMetric(
      baseline.entries,
      comparison.entries,
      'sleepQuality'
    );

    // Trend analysis
    const baselineTrend = this.calculateTrend(baselinePainLevels);
    const comparisonTrend = this.calculateTrend(comparisonPainLevels);
    const trendDifference = comparisonTrend - baselineTrend;

    return {
      overall: {
        baselineMean,
        comparisonMean,
        difference,
        percentageChange,
        statisticalSignificance,
        effectSize
      },
      byMetric: {
        pain: painStats,
        mood: moodStats,
        sleep: sleepStats
      },
      trends: {
        baselineTrend,
        comparisonTrend,
        trendDifference
      }
    };
  }

  /**
   * Compare a specific metric between two datasets
   */
  private static compareMetric(
    baselineData: number[],
    comparisonData: number[]
  ): StatisticalComparison {
    const baselineStats = this.calculateStatisticalMeasures(baselineData);
    const comparisonStats = this.calculateStatisticalMeasures(comparisonData);

    const baselineMean = this.calculateMean(baselineData);
    const comparisonMean = this.calculateMean(comparisonData);
    const difference = comparisonMean - baselineMean;
    const percentageChange = baselineMean !== 0 ? (difference / baselineMean) * 100 : 0;

    // Confidence interval (simplified)
    const confidence = this.calculateConfidence(baselineData, comparisonData);

    return {
      baseline: baselineStats,
      comparison: comparisonStats,
      difference,
      percentageChange,
      confidence
    };
  }

  /**
   * Compare quality of life metrics
   */
  private static compareQualityOfLifeMetric(
    baselineEntries: PainEntry[],
    comparisonEntries: PainEntry[],
    metric: 'moodImpact' | 'sleepQuality'
  ): StatisticalComparison | undefined {
    const baselineData = baselineEntries
      .map((e: PainEntry) => e.qualityOfLife?.[metric])
      .filter((value): value is number => value !== undefined);

    const comparisonData = comparisonEntries
      .map((e: PainEntry) => e.qualityOfLife?.[metric])
      .filter((value): value is number => value !== undefined);

    if (baselineData.length === 0 || comparisonData.length === 0) {
      return undefined;
    }

    return this.compareMetric(baselineData, comparisonData);
  }

  /**
   * Calculate statistical measures for a dataset
   */
  private static calculateStatisticalMeasures(data: number[]): StatisticalMeasure[] {
    if (data.length === 0) return [];

    const sorted = [...data].sort((a, b) => a - b);
    const mean = this.calculateMean(data);
    const median = this.calculateMedian(sorted);
    const mode = this.calculateMode(data);
    const stdDev = this.calculateStandardDeviation(data, mean);
    const variance = stdDev * stdDev;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // Percentiles
    const p25 = this.calculatePercentile(sorted, 25);
    const p75 = this.calculatePercentile(sorted, 75);
    const p95 = this.calculatePercentile(sorted, 95);

    return [
      { type: 'mean', value: mean },
      { type: 'median', value: median },
      { type: 'mode', value: mode },
      { type: 'standard-deviation', value: stdDev },
      { type: 'variance', value: variance },
      { type: 'min', value: min },
      { type: 'max', value: max },
      { type: 'range', value: range },
      { type: 'percentile-25', value: p25 },
      { type: 'percentile-75', value: p75 },
      { type: 'percentile-95', value: p95 }
    ];
  }
  /**
   * Calculate mean
   */
  private static calculateMean(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  /**
   * Calculate median
   */
  private static calculateMedian(sortedData: number[]): number {
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 === 0
      ? (sortedData[mid - 1] + sortedData[mid]) / 2
      : sortedData[mid];
  }

  /**
   * Calculate mode
   */
  private static calculateMode(data: number[]): number {
    const frequency: Record<number, number> = {};
    data.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });

    let mode = data[0];
    let maxCount = 0;

    for (const [value, count] of Object.entries(frequency)) {
      if (count > maxCount) {
        maxCount = count;
        mode = parseFloat(value);
      }
    }

    return mode;
  }

  /**
   * Calculate standard deviation
   */
  private static calculateStandardDeviation(data: number[], mean: number): number {
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate percentile
   */
  private static calculatePercentile(sortedData: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedData[lower];
    }

    const weight = index - lower;
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Calculate statistical significance (simplified)
   */
  private static calculateStatisticalSignificance(data1: number[], data2: number[]): number {
    // Simplified p-value calculation using t-test approximation
    const mean1 = this.calculateMean(data1);
    const mean2 = this.calculateMean(data2);
    const std1 = this.calculateStandardDeviation(data1, mean1);
    const std2 = this.calculateStandardDeviation(data2, mean2);

    const n1 = data1.length;
    const n2 = data2.length;

    if (n1 < 2 || n2 < 2) return 1; // Not enough data

    const pooledStd = Math.sqrt(((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2));
    const se = pooledStd * Math.sqrt(1/n1 + 1/n2);
    const t = Math.abs(mean1 - mean2) / se;

    // Approximate p-value (simplified)
    return Math.max(0.001, Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI));
  }

  /**
   * Calculate effect size (Cohen's d)
   */
  private static calculateEffectSize(data1: number[], data2: number[]): number {
    const mean1 = this.calculateMean(data1);
    const mean2 = this.calculateMean(data2);
    const std1 = this.calculateStandardDeviation(data1, mean1);
    const std2 = this.calculateStandardDeviation(data2, mean2);

    const pooledStd = Math.sqrt((std1 * std1 + std2 * std2) / 2);
    return pooledStd !== 0 ? Math.abs(mean1 - mean2) / pooledStd : 0;
  }

  /**
   * Calculate confidence interval
   */
  private static calculateConfidence(data1: number[], data2: number[]): number {
    // Simplified confidence calculation
    const significance = this.calculateStatisticalSignificance(data1, data2);
    return Math.max(0, Math.min(100, (1 - significance) * 100));
  }

  /**
   * Calculate trend (linear regression slope)
   */
  private static calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Generate insights from comparison statistics
   */
  private static generateInsights(
    statistics: ComparisonStatistics,
    _config: ComparisonConfig // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];

    // Overall improvement/worsening insight
    const { percentageChange, statisticalSignificance } = statistics.overall;

    if (Math.abs(percentageChange) > 10 && statisticalSignificance < 0.05) {
      const isImprovement = percentageChange < 0;
      insights.push({
        id: `overall-${isImprovement ? 'improvement' : 'worsening'}`,
        type: isImprovement ? 'improvement' : 'worsening',
        title: `Overall ${isImprovement ? 'Improvement' : 'Worsening'} Detected`,
  description: `Pain levels ${isImprovement ? 'decreased' : 'increased'} by ${formatNumber(Math.abs(percentageChange), 1)}% compared to baseline`,
        severity: Math.abs(percentageChange) > 25 ? 'high' : 'medium',
        confidence: (1 - statisticalSignificance) * 100,
        actionable: true,
        recommendation: isImprovement
          ? 'Consider maintaining current treatment approach'
          : 'May need to adjust treatment or investigate contributing factors'
      });
    }

    // Trend analysis insight
    const { trendDifference } = statistics.trends;
    if (Math.abs(trendDifference) > 0.1) {
      const improvingTrend = trendDifference < 0;
      insights.push({
        id: 'trend-analysis',
        type: improvingTrend ? 'improvement' : 'worsening',
        title: `Trend ${improvingTrend ? 'Improving' : 'Worsening'}`,
        description: `Pain trend is ${improvingTrend ? 'improving' : 'worsening'} over time`,
        severity: 'medium',
        confidence: 75,
        actionable: true
      });
    }

    // Quality of life insights
    if (statistics.byMetric.mood) {
      const moodChange = statistics.byMetric.mood.percentageChange;
      if (Math.abs(moodChange) > 15) {
        insights.push({
          id: 'mood-impact',
          type: moodChange < 0 ? 'improvement' : 'worsening',
          title: 'Mood Impact Changes',
          description: `Mood impact ${moodChange < 0 ? 'improved' : 'worsened'} by ${formatNumber(Math.abs(moodChange), 1)}%`,
          severity: 'medium',
          confidence: 70,
          actionable: true
        });
      }
    }

    return insights;
  }

  /**
   * Generate comparison charts
   */
  private static generateCharts(
    datasets: ComparisonDataset[],
    _config: ComparisonConfig // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ComparisonChart[] {
    const charts: ComparisonChart[] = [];

    // Line chart for pain levels over time
    charts.push(this.generateLineChart(datasets, 'Pain Levels Over Time'));

    // Bar chart for average comparisons
    charts.push(this.generateBarChart(datasets, 'Average Pain Comparison'));

    // Box plot for distribution comparison
    charts.push(this.generateBoxPlot(datasets, 'Pain Distribution'));

    return charts;
  }

  /**
   * Generate line chart
   */
  private static generateLineChart(datasets: ComparisonDataset[], title: string): ComparisonChart {
    const labels: string[] = [];
    const chartDatasets = datasets.map(dataset => ({
      label: dataset.name,
      data: dataset.entries.map((entry: PainEntry) => entry.baselineData.pain),
      borderColor: dataset.color,
      backgroundColor: dataset.color + '20',
      fill: false
    }));

    // Generate time labels
    const maxLength = Math.max(...datasets.map(d => d.entries.length));
    for (let i = 0; i < maxLength; i++) {
      labels.push(`Entry ${i + 1}`);
    }

    return {
      id: `line-chart-${Date.now()}`,
      type: 'line',
      title,
      data: {
        labels,
        datasets: chartDatasets
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Pain Level'
            }
          }
        }
      }
    };
  }

  /**
   * Generate bar chart
   */
  private static generateBarChart(datasets: ComparisonDataset[], title: string): ComparisonChart {
    const labels = datasets.map(d => d.name);
    const data = datasets.map(dataset => {
      const painLevels = dataset.entries.map((e: PainEntry) => e.baselineData.pain);
      return this.calculateMean(painLevels);
    });

    return {
      id: `bar-chart-${Date.now()}`,
      type: 'bar',
      title,
      data: {
        labels,
        datasets: [{
          label: 'Average Pain Level',
          data,
          backgroundColor: datasets.map(d => d.color),
          borderColor: datasets.map(d => d.color),
          borderWidth: 1
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Pain Level'
            }
          }
        }
      }
    };
  }

  /**
   * Generate box plot
   */
  private static generateBoxPlot(datasets: ComparisonDataset[], title: string): ComparisonChart {
    const labels = datasets.map(d => d.name);
    const data = datasets.map(dataset => {
      const painLevels = dataset.entries.map((e: PainEntry) => e.baselineData.pain);
      const sorted = [...painLevels].sort((a, b) => a - b);
      const q1 = this.calculatePercentile(sorted, 25);
      const median = this.calculateMedian(sorted);
      const q3 = this.calculatePercentile(sorted, 75);
      const min = Math.min(...painLevels);
      const max = Math.max(...painLevels);

      return [min, q1, median, q3, max];
    });

    return {
      id: `box-plot-${Date.now()}`,
      type: 'box-plot',
      title,
      data: {
        labels,
        datasets: [{
          label: 'Pain Distribution',
          data: data.flat(),
          backgroundColor: datasets.map(d => d.color + '40'),
          borderColor: datasets.map(d => d.color),
          borderWidth: 1
        }]
      },
      config: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };
  }
}

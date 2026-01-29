/**
 * Trend Analysis Service
 * 
 * Analyzes pain entries to detect trends, patterns, and anomalies.
 * Provides actionable insights for users and enhances adaptive selection.
 * 
 * Privacy: All analysis happens locally. No external data.
 * Trauma-informed: Insights are presented supportively, not judgmentally.
 */

import type { PainEntry } from '../../src/types';

export interface TrendData {
  direction: 'increasing' | 'stable' | 'decreasing';
  confidence: number; // 0-1
  changeRate: number; // percentage change
  period: 'daily' | 'weekly' | 'monthly';
}

export interface PainTrend {
  metric: 'intensity' | 'frequency' | 'duration' | 'consistency';
  trend: TrendData;
  insight: string;
  recommendation: string;
}

export interface CorrelationInsight {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface AnomalyDetection {
  date: string;
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
  severity: 'high' | 'medium' | 'low';
  context: string;
}

export interface EngagementTrend {
  period: 'week' | 'month';
  entriesCount: number;
  previousCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  consistency: number; // 0-1
}

export class TrendAnalysisService {
  /**
   * Analyze pain intensity trends
   */
  analyzePainIntensityTrend(entries: PainEntry[], period: 'daily' | 'weekly' | 'monthly' = 'weekly'): PainTrend {
    if (entries.length < 3) {
      return {
        metric: 'intensity',
        trend: {
          direction: 'stable',
          confidence: 0,
          changeRate: 0,
          period,
        },
        insight: 'Not enough data to detect trends yet',
        recommendation: 'Continue tracking to build insights',
      };
    }

    // Get pain levels over time
    const painLevels = entries
      .filter(e => typeof e.currentPainLevel === 'number')
      .map(e => ({
        date: new Date(e.timestamp),
        level: e.currentPainLevel,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (painLevels.length < 3) {
      return this.createDefaultTrend('intensity', period);
    }

    // Split into two periods for comparison
    const midpoint = Math.floor(painLevels.length / 2);
    const earlier = painLevels.slice(0, midpoint);
    const later = painLevels.slice(midpoint);

    const earlierAvg = this.average(earlier.map(p => p.level));
    const laterAvg = this.average(later.map(p => p.level));

    const changeRate = ((laterAvg - earlierAvg) / earlierAvg) * 100;
    const confidence = Math.min(painLevels.length / 14, 1); // More data = higher confidence

    let direction: TrendData['direction'] = 'stable';
    if (Math.abs(changeRate) > 10) {
      direction = changeRate > 0 ? 'increasing' : 'decreasing';
    }

    // Generate insight and recommendation
    const { insight, recommendation } = this.generatePainInsight(direction, changeRate, laterAvg);

    return {
      metric: 'intensity',
      trend: {
        direction,
        confidence,
        changeRate,
        period,
      },
      insight,
      recommendation,
    };
  }

  /**
   * Analyze entry frequency trends
   */
  analyzeFrequencyTrend(entries: PainEntry[]): EngagementTrend {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = entries.filter(e => new Date(e.timestamp) >= weekAgo).length;
    const lastWeek = entries.filter(
      e => new Date(e.timestamp) >= twoWeeksAgo && new Date(e.timestamp) < weekAgo
    ).length;

    const trend = 
      thisWeek > lastWeek * 1.2 ? 'increasing' :
      thisWeek < lastWeek * 0.8 ? 'decreasing' : 'stable';

    // Calculate consistency (how evenly distributed)
    const uniqueDays = new Set(
      entries
        .filter(e => new Date(e.timestamp) >= weekAgo)
        .map(e => new Date(e.timestamp).toISOString().split('T')[0])
    ).size;
    const consistency = uniqueDays / 7; // 0-1 score

    return {
      period: 'week',
      entriesCount: thisWeek,
      previousCount: lastWeek,
      trend,
      consistency,
    };
  }

  /**
   * Detect anomalies in pain data
   */
  detectAnomalies(entries: PainEntry[]): AnomalyDetection[] {
    if (entries.length < 7) return [];

    const anomalies: AnomalyDetection[] = [];

    // Get pain levels with dates
    const painData = entries
      .filter(e => typeof e.currentPainLevel === 'number')
      .map(e => ({
        date: e.timestamp,
        level: e.currentPainLevel,
      }));

    if (painData.length < 7) return [];

    // Calculate baseline statistics
    const levels = painData.map(d => d.level);
    const mean = this.average(levels);
    const stdDev = this.standardDeviation(levels, mean);

    // Detect outliers (values beyond 2 standard deviations)
    painData.forEach(data => {
      const zScore = Math.abs((data.level - mean) / stdDev);
      
      if (zScore > 2) {
        const severity = zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low';
        
        anomalies.push({
          date: data.date,
          metric: 'pain_intensity',
          value: data.level,
          expectedRange: {
            min: mean - 2 * stdDev,
            max: mean + 2 * stdDev,
          },
          severity,
          context: data.level > mean 
            ? 'Pain level significantly higher than usual'
            : 'Pain level significantly lower than usual',
        });
      }
    });

    return anomalies;
  }

  /**
   * Find correlations between factors
   */
  findCorrelations(entries: PainEntry[]): CorrelationInsight[] {
    if (entries.length < 7) return [];

    const insights: CorrelationInsight[] = [];

    // Analyze medication effectiveness correlation
    const medCorrelation = this.analyzeMedicationCorrelation(entries);
    if (medCorrelation) insights.push(medCorrelation);

    // Analyze activity correlation
    const activityCorrelation = this.analyzeActivityCorrelation(entries);
    if (activityCorrelation) insights.push(activityCorrelation);

    // Analyze time-of-day correlation
    const timeCorrelation = this.analyzeTimeOfDayCorrelation(entries);
    if (timeCorrelation) insights.push(timeCorrelation);

    return insights;
  }

  /**
   * Get overall summary of trends
   */
  getTrendSummary(entries: PainEntry[]): {
    painTrend: PainTrend;
    engagementTrend: EngagementTrend;
    anomalies: AnomalyDetection[];
    correlations: CorrelationInsight[];
    overallHealth: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  } {
    if (entries.length < 3) {
      return {
        painTrend: this.createDefaultTrend('intensity', 'weekly'),
        engagementTrend: {
          period: 'week',
          entriesCount: entries.length,
          previousCount: 0,
          trend: 'stable',
          consistency: 0,
        },
        anomalies: [],
        correlations: [],
        overallHealth: 'insufficient_data',
      };
    }

    const painTrend = this.analyzePainIntensityTrend(entries);
    const engagementTrend = this.analyzeFrequencyTrend(entries);
    const anomalies = this.detectAnomalies(entries);
    const correlations = this.findCorrelations(entries);

    // Determine overall health trend
    let overallHealth: 'improving' | 'stable' | 'declining' | 'insufficient_data' = 'stable';
    
    if (entries.length >= 7) {
      if (painTrend.trend.direction === 'decreasing' && painTrend.trend.confidence > 0.5) {
        overallHealth = 'improving';
      } else if (painTrend.trend.direction === 'increasing' && painTrend.trend.confidence > 0.5) {
        overallHealth = 'declining';
      }
    }

    return {
      painTrend,
      engagementTrend,
      anomalies,
      correlations,
      overallHealth,
    };
  }

  // Helper methods

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private standardDeviation(numbers: number[], mean: number): number {
    if (numbers.length === 0) return 0;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(this.average(squaredDiffs));
  }

  private createDefaultTrend(metric: PainTrend['metric'], period: TrendData['period']): PainTrend {
    return {
      metric,
      trend: {
        direction: 'stable',
        confidence: 0,
        changeRate: 0,
        period,
      },
      insight: 'Not enough data to detect trends yet',
      recommendation: 'Continue tracking to build insights',
    };
  }

  private generatePainInsight(
    direction: TrendData['direction'],
    changeRate: number,
    currentAvg: number
  ): { insight: string; recommendation: string } {
    if (direction === 'decreasing') {
      return {
        insight: `Pain levels have decreased by ${Math.abs(changeRate).toFixed(0)}% recently`,
        recommendation: 'Great progress! Continue your current management strategies',
      };
    } else if (direction === 'increasing') {
      return {
        insight: `Pain levels have increased by ${Math.abs(changeRate).toFixed(0)}% recently`,
        recommendation: 'Consider reviewing recent changes and consulting your healthcare provider',
      };
    } else {
      return {
        insight: 'Pain levels remain relatively stable',
        recommendation: 'Your current management approach appears consistent',
      };
    }
  }

  private analyzeMedicationCorrelation(entries: PainEntry[]): CorrelationInsight | null {
    const entriesWithMeds = entries.filter(
      e => e.medications && e.medications.current && e.medications.current.length > 0
    );

    if (entriesWithMeds.length < 5) return null;

    const withMedsAvg = this.average(
      entriesWithMeds
        .filter(e => typeof e.currentPainLevel === 'number')
        .map(e => e.currentPainLevel)
    );

    const withoutMeds = entries.filter(
      e => !e.medications || !e.medications.current || e.medications.current.length === 0
    );

    if (withoutMeds.length < 3) return null;

    const withoutMedsAvg = this.average(
      withoutMeds
        .filter(e => typeof e.currentPainLevel === 'number')
        .map(e => e.currentPainLevel)
    );

    const difference = withoutMedsAvg - withMedsAvg;
    const correlation = Math.min(difference / 10, 1); // Normalize to -1 to 1

    if (Math.abs(correlation) < 0.2) return null;

    return {
      factor1: 'medication',
      factor2: 'pain_level',
      correlation,
      significance: Math.abs(correlation) > 0.5 ? 'high' : Math.abs(correlation) > 0.3 ? 'medium' : 'low',
      description: correlation > 0 
        ? 'Medication appears to help reduce pain levels'
        : 'Pain levels similar with or without medication',
    };
  }

  private analyzeActivityCorrelation(entries: PainEntry[]): CorrelationInsight | null {
    // Would analyze activity logs if available
    // Placeholder for now
    return null;
  }

  private analyzeTimeOfDayCorrelation(entries: PainEntry[]): CorrelationInsight | null {
    const morningEntries = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 6 && hour < 12;
    });

    const eveningEntries = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 18 && hour < 24;
    });

    if (morningEntries.length < 3 || eveningEntries.length < 3) return null;

    const morningAvg = this.average(
      morningEntries
        .filter(e => typeof e.currentPainLevel === 'number')
        .map(e => e.currentPainLevel)
    );

    const eveningAvg = this.average(
      eveningEntries
        .filter(e => typeof e.currentPainLevel === 'number')
        .map(e => e.currentPainLevel)
    );

    const difference = eveningAvg - morningAvg;
    
    if (Math.abs(difference) < 1) return null;

    return {
      factor1: 'time_of_day',
      factor2: 'pain_level',
      correlation: difference / 10,
      significance: Math.abs(difference) > 2 ? 'high' : 'medium',
      description: difference > 0
        ? 'Pain tends to be higher in the evening'
        : 'Pain tends to be higher in the morning',
    };
  }
}

// Export singleton
export const trendAnalysisService = new TrendAnalysisService();

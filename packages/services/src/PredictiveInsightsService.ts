/**
 * Predictive Insights Service
 * 
 * Provides forward-looking predictions based on historical pain tracking data.
 * Uses statistical models and pattern recognition to forecast trends.
 * 
 * Privacy: All predictions computed locally. No external APIs.
 * Trauma-informed: Predictions presented as possibilities with confidence scores.
 */

import type { PainEntry } from '../../src/types';

export interface PainPrediction {
  date: string;
  predictedLevel: number; // 0-10
  confidence: number; // 0-1
  range: { min: number; max: number };
  factors: string[];
  explanation: string;
}

export interface OptimalTimeRecommendation {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  hour: number;
  confidence: number;
  reason: string;
  historicalSuccess: number; // 0-1
}

export interface EffectivenessForest {
  intervention: string;
  type: 'medication' | 'activity' | 'rest' | 'therapy';
  predictedEffectiveness: number; // 0-1
  optimalTiming: string;
  confidence: number;
  historicalData: {
    triedCount: number;
    successRate: number;
  };
}

export interface PreventiveAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  timing: string;
  expectedBenefit: string;
  confidence: number;
  reasoning: string;
}

export interface PredictiveInsights {
  nextDayPrediction: PainPrediction | null;
  next7DaysTrend: 'improving' | 'stable' | 'worsening' | 'insufficient_data';
  optimalCheckInTimes: OptimalTimeRecommendation[];
  effectivenessForecasts: EffectivenessForest[];
  preventiveActions: PreventiveAction[];
  confidence: {
    overall: number;
    dataQuality: number;
    patternStrength: number;
  };
}

export class PredictiveInsightsService {
  /**
   * Predict pain level for the next day
   */
  predictNextDayPain(entries: PainEntry[]): PainPrediction | null {
    if (entries.length < 7) {
      return null; // Need at least a week of data
    }

    // Sort entries by date
    const sortedEntries = [...entries]
      .filter(e => typeof e.currentPainLevel === 'number')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (sortedEntries.length < 7) return null;

    // Get recent pattern (last 7 days)
    const recent = sortedEntries.slice(-7);
    const recentLevels = recent.map(e => e.currentPainLevel);

    // Calculate trend
    const trend = this.calculateTrend(recentLevels);
    
    // Calculate baseline
    const baseline = this.average(recentLevels);
    
    // Calculate volatility
    const volatility = this.standardDeviation(recentLevels, baseline);

    // Predict based on trend + baseline
    let predictedLevel = baseline + trend;
    
    // Adjust for day-of-week patterns if enough data
    const dayOfWeekAdjustment = this.getDayOfWeekAdjustment(sortedEntries);
    predictedLevel += dayOfWeekAdjustment;

    // Ensure within bounds
    predictedLevel = Math.max(0, Math.min(10, predictedLevel));

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(
      sortedEntries.length,
      volatility,
      recent.length
    );

    // Determine range based on volatility
    const range = {
      min: Math.max(0, predictedLevel - volatility),
      max: Math.min(10, predictedLevel + volatility),
    };

    // Identify contributing factors
    const factors = this.identifyPredictionFactors(recent, trend);

    // Generate explanation
    const explanation = this.generatePredictionExplanation(
      predictedLevel,
      baseline,
      trend,
      factors
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      date: tomorrow.toISOString().split('T')[0],
      predictedLevel: Math.round(predictedLevel * 10) / 10,
      confidence,
      range: {
        min: Math.round(range.min * 10) / 10,
        max: Math.round(range.max * 10) / 10,
      },
      factors,
      explanation,
    };
  }

  /**
   * Predict optimal times for check-ins based on historical patterns
   */
  predictOptimalCheckInTimes(entries: PainEntry[]): OptimalTimeRecommendation[] {
    if (entries.length < 5) return [];

    const timeAnalysis = this.analyzeTimeOfDayPatterns(entries);
    const recommendations: OptimalTimeRecommendation[] = [];

    // Find times with best historical engagement
    for (const [timeOfDay, data] of Object.entries(timeAnalysis)) {
      if (data.count >= 2) {
        recommendations.push({
          timeOfDay: timeOfDay as any,
          hour: data.avgHour,
          confidence: Math.min(data.count / 10, 1),
          reason: data.reason,
          historicalSuccess: data.count / entries.length,
        });
      }
    }

    return recommendations.sort((a, b) => b.historicalSuccess - a.historicalSuccess);
  }

  /**
   * Forecast medication/intervention effectiveness windows
   */
  forecastEffectiveness(entries: PainEntry[]): EffectivenessForest[] {
    if (entries.length < 7) return [];

    const forecasts: EffectivenessForest[] = [];

    // Analyze medication effectiveness
    const medAnalysis = this.analyzeMedicationEffectiveness(entries);
    for (const [medication, effectiveness] of Object.entries(medAnalysis)) {
      if (effectiveness.triedCount >= 3) {
        forecasts.push({
          intervention: medication,
          type: 'medication',
          predictedEffectiveness: effectiveness.effectiveness,
          optimalTiming: effectiveness.bestTime,
          confidence: Math.min(effectiveness.triedCount / 10, 0.9),
          historicalData: {
            triedCount: effectiveness.triedCount,
            successRate: effectiveness.effectiveness,
          },
        });
      }
    }

    return forecasts.sort((a, b) => b.predictedEffectiveness - a.predictedEffectiveness);
  }

  /**
   * Suggest preventive actions based on predictions
   */
  suggestPreventiveActions(entries: PainEntry[]): PreventiveAction[] {
    const actions: PreventiveAction[] = [];
    
    if (entries.length < 7) {
      return [{
        action: 'Continue tracking daily',
        priority: 'high',
        timing: 'Daily',
        expectedBenefit: 'Build data for personalized insights',
        confidence: 1,
        reasoning: 'More data enables better predictions and recommendations',
      }];
    }

    const prediction = this.predictNextDayPain(entries);
    
    if (prediction) {
      // High pain predicted
      if (prediction.predictedLevel > 7) {
        actions.push({
          action: 'Prepare pain management strategies',
          priority: 'high',
          timing: 'Today evening',
          expectedBenefit: 'Be ready for potential high pain tomorrow',
          confidence: prediction.confidence,
          reasoning: `Pain predicted to be ${prediction.predictedLevel}/10 tomorrow`,
        });
      }

      // Increasing trend
      if (prediction.factors.includes('increasing trend')) {
        actions.push({
          action: 'Consider consulting healthcare provider',
          priority: 'medium',
          timing: 'This week',
          expectedBenefit: 'Address worsening pain pattern',
          confidence: prediction.confidence,
          reasoning: 'Pain levels showing upward trend over recent days',
        });
      }
    }

    // Check for effective medications
    const effectiveness = this.forecastEffectiveness(entries);
    const topMed = effectiveness[0];
    if (topMed && topMed.predictedEffectiveness > 0.6) {
      actions.push({
        action: `Consider taking ${topMed.intervention}`,
        priority: 'medium',
        timing: topMed.optimalTiming,
        expectedBenefit: `${Math.round(topMed.predictedEffectiveness * 100)}% historical success rate`,
        confidence: topMed.confidence,
        reasoning: 'This intervention has been effective for you in the past',
      });
    }

    // Suggest tracking if gaps detected
    const recentEntries = entries.filter(
      e => new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (recentEntries.length < 4) {
      actions.push({
        action: 'Track more consistently',
        priority: 'medium',
        timing: 'Daily',
        expectedBenefit: 'Improve prediction accuracy',
        confidence: 0.8,
        reasoning: 'More frequent tracking leads to better insights',
      });
    }

    return actions;
  }

  /**
   * Get comprehensive predictive insights
   */
  getPredictiveInsights(entries: PainEntry[]): PredictiveInsights {
    const nextDayPrediction = this.predictNextDayPain(entries);
    const optimalCheckInTimes = this.predictOptimalCheckInTimes(entries);
    const effectivenessForecasts = this.forecastEffectiveness(entries);
    const preventiveActions = this.suggestPreventiveActions(entries);

    // Calculate 7-day trend
    let next7DaysTrend: PredictiveInsights['next7DaysTrend'] = 'insufficient_data';
    if (entries.length >= 14) {
      const recent14 = entries
        .filter(e => typeof e.currentPainLevel === 'number')
        .slice(-14);
      const first7Avg = this.average(recent14.slice(0, 7).map(e => e.currentPainLevel));
      const last7Avg = this.average(recent14.slice(7).map(e => e.currentPainLevel));
      
      const change = ((last7Avg - first7Avg) / first7Avg) * 100;
      
      if (change < -10) next7DaysTrend = 'improving';
      else if (change > 10) next7DaysTrend = 'worsening';
      else next7DaysTrend = 'stable';
    }

    // Calculate confidence metrics
    const dataQuality = Math.min(entries.length / 30, 1);
    const patternStrength = nextDayPrediction ? nextDayPrediction.confidence : 0;
    const overall = (dataQuality + patternStrength) / 2;

    return {
      nextDayPrediction,
      next7DaysTrend,
      optimalCheckInTimes,
      effectivenessForecasts,
      preventiveActions,
      confidence: {
        overall,
        dataQuality,
        patternStrength,
      },
    };
  }

  // Helper methods

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression
    const n = values.length;
    const indices = values.map((_, i) => i);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((acc, x, i) => acc + x * values[i], 0);
    const sumX2 = indices.reduce((acc, x) => acc + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return slope;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private standardDeviation(numbers: number[], mean: number): number {
    if (numbers.length === 0) return 0;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(this.average(squaredDiffs));
  }

  private getDayOfWeekAdjustment(entries: PainEntry[]): number {
    if (entries.length < 14) return 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    // Get historical data for this day of week
    const sameDayEntries = entries.filter(e => {
      const entryDay = new Date(e.timestamp).getDay();
      return entryDay === tomorrowDay && typeof e.currentPainLevel === 'number';
    });

    if (sameDayEntries.length < 2) return 0;

    const sameDayAvg = this.average(sameDayEntries.map(e => e.currentPainLevel));
    const overallAvg = this.average(entries.filter(e => typeof e.currentPainLevel === 'number').map(e => e.currentPainLevel));

    return (sameDayAvg - overallAvg) * 0.3; // Weight adjustment
  }

  private calculatePredictionConfidence(
    dataPoints: number,
    volatility: number,
    recentPoints: number
  ): number {
    // More data = higher confidence
    const dataScore = Math.min(dataPoints / 30, 1);
    
    // Lower volatility = higher confidence
    const stabilityScore = Math.max(0, 1 - volatility / 5);
    
    // Recent data weight
    const recencyScore = Math.min(recentPoints / 7, 1);

    return (dataScore * 0.4 + stabilityScore * 0.4 + recencyScore * 0.2);
  }

  private identifyPredictionFactors(recent: PainEntry[], trend: number): string[] {
    const factors: string[] = [];

    if (Math.abs(trend) > 0.3) {
      factors.push(trend > 0 ? 'increasing trend' : 'decreasing trend');
    }

    // Check for medication usage
    const withMeds = recent.filter(
      e => e.medications && e.medications.current && e.medications.current.length > 0
    );
    if (withMeds.length > recent.length * 0.6) {
      factors.push('regular medication use');
    }

    // Check for recent high pain days
    const highPainDays = recent.filter(e => e.currentPainLevel > 7);
    if (highPainDays.length > 2) {
      factors.push('recent high pain episodes');
    }

    if (factors.length === 0) {
      factors.push('recent pattern stability');
    }

    return factors;
  }

  private generatePredictionExplanation(
    predicted: number,
    baseline: number,
    trend: number,
    factors: string[]
  ): string {
    const direction = predicted > baseline ? 'higher' : 'lower';
    const factorStr = factors.join(', ');

    if (Math.abs(predicted - baseline) < 0.5) {
      return `Expected to be similar to recent average (${baseline.toFixed(1)}). Based on: ${factorStr}.`;
    }

    return `Predicted to be ${direction} than recent average (${baseline.toFixed(1)}) based on: ${factorStr}.`;
  }

  private analyzeTimeOfDayPatterns(entries: PainEntry[]): Record<string, any> {
    const patterns: Record<string, { count: number; avgHour: number; reason: string }> = {
      morning: { count: 0, avgHour: 0, reason: '' },
      afternoon: { count: 0, avgHour: 0, reason: '' },
      evening: { count: 0, avgHour: 0, reason: '' },
      night: { count: 0, avgHour: 0, reason: '' },
    };

    entries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      let period: string;
      
      if (hour >= 6 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 18) period = 'afternoon';
      else if (hour >= 18 && hour < 22) period = 'evening';
      else period = 'night';

      patterns[period].count++;
      patterns[period].avgHour = (patterns[period].avgHour * (patterns[period].count - 1) + hour) / patterns[period].count;
    });

    // Add reasons
    const sorted = Object.entries(patterns).sort((a, b) => b[1].count - a[1].count);
    if (sorted[0]) {
      patterns[sorted[0][0]].reason = 'Most consistent tracking time';
    }

    return patterns;
  }

  private analyzeMedicationEffectiveness(entries: PainEntry[]): Record<string, any> {
    const analysis: Record<string, {
      triedCount: number;
      effectiveness: number;
      bestTime: string;
    }> = {};

    entries.forEach((entry, index) => {
      if (!entry.medications || !entry.medications.current) return;

      entry.medications.current.forEach(med => {
        if (!analysis[med]) {
          analysis[med] = { triedCount: 0, effectiveness: 0, bestTime: 'as needed' };
        }

        analysis[med].triedCount++;

        // Look at next entry to see if pain improved
        if (index < entries.length - 1) {
          const nextEntry = entries[index + 1];
          if (
            typeof entry.currentPainLevel === 'number' &&
            typeof nextEntry.currentPainLevel === 'number'
          ) {
            const improvement = entry.currentPainLevel - nextEntry.currentPainLevel;
            if (improvement > 0) {
              analysis[med].effectiveness += improvement / analysis[med].triedCount;
            }
          }
        }

        // Determine best time
        const hour = new Date(entry.timestamp).getHours();
        if (hour >= 6 && hour < 12) analysis[med].bestTime = 'morning';
        else if (hour >= 12 && hour < 18) analysis[med].bestTime = 'afternoon';
        else if (hour >= 18 && hour < 22) analysis[med].bestTime = 'evening';
        else analysis[med].bestTime = 'night';
      });
    });

    // Normalize effectiveness to 0-1
    for (const med in analysis) {
      analysis[med].effectiveness = Math.min(analysis[med].effectiveness / 5, 1);
    }

    return analysis;
  }
}

// Export singleton
export const predictiveInsightsService = new PredictiveInsightsService();

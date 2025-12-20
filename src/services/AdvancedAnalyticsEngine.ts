import type { PainEntry, MoodEntry } from '../types/pain-tracker';

const getPainIntensity = (entry: PainEntry): number =>
  entry.intensity ?? entry.baselineData?.pain ?? 0;

const getPainQuality = (entry: PainEntry): string[] =>
  entry.quality ?? entry.baselineData?.symptoms ?? [];

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  coefficient: number; // Pearson correlation coefficient (-1 to 1)
  strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative' | 'none';
  pValue?: number;
  sampleSize: number;
}

export interface InterventionScore {
  intervention: string;
  type: 'medication' | 'treatment' | 'coping_strategy' | 'lifestyle';
  effectivenessScore: number; // 0-100
  usageCount: number;
  averagePainReduction: number;
  successRate: number; // Percentage of times it provided relief
  confidence: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface TriggerPattern {
  trigger: string;
  frequency: number;
  averagePainIncrease: number;
  timeOfDayPattern?: { hour: number; count: number }[];
  dayOfWeekPattern?: { day: string; count: number }[];
  seasonalPattern?: { season: string; count: number }[];
  associatedSymptoms: string[];
  riskScore: number; // 0-100
}

export interface PredictiveIndicator {
  indicator: string;
  type: 'warning' | 'onset' | 'escalation';
  confidence: number;
  leadTime: string; // e.g., "2-4 hours before severe pain"
  description: string;
}

export interface WeeklyClinicalBrief {
  weekStartDate: Date;
  weekEndDate: Date;
  overallTrend: 'improving' | 'stable' | 'worsening';
  avgPainLevel: number;
  painLevelChange: number;
  keyInsights: string[];
  topTriggers: string[];
  effectiveInterventions: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Advanced Analytics Engine
 *
 * Provides sophisticated analysis capabilities including:
 * - Correlation matrix analysis
 * - Intervention effectiveness scoring
 * - Trigger pattern recognition
 * - Predictive indicators
 * - Automated clinical brief generation
 */
export class AdvancedAnalyticsEngine {
  /**
   * Calculate correlation matrix for pain and related variables
   */
  calculateCorrelationMatrix(entries: PainEntry[], moodEntries?: MoodEntry[]): CorrelationResult[] {
    if (entries.length < 10) {
      console.warn(
        'Insufficient data for reliable correlation analysis (need at least 10 entries)'
      );
      return [];
    }

    const results: CorrelationResult[] = [];

    // Extract time-series data
    const painLevels = entries.map(getPainIntensity);

    // Time-based correlations
    const hoursOfDay = entries.map(e => new Date(e.timestamp).getHours());
    const daysOfWeek = entries.map(e => new Date(e.timestamp).getDay());

    // Pain vs. Time of Day
    results.push(this.computeCorrelation('Pain Level', 'Hour of Day', painLevels, hoursOfDay));

    // Pain vs. Day of Week
    results.push(this.computeCorrelation('Pain Level', 'Day of Week', painLevels, daysOfWeek));

    // Pain temporal autocorrelation (today vs yesterday)
    if (entries.length > 1) {
      const todayPain = painLevels.slice(1);
      const yesterdayPain = painLevels.slice(0, -1);
      results.push(
        this.computeCorrelation('Current Pain', 'Previous Pain', todayPain, yesterdayPain)
      );
    }

    // Mood correlation
    if (moodEntries && moodEntries.length > 5) {
      const alignedData = this.alignPainAndMood(entries, moodEntries);
      if (alignedData.length > 5) {
        results.push(
          this.computeCorrelation(
            'Pain Level',
            'Mood Score',
            alignedData.map(d => d.pain),
            alignedData.map(d => d.mood)
          )
        );
      }
    }

    // Activity level correlation (if available)
    const entriesWithActivity = entries.filter(e => e.activityLevel !== undefined);
    if (entriesWithActivity.length > 10) {
      results.push(
        this.computeCorrelation(
          'Pain Level',
          'Activity Level',
          entriesWithActivity.map(getPainIntensity),
          entriesWithActivity.map(e => e.activityLevel || 0)
        )
      );
    }

    return results.filter(r => r.sampleSize >= 10);
  }

  /**
   * Score intervention effectiveness
   */
  scoreInterventions(entries: PainEntry[]): InterventionScore[] {
    const interventionMap = new Map<
      string,
      {
        uses: number;
        painBefore: number[];
        painAfter: number[];
        successes: number;
      }
    >();

    // Collect intervention data
    entries.forEach((entry, index) => {
      const reliefMethods = entry.reliefMethods || [];
      const intensity = getPainIntensity(entry);

      reliefMethods.forEach(method => {
        if (!interventionMap.has(method)) {
          interventionMap.set(method, {
            uses: 0,
            painBefore: [],
            painAfter: [],
            successes: 0,
          });
        }

        const data = interventionMap.get(method)!;
        data.uses++;
        data.painBefore.push(intensity);

        // Look for next entry within 2-6 hours to measure effect
        const nextEntry = this.findNextEntry(entry, entries.slice(index + 1), 2, 6);
        if (nextEntry) {
          const nextIntensity = getPainIntensity(nextEntry);
          data.painAfter.push(nextIntensity);
          if (nextIntensity < intensity) {
            data.successes++;
          }
        }
      });
    });

    // Calculate scores
    const scores: InterventionScore[] = [];

    interventionMap.forEach((data, intervention) => {
      if (data.uses < 3) return; // Need at least 3 uses for confidence

      const avgPainBefore = data.painBefore.reduce((a, b) => a + b, 0) / data.painBefore.length;
      const avgPainAfter =
        data.painAfter.length > 0
          ? data.painAfter.reduce((a, b) => a + b, 0) / data.painAfter.length
          : avgPainBefore;

      const avgReduction = avgPainBefore - avgPainAfter;
      const successRate =
        data.painAfter.length > 0 ? (data.successes / data.painAfter.length) * 100 : 0;

      // Calculate effectiveness score (0-100)
      const effectivenessScore = Math.min(
        100,
        Math.max(
          0,
          (avgReduction / 10) * 40 + // Pain reduction component (max 40 points)
            successRate * 0.5 + // Success rate component (max 50 points)
            Math.min(10, data.uses) // Usage confidence component (max 10 points)
        )
      );

      const confidence = data.uses >= 10 ? 'high' : data.uses >= 5 ? 'medium' : 'low';

      let recommendation = '';
      if (effectivenessScore >= 70) {
        recommendation = 'Highly effective - continue regular use';
      } else if (effectivenessScore >= 50) {
        recommendation = 'Moderately effective - may combine with other interventions';
      } else if (effectivenessScore >= 30) {
        recommendation = 'Limited effectiveness - consider alternatives';
      } else {
        recommendation = 'Low effectiveness - discuss alternatives with healthcare provider';
      }

      scores.push({
        intervention,
        type: this.categorizeIntervention(intervention),
        effectivenessScore: Math.round(effectivenessScore),
        usageCount: data.uses,
        averagePainReduction: Math.round(avgReduction * 10) / 10,
        successRate: Math.round(successRate),
        confidence,
        recommendation,
      });
    });

    return scores.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  /**
   * Detect trigger patterns
   */
  detectTriggerPatterns(entries: PainEntry[]): TriggerPattern[] {
    const triggerMap = new Map<
      string,
      {
        count: number;
        painLevels: number[];
        timestamps: Date[];
        symptoms: Set<string>;
      }
    >();

    // Collect trigger data
    entries.forEach(entry => {
      const triggers = entry.triggers || [];

      triggers.forEach(trigger => {
        if (!triggerMap.has(trigger)) {
          triggerMap.set(trigger, {
            count: 0,
            painLevels: [],
            timestamps: [],
            symptoms: new Set(),
          });
        }

        const data = triggerMap.get(trigger)!;
        data.count++;
        data.painLevels.push(getPainIntensity(entry));
        data.timestamps.push(new Date(entry.timestamp));

        getPainQuality(entry).forEach(q => data.symptoms.add(q));
      });
    });

    // Calculate patterns
    const patterns: TriggerPattern[] = [];

    triggerMap.forEach((data, trigger) => {
      if (data.count < 3) return; // Need at least 3 occurrences

      const avgPain = data.painLevels.reduce((a, b) => a + b, 0) / data.painLevels.length;
      const overallAvg = entries.reduce((sum, e) => sum + getPainIntensity(e), 0) / entries.length;
      const avgIncrease = avgPain - overallAvg;

      // Time of day pattern
      const hourCounts = new Map<number, number>();
      data.timestamps.forEach(ts => {
        const hour = ts.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
      const timeOfDayPattern = Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Day of week pattern
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayCounts = new Map<string, number>();
      data.timestamps.forEach(ts => {
        const day = dayNames[ts.getDay()];
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      });
      const dayOfWeekPattern = Array.from(dayCounts.entries())
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count);

      // Risk score (0-100)
      const riskScore = Math.min(
        100,
        (data.count / entries.length) * 50 + // Frequency component
          Math.max(0, avgIncrease) * 5 // Pain increase component
      );

      patterns.push({
        trigger,
        frequency: data.count,
        averagePainIncrease: Math.round(avgIncrease * 10) / 10,
        timeOfDayPattern: timeOfDayPattern.length > 0 ? timeOfDayPattern : undefined,
        dayOfWeekPattern: dayOfWeekPattern.length > 0 ? dayOfWeekPattern : undefined,
        associatedSymptoms: Array.from(data.symptoms),
        riskScore: Math.round(riskScore),
      });
    });

    return patterns.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Identify predictive indicators
   */
  identifyPredictiveIndicators(entries: PainEntry[]): PredictiveIndicator[] {
    const indicators: PredictiveIndicator[] = [];

    if (entries.length < 20) {
      console.warn('Need at least 20 entries for predictive analysis');
      return indicators;
    }

    // Rapid escalation pattern
    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      const timeDiff =
        (new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()) /
        (1000 * 60 * 60);

      const currentIntensity = getPainIntensity(current);
      const previousIntensity = getPainIntensity(previous);

      if (timeDiff <= 4 && currentIntensity - previousIntensity >= 3) {
        indicators.push({
          indicator: 'Rapid Pain Escalation',
          type: 'escalation',
          confidence: 0.75,
          leadTime: `${Math.round(timeDiff)} hours`,
          description: `Pain increased by ${currentIntensity - previousIntensity} points in ${Math.round(timeDiff)} hours`,
        });
      }
    }

    // Morning pain pattern
    const morningEntries = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 5 && hour <= 9;
    });
    const morningAvg =
      morningEntries.length > 0
        ? morningEntries.reduce((sum, e) => sum + getPainIntensity(e), 0) / morningEntries.length
        : 0;
    const overallAvg = entries.reduce((sum, e) => sum + getPainIntensity(e), 0) / entries.length;

    if (morningEntries.length >= 5 && morningAvg > overallAvg + 1) {
      indicators.push({
        indicator: 'Morning Pain Exacerbation',
        type: 'warning',
        confidence: 0.8,
        leadTime: 'Upon waking',
        description: `Morning pain levels average ${morningAvg.toFixed(1)}/10, significantly higher than daily average`,
      });
    }

    // Activity-related onset
    const activeEntries = entries.filter(e => e.activityLevel && e.activityLevel > 6);
    if (activeEntries.length >= 10) {
      const activeAvg =
        activeEntries.reduce((sum, e) => sum + getPainIntensity(e), 0) / activeEntries.length;
      if (activeAvg > overallAvg + 1.5) {
        indicators.push({
          indicator: 'Activity-Induced Pain',
          type: 'onset',
          confidence: 0.85,
          leadTime: 'During or within 2 hours of activity',
          description: 'High activity levels consistently precede increased pain',
        });
      }
    }

    // Trigger clustering
    const recentTriggers = entries.slice(-10).flatMap(e => e.triggers || []);
    const triggerCounts = new Map<string, number>();
    recentTriggers.forEach(t => triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1));

    triggerCounts.forEach((count, trigger) => {
      if (count >= 3) {
        indicators.push({
          indicator: `Frequent Trigger: ${trigger}`,
          type: 'warning',
          confidence: 0.7,
          leadTime: 'Immediate to 1 hour',
          description: `This trigger has appeared ${count} times in recent entries`,
        });
      }
    });

    return indicators;
  }

  /**
   * Generate weekly clinical brief
   */
  generateWeeklyClinicalBrief(
    entries: PainEntry[],
    _moodEntries?: MoodEntry[]
  ): WeeklyClinicalBrief {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekEntries = entries.filter(e => new Date(e.timestamp) >= weekStart);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEntries = entries.filter(e => {
      const date = new Date(e.timestamp);
      return date >= prevWeekStart && date < weekStart;
    });

    // Calculate metrics
    const avgPain =
      weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + getPainIntensity(e), 0) / weekEntries.length
        : 0;
    const prevAvgPain =
      prevWeekEntries.length > 0
        ? prevWeekEntries.reduce((sum, e) => sum + getPainIntensity(e), 0) / prevWeekEntries.length
        : avgPain;
    const painChange = avgPain - prevAvgPain;

    let trend: 'improving' | 'stable' | 'worsening';
    if (painChange <= -0.5) trend = 'improving';
    else if (painChange >= 0.5) trend = 'worsening';
    else trend = 'stable';

    // Key insights
    const insights: string[] = [];

    if (weekEntries.length === 0) {
      insights.push('No pain entries recorded this week');
    } else {
      insights.push(
        `${weekEntries.length} pain entries recorded (avg ${(weekEntries.length / 7).toFixed(1)} per day)`
      );
      insights.push(
        `Average pain level: ${avgPain.toFixed(1)}/10 (${trend === 'improving' ? '↓' : trend === 'worsening' ? '↑' : '→'} ${Math.abs(painChange).toFixed(1)} from previous week)`
      );

      const maxPain = Math.max(...weekEntries.map(getPainIntensity));
      const maxEntry = weekEntries.find(e => getPainIntensity(e) === maxPain);
      if (maxEntry) {
        insights.push(
          `Peak pain: ${maxPain}/10 on ${new Date(maxEntry.timestamp).toLocaleDateString()}`
        );
      }

      const minPain = Math.min(...weekEntries.map(getPainIntensity));
      insights.push(`Pain ranged from ${minPain} to ${maxPain}/10`);
    }

    // Top triggers
    const allTriggers = weekEntries.flatMap(e => e.triggers || []);
    const triggerCounts = new Map<string, number>();
    allTriggers.forEach(t => triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1));
    const topTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger]) => trigger);

    // Effective interventions
    const interventionScores = this.scoreInterventions(weekEntries);
    const effectiveInterventions = interventionScores
      .filter(s => s.effectivenessScore >= 60)
      .slice(0, 3)
      .map(s => s.intervention);

    // Concerns
    const concerns: string[] = [];
    if (trend === 'worsening') {
      concerns.push(
        `Pain levels increasing - average up ${Math.abs(painChange).toFixed(1)} points from last week`
      );
    }
    if (avgPain >= 7) {
      concerns.push('High average pain level requires clinical attention');
    }
    const highPainDays = weekEntries.filter(e => getPainIntensity(e) >= 8).length;
    if (highPainDays >= 3) {
      concerns.push(`${highPainDays} days with severe pain (8+/10) this week`);
    }

    const predictiveIndicators = this.identifyPredictiveIndicators(entries);
    const escalationIndicators = predictiveIndicators.filter(i => i.type === 'escalation');
    if (escalationIndicators.length > 0) {
      concerns.push('Rapid pain escalation patterns detected');
    }

    // Recommendations
    const recommendations: string[] = [];
    if (trend === 'worsening' || avgPain >= 7) {
      recommendations.push('Consider scheduling follow-up appointment with healthcare provider');
    }
    if (topTriggers.length > 0) {
      recommendations.push(`Focus on managing top triggers: ${topTriggers.slice(0, 3).join(', ')}`);
    }
    if (effectiveInterventions.length > 0) {
      recommendations.push(
        `Continue effective interventions: ${effectiveInterventions.join(', ')}`
      );
    }
    if (trend === 'improving') {
      recommendations.push('Maintain current pain management strategies');
    }
    if (weekEntries.length < 7) {
      recommendations.push('Increase tracking frequency for better pattern recognition');
    }

    // Next steps
    const nextSteps: string[] = [];
    if (concerns.length > 0) {
      nextSteps.push('Review and address identified concerns with healthcare team');
    }
    nextSteps.push('Continue consistent pain tracking and intervention documentation');
    if (topTriggers.length > 0) {
      nextSteps.push('Develop trigger avoidance or mitigation strategies');
    }
    if (trend === 'worsening') {
      nextSteps.push('Consider adjusting current pain management plan');
    }

    return {
      weekStartDate: weekStart,
      weekEndDate: now,
      overallTrend: trend,
      avgPainLevel: Math.round(avgPain * 10) / 10,
      painLevelChange: Math.round(painChange * 10) / 10,
      keyInsights: insights,
      topTriggers,
      effectiveInterventions,
      concerns: concerns.length > 0 ? concerns : ['No immediate concerns identified'],
      recommendations,
      nextSteps,
    };
  }

  // Helper methods

  private computeCorrelation(
    var1Name: string,
    var2Name: string,
    data1: number[],
    data2: number[]
  ): CorrelationResult {
    const n = Math.min(data1.length, data2.length);

    if (n < 3) {
      return {
        variable1: var1Name,
        variable2: var2Name,
        coefficient: 0,
        strength: 'very weak',
        direction: 'none',
        sampleSize: n,
      };
    }

    // Pearson correlation coefficient
    const mean1 = data1.reduce((a, b) => a + b, 0) / n;
    const mean2 = data2.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    const coefficient = denominator === 0 ? 0 : numerator / denominator;

    const absCoeff = Math.abs(coefficient);
    let strength: CorrelationResult['strength'];
    if (absCoeff < 0.2) strength = 'very weak';
    else if (absCoeff < 0.4) strength = 'weak';
    else if (absCoeff < 0.6) strength = 'moderate';
    else if (absCoeff < 0.8) strength = 'strong';
    else strength = 'very strong';

    const direction = coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'none';

    return {
      variable1: var1Name,
      variable2: var2Name,
      coefficient: Math.round(coefficient * 1000) / 1000,
      strength,
      direction,
      sampleSize: n,
    };
  }

  private alignPainAndMood(
    painEntries: PainEntry[],
    moodEntries: MoodEntry[]
  ): Array<{ pain: number; mood: number }> {
    const aligned: Array<{ pain: number; mood: number }> = [];
    const oneHour = 60 * 60 * 1000;

    painEntries.forEach(painEntry => {
      const painTime = new Date(painEntry.timestamp).getTime();

      // Find closest mood entry within 1 hour
      const closestMood = moodEntries.find(moodEntry => {
        const moodTime = new Date(moodEntry.timestamp).getTime();
        return Math.abs(moodTime - painTime) <= oneHour;
      });

      if (closestMood) {
        aligned.push({
          pain: getPainIntensity(painEntry),
          mood: closestMood.mood,
        });
      }
    });

    return aligned;
  }

  private findNextEntry(
    currentEntry: PainEntry,
    remainingEntries: PainEntry[],
    minHours: number,
    maxHours: number
  ): PainEntry | null {
    const currentTime = new Date(currentEntry.timestamp).getTime();
    const minTime = currentTime + minHours * 60 * 60 * 1000;
    const maxTime = currentTime + maxHours * 60 * 60 * 1000;

    return (
      remainingEntries.find(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        return entryTime >= minTime && entryTime <= maxTime;
      }) || null
    );
  }

  private categorizeIntervention(intervention: string): InterventionScore['type'] {
    const lower = intervention.toLowerCase();

    if (
      lower.includes('medication') ||
      lower.includes('pill') ||
      lower.includes('drug') ||
      lower.includes('ibuprofen') ||
      lower.includes('tylenol') ||
      lower.includes('acetaminophen')
    ) {
      return 'medication';
    }

    if (
      lower.includes('therapy') ||
      lower.includes('massage') ||
      lower.includes('acupuncture') ||
      lower.includes('chiropractic') ||
      lower.includes('physical')
    ) {
      return 'treatment';
    }

    if (
      lower.includes('meditation') ||
      lower.includes('breathing') ||
      lower.includes('mindfulness') ||
      lower.includes('relaxation') ||
      lower.includes('distraction')
    ) {
      return 'coping_strategy';
    }

    return 'lifestyle';
  }
}

/**
 * Smart Recommendations Service
 * 
 * Provides context-aware, actionable recommendations based on:
 * - Predictive insights
 * - Multi-variate analysis
 * - Enhanced pattern recognition
 * - User history and preferences
 * 
 * Privacy: All processing happens locally
 * Explainability: Every recommendation includes reasoning
 * Actionability: Specific, timely, measurable suggestions
 */

import type { PainEntry } from './types';

// Recommendation types
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'prevention' | 'intervention' | 'tracking' | 'lifestyle' | 'medication';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timing: string; // e.g., "Today evening", "Tomorrow morning", "This week"
  expectedBenefit: string;
  confidence: number; // 0-1
  reasoning: string[];
  actionSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  successMetric?: string;
}

export interface TimingRecommendation {
  action: string;
  optimalTime: string;
  reason: string;
  confidence: number;
  alternativeTimes?: string[];
}

export interface InterventionRanking {
  intervention: string;
  effectivenessScore: number; // 0-1
  frequencyUsed: number;
  averageImpact: number;
  confidence: number;
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
}

export interface ActionPlan {
  goal: string;
  timeframe: string;
  steps: ActionStep[];
  estimatedImpact: string;
  confidence: number;
}

export interface ActionStep {
  step: number;
  action: string;
  timing: string;
  expected: string;
  completed?: boolean;
}

export interface SmartRecommendations {
  topRecommendations: Recommendation[];
  timingOptimizations: TimingRecommendation[];
  interventionRankings: InterventionRanking[];
  actionPlans: ActionPlan[];
  summary: {
    totalRecommendations: number;
    criticalActions: number;
    estimatedImpact: string;
    confidence: number;
  };
}

class SmartRecommendationsService {
  private getEntriesInLastNDays(entries: PainEntry[], days: number): PainEntry[] {
    const now = Date.now();
    const windowStart = now - days * 24 * 60 * 60 * 1000;
    return entries.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return Number.isFinite(t) && t >= windowStart && t <= now;
    });
  }

  private getPainLevel(entry: PainEntry): number {
    return entry?.baselineData?.pain ?? 0;
  }

  private hasMedication(entry: PainEntry): boolean {
    return (entry.medications?.current?.length ?? 0) > 0;
  }

  /**
   * Get context-aware recommendations based on current data and patterns
   */
  getSmartRecommendations(entries: PainEntry[]): SmartRecommendations {
    if (entries.length < 7) {
      return this.getInsufficientDataRecommendations(entries.length);
    }

    const recommendations = this.generateRecommendations(entries);
    const timingOptimizations = this.optimizeTiming(entries);
    const interventionRankings = this.rankInterventions(entries);
    const actionPlans = this.createActionPlans(entries);

    const critical = recommendations.filter(r => r.priority === 'critical').length;
    const highConf = recommendations.filter(r => r.confidence > 0.7).length;

    return {
      topRecommendations: recommendations,
      timingOptimizations,
      interventionRankings,
      actionPlans,
      summary: {
        totalRecommendations: recommendations.length,
        criticalActions: critical,
        estimatedImpact: highConf > 3 ? 'high' : highConf > 1 ? 'medium' : 'moderate',
        confidence: recommendations.length > 0
          ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
          : 0
      }
    };
  }

  /**
   * Generate context-aware recommendations
   */
  private generateRecommendations(entries: PainEntry[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const recentEntries = entries.slice(-7);
    const avgPain = recentEntries.reduce((sum, e) => sum + this.getPainLevel(e), 0) / recentEntries.length;

    // Analyze trends
    const earlierAvg = entries.slice(-14, -7).reduce((sum, e) => sum + this.getPainLevel(e), 0) / 7;
    const trendingUp = avgPain > earlierAvg && (avgPain - earlierAvg) / earlierAvg > 0.15;
    const trendingDown = avgPain < earlierAvg && (earlierAvg - avgPain) / earlierAvg > 0.15;

    // High pain recommendation
    if (avgPain > 6.5) {
      recommendations.push({
        id: 'high-pain-management',
        title: 'Implement Proactive Pain Management',
        description: 'Your recent pain levels have been elevated. Consider implementing additional management strategies.',
        category: 'intervention',
        priority: trendingUp ? 'critical' : 'high',
        timing: 'Immediately',
        expectedBenefit: 'Reduce pain by 20-30% within 3-5 days',
        confidence: 0.85,
        reasoning: [
          `Average pain level: ${avgPain.toFixed(1)} (elevated)`,
          trendingUp ? 'Trending upward - early intervention critical' : 'Sustained high pain',
          'Evidence-based interventions available'
        ],
        actionSteps: [
          'Review current medication timing and dosage with healthcare provider',
          'Implement stress reduction techniques (deep breathing, meditation)',
          'Ensure adequate rest and sleep',
          'Track pain triggers more carefully'
        ],
        estimatedEffort: 'medium',
        successMetric: 'Pain level < 6 for 3 consecutive days'
      });
    }

    // Trending up recommendation
    if (trendingUp && avgPain > 5) {
      recommendations.push({
        id: 'address-trend',
        title: 'Address Increasing Pain Trend',
        description: 'Pain levels have increased by 15%+ recently. Early intervention can prevent further escalation.',
        category: 'prevention',
        priority: 'high',
        timing: 'Within 24-48 hours',
        expectedBenefit: 'Prevent further escalation, stabilize pain levels',
        confidence: 0.80,
        reasoning: [
          `Pain increased from ${earlierAvg.toFixed(1)} to ${avgPain.toFixed(1)}`,
          'Early intervention more effective than reactive treatment',
          'Pattern suggests modifiable factors'
        ],
        actionSteps: [
          'Identify recent changes (activity, stress, sleep, medication)',
          'Return to previous effective strategies',
          'Increase monitoring frequency',
          'Consult healthcare provider if trend continues'
        ],
        estimatedEffort: 'low',
        successMetric: 'Pain trend stabilizes or reverses within 5 days'
      });
    }

    // Improvement celebration and maintenance
    if (trendingDown && avgPain < 6) {
      recommendations.push({
        id: 'maintain-progress',
        title: 'Maintain Your Progress',
        description: 'Great work! Your pain levels have improved. Focus on maintaining these gains.',
        category: 'lifestyle',
        priority: 'medium',
        timing: 'Ongoing',
        expectedBenefit: 'Sustain improvements long-term',
        confidence: 0.75,
        reasoning: [
          `Pain decreased from ${earlierAvg.toFixed(1)} to ${avgPain.toFixed(1)}`,
          'Current strategies are working',
          'Consistency is key to sustained improvement'
        ],
        actionSteps: [
          'Document what has been working well',
          'Continue current effective strategies',
          'Gradually increase activities as tolerated',
          'Monitor for early warning signs'
        ],
        estimatedEffort: 'low',
        successMetric: 'Maintain current pain levels for 2+ weeks'
      });
    }

    // Medication analysis
    const withMed = recentEntries.filter(e => this.hasMedication(e));
    const withoutMed = recentEntries.filter(e => !this.hasMedication(e));
    
    if (withMed.length >= 3 && withoutMed.length >= 3) {
      const medAvg = withMed.reduce((sum, e) => sum + this.getPainLevel(e), 0) / withMed.length;
      const noMedAvg = withoutMed.reduce((sum, e) => sum + this.getPainLevel(e), 0) / withoutMed.length;
      
      if (noMedAvg - medAvg > 1.5) {
        recommendations.push({
          id: 'medication-optimization',
          title: 'Optimize Medication Timing',
          description: 'Medications show significant benefit. Consider consistent use for better pain control.',
          category: 'medication',
          priority: 'high',
          timing: 'Daily',
          expectedBenefit: 'Reduce pain by 1-2 points on average',
          confidence: 0.70,
          reasoning: [
            `Pain with medication: ${medAvg.toFixed(1)}`,
            `Pain without medication: ${noMedAvg.toFixed(1)}`,
            'Consistent use may provide better control'
          ],
          actionSteps: [
            'Discuss consistent medication schedule with provider',
            'Set reminders for medication timing',
            'Track medication effectiveness',
            'Report any side effects'
          ],
          estimatedEffort: 'low',
          successMetric: 'Consistent medication use for 7 days'
        });
      }
    }

    // Tracking consistency
    const recentDays = 7;
    const entriesInLast7Days = this.getEntriesInLastNDays(entries, recentDays);
    if (entriesInLast7Days.length < recentDays * 0.5) {
      recommendations.push({
        id: 'tracking-consistency',
        title: 'Improve Tracking Consistency',
        description: 'More consistent tracking enables better pattern recognition and personalized insights.',
        category: 'tracking',
        priority: 'medium',
        timing: 'Daily',
        expectedBenefit: 'Unlock advanced insights and predictions',
        confidence: 0.65,
        reasoning: [
          `Only ${entriesInLast7Days.length} entries in last 7 days`,
          'More data = better insights',
          'Patterns require consistent tracking'
        ],
        actionSteps: [
          'Set daily reminder for pain tracking',
          'Use quick-entry features for convenience',
          'Track at consistent times each day',
          'Aim for at least 5 entries per week'
        ],
        estimatedEffort: 'low',
        successMetric: '5+ entries per week for 2 weeks'
      });
    }

    // Time-based patterns
    const morningEntries = recentEntries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const eveningEntries = recentEntries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 18 && hour < 24;
    });

    if (eveningEntries.length >= 3 && morningEntries.length >= 3) {
      const eveningAvg = eveningEntries.reduce((sum, e) => sum + this.getPainLevel(e), 0) / eveningEntries.length;
      const morningAvg = morningEntries.reduce((sum, e) => sum + this.getPainLevel(e), 0) / morningEntries.length;
      
      if (eveningAvg - morningAvg > 1.5) {
        recommendations.push({
          id: 'evening-pain-management',
          title: 'Address Evening Pain Increases',
          description: 'Pain levels increase significantly in evenings. Target this time with specific strategies.',
          category: 'prevention',
          priority: 'high',
          timing: 'Afternoons (4-6 PM)',
          expectedBenefit: 'Reduce evening pain spikes',
          confidence: 0.75,
          reasoning: [
            `Evening pain: ${eveningAvg.toFixed(1)}`,
            `Morning pain: ${morningAvg.toFixed(1)}`,
            'Proactive afternoon interventions may help'
          ],
          actionSteps: [
            'Take pain medication before evening spike (around 4-5 PM)',
            'Schedule rest periods in late afternoon',
            'Reduce activity in afternoon hours',
            'Implement evening relaxation routine'
          ],
          estimatedEffort: 'medium',
          successMetric: 'Evening pain < morning pain + 1 point'
        });
      }
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.confidence - a.confidence;
    }).slice(0, 8); // Top 8 recommendations
  }

  /**
   * Optimize timing for various actions
   */
  private optimizeTiming(entries: PainEntry[]): TimingRecommendation[] {
    const recommendations: TimingRecommendation[] = [];

    // Medication timing
    const withMed = entries.filter(e => this.hasMedication(e));
    if (withMed.length >= 5) {
      const medTimes = withMed.map(e => new Date(e.timestamp).getHours());
      const avgTime = medTimes.reduce((sum, h) => sum + h, 0) / medTimes.length;
      const morningMeds = medTimes.filter(h => h >= 6 && h < 12).length;
      
      if (morningMeds / medTimes.length > 0.6) {
        recommendations.push({
          action: 'Take morning medication',
          optimalTime: `${Math.floor(avgTime)}:00 AM`,
          reason: 'Historically most consistent timing with good results',
          confidence: 0.75,
          alternativeTimes: ['7:00 AM', '8:00 AM', '9:00 AM']
        });
      }
    }

    // Tracking timing
    const trackingTimes = entries.slice(-14).map(e => new Date(e.timestamp).getHours());
    if (trackingTimes.length >= 7) {
      const avgTrackTime = trackingTimes.reduce((sum, h) => sum + h, 0) / trackingTimes.length;
      const timeOfDay = avgTrackTime < 12 ? 'morning' : avgTrackTime < 18 ? 'afternoon' : 'evening';
      
      recommendations.push({
        action: 'Daily pain tracking',
        optimalTime: `${Math.floor(avgTrackTime)}:00 (${timeOfDay})`,
        reason: 'Your most consistent tracking time',
        confidence: 0.80,
        alternativeTimes: ['Morning', 'Evening']
      });
    }

    // Exercise/activity timing (if pain is lower)
    const morningPain = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const afternoonPain = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 12 && hour < 18;
    });

    if (morningPain.length >= 3 && afternoonPain.length >= 3) {
      const morningAvg = morningPain.reduce((sum, e) => sum + this.getPainLevel(e), 0) / morningPain.length;
      const afternoonAvg = afternoonPain.reduce((sum, e) => sum + this.getPainLevel(e), 0) / afternoonPain.length;
      
      if (morningAvg < afternoonAvg - 1) {
        recommendations.push({
          action: 'Physical activity or exercise',
          optimalTime: 'Morning (8-11 AM)',
          reason: 'Pain levels typically lower in morning hours',
          confidence: 0.70,
          alternativeTimes: ['Mid-morning', 'Late morning']
        });
      }
    }

    return recommendations;
  }

  /**
   * Rank interventions by effectiveness
   */
  private rankInterventions(entries: PainEntry[]): InterventionRanking[] {
    const rankings: InterventionRanking[] = [];

    // Medication effectiveness
    const withMed = entries.filter(e => this.hasMedication(e));
    const withoutMed = entries.filter(e => !this.hasMedication(e));
    
    if (withMed.length >= 5 && withoutMed.length >= 5) {
      const medAvg = withMed.reduce((sum, e) => sum + this.getPainLevel(e), 0) / withMed.length;
      const noMedAvg = withoutMed.reduce((sum, e) => sum + this.getPainLevel(e), 0) / withoutMed.length;
      const impact = (noMedAvg - medAvg) / 10; // Normalize to 0-1
      
      if (impact > 0) {
        rankings.push({
          intervention: 'Pain medication',
          effectivenessScore: Math.min(impact, 1),
          frequencyUsed: withMed.length,
          averageImpact: noMedAvg - medAvg,
          confidence: Math.min(withMed.length / 20, 1),
          recommendation: impact > 0.2 ? 'highly_recommended' : impact > 0.1 ? 'recommended' : 'consider'
        });
      }
    }

    // Rest/sleep (inferred from time gaps)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let restEffectiveness = 0;
    let restCount = 0;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevEntry = sortedEntries[i - 1];
      const currEntry = sortedEntries[i];
      const hoursDiff = (new Date(currEntry.timestamp).getTime() - new Date(prevEntry.timestamp).getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff >= 8 && hoursDiff <= 16) {
        // Likely slept between entries
        const painChange = this.getPainLevel(prevEntry) - this.getPainLevel(currEntry);
        if (painChange > 0) {
          restEffectiveness += painChange;
          restCount++;
        }
      }
    }
    
    if (restCount >= 3) {
      const avgRestEffect = restEffectiveness / restCount;
      rankings.push({
        intervention: 'Rest and sleep',
        effectivenessScore: Math.min(avgRestEffect / 3, 1),
        frequencyUsed: restCount,
        averageImpact: avgRestEffect,
        confidence: Math.min(restCount / 10, 1),
        recommendation: avgRestEffect > 1.5 ? 'highly_recommended' : avgRestEffect > 0.8 ? 'recommended' : 'consider'
      });
    }

    // Sort by effectiveness
    return rankings.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  /**
   * Create actionable plans for goals
   */
  private createActionPlans(entries: PainEntry[]): ActionPlan[] {
    const plans: ActionPlan[] = [];
    const recentAvg = entries.slice(-7).reduce((sum, e) => sum + this.getPainLevel(e), 0) / 7;

    // Pain reduction plan
    if (recentAvg > 5) {
      plans.push({
        goal: 'Reduce average pain by 20%',
        timeframe: '2 weeks',
        steps: [
          {
            step: 1,
            action: 'Establish consistent medication schedule',
            timing: 'Days 1-3',
            expected: 'Better pain control baseline'
          },
          {
            step: 2,
            action: 'Identify and avoid top 2 pain triggers',
            timing: 'Days 4-7',
            expected: 'Fewer pain spikes'
          },
          {
            step: 3,
            action: 'Implement daily relaxation practice (10 min)',
            timing: 'Days 8-14',
            expected: 'Lower baseline pain and stress'
          },
          {
            step: 4,
            action: 'Track and celebrate small wins',
            timing: 'Days 1-14',
            expected: 'Motivation and adherence'
          }
        ],
        estimatedImpact: `Reduce pain from ${recentAvg.toFixed(1)} to ${(recentAvg * 0.8).toFixed(1)}`,
        confidence: 0.70
      });
    }

    // Consistency improvement plan
    const recentDays = 7;
    const entriesInLast7Days = this.getEntriesInLastNDays(entries, recentDays);
    if (entriesInLast7Days.length < recentDays * 0.6) {
      plans.push({
        goal: 'Track pain 5+ days per week',
        timeframe: '2 weeks',
        steps: [
          {
            step: 1,
            action: 'Set daily reminder on phone',
            timing: 'Day 1',
            expected: 'Consistent prompts'
          },
          {
            step: 2,
            action: 'Choose consistent tracking time',
            timing: 'Days 1-3',
            expected: 'Habit formation'
          },
          {
            step: 3,
            action: 'Use quick-entry for busy days',
            timing: 'Days 4-14',
            expected: 'Maintain consistency'
          }
        ],
        estimatedImpact: 'Unlock pattern insights and predictions',
        confidence: 0.80
      });
    }

    return plans;
  }

  /**
   * Recommendations when insufficient data
   */
  private getInsufficientDataRecommendations(entryCount: number): SmartRecommendations {
    const daysNeeded = 7 - entryCount;
    
    return {
      topRecommendations: [{
        id: 'build-baseline',
        title: 'Build Your Baseline Data',
        description: `Track pain for ${daysNeeded} more days to unlock personalized recommendations.`,
        category: 'tracking',
        priority: 'high',
        timing: 'Daily',
        expectedBenefit: 'Unlock pattern recognition, predictions, and personalized recommendations',
        confidence: 1.0,
        reasoning: [
          `Current entries: ${entryCount}`,
          'Need 7+ days for meaningful patterns',
          'More data = better insights'
        ],
        actionSteps: [
          'Track pain daily at consistent times',
          'Include medications when applicable',
          'Add brief notes about activities',
          `Track for ${daysNeeded} more days to unlock insights`
        ],
        estimatedEffort: 'low',
        successMetric: '7 entries total'
      }],
      timingOptimizations: [],
      interventionRankings: [],
      actionPlans: [],
      summary: {
        totalRecommendations: 1,
        criticalActions: 0,
        estimatedImpact: 'Enable insights',
        confidence: 1.0
      }
    };
  }
}

// Export singleton instance
export const smartRecommendationsService = new SmartRecommendationsService();
export { SmartRecommendationsService };

/**
 * Multi-Variate Analysis Service
 * 
 * Analyzes multiple variables simultaneously to discover complex patterns,
 * interactions, and relationships that single-variable analysis would miss.
 * 
 * Privacy: All analysis computed locally. No external dependencies.
 * Explainable: Provides clear reasoning for discovered relationships.
 */

import type { PainEntry } from './types';

export interface CorrelationPair {
  variable1: string;
  variable2: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak';
  significance: number; // 0-1
  sampleSize: number;
  interpretation: string;
}

export interface InteractionEffect {
  factors: string[];
  effect: 'synergistic' | 'antagonistic' | 'independent';
  impact: number; // magnitude of interaction
  confidence: number;
  description: string;
  example: string;
}

export interface CompoundPattern {
  id: string;
  conditions: string[];
  outcome: string;
  frequency: number;
  strength: number; // 0-1
  description: string;
  actionable: boolean;
  recommendation?: string;
}

export interface CausalInsight {
  cause: string;
  effect: string;
  confidence: number; // 0-1, based on temporal ordering and correlation
  strength: number;
  mechanism: string;
  reversible: boolean;
  timelag?: string;
}

export interface ClusterGroup {
  id: string;
  label: string;
  entries: number[]; // entry IDs
  characteristics: string[];
  centroid: {
    painLevel: number;
    timeOfDay: string;
    [key: string]: any;
  };
  size: number;
}

export interface MultiVariateInsights {
  correlationMatrix: CorrelationPair[];
  interactionEffects: InteractionEffect[];
  compoundPatterns: CompoundPattern[];
  causalInsights: CausalInsight[];
  clusters: ClusterGroup[];
  summary: {
    strongestCorrelation: CorrelationPair | null;
    keyInteraction: InteractionEffect | null;
    mostActionablePattern: CompoundPattern | null;
    confidence: number;
  };
}

export class MultiVariateAnalysisService {
  private getPainLevel(entry: PainEntry): number {
    return entry?.baselineData?.pain ?? 0;
  }

  /**
   * Build correlation matrix between all variables
   */
  buildCorrelationMatrix(entries: PainEntry[]): CorrelationPair[] {
    if (entries.length < 10) return [];

    const pairs: CorrelationPair[] = [];

    // Pain level vs Time of day
    const timeCorr = this.correlatePainWithTimeOfDay(entries);
    if (timeCorr) pairs.push(timeCorr);

    // Pain level vs Medication usage
    const medCorr = this.correlatePainWithMedication(entries);
    if (medCorr) pairs.push(medCorr);

    // Pain level vs Day of week
    const dayCorr = this.correlatePainWithDayOfWeek(entries);
    if (dayCorr) pairs.push(dayCorr);

    // Medication vs Time of day
    const medTimeCorr = this.correlateMedicationWithTime(entries);
    if (medTimeCorr) pairs.push(medTimeCorr);

    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Detect interaction effects between multiple factors
   */
  detectInteractionEffects(entries: PainEntry[]): InteractionEffect[] {
    if (entries.length < 15) return [];

    const effects: InteractionEffect[] = [];

    // Medication + Time interaction
    const medTimeEffect = this.analyzeMedicationTimeInteraction(entries);
    if (medTimeEffect) effects.push(medTimeEffect);

    // Day of week + Time interaction
    const dayTimeEffect = this.analyzeDayTimeInteraction(entries);
    if (dayTimeEffect) effects.push(dayTimeEffect);

    return effects;
  }

  /**
   * Discover compound patterns (multiple conditions → outcome)
   */
  discoverCompoundPatterns(entries: PainEntry[]): CompoundPattern[] {
    if (entries.length < 20) return [];

    const patterns: CompoundPattern[] = [];

    // Pattern: Weekend + Evening → Higher pain
    const weekendEveningPattern = this.findWeekendEveningPattern(entries);
    if (weekendEveningPattern) patterns.push(weekendEveningPattern);

    // Pattern: Medication + Morning → Lower pain
    const medMorningPattern = this.findMedicationMorningPattern(entries);
    if (medMorningPattern) patterns.push(medMorningPattern);

    // Pattern: Multiple days high pain → Likely continuation
    const continuationPattern = this.findContinuationPattern(entries);
    if (continuationPattern) patterns.push(continuationPattern);

    return patterns.filter(p => p.frequency >= 3).sort((a, b) => b.strength - a.strength);
  }

  /**
   * Infer causal relationships (with appropriate caveats)
   */
  inferCausalRelationships(entries: PainEntry[]): CausalInsight[] {
    if (entries.length < 14) return [];

    const insights: CausalInsight[] = [];

    // Medication → Pain reduction (if temporal order + correlation)
    const medCausal = this.analyzeMedicationCausality(entries);
    if (medCausal) insights.push(medCausal);

    // High pain day → Rest → Lower pain next day
    const restCausal = this.analyzeRestCausality(entries);
    if (restCausal) insights.push(restCausal);

    return insights.filter(i => i.confidence > 0.4);
  }

  /**
   * Cluster entries into groups with similar characteristics
   */
  clusterEntries(entries: PainEntry[]): ClusterGroup[] {
    if (entries.length < 10) return [];

    // Simple k-means-like clustering based on pain level and time
    const clusters: ClusterGroup[] = [];

    // Define cluster centroids
    const lowPainMorning = this.findEntriesMatching(entries, e =>
      this.getPainLevel(e) < 4 && this.getTimeCategory(e) === 'morning'
    );
    const highPainEvening = this.findEntriesMatching(entries, e =>
      this.getPainLevel(e) > 7 && this.getTimeCategory(e) === 'evening'
    );
    const moderatePain = this.findEntriesMatching(entries, e =>
      this.getPainLevel(e) >= 4 && this.getPainLevel(e) <= 7
    );

    if (lowPainMorning.length >= 3) {
      clusters.push({
        id: 'low-morning',
        label: 'Low Pain Mornings',
        entries: lowPainMorning.map(e => e.id as number),
        characteristics: ['Low pain level (< 4)', 'Morning time', 'Better functioning'],
        centroid: {
          painLevel: this.average(lowPainMorning.map(e => this.getPainLevel(e))),
          timeOfDay: 'morning',
        },
        size: lowPainMorning.length,
      });
    }

    if (highPainEvening.length >= 3) {
      clusters.push({
        id: 'high-evening',
        label: 'High Pain Evenings',
        entries: highPainEvening.map(e => e.id as number),
        characteristics: ['High pain level (> 7)', 'Evening time', 'May need intervention'],
        centroid: {
          painLevel: this.average(highPainEvening.map(e => this.getPainLevel(e))),
          timeOfDay: 'evening',
        },
        size: highPainEvening.length,
      });
    }

    if (moderatePain.length >= 3) {
      clusters.push({
        id: 'moderate',
        label: 'Moderate Pain Episodes',
        entries: moderatePain.map(e => e.id as number),
        characteristics: ['Moderate pain (4-7)', 'Variable timing', 'Manageable with care'],
        centroid: {
          painLevel: this.average(moderatePain.map(e => this.getPainLevel(e))),
          timeOfDay: 'varies',
        },
        size: moderatePain.length,
      });
    }

    return clusters.sort((a, b) => b.size - a.size);
  }

  /**
   * Get comprehensive multi-variate insights
   */
  getMultiVariateInsights(entries: PainEntry[]): MultiVariateInsights {
    const correlationMatrix = this.buildCorrelationMatrix(entries);
    const interactionEffects = this.detectInteractionEffects(entries);
    const compoundPatterns = this.discoverCompoundPatterns(entries);
    const causalInsights = this.inferCausalRelationships(entries);
    const clusters = this.clusterEntries(entries);

    // Find most significant findings
    const strongestCorrelation = correlationMatrix[0] || null;
    const keyInteraction = interactionEffects[0] || null;
    const mostActionablePattern = compoundPatterns.find(p => p.actionable) || compoundPatterns[0] || null;

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(entries.length, correlationMatrix, compoundPatterns);

    return {
      correlationMatrix,
      interactionEffects,
      compoundPatterns,
      causalInsights,
      clusters,
      summary: {
        strongestCorrelation,
        keyInteraction,
        mostActionablePattern,
        confidence,
      },
    };
  }

  // Helper methods

  private correlatePainWithTimeOfDay(entries: PainEntry[]): CorrelationPair | null {
    const morningPain = entries.filter(e => this.getTimeCategory(e) === 'morning').map(e => this.getPainLevel(e));
    const eveningPain = entries.filter(e => this.getTimeCategory(e) === 'evening').map(e => this.getPainLevel(e));

    if (morningPain.length < 3 || eveningPain.length < 3) return null;

    const morningAvg = this.average(morningPain);
    const eveningAvg = this.average(eveningPain);
    const diff = eveningAvg - morningAvg;

    const correlation = Math.min(Math.abs(diff) / 5, 1) * Math.sign(diff);
    const strength = Math.abs(correlation) > 0.5 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';

    return {
      variable1: 'time_of_day',
      variable2: 'pain_level',
      correlation,
      strength,
      significance: Math.min(1, (morningPain.length + eveningPain.length) / 20),
      sampleSize: morningPain.length + eveningPain.length,
      interpretation: diff > 1
        ? 'Pain tends to be higher in the evening'
        : diff < -1
        ? 'Pain tends to be higher in the morning'
        : 'Pain levels similar throughout the day',
    };
  }

  private correlatePainWithMedication(entries: PainEntry[]): CorrelationPair | null {
    const withMeds = entries.filter(e => 
      e.medications && e.medications.current && e.medications.current.length > 0
    );
    const withoutMeds = entries.filter(e =>
      !e.medications || !e.medications.current || e.medications.current.length === 0
    );

    if (withMeds.length < 3 || withoutMeds.length < 3) return null;

    const withMedsAvg = this.average(withMeds.map(e => this.getPainLevel(e)));
    const withoutMedsAvg = this.average(withoutMeds.map(e => this.getPainLevel(e)));
    const diff = withoutMedsAvg - withMedsAvg;

    const correlation = Math.min(Math.abs(diff) / 5, 1) * Math.sign(diff);
    const strength = Math.abs(correlation) > 0.5 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';

    return {
      variable1: 'medication_use',
      variable2: 'pain_level',
      correlation,
      strength,
      significance: Math.min(1, (withMeds.length + withoutMeds.length) / 20),
      sampleSize: withMeds.length + withoutMeds.length,
      interpretation: diff > 1
        ? 'Medication appears to reduce pain levels'
        : diff < -1
        ? 'Higher pain when taking medication (may be treating severe pain)'
        : 'Medication effect unclear from data',
    };
  }

  private correlatePainWithDayOfWeek(entries: PainEntry[]): CorrelationPair | null {
    const weekdayPain = entries.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendPain = entries.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return day === 0 || day === 6;
    });

    if (weekdayPain.length < 3 || weekendPain.length < 3) return null;

    const weekdayAvg = this.average(weekdayPain.map(e => this.getPainLevel(e)));
    const weekendAvg = this.average(weekendPain.map(e => this.getPainLevel(e)));
    const diff = weekendAvg - weekdayAvg;

    const correlation = Math.min(Math.abs(diff) / 5, 1) * Math.sign(diff);
    const strength = Math.abs(correlation) > 0.5 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';

    return {
      variable1: 'day_of_week',
      variable2: 'pain_level',
      correlation,
      strength,
      significance: Math.min(1, (weekdayPain.length + weekendPain.length) / 20),
      sampleSize: weekdayPain.length + weekendPain.length,
      interpretation: diff > 1
        ? 'Pain tends to be higher on weekends'
        : diff < -1
        ? 'Pain tends to be higher on weekdays'
        : 'No clear day-of-week pattern',
    };
  }

  private correlateMedicationWithTime(entries: PainEntry[]): CorrelationPair | null {
    const medEntries = entries.filter(e =>
      e.medications && e.medications.current && e.medications.current.length > 0
    );

    if (medEntries.length < 5) return null;

    const morningMeds = medEntries.filter(e => this.getTimeCategory(e) === 'morning').length;
    const eveningMeds = medEntries.filter(e => this.getTimeCategory(e) === 'evening').length;

    const total = morningMeds + eveningMeds;
    if (total < 5) return null;

    const eveningPreference = (eveningMeds - morningMeds) / total;
    const correlation = eveningPreference;
    const strength = Math.abs(correlation) > 0.4 ? 'strong' : Math.abs(correlation) > 0.2 ? 'moderate' : 'weak';

    return {
      variable1: 'medication_timing',
      variable2: 'time_of_day',
      correlation,
      strength,
      significance: Math.min(1, medEntries.length / 15),
      sampleSize: medEntries.length,
      interpretation: eveningPreference > 0.2
        ? 'Medications taken more often in evening'
        : eveningPreference < -0.2
        ? 'Medications taken more often in morning'
        : 'Medication timing varies',
    };
  }

  private analyzeMedicationTimeInteraction(entries: PainEntry[]): InteractionEffect | null {
    const medMorning = entries.filter(e =>
      e.medications && e.medications.current && e.medications.current.length > 0 &&
      this.getTimeCategory(e) === 'morning'
    );
    const medEvening = entries.filter(e =>
      e.medications && e.medications.current && e.medications.current.length > 0 &&
      this.getTimeCategory(e) === 'evening'
    );

    if (medMorning.length < 3 || medEvening.length < 3) return null;

    const morningEffectiveness = this.calculateMedicationEffectiveness(medMorning, entries);
    const eveningEffectiveness = this.calculateMedicationEffectiveness(medEvening, entries);

    const diff = Math.abs(morningEffectiveness - eveningEffectiveness);

    if (diff < 0.2) return null;

    return {
      factors: ['medication', 'time_of_day'],
      effect: diff > 0.3 ? 'synergistic' : 'independent',
      impact: diff,
      confidence: Math.min(1, (medMorning.length + medEvening.length) / 15),
      description: morningEffectiveness > eveningEffectiveness
        ? 'Medications appear more effective when taken in the morning'
        : 'Medications appear more effective when taken in the evening',
      example: `${morningEffectiveness > eveningEffectiveness ? 'Morning' : 'Evening'} medication shows ${Math.round(Math.max(morningEffectiveness, eveningEffectiveness) * 100)}% effectiveness`,
    };
  }

  private analyzeDayTimeInteraction(entries: PainEntry[]): InteractionEffect | null {
    // Simplified: Check if weekend evenings are different
    const weekendEvening = entries.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return (day === 0 || day === 6) && this.getTimeCategory(e) === 'evening';
    });
    const weekdayEvening = entries.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return (day >= 1 && day <= 5) && this.getTimeCategory(e) === 'evening';
    });

    if (weekendEvening.length < 2 || weekdayEvening.length < 2) return null;

    const weekendAvg = this.average(weekendEvening.map(e => this.getPainLevel(e)));
    const weekdayAvg = this.average(weekdayEvening.map(e => this.getPainLevel(e)));
    const diff = Math.abs(weekendAvg - weekdayAvg);

    if (diff < 1.5) return null;

    return {
      factors: ['day_of_week', 'time_of_day'],
      effect: 'independent',
      impact: diff / 10,
      confidence: Math.min(1, (weekendEvening.length + weekdayEvening.length) / 10),
      description: weekendAvg > weekdayAvg
        ? 'Weekend evenings show higher pain than weekday evenings'
        : 'Weekday evenings show higher pain than weekend evenings',
      example: `Average pain: Weekend evenings ${weekendAvg.toFixed(1)}, Weekday evenings ${weekdayAvg.toFixed(1)}`,
    };
  }

  private findWeekendEveningPattern(entries: PainEntry[]): CompoundPattern | null {
    const matches = entries.filter(e => {
      const day = new Date(e.timestamp).getDay();
      return (day === 0 || day === 6) && this.getTimeCategory(e) === 'evening' && this.getPainLevel(e) > 6;
    });

    if (matches.length < 3) return null;

    return {
      id: 'weekend-evening-high',
      conditions: ['weekend', 'evening', 'pain > 6'],
      outcome: 'high_pain',
      frequency: matches.length,
      strength: matches.length / entries.filter(e => {
        const day = new Date(e.timestamp).getDay();
        return (day === 0 || day === 6) && this.getTimeCategory(e) === 'evening';
      }).length,
      description: 'Weekend evenings tend to have higher pain levels',
      actionable: true,
      recommendation: 'Consider planning pain management for weekend evenings',
    };
  }

  private findMedicationMorningPattern(entries: PainEntry[]): CompoundPattern | null {
    const matches = entries.filter(e =>
      e.medications && e.medications.current && e.medications.current.length > 0 &&
      this.getTimeCategory(e) === 'morning' &&
      this.getPainLevel(e) < 5
    );

    if (matches.length < 3) return null;

    return {
      id: 'med-morning-low',
      conditions: ['medication', 'morning', 'pain < 5'],
      outcome: 'low_pain',
      frequency: matches.length,
      strength: matches.length / entries.filter(e =>
        e.medications && e.medications.current && e.medications.current.length > 0 &&
        this.getTimeCategory(e) === 'morning'
      ).length,
      description: 'Morning medication associated with lower pain',
      actionable: true,
      recommendation: 'Continue morning medication routine',
    };
  }

  private findContinuationPattern(entries: PainEntry[]): CompoundPattern | null {
    const sorted = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let continuations = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (this.getPainLevel(sorted[i]) > 7 && this.getPainLevel(sorted[i + 1]) > 7) {
        continuations++;
      }
    }

    if (continuations < 3) return null;

    return {
      id: 'high-pain-continuation',
      conditions: ['high pain day', 'following day'],
      outcome: 'continued_high_pain',
      frequency: continuations,
      strength: continuations / entries.filter(e => this.getPainLevel(e) > 7).length,
      description: 'High pain days often followed by another high pain day',
      actionable: true,
      recommendation: 'Prepare extended pain management strategy after high pain day',
    };
  }

  private analyzeMedicationCausality(entries: PainEntry[]): CausalInsight | null {
    const sorted = [...entries].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let improvements = 0;
    let medicationEvents = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.medications && current.medications.current && current.medications.current.length > 0) {
        medicationEvents++;
        if (this.getPainLevel(next) < this.getPainLevel(current)) {
          improvements++;
        }
      }
    }

    if (medicationEvents < 5) return null;

    const successRate = improvements / medicationEvents;
    if (successRate < 0.4) return null;

    return {
      cause: 'medication_use',
      effect: 'pain_reduction',
      confidence: Math.min(0.8, successRate),
      strength: successRate,
      mechanism: 'Medication taken → Pain reduced in following period',
      reversible: true,
      timelag: 'next entry',
    };
  }

  private analyzeRestCausality(entries: PainEntry[]): CausalInsight | null {
    // Simplified: Would need activity data to properly analyze
    return null;
  }

  private calculateMedicationEffectiveness(medEntries: PainEntry[], allEntries: PainEntry[]): number {
    const sorted = [...allEntries].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let totalImprovement = 0;
    let count = 0;

    medEntries.forEach(medEntry => {
      const index = sorted.findIndex(e => e.id === medEntry.id);
      if (index >= 0 && index < sorted.length - 1) {
        const next = sorted[index + 1];
        const improvement = this.getPainLevel(medEntry) - this.getPainLevel(next);
        if (improvement > 0) {
          totalImprovement += improvement;
          count++;
        }
      }
    });

    return count > 0 ? Math.min(totalImprovement / (count * 5), 1) : 0;
  }

  private getTimeCategory(entry: PainEntry): string {
    const hour = new Date(entry.timestamp).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private findEntriesMatching(entries: PainEntry[], predicate: (e: PainEntry) => boolean): PainEntry[] {
    return entries.filter(predicate);
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateOverallConfidence(
    dataPoints: number,
    correlations: CorrelationPair[],
    patterns: CompoundPattern[]
  ): number {
    const dataScore = Math.min(dataPoints / 30, 1);
    const correlationScore = correlations.length > 0 ? 
      this.average(correlations.map(c => c.significance)) : 0;
    const patternScore = patterns.length > 0 ?
      this.average(patterns.map(p => p.strength)) : 0;

    return (dataScore * 0.4 + correlationScore * 0.3 + patternScore * 0.3);
  }
}

// Export singleton
export const multiVariateAnalysisService = new MultiVariateAnalysisService();

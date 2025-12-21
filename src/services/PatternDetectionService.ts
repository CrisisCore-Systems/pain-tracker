/**
 * AI-Powered Pattern Detection Service
 * Analyzes patient data to identify pain triggers, medication efficacy, and treatment correlations
 *
 * NOTE: This service uses a simplified PainEntry interface for pattern detection.
 * It maps from the canonical PainEntry type (from types/index.ts) to this
 * internal format. See convertToPatternEntry() for the mapping.
 */

import type { PainEntry as CanonicalPainEntry } from '../types';

// Alias for backward compatibility within this file
type PainEntry = CanonicalPainEntry;

/**
 * Internal PainEntry format optimized for pattern detection.
 * Use convertToPatternEntry() to convert from the canonical PainEntry type.
 */
interface PatternPainEntry {
  id: string;
  timestamp: string;
  painLevel: number;
  location: string;
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood?: number;
  sleep?: number;
  weather?: string;
  stress?: number;
  notes?: string;
}

/**
 * Convert canonical PainEntry to pattern detection format
 */
export function convertToPatternEntry(entry: CanonicalPainEntry): PatternPainEntry {
  return {
    id: String(entry.id ?? Date.now()),
    timestamp: entry.timestamp,
    painLevel: entry.baselineData.pain,
    location: entry.baselineData.locations?.[0] ?? '',
    triggers: entry.triggers,
    medications: entry.medications?.current?.map(m => m.name),
    activities: entry.functionalImpact?.limitedActivities,
    mood: entry.qualityOfLife?.moodImpact,
    sleep: entry.qualityOfLife?.sleepQuality,
    notes: entry.notes,
  };
}

/**
 * Get pain level from a PainEntry (canonical type uses baselineData.pain)
 */
function getPainLevel(entry: CanonicalPainEntry): number {
  return entry.intensity ?? entry.baselineData.pain;
}

/**
 * Get medication names from a PainEntry
 */
function getMedicationNames(entry: CanonicalPainEntry): string[] {
  return entry.medications?.current?.map(m => m.name) ?? [];
}

interface Intervention {
  id: string;
  date: string;
  type: 'medication' | 'therapy' | 'procedure' | 'lifestyle';
  name: string;
  dosage?: string;
}

export interface DetectedPattern {
  id: string;
  type: 'trigger' | 'medication_efficacy' | 'time_correlation' | 'activity_correlation' | 'weather_correlation';
  confidence: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number; // -10 to +10 scale
  occurrences: number;
  lastSeen: string;
  actionable: boolean;
  recommendation?: string;
  evidence: {
    avgPainWith: number;
    avgPainWithout: number;
    sampleSize: number;
    correlation?: number;
  };
}

export interface InsightSummary {
  totalPatterns: number;
  highConfidencePatterns: number;
  actionableInsights: number;
  topTriggers: string[];
  effectiveTreatments: string[];
  riskFactors: string[];
}

export class PatternDetectionService {
  private static readonly MIN_SAMPLE_SIZE = 5;
  private static readonly HIGH_CORRELATION_THRESHOLD = 0.7;
  private static readonly MEDIUM_CORRELATION_THRESHOLD = 0.5;
  private static readonly SIGNIFICANT_IMPACT_THRESHOLD = 1.0;

  /**
   * Analyze patient data and detect meaningful patterns
   */
  static async detectPatterns(
    entries: PainEntry[],
    interventions: Intervention[]
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    // 1. Medication Efficacy Analysis
    patterns.push(...this.analyzeMedicationEfficacy(entries, interventions));

    // 2. Trigger Identification
    patterns.push(...this.identifyTriggers(entries));

    // 3. Time-of-Day Correlations
    patterns.push(...this.analyzeTimeCorrelations(entries));

    // 4. Activity Correlations
    patterns.push(...this.analyzeActivityCorrelations(entries));

    // 5. Weather Impact
    patterns.push(...this.analyzeWeatherImpact(entries));

    // 6. Sleep-Pain Correlation
    patterns.push(...this.analyzeSleepCorrelation(entries));

    // 7. Mood-Pain Correlation
    patterns.push(...this.analyzeMoodCorrelation(entries));

    // 8. Stress-Pain Correlation
    patterns.push(...this.analyzeStressCorrelation(entries));

    // Sort by confidence and impact
    return patterns.sort((a, b) => {
      const scoreA = this.calculatePatternScore(a);
      const scoreB = this.calculatePatternScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Analyze medication effectiveness
   */
  private static analyzeMedicationEfficacy(
    entries: PainEntry[],
    interventions: Intervention[]
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const medicationInterventions = interventions.filter((i) => i.type === 'medication');

    for (const medication of medicationInterventions) {
      const medName = medication.name;
      const medDate = new Date(medication.date);

      // Find entries before and after medication started
      const beforeEntries = entries.filter((e) => new Date(e.timestamp) < medDate);
      const afterEntries = entries.filter(
        (e) => new Date(e.timestamp) >= medDate && getMedicationNames(e).includes(medName)
      );

      if (beforeEntries.length >= this.MIN_SAMPLE_SIZE && afterEntries.length >= this.MIN_SAMPLE_SIZE) {
        const avgPainBefore = this.calculateAverage(beforeEntries.map((e) => getPainLevel(e)));
        const avgPainAfter = this.calculateAverage(afterEntries.map((e) => getPainLevel(e)));
        const impact = avgPainBefore - avgPainAfter;

        if (Math.abs(impact) >= this.SIGNIFICANT_IMPACT_THRESHOLD) {
          patterns.push({
            id: `med-${medication.id}`,
            type: 'medication_efficacy',
            confidence: this.calculateConfidence(beforeEntries.length + afterEntries.length),
            title: impact > 0 ? `${medName} is Effective` : `${medName} May Not Be Working`,
            description:
              impact > 0
                ? `Pain reduced by ${impact.toFixed(1)} points on average after starting ${medName}`
                : `Pain increased by ${Math.abs(impact).toFixed(1)} points after starting ${medName}`,
            impact: impact,
            occurrences: afterEntries.length,
            lastSeen: afterEntries[afterEntries.length - 1]?.timestamp || medication.date,
            actionable: true,
            recommendation:
              impact > 0
                ? 'Continue current medication regimen'
                : 'Consider discussing alternative treatments with provider',
            evidence: {
              avgPainWith: avgPainAfter,
              avgPainWithout: avgPainBefore,
              sampleSize: beforeEntries.length + afterEntries.length,
            },
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Identify pain triggers
   */
  private static identifyTriggers(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const triggerMap = new Map<string, { painLevels: number[]; dates: string[] }>();

    // Collect all triggers and associated pain levels
    for (const entry of entries) {
      if (entry.triggers && entry.triggers.length > 0) {
        for (const trigger of entry.triggers) {
          if (!triggerMap.has(trigger)) {
            triggerMap.set(trigger, { painLevels: [], dates: [] });
          }
          const data = triggerMap.get(trigger)!;
          data.painLevels.push(getPainLevel(entry));
          data.dates.push(entry.timestamp);
        }
      }
    }

    // Analyze each trigger
    for (const [trigger, data] of triggerMap.entries()) {
      if (data.painLevels.length >= this.MIN_SAMPLE_SIZE) {
        const avgPainWithTrigger = this.calculateAverage(data.painLevels);
        const entriesWithoutTrigger = entries.filter(
          (e) => !e.triggers?.includes(trigger)
        );
        
        if (entriesWithoutTrigger.length >= this.MIN_SAMPLE_SIZE) {
          const avgPainWithoutTrigger = this.calculateAverage(
            entriesWithoutTrigger.map((e) => getPainLevel(e))
          );
          const impact = avgPainWithTrigger - avgPainWithoutTrigger;

          if (impact >= this.SIGNIFICANT_IMPACT_THRESHOLD) {
            patterns.push({
              id: `trigger-${trigger}`,
              type: 'trigger',
              confidence: this.calculateConfidence(data.painLevels.length),
              title: `${trigger} is a Significant Trigger`,
              description: `Pain is ${impact.toFixed(1)} points higher on average when ${trigger} occurs`,
              impact: -impact, // Negative because triggers worsen pain
              occurrences: data.painLevels.length,
              lastSeen: data.dates[data.dates.length - 1],
              actionable: true,
              recommendation: `Consider strategies to avoid or mitigate ${trigger}`,
              evidence: {
                avgPainWith: avgPainWithTrigger,
                avgPainWithout: avgPainWithoutTrigger,
                sampleSize: data.painLevels.length + entriesWithoutTrigger.length,
              },
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Analyze time-of-day correlations
   */
  private static analyzeTimeCorrelations(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const timeSlots = {
      morning: { start: 6, end: 12, entries: [] as PainEntry[] },
      afternoon: { start: 12, end: 18, entries: [] as PainEntry[] },
      evening: { start: 18, end: 22, entries: [] as PainEntry[] },
      night: { start: 22, end: 6, entries: [] as PainEntry[] },
    };

    // Group entries by time slot
    for (const entry of entries) {
      const hour = new Date(entry.timestamp).getHours();
      if (hour >= timeSlots.morning.start && hour < timeSlots.morning.end) {
        timeSlots.morning.entries.push(entry);
      } else if (hour >= timeSlots.afternoon.start && hour < timeSlots.afternoon.end) {
        timeSlots.afternoon.entries.push(entry);
      } else if (hour >= timeSlots.evening.start && hour < timeSlots.evening.end) {
        timeSlots.evening.entries.push(entry);
      } else {
        timeSlots.night.entries.push(entry);
      }
    }

    // Find worst time slot
    const avgPains = Object.entries(timeSlots).map(([name, slot]) => ({
      name,
      avg: slot.entries.length > 0 ? this.calculateAverage(slot.entries.map((e) => getPainLevel(e))) : 0,
      count: slot.entries.length,
    }));

    const maxAvg = Math.max(...avgPains.map((p) => p.avg));
    const minAvg = Math.min(...avgPains.filter((p) => p.count > 0).map((p) => p.avg));
    const worstTime = avgPains.find((p) => p.avg === maxAvg);

    if (worstTime && worstTime.count >= this.MIN_SAMPLE_SIZE && maxAvg - minAvg >= this.SIGNIFICANT_IMPACT_THRESHOLD) {
      patterns.push({
        id: `time-${worstTime.name}`,
        type: 'time_correlation',
        confidence: this.calculateConfidence(worstTime.count),
        title: `Pain Peaks in the ${worstTime.name.charAt(0).toUpperCase() + worstTime.name.slice(1)}`,
        description: `Pain averages ${maxAvg.toFixed(1)}/10 during ${worstTime.name} hours, ${(maxAvg - minAvg).toFixed(1)} points higher than best time`,
        impact: -(maxAvg - minAvg),
        occurrences: worstTime.count,
        lastSeen: timeSlots[worstTime.name as keyof typeof timeSlots].entries[worstTime.count - 1]?.timestamp || '',
        actionable: true,
        recommendation: `Schedule important activities outside ${worstTime.name} hours when possible`,
        evidence: {
          avgPainWith: maxAvg,
          avgPainWithout: minAvg,
          sampleSize: entries.length,
        },
      });
    }

    return patterns;
  }

  /**
   * Analyze activity correlations
   */
  private static analyzeActivityCorrelations(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const activityMap = new Map<string, { painLevels: number[]; dates: string[] }>();

    // Collect activities and pain levels
    for (const entry of entries) {
      if (entry.activities && entry.activities.length > 0) {
        for (const activity of entry.activities) {
          if (!activityMap.has(activity)) {
            activityMap.set(activity, { painLevels: [], dates: [] });
          }
          const data = activityMap.get(activity)!;
          data.painLevels.push(getPainLevel(entry));
          data.dates.push(entry.timestamp);
        }
      }
    }

    // Analyze each activity
    for (const [activity, data] of activityMap.entries()) {
      if (data.painLevels.length >= this.MIN_SAMPLE_SIZE) {
        const avgPainWithActivity = this.calculateAverage(data.painLevels);
        const avgPainOverall = this.calculateAverage(entries.map((e) => getPainLevel(e)));
        const impact = avgPainWithActivity - avgPainOverall;

        if (Math.abs(impact) >= this.SIGNIFICANT_IMPACT_THRESHOLD) {
          patterns.push({
            id: `activity-${activity}`,
            type: 'activity_correlation',
            confidence: this.calculateConfidence(data.painLevels.length),
            title: impact > 0 ? `${activity} Worsens Pain` : `${activity} Reduces Pain`,
            description:
              impact > 0
                ? `Pain is ${impact.toFixed(1)} points higher after ${activity}`
                : `Pain is ${Math.abs(impact).toFixed(1)} points lower after ${activity}`,
            impact: -impact,
            occurrences: data.painLevels.length,
            lastSeen: data.dates[data.dates.length - 1],
            actionable: true,
            recommendation:
              impact > 0
                ? `Consider reducing or modifying ${activity}`
                : `Encourage more ${activity} as pain management strategy`,
            evidence: {
              avgPainWith: avgPainWithActivity,
              avgPainWithout: avgPainOverall,
              sampleSize: data.painLevels.length,
            },
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Analyze weather impact
   */
  private static analyzeWeatherImpact(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const weatherMap = new Map<string, { painLevels: number[]; dates: string[] }>();

    // Collect weather conditions
    for (const entry of entries) {
      if (entry.weather) {
        if (!weatherMap.has(entry.weather)) {
          weatherMap.set(entry.weather, { painLevels: [], dates: [] });
        }
        const data = weatherMap.get(entry.weather)!;
        data.painLevels.push(getPainLevel(entry));
        data.dates.push(entry.timestamp);
      }
    }

    // Find worst weather condition
    for (const [weather, data] of weatherMap.entries()) {
      if (data.painLevels.length >= this.MIN_SAMPLE_SIZE) {
        const avgPainInWeather = this.calculateAverage(data.painLevels);
        const otherEntries = entries.filter((e) => e.weather && e.weather !== weather);
        
        if (otherEntries.length >= this.MIN_SAMPLE_SIZE) {
          const avgPainOther = this.calculateAverage(otherEntries.map((e) => getPainLevel(e)));
          const impact = avgPainInWeather - avgPainOther;

          if (impact >= this.SIGNIFICANT_IMPACT_THRESHOLD) {
            patterns.push({
              id: `weather-${weather}`,
              type: 'weather_correlation',
              confidence: this.calculateConfidence(data.painLevels.length),
              title: `${weather} Weather Worsens Pain`,
              description: `Pain is ${impact.toFixed(1)} points higher during ${weather} conditions`,
              impact: -impact,
              occurrences: data.painLevels.length,
              lastSeen: data.dates[data.dates.length - 1],
              actionable: true,
              recommendation: `Plan activities around weather forecasts to minimize exposure to ${weather}`,
              evidence: {
                avgPainWith: avgPainInWeather,
                avgPainWithout: avgPainOther,
                sampleSize: data.painLevels.length + otherEntries.length,
              },
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Analyze sleep-pain correlation
   */
  private static analyzeSleepCorrelation(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const entriesWithSleep = entries.filter((e) => e.sleep !== undefined && e.sleep !== null);

    if (entriesWithSleep.length >= this.MIN_SAMPLE_SIZE) {
      const correlation = this.calculateCorrelation(
        entriesWithSleep.map((e) => e.sleep!),
        entriesWithSleep.map((e) => getPainLevel(e))
      );

      if (Math.abs(correlation) >= this.MEDIUM_CORRELATION_THRESHOLD) {
        const avgPainGoodSleep = this.calculateAverage(
          entriesWithSleep.filter((e) => e.sleep! >= 7).map((e) => getPainLevel(e))
        );
        const avgPainPoorSleep = this.calculateAverage(
          entriesWithSleep.filter((e) => e.sleep! < 7).map((e) => getPainLevel(e))
        );

        patterns.push({
          id: 'sleep-correlation',
          type: 'trigger',
          confidence: Math.abs(correlation) >= this.HIGH_CORRELATION_THRESHOLD ? 'high' : 'medium',
          title: correlation < 0 ? 'Better Sleep Reduces Pain' : 'Poor Sleep Worsens Pain',
          description:
            correlation < 0
              ? `Strong negative correlation: Each hour of sleep reduces pain by ~${(Math.abs(correlation) * 2).toFixed(1)} points`
              : `Pain increases with poor sleep quality`,
          impact: avgPainGoodSleep - avgPainPoorSleep,
          occurrences: entriesWithSleep.length,
          lastSeen: entriesWithSleep[entriesWithSleep.length - 1].timestamp,
          actionable: true,
          recommendation: 'Prioritize sleep hygiene and aim for 7-9 hours per night',
          evidence: {
            avgPainWith: avgPainGoodSleep,
            avgPainWithout: avgPainPoorSleep,
            sampleSize: entriesWithSleep.length,
            correlation: correlation,
          },
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze mood-pain correlation
   */
  private static analyzeMoodCorrelation(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const entriesWithMood = entries.filter((e) => e.mood !== undefined && e.mood !== null);

    if (entriesWithMood.length >= this.MIN_SAMPLE_SIZE) {
      const correlation = this.calculateCorrelation(
        entriesWithMood.map((e) => e.mood!),
        entriesWithMood.map((e) => getPainLevel(e))
      );

      if (Math.abs(correlation) >= this.MEDIUM_CORRELATION_THRESHOLD) {
        patterns.push({
          id: 'mood-correlation',
          type: 'trigger',
          confidence: Math.abs(correlation) >= this.HIGH_CORRELATION_THRESHOLD ? 'high' : 'medium',
          title: correlation < 0 ? 'Better Mood Correlates with Lower Pain' : 'Mood and Pain Connected',
          description:
            correlation < 0
              ? 'Strong link between positive mood and reduced pain levels'
              : 'Mood fluctuations align with pain patterns',
          impact: Math.abs(correlation) * 5, // Scale to meaningful impact
          occurrences: entriesWithMood.length,
          lastSeen: entriesWithMood[entriesWithMood.length - 1].timestamp,
          actionable: true,
          recommendation: 'Consider mood-focused interventions (therapy, mindfulness, social activities)',
          evidence: {
            avgPainWith: 0,
            avgPainWithout: 0,
            sampleSize: entriesWithMood.length,
            correlation: correlation,
          },
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze stress-pain correlation
   */
  private static analyzeStressCorrelation(entries: PainEntry[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const entriesWithStress = entries.filter((e) => e.stress !== undefined && e.stress !== null);

    if (entriesWithStress.length >= this.MIN_SAMPLE_SIZE) {
      const correlation = this.calculateCorrelation(
        entriesWithStress.map((e) => e.stress!),
        entriesWithStress.map((e) => getPainLevel(e))
      );

      if (Math.abs(correlation) >= this.MEDIUM_CORRELATION_THRESHOLD) {
        const avgPainHighStress = this.calculateAverage(
          entriesWithStress.filter((e) => e.stress! >= 7).map((e) => getPainLevel(e))
        );
        const avgPainLowStress = this.calculateAverage(
          entriesWithStress.filter((e) => e.stress! < 7).map((e) => getPainLevel(e))
        );

        patterns.push({
          id: 'stress-correlation',
          type: 'trigger',
          confidence: Math.abs(correlation) >= this.HIGH_CORRELATION_THRESHOLD ? 'high' : 'medium',
          title: 'Stress Significantly Impacts Pain',
          description: `Pain is ${(avgPainHighStress - avgPainLowStress).toFixed(1)} points higher during high-stress periods`,
          impact: -(avgPainHighStress - avgPainLowStress),
          occurrences: entriesWithStress.length,
          lastSeen: entriesWithStress[entriesWithStress.length - 1].timestamp,
          actionable: true,
          recommendation: 'Implement stress management techniques (meditation, breathing exercises, therapy)',
          evidence: {
            avgPainWith: avgPainHighStress,
            avgPainWithout: avgPainLowStress,
            sampleSize: entriesWithStress.length,
            correlation: correlation,
          },
        });
      }
    }

    return patterns;
  }

  /**
   * Generate insight summary
   */
  static generateInsightSummary(patterns: DetectedPattern[]): InsightSummary {
    return {
      totalPatterns: patterns.length,
      highConfidencePatterns: patterns.filter((p) => p.confidence === 'high').length,
      actionableInsights: patterns.filter((p) => p.actionable).length,
      topTriggers: patterns
        .filter((p) => p.type === 'trigger' && p.impact < 0)
        .sort((a, b) => a.impact - b.impact)
        .slice(0, 3)
        .map((p) => p.title),
      effectiveTreatments: patterns
        .filter((p) => p.type === 'medication_efficacy' && p.impact > 0)
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 3)
        .map((p) => p.title),
      riskFactors: patterns
        .filter((p) => p.confidence === 'high' && p.impact < -2)
        .map((p) => p.title),
    };
  }

  // Helper methods
  
  /**
   * Safe division that returns fallback for division by zero or invalid inputs
   */
  private static safeDivide(numerator: number, denominator: number, fallback = 0): number {
    if (denominator === 0 || !Number.isFinite(denominator)) return fallback;
    const result = numerator / denominator;
    return Number.isFinite(result) ? result : fallback;
  }

  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return this.safeDivide(numbers.reduce((a, b) => a + b, 0), numbers.length, 0);
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return this.safeDivide(numerator, denominator, 0);
  }

  private static calculateConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
    if (sampleSize >= 30) return 'high';
    if (sampleSize >= 10) return 'medium';
    return 'low';
  }

  private static calculatePatternScore(pattern: DetectedPattern): number {
    const confidenceScore = pattern.confidence === 'high' ? 3 : pattern.confidence === 'medium' ? 2 : 1;
    const impactScore = Math.abs(pattern.impact);
    const actionableBonus = pattern.actionable ? 2 : 0;
    return confidenceScore * impactScore + actionableBonus;
  }
}

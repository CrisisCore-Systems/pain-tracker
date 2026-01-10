import type { PainEntry } from '../types';
import { format as formatDate, startOfWeek } from 'date-fns';
import { getAllLocations, getEffectivePainLevel } from '../types/pain-entry';

export interface PainPattern {
  id: string;
  name: string;
  confidence: number;
  description: string;
  triggers: string[];
  recommendations: string[];
}

export interface PainPrediction {
  predictedPain: number;
  confidence: number;
  timeframe: string;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

export interface CorrelationAnalysis {
  symptomCorrelations: Array<{
    symptom: string;
    painCorrelation: number;
    frequency: number;
  }>;
  activityCorrelations: Array<{
    activity: string;
    painImpact: number;
    frequency: number;
  }>;
  medicationEffectiveness: Array<{
    medication: string;
    effectivenessScore: number;
    painReduction: number;
  }>;
}

export interface TrendAnalysis {
  overallTrend: 'improving' | 'stable' | 'worsening';
  trendStrength: number;
  periodicPatterns: Array<{
    pattern: string;
    strength: number;
    description: string;
  }>;
  seasonalFactors: Array<{
    factor: string;
    impact: number;
    season: string;
  }>;
}

export type LocationKey = string;

export interface LocationStat {
  key: LocationKey;
  label: string;
  totalPain: number;
  count: number;
  byBucket: Record<string, { totalPain: number; count: number }>;
}

export interface BucketInfo {
  mode: 'day' | 'week';
  keys: string[];
}


export interface TimeHeatmapPoint {
  dayOfWeek: number; // 0 (Sunday) - 6 (Saturday)
  hourOfDay: number; // 0-23
  avgPain: number;
  entryCount: number;
}

export class PainAnalyticsService {
  /**
   * Analyze pain patterns using basic machine learning techniques
   */
  analyzePatterns(entries: PainEntry[]): PainPattern[] {
    if (entries.length < 3) {
      return [];
    }

    const patterns: PainPattern[] = [];

    // Pattern 1: High pain correlation with specific symptoms
    const symptomPainAnalysis = this.analyzeSymptomPainCorrelation(entries);
    if (symptomPainAnalysis.length > 0) {
      patterns.push({
        id: 'symptom-pain-correlation',
        name: 'Symptom-Pain Correlation',
        confidence: 0.8,
        description: `Strong correlation found between specific symptoms and high pain levels`,
        triggers: symptomPainAnalysis.map(s => s.symptom),
        recommendations: [
          'Monitor and manage high-correlation symptoms early',
          'Consider preventive measures for identified triggers',
          'Discuss symptom management with healthcare provider',
        ],
      });
    }

    // Pattern 2: Weekly/Monthly patterns
    const temporalPatterns = this.analyzeTemporalPatterns(entries);
    if (temporalPatterns.cyclical.strength > 0.6) {
      patterns.push({
        id: 'temporal-pattern',
        name: 'Cyclical Pain Pattern',
        confidence: temporalPatterns.cyclical.strength,
        description: `Pain levels follow a ${temporalPatterns.cyclical.period} pattern`,
        triggers: [`${temporalPatterns.cyclical.period} cycle`],
        recommendations: [
          'Plan activities around predictable pain cycles',
          'Prepare pain management strategies in advance',
          'Track additional factors during high-pain periods',
        ],
      });
    }

    // Pattern 3: Medication effectiveness patterns
    const medicationPatterns = this.analyzeMedicationEffectiveness(entries);
    if (medicationPatterns.length > 0) {
      patterns.push({
        id: 'medication-effectiveness',
        name: 'Medication Effectiveness Pattern',
        confidence: 0.7,
        description: 'Identified patterns in medication effectiveness',
        triggers: medicationPatterns.map(m => m.medication),
        recommendations: [
          'Review medication timing and effectiveness with provider',
          'Consider dose adjustments for low-effectiveness medications',
          'Track side effects and their impact on daily function',
        ],
      });
    }

    return patterns;
  }

  /**
   * Predict future pain levels based on current trends
   */
  predictPain(entries: PainEntry[], timeframe: '24h' | '7d' | '30d' = '24h'): PainPrediction {
    if (entries.length < 5) {
      return {
        predictedPain: 0,
        confidence: 0,
        timeframe,
        factors: [],
      };
    }

    const recentEntries = entries.slice(-10);
    const avgRecentPain =
      recentEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / recentEntries.length;

    // Simple trend analysis
    const trend = this.calculateTrend(recentEntries);
    const seasonalFactor = this.calculateSeasonalFactor(new Date());
    const stressFactor = this.calculateStressFactor(recentEntries);

    let prediction = avgRecentPain;
    prediction += trend * this.getTimeframeMultiplier(timeframe);
    prediction += seasonalFactor;
    prediction += stressFactor;

    prediction = Math.max(0, Math.min(10, prediction));

    return {
      predictedPain: Math.round(prediction * 10) / 10,
      confidence: Math.min(0.9, entries.length / 20), // Confidence increases with data
      timeframe,
      factors: [
        {
          factor: 'Recent Trend',
          impact: trend,
          description:
            trend > 0 ? 'Pain increasing' : trend < 0 ? 'Pain decreasing' : 'Pain stable',
        },
        {
          factor: 'Seasonal',
          impact: seasonalFactor,
          description: this.getSeasonalDescription(seasonalFactor),
        },
        {
          factor: 'Stress/Sleep',
          impact: stressFactor,
          description: this.getStressDescription(stressFactor),
        },
      ],
    };
  }

  /**
   * Perform correlation analysis between symptoms, activities, and pain
   */
  generateLocationHeatmap(entries: PainEntry[]) {
    if (!entries.length) {
      return {
        locations: [] as LocationStat[],
        bucket: { mode: 'day' as const, keys: [] as string[] },
      };
    }

    const bucket = this.buildBucketKeys(entries);
    const statsByKey: Record<LocationKey, LocationStat> = {};

    for (const entry of entries) {
      const pain = getEffectivePainLevel(entry);
      const bucketKey = this.getBucketKey(entry.timestamp, bucket.mode);
      const locations = getAllLocations(entry);

      for (const rawLocation of locations) {
        const trimmed = rawLocation.trim();
        if (!trimmed) continue;
        const key = this.normalizeLocationKey(trimmed);
        if (!statsByKey[key]) {
          statsByKey[key] = {
            key,
            label: trimmed,
            totalPain: 0,
            count: 0,
            byBucket: {},
          };
        }
        const stat = statsByKey[key];
        stat.totalPain += pain;
        stat.count += 1;

        if (!stat.byBucket[bucketKey]) stat.byBucket[bucketKey] = { totalPain: 0, count: 0 };
        stat.byBucket[bucketKey].totalPain += pain;
        stat.byBucket[bucketKey].count += 1;
      }
    }

    const locations = Object.values(statsByKey)
      .map(stat => ({
        ...stat,
        label:
          stat.label
            .split(' ')
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') || stat.key,
      }))
      .sort((a, b) => b.count - a.count || b.totalPain / b.count - a.totalPain / a.count);

    return { locations, bucket };
  }

  private normalizeLocationKey(location: string): string {
    return location.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private getLocalDayKey(timestamp: string): string {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getBucketKey(timestamp: string, mode: 'day' | 'week'): string {
    if (mode === 'day') return this.getLocalDayKey(timestamp);
    const d = new Date(timestamp);
    const start = startOfWeek(d, { weekStartsOn: 1 });
    return formatDate(start, 'yyyy-MM-dd');
  }

  private enumerateLocalDaysInclusive(start: Date, end: Date): string[] {
    const days: string[] = [];
    const cursor = new Date(start);
    cursor.setHours(12, 0, 0, 0);
    const endLocal = new Date(end);
    endLocal.setHours(12, 0, 0, 0);

    while (cursor <= endLocal) {
      const y = cursor.getFullYear();
      const m = (cursor.getMonth() + 1).toString().padStart(2, '0');
      const d = cursor.getDate().toString().padStart(2, '0');
      days.push(`${y}-${m}-${d}`);
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  private buildBucketKeys(entries: PainEntry[]): BucketInfo {
    const timestamps = entries
      .map(e => new Date(e.timestamp).getTime())
      .filter(n => Number.isFinite(n));
    if (timestamps.length === 0) {
      return {
        mode: 'day',
        keys: [],
      };
    }

    const start = new Date(Math.min(...timestamps));
    const end = new Date(Math.max(...timestamps));
    const allDays = this.enumerateLocalDaysInclusive(start, end);

    const mode: 'day' | 'week' = allDays.length <= 31 ? 'day' : 'week';

    if (mode === 'day') {
      return {
        mode,
        keys: allDays,
      };
    }

    const weekStarts = new Set<string>();
    entries.forEach(entry => {
      weekStarts.add(this.getBucketKey(entry.timestamp, 'week'));
    });
    const keys = Array.from(weekStarts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return {
      mode,
      keys,
    };
  }

  analyzeCorrelations(entries: PainEntry[]): CorrelationAnalysis {
    return {
      symptomCorrelations: this.analyzeSymptomPainCorrelation(entries),
      activityCorrelations: this.analyzeActivityCorrelations(entries),
      medicationEffectiveness: this.analyzeMedicationEffectiveness(entries),
    };
  }

  /**
   * Analyze overall trends and patterns
   */
  analyzeTrends(entries: PainEntry[]): TrendAnalysis {
    const trend = this.calculateOverallTrend(entries);
    const periodicPatterns = this.analyzeTemporalPatterns(entries);

    return {
      overallTrend: trend.direction,
      trendStrength: Math.abs(trend.strength),
      periodicPatterns: [
        {
          pattern: 'Weekly Cycle',
          strength: periodicPatterns.weekly.strength,
          description: `${periodicPatterns.weekly.strength > 0.5 ? 'Strong' : 'Weak'} weekly pattern detected`,
        },
        {
          pattern: 'Monthly Cycle',
          strength: periodicPatterns.monthly.strength,
          description: `${periodicPatterns.monthly.strength > 0.5 ? 'Strong' : 'Weak'} monthly pattern detected`,
        },
      ],
      seasonalFactors: this.analyzeSeasonalFactors(),
    };
  }

  // Private helper methods

  private analyzeSymptomPainCorrelation(entries: PainEntry[]) {
    const symptomPainMap = new Map<string, { painSum: number; count: number }>();

    entries.forEach(entry => {
      (entry.baselineData.symptoms || []).forEach(symptom => {
        if (!symptomPainMap.has(symptom)) {
          symptomPainMap.set(symptom, { painSum: 0, count: 0 });
        }
        const data = symptomPainMap.get(symptom)!;
        data.painSum += entry.baselineData.pain;
        data.count += 1;
      });
    });

    return Array.from(symptomPainMap.entries())
      .map(([symptom, data]) => ({
        symptom,
        painCorrelation: data.painSum / data.count,
        frequency: data.count,
      }))
      .filter(item => item.frequency >= 2)
      .sort((a, b) => b.painCorrelation - a.painCorrelation);
  }

  private analyzeActivityCorrelations(entries: PainEntry[]) {
    // Analyze correlation between limited activities and pain levels
    const activityPainMap = new Map<string, { painSum: number; count: number }>();

    entries.forEach(entry => {
      (entry.functionalImpact?.limitedActivities || []).forEach(activity => {
        if (!activityPainMap.has(activity)) {
          activityPainMap.set(activity, { painSum: 0, count: 0 });
        }
        const data = activityPainMap.get(activity)!;
        data.painSum += entry.baselineData.pain;
        data.count += 1;
      });
    });

    return Array.from(activityPainMap.entries())
      .map(([activity, data]) => ({
        activity,
        painImpact: data.painSum / data.count,
        frequency: data.count,
      }))
      .filter(item => item.frequency >= 2)
      .sort((a, b) => b.painImpact - a.painImpact);
  }

  private analyzeMedicationEffectiveness(entries: PainEntry[]) {
    const medicationMap = new Map<
      string,
      { effectivenessSum: number; effectivenessCount: number; painSum: number; count: number }
    >();

    const overallAvgPain =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length
        : 0;

    entries.forEach(entry => {
      (entry.medications?.current || []).forEach(med => {
        if (!medicationMap.has(med.name)) {
          medicationMap.set(med.name, {
            effectivenessSum: 0,
            effectivenessCount: 0,
            painSum: 0,
            count: 0,
          });
        }
        const data = medicationMap.get(med.name)!;

        data.painSum += entry.baselineData.pain;
        data.count += 1;

        // Only score when the user recorded effectiveness (per-med or overall).
        const recordedEffectiveness =
          (med.effectiveness || '').trim() || (entry.medications?.effectiveness || '').trim();
        if (recordedEffectiveness) {
          const effectScore = this.parseEffectiveness(recordedEffectiveness);
          data.effectivenessSum += effectScore;
          data.effectivenessCount += 1;
        }
      });
    });

    return Array.from(medicationMap.entries())
      .map(([medication, data]) => {
        const avgPainWithMed = data.count > 0 ? data.painSum / data.count : overallAvgPain;
        const painReduction = Math.max(0, overallAvgPain - avgPainWithMed);
        const effectivenessScore =
          data.effectivenessCount > 0 ? data.effectivenessSum / data.effectivenessCount : 0;
        return {
          medication,
          effectivenessScore,
          painReduction,
        };
      })
      .filter(item => item.effectivenessScore > 0)
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  private analyzeTemporalPatterns(entries: PainEntry[]) {
    // Analyze weekly and monthly patterns
    const weeklyData = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
    const monthlyData = new Array(31).fill(0).map(() => ({ sum: 0, count: 0 }));

    entries.forEach(entry => {
      const d = new Date(entry.timestamp);
      const localStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayOfWeek = localStart.getDay();
      const dayOfMonth = localStart.getDate() - 1;

      weeklyData[dayOfWeek].sum += entry.baselineData.pain;
      weeklyData[dayOfWeek].count += 1;

      if (dayOfMonth < 31) {
        monthlyData[dayOfMonth].sum += entry.baselineData.pain;
        monthlyData[dayOfMonth].count += 1;
      }
    });

    const weeklyAvg = weeklyData.map(d => (d.count > 0 ? d.sum / d.count : 0));
    const monthlyAvg = monthlyData.map(d => (d.count > 0 ? d.sum / d.count : 0));

    return {
      cyclical: {
        period: 'weekly',
        strength: this.calculateVariance(weeklyAvg) / 10, // Normalize to 0-1
      },
      weekly: {
        strength: this.calculateVariance(weeklyAvg) / 10,
        data: weeklyAvg,
      },
      monthly: {
        strength: this.calculateVariance(monthlyAvg) / 10,
        data: monthlyAvg,
      },
    };
  }

  public generateTimeHeatmap(
    entries: PainEntry[],
    days: number
  ): Array<{ dayIndex: number; hour: number; avgPain: number; count: number }> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Initialize grid
    const grid: Record<number, Record<number, { sum: number; count: number }>> = {};
    
    // 0 = Sun, 6 = Sat
    for (let d = 0; d < 7; d++) {
      grid[d] = {};
      for (let h = 0; h < 24; h++) {
        grid[d][h] = { sum: 0, count: 0 };
      }
    }

    entries
      .filter(e => new Date(e.timestamp) >= cutoff)
      .forEach(entry => {
        const d = new Date(entry.timestamp);
        const dayIdx = d.getDay();
        const hour = d.getHours();

        if (grid[dayIdx] && grid[dayIdx][hour]) {
          grid[dayIdx][hour].sum += entry.baselineData.pain;
          grid[dayIdx][hour].count += 1;
        }
      });

    const result: Array<{ dayIndex: number; hour: number; avgPain: number; count: number }> = [];

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const cell = grid[d][h];
        if (cell.count > 0) {
          result.push({
            dayIndex: d,
            hour: h,
            avgPain: Number((cell.sum / cell.count).toFixed(1)),
            count: cell.count
          });
        }
      }
    }

    return result;
  }

  private calculateTrend(entries: PainEntry[]): number {
    if (entries.length < 3) return 0;

    const painLevels = entries.map(e => e.baselineData.pain);
    const n = painLevels.length;
    const x = Array.from({ length: n }, (_, i) => i);

    // Simple linear regression slope
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = painLevels.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * painLevels[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private calculateOverallTrend(entries: PainEntry[]) {
    const trend = this.calculateTrend(entries.slice(-10));

    return {
      direction:
        trend > 0.1
          ? ('worsening' as const)
          : trend < -0.1
            ? ('improving' as const)
            : ('stable' as const),
      strength: Math.abs(trend),
    };
  }

  private calculateSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    // Simple seasonal adjustments (customize based on regional patterns)
    const seasonalFactors = [
      0.2, // January - Winter blues
      0.1, // February
      -0.1, // March - Spring improvement
      -0.2, // April
      -0.2, // May
      0.0, // June
      0.0, // July
      0.0, // August
      -0.1, // September
      0.1, // October
      0.2, // November - Weather changes
      0.2, // December - Holiday stress
    ];

    return seasonalFactors[month];
  }

  private calculateStressFactor(entries: PainEntry[]): number {
    const recentEntries = entries.slice(-3);
    const avgSleepQuality =
      recentEntries.reduce((sum, e) => sum + (e.qualityOfLife?.sleepQuality || 5), 0) /
      recentEntries.length;
    const avgMoodImpact =
      recentEntries.reduce((sum, e) => sum + (e.qualityOfLife?.moodImpact || 5), 0) /
      recentEntries.length;

    // Poor sleep and high mood impact increase predicted pain
    const sleepFactor = (5 - avgSleepQuality) * 0.2;
    const moodFactor = (avgMoodImpact - 5) * 0.2;

    return sleepFactor + moodFactor;
  }

  private getTimeframeMultiplier(timeframe: string): number {
    switch (timeframe) {
      case '24h':
        return 0.5;
      case '7d':
        return 2.0;
      case '30d':
        return 5.0;
      default:
        return 1.0;
    }
  }

  private getSeasonalDescription(factor: number): string {
    if (factor > 0.1) return 'Seasonal factors may increase pain';
    if (factor < -0.1) return 'Seasonal factors may reduce pain';
    return 'Neutral seasonal impact';
  }

  private getStressDescription(factor: number): string {
    if (factor > 0.3) return 'Poor sleep/stress may worsen pain';
    if (factor > 0.1) return 'Mild stress/sleep impact';
    return 'Good sleep/stress management';
  }

  private analyzeSeasonalFactors() {
    return [
      {
        factor: 'Weather Sensitivity',
        impact: 0.2,
        season: 'Winter',
      },
      {
        factor: 'Activity Level',
        impact: -0.1,
        season: 'Spring',
      },
    ];
  }

  private parseEffectiveness(effectiveness: string): number {
    const lower = effectiveness.toLowerCase();
    if (lower.includes('very effective') || lower.includes('excellent') || lower.includes('very good')) return 5;
    if (lower.includes('somewhat effective') || lower.includes('mixed')) return 3;
    if (lower.includes('not effective')) return 1;
    if (lower.includes('excellent') || lower.includes('very good')) return 5;
    if (lower.includes('good') || lower.includes('effective')) return 4;
    if (lower.includes('moderate') || lower.includes('fair')) return 3;
    if (lower.includes('poor') || lower.includes('minimal')) return 2;
    if (lower.includes('none') || lower.includes('ineffective')) return 1;
    return 3; // Default moderate
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

export const painAnalyticsService = new PainAnalyticsService();

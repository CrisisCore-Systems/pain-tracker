import type { PainEntry } from '../types';

interface ProgressionPoint {
  averagePain: number;
  timestamp: string;
  locations: string[];
  symptoms: string[];
}

interface Treatment {
  treatment: string;
  frequency: number;
}

interface WorkImpactAnalysis {
  missedDays: number;
  commonLimitations: [string, number][];
}

export function analyzeTreatmentChanges(entries: PainEntry[]): Treatment[] {
  const treatments = entries
    .flatMap(entry => entry.treatments?.recent || [])
    .reduce((acc: Record<string, number>, treatment) => {
      const treatmentType = treatment.type;
      acc[treatmentType] = (acc[treatmentType] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(treatments)
    .sort(([, a], [, b]) => b - a)
    .map(([treatment, count]) => ({
      treatment,
      frequency: count,
    }));
}

export function analyzeWorkImpact(entries: PainEntry[]): WorkImpactAnalysis {
  const workDays = entries.reduce((acc, entry) => acc + (entry.workImpact?.missedWork || 0), 0);

  const limitations = entries
    .flatMap(entry => entry.workImpact?.workLimitations || [])
    .reduce((acc: Record<string, number>, limitation: string) => {
      acc[limitation] = (acc[limitation] || 0) + 1;
      return acc;
    }, {});

  return {
    missedDays: workDays,
    commonLimitations: Object.entries(limitations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
  };
}

export function calculateOverallTrend(progression: ProgressionPoint[]): string {
  const validPoints = progression.filter(p => p.averagePain !== null);
  if (validPoints.length < 2) return 'Insufficient data';

  const firstPoint = validPoints[0].averagePain;
  const lastPoint = validPoints[validPoints.length - 1].averagePain;
  const difference = lastPoint - firstPoint;

  if (difference > 2) return 'Significant deterioration';
  if (difference > 1) return 'Moderate deterioration';
  if (difference > 0) return 'Slight deterioration';
  if (difference === 0) return 'Stable';
  return 'Improved';
}

// Note: generateRecommendations was removed as unused dead code on 2025-12-10.
// Recommendations are now generated inline in WCBReportGenerator component.

import type { PainEntry, WCBReport } from '../types';
import { formatNumber } from './formatting';
import { analyzeWorkImpact, analyzeTreatmentChanges } from './wcbAnalytics';

interface WCBClaimData {
  claimNumber?: string;
  employerInfo?: {
    name: string;
    contact: string;
    position: string;
  };
  injuryDate: string;
  returnToWorkDate?: string;
}

export function generateWCBReport(entries: PainEntry[], claimData?: WCBClaimData): WCBReport {
  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate date range
  const startDate = sortedEntries[0]?.timestamp || new Date().toISOString();
  const endDate = sortedEntries[sortedEntries.length - 1]?.timestamp || new Date().toISOString();

  // Analyze pain trends
  const painProgression = sortedEntries.map(entry => ({
    date: entry.timestamp,
    pain: entry.baselineData.pain,
    locations: entry.baselineData.locations,
    symptoms: entry.baselineData.symptoms,
  }));

  // Analyze work impact
  const workImpact = analyzeWorkImpact(sortedEntries);
  const treatments = analyzeTreatmentChanges(sortedEntries);

  // Generate functional analysis
  const functionalAnalysis = analyzeFunctionalImpact(sortedEntries);

  // Generate recommendations
  const recommendations = generateRecommendations(sortedEntries, workImpact, claimData);

  return {
    id: `wcb-report-${Date.now()}`,
    createdAt: new Date().toISOString(),
    period: {
      start: startDate,
      end: endDate,
    },
    claimInfo: claimData,
    painTrends: {
      average: calculateAveragePain(sortedEntries),
      progression: painProgression,
      locations: analyzeLocationFrequency(sortedEntries),
    },
    workImpact: {
      missedDays: workImpact.missedDays,
      limitations: workImpact.commonLimitations,
      accommodationsNeeded: identifyAccommodations(sortedEntries),
    },
    functionalAnalysis: functionalAnalysis,
    treatments: {
      current: treatments,
      effectiveness: analyzeTreatmentEffectiveness(sortedEntries),
    },
    recommendations,
  };
}

function analyzeFunctionalImpact(entries: PainEntry[]) {
  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];

  return {
    limitations: latestEntry?.functionalImpact?.limitedActivities || [],
    deterioration: identifyDeteriorations(firstEntry, latestEntry),
    improvements: identifyImprovements(firstEntry, latestEntry),
  };
}

function identifyDeteriorations(first?: PainEntry, latest?: PainEntry): string[] {
  if (!first || !latest) return [];

  const deteriorations: string[] = [];

  // Check for new limitations
  const firstActivities = first.functionalImpact?.limitedActivities || [];
  const latestActivities = latest.functionalImpact?.limitedActivities || [];
  const newLimitations = latestActivities.filter(activity => !firstActivities.includes(activity));

  // Check for pain increase
  if (latest.baselineData.pain > first.baselineData.pain + 2) {
    deteriorations.push('Significant pain increase');
  }

  // Check for new symptoms
  const firstSymptoms = first.baselineData.symptoms || [];
  const latestSymptoms = latest.baselineData.symptoms || [];
  const newSymptoms = latestSymptoms.filter(symptom => !firstSymptoms.includes(symptom));

  return [...deteriorations, ...newLimitations, ...newSymptoms];
}

function identifyImprovements(first?: PainEntry, latest?: PainEntry): string[] {
  if (!first || !latest) return [];

  const improvements: string[] = [];

  // Check for resolved limitations
  const firstActivities = first.functionalImpact?.limitedActivities || [];
  const latestActivities = latest.functionalImpact?.limitedActivities || [];
  const resolvedLimitations = firstActivities.filter(
    activity => !latestActivities.includes(activity)
  );

  // Check for pain decrease
  if (latest.baselineData.pain < first.baselineData.pain - 2) {
    improvements.push('Significant pain reduction');
  }

  // Check for resolved symptoms
  const firstSymptoms = first.baselineData.symptoms || [];
  const latestSymptoms = latest.baselineData.symptoms || [];
  const resolvedSymptoms = firstSymptoms.filter(symptom => !latestSymptoms.includes(symptom));

  return [...improvements, ...resolvedLimitations, ...resolvedSymptoms];
}

function identifyAccommodations(entries: PainEntry[]): string[] {
  const latestEntry = entries[entries.length - 1];
  if (!latestEntry) return [];

  const accommodations: string[] = [];

  // Check for mobility aids
  if (
    latestEntry.functionalImpact?.mobilityAids &&
    latestEntry.functionalImpact.mobilityAids.length > 0
  ) {
    accommodations.push(...latestEntry.functionalImpact.mobilityAids.map(aid => `Requires ${aid}`));
  }

  // Check work limitations
  if (latestEntry.workImpact?.modifiedDuties && latestEntry.workImpact.modifiedDuties.length > 0) {
    accommodations.push(...latestEntry.workImpact.modifiedDuties);
  }

  return accommodations;
}

function generateRecommendations(
  entries: PainEntry[],
  workImpact: { missedDays: number },
  claimData?: WCBClaimData
): string[] {
  const recommendations: string[] = [];
  const latestEntry = entries[entries.length - 1];

  if (!latestEntry) return recommendations;

  // High pain level recommendations
  if (latestEntry.baselineData.pain >= 7) {
    recommendations.push('Immediate medical reassessment recommended');
  }

  // Work-related recommendations
  if (workImpact.missedDays > 5) {
    recommendations.push('Occupational therapy assessment recommended');
  }

  // Return to work planning
  if (!claimData?.returnToWorkDate && latestEntry.baselineData.pain < 5) {
    recommendations.push('Consider graduated return to work program');
  }

  return recommendations;
}

function calculateAveragePain(entries: PainEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + entry.baselineData.pain, 0);
  return Number(formatNumber(sum / entries.length, 1));
}

function analyzeLocationFrequency(entries: PainEntry[]): Record<string, number> {
  return entries.reduce((acc: Record<string, number>, entry) => {
    (entry.baselineData.locations || []).forEach(location => {
      acc[location] = (acc[location] || 0) + 1;
    });
    return acc;
  }, {});
}

function analyzeTreatmentEffectiveness(entries: PainEntry[]): string {
  const latestEntry = entries[entries.length - 1];
  if (!latestEntry) return 'No data available';

  return latestEntry.treatments?.effectiveness || 'Not reported';
}

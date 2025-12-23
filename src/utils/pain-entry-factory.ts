import type { PainEntry } from '../types';
import { toIsoString } from './date-utils';

let seq = 1;

export function resetPainEntryFactorySequence(startAt: number = 1): void {
  seq = startAt;
}

export function makePainEntry(
  data: Partial<PainEntry> & { timestamp?: string | Date | number; id?: number | string } = {}
): PainEntry {
  const ts = toIsoString(data.timestamp) ?? (typeof data.timestamp === 'string' ? data.timestamp : undefined);
  const id = data.id ?? `test-${seq++}`;

  return {
    id,
    timestamp: ts ?? new Date().toISOString(),
    baselineData: {
      pain: data.baselineData?.pain ?? 5,
      locations: data.baselineData?.locations ?? [],
      symptoms: data.baselineData?.symptoms ?? [],
    },
    functionalImpact: {
      limitedActivities: data.functionalImpact?.limitedActivities ?? [],
      assistanceNeeded: data.functionalImpact?.assistanceNeeded ?? [],
      mobilityAids: data.functionalImpact?.mobilityAids ?? [],
    },
    medications: {
      current: data.medications?.current ?? [],
      changes: data.medications?.changes ?? '',
      effectiveness: data.medications?.effectiveness ?? '',
    },
    treatments: {
      recent: data.treatments?.recent ?? [],
      effectiveness: data.treatments?.effectiveness ?? '',
      planned: data.treatments?.planned ?? [],
    },
    qualityOfLife: {
      sleepQuality: data.qualityOfLife?.sleepQuality ?? 5,
      moodImpact: data.qualityOfLife?.moodImpact ?? 5,
      socialImpact: data.qualityOfLife?.socialImpact ?? [],
    },
    workImpact: {
      missedWork: data.workImpact?.missedWork ?? 0,
      modifiedDuties: data.workImpact?.modifiedDuties ?? [],
      workLimitations: data.workImpact?.workLimitations ?? [],
    },
    comparison: {
      worseningSince: data.comparison?.worseningSince ?? '',
      newLimitations: data.comparison?.newLimitations ?? [],
    },
    notes: data.notes ?? '',
    triggers: data.triggers,
    intensity: data.intensity,
    location: data.location,
    quality: data.quality,
    reliefMethods: data.reliefMethods,
    activityLevel: data.activityLevel,
    weather: data.weather,
    sleep: data.sleep,
    mood: data.mood,
    stress: data.stress,
    activities: data.activities,
  };
}

export default makePainEntry;

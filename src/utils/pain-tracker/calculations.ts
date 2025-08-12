import type { PainEntry } from '../../types';

export interface PainScore {
  total: number;
  severity: 'low' | 'moderate' | 'severe';
  locationFactor: number;
  symptomFactor: number;
}

export const calculatePainScore = (entry: PainEntry): PainScore => {
  const { baselineData } = entry;
  const locationFactor = baselineData.locations.length * 0.5;
  const symptomFactor = baselineData.symptoms.length * 0.3;

  // Calculate total score based on pain level, locations, and symptoms
  const total = baselineData.pain + locationFactor + symptomFactor;

  // Determine severity based on total score
  let severity: PainScore['severity'] = 'low';
  if (total >= 8) {
    severity = 'severe';
  } else if (total >= 5) {
    severity = 'moderate';
  }

  return {
    total,
    severity,
    locationFactor,
    symptomFactor,
  };
};

export interface AggregatedPainData {
  averagePain: number;
  commonLocations: Array<{ location: string; frequency: number }>;
  commonSymptoms: Array<{ symptom: string; frequency: number }>;
  painTrend: 'improving' | 'worsening' | 'stable';
  timeAnalysis: {
    worstTime: string | null;
    bestTime: string | null;
  };
  functionalImpactSummary: {
    mostLimitedActivities: string[];
    commonMobilityAids: string[];
  };
}

export const aggregatePainData = (entries: PainEntry[]): AggregatedPainData => {
  if (!entries.length) {
    return {
      averagePain: 0,
      commonLocations: [],
      commonSymptoms: [],
      painTrend: 'stable',
      timeAnalysis: { worstTime: null, bestTime: null },
      functionalImpactSummary: {
        mostLimitedActivities: [],
        commonMobilityAids: [],
      },
    };
  }

  // Calculate average pain
  const averagePain =
    entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length;

  // Analyze locations frequency
  const locationCount: Record<string, number> = {};
  entries.forEach(entry => {
    entry.baselineData.locations.forEach(location => {
      locationCount[location] = (locationCount[location] || 0) + 1;
    });
  });
  const commonLocations = Object.entries(locationCount)
    .map(([location, frequency]) => ({ location, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Analyze symptoms frequency
  const symptomCount: Record<string, number> = {};
  entries.forEach(entry => {
    entry.baselineData.symptoms.forEach(symptom => {
      symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
    });
  });
  const commonSymptoms = Object.entries(symptomCount)
    .map(([symptom, frequency]) => ({ symptom, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Determine pain trend
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const firstPain = sortedEntries[0].baselineData.pain;
  const lastPain = sortedEntries[sortedEntries.length - 1].baselineData.pain;
  const painTrend =
    firstPain < lastPain ? 'worsening' : firstPain > lastPain ? 'improving' : 'stable';

  // Find worst and best times
  const painByHour: Record<number, number[]> = {};
  entries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (!painByHour[hour]) painByHour[hour] = [];
    painByHour[hour].push(entry.baselineData.pain);
  });

  const hourlyAverages = Object.entries(painByHour).map(([hour, pains]) => ({
    hour: parseInt(hour),
    average: pains.reduce((a, b) => a + b, 0) / pains.length,
  }));

  const worstTime = hourlyAverages.length
    ? `${hourlyAverages.reduce((a, b) => (a.average > b.average ? a : b)).hour}:00`
    : null;
  const bestTime = hourlyAverages.length
    ? `${hourlyAverages.reduce((a, b) => (a.average < b.average ? a : b)).hour}:00`
    : null;

  // Analyze functional impact
  const activityCount: Record<string, number> = {};
  const mobilityAidsCount: Record<string, number> = {};
  entries.forEach(entry => {
    entry.functionalImpact.limitedActivities.forEach(activity => {
      activityCount[activity] = (activityCount[activity] || 0) + 1;
    });
    entry.functionalImpact.mobilityAids.forEach(aid => {
      mobilityAidsCount[aid] = (mobilityAidsCount[aid] || 0) + 1;
    });
  });

  const mostLimitedActivities = Object.entries(activityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([activity]) => activity);

  const commonMobilityAids = Object.entries(mobilityAidsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([aid]) => aid);

  return {
    averagePain,
    commonLocations,
    commonSymptoms,
    painTrend,
    timeAnalysis: {
      worstTime,
      bestTime,
    },
    functionalImpactSummary: {
      mostLimitedActivities,
      commonMobilityAids,
    },
  };
};

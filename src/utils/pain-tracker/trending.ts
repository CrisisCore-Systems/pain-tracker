import type { PainEntry } from '../../types';

export interface TrendAnalysis {
  timeOfDayPattern: { [key: string]: number };
  dayOfWeekPattern: { [key: string]: number };
  locationFrequency: { [key: string]: number };
  symptomCorrelations: { [key: string]: number };
  painTrends: { increasing: boolean; averageChange: number };
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  locationStats: { [key: string]: { frequency: number; avgPain: number } };
  symptomStats: { [key: string]: { frequency: number; avgPain: number } };
  timeRangeStats: {
    start: string;
    end: string;
    duration: number;
    totalEntries: number;
  };
}

export const analyzeTrends = (entries: PainEntry[]): TrendAnalysis => {
  if (!entries.length) {
    return {
      timeOfDayPattern: {},
      dayOfWeekPattern: {},
      locationFrequency: {},
      symptomCorrelations: {},
      painTrends: { increasing: false, averageChange: 0 },
    };
  }

  // Time of day patterns
  const timeOfDayPattern = entries.reduce(
    (acc, entry) => {
      const hour = new Date(entry.timestamp).getHours();
      const timeBlock = `${hour.toString().padStart(2, '0')}:00`;
      acc[timeBlock] = (acc[timeBlock] || 0) + entry.baselineData.pain;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Day of week patterns
  const dayOfWeekPattern = entries.reduce(
    (acc, entry) => {
      const day = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + entry.baselineData.pain;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Location frequency
  const locationFrequency = entries.reduce(
    (acc, entry) => {
      entry.baselineData.locations.forEach(location => {
        acc[location] = (acc[location] || 0) + 1;
      });
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Symptom correlations with pain levels
  const symptomCorrelations = entries.reduce(
    (acc, entry) => {
      entry.baselineData.symptoms.forEach(symptom => {
        acc[symptom] = (acc[symptom] || 0) + entry.baselineData.pain;
      });
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Pain level trends
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const changes = sortedEntries
    .slice(1)
    .map((entry, i) => entry.baselineData.pain - sortedEntries[i].baselineData.pain);
  const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length || 0;

  return {
    timeOfDayPattern,
    dayOfWeekPattern,
    locationFrequency,
    symptomCorrelations,
    painTrends: {
      increasing: averageChange > 0,
      averageChange,
    },
  };
};

export const calculateStatistics = (entries: PainEntry[]): Statistics => {
  if (!entries.length) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      locationStats: {},
      symptomStats: {},
      timeRangeStats: {
        start: '',
        end: '',
        duration: 0,
        totalEntries: 0,
      },
    };
  }

  // Basic pain level statistics
  const painLevels = entries.map(e => e.baselineData.pain);
  const mean = painLevels.reduce((sum, pain) => sum + pain, 0) / painLevels.length;

  const sortedPain = [...painLevels].sort((a, b) => a - b);
  const median =
    sortedPain.length % 2 === 0
      ? (sortedPain[sortedPain.length / 2 - 1] + sortedPain[sortedPain.length / 2]) / 2
      : sortedPain[Math.floor(sortedPain.length / 2)];

  const mode = sortedPain.reduce(
    (acc, curr) => {
      const count = sortedPain.filter(num => num === curr).length;
      return count > acc.count ? { value: curr, count } : acc;
    },
    { value: sortedPain[0], count: 0 }
  ).value;

  // Location statistics
  const locationStats = entries.reduce(
    (acc, entry) => {
      entry.baselineData.locations.forEach(location => {
        if (!acc[location]) {
          acc[location] = { frequency: 0, totalPain: 0, avgPain: 0 };
        }
        const stats = acc[location];
        if (stats) {
          stats.frequency += 1;
          stats.totalPain = (stats.totalPain || 0) + entry.baselineData.pain;
        }
      });

      Object.keys(acc).forEach(location => {
        const stats = acc[location];
        if (stats && typeof stats.totalPain === 'number') {
          stats.avgPain = stats.totalPain / stats.frequency;
          delete stats.totalPain;
        }
      });

      return acc;
    },
    {} as Record<string, { frequency: number; totalPain?: number; avgPain: number }>
  );

  // Symptom statistics
  const symptomStats = entries.reduce(
    (acc, entry) => {
      entry.baselineData.symptoms.forEach(symptom => {
        if (!acc[symptom]) {
          acc[symptom] = { frequency: 0, totalPain: 0, avgPain: 0 };
        }
        const stats = acc[symptom];
        if (stats) {
          stats.frequency += 1;
          stats.totalPain = (stats.totalPain || 0) + entry.baselineData.pain;
        }
      });

      Object.keys(acc).forEach(symptom => {
        const stats = acc[symptom];
        if (stats && typeof stats.totalPain === 'number') {
          stats.avgPain = stats.totalPain / stats.frequency;
          delete stats.totalPain;
        }
      });

      return acc;
    },
    {} as Record<string, { frequency: number; totalPain?: number; avgPain: number }>
  );

  // Time range statistics
  const timestamps = entries.map(e => new Date(e.timestamp).getTime());
  const start = new Date(Math.min(...timestamps)).toISOString();
  const end = new Date(Math.max(...timestamps)).toISOString();
  const duration = Math.max(...timestamps) - Math.min(...timestamps);

  return {
    mean,
    median,
    mode,
    locationStats,
    symptomStats,
    timeRangeStats: {
      start,
      end,
      duration,
      totalEntries: entries.length,
    },
  };
};

import type { PainEntry } from '../../types';

/**
 * Trend Analysis Module
 *
 * TIMEZONE HANDLING:
 * This module uses LOCAL time for pattern analysis (getHours(), getDay()).
 * This is intentional because users experience pain patterns relative to their
 * local schedule (e.g., "mornings are worse" means their local morning).
 *
 * The underlying timestamp in PainEntry should be stored as UTC ISO string,
 * but pattern analysis uses the user's local timezone for meaningful insights.
 */

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

/**
 * Safe division that returns 0 for division by zero or invalid inputs
 */
function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || !Number.isFinite(denominator)) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
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
  // Use local hours so analysis reflects user's local experience.
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
  // Use local weekday so results map to the user's local calendar days.
  const dayOfWeekPattern = entries.reduce(
    (acc, entry) => {
      const weekdayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayIdx = new Date(entry.timestamp).getDay();
      const dayName = weekdayNames[dayIdx];
      acc[dayName] = (acc[dayName] || 0) + entry.baselineData.pain;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Location frequency
  const locationFrequency = entries.reduce(
    (acc, entry) => {
      entry.baselineData.locations?.forEach(location => {
        acc[location] = (acc[location] || 0) + 1;
      });
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Symptom correlations with pain levels
  const symptomCorrelations = entries.reduce(
    (acc, entry) => {
      entry.baselineData.symptoms?.forEach(symptom => {
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
  // Safe division: use safeDivide to prevent NaN when changes is empty
  const averageChange = safeDivide(
    changes.reduce((sum, change) => sum + change, 0),
    changes.length,
    0
  );

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
      // If current count is higher, use current value
      // If count is equal and current value is the original first value, use it (for tie-breaking)
      return count > acc.count || (count === acc.count && curr === painLevels[0])
        ? { value: curr, count }
        : acc;
    },
    { value: painLevels[0], count: 0 }
  ).value;

  // Location statistics
  const locationStats = entries.reduce(
    (acc, entry) => {
      entry.baselineData.locations?.forEach(location => {
        if (!acc[location]) {
          acc[location] = { frequency: 0, totalPain: 0, avgPain: 0 };
        }
        const stats = acc[location];
        if (stats) {
          stats.frequency += 1;
          stats.totalPain = (stats.totalPain || 0) + entry.baselineData.pain;
        }
      });

      return acc;
    },
    {} as Record<string, { frequency: number; totalPain?: number; avgPain: number }>
  );

  // Calculate average pain for each location
  Object.keys(locationStats).forEach(location => {
    const stats = locationStats[location];
    if (stats && typeof stats.totalPain === 'number') {
      stats.avgPain = stats.totalPain / stats.frequency;
      delete stats.totalPain;
    }
  });

  // Symptom statistics
  const symptomStats = entries.reduce(
    (acc, entry) => {
      entry.baselineData.symptoms?.forEach(symptom => {
        if (!acc[symptom]) {
          acc[symptom] = { frequency: 0, totalPain: 0, avgPain: 0 };
        }
        const stats = acc[symptom];
        if (stats) {
          stats.frequency += 1;
          stats.totalPain = (stats.totalPain || 0) + entry.baselineData.pain;
        }
      });

      return acc;
    },
    {} as Record<string, { frequency: number; totalPain?: number; avgPain: number }>
  );

  // Calculate average pain for each symptom
  Object.keys(symptomStats).forEach(symptom => {
    const stats = symptomStats[symptom];
    if (stats && typeof stats.totalPain === 'number') {
      stats.avgPain = stats.totalPain / stats.frequency;
      delete stats.totalPain;
    }
  });

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

/**
 * Produce a daily time-series of aggregated pain, symptoms and locations.
 * - Uses UTC dates for deterministic behavior.
 * - If a `period` is provided it will ensure all days in the range are present.
 */
export function buildDailySeries(entries: PainEntry[], period?: { start: string; end: string }) {
  const dailyData = entries.reduce(
    (acc, entry) => {
      // Use local date key so buckets align with user's local calendar days
      const d = new Date(entry.timestamp);
      // Build local YYYY-MM-DD manually
      const localYear = d.getFullYear();
      const localMonth = (d.getMonth() + 1).toString().padStart(2, '0');
      const localDate = d.getDate().toString().padStart(2, '0');
      const localKey = `${localYear}-${localMonth}-${localDate}`;
      if (!acc[localKey])
        acc[localKey] = {
          painLevels: [] as number[],
          symptoms: new Set<string>(),
          locations: new Set<string>(),
        };
      acc[localKey].painLevels.push(entry.baselineData.pain);
      entry.baselineData.symptoms?.forEach(s => acc[localKey].symptoms.add(s));
      entry.baselineData.locations?.forEach(l => acc[localKey].locations.add(l));
      return acc;
    },
    {} as Record<string, { painLevels: number[]; symptoms: Set<string>; locations: Set<string> }>
  );

  const entriesByDate = Object.entries(dailyData).map(([date, data]) => ({
    date,
    pain: data.painLevels.reduce((a, b) => a + b, 0) / data.painLevels.length,
    symptoms: data.symptoms.size,
    locations: data.locations.size,
  }));

  if (period) {
    // Interpret period.start and period.end as local dates (YYYY-MM-DD)
    const startParts = period.start.split('-').map(p => parseInt(p, 10));
    const endParts = period.end.split('-').map(p => parseInt(p, 10));
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const days: {
      date: string;
      pain: number | null;
      symptoms: number | null;
      locations: number | null;
    }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      const iso = `${y}-${m}-${dd}`;
      const found = entriesByDate.find(e => e.date === iso);
      if (found) days.push(found);
      else days.push({ date: iso, pain: null, symptoms: null, locations: null });
    }
    return days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return entriesByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

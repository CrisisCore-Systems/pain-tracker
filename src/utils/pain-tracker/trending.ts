import type { PainEntry } from '../../types';
import { pickVariant } from '@pain-tracker/utils';

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
  /** Human-friendly summary of what the trends suggest (derived from local-only analysis). */
  narrativeSummary: string;
  /** Note about how much data supports the summary. */
  confidenceNote: string;
  advanced?: AdvancedTrendAnalysis;
}

export interface TrendAnalysisOptions {
  /** When enabled, computes additional buckets, tag summaries, and numeric correlations. */
  advanced?: boolean;
  /** Defaults to local time (matches user's lived schedule). */
  timezone?: 'local' | 'utc';
  /** Minimum observations required before a bucket/tag is surfaced in advanced output. */
  minCount?: number;
  /** Maximum unique tag values retained per tag category (advanced only). */
  maxTagItems?: number;
}

export interface BucketStat {
  count: number;
  totalPain: number;
  avgPain: number;
}

export interface RankedBucket extends BucketStat {
  key: string;
}

export interface TagStat {
  count: number;
  totalPain: number;
  avgPain: number;
}

export interface AdvancedTrendAnalysis {
  timeOfDayBuckets: Record<string, BucketStat>;
  dayOfWeekBuckets: Record<string, BucketStat>;
  bestTimeOfDay?: RankedBucket;
  worstTimeOfDay?: RankedBucket;
  bestDayOfWeek?: RankedBucket;
  worstDayOfWeek?: RankedBucket;

  tags: {
    triggers: Record<string, TagStat>;
    reliefMethods: Record<string, TagStat>;
    activities: Record<string, TagStat>;
    quality: Record<string, TagStat>;
    weather: Record<string, TagStat>;
  };

  /** Pearson correlations in [-1, 1]. Null when insufficient data. */
  correlations: {
    sleepToPain: number | null;
    moodToPain: number | null;
    stressToPain: number | null;
    activityLevelToPain: number | null;
  };
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

function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

function pearsonCorrelation(pairs: Array<{ x: number; y: number }>): number | null {
  if (pairs.length < 3) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const pair of pairs) {
    const x = pair.x;
    const y = pair.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const n = pairs.length;
  const numerator = n * sumXY - sumX * sumY;
  const denomLeft = n * sumX2 - sumX * sumX;
  const denomRight = n * sumY2 - sumY * sumY;
  const denominator = Math.sqrt(Math.max(0, denomLeft) * Math.max(0, denomRight));
  if (!Number.isFinite(denominator) || denominator === 0) return 0;
  return safeDivide(numerator, denominator, 0);
}

function buildTrendNarrative(args: {
  entries: PainEntry[];
  painTrends: { increasing: boolean; averageChange: number };
  advanced?: AdvancedTrendAnalysis;
}): { narrativeSummary: string; confidenceNote: string } {
  const { entries, painTrends, advanced } = args;
  const total = entries.length;
  if (total === 0) {
    return {
      narrativeSummary: 'Not enough data yet to summarize trends.',
      confidenceNote: 'Add a few entries across different days to build a baseline.',
    };
  }

  const avgPain = safeDivide(
    entries.reduce((sum, entry) => sum + (entry?.baselineData?.pain ?? 0), 0),
    total,
    0
  );

  const delta = painTrends.averageChange;
  const trendingUp = delta > 0.1;
  const trendingDown = delta < -0.1;
  const direction = trendingUp ? 'up' : trendingDown ? 'down' : 'flat';

  const bestTime = advanced?.bestTimeOfDay?.key;
  const worstTime = advanced?.worstTimeOfDay?.key;
  const bestDay = advanced?.bestDayOfWeek?.key;
  const worstDay = advanced?.worstDayOfWeek?.key;

  const seed = [
    'trend',
    total,
    Math.round(avgPain * 10),
    Math.round(delta * 10),
    direction,
    bestTime ?? 'na',
    worstTime ?? 'na',
    bestDay ?? 'na',
    worstDay ?? 'na',
  ].join('|');

  const base = pickVariant(seed, [
    `Across your last ${total} entries, pain averages about ${avgPain.toFixed(1)}/10.`,
    `Based on your last ${total} check-ins, your average pain is around ${avgPain.toFixed(1)}/10.`,
    `Looking at ${total} recent logs, pain sits near ${avgPain.toFixed(1)}/10 on average.`,
  ]);

  const trendLine = trendingUp
    ? pickVariant(seed + '|dir', [
        'Overall, pain has been edging upward lately.',
        'Overall, your recent entries lean higher than earlier ones.',
        'Overall, there’s an upward drift in recent pain levels.',
      ])
    : trendingDown
      ? pickVariant(seed + '|dir', [
          'Overall, pain has been trending downward lately.',
          'Overall, your recent entries lean lower than earlier ones.',
          'Overall, there’s a gentle downward drift in recent pain levels.',
        ])
      : pickVariant(seed + '|dir', [
          'Overall, things look fairly steady from day to day.',
          'Overall, your pain levels look relatively stable.',
          'Overall, there isn’t a strong upward or downward shift right now.',
        ]);

  const highlights: string[] = [];
  if (bestTime && worstTime && bestTime !== worstTime) {
    highlights.push(`Your lowest time-of-day bucket is ${bestTime}, and your highest is ${worstTime}.`);
  }
  if (bestDay && worstDay && bestDay !== worstDay) {
    highlights.push(`Your easier day-of-week bucket is ${bestDay}, and your tougher one is ${worstDay}.`);
  }

  const highlightLine =
    highlights.length > 0
      ? ' ' + pickVariant(seed + '|hi', highlights)
      : pickVariant(seed + '|hi', [
          'Keep noting sleep, stress, activity, and relief methods—those details help explain day-to-day swings.',
          'If you capture triggers and relief alongside pain, patterns usually become clearer faster.',
          'Small context notes (sleep, stress, movement) can make the trends more actionable.',
        ]);

  let confidenceNote = '';
  if (total < 5) {
    confidenceNote = 'Low confidence: there are only a few entries so far. Adding more check-ins will improve reliability.';
  } else if (total < 14) {
    confidenceNote = 'Medium confidence: you have about a week of data. More entries across different days will sharpen patterns.';
  } else {
    confidenceNote = 'Higher confidence: you have multiple weeks of data. Keep logging to confirm whether patterns hold.';
  }

  return {
    narrativeSummary: `${base} ${trendLine}${highlightLine}`.trim(),
    confidenceNote,
  };
}

export const analyzeTrends = (
  entries: PainEntry[],
  options: TrendAnalysisOptions = {}
): TrendAnalysis => {
  const timezone = options.timezone ?? 'local';
  if (!entries.length) {
    return {
      timeOfDayPattern: {},
      dayOfWeekPattern: {},
      locationFrequency: {},
      symptomCorrelations: {},
      painTrends: { increasing: false, averageChange: 0 },
      narrativeSummary: 'Not enough data yet to summarize trends.',
      confidenceNote: 'Add a few entries across different days to build a baseline.',
    };
  }

  const minCount = Math.max(1, options.minCount ?? 2);
  const maxTagItems = Math.max(1, options.maxTagItems ?? 50);

  const getHour = (timestamp: string) => {
    const d = new Date(timestamp);
    return timezone === 'utc' ? d.getUTCHours() : d.getHours();
  };

  const getDayIndex = (timestamp: string) => {
    const d = new Date(timestamp);
    return timezone === 'utc' ? d.getUTCDay() : d.getDay();
  };

  // Time of day patterns
  // Use local hours so analysis reflects user's local experience.
  const timeOfDayPattern = entries.reduce(
    (acc, entry) => {
      const hour = getHour(entry.timestamp);
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
      const dayIdx = getDayIndex(entry.timestamp);
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

  let advanced: AdvancedTrendAnalysis | undefined;
  if (options.advanced) {
    const timeOfDayBuckets: Record<string, BucketStat> = {};
    const dayOfWeekBuckets: Record<string, BucketStat> = {};
    const weekdayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const tagAccumulators = {
      triggers: new Map<string, { count: number; totalPain: number }>(),
      reliefMethods: new Map<string, { count: number; totalPain: number }>(),
      activities: new Map<string, { count: number; totalPain: number }>(),
      quality: new Map<string, { count: number; totalPain: number }>(),
      weather: new Map<string, { count: number; totalPain: number }>(),
    };

    const sleepPairs: Array<{ x: number; y: number }> = [];
    const moodPairs: Array<{ x: number; y: number }> = [];
    const stressPairs: Array<{ x: number; y: number }> = [];
    const activityLevelPairs: Array<{ x: number; y: number }> = [];

    const upsertTag = (map: Map<string, { count: number; totalPain: number }>, raw: string, pain: number) => {
      const key = normalizeTag(raw);
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalPain += pain;
        return;
      }
      if (map.size >= maxTagItems) return;
      map.set(key, { count: 1, totalPain: pain });
    };

    for (const entry of entries) {
      const pain = entry.baselineData.pain;

      const hour = getHour(entry.timestamp);
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      const hourBucket = timeOfDayBuckets[hourKey] ?? { count: 0, totalPain: 0, avgPain: 0 };
      hourBucket.count += 1;
      hourBucket.totalPain += pain;
      timeOfDayBuckets[hourKey] = hourBucket;

      const dayKey = weekdayNames[getDayIndex(entry.timestamp)];
      const dayBucket = dayOfWeekBuckets[dayKey] ?? { count: 0, totalPain: 0, avgPain: 0 };
      dayBucket.count += 1;
      dayBucket.totalPain += pain;
      dayOfWeekBuckets[dayKey] = dayBucket;

      entry.triggers?.forEach(trigger => upsertTag(tagAccumulators.triggers, trigger, pain));
      entry.reliefMethods?.forEach(method => upsertTag(tagAccumulators.reliefMethods, method, pain));
      entry.activities?.forEach(activity => upsertTag(tagAccumulators.activities, activity, pain));
      entry.quality?.forEach(q => upsertTag(tagAccumulators.quality, q, pain));
      if (typeof entry.weather === 'string' && entry.weather.trim()) {
        upsertTag(tagAccumulators.weather, entry.weather, pain);
      }

      const sleep = entry.sleep ?? entry.qualityOfLife?.sleepQuality;
      if (typeof sleep === 'number' && Number.isFinite(sleep)) sleepPairs.push({ x: sleep, y: pain });

      const mood = entry.mood ?? entry.qualityOfLife?.moodImpact;
      if (typeof mood === 'number' && Number.isFinite(mood)) moodPairs.push({ x: mood, y: pain });

      if (typeof entry.stress === 'number' && Number.isFinite(entry.stress)) {
        stressPairs.push({ x: entry.stress, y: pain });
      }

      if (typeof entry.activityLevel === 'number' && Number.isFinite(entry.activityLevel)) {
        activityLevelPairs.push({ x: entry.activityLevel, y: pain });
      }
    }

    const finalizeBuckets = (buckets: Record<string, BucketStat>) => {
      Object.values(buckets).forEach(bucket => {
        bucket.avgPain = safeDivide(bucket.totalPain, bucket.count, 0);
      });
    };

    finalizeBuckets(timeOfDayBuckets);
    finalizeBuckets(dayOfWeekBuckets);

    const pickBestWorst = (buckets: Record<string, BucketStat>) => {
      const ranked: RankedBucket[] = Object.entries(buckets)
        .filter(([, stat]) => stat.count >= minCount)
        .map(([key, stat]) => ({ key, ...stat }))
        .sort((a, b) => a.avgPain - b.avgPain);

      if (!ranked.length) return { best: undefined, worst: undefined };
      return { best: ranked[0], worst: ranked[ranked.length - 1] };
    };

    const { best: bestTimeOfDay, worst: worstTimeOfDay } = pickBestWorst(timeOfDayBuckets);
    const { best: bestDayOfWeek, worst: worstDayOfWeek } = pickBestWorst(dayOfWeekBuckets);

    const finalizeTags = (map: Map<string, { count: number; totalPain: number }>) => {
      const out: Record<string, TagStat> = {};
      for (const [key, stat] of map.entries()) {
        if (stat.count < minCount) continue;
        out[key] = {
          count: stat.count,
          totalPain: stat.totalPain,
          avgPain: safeDivide(stat.totalPain, stat.count, 0),
        };
      }
      return out;
    };

    advanced = {
      timeOfDayBuckets,
      dayOfWeekBuckets,
      bestTimeOfDay,
      worstTimeOfDay,
      bestDayOfWeek,
      worstDayOfWeek,
      tags: {
        triggers: finalizeTags(tagAccumulators.triggers),
        reliefMethods: finalizeTags(tagAccumulators.reliefMethods),
        activities: finalizeTags(tagAccumulators.activities),
        quality: finalizeTags(tagAccumulators.quality),
        weather: finalizeTags(tagAccumulators.weather),
      },
      correlations: {
        sleepToPain: pearsonCorrelation(sleepPairs),
        moodToPain: pearsonCorrelation(moodPairs),
        stressToPain: pearsonCorrelation(stressPairs),
        activityLevelToPain: pearsonCorrelation(activityLevelPairs),
      },
    };
  }

  const painTrends = { increasing: averageChange > 0, averageChange };
  const narrative = buildTrendNarrative({ entries, painTrends, advanced });

  return {
    timeOfDayPattern,
    dayOfWeekPattern,
    locationFrequency,
    symptomCorrelations,
    painTrends,
    narrativeSummary: narrative.narrativeSummary,
    confidenceNote: narrative.confidenceNote,
    ...(advanced ? { advanced } : {}),
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

import type { PainEntry } from '../../types';
import { analyzeTrends } from './trending';

export type InsightTone = 'celebration' | 'gentle-nudge' | 'observation';

export interface DashboardAIInsight {
  id: string;
  title: string;
  summary: string;
  detail?: string;
  tone: InsightTone;
  confidence: number; // 0-1
  metricLabel?: string;
  metricValue?: string;
}

interface GenerateInsightOptions {
  allEntries?: PainEntry[];
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const roundToTenth = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function averagePain(entries: PainEntry[]): number | null {
  if (!entries.length) return null;
  const total = entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0);
  return total / entries.length;
}

function splitByDayWindow(entries: PainEntry[], daysBack: number): PainEntry[] {
  const now = Date.now();
  const earliest = now - daysBack * MS_IN_DAY;
  return entries.filter((entry) => new Date(entry.timestamp).getTime() >= earliest);
}

function splitWindow(entries: PainEntry[], startDaysAgo: number, endDaysAgo: number): PainEntry[] {
  const now = Date.now();
  const startTs = now - startDaysAgo * MS_IN_DAY;
  const endTs = now - endDaysAgo * MS_IN_DAY;
  return entries.filter((entry) => {
    const ts = new Date(entry.timestamp).getTime();
    return ts < startTs && ts >= endTs;
  });
}

type DaySegment = {
  key: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  description: string;
  totalPain: number;
  count: number;
};

function buildDaySegments(entries: PainEntry[]): DaySegment[] {
  const segments: Record<DaySegment['key'], DaySegment> = {
    morning: { key: 'morning', label: 'Morning', description: '5:00 – 11:59', totalPain: 0, count: 0 },
    afternoon: { key: 'afternoon', label: 'Afternoon', description: '12:00 – 16:59', totalPain: 0, count: 0 },
    evening: { key: 'evening', label: 'Evening', description: '17:00 – 21:59', totalPain: 0, count: 0 },
    night: { key: 'night', label: 'Night', description: '22:00 – 4:59', totalPain: 0, count: 0 },
  };

  entries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    const pain = entry.baselineData.pain;
    if (Number.isNaN(hour)) return;
    if (hour >= 5 && hour < 12) {
      segments.morning.totalPain += pain;
      segments.morning.count += 1;
    } else if (hour >= 12 && hour < 17) {
      segments.afternoon.totalPain += pain;
      segments.afternoon.count += 1;
    } else if (hour >= 17 && hour < 22) {
      segments.evening.totalPain += pain;
      segments.evening.count += 1;
    } else {
      segments.night.totalPain += pain;
      segments.night.count += 1;
    }
  });

  return Object.values(segments);
}

interface TriggerStat {
  trigger: string;
  count: number;
  averagePain: number;
}

function collectTriggerStats(entries: PainEntry[]): TriggerStat[] {
  const map = new Map<string, { count: number; totalPain: number }>();
  entries.forEach((entry) => {
    entry.triggers?.forEach((trigger) => {
      const key = trigger.trim().toLowerCase();
      if (!key) return;
      const stat = map.get(key);
      if (stat) {
        stat.count += 1;
        stat.totalPain += entry.baselineData.pain;
      } else {
        map.set(key, { count: 1, totalPain: entry.baselineData.pain });
      }
    });
  });

  return Array.from(map.entries()).map(([trigger, stat]) => ({
    trigger,
    count: stat.count,
    averagePain: stat.totalPain / stat.count,
  }));
}

function formatTrigger(trigger: string): string {
  return trigger
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function generateDashboardAIInsights(
  entries: PainEntry[],
  options: GenerateInsightOptions = {}
): DashboardAIInsight[] {
  if (!entries.length) {
    return [
      {
        id: 'no-data',
        title: 'Start your insight journey',
        summary: 'Once you add a few pain entries, we will highlight gentle patterns to support your care plan.',
        tone: 'observation',
        confidence: 0.2,
      },
    ];
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const allEntries = options.allEntries && options.allEntries.length > entries.length
    ? [...options.allEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : sortedEntries;

  const lastSevenDays = splitByDayWindow(sortedEntries, 7);
  const previousSevenDays = splitWindow(sortedEntries, 7, 14);

  const lastAvg = averagePain(lastSevenDays);
  const prevAvg = averagePain(previousSevenDays);
  const lifetimeAvg = averagePain(allEntries) ?? averagePain(sortedEntries) ?? 0;

  const comparisonAvg = prevAvg ?? lifetimeAvg;
  const recentChange = lastAvg !== null && comparisonAvg !== null
    ? roundToTenth(lastAvg - comparisonAvg)
    : 0;

  const trendInsight: DashboardAIInsight = {
    id: 'pain-trend',
    title: 'Pain momentum check-in',
    summary: '',
    tone: 'observation',
    confidence: clamp((lastSevenDays.length + (previousSevenDays.length || 0)) / 14, 0.25, 0.9),
    metricLabel: '7-day average',
    metricValue: lastAvg !== null ? `${roundToTenth(lastAvg)}/10` : undefined,
  };

  if (lastAvg === null) {
    trendInsight.summary = 'Not enough recent entries to compare weeks yet—each note you add uncloses richer guidance.';
  } else if (recentChange <= -0.4) {
    trendInsight.summary = `Pain levels eased about ${Math.abs(recentChange).toFixed(1)} points compared to earlier weeks. Notice what supported you and celebrate the care you offered yourself.`;
    trendInsight.tone = 'celebration';
  } else if (recentChange >= 0.4) {
    trendInsight.summary = `Pain has risen roughly ${recentChange.toFixed(1)} points over the past week. Consider jotting triggers or pacing ideas so we can watch for supportive adjustments.`;
    trendInsight.tone = 'gentle-nudge';
  } else {
    trendInsight.summary = 'Pain levels are holding steady week over week. Keep noting small shifts—the steadiness itself is valuable information.';
  }

  const segments = buildDaySegments(sortedEntries);
  const segmentsWithData = segments.filter((segment) => segment.count > 0);

  const dayInsight: DashboardAIInsight = {
    id: 'time-of-day',
    title: 'Time-of-day pattern spotlight',
    summary: '',
    tone: 'observation',
    confidence: 0.3,
  };

  if (segmentsWithData.length < 2) {
    dayInsight.summary = 'Keep logging at different times of day and we will gently surface when your body feels the most taxed or supported.';
  } else {
    const enriched = segmentsWithData.map((segment) => ({
      ...segment,
      average: segment.totalPain / segment.count,
    }));

    enriched.sort((a, b) => b.average - a.average);
    const highest = enriched[0];
    const lowest = enriched[enriched.length - 1];
    const spread = roundToTenth(highest.average - lowest.average);

    dayInsight.metricLabel = `${highest.label} average`;
    dayInsight.metricValue = `${roundToTenth(highest.average)}/10`;
    dayInsight.confidence = clamp(highest.count / sortedEntries.length + 0.2, 0.35, 0.85);

    if (spread >= 0.5) {
      dayInsight.summary = `${highest.label} entries trend about ${spread.toFixed(1)} points higher than ${lowest.label.toLowerCase()} notes. Planning a gentle buffer around ${highest.label.toLowerCase()} could soften the load.`;
      dayInsight.tone = 'gentle-nudge';
    } else {
      dayInsight.summary = `${highest.label} currently edges out other times by a tiny margin. Continue noticing what helps across the day—we will highlight any stronger shifts.`;
    }
  }

  const triggerStats = collectTriggerStats(sortedEntries);
  const triggerInsight: DashboardAIInsight = {
    id: 'trigger-focus',
    title: 'Trigger check-in',
    summary: '',
    tone: 'observation',
    confidence: 0.25,
  };

  if (!triggerStats.length) {
    triggerInsight.summary = 'No repeating triggers are standing out yet. When you notice one, jot it down so we can gently connect the dots for you.';
  } else {
    triggerStats.sort((a, b) => b.count - a.count || b.averagePain - a.averagePain);
    const totalTriggerMentions = triggerStats.reduce((sum, stat) => sum + stat.count, 0);
    const primary = triggerStats[0];
    const secondary = triggerStats[1];

    triggerInsight.metricLabel = 'Most noted trigger';
    triggerInsight.metricValue = formatTrigger(primary.trigger);
    triggerInsight.confidence = clamp(primary.count / Math.max(sortedEntries.length, 1) + 0.2, 0.35, 0.9);

    const avgPain = roundToTenth(primary.averagePain);
    const share = Math.round((primary.count / totalTriggerMentions) * 100);

    const secondarySnippet = secondary
      ? ` ${formatTrigger(secondary.trigger)} also showed up ${secondary.count} times.`
      : '';

    if (avgPain >= 6) {
      triggerInsight.summary = `${formatTrigger(primary.trigger)} appears in about ${share}% of entries and averages around ${avgPain}/10 pain. Preparing extra recovery supports when it is present may help.${secondarySnippet}`;
      triggerInsight.tone = 'gentle-nudge';
    } else {
      triggerInsight.summary = `${formatTrigger(primary.trigger)} is the most common note so far, yet pain stays near ${avgPain}/10 on average. Keep capturing moments when it feels easier too so we can balance the picture.${secondarySnippet}`;
    }
  }

  const insights: DashboardAIInsight[] = [trendInsight, dayInsight, triggerInsight];

  const trendData = analyzeTrends(sortedEntries);
  if (trendData.painTrends && Number.isFinite(trendData.painTrends.averageChange)) {
    const signal = roundToTenth(trendData.painTrends.averageChange);
    if (Math.abs(signal) >= 0.6) {
      insights.push({
        id: 'overall-shift',
        title: 'Overall shift alert',
        summary: signal > 0
          ? 'Recent entries suggest a steady upward climb in pain. Pairing pacing breaks with grounding practices could cushion the lift.'
          : 'Pain entries lean downward overall—a meaningful signal that your care routines are helping.',
        tone: signal > 0 ? 'gentle-nudge' : 'celebration',
        confidence: clamp(Math.abs(signal) / 2 + 0.3, 0.35, 0.85),
      });
    }
  }

  return insights;
}

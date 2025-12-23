// Compute Pearson correlation between two arrays
function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return null;
  return num / denom;
}
// --- Medication Effectiveness Analytics ---
interface MedicationEffectivenessStats {
  total: number;
  effective: number;
  notEffective: number;
  madeWorse: number;
  unknown: number;
  percentEffective: number;
}

// Simple confidence interval for proportion (Wald, for demo)
function proportionCI(successes: number, n: number, z = 1.96) {
  if (n === 0) return { lower: 0, upper: 0 };
  const p = successes / n;
  const se = Math.sqrt((p * (1 - p)) / n);
  return {
    lower: Math.max(0, Math.round((p - z * se) * 100)),
    upper: Math.min(100, Math.round((p + z * se) * 100)),
  };
}

// Simple p-value for difference from 50% (binomial test, two-sided, normal approx)
function pValue(successes: number, n: number, p0 = 0.5) {
  if (n === 0) return 1;
  const p = successes / n;
  const se = Math.sqrt(p0 * (1 - p0) / n);
  const z = (p - p0) / se;
  // Two-tailed
  const pval = 2 * (1 - normalCdf(Math.abs(z)));
  return Math.max(0, Math.min(1, pval));
}

// Standard normal CDF
function normalCdf(z: number) {
  return 0.5 * (1 + Math.erf(z / Math.sqrt(2)));
}

function computeMedicationEffectiveness(entries: PainEntry[]) {
  let total = 0, effective = 0, notEffective = 0, madeWorse = 0, unknown = 0;
  for (const entry of entries) {
    for (const med of entry.medications?.current ?? []) {
      total++;
      const eff = (med.effectiveness || '').toLowerCase();
      if (eff === 'very effective' || eff === 'moderately effective' || eff === 'somewhat effective') effective++;
      else if (eff === 'not effective') notEffective++;
      else if (eff === 'made things worse') madeWorse++;
      else unknown++;
    }
  }
  const percentEffective = total > 0 ? Math.round((effective / total) * 100) : 0;
  const ci = proportionCI(effective, total);
  const pval = pValue(effective, total);
  return { total, effective, notEffective, madeWorse, unknown, percentEffective, ci, pval };
}
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
  return entries.filter(entry => new Date(entry.timestamp).getTime() >= earliest);
}

function splitWindow(entries: PainEntry[], startDaysAgo: number, endDaysAgo: number): PainEntry[] {
  const now = Date.now();
  const startTs = now - startDaysAgo * MS_IN_DAY;
  const endTs = now - endDaysAgo * MS_IN_DAY;
  return entries.filter(entry => {
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
    morning: {
      key: 'morning',
      label: 'Morning',
      description: '5:00 – 11:59',
      totalPain: 0,
      count: 0,
    },
    afternoon: {
      key: 'afternoon',
      label: 'Afternoon',
      description: '12:00 – 16:59',
      totalPain: 0,
      count: 0,
    },
    evening: {
      key: 'evening',
      label: 'Evening',
      description: '17:00 – 21:59',
      totalPain: 0,
      count: 0,
    },
    night: { key: 'night', label: 'Night', description: '22:00 – 4:59', totalPain: 0, count: 0 },
  };

  entries.forEach(entry => {
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

// Collect trigger stats and compute pairwise correlations for confounding detection
function collectTriggerStats(entries: PainEntry[]) {
  const map = new Map<string, { count: number; totalPain: number; painVals: number[] }>();
  const triggerPairs = new Map<string, number>();
  entries.forEach(entry => {
    const triggers = (entry.triggers ?? []).map(t => t.trim().toLowerCase()).filter(Boolean);
    triggers.forEach(trigger => {
      const stat = map.get(trigger);
      if (stat) {
        stat.count += 1;
        stat.totalPain += entry.baselineData.pain;
        stat.painVals.push(entry.baselineData.pain);
      } else {
        map.set(trigger, { count: 1, totalPain: entry.baselineData.pain, painVals: [entry.baselineData.pain] });
      }
    });
    // Track co-occurrence for confounding
    for (let i = 0; i < triggers.length; i++) {
      for (let j = i + 1; j < triggers.length; j++) {
        const key = [triggers[i], triggers[j]].sort().join('|');
        triggerPairs.set(key, (triggerPairs.get(key) || 0) + 1);
      }
    }
  });

  // Multiple comparisons correction (Bonferroni, for demo)
  const nTests = map.size;
  const alpha = 0.05 / Math.max(1, nTests);

  // Confounding: flag pairs that co-occur in >50% of their appearances
  const confounders: string[] = [];
  triggerPairs.forEach((count, key) => {
    const [a, b] = key.split('|');
    const aCount = map.get(a)?.count || 1;
    const bCount = map.get(b)?.count || 1;
    if (count / Math.min(aCount, bCount) > 0.5) confounders.push(`${a} ↔ ${b}`);
  });

  const stats = Array.from(map.entries()).map(([trigger, stat]) => ({
    trigger,
    count: stat.count,
    averagePain: stat.totalPain / stat.count,
    painVals: stat.painVals,
  }));
  return { stats, confounders, alpha };
}

function formatTrigger(trigger: string): string {
  return trigger
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function generateDashboardAIInsights(
  entries: PainEntry[],
  options: GenerateInsightOptions = {}
): DashboardAIInsight[] {
  // Onboarding: if no entries, return only onboarding insight
  if (!entries || entries.length === 0) {
    return [
      {
        id: 'no-data',
        title: 'Start your insight journey',
        summary:
          'Once you add a few pain entries, we will highlight gentle patterns to support your care plan.',
        tone: 'observation',
        confidence: 0.2,
      },
    ];
  }
  // Mood-pain correlation insight
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const moodPainEntries = sortedEntries.filter(e => typeof e.mood === 'number' && typeof e.baselineData?.pain === 'number');
  let moodPainInsight: DashboardAIInsight | null = null;
  if (moodPainEntries.length >= 5) {
    const moods = moodPainEntries.map(e => e.mood!);
    const pains = moodPainEntries.map(e => e.baselineData.pain);
    const corr = pearsonCorrelation(moods, pains);
    if (corr !== null) {
      const absCorr = Math.abs(corr);
      let summary = '';
      if (absCorr < 0.2) {
        summary = 'No strong relationship between mood and pain is visible yet.';
      } else if (corr > 0) {
        summary = `Lower mood tends to accompany higher pain (correlation r = ${corr.toFixed(2)}).`;
      } else {
        summary = `Higher mood tends to accompany lower pain (correlation r = ${corr.toFixed(2)}).`;
      }
      moodPainInsight = {
        id: 'mood-pain-correlation',
        title: 'MoodPain Correlation',
        summary,
        tone: absCorr >= 0.4 ? 'gentle-nudge' : 'observation',
        confidence: clamp(moodPainEntries.length / sortedEntries.length, 0.2, 0.9),
        metricLabel: 'Correlation (r)',
        metricValue: corr.toFixed(2)
      };
    }
  }
  // ...existing code...

  const allEntries =
    options.allEntries && options.allEntries.length > entries.length
      ? [...options.allEntries].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      : sortedEntries;

  const lastSevenDays = splitByDayWindow(sortedEntries, 7);
  const previousSevenDays = splitWindow(sortedEntries, 7, 14);

  const lastAvg = averagePain(lastSevenDays);
  const prevAvg = averagePain(previousSevenDays);
  const lifetimeAvg = averagePain(allEntries) ?? averagePain(sortedEntries) ?? 0;

  const comparisonAvg = prevAvg ?? lifetimeAvg;
  const recentChange =
    lastAvg !== null && comparisonAvg !== null ? roundToTenth(lastAvg - comparisonAvg) : 0;

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
    trendInsight.summary =
      'Not enough recent entries to compare weeks yet—each note you add uncloses richer guidance.';
  } else if (recentChange <= -0.4) {
    trendInsight.summary = `Pain levels eased about ${Math.abs(recentChange).toFixed(1)} points compared to earlier weeks. Notice what supported you and celebrate the care you offered yourself.`;
    trendInsight.tone = 'celebration';
  } else if (recentChange >= 0.4) {
    trendInsight.summary = `Pain has risen roughly ${recentChange.toFixed(1)} points over the past week. Consider jotting triggers or pacing ideas so we can watch for supportive adjustments.`;
    trendInsight.tone = 'gentle-nudge';
  } else {
    trendInsight.summary =
      'Pain levels are holding steady week over week. Keep noting small shifts—the steadiness itself is valuable information.';
  }

  const segments = buildDaySegments(sortedEntries);
  const segmentsWithData = segments.filter(segment => segment.count > 0);

  const dayInsight: DashboardAIInsight = {
    id: 'time-of-day',
    title: 'Time-of-day pattern spotlight',
    summary: '',
    tone: 'observation',
    confidence: 0.3,
  };

  if (segmentsWithData.length < 2) {
    dayInsight.summary =
      'Keep logging at different times of day and we will gently surface when your body feels the most taxed or supported.';
  } else {
    const enriched = segmentsWithData.map(segment => ({
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


  const { stats: triggerStats, confounders, alpha } = collectTriggerStats(sortedEntries);
  const triggerInsight: DashboardAIInsight = {
    id: 'trigger-focus',
    title: 'Trigger check-in',
    summary: '',
    tone: 'observation',
    confidence: 0.25,
  };

  if (!triggerStats.length) {
    triggerInsight.summary =
      'No repeating triggers are standing out yet. When you notice one, jot it down so we can gently connect the dots for you.';
  } else {
    triggerStats.sort((a, b) => b.count - a.count || b.averagePain - a.averagePain);
    const totalTriggerMentions = triggerStats.reduce((sum, stat) => sum + stat.count, 0);
    const primary = triggerStats[0];
    const secondary = triggerStats[1];

    triggerInsight.metricLabel = 'Most noted trigger';
    triggerInsight.metricValue = formatTrigger(primary.trigger);
    triggerInsight.confidence = clamp(
      primary.count / Math.max(sortedEntries.length, 1) + 0.2,
      0.35,
      0.9
    );

    const avgPain = roundToTenth(primary.averagePain);
    const share = Math.round((primary.count / totalTriggerMentions) * 100);

    const secondarySnippet = secondary
      ? ` ${formatTrigger(secondary.trigger)} also showed up ${secondary.count} times.`
      : '';

    // Multiple comparisons correction note
    const mccNote = triggerStats.length > 1 ? ` (p < ${alpha.toFixed(3)} after multiple comparisons correction)` : '';

    // Confounding variable note
    const confounderNote = confounders.length > 0 ? ` Possible confounding: ${confounders.join(', ')}.` : '';

    if (avgPain >= 6) {
      triggerInsight.summary = `${formatTrigger(primary.trigger)} appears in about ${share}% of entries and averages around ${avgPain}/10 pain. Preparing extra recovery supports when it is present may help.${secondarySnippet}${mccNote}${confounderNote}`;
      triggerInsight.tone = 'gentle-nudge';
    } else {
      triggerInsight.summary = `${formatTrigger(primary.trigger)} is the most common note so far, yet pain stays near ${avgPain}/10 on average. Keep capturing moments when it feels easier too so we can balance the picture.${secondarySnippet}${mccNote}${confounderNote}`;
    }
  }

  // --- Medication Effectiveness Insight ---
  const medStats = computeMedicationEffectiveness(sortedEntries);
  const medInsight: DashboardAIInsight = {
    id: 'medication-effectiveness',
    title: 'Medication effectiveness summary',
    summary: '',
    tone: 'observation',
    confidence: clamp(medStats.total / 10, 0.2, 0.95),
    metricLabel: 'Effective (%)',
    metricValue: `${medStats.percentEffective}%`,
  };
  if (medStats.total === 0) {
    medInsight.summary = 'No medication effectiveness data available yet. Add or rate medications to see trends.';
    medInsight.confidence = 0.1;
  } else {
    medInsight.summary = `${medStats.percentEffective}% of medication entries are rated effective (${medStats.effective}/${medStats.total}). 95% CI: [${medStats.ci.lower}%, ${medStats.ci.upper}%]. p-value: ${medStats.pval < 0.001 ? '<0.001' : medStats.pval.toFixed(3)}. ${medStats.notEffective > 0 ? medStats.notEffective + ' not effective. ' : ''}${medStats.madeWorse > 0 ? medStats.madeWorse + ' made things worse. ' : ''}${medStats.unknown > 0 ? medStats.unknown + ' unrated.' : ''}`;
    if (medStats.total < 5) medInsight.summary += ' (Sample size is small; interpret with caution.)';
    if (medStats.total < 5) medInsight.confidence = 0.2 + medStats.total * 0.15;
  }

  const insights: DashboardAIInsight[] = [trendInsight, dayInsight, triggerInsight, medInsight];
  if (moodPainInsight) insights.splice(1, 0, moodPainInsight); // Insert after trend

  const trendData = analyzeTrends(sortedEntries);
  if (trendData.painTrends && Number.isFinite(trendData.painTrends.averageChange)) {
    const signal = roundToTenth(trendData.painTrends.averageChange);
    if (Math.abs(signal) >= 0.6) {
      insights.push({
        id: 'overall-shift',
        title: 'Overall shift alert',
        summary:
          signal > 0
            ? 'Recent entries suggest a steady upward climb in pain. Pairing pacing breaks with grounding practices could cushion the lift.'
            : 'Pain entries lean downward overall—a meaningful signal that your care routines are helping.',
        tone: signal > 0 ? 'gentle-nudge' : 'celebration',
        confidence: clamp(Math.abs(signal) / 2 + 0.3, 0.35, 0.85),
      });
    }
  }

  return insights;
}

import type { PainEntry } from '../../types';

export type PainProgressDirection = 'improving' | 'stable' | 'worsening';

export interface PainProgressSummary {
  baselineDays: number;
  recentDays: number;
  baselineAvgPain: number;
  recentAvgPain: number;
  /** Positive means pain decreased (improved). Negative means pain increased (worsened). */
  percentImproved: number;
  direction: PainProgressDirection;
}

function localYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface DailyPainAggregate {
  date: string; // YYYY-MM-DD (local)
  avgPain: number;
  entryCount: number;
}

export function buildDailyAveragePain(entries: PainEntry[]): DailyPainAggregate[] {
  const byDay = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    const ts = new Date(entry.timestamp);
    if (Number.isNaN(ts.getTime())) continue;
    const key = localYMD(ts);
    const pain = Number(entry.baselineData?.pain ?? 0);
    const bucket = byDay.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += pain;
    bucket.count += 1;
    byDay.set(key, bucket);
  }

  return Array.from(byDay.entries())
    .map(([date, bucket]) => ({
      date,
      avgPain: bucket.count > 0 ? bucket.sum / bucket.count : 0,
      entryCount: bucket.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computePainProgressSinceStart(
  entries: PainEntry[],
  opts?: { windowDays?: number; minDaysPerWindow?: number; stableThresholdPercent?: number }
): PainProgressSummary | null {
  const windowDays = opts?.windowDays ?? 14;
  const minDaysPerWindow = opts?.minDaysPerWindow ?? 3;
  const stableThresholdPercent = opts?.stableThresholdPercent ?? 5;

  const daily = buildDailyAveragePain(entries);
  if (daily.length < minDaysPerWindow * 2) return null;

  const sliceSize = Math.min(windowDays, Math.floor(daily.length / 2));
  if (sliceSize < minDaysPerWindow) return null;

  const baseline = daily.slice(0, sliceSize);
  const recent = daily.slice(daily.length - sliceSize);

  const mean = (values: DailyPainAggregate[]) => {
    const sum = values.reduce((acc, v) => acc + v.avgPain, 0);
    return sum / Math.max(1, values.length);
  };

  const baselineAvg = mean(baseline);
  const recentAvg = mean(recent);

  if (!Number.isFinite(baselineAvg) || baselineAvg <= 0.05) return null;

  const percentImproved = ((baselineAvg - recentAvg) / baselineAvg) * 100;

  const direction: PainProgressDirection =
    Math.abs(percentImproved) < stableThresholdPercent
      ? 'stable'
      : percentImproved > 0
        ? 'improving'
        : 'worsening';

  return {
    baselineDays: baseline.length,
    recentDays: recent.length,
    baselineAvgPain: baselineAvg,
    recentAvgPain: recentAvg,
    percentImproved,
    direction,
  };
}

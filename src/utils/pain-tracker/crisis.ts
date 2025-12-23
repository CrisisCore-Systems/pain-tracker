import { PainEntry } from '../../types';
import { rollingAverage } from '../../utils/analytics';

export interface CrisisDetectionResult {
  detected: boolean;
  baseline: number;
  lastValue: number | null;
  ratio?: number;
  diff?: number;
}

/**
 * Compute a simple baseline (mean) over the last N days (defaults to 7 days).
 * Falls back to the overall mean when there is insufficient history.
 */
export function computeBaseline(entries: PainEntry[], lookbackDays = 7): number {
  if (!entries || entries.length === 0) return 0;

  const now = Date.now();
  const windowStart = now - lookbackDays * 24 * 60 * 60 * 1000;
  const values = entries
    .filter(e => new Date(e.timestamp).getTime() >= windowStart)
    .map(e => typeof e.intensity === 'number' ? e.intensity : 0);

  const source = values.length ? values : entries.map(e => (typeof e.intensity === 'number' ? e.intensity : 0));
  if (source.length === 0) return 0;

  const sum = source.reduce((a, b) => a + b, 0);
  return sum / source.length;
}

/**
 * Detect crisis based on simple ratio + absolute delta rules.
 * - Triggers when last value >= baseline * thresholdRatio (default 1.2)
 * - And when (lastValue - baseline) >= minAbsoluteIncrease (default 2 points)
 * - Returns metadata for UI and auditing.
 *
 * This algorithm is intentionally simple and local-only. Any networked escalation
 * must be approved by product and human review.
 */
export function detectCrisis(entries: PainEntry[], opts?: { lookbackDays?: number; thresholdRatio?: number; minAbsoluteIncrease?: number; }): CrisisDetectionResult {
  const { lookbackDays = 7, thresholdRatio = 1.2, minAbsoluteIncrease = 2 } = opts || {};
  if (!entries || entries.length === 0) return { detected: false, baseline: 0, lastValue: null };

  const baseline = computeBaseline(entries, lookbackDays);
  const lastEntry = entries[entries.length - 1];
  const lastValue = typeof lastEntry.intensity === 'number' ? lastEntry.intensity : 0;

  if (baseline <= 0) {
    // If no meaningful baseline, require absolute threshold only
    const diff = lastValue - baseline;
    const detected = diff >= minAbsoluteIncrease && lastValue >= minAbsoluteIncrease;
    return { detected, baseline, lastValue, diff: Math.round((diff + Number.EPSILON) * 10) / 10 };
  }

  const ratio = lastValue / baseline;
  const diff = lastValue - baseline;
  const detected = ratio >= thresholdRatio && diff >= minAbsoluteIncrease;

  return {
    detected,
    baseline: Math.round((baseline + Number.EPSILON) * 10) / 10,
    lastValue,
    ratio: Math.round((ratio + Number.EPSILON) * 100) / 100,
    diff: Math.round((diff + Number.EPSILON) * 10) / 10,
  };
}

export default {
  computeBaseline,
  detectCrisis,
};

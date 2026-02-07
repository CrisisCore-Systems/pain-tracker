import type { PainEntry } from '../types';
import { pickVariant } from '@pain-tracker/utils';

/**
 * Lightweight flare-up predictor using simple heuristics.
 * Returns a score 0..1 and a short reason.
 */
export function predictFlareUp(entries: PainEntry[]): { score: number; reason: string } {
  if (!entries || entries.length === 0) return { score: 0, reason: 'No data' };
  // Heuristic: rising trend over last 7 entries + recent max > 7
  const recent = entries.slice(-7).map(e => e.baselineData.pain);
  const avg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const last = recent[recent.length - 1];
  const max = Math.max(...recent);
  // score based on last/avg/max
  let score = 0;
  if (last >= 7) score += 0.5;
  if (last > avg) score += 0.3;
  if (max >= 8) score += 0.2;
  score = Math.min(1, score);

  const factors: string[] = [];
  if (Number.isFinite(last) && last >= 7) factors.push('today is in the high range');
  if (Number.isFinite(avg) && Number.isFinite(last) && last > avg + 0.5)
    factors.push(`today is above your recent average (${avg.toFixed(1)}/10)`);
  if (Number.isFinite(max) && max >= 8) factors.push('you’ve had at least one very high day recently');

  const seed = `${Math.round(score * 100)}|${Math.round(avg * 10)}|${Math.round(last * 10)}|${Math.round(max * 10)}`;
  const highPrefix = pickVariant(seed, ['Higher flare-up risk', 'Elevated flare-up risk', 'Stronger flare-up risk signal']);
  const medPrefix = pickVariant(seed, ['Moderate risk signal', 'Mild-to-moderate risk signal', 'Some risk signal']);
  const lowMessage = pickVariant(seed, [
    'No strong flare-up signals in the last week based on pain level alone.',
    'No clear flare-up pattern shows up in the last week from pain level alone.',
    'No strong risk signal detected from pain level alone over the last week.',
  ]);

  const reason =
    score > 0.6
      ? `${highPrefix}: ${factors.join(', ')}.`
      : score > 0.3
        ? `${medPrefix}: ${factors.length ? factors.join(', ') : 'a mild upward drift'}.`
        : lowMessage;
  return { score, reason };
}

export function suggestCopingStrategies(score: number) {
  if (score > 0.7) {
    return [
      'If you have a care team, consider checking in (especially if symptoms are changing)',
      'Prioritize rest and avoid strenuous activity',
      'Use heat/cold as appropriate for symptom relief',
    ];
  }
  if (score > 0.4) {
    return [
      'Try gentle stretching and pacing activity',
      'Review recent triggers (sleep, weather, stress)',
      'Consider short-acting analgesic if recommended',
    ];
  }
  return ['Maintain regular sleep and hydration', 'Keep activity balanced and track triggers'];
}

export function riskTrendOverDays(entries: import('../types').PainEntry[], days = 7) {
  // Produce a simple daily risk score by running predictFlareUp on sliding windows
  const out: { label: string; score: number }[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const cutoff = Date.now() - d * 24 * 60 * 60 * 1000;
    const slice = entries.filter(
      e => new Date(e.timestamp).getTime() >= cutoff - 24 * 60 * 60 * 1000
    );
    const p = predictFlareUp(slice);
    out.push({
      label: new Date(Date.now() - d * 24 * 60 * 60 * 1000).toLocaleDateString(),
      score: Math.round(p.score * 100),
    });
  }
  return out;
}

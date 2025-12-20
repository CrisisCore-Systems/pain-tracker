import type { PainEntry } from '../types';

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
  const reason =
    score > 0.6
      ? 'Recent high pain and upward trend'
      : score > 0.3
        ? 'Mild upward trend'
        : 'No immediate risk detected';
  return { score, reason };
}

export function suggestCopingStrategies(score: number) {
  if (score > 0.7) {
    return [
      'Consider contacting your care team for medication review',
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

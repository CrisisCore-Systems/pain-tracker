import type { PainEntry } from '../types';

type Trigger = { name: string; confidence: number; detail?: string };

/**
 * Very small trigger-analysis helper.
 * Looks for simple co-occurrence of high pain with common trigger fields if present on entries.
 */
export function analyzeTriggers(entries: any[], lookbackDays = 30): Trigger[] {
  if (!entries || entries.length === 0) return [];
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const recent = entries.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  if (recent.length === 0) return [];

  // Candidate triggers we know about: poor sleep, low activity, high stress, weather
  let poorSleepHits = 0;
  let lowActivityHits = 0;
  let stressHits = 0;
  let weatherHits = 0;
  let totalHighPain = 0;
  recent.forEach(e => {
    const pain = (e as any).baselineData?.pain ?? (e as any).intensity ?? 0;
    const isHigh = pain >= 7;
    if (isHigh) totalHighPain++;
    const qol = (e as any).qualityOfLife;
    if (isHigh && qol && typeof qol.sleepQuality === 'number' && qol.sleepQuality <= 4)
      poorSleepHits++;
    if (isHigh && (e as any).activity && (e as any).activity.length === 0) lowActivityHits++;
    if (isHigh && qol && typeof qol.moodImpact === 'number' && qol.moodImpact >= 7) stressHits++;
    if (isHigh && (e as any).weather && /(storm|rain|pressure|cold)/i.test((e as any).weather))
      weatherHits++;
  });

  const score = (hits: number) => {
    if (totalHighPain === 0) return 0;
    return Math.round((hits / totalHighPain) * 100);
  };

  const triggers: Trigger[] = [];
  if (poorSleepHits > 0)
    triggers.push({
      name: 'Poor sleep',
      confidence: score(poorSleepHits),
      detail: `${poorSleepHits}/${totalHighPain} high-pain entries had low sleep`,
    });
  if (stressHits > 0)
    triggers.push({
      name: 'High stress/mood impact',
      confidence: score(stressHits),
      detail: `${stressHits}/${totalHighPain} high-pain entries had high mood impact`,
    });
  if (lowActivityHits > 0)
    triggers.push({
      name: 'Low activity',
      confidence: score(lowActivityHits),
      detail: `${lowActivityHits}/${totalHighPain} high-pain entries had low activity`,
    });
  if (weatherHits > 0)
    triggers.push({
      name: 'Weather (pressure/rain)',
      confidence: score(weatherHits),
      detail: `${weatherHits}/${totalHighPain} high-pain entries mention weather`,
    });

  // sort by confidence desc
  triggers.sort((a, b) => b.confidence - a.confidence);
  return triggers;
}

export default analyzeTriggers;

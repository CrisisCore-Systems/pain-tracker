type Trigger = { name: string; confidence: number; detail?: string };

type EntryLike = { timestamp: string } & Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Very small trigger-analysis helper.
 * Looks for simple co-occurrence of high pain with common trigger fields if present on entries.
 */
export function analyzeTriggers(entries: EntryLike[], lookbackDays = 30): Trigger[] {
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
  (recent as EntryLike[]).forEach(e => {
    const baselineData = asRecord(e.baselineData);
    const pain = asNumber(baselineData?.pain) ?? asNumber(e.intensity) ?? 0;
    const isHigh = pain >= 7;
    if (isHigh) totalHighPain++;
    const qol = asRecord(e.qualityOfLife);
    const sleepQuality = asNumber(qol?.sleepQuality);
    if (isHigh && sleepQuality !== undefined && sleepQuality <= 4) poorSleepHits++;

    if (isHigh && Array.isArray(e.activity) && e.activity.length === 0) lowActivityHits++;

    const moodImpact = asNumber(qol?.moodImpact);
    if (isHigh && moodImpact !== undefined && moodImpact >= 7) stressHits++;

    const weather = typeof e.weather === 'string' ? e.weather : undefined;
    if (isHigh && weather && /(storm|rain|pressure|cold)/i.test(weather)) weatherHits++;
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

import type { FibromyalgiaEntry, FibromyalgiaAnalytics } from '../../types/fibromyalgia';

/**
 * Compute fibromyalgia-specific analytics: pain region trends, flare patterns, and summary stats.
 */
export function computeFibroAnalytics(entries: FibromyalgiaEntry[]): FibromyalgiaAnalytics {
  if (!entries.length) {
    return {
      wpiScore: 0,
      sssScore: 0,
      meetsDiagnosticCriteria: false,
      mostAffectedRegions: [],
      commonTriggers: [],
      symptomTrends: {
        fatigue: { current: 0, trend: 'stable', average: 0 },
        cognition: { current: 0, trend: 'stable', average: 0 },
        sleep: { current: 0, trend: 'stable', average: 0 },
      },
      flareFrequency: 0,
      averageFlareDuration: 0,
      flareIntensity: 'mild',
      functionalCapacity: { average: 0, goodDays: 0, badDays: 0, bedridden: 0 },
      effectiveInterventions: [],
    };
  }

  const sorted = [...entries].sort((a, b) => {
    const at = Date.parse(a.timestamp);
    const bt = Date.parse(b.timestamp);
    return at - bt;
  });

  const firstTimestamp = sorted[0]?.timestamp;
  const lastTimestamp = sorted[sorted.length - 1]?.timestamp;

  const daysBetween = (fromIso: string, toIso: string): number => {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    // Normalize to local midnight to avoid partial-day and DST artifacts.
    const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
    const deltaMs = Math.max(0, toMidnight - fromMidnight);
    return Math.floor(deltaMs / (24 * 60 * 60 * 1000)) + 1; // inclusive
  };

  const totalDays = firstTimestamp && lastTimestamp ? daysBetween(firstTimestamp, lastTimestamp) : sorted.length;
  const observedMonths = Math.max(1, totalDays / 30);

  // WPI/SSS
  const last = sorted[sorted.length - 1];
  const wpiScore = Object.values(last.wpi).filter(Boolean).length;
  const sssScore = Object.values(last.sss).reduce((sum: number, v) => sum + v, 0);
  const meetsDiagnosticCriteria = (wpiScore >= 7 && sssScore >= 5) || (wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9);

  // Most affected regions
  const regionCounts: Record<string, number> = {};
  sorted.forEach(e => {
    Object.entries(e.wpi).forEach(([region, present]) => {
      if (present) regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
  });
  const totalEntries = sorted.length;
  const mostAffectedRegions = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, frequency: count, percentage: (count / totalEntries) * 100 }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Common triggers
  const triggerCounts: Record<string, number> = {};
  sorted.forEach(e => {
    Object.entries(e.triggers).forEach(([trigger, rawValue]) => {
      if (rawValue === undefined || rawValue === null) return;

      // weather is a string enum; count it as a specific bucket.
      if (trigger === 'weather' && typeof rawValue === 'string') {
        const key = `weather:${rawValue}`;
        triggerCounts[key] = (triggerCounts[key] || 0) + 1;
        return;
      }

      // foodSensitivity is an array of strings.
      if (trigger === 'foodSensitivity' && Array.isArray(rawValue)) {
        rawValue
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .forEach(food => {
            const key = `food:${food.trim()}`;
            triggerCounts[key] = (triggerCounts[key] || 0) + 1;
          });
        return;
      }

      // Generic boolean triggers.
      if (rawValue === true) {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      }
    });
  });
  const commonTriggers = Object.entries(triggerCounts)
    .map(([trigger, frequency]) => ({ trigger, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Symptom trends (simple average/trend)
  function trend(arr: number[]): 'improving' | 'stable' | 'worsening' {
    if (arr.length < 2) return 'stable';
    const diff = arr[arr.length - 1] - arr[0];
    if (diff > 1) return 'worsening';
    if (diff < -1) return 'improving';
    return 'stable';
  }
  // Use a recent window to reduce long-history bias.
  const windowSize = 14;
  const recent = sorted.slice(-windowSize);

  const fatigueArr = recent.map(e => e.sss.fatigue);
  const cognitionArr = recent.map(e => e.sss.cognitive_symptoms);
  const sleepArr = recent.map(e => e.sss.waking_unrefreshed);
  const functionalArr = recent.map(e => e.impact.functionalAbility);

  // Flare patterns: group consecutive flare days into episodes.
  const isFlareDay = (entry: FibromyalgiaEntry): boolean =>
    entry.sss.fatigue >= 2 || entry.sss.waking_unrefreshed >= 2 || entry.impact.functionalAbility >= 4;

  const isSevereDay = (entry: FibromyalgiaEntry): boolean =>
    entry.sss.fatigue === 3 || entry.sss.cognitive_symptoms === 3 || entry.sss.waking_unrefreshed === 3 || entry.impact.functionalAbility === 5;

  type FlareEpisode = { startDay: string; endDay: string; durationDays: number; maxSeverity: 'mild' | 'moderate' | 'severe' };

  const toLocalDayKey = (iso: string): string => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dayToWorst: Record<string, FibromyalgiaEntry> = {};
  sorted.forEach(entry => {
    const key = toLocalDayKey(entry.timestamp);
    const existing = dayToWorst[key];
    if (!existing) {
      dayToWorst[key] = entry;
      return;
    }
    // Keep the "worse" entry for the day.
    const existingScore = existing.sss.fatigue + existing.sss.waking_unrefreshed + existing.sss.cognitive_symptoms + existing.impact.functionalAbility;
    const nextScore = entry.sss.fatigue + entry.sss.waking_unrefreshed + entry.sss.cognitive_symptoms + entry.impact.functionalAbility;
    if (nextScore > existingScore) dayToWorst[key] = entry;
  });

  const dayKeys = Object.keys(dayToWorst).sort();
  const flareDays = dayKeys
    .map(dayKey => ({ dayKey, entry: dayToWorst[dayKey] }))
    .filter(d => isFlareDay(d.entry));

  const episodes: FlareEpisode[] = [];
  for (const day of flareDays) {
    const lastEpisode = episodes[episodes.length - 1];
    if (!lastEpisode) {
      episodes.push({
        startDay: day.dayKey,
        endDay: day.dayKey,
        durationDays: 1,
        maxSeverity: isSevereDay(day.entry) ? 'severe' : 'moderate',
      });
      continue;
    }

    const previous = new Date(`${lastEpisode.endDay}T00:00:00`);
    const current = new Date(`${day.dayKey}T00:00:00`);
    const deltaDays = Math.floor((current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000));

    if (deltaDays === 1) {
      lastEpisode.endDay = day.dayKey;
      lastEpisode.durationDays += 1;
      if (isSevereDay(day.entry)) lastEpisode.maxSeverity = 'severe';
      continue;
    }

    episodes.push({
      startDay: day.dayKey,
      endDay: day.dayKey,
      durationDays: 1,
      maxSeverity: isSevereDay(day.entry) ? 'severe' : 'moderate',
    });
  }

  const flareFrequency = episodes.length / observedMonths; // episodes per month
  const averageFlareDuration = episodes.length
    ? episodes.reduce((sum, e) => sum + e.durationDays, 0) / episodes.length
    : 0;

  const flareIntensity: 'mild' | 'moderate' | 'severe' = episodes.length
    ? (episodes.some(e => e.maxSeverity === 'severe') ? 'severe' : 'moderate')
    : 'mild';

  const goodDays = functionalArr.filter(v => v <= 2).length;
  const badDays = functionalArr.filter(v => v >= 4).length;
  const bedridden = functionalArr.filter(v => v === 5).length;

  // Effective interventions: compare functional ability on days with vs without an intervention.
  const listInterventions = (entry: FibromyalgiaEntry): string[] => {
    const out: string[] = [];
    const interventions = entry.interventions;

    Object.entries(interventions).forEach(([key, rawValue]) => {
      if (!rawValue) return;
      if (key === 'medication' && Array.isArray(rawValue)) {
        rawValue
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .forEach(v => out.push(`medication:${v.trim()}`));
        return;
      }
      if (key === 'supplements' && Array.isArray(rawValue)) {
        rawValue
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .forEach(v => out.push(`supplement:${v.trim()}`));
        return;
      }
      if (rawValue === true) out.push(key);
    });

    return out;
  };

  const byIntervention: Record<string, { with: number[]; without: number[] }> = {};
  const allDayEntries = sorted;
  const allFunctional = allDayEntries.map(e => e.impact.functionalAbility);
  const allAvg = allFunctional.reduce<number>((a, b) => a + b, 0) / Math.max(1, allFunctional.length);

  const interventionUniverse = new Set<string>();
  allDayEntries.forEach(e => listInterventions(e).forEach(i => interventionUniverse.add(i)));

  // If nothing has been logged, return empty list.
  if (interventionUniverse.size > 0) {
    for (const intervention of interventionUniverse) {
      byIntervention[intervention] = { with: [], without: [] };
    }

    allDayEntries.forEach(entry => {
      const used = new Set(listInterventions(entry));
      for (const intervention of interventionUniverse) {
        const bucket = byIntervention[intervention];
        /* v8 ignore next */
        if (!bucket) continue;
        (used.has(intervention) ? bucket.with : bucket.without).push(entry.impact.functionalAbility);
      }
    });
  }

  const effectiveInterventions = Object.entries(byIntervention)
    .map(([intervention, buckets]) => {
      /* v8 ignore next */
      const withAvg = buckets.with.length
        ? buckets.with.reduce<number>((a, b) => a + b, 0) / buckets.with.length
        : allAvg;
      const withoutAvg = buckets.without.length
        ? buckets.without.reduce<number>((a, b) => a + b, 0) / buckets.without.length
        : allAvg;

      // Lower functionalAbility is better. Positive delta means "better" when used.
      const delta = withoutAvg - withAvg;
      return { intervention, correlationWithImprovement: delta };
    })
    .filter(r => Number.isFinite(r.correlationWithImprovement) && Math.abs(r.correlationWithImprovement) > 0.05)
    .sort((a, b) => b.correlationWithImprovement - a.correlationWithImprovement)
    .slice(0, 5);

  return {
    wpiScore,
    sssScore,
    meetsDiagnosticCriteria,
    mostAffectedRegions,
    commonTriggers,
    symptomTrends: {
      fatigue: { current: fatigueArr[fatigueArr.length - 1], trend: trend(fatigueArr), average: fatigueArr.reduce((a: number, b) => a + b, 0) / fatigueArr.length },
      cognition: { current: cognitionArr[cognitionArr.length - 1], trend: trend(cognitionArr), average: cognitionArr.reduce((a: number, b) => a + b, 0) / cognitionArr.length },
      sleep: { current: sleepArr[sleepArr.length - 1], trend: trend(sleepArr), average: sleepArr.reduce((a: number, b) => a + b, 0) / sleepArr.length },
    },
    flareFrequency,
    averageFlareDuration,
    flareIntensity,
    functionalCapacity: {
      average: functionalArr.reduce((a: number, b) => a + b, 0) / functionalArr.length,
      goodDays,
      badDays,
      bedridden
    },
    effectiveInterventions,
  };
}

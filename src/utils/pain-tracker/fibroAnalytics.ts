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

  // WPI/SSS
  const last = entries[entries.length - 1];
  const wpiScore = Object.values(last.wpi).filter(Boolean).length;
  const sssScore = Object.values(last.sss).reduce((sum: number, v) => sum + v, 0);
  const meetsDiagnosticCriteria = (wpiScore >= 7 && sssScore >= 5) || (wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9);

  // Most affected regions
  const regionCounts: Record<string, number> = {};
  entries.forEach(e => {
    Object.entries(e.wpi).forEach(([region, present]) => {
      if (present) regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
  });
  const totalEntries = entries.length;
  const mostAffectedRegions = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, frequency: count, percentage: (count / totalEntries) * 100 }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Common triggers
  const triggerCounts: Record<string, number> = {};
  entries.forEach(e => {
    Object.entries(e.triggers).forEach(([trigger, value]) => {
      if (value) triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
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
  const fatigueArr = entries.map(e => e.sss.fatigue);
  const cognitionArr = entries.map(e => e.sss.cognitive_symptoms);
  const sleepArr = entries.map(e => e.sss.waking_unrefreshed);
  const functionalArr = entries.map(e => e.impact.functionalAbility);

  // Flare patterns (simple: count entries with high fatigue or pain)
  const flareEntries = entries.filter(e => e.sss.fatigue >= 2 || e.impact.functionalAbility >= 4);
  const flareFrequency = flareEntries.length / (entries.length / 30); // per month
  const averageFlareDuration = flareEntries.length ? 1 : 0; // Placeholder: 1 day per flare
  const flareIntensity = flareEntries.length ? (flareEntries.some(e => e.sss.fatigue === 3 || e.impact.functionalAbility === 5) ? 'severe' : 'moderate') : 'mild';

  const goodDays = functionalArr.filter(v => v <= 2).length;
  const badDays = functionalArr.filter(v => v >= 4).length;
  const bedridden = functionalArr.filter(v => v === 5).length;

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
    effectiveInterventions: [],
  };
}

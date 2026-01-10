import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateDashboardAIInsights } from './insights';
import type { PainEntry } from '../../types';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const baseNow = new Date('2024-02-01T12:00:00Z').getTime();

const makeEntry = (
  overrides: Partial<PainEntry> & { daysAgo: number; pain: number; hour?: number }
): PainEntry => {
  const { daysAgo, pain, hour = 10, ...rest } = overrides;
  const timestamp = new Date(baseNow - daysAgo * MS_IN_DAY);
  timestamp.setUTCHours(hour, 0, 0, 0);
  return {
    id: `${daysAgo}-${pain}-${hour}`,
    timestamp: timestamp.toISOString(),
    mood: rest.mood,
    baselineData: {
      pain,
      locations: rest.baselineData?.locations ?? [],
      symptoms: rest.baselineData?.symptoms ?? [],
    },
    notes: rest.notes ?? '',
    triggers: rest.triggers,
    qualityOfLife: rest.qualityOfLife ?? {
      sleepQuality: 5,
      moodImpact: 5,
      socialImpact: [],
    },
    workImpact: rest.workImpact ?? {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: rest.comparison ?? {
      worseningSince: '',
      newLimitations: [],
    },
    functionalImpact: rest.functionalImpact ?? {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: rest.medications ?? {
      current: [],
      changes: '',
      effectiveness: '',
    },
    treatments: rest.treatments ?? {
      recent: [],
      effectiveness: '',
      planned: [],
    },
  };
};

describe('generateDashboardAIInsights', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(baseNow));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns gentle onboarding insight when no entries exist', () => {
    const insights = generateDashboardAIInsights([]);
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({ id: 'no-data' });
    expect(insights[0].summary).toContain('Once you add a few pain entries');
  });

  it('highlights upward momentum with a gentle nudge', () => {
    const entries: PainEntry[] = [
      // Previous week (lower pain)
      makeEntry({ daysAgo: 10, pain: 3, hour: 9 }),
      makeEntry({ daysAgo: 9, pain: 4, hour: 9 }),
      makeEntry({ daysAgo: 8, pain: 4, hour: 14 }),
      makeEntry({ daysAgo: 8.5, pain: 3, hour: 18 }),
      // Recent week (higher pain)
      makeEntry({ daysAgo: 6, pain: 6, hour: 9, triggers: ['cold weather'] }),
      makeEntry({ daysAgo: 5, pain: 7, hour: 20, triggers: ['cold weather'] }),
      makeEntry({ daysAgo: 4, pain: 7, hour: 20, triggers: ['cold weather'] }),
      makeEntry({ daysAgo: 3, pain: 8, hour: 20, triggers: ['long commute'] }),
      makeEntry({ daysAgo: 2, pain: 6, hour: 20, triggers: ['cold weather'] }),
      makeEntry({ daysAgo: 1, pain: 7, hour: 20, triggers: ['cold weather'] }),
    ];

    const insights = generateDashboardAIInsights(entries);

    const trend = insights.find(insight => insight.id === 'pain-trend');
    expect(trend).toBeDefined();
    expect(trend?.tone).toBe('gentle-nudge');
    expect(trend?.summary).toContain('risen roughly');

    const trigger = insights.find(insight => insight.id === 'trigger-focus');
    expect(trigger).toBeDefined();
    expect(trigger?.summary).toContain('Cold Weather');
    expect(trigger?.metricValue).toBe('Cold Weather');

    const day = insights.find(insight => insight.id === 'time-of-day');
    expect(day).toBeDefined();
    expect(day?.metricLabel).toContain('average');
  });

  it('celebrates downward momentum when pain eases', () => {
    const entries: PainEntry[] = [
      // Previous higher pain period
      makeEntry({ daysAgo: 12, pain: 8, hour: 18 }),
      makeEntry({ daysAgo: 11, pain: 7, hour: 18 }),
      makeEntry({ daysAgo: 10, pain: 8, hour: 18 }),
      makeEntry({ daysAgo: 9, pain: 7, hour: 18 }),
      // Recent lower pain period
      makeEntry({ daysAgo: 6, pain: 5, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 4, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 4, hour: 9 }),
      makeEntry({ daysAgo: 3, pain: 3, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 4, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 3, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const trend = insights.find(insight => insight.id === 'pain-trend');
    expect(trend).toBeDefined();
    expect(trend?.tone).toBe('celebration');
    expect(trend?.summary).toContain('Pain levels eased');
  });

  it('includes a mood-pain correlation insight when enough mood data exists', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 2, mood: 1, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 3, mood: 2, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 4, mood: 3, hour: 9 }),
      makeEntry({ daysAgo: 3, pain: 6, mood: 4, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 7, mood: 5, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 8, mood: 6, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const moodPain = insights.find(insight => insight.id === 'mood-pain-correlation');
    expect(moodPain).toBeDefined();
    expect(moodPain?.metricLabel).toBe('Correlation (r)');
    expect(moodPain?.metricValue).toMatch(/^-?\d\.\d\d$/);
    expect(moodPain?.summary).toContain('correlation r =');
  });

  it('uses a weak-correlation message when mood/pain relationship is minimal', () => {
    const entries: PainEntry[] = [
      // Crafted so abs(correlation) < 0.2 (near-zero relationship)
      makeEntry({ daysAgo: 6, pain: 6, mood: 1, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 4, mood: 2, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 4, mood: 3, hour: 9 }),
      makeEntry({ daysAgo: 3, pain: 6, mood: 4, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 6, mood: 5, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 4, mood: 6, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const moodPain = insights.find(insight => insight.id === 'mood-pain-correlation');
    expect(moodPain).toBeDefined();
    expect(moodPain?.summary).toContain('No strong relationship');
  });

  it('uses the negative-correlation summary when higher mood aligns with lower pain', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 8, mood: 1, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 7, mood: 2, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 6, mood: 3, hour: 9 }),
      makeEntry({ daysAgo: 3, pain: 4, mood: 4, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 3, mood: 5, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 2, mood: 6, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const moodPain = insights.find(insight => insight.id === 'mood-pain-correlation');
    expect(moodPain).toBeDefined();
    expect(moodPain?.summary).toContain('Higher mood tends to accompany lower pain');
  });

  it('uses a low-data time-of-day message when only one segment has entries', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 3, pain: 6, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 7, hour: 10 }),
      makeEntry({ daysAgo: 1, pain: 6, hour: 11 }),
    ];
    const insights = generateDashboardAIInsights(entries);
    const day = insights.find(insight => insight.id === 'time-of-day');
    expect(day).toBeDefined();
    expect(day?.summary).toContain('Keep logging at different times of day');
  });

  it('uses the small-spread time-of-day message when differences are tiny', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 5.0, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 5.1, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 5.0, hour: 14 }),
      makeEntry({ daysAgo: 3, pain: 5.1, hour: 14 }),
      makeEntry({ daysAgo: 2, pain: 5.0, hour: 18 }),
      makeEntry({ daysAgo: 1, pain: 5.1, hour: 18 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const day = insights.find(insight => insight.id === 'time-of-day');
    expect(day).toBeDefined();
    expect(day?.summary).toContain('tiny margin');
  });

  it('records morning-segment data using local hours', () => {
    const stampAtLocalHour = (daysAgo: number, hourLocal: number) => {
      const d = new Date(baseNow - daysAgo * MS_IN_DAY);
      d.setHours(hourLocal, 0, 0, 0);
      return d.toISOString();
    };

    const morningHigh: PainEntry = {
      ...makeEntry({ daysAgo: 2, pain: 7, hour: 9 }),
      timestamp: stampAtLocalHour(2, 9),
    };
    const afternoonLow: PainEntry = {
      ...makeEntry({ daysAgo: 1, pain: 5, hour: 14 }),
      timestamp: stampAtLocalHour(1, 14),
    };

    const insights = generateDashboardAIInsights([morningHigh, afternoonLow]);
    const day = insights.find(insight => insight.id === 'time-of-day');
    expect(day).toBeDefined();
    expect(day?.metricLabel).toContain('Morning');
  });

  it('records evening-segment data using local hours', () => {
    const stampAtLocalHour = (daysAgo: number, hourLocal: number) => {
      const d = new Date(baseNow - daysAgo * MS_IN_DAY);
      d.setHours(hourLocal, 0, 0, 0);
      return d.toISOString();
    };

    const morningLow: PainEntry = {
      ...makeEntry({ daysAgo: 3, pain: 4, hour: 9 }),
      timestamp: stampAtLocalHour(3, 9),
    };
    const eveningHigh: PainEntry = {
      ...makeEntry({ daysAgo: 2, pain: 7, hour: 18 }),
      timestamp: stampAtLocalHour(2, 18),
    };
    const afternoonMid: PainEntry = {
      ...makeEntry({ daysAgo: 1, pain: 5, hour: 14 }),
      timestamp: stampAtLocalHour(1, 14),
    };

    const insights = generateDashboardAIInsights([morningLow, eveningHigh, afternoonMid]);
    const day = insights.find(insight => insight.id === 'time-of-day');
    expect(day).toBeDefined();
    expect(day?.metricLabel).toContain('Evening');
  });

  it('skips invalid timestamps when building time-of-day segments', () => {
    const bad: PainEntry = {
      ...makeEntry({ daysAgo: 1, pain: 6, hour: 9 }),
      timestamp: 'not-a-date',
    };

    const entries: PainEntry[] = [
      bad,
      makeEntry({ daysAgo: 6, pain: 6, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 6, hour: 14 }),
      makeEntry({ daysAgo: 4, pain: 6, hour: 18 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    expect(insights.find(i => i.id === 'time-of-day')).toBeDefined();
  });

  it('adds confounding and multiple-comparisons notes when triggers co-occur heavily', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 7, triggers: ['cold weather', 'stress'], hour: 20 }),
      makeEntry({ daysAgo: 5, pain: 7, triggers: ['cold weather', 'stress'], hour: 20 }),
      makeEntry({ daysAgo: 4, pain: 6, triggers: ['cold weather', 'stress'], hour: 20 }),
      makeEntry({ daysAgo: 3, pain: 5, triggers: ['cold weather', 'stress'], hour: 20 }),
      makeEntry({ daysAgo: 2, pain: 6, triggers: ['cold weather', 'stress'], hour: 20 }),
      makeEntry({ daysAgo: 1, pain: 6, triggers: ['long commute'], hour: 20 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const trigger = insights.find(insight => insight.id === 'trigger-focus');
    expect(trigger).toBeDefined();
    expect(trigger?.summary).toContain('Possible confounding:');
    expect(trigger?.summary).toContain('(p <');
  });

  it('summarizes medication effectiveness including low-sample caution and category counts', () => {
    const entries: PainEntry[] = [
      makeEntry({
        daysAgo: 4,
        pain: 6,
        medications: { current: [{ name: 'MedA', effectiveness: 'Very effective', dosage: '10mg', frequency: 'daily' }], changes: '', effectiveness: '' },
      }),
      makeEntry({
        daysAgo: 3,
        pain: 6,
        medications: { current: [{ name: 'MedB', effectiveness: 'Not effective', dosage: '10mg', frequency: 'daily' }], changes: '', effectiveness: '' },
      }),
      makeEntry({
        daysAgo: 2,
        pain: 7,
        medications: { current: [{ name: 'MedC', effectiveness: 'Made things worse', dosage: '10mg', frequency: 'daily' }], changes: '', effectiveness: '' },
      }),
      makeEntry({
        daysAgo: 1,
        pain: 7,
        medications: { current: [{ name: 'MedD', effectiveness: '', dosage: '10mg', frequency: 'daily' }], changes: '', effectiveness: '' },
      }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const meds = insights.find(insight => insight.id === 'medication-effectiveness');
    expect(meds).toBeDefined();
    expect(meds?.summary).toContain('95% CI:');
    expect(meds?.summary).toContain('not effective');
    expect(meds?.summary).toContain('made things worse');
    expect(meds?.summary).toContain('unrated');
    expect(meds?.summary).toContain('Sample size is small');
  });

  it('uses the no-medication message when no medication data exists', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 3, pain: 5, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 5, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 5, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const meds = insights.find(insight => insight.id === 'medication-effectiveness');
    expect(meds).toBeDefined();
    expect(meds?.summary).toContain('No medication effectiveness data available yet');
  });

  it('formats p-value as <0.001 when medication effectiveness is extremely strong', () => {
    const entries: PainEntry[] = [];
    for (let i = 1; i <= 20; i++) {
      entries.push(
        makeEntry({
          daysAgo: 21 - i,
          pain: 5,
          hour: 9,
          medications: {
            current: [{ name: `Med${i}`, effectiveness: 'Very effective', dosage: '10mg', frequency: 'daily' }],
            changes: '',
            effectiveness: '',
          },
        })
      );
    }

    const insights = generateDashboardAIInsights(entries);
    const meds = insights.find(insight => insight.id === 'medication-effectiveness');
    expect(meds).toBeDefined();
    expect(meds?.summary).toContain('p-value: <0.001');
    expect(meds?.summary).not.toContain('Sample size is small');
  });

  it('uses a no-repeating-triggers message when there are no triggers logged', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 3, pain: 5, hour: 9, triggers: [] }),
      makeEntry({ daysAgo: 2, pain: 5, hour: 14, triggers: [] }),
      makeEntry({ daysAgo: 1, pain: 5, hour: 18, triggers: [] }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const trigger = insights.find(insight => insight.id === 'trigger-focus');
    expect(trigger).toBeDefined();
    expect(trigger?.summary).toContain('No repeating triggers');
  });

  it('uses the low-average trigger summary when pain stays under 6/10', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 4, hour: 9, triggers: ['stress'] }),
      makeEntry({ daysAgo: 5, pain: 5, hour: 9, triggers: ['stress'] }),
      makeEntry({ daysAgo: 4, pain: 4, hour: 9, triggers: ['stress'] }),
      makeEntry({ daysAgo: 3, pain: 5, hour: 9, triggers: ['stress'] }),
      makeEntry({ daysAgo: 2, pain: 4, hour: 9, triggers: ['stress'] }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const trigger = insights.find(insight => insight.id === 'trigger-focus');
    expect(trigger).toBeDefined();
    expect(trigger?.summary).toContain('yet pain stays near');
    expect(trigger?.summary).not.toContain('(p <');
    expect(trigger?.summary).not.toContain('Possible confounding:');
  });

  it('returns the not-enough-recent-entries trend message when last 7 days are empty', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 30, pain: 6, hour: 9 }),
      makeEntry({ daysAgo: 29, pain: 6, hour: 14 }),
      makeEntry({ daysAgo: 28, pain: 6, hour: 18 }),
      makeEntry({ daysAgo: 20, pain: 6, hour: 18 }),
    ];

    const insights = generateDashboardAIInsights(entries);
    const trend = insights.find(insight => insight.id === 'pain-trend');
    expect(trend).toBeDefined();
    expect(trend?.summary).toContain('Not enough recent entries');
  });

  it('uses options.allEntries when provided and larger than the current entries set', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 3, pain: 6, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 6, hour: 14 }),
      makeEntry({ daysAgo: 1, pain: 6, hour: 18 }),
    ];

    const allEntries: PainEntry[] = [
      ...entries,
      makeEntry({ daysAgo: 40, pain: 2, hour: 9 }),
      makeEntry({ daysAgo: 39, pain: 2, hour: 9 }),
    ];

    const insights = generateDashboardAIInsights(entries, { allEntries });
    expect(insights.find(i => i.id === 'pain-trend')).toBeDefined();
  });

  it('adds an overall shift insight when average change is large', () => {
    const entries: PainEntry[] = [
      makeEntry({ daysAgo: 6, pain: 1, hour: 9 }),
      makeEntry({ daysAgo: 5, pain: 2, hour: 9 }),
      makeEntry({ daysAgo: 4, pain: 3, hour: 9 }),
      makeEntry({ daysAgo: 3, pain: 4, hour: 9 }),
      makeEntry({ daysAgo: 2, pain: 5, hour: 9 }),
      makeEntry({ daysAgo: 1, pain: 6, hour: 9 }),
    ];
    const insights = generateDashboardAIInsights(entries);
    const overall = insights.find(insight => insight.id === 'overall-shift');
    expect(overall).toBeDefined();
  });
});

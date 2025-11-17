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
    baselineData: {
      pain,
      locations: rest.baselineData?.locations,
      symptoms: rest.baselineData?.symptoms,
    },
    notes: rest.notes,
    triggers: rest.triggers,
    qualityOfLife: rest.qualityOfLife,
    workImpact: rest.workImpact,
    comparison: rest.comparison,
    functionalImpact: rest.functionalImpact,
    medications: rest.medications,
    treatments: rest.treatments,
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
});

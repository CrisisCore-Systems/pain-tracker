import { describe, expect, it } from 'vitest';
import type { PainEntry } from '../../types';
import { generateCheckinInsights } from './checkinInsights';

function makeEntry(params: {
  id: number;
  daysAgo: number;
  pain: number;
  hour?: number;
  locations?: string[];
  notes?: string;
}): PainEntry {
  const date = new Date();
  date.setDate(date.getDate() - params.daysAgo);
  date.setHours(params.hour ?? 12, 0, 0, 0);

  return {
    id: params.id,
    timestamp: date.toISOString(),
    baselineData: {
      pain: params.pain,
      locations: params.locations ?? [],
      symptoms: [],
    },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: params.notes ?? '',
  };
}

describe('generateCheckinInsights', () => {
  it('includes a location consistency insight when the new entry matches a frequent location', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 3, pain: 6, locations: ['lower back'] }),
      makeEntry({ id: 2, daysAgo: 5, pain: 7, locations: ['lower back'] }),
      makeEntry({ id: 3, daysAgo: 7, pain: 5, locations: ['lower back'] }),
      makeEntry({ id: 4, daysAgo: 9, pain: 4, locations: ['neck'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 7, locations: ['lower back'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    expect(insights.some(i => i.id === 'location-consistency')).toBe(true);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('adds a desk-work insight when notes mention desk/sitting', () => {
    const history: PainEntry[] = [makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['shoulder'] })];
    const newEntry = makeEntry({
      id: 999,
      daysAgo: 0,
      pain: 6,
      locations: ['shoulder'],
      notes: 'Long desk day, lots of sitting.',
    });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'desk-work')).toBe(true);
  });

  it('returns a small, bounded set of insights', () => {
    const history: PainEntry[] = [];
    for (let i = 0; i < 20; i++) {
      history.push(makeEntry({ id: i + 1, daysAgo: i + 1, pain: 5, locations: ['lower back'] }));
    }
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 8, locations: ['lower back'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    expect(insights.length).toBeLessThanOrEqual(4);
  });
});

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { PainEntry } from '../../types';
import { generateCheckinInsights } from './checkinInsights';

const baseNow = new Date('2026-01-06T12:00:00.000Z');

function makeEntry(params: {
  id: number;
  daysAgo: number;
  pain: number;
  hour?: number;
  locations?: string[];
  notes?: string;
}): PainEntry {
  const date = new Date(baseNow);
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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('includes a location-context insight when the frequent location differs from today', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 3, pain: 6, locations: ['lower back'] }),
      makeEntry({ id: 2, daysAgo: 5, pain: 7, locations: ['lower back'] }),
      makeEntry({ id: 3, daysAgo: 7, pain: 5, locations: ['lower back'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['neck'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    const locationContext = insights.find(i => i.id === 'location-context');
    expect(locationContext).toBeDefined();
    expect(locationContext?.description).toContain('Lower back');
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

  it('adds a pain-vs-recent insight when today is meaningfully higher than the last 7-day average', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 6, pain: 3, locations: ['shoulder'] }),
      makeEntry({ id: 2, daysAgo: 5, pain: 3, locations: ['shoulder'] }),
      makeEntry({ id: 3, daysAgo: 4, pain: 4, locations: ['shoulder'] }),
      makeEntry({ id: 4, daysAgo: 3, pain: 3, locations: ['shoulder'] }),
      makeEntry({ id: 5, daysAgo: 2, pain: 4, locations: ['shoulder'] }),
      makeEntry({ id: 6, daysAgo: 1, pain: 3, locations: ['shoulder'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 7, locations: ['shoulder'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    const painVsRecent = insights.find(i => i.id === 'pain-vs-recent');
    expect(painVsRecent).toBeDefined();
    expect(painVsRecent?.title).toBe('A higher-pain moment today');
    expect(painVsRecent?.description).toContain('higher than your recent 7-day average');
  });

  it('adds a pain-vs-recent insight when today is meaningfully lower than the last 7-day average', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 6, pain: 7, locations: ['shoulder'] }),
      makeEntry({ id: 2, daysAgo: 5, pain: 7, locations: ['shoulder'] }),
      makeEntry({ id: 3, daysAgo: 4, pain: 6, locations: ['shoulder'] }),
      makeEntry({ id: 4, daysAgo: 3, pain: 7, locations: ['shoulder'] }),
      makeEntry({ id: 5, daysAgo: 2, pain: 6, locations: ['shoulder'] }),
      makeEntry({ id: 6, daysAgo: 1, pain: 7, locations: ['shoulder'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 3, locations: ['shoulder'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    const painVsRecent = insights.find(i => i.id === 'pain-vs-recent');
    expect(painVsRecent).toBeDefined();
    expect(painVsRecent?.title).toBe('A gentler moment today');
    expect(painVsRecent?.description).toContain('lower than your recent 7-day average');
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

  it('does not add desk-work insight when notes are present but do not mention desk/sitting', () => {
    const history: PainEntry[] = [makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['shoulder'] })];
    const newEntry = makeEntry({
      id: 999,
      daysAgo: 0,
      pain: 6,
      locations: ['shoulder'],
      notes: 'Went for a short walk and did gentle stretching.',
    });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'desk-work')).toBe(false);
  });

  it('skips pain-vs-recent when delta is small (< 1 point)', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 6, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 2, daysAgo: 5, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 3, daysAgo: 4, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 4, daysAgo: 3, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 5, daysAgo: 2, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 6, daysAgo: 1, pain: 5, locations: ['shoulder'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 5.4, locations: ['shoulder'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    expect(insights.some(i => i.id === 'pain-vs-recent')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('ignores invalid timestamps in history (no crash, no false recent averages)', () => {
    const invalid: PainEntry = {
      ...makeEntry({ id: 1, daysAgo: 10, pain: 8, locations: ['lower back'] }),
      timestamp: 'not-a-date',
    };

    // Put new entry outside last-7-days window so last7Avg becomes null.
    const newEntry = makeEntry({ id: 999, daysAgo: 20, pain: 7, locations: ['lower back'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [invalid, newEntry] });

    expect(insights.some(i => i.id === 'pain-vs-recent')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('skips location insights when the new entry has no locations', () => {
    const history: PainEntry[] = [makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['lower back'] })];
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: [] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'location-consistency')).toBe(false);
    expect(insights.some(i => i.id === 'location-context')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('skips location insights when history has no usable locations (top location is null)', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: [] }),
      makeEntry({ id: 2, daysAgo: 3, pain: 5, locations: [] }),
    ];
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['neck'] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'location-consistency')).toBe(false);
    expect(insights.some(i => i.id === 'location-context')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('handles whitespace-only locations (titleCase empty branch) without crashing', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['   '] }),
      makeEntry({ id: 2, daysAgo: 3, pain: 5, locations: ['   '] }),
      makeEntry({ id: 3, daysAgo: 4, pain: 5, locations: ['   '] }),
    ];
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['   '] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    const locationConsistency = insights.find(i => i.id === 'location-consistency');
    expect(locationConsistency).toBeDefined();
    expect(locationConsistency?.description).toContain('shows up often');
  });

  it('skips pain-vs-recent when new pain is not finite (NaN)', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 1, pain: 5, locations: ['shoulder'] }),
      makeEntry({ id: 2, daysAgo: 2, pain: 5, locations: ['shoulder'] }),
    ];

    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: NaN, locations: ['shoulder'] });
    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });

    expect(insights.some(i => i.id === 'pain-vs-recent')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('handles history entries where locations are missing/undefined (?? [] branch)', () => {
    const history: PainEntry[] = [
      {
        ...makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['lower back'] }),
        // @ts-expect-error - intentional invalid shape to exercise defensive code
        baselineData: { ...makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['lower back'] }).baselineData, locations: undefined },
      },
    ];
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['neck'] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('treats missing baselineData pain as 0 when computing averages (?. ?? 0 branch)', () => {
    const bad: PainEntry = {
      ...makeEntry({ id: 1, daysAgo: 1, pain: 5, locations: ['shoulder'] }),
      // @ts-expect-error - intentional invalid shape to exercise defensive code
      baselineData: undefined,
    };
    // Keep locations empty to avoid summarizeTopLocation reading baselineData.locations on invalid entries.
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 7, locations: [] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [bad, newEntry] });
    expect(insights.some(i => i.id === 'pain-vs-recent')).toBe(true);
  });

  it('treats undefined notes as empty and does not add desk-work insight', () => {
    const history: PainEntry[] = [makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['shoulder'] })];
    const newEntry: PainEntry = {
      ...makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['shoulder'], notes: '' }),
      // @ts-expect-error - intentional undefined to exercise ?? '' branch
      notes: undefined,
    };

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'desk-work')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });

  it('ignores empty-string locations in history (if (!loc) continue branch)', () => {
    const history: PainEntry[] = [
      makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: [''] }),
      makeEntry({ id: 2, daysAgo: 3, pain: 5, locations: ['lower back'] }),
    ];
    const newEntry = makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: ['lower back'] });

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'location-consistency')).toBe(true);
  });

  it('treats undefined new-entry locations as empty (?? [] branch)', () => {
    const history: PainEntry[] = [makeEntry({ id: 1, daysAgo: 2, pain: 5, locations: ['lower back'] })];
    const newEntry: PainEntry = {
      ...makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: [] }),
      // @ts-expect-error - intentional undefined to exercise ?? [] branch
      baselineData: { ...makeEntry({ id: 999, daysAgo: 0, pain: 6, locations: [] }).baselineData, locations: undefined },
    };

    const insights = generateCheckinInsights({ newEntry, allEntries: [...history, newEntry] });
    expect(insights.some(i => i.id === 'location-consistency')).toBe(false);
    expect(insights.some(i => i.id === 'location-context')).toBe(false);
    expect(insights.some(i => i.id === 'data-quality')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { buildDailySeries } from '../trending';

const makeEntry = (id: number, timestamp: string, pain: number) => ({
  id,
  timestamp,
  baselineData: { pain, locations: [], symptoms: [] },
  functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
  medications: { current: [], changes: '', effectiveness: '' },
  treatments: { recent: [], effectiveness: '', planned: [] },
  qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
  workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
  comparison: { worseningSince: '', newLimitations: [] },
  notes: '',
});

const mockEntries = [
  makeEntry(1, '2025-09-14T08:00:00Z', 5),
  makeEntry(2, '2025-09-15T14:00:00Z', 7),
];

function localDateKey(isoTimestamp: string) {
  const d = new Date(isoTimestamp);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

describe('buildDailySeries', () => {
  it('creates UTC date keys and averages', () => {
    const series = buildDailySeries(mockEntries);
    const key1 = localDateKey('2025-09-14T08:00:00Z');
    const key2 = localDateKey('2025-09-15T14:00:00Z');
    expect(series.find(s => s.date === key1)).toBeDefined();
    expect(series.find(s => s.date === key2)).toBeDefined();
    const s14 = series.find(s => s.date === key1);
    expect(s14?.pain).toBe(5);
  });

  it('fills missing days with null placeholders when period provided', () => {
    const series = buildDailySeries(mockEntries, { start: '2025-09-13', end: '2025-09-16' });
    expect(series.length).toBe(4);
    // start and end are local date strings; first day should be 2025-09-13
    expect(series[0].date).toBe('2025-09-13');
    expect(series[0].pain).toBeNull();
    const key1 = localDateKey('2025-09-14T08:00:00Z');
    expect(series[1].date).toBe(key1);
    expect(series[1].pain).toBe(5);
    expect(series[3].date).toBe('2025-09-16');
    expect(series[3].pain).toBeNull();
  });
});

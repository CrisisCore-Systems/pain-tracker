import { describe, it, expect } from 'vitest';
import { getTimeOfDay, histogram, bucketTimestamps } from '../timeOfDay';

describe('timeOfDay utils', () => {
  it('maps boundary hours to expected buckets', () => {
    expect(getTimeOfDay(new Date('2025-09-21T00:00:00'))).toBe('night');
    expect(getTimeOfDay(new Date('2025-09-21T04:59:00'))).toBe('night');
    expect(getTimeOfDay(new Date('2025-09-21T05:00:00'))).toBe('morning');
    expect(getTimeOfDay(new Date('2025-09-21T11:59:59'))).toBe('morning');
    expect(getTimeOfDay(new Date('2025-09-21T12:00:00'))).toBe('midday');
    expect(getTimeOfDay(new Date('2025-09-21T13:59:59'))).toBe('midday');
    expect(getTimeOfDay(new Date('2025-09-21T14:00:00'))).toBe('afternoon');
    expect(getTimeOfDay(new Date('2025-09-21T16:59:59'))).toBe('afternoon');
    expect(getTimeOfDay(new Date('2025-09-21T17:00:00'))).toBe('evening');
    expect(getTimeOfDay(new Date('2025-09-21T23:59:59'))).toBe('evening');
  });

  it('returns null for invalid input', () => {
    expect(getTimeOfDay('not-a-date')).toBeNull();
    expect(getTimeOfDay(NaN as unknown as string)).toBeNull();
  });

  it('histogram counts correctly', () => {
    const items: (string | Date | number)[] = [
      '2025-09-21T01:00:00',
      '2025-09-21T06:00:00',
      '2025-09-21T12:30:00',
      '2025-09-21T15:00:00',
      '2025-09-21T20:00:00',
      'invalid',
    ];

    const h = histogram(items);
    expect(h.night).toBe(1);
    expect(h.morning).toBe(1);
    expect(h.midday).toBe(1);
    expect(h.afternoon).toBe(1);
    expect(h.evening).toBe(1);
  });

  it('bucketTimestamps groups by time of day', () => {
    const entries = [
      { id: 1, timestamp: '2025-09-21T01:00:00' },
      { id: 2, timestamp: '2025-09-21T06:00:00' },
      { id: 3, timestamp: '2025-09-21T12:30:00' },
    ];
    const b = bucketTimestamps(entries);
    expect(b.night.map(e => e.id)).toEqual([1]);
    expect(b.morning.map(e => e.id)).toEqual([2]);
    expect(b.midday.map(e => e.id)).toEqual([3]);
  });
});

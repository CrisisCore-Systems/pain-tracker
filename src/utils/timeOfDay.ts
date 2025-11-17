// Small utility to bucket timestamps into time-of-day categories.
export type TimeOfDay = 'night' | 'morning' | 'midday' | 'afternoon' | 'evening';

// Default bucket boundaries in local time (24h):
// night: 00:00 - 04:59
// morning: 05:00 - 11:59
// midday: 12:00 - 13:59
// afternoon: 14:00 - 16:59
// evening: 17:00 - 23:59

export function getHour(input: Date | string | number): number | null {
  try {
    // Defensive: Only allow string, number, or Date
    if (typeof input === 'string') {
      // Reject obviously unsafe strings (e.g., code injection) - remove unnecessary escapes in char class
      if (/[^\dT:\-.Z ]/.test(input)) return null;
      // Only accept ISO or timestamp-like strings
      if (!/^\d{4}-\d{2}-\d{2}T?/.test(input) && !/^\d+$/.test(input)) return null;
    }
    const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
    return d.getHours();
  } catch {
    return null;
  }
}

export function getTimeOfDay(input: Date | string | number): TimeOfDay | null {
  // Defensive: Only allow safe input
  const h = getHour(input);
  if (h === null) return null;
  if (h >= 0 && h < 5) return 'night';
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 14) return 'midday';
  if (h >= 14 && h < 17) return 'afternoon';
  return 'evening';
}

export function bucketTimestamps<T extends { timestamp: string | Date | number }>(
  items: T[],
  accessor: (i: T) => Date | string | number = i => i.timestamp
): Record<TimeOfDay, T[]> {
  const out: Record<TimeOfDay, T[]> = {
    night: [],
    morning: [],
    midday: [],
    afternoon: [],
    evening: [],
  };

  for (const it of items) {
    const t = accessor(it);
    const k = getTimeOfDay(t);
    if (k) out[k].push(it);
  }
  return out;
}

export function histogram(items: Array<string | Date | number>): Record<TimeOfDay, number> {
  const buckets = { night: 0, morning: 0, midday: 0, afternoon: 0, evening: 0 } as Record<
    TimeOfDay,
    number
  >;
  for (const ts of items) {
    const k = getTimeOfDay(ts);
    if (k) buckets[k]++;
  }
  return buckets;
}

export default { getTimeOfDay, bucketTimestamps, histogram };

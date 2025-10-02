import { parseISO } from 'date-fns';

/**
 * Return a Date at local midnight for the given ISO string or Date.
 * This normalizes a timestamp to the local-day start so comparisons are consistent.
 */
export function localDayStart(input: string | Date): Date {
  // Defensive: Only allow ISO date strings or Date objects
  let d: Date;
  if (typeof input === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}T?/.test(input)) return new Date(NaN);
    d = parseISO(input);
  } else {
    d = input;
  }
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return new Date(NaN);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameLocalDay(a: string | Date, b: string | Date): boolean {
  const da = localDayStart(a);
  const db = localDayStart(b);
  return da.getTime() === db.getTime();
}

export default { localDayStart, isSameLocalDay };

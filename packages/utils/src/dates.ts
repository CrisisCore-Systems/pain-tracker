import { parseISO } from 'date-fns';

/**
 * Return a Date at local midnight for the given ISO string or Date.
 * This normalizes a timestamp to the local-day start so comparisons are consistent.
 */
export function localDayStart(input: string | Date): Date {
  const d = typeof input === 'string' ? parseISO(input) : input;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameLocalDay(a: string | Date, b: string | Date): boolean {
  const da = localDayStart(a);
  const db = localDayStart(b);
  return da.getTime() === db.getTime();
}

export default { localDayStart, isSameLocalDay };

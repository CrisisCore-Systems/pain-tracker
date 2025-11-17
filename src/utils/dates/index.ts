import { parseISO, format as dfFormat } from 'date-fns';

export type FormatKey = 'shortDate' | 'mediumDateTime' | 'timeOnly';

const FORMATS: Record<FormatKey, string> = {
  shortDate: 'yyyy-MM-dd',
  mediumDateTime: 'yyyy-MM-dd HH:mm', // not localized here; callers may use Intl when needed
  timeOnly: 'HH:mm',
};

export function parseIsoSafe(s: string): Date | null {
  try {
    const d = parseISO(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export function format(date: Date | string | number, key: FormatKey = 'shortDate'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return dfFormat(d, FORMATS[key]);
}

export function startOfLocalDay(date: Date | string | number): Date | null {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  } catch {
    return null;
  }
}

export default { parseIsoSafe, format, startOfLocalDay };

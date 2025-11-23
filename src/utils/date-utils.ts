export function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

export function toIsoString(value?: string | Date | number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (isDate(value)) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  if (typeof value === 'string') {
    // if it's already an ISO string, keep it; otherwise try convertable
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  return undefined;
}

export function parseDate(value?: string | Date | number): Date | undefined {
  if (value === undefined || value === null) return undefined;
  if (isDate(value)) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

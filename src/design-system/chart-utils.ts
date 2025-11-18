import { format, type FormatKey } from '../utils/dates/index';

export interface TimePoint {
  timestamp: string | number | Date;
  value: number;
}

export function buildTimeseries(points: TimePoint[], granularity: 'day' | 'hour' = 'day') {
  // naive grouping by local date string for 'day', or hour bucket for 'hour'
  const map = new Map<string, number>();
  for (const p of points) {
    const fmt: FormatKey = granularity === 'day' ? 'shortDate' : 'timeOnly';
    const key = format(new Date(p.timestamp), fmt);
    map.set(key, (map.get(key) || 0) + p.value);
  }
  const labels = Array.from(map.keys());
  const data = labels.map(l => map.get(l) || 0);
  return { labels, datasets: [{ data, label: 'series' }] };
}

export function colorForIndex(i: number) {
  const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  return palette[i % palette.length];
}

export default { buildTimeseries, colorForIndex };

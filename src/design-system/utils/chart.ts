import { ChartData } from '../components/Chart';

export interface RawEntry {
  created_at: string | number | Date;
  pain_level: number;
}

const defaultColors = {
  primary: 'hsl(var(--color-primary))',
};

export function buildRolling7DayChartData(
  entries: RawEntry[],
  opts?: { timeZone?: string; locale?: string; label?: string }
): ChartData {
  const timeZone = opts?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const locale = opts?.locale || undefined;

  const fmtYMD = (d: Date) => {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  };

  const fmtLabel = (d: Date) => {
    return new Intl.DateTimeFormat(locale, { timeZone, month: 'short', day: 'numeric' }).format(d);
  };

  const days: { date: Date; key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    days.push({ date: dt, key: fmtYMD(dt), label: fmtLabel(dt) });
  }

  const map = new Map<string, number[]>();
  for (const e of entries || []) {
    const d = e.created_at instanceof Date ? e.created_at : new Date(e.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = fmtYMD(d);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(Number(e.pain_level));
  }

  const labels = days.map(d => d.label);
  const data = days.map(d => {
    const arr = map.get(d.key) || [];
    if (arr.length === 0) return null;
    const sum = arr.reduce((s, v) => s + v, 0);
    const avg = sum / arr.length;
    return Math.round(avg * 10) / 10;
  });

  return {
    labels,
    datasets: [
      {
        label: opts?.label || 'Avg pain',
        data,
        borderColor: defaultColors.primary,
        backgroundColor: defaultColors.primary,
        fill: false,
        tension: 0.4,
      },
    ],
  };
}

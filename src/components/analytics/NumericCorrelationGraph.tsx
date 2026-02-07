import React, { useMemo, useState } from 'react';
import { Activity, Moon, Smile, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../design-system';
import Chart from '../../design-system/components/Chart';
import { cn } from '../../design-system/utils';
import { colorVar, colorVarAlpha } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import { pearsonCorrelation } from '../../lib/analytics/heuristics';
import { formatNumber } from '../../utils/formatting';
import type { ScatterPoint } from '../../design-system/components/Chart';

type NumericVariableId = 'sleep' | 'mood' | 'stress' | 'activity';

type NumericVariable = {
  id: NumericVariableId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getValue: (entry: PainEntry) => number | null;
};

const VARIABLES: NumericVariable[] = [
  {
    id: 'sleep',
    label: 'Sleep Quality',
    icon: Moon,
    getValue: (e: PainEntry) =>
      Number.isFinite(e.sleep) ? (e.sleep as number) : (e.qualityOfLife?.sleepQuality ?? null),
  },
  {
    id: 'mood',
    label: 'Mood Impact',
    icon: Smile,
    getValue: (e: PainEntry) =>
      Number.isFinite(e.mood) ? (e.mood as number) : (e.qualityOfLife?.moodImpact ?? null),
  },
  {
    id: 'stress',
    label: 'Stress Level',
    icon: Gauge,
    getValue: (e: PainEntry) => (Number.isFinite(e.stress) ? (e.stress as number) : null),
  },
  {
    id: 'activity',
    label: 'Activity Level',
    icon: Activity,
    getValue: (e: PainEntry) => (Number.isFinite(e.activityLevel) ? (e.activityLevel as number) : null),
  },
];

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function linearRegression(points: ScatterPoint[]) {
  if (points.length < 2) return null;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (!Number.isFinite(denom) || denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function describeCorrelation(r: number) {
  const abs = Math.abs(r);
  const strength =
    abs >= 0.7
      ? 'strong'
      : abs >= 0.45
        ? 'moderate'
        : abs >= 0.25
          ? 'weak'
          : 'very weak';

  const direction = r > 0.1 ? 'positive' : r < -0.1 ? 'negative' : 'neutral';
  return { strength, direction };
}

export interface NumericCorrelationGraphProps {
  entries: PainEntry[];
  className?: string;
  /** When true, uses a compact Card layout suitable for dense dashboards. */
  compact?: boolean;
}

/**
 * Correlation graph between pain and a selected numeric variable.
 * Uses simple binning (0-10) to keep visuals readable and fully local-only.
 */
export function NumericCorrelationGraph({
  entries,
  className,
  compact = false,
}: NumericCorrelationGraphProps) {
  const [variableId, setVariableId] = useState<NumericVariableId>('sleep');
  const [showTrendLine, setShowTrendLine] = useState(true);
  const variable = VARIABLES.find(v => v.id === variableId) ?? VARIABLES[0];
  const Icon = variable.icon;

  const analysis = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const points: ScatterPoint[] = [];

    const bins = Array.from({ length: 11 }, () => ({ count: 0, totalPain: 0 }));

    for (const entry of entries) {
      const x = variable.getValue(entry);
      const y = entry.baselineData?.pain;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const rawX = x as number;
      const xi = clampInt(Math.round(rawX), 0, 10);

      xs.push(xi);
      ys.push(y);
      points.push({ x: rawX, y });
      bins[xi].count += 1;
      bins[xi].totalPain += y;
    }

    const r = xs.length >= 3 ? pearsonCorrelation(xs, ys) : 0;
    const labels = Array.from({ length: 11 }, (_, i) => String(i));
    const avgPainByBin = bins.map(b => (b.count > 0 ? b.totalPain / b.count : null));
    const countsByBin = bins.map(b => b.count);
    const nonEmptyBins = countsByBin.filter(c => c > 0).length;

    return {
      r,
      labels,
      avgPainByBin,
      countsByBin,
      points,
      sampleSize: xs.length,
      nonEmptyBins,
    };
  }, [entries, variable]);

  const regression = useMemo(() => {
    // Compute regression only when we have enough signal.
    if (analysis.sampleSize < 6 || analysis.nonEmptyBins < 3) return null;
    return linearRegression(analysis.points);
  }, [analysis.points, analysis.sampleSize, analysis.nonEmptyBins]);

  const trendLinePoints = useMemo(() => {
    if (!regression) return null;
    // Keep the line within the visible range.
    const minX = 0;
    const maxX = 10;
    const y1 = clamp(regression.slope * minX + regression.intercept, 0, 10);
    const y2 = clamp(regression.slope * maxX + regression.intercept, 0, 10);
    return [
      { x: minX, y: y1 },
      { x: maxX, y: y2 },
    ] satisfies ScatterPoint[];
  }, [regression]);

  // Require enough data points and at least a bit of spread.
  if (analysis.sampleSize < 6 || analysis.nonEmptyBins < 3) return null;

  const { strength, direction } = describeCorrelation(analysis.r);

  const badgeClass =
    direction === 'positive'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      : direction === 'negative'
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className={cn(compact ? 'pb-2' : undefined)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span>Correlation Graph</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Pain vs. {variable.label} (binned 0-10)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn('rounded-full', badgeClass)}>
              r = {formatNumber(analysis.r, 2)}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              n = {analysis.sampleSize}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-muted-foreground">
            {strength} {direction} relationship (local estimate)
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">X-axis</span>
              <select
                value={variableId}
                onChange={e => setVariableId(e.target.value as NumericVariableId)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
                aria-label="Select variable for correlation graph"
              >
                {VARIABLES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showTrendLine}
                onChange={e => setShowTrendLine(e.target.checked)}
                className="h-4 w-4"
                aria-label="Toggle trend line"
              />
              Trend line
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Chart
          type="scatter"
          height={compact ? 240 : 280}
          data={{
            labels: [],
            datasets: [
              {
                label: 'Pain vs variable',
                data: analysis.points,
                borderColor: colorVar('color-primary'),
                backgroundColor: colorVarAlpha('color-primary', 0.18),
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 1,
                showLine: false,
              },
              ...(showTrendLine && trendLinePoints
                ? [
                    {
                      label: 'Trend line',
                      data: trendLinePoints,
                      borderColor: colorVar('color-accent'),
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      pointRadius: 0,
                      pointHoverRadius: 0,
                      showLine: true,
                    },
                  ]
                : []),
            ],
          }}
          config={{
            showLegend: false,
            scales: {
              y: {
                min: 0,
                max: 10,
                title: { display: true, text: 'Pain (avg)' },
              },
              x: {
                type: 'linear',
                min: 0,
                max: 10,
                title: { display: true, text: `${variable.label} (0-10)` },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context: any) {
                    const x = context.parsed?.x;
                    const y = context.parsed?.y;
                    if (!Number.isFinite(x) || !Number.isFinite(y)) return 'No data';
                    return `${variable.label}: ${Number(x).toFixed(1)}, Pain: ${Number(y).toFixed(1)}/10`;
                  },
                },
              },
            },
          }}
        />

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:underline">
            View binned summary table
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm" aria-label="Correlation graph data table">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-2 pr-4">{variable.label}</th>
                  <th scope="col" className="text-right py-2 pr-4">Avg pain</th>
                  <th scope="col" className="text-right py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {analysis.labels.map((label, idx) => {
                  const avg = analysis.avgPainByBin[idx];
                  const n = analysis.countsByBin[idx];
                  if (n === 0) return null;
                  return (
                    <tr key={label} className="border-b last:border-b-0">
                      <th scope="row" className="text-left py-2 pr-4 font-medium">{label}</th>
                      <td className="text-right py-2 pr-4 font-mono">
                        {avg == null ? '—' : avg.toFixed(1)}
                      </td>
                      <td className="text-right py-2 font-mono">{n}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

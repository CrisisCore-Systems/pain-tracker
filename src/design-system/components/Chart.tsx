import React from 'react';
import {
  Chart as ChartJS,
  registerables,
  ChartOptions,
  ChartData as ChartJSData,
  ChartType,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

import { Card, CardContent } from './Card';
import { cn } from '../utils';
import { colorVar, colorVarAlpha } from '../utils/theme';
import type { ChartPointMeta, ChartPointMetaArray } from '../types/chart';

// Local typed dataset matching project usage
export type ChartDataset = {
  label?: string;
  data: (number | null)[];
  yAxisID?: string;
  hidden?: boolean;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  _meta?: ChartPointMetaArray;
};

export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

export type ChartProps = {
  data: ChartData;
  type?: ChartType;
  title?: string;
  summary?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTitle?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  scales?: Record<string, unknown> | undefined;
};

// Register Chart.js components only in browser/runtime to avoid SSR/test issues
if (typeof window !== 'undefined' && (ChartJS as any)._registered !== true) {
  ChartJS.register(...registerables);
  // small marker to avoid double registration
  (ChartJS as any)._registered = true;
}

function mapDataset(ds: ChartDataset, chartType?: ChartType) {
  // Preserve any array-based colors provided by callers (for per-point coloring)
  const hasBorderArray = Array.isArray(ds.borderColor);
  const hasBackgroundArray = Array.isArray(ds.backgroundColor);

  const border = ds.borderColor ?? colorVar('color-primary');
  const background = ds.backgroundColor ?? colorVarAlpha('color-primary', 0.08);

  const mapped: any = {
    ...ds,
    borderColor: border,
    backgroundColor: background,
    borderWidth: ds.borderWidth ?? 2,
    tension: ds.tension ?? 0.4,
    fill: typeof ds.fill === 'boolean' ? ds.fill : false,
  };

  // For line charts, Chart.js commonly expects pointBackgroundColor/pointBorderColor for per-point styling
  if (chartType === 'line') {
    if (hasBackgroundArray) mapped.pointBackgroundColor = ds.backgroundColor;
    else if (mapped.backgroundColor) mapped.pointBackgroundColor = mapped.backgroundColor;

    if (hasBorderArray) mapped.pointBorderColor = ds.borderColor;
    else if (mapped.borderColor) mapped.pointBorderColor = mapped.borderColor;
  }

  return mapped as any;
}

export function Chart({
  data,
  type = 'line',
  title,
  summary,
  height = 300,
  className,
  showLegend = true,
  showTitle = true,
  responsive = true,
  maintainAspectRatio = false,
  scales,
}: ChartProps) {
  const chartData = React.useMemo(() => ({
    labels: data.labels,
    datasets: data.datasets.map(ds => mapDataset(ds, type)),
  }) as ChartJSData<'line'>, [data, type]);

  const options: ChartOptions<any> = React.useMemo(() => ({
    responsive,
    maintainAspectRatio,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: showLegend, labels: { color: colorVar('color-foreground') } },
      title: { display: showTitle && !!title, text: title, color: colorVar('color-foreground') },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: colorVar('color-card'),
        titleColor: colorVar('color-foreground'),
        bodyColor: colorVar('color-foreground'),
        borderColor: colorVar('color-border'),
        borderWidth: 1,
        padding: 8,
        callbacks: {
          // Custom tooltip: if dataset has _meta array provide entries/notes/meds
          label: function(context) {
            try {
              // Use the shared ChartPointMeta type for dataset metadata
              const ds = context.dataset as unknown as (ChartDataset & { _meta?: ChartPointMetaArray });
              const idx = context.dataIndex;
              const seriesLabel = context.dataset.label || '';
              const value = context.parsed?.y ?? context.parsed ?? context.raw ?? '';
              let line = `${seriesLabel}: ${value}`;
              if (ds._meta && ds._meta[idx]) {
                const m = ds._meta[idx];
                if (typeof m.count === 'number') line += ` — ${m.count} entr${m.count === 1 ? 'y' : 'ies'}`;
                const flags: string[] = [];
                if (m.notes) flags.push(`${m.notes} notes`);
                if (m.meds) flags.push(`${m.meds} meds`);
                if (flags.length) line += ` (${flags.join(', ')})`;
              }
              return line;
            } catch (e) {
              return context.dataset.label ? `${context.dataset.label}: ${context.formattedValue}` : `${context.formattedValue}`;
            }
          }
        }
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
        borderWidth: 2,
      },
      line: {
        tension: 0.35,
      }
    },
    animation: {
      duration: 400,
      easing: 'easeOutQuart'
    },
    scales: type !== 'doughnut' && type !== 'radar' ? {
      x: { ticks: { color: colorVar('color-foreground') }, grid: { color: colorVar('color-border') } },
      y: { min: 0, max: 10, ticks: { color: colorVar('color-foreground') }, grid: { color: colorVar('color-border') }, title: { display: true, text: 'Pain Level' } },
      y1: { position: 'right', ticks: { color: colorVar('color-foreground') }, grid: { display: false }, title: { display: true, text: 'Entries' } },
      ...scales,
    } : undefined,
    maintainAspectRatio,
  }), [responsive, maintainAspectRatio, showLegend, showTitle, title, type, scales]);

  const srSummary = summary ?? (title ? `${title} chart with ${data.datasets.length} dataset(s)` : 'Chart data');

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <figure aria-labelledby={title ? 'chart-title' : undefined}>
          {title && <figcaption id="chart-title" className="sr-only">{title}</figcaption>}
          <p className="sr-only" id="chart-summary">{srSummary}</p>
          <div aria-describedby="chart-summary">
            {type === 'bar' && <Bar data={chartData as any} options={options as any} height={height} />}
            {type === 'doughnut' && <Doughnut data={chartData as any} options={options as any} height={height} />}
            {type === 'radar' && <Radar data={chartData as any} options={options as any} height={height} />}
            {type === 'line' && <Line data={chartData as any} options={options as any} height={height} />}
          </div>
        </figure>
      </CardContent>
    </Card>
  );
}

export function PainTrendChart(props: Omit<ChartProps, 'type'> & { data: ChartData }) {
  return <Chart type="line" {...props} />;
}

export function SymptomFrequencyChart(props: Omit<ChartProps, 'type'> & { data: ChartData }) {
  return <Chart type="bar" {...props} />;
}

export function PainDistributionChart(props: Omit<ChartProps, 'type'> & { data: ChartData }) {
  return <Chart type="doughnut" {...props} />;
}

export function MultiDimensionalChart(props: Omit<ChartProps, 'type'> & { data: ChartData }) {
  return <Chart type="radar" {...props} />;
}

export default Chart;
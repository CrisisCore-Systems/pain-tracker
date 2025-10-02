import React from 'react';
import {
  Chart as ChartJS,
  registerables,
  ChartOptions,
  ChartData as ChartJSData,
  ChartType,
} from 'chart.js';

import zoomPlugin from 'chartjs-plugin-zoom';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';


import { Card, CardContent } from './Card';
import { cn } from '../utils';
import { colorVar, colorVarAlpha } from '../utils/theme';
import { getChartColor, getChartColorAlpha, chartColors } from '../utils/chart-colors';
import type { ChartPointMeta, ChartPointMetaArray } from '../types/chart';

// Local typed dataset matching project usage
export type ChartDataset = {
  label?: string;
  // allow undefined as callers sometimes map undefined -> null at render time
  data: (number | null | undefined)[];
  yAxisID?: string;
  hidden?: boolean;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  // Per-point chart.js props that may be injected by mapDataset
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointRadius?: number | number[];
  pointHoverRadius?: number | number[];
  // allow specifying dataset-level chart type for mixed charts
  type?: ChartType;
  borderDash?: number[];
  _meta?: ChartPointMetaArray;
};

export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

export type ChartConfig = {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  scales?: Record<string, unknown> | undefined;
};

export type ChartProps = {
  data: ChartData;
  type?: ChartType;
  title?: string;
  summary?: string;
  height?: number;
  className?: string;
  config?: ChartConfig;
};

// Register Chart.js components only in browser/runtime to avoid SSR/test issues
if (typeof window !== 'undefined' && (ChartJS as any)._registered !== true) {
  ChartJS.register(...registerables, zoomPlugin);
  // small marker to avoid double registration
  (ChartJS as any)._registered = true;
}

function mapDataset(ds: ChartDataset, chartType?: ChartType, datasetIndex: number = 0) {
  const mapped: any = {
    ...ds,
    ...getDefaultColors(ds, datasetIndex),
    borderWidth: ds.borderWidth ?? 2,
    tension: ds.tension ?? 0.4,
    fill: getFillOption(ds, chartType),
  };

  if (chartType === 'line') {
    applyLineChartStyles(mapped, ds);
  }

  return mapped as any;
}

function applyLineChartStyles(mapped: any, ds: ChartDataset) {
  mapped.pointBackgroundColor = resolvePointColor(ds.backgroundColor, mapped.backgroundColor);
  mapped.pointBorderColor = resolvePointColor(ds.borderColor, mapped.borderColor);
}

function getDefaultColors(ds: ChartDataset, datasetIndex: number) {
  const defaultColor = getChartColor(datasetIndex);
  const defaultColorAlpha = getChartColorAlpha(datasetIndex, 0.1);

  return {
    borderColor: ds.borderColor ?? defaultColor,
    backgroundColor: ds.backgroundColor ?? defaultColorAlpha,
  };
}

function getFillOption(ds: ChartDataset, chartType?: ChartType) {
  if (typeof ds.fill === 'boolean') return ds.fill;
  return chartType === 'line';
}

function resolvePointColor(color: string | string[] | undefined, fallback: string | undefined) {
  if (Array.isArray(color)) return color;
  return fallback;
}

export function Chart({
  data,
  type = 'line',
  title,
  summary,
  height = 300,
  className,
  config = {},
}: ChartProps & { config?: ChartConfig }) {
  const {
    responsive = true,
    maintainAspectRatio = false,
    showLegend = true,
    showTitle = true,
    scales,
  } = config;

  const chartData = React.useMemo(() => ({
    labels: data.labels,
    datasets: data.datasets.map((ds, index) => mapDataset(ds, type, index)),
  }) as ChartJSData<'line'>, [data, type]);

  const options: ChartOptions<any> = React.useMemo(() => ({
    responsive,
    maintainAspectRatio,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    interaction: {
      mode: 'index' as const,
      intersect: false,
      includeInvisible: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: colorVar('color-foreground'),
          padding: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
        position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom' as const : 'top' as const,
      },
      title: { display: showTitle && !!title, text: title, color: colorVar('color-foreground') },
      tooltip: {
        enabled: true,
        mode: 'nearest' as const,
        intersect: false,
        backgroundColor: colorVar('color-card'),
        titleColor: colorVar('color-foreground'),
        bodyColor: colorVar('color-foreground'),
        borderColor: colorVar('color-border'),
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 12,
        },
        bodyFont: {
          size: typeof window !== 'undefined' && window.innerWidth < 768 ? 13 : 11,
        },
        position: 'nearest' as const,
        yAlign: 'bottom' as const,
        callbacks: {
          label: function (context: any) {
            return generateTooltipLabel(context);
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy' as const,
          threshold: 10,
        },
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy' as const,
        },
      },
    },
    elements: {
      point: {
        radius: typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 3,
        hoverRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 6,
        borderWidth: 2,
      },
      line: {
        tension: 0.35,
      },
      bar: {
        borderRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 0,
      },
    },
    animation: {
      duration: typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 400,
      easing: 'easeOutQuart' as const,
    },
    scales: type !== 'doughnut' && type !== 'radar' ? {
      x: {
        ticks: {
          color: colorVar('color-foreground'),
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10,
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 768 ? 11 : 12,
          },
        },
        grid: { color: colorVar('color-border') },
        pan: { enabled: true },
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: true },
        },
      },
      y: {
        min: 0,
        max: 10,
        ticks: {
          color: colorVar('color-foreground'),
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 768 ? 11 : 12,
          },
        },
        grid: { color: colorVar('color-border') },
        title: { display: true, text: 'Pain Level' },
        pan: { enabled: true },
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: true },
        },
      },
      y1: {
        position: 'right' as const,
        ticks: {
          color: colorVar('color-foreground'),
          font: {
            size: typeof window !== 'undefined' && window.innerWidth < 768 ? 11 : 12,
          },
        },
        grid: { display: false },
        title: { display: true, text: 'Entries' },
        pan: { enabled: true },
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: true },
        },
      },
      ...scales,
    } : undefined,
  }), [responsive, maintainAspectRatio, showLegend, showTitle, title, type, scales]);

  const srSummary = summary ?? (title ? `${title} chart with ${data.datasets.length} dataset(s)` : 'Chart data');

  return (
    <Card className={cn('w-full mobile-chart', className)}>
      <CardContent className="p-4 md:p-6">
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

function generateTooltipLabel(context: any) {
  try {
    const ds = context.dataset as unknown as (ChartDataset & { _meta?: ChartPointMetaArray });
    const idx = context.dataIndex;
    const seriesLabel = context.dataset.label || '';
    const value = context.parsed?.y ?? context.parsed ?? context.raw ?? '';
    let line = `${seriesLabel}: ${value}`;

    if (ds._meta && ds._meta[idx]) {
      line += formatMetadata(ds._meta[idx]);
    }

    return line;
  } catch (e) {
    return context.dataset.label ? `${context.dataset.label}: ${context.formattedValue}` : `${context.formattedValue}`;
  }
}

function formatMetadata(meta: ChartPointMeta) {
  let line = '';

  if (typeof meta.count === 'number') {
    line += ` — ${meta.count} entr${meta.count === 1 ? 'y' : 'ies'}`;
  }

  const flags: string[] = [];
  if (meta.notes) flags.push(`${meta.notes} notes`);
  if (meta.meds) flags.push(`${meta.meds} meds`);
  if (flags.length) {
    line += ` (${flags.join(', ')})`;
  }

  return line;
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

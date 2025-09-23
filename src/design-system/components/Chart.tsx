import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  // Plugin for dataset fill behavior
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Card, CardContent } from './Card';
import { cn } from '../utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Register filler plugin (required for dataset.fill to work)
ChartJS.register(Filler);

export type ChartType = 'line' | 'bar' | 'doughnut' | 'radar';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
  data: (number | null)[];
  /** Optional Chart.js dataset-level axis id (e.g. 'y' or 'y1') */
  yAxisID?: string;
  /** Optional hidden flag for dataset */
  hidden?: boolean;
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ChartProps {
  data: ChartData;
  type: ChartType;
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTitle?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: Record<string, unknown>[];
  /** Optional Chart.js scales override (e.g. { y: { min: 0, max: 10 } }) */
  scales?: Record<string, unknown> | undefined;
}

const defaultColors = {
  primary: 'hsl(var(--color-primary))',
  secondary: 'hsl(var(--color-secondary))',
  accent: 'hsl(var(--color-accent))',
  muted: 'hsl(var(--color-muted))',
  background: 'hsl(var(--color-background))',
  foreground: 'hsl(var(--color-foreground))',
};

export function Chart({
  data,
  type,
  title,
  height = 300,
  className,
  showLegend = true,
  showTitle = true,
  responsive = true,
  maintainAspectRatio = false,
  plugins = [],
  scales,
}: ChartProps) {
  const chartData = useMemo(() => {
    // Apply default colors if not provided
    

    const processedDatasets = data.datasets.map((dataset, index) => {
      const colors = [
        defaultColors.primary,
        defaultColors.secondary,
        defaultColors.accent,
        defaultColors.muted,
      ];

      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || colors[index % colors.length],
        borderColor: dataset.borderColor || colors[index % colors.length],
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill ?? (type === 'line' ? false : true),
        tension: dataset.tension ?? (type === 'line' ? 0.4 : 0),
      };
    });

    return {
      ...data,
      datasets: processedDatasets,
    };
  }, [data, type]);

  // Determine if chart data is effectively empty (all dataset values null/undefined)
  const isEmptyData = useMemo(() => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return true;
    return chartData.datasets.every(ds => ds.data.every(v => v === null || v === undefined));
  }, [chartData]);

  const options = useMemo(() => ({
    responsive,
    maintainAspectRatio,
    plugins: {
      legend: {
        // Hide legend when there's no data to avoid confusing 'No entries' items in the legend
        display: showLegend && !isEmptyData,
        position: 'top' as const,
      },
      title: {
        display: showTitle && !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(var(--color-card))',
        titleColor: 'hsl(var(--color-card-foreground))',
        bodyColor: 'hsl(var(--color-card-foreground))',
        borderColor: 'hsl(var(--color-border))',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
      ...plugins,
    },
    scales: type !== 'doughnut' && type !== 'radar' ? {
      x: {
        grid: {
          color: 'hsl(var(--color-border))',
        },
        ticks: {
          color: 'hsl(var(--color-foreground))',
        },
      },
      y: {
        grid: {
          color: 'hsl(var(--color-border))',
        },
        ticks: {
          color: 'hsl(var(--color-foreground))',
        },
      },
      // Allow callers to override/extend scales (e.g. set min/max)
      ...scales
    } : undefined,
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      },
    },
  }), [responsive, maintainAspectRatio, showLegend, showTitle, title, type, plugins, scales, isEmptyData]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={options} height={height} />;
      case 'bar':
        return <Bar data={chartData} options={options} height={height} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} height={height} />;
      case 'radar':
        return <Radar data={chartData} options={options} height={height} />;
      default:
        return <Line data={chartData} options={options} height={height} />;
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {isEmptyData ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <h3 className="text-lg font-semibold">No entries this week</h3>
            <p className="text-sm text-muted-foreground mt-2">Track pain over time to see trends.</p>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
}

// (helper moved to src/design-system/utils/chart.ts)

// Specialized chart components for common use cases
export function PainTrendChart({ data, title = 'Pain Trends', ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      data={data}
      type="line"
      title={title}
      {...props}
    />
  );
}

export function SymptomFrequencyChart({ data, title = 'Symptom Frequency', ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      data={data}
      type="bar"
      title={title}
      {...props}
    />
  );
}

export function PainDistributionChart({ data, title = 'Pain Distribution', ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      data={data}
      type="doughnut"
      title={title}
      {...props}
    />
  );
}

export function MultiDimensionalChart({ data, title = 'Multi-dimensional Analysis', ...props }: Omit<ChartProps, 'type'>) {
  return (
    <Chart
      data={data}
      type="radar"
      title={title}
      {...props}
    />
  );
}

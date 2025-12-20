import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PainEntry } from '../../types';
import { buildRolling7DayChartData } from '../../design-system/utils/chart';
import { chartColors, getChartColorAlpha } from '../../design-system/utils/chart-colors';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PainTrendChartProps {
  entries: PainEntry[];
}

export function PainTrendChart({ entries }: PainTrendChartProps) {
  // Build rolling 7-day aggregated data for display
  const raw = entries.map(e => ({ created_at: e.timestamp, pain_level: e.baselineData.pain }));
  const chartData = buildRolling7DayChartData(raw, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    label: 'Avg pain',
  });

  // Apply custom colors to the chart data
  if (chartData && chartData.datasets) {
    chartData.datasets = chartData.datasets.map(dataset => ({
      ...dataset,
      borderColor: chartColors.analytics.trend,
      backgroundColor: getChartColorAlpha(0, 0.2, 'analytics'),
      borderWidth: 3,
      pointBackgroundColor: chartColors.analytics.trend,
      pointBorderColor: chartColors.analytics.trend,
      pointRadius: 4,
      pointHoverRadius: 6,
    }));
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Pain Trend (last 7 days)',
      },
      tooltip: {
        callbacks: {
          label: context => {
            const v = context.parsed.y;
            return v === null ? 'No data' : `Avg pain: ${v}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Pain Level',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div style={{ height: '400px' }}>
        <Line options={options} data={chartData as unknown as ChartJS.ChartData<'line'>} />
      </div>
    </div>
  );
}


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PainEntry } from '../../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PainTrendChartProps {
  entries: PainEntry[];
}

export function PainTrendChart({ entries }: PainTrendChartProps) {
  // Sort entries by timestamp
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Prepare data for the chart
  const data = {
    labels: sortedEntries.map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }),
    datasets: [
      {
        label: 'Pain Level',
        data: sortedEntries.map(entry => entry.baselineData.pain),
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      },
      {
        label: 'Total Pain Score',
        data: sortedEntries.map(entry => {
          const locationFactor = entry.baselineData.locations.length * 0.5;
          const symptomFactor = entry.baselineData.symptoms.length * 0.3;
          return entry.baselineData.pain + locationFactor + symptomFactor;
        }),
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Pain Trend Over Time'
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const entry = sortedEntries[context[0].dataIndex];
            return [
              '',
              'Locations: ' + entry.baselineData.locations.join(', '),
              'Symptoms: ' + entry.baselineData.symptoms.join(', ')
            ];
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 12,
        title: {
          display: true,
          text: 'Pain Level / Score'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
} 
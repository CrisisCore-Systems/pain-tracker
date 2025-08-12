import React, { useMemo } from 'react';
import type { PainEntry } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ErrorBoundary } from './ErrorBoundary';

interface ProgressionAnalysisProps {
  entries: PainEntry[];
  period?: {
    start: string;
    end: string;
  };
}

interface TrendPoint {
  date: string;
  pain: number;
  symptoms: number;
  locations: number;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 border rounded shadow-lg" role="tooltip">
      <p className="font-medium mb-2">{format(new Date(label), 'MMM d, yyyy')}</p>
      {payload.map((item: any) => (
        <div key={item.name} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-sm">
            {item.name}: {item.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProgressionAnalysis({ entries, period }: ProgressionAnalysisProps) {
  const filteredEntries = useMemo(() => {
    if (!period) return entries;

    const startDate = startOfDay(new Date(period.start));
    const endDate = endOfDay(new Date(period.end));

    return entries.filter(entry => {
      const date = new Date(entry.timestamp);
      return date >= startDate && date <= endDate;
    });
  }, [entries, period]);

  const trendData = useMemo(() => {
    if (!filteredEntries.length) return [];

    // Group entries by date
    const dailyData = filteredEntries.reduce(
      (acc, entry) => {
        const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {
            painLevels: [],
            symptoms: new Set<string>(),
            locations: new Set<string>(),
          };
        }
        acc[date].painLevels.push(entry.baselineData.pain);
        entry.baselineData.symptoms.forEach(s => acc[date].symptoms.add(s));
        entry.baselineData.locations.forEach(l => acc[date].locations.add(l));
        return acc;
      },
      {} as Record<
        string,
        {
          painLevels: number[];
          symptoms: Set<string>;
          locations: Set<string>;
        }
      >
    );

    // Convert to trend points
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        pain: data.painLevels.reduce((a, b) => a + b, 0) / data.painLevels.length,
        symptoms: data.symptoms.size,
        locations: data.locations.size,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEntries]);

  const trends = useMemo(() => {
    if (trendData.length < 2) return null;

    const firstPoint = trendData[0];
    const lastPoint = trendData[trendData.length - 1];
    const painChange = lastPoint.pain - firstPoint.pain;
    const symptomsChange = lastPoint.symptoms - firstPoint.symptoms;
    const locationsChange = lastPoint.locations - firstPoint.locations;

    return {
      pain: {
        change: painChange,
        trend: painChange > 0 ? 'increasing' : painChange < 0 ? 'decreasing' : 'stable',
      },
      symptoms: {
        change: symptomsChange,
        trend: symptomsChange > 0 ? 'increasing' : symptomsChange < 0 ? 'decreasing' : 'stable',
      },
      locations: {
        change: locationsChange,
        trend: locationsChange > 0 ? 'increasing' : locationsChange < 0 ? 'decreasing' : 'stable',
      },
    };
  }, [trendData]);

  if (!filteredEntries.length) {
    return (
      <div
        className="bg-white p-6 rounded-lg shadow-md"
        role="region"
        aria-label="Progression Analysis"
      >
        <h3 className="text-lg font-semibold mb-4">Progression Analysis</h3>
        <p className="text-gray-500 text-center py-4" role="status">
          No data available for the selected period.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="bg-white p-6 rounded-lg shadow-md"
        role="region"
        aria-label="Progression Analysis"
      >
        <h3 className="text-lg font-semibold mb-4">Progression Analysis</h3>

        <div className="space-y-6">
          {/* Trend Chart */}
          <div
            className="h-64"
            role="img"
            aria-label="Pain progression chart showing trends over time"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis
                  dataKey="date"
                  tickFormatter={date => format(new Date(date), 'MMM d')}
                  aria-label="Date"
                />
                <YAxis yAxisId="left" domain={[0, 10]} aria-label="Pain Level (0-10)" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'auto']}
                  aria-label="Count"
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pain"
                  stroke="#ef4444"
                  name="Pain Level"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="symptoms"
                  stroke="#3b82f6"
                  name="Symptoms"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="locations"
                  stroke="#10b981"
                  name="Locations"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Analysis */}
          {trends && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              role="list"
              aria-label="Trend analysis"
            >
              <div
                className={`p-4 rounded-lg ${
                  trends.pain.trend === 'increasing'
                    ? 'bg-red-50'
                    : trends.pain.trend === 'decreasing'
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                }`}
                role="listitem"
              >
                <h4 className="font-medium mb-2">Pain Trend</h4>
                <p
                  className={`text-sm ${
                    trends.pain.trend === 'increasing'
                      ? 'text-red-700'
                      : trends.pain.trend === 'decreasing'
                        ? 'text-green-700'
                        : 'text-gray-700'
                  }`}
                  aria-live="polite"
                >
                  {Math.abs(trends.pain.change).toFixed(1)} point {trends.pain.trend}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  trends.symptoms.trend === 'increasing'
                    ? 'bg-red-50'
                    : trends.symptoms.trend === 'decreasing'
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                }`}
                role="listitem"
              >
                <h4 className="font-medium mb-2">Symptoms Trend</h4>
                <p
                  className={`text-sm ${
                    trends.symptoms.trend === 'increasing'
                      ? 'text-red-700'
                      : trends.symptoms.trend === 'decreasing'
                        ? 'text-green-700'
                        : 'text-gray-700'
                  }`}
                  aria-live="polite"
                >
                  {Math.abs(trends.symptoms.change)} {trends.symptoms.trend}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  trends.locations.trend === 'increasing'
                    ? 'bg-red-50'
                    : trends.locations.trend === 'decreasing'
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                }`}
                role="listitem"
              >
                <h4 className="font-medium mb-2">Locations Trend</h4>
                <p
                  className={`text-sm ${
                    trends.locations.trend === 'increasing'
                      ? 'text-red-700'
                      : trends.locations.trend === 'decreasing'
                        ? 'text-green-700'
                        : 'text-gray-700'
                  }`}
                  aria-live="polite"
                >
                  {Math.abs(trends.locations.change)} {trends.locations.trend}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

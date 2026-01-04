import React, { useMemo, useState } from 'react';
import { format as formatDate, startOfWeek } from 'date-fns';
import { formatNumber } from '../../../utils/formatting';
import { getAllLocations, getEffectivePainLevel, type PainEntry } from '../../../types';
import { InteractiveBodyMap } from '../../body-mapping/InteractiveBodyMap';
import { User, LayoutGrid } from 'lucide-react';

interface LocationHeatmapProps {
  entries: PainEntry[];
}

type LocationKey = string;

type LocationStat = {
  key: LocationKey;
  label: string;
  totalPain: number;
  count: number;
  byBucket: Record<string, { totalPain: number; count: number }>;
};

function normalizeLocationKey(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getLocalDayKey(timestamp: string): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getBucketKey(timestamp: string, mode: 'day' | 'week'): string {
  if (mode === 'day') return getLocalDayKey(timestamp);
  const d = new Date(timestamp);
  const start = startOfWeek(d, { weekStartsOn: 1 });
  return formatDate(start, 'yyyy-MM-dd');
}

function enumerateLocalDaysInclusive(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(12, 0, 0, 0);
  const endLocal = new Date(end);
  endLocal.setHours(12, 0, 0, 0);

  while (cursor <= endLocal) {
    const y = cursor.getFullYear();
    const m = (cursor.getMonth() + 1).toString().padStart(2, '0');
    const d = cursor.getDate().toString().padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function buildBucketKeys(entries: PainEntry[]): {
  mode: 'day' | 'week';
  keys: string[];
  formatLabel: (key: string) => string;
} {
  const timestamps = entries
    .map(e => new Date(e.timestamp).getTime())
    .filter(n => Number.isFinite(n));
  if (timestamps.length === 0) {
    return {
      mode: 'day',
      keys: [],
      formatLabel: key => key,
    };
  }

  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  const allDays = enumerateLocalDaysInclusive(start, end);

  // Keep the visualization readable while still “over time”:
  // - show daily buckets for short ranges
  // - auto-collapse to weekly buckets for longer ranges
  const mode: 'day' | 'week' = allDays.length <= 31 ? 'day' : 'week';

  if (mode === 'day') {
    return {
      mode,
      keys: allDays,
      formatLabel: key => {
        const d = new Date(`${key}T12:00:00`);
        return formatDate(d, 'MMM d');
      },
    };
  }

  const weekStarts = new Set<string>();
  entries.forEach(entry => {
    weekStarts.add(getBucketKey(entry.timestamp, 'week'));
  });
  const keys = Array.from(weekStarts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return {
    mode,
    keys,
    formatLabel: key => {
      const d = new Date(`${key}T12:00:00`);
      return formatDate(d, 'MMM d');
    },
  };
}

export const LocationHeatmap: React.FC<LocationHeatmapProps> = ({ entries }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'grid'>('visual');
  const heatmap = useMemo(() => {
    if (!entries.length) {
      return {
        locations: [] as LocationStat[],
        bucket: { mode: 'day' as const, keys: [] as string[], formatLabel: (k: string) => k },
      };
    }

    const bucket = buildBucketKeys(entries);
    const statsByKey: Record<LocationKey, LocationStat> = {};

    for (const entry of entries) {
      const pain = getEffectivePainLevel(entry);
      const bucketKey = getBucketKey(entry.timestamp, bucket.mode);
      const locations = getAllLocations(entry);

      for (const rawLocation of locations) {
        const trimmed = rawLocation.trim();
        if (!trimmed) continue;
        const key = normalizeLocationKey(trimmed);
        if (!statsByKey[key]) {
          statsByKey[key] = {
            key,
            label: trimmed,
            totalPain: 0,
            count: 0,
            byBucket: {},
          };
        }
        const stat = statsByKey[key];
        stat.totalPain += pain;
        stat.count += 1;

        if (!stat.byBucket[bucketKey]) stat.byBucket[bucketKey] = { totalPain: 0, count: 0 };
        stat.byBucket[bucketKey].totalPain += pain;
        stat.byBucket[bucketKey].count += 1;
      }
    }

    const locations = Object.values(statsByKey)
      .map(stat => ({
        ...stat,
        // Prefer a consistently formatted label for display.
        label:
          stat.label
            .split(' ')
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') || stat.key,
      }))
      .sort((a, b) => b.count - a.count || b.totalPain / b.count - a.totalPain / a.count);

    return { locations, bucket };
  }, [entries]);

  const getHeatColor = (intensity: number) => {
    if (intensity <= 0) return 'bg-gray-100';
    if (intensity < 0.3) return 'bg-yellow-200';
    if (intensity < 0.6) return 'bg-orange-300';
    if (intensity < 0.8) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getTextColor = (intensity: number) => {
    return intensity > 0.6 ? 'text-white' : 'text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Pain Location Heatmap</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === 'visual'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            aria-pressed={viewMode === 'visual'}
          >
            <User className="w-4 h-4" />
            Body Map
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid View
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No data available for location heatmap.</p>
      ) : (
        <div className="space-y-6">
          {/* Visual Body Map View */}
          {viewMode === 'visual' && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <InteractiveBodyMap
                entries={entries}
                mode="heatmap"
                showAccessibilityFeatures
                height={500}
              />
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              {/* Legend */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Pain Intensity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  <span className="text-xs">None</span>
                  <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                  <span className="text-xs">Low</span>
                  <div className="w-4 h-4 bg-orange-300 rounded"></div>
                  <span className="text-xs">Medium</span>
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-xs">High</span>
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-xs">Severe</span>
                </div>
              </div>

              {/* Over-time Heatmap */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Over Time</h3>
                <div className="overflow-auto border rounded-lg">
                  <table className="min-w-full border-collapse" aria-label="Pain location heatmap over time">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="text-left text-xs font-semibold p-2 whitespace-nowrap">
                          Location
                        </th>
                        {heatmap.bucket.keys.map(key => (
                          <th
                            key={key}
                            scope="col"
                            className="text-center text-xs font-medium p-2 whitespace-nowrap"
                            title={heatmap.bucket.mode === 'week' ? `Week of ${key}` : key}
                          >
                            {heatmap.bucket.formatLabel(key)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.locations.map(location => {
                        const avgPain = location.count ? location.totalPain / location.count : 0;
                        return (
                          <tr key={location.key} className="border-t">
                            <th
                              scope="row"
                              className="text-left text-xs font-medium p-2 whitespace-nowrap bg-white dark:bg-gray-900"
                              title={`${location.label}: ${formatNumber(avgPain, 1)}/10 avg pain (${location.count} entries)`}
                            >
                              {location.label}
                            </th>
                            {heatmap.bucket.keys.map(bucketKey => {
                              const bucketStat = location.byBucket[bucketKey];
                              const count = bucketStat?.count ?? 0;
                              const avg = count ? bucketStat!.totalPain / count : 0;
                              const intensity = avg / 10;
                              const label = `${location.label}, ${bucketKey}: ${formatNumber(avg, 1)}/10 (${count} ${count === 1 ? 'entry' : 'entries'})`;
                              return (
                                <td key={bucketKey} className="p-1">
                                  <div
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded ${getHeatColor(intensity)} ${getTextColor(intensity)} flex items-center justify-center text-[10px] border`}
                                    aria-label={label}
                                    title={label}
                                  >
                                    {count > 0 ? count : ''}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Color shows average intensity; numbers show frequency.
                </p>
              </div>
            </>
          )}

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Most Affected Area</h3>
              {(() => {
                const candidates = heatmap.locations.filter(l => l.count > 0);
                if (candidates.length === 0) {
                  return <div className="text-gray-600 dark:text-gray-400">No data</div>;
                }
                const topLocation = candidates.reduce((max, curr) => {
                  const maxAvg = max.totalPain / max.count;
                  const currAvg = curr.totalPain / curr.count;
                  return currAvg > maxAvg ? curr : max;
                });
                const avgPain = topLocation.totalPain / topLocation.count;
                return (
                  <div>
                    <div className="text-lg font-bold">{topLocation.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(avgPain, 1)}/10 average pain
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Most Frequent Area</h3>
              {(() => {
                const candidates = heatmap.locations.filter(l => l.count > 0);
                if (candidates.length === 0) {
                  return <div className="text-gray-600 dark:text-gray-400">No data</div>;
                }
                const topFrequent = candidates.reduce((max, curr) =>
                  curr.count > max.count ? curr : max
                );
                return (
                  <div>
                    <div className="text-lg font-bold">{topFrequent.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {topFrequent.count} entries
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Areas Affected</h3>
              <div>
                <div className="text-lg font-bold">
                  {heatmap.locations.filter(d => d.count > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  unique locations recorded
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { formatNumber } from '../../../utils/formatting';
import type { PainEntry } from '../../../types';

interface LocationHeatmapProps {
  entries: PainEntry[];
}

const BODY_LOCATIONS = [
  'Head/Neck',
  'Upper Back',
  'Lower Back',
  'Left Shoulder',
  'Right Shoulder',
  'Left Arm',
  'Right Arm',
  'Left Hand',
  'Right Hand',
  'Chest',
  'Abdomen',
  'Left Hip',
  'Right Hip',
  'Left Thigh',
  'Right Thigh',
  'Left Knee',
  'Right Knee',
  'Left Calf',
  'Right Calf',
  'Left Foot',
  'Right Foot'
];

export const LocationHeatmap: React.FC<LocationHeatmapProps> = ({ entries }) => {
  const locationData = useMemo(() => {
    if (!entries.length) return [];

    const locationStats = entries.reduce((acc, entry) => {
      entry.baselineData.locations?.forEach(location => {
        if (!acc[location]) {
          acc[location] = { totalPain: 0, count: 0 };
        }
        acc[location].totalPain += entry.baselineData.pain;
        acc[location].count += 1;
      });
      return acc;
    }, {} as Record<string, { totalPain: number; count: number }>);

    const maxAvgPain = Math.max(...Object.values(locationStats).map(stat => stat.totalPain / stat.count));

    return BODY_LOCATIONS.map(location => {
      const stats = locationStats[location];
      if (!stats) {
        return {
          location,
          avgPain: 0,
          frequency: 0,
          intensity: 0
        };
      }

      const avgPain = stats.totalPain / stats.count;
      return {
        location,
        avgPain: Number(formatNumber(avgPain, 1)),
        frequency: stats.count,
        intensity: avgPain / maxAvgPain
      };
    });
  }, [entries]);

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.3) return 'bg-yellow-200';
    if (intensity < 0.6) return 'bg-orange-300';
    if (intensity < 0.8) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getTextColor = (intensity: number) => {
    return intensity > 0.6 ? 'text-white' : 'text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Pain Location Heatmap</h2>
      
      {entries.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No data available for location heatmap.</p>
      ) : (
        <div className="space-y-6">
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

          {/* Body Map Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {locationData.map((data) => (
              <div
                key={data.location}
                className={`
                  p-3 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer
                  ${getHeatColor(data.intensity)} ${getTextColor(data.intensity)}
                `}
                title={`${data.location}: ${data.avgPain}/10 avg pain (${data.frequency} entries)`}
              >
                <div className="text-sm font-medium text-center">{data.location}</div>
                {data.frequency > 0 && (
                  <div className="text-xs text-center mt-1">
                    <div>{data.avgPain}/10</div>
                    <div>({data.frequency}x)</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Most Affected Area</h3>
              {(() => {
                const topLocation = locationData.reduce((max, curr) => 
                  curr.avgPain > max.avgPain ? curr : max
                );
                return topLocation.frequency > 0 ? (
                  <div>
                    <div className="text-lg font-bold">{topLocation.location}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{topLocation.avgPain}/10 average pain</div>
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">No data</div>
                );
              })()}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Most Frequent Area</h3>
              {(() => {
                const topFrequent = locationData.reduce((max, curr) => 
                  curr.frequency > max.frequency ? curr : max
                );
                return topFrequent.frequency > 0 ? (
                  <div>
                    <div className="text-lg font-bold">{topFrequent.location}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{topFrequent.frequency} entries</div>
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">No data</div>
                );
              })()}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Areas Affected</h3>
              <div>
                <div className="text-lg font-bold">
                  {locationData.filter(d => d.frequency > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">out of {BODY_LOCATIONS.length} tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

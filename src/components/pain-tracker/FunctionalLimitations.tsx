
import type { PainEntry } from '../../types';
import { formatNumber } from '../../utils/formatting';

interface FunctionalLimitationsProps {
  entries: PainEntry[];
  period?: {
    start: string;
    end: string;
  };
}

export function FunctionalLimitations({ entries, period }: FunctionalLimitationsProps) {
  const filteredEntries = period
    ? entries.filter(entry => {
        const date = new Date(entry.timestamp);
        return date >= new Date(period.start) && date <= new Date(period.end);
      })
    : entries;

  // Analyze functional limitations
  const limitationsAnalysis = filteredEntries.reduce((acc, entry) => {
    entry.functionalImpact?.limitedActivities?.forEach(activity => {
      if (!acc[activity]) {
        acc[activity] = {
          count: 0,
          painLevels: [],
          assistanceNeeded: new Set<string>(),
          mobilityAids: new Set<string>(),
        };
      }
      acc[activity].count += 1;
      acc[activity].painLevels.push(entry.baselineData.pain);
      entry.functionalImpact?.assistanceNeeded?.forEach(assistance => 
        acc[activity].assistanceNeeded.add(assistance)
      );
      entry.functionalImpact?.mobilityAids?.forEach(aid => 
        acc[activity].mobilityAids.add(aid)
      );
    });
    return acc;
  }, {} as Record<string, {
    count: number;
    painLevels: number[];
    assistanceNeeded: Set<string>;
    mobilityAids: Set<string>;
  }>);

  // Convert analysis to sorted array
  const limitationsSummary = Object.entries(limitationsAnalysis)
    .map(([activity, data]) => ({
      activity,
      frequency: data.count,
      averagePain: data.painLevels.reduce((a, b) => a + b, 0) / data.painLevels.length,
      assistanceNeeded: Array.from(data.assistanceNeeded),
      mobilityAids: Array.from(data.mobilityAids),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Functional Limitations Analysis</h3>

      <div className="space-y-6">
        {limitationsSummary.map(limitation => (
          <div key={limitation.activity} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{limitation.activity}</h4>
                <p className="text-sm text-gray-600">
                  Reported {limitation.frequency} times
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  Avg. Pain: {formatNumber(limitation.averagePain, 1)}
                </div>
              </div>
            </div>

            {limitation.assistanceNeeded.length > 0 && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Assistance Needed:</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {limitation.assistanceNeeded.map(assistance => (
                    <span
                      key={assistance}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {assistance}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {limitation.mobilityAids.length > 0 && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Mobility Aids Used:</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {limitation.mobilityAids.map(aid => (
                    <span
                      key={aid}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {aid}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {limitationsSummary.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No functional limitations recorded in this period.
          </p>
        )}
      </div>
    </div>
  );
} 
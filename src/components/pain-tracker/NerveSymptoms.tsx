
import type { PainEntry } from '../../types';
import { formatNumber } from '../../utils/formatting';


interface NerveSymptomsProps {
  entries: PainEntry[];
  period?: {
    start: string;
    end: string;
  };
}

const NERVE_SYMPTOMS = [
  'tingling',
  'numbness',
  'burning',
  'radiating',
] as const;

export function NerveSymptoms({ entries, period }: NerveSymptomsProps) {
  const filteredEntries = period
    ? entries.filter(entry => {
        const date = new Date(entry.timestamp);
        return date >= new Date(period.start) && date <= new Date(period.end);
      })
    : entries;

  // Analyze nerve symptoms
  const nerveSymptomAnalysis = filteredEntries.reduce((acc, entry) => {
    const nerveSymptoms = (entry.baselineData.symptoms || [])
      .filter(symptom => NERVE_SYMPTOMS.includes(symptom as typeof NERVE_SYMPTOMS[number]));

    nerveSymptoms.forEach(symptom => {
      if (!acc[symptom]) {
        acc[symptom] = {
          count: 0,
          locations: new Set<string>(),
          painLevels: [],
        };
      }
      acc[symptom].count += 1;
      acc[symptom].painLevels.push(entry.baselineData.pain);
      (entry.baselineData.locations || []).forEach(location => 
        acc[symptom].locations.add(location)
      );
    });
    return acc;
  }, {} as Record<string, {
    count: number;
    locations: Set<string>;
    painLevels: number[];
  }>);

  // Convert analysis to sorted array
  const symptomsSummary = Object.entries(nerveSymptomAnalysis)
    .map(([symptom, data]) => ({
      symptom,
      frequency: data.count,
      averagePain: data.painLevels.reduce((a, b) => a + b, 0) / data.painLevels.length,
      locations: Array.from(data.locations),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Nerve Symptoms Analysis</h3>

      <div className="space-y-6">
        {symptomsSummary.map(symptom => (
          <div key={symptom.symptom} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium capitalize">{symptom.symptom}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reported {symptom.frequency} times
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  Avg. Pain: {formatNumber(symptom.averagePain, 1)}
                </div>
              </div>
            </div>

            {symptom.locations.length > 0 && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Affected Areas:</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {symptom.locations.map(location => (
                    <span
                      key={location}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {symptomsSummary.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No nerve symptoms recorded in this period.
          </p>
        )}
      </div>
    </div>
  );
} 
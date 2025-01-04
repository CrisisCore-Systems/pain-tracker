import React from 'react';
import type { PainEntry } from '../../types';
import { calculateOverallTrend } from '../../utils/wcbAnalytics';

interface ProgressionSummaryProps {
  entries: PainEntry[];
  period: {
    start: string;
    end: string;
  };
}

export function ProgressionSummary({ entries, period }: ProgressionSummaryProps) {
  const progression = entries
    .filter(entry => {
      const date = new Date(entry.timestamp);
      return date >= new Date(period.start) && date <= new Date(period.end);
    })
    .map(entry => ({
      timestamp: entry.timestamp,
      averagePain: entry.baselineData.pain,
      locations: entry.baselineData.locations,
      symptoms: entry.baselineData.symptoms,
    }));

  const trend = calculateOverallTrend(progression);
  const latestEntry = progression[progression.length - 1];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Progression Summary</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Overall Trend</h4>
          <p className={`text-lg font-semibold ${
            trend.includes('deterioration') ? 'text-red-600' :
            trend === 'Stable' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {trend}
          </p>
        </div>

        {latestEntry && (
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Current Pain Level</h4>
              <p className="text-lg font-semibold">{latestEntry.averagePain}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Active Pain Locations</h4>
              <ul className="mt-1 space-y-1">
                {latestEntry.locations.map(location => (
                  <li key={location} className="text-sm text-gray-600">{location}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Current Symptoms</h4>
              <ul className="mt-1 space-y-1">
                {latestEntry.symptoms.map(symptom => (
                  <li key={symptom} className="text-sm text-gray-600">{symptom}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
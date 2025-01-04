import React, { useEffect, useState } from 'react';
import type { PainEntry } from '../../types';
import { calculatePainScore, aggregatePainData } from '../../utils/pain-tracker/calculations';
import { loadPainEntries } from '../../utils/pain-tracker/storage';
import type { PainScore, AggregatedPainData } from '../../utils/pain-tracker/calculations';
import { PainTrendChart } from './PainTrendChart';

export function PainAnalytics() {
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<PainScore | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedPainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await loadPainEntries();
      setEntries(loadedEntries);
      
      if (loadedEntries.length > 0) {
        const latestEntry = loadedEntries[loadedEntries.length - 1];
        setCurrentScore(calculatePainScore(latestEntry));
        setAggregatedData(aggregatePainData(loadedEntries));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pain data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="sr-only">Loading pain data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md" role="alert">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-md" role="status">
        <p>No pain entries recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pain Trend Chart */}
      {entries.length > 0 && (
        <PainTrendChart entries={entries} />
      )}

      {/* Current Pain Status */}
      {currentScore && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Current Pain Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pain Score</p>
              <p className="text-2xl font-bold" aria-label={`Pain score: ${currentScore.total.toFixed(1)}`}>
                {currentScore.total.toFixed(1)}
              </p>
              <p className={`text-sm font-medium ${
                currentScore.severity === 'severe' ? 'text-red-600' :
                currentScore.severity === 'moderate' ? 'text-yellow-600' :
                'text-green-600'
              }`} role="status">
                {currentScore.severity.charAt(0).toUpperCase() + currentScore.severity.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contributing Factors</p>
              <ul className="text-sm" aria-label="Contributing factors">
                <li>Locations: {currentScore.locationFactor.toFixed(1)}</li>
                <li>Symptoms: {currentScore.symptomFactor.toFixed(1)}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Aggregated Analysis */}
      {aggregatedData && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Pain Analysis</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Trends */}
            <div>
              <h4 className="text-md font-medium mb-2">Trends</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  Average Pain: <span className="font-medium">{aggregatedData.averagePain.toFixed(1)}</span>
                </p>
                <p className="text-sm">
                  Overall Trend:{' '}
                  <span className={`font-medium ${
                    aggregatedData.painTrend === 'improving' ? 'text-green-600' :
                    aggregatedData.painTrend === 'worsening' ? 'text-red-600' :
                    'text-yellow-600'
                  }`} role="status">
                    {aggregatedData.painTrend.charAt(0).toUpperCase() + aggregatedData.painTrend.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Time Analysis */}
            <div>
              <h4 className="text-md font-medium mb-2">Time Patterns</h4>
              <div className="space-y-2 text-sm">
                {aggregatedData.timeAnalysis.worstTime && (
                  <p>Worst Time: <span className="font-medium">{aggregatedData.timeAnalysis.worstTime}</span></p>
                )}
                {aggregatedData.timeAnalysis.bestTime && (
                  <p>Best Time: <span className="font-medium">{aggregatedData.timeAnalysis.bestTime}</span></p>
                )}
              </div>
            </div>

            {/* Common Locations */}
            <div>
              <h4 className="text-md font-medium mb-2">Common Locations</h4>
              <ul className="space-y-1" aria-label="Common pain locations">
                {aggregatedData.commonLocations.slice(0, 3).map(({ location, frequency }) => (
                  <li key={location} className="text-sm">
                    {location} <span className="text-gray-500">({frequency} times)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Symptoms */}
            <div>
              <h4 className="text-md font-medium mb-2">Common Symptoms</h4>
              <ul className="space-y-1" aria-label="Common symptoms">
                {aggregatedData.commonSymptoms.slice(0, 3).map(({ symptom, frequency }) => (
                  <li key={symptom} className="text-sm">
                    {symptom} <span className="text-gray-500">({frequency} times)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Functional Impact */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Functional Impact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Limited Activities</p>
                <ul className="mt-1 space-y-1" aria-label="Most limited activities">
                  {aggregatedData.functionalImpactSummary.mostLimitedActivities.map((activity) => (
                    <li key={activity} className="text-sm">{activity}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Common Mobility Aids</p>
                <ul className="mt-1 space-y-1" aria-label="Common mobility aids">
                  {aggregatedData.functionalImpactSummary.commonMobilityAids.map((aid) => (
                    <li key={aid} className="text-sm">{aid}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
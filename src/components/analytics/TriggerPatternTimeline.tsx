import React from 'react';
import type { TriggerPattern } from '../../services/AdvancedAnalyticsEngine';

interface TriggerPatternTimelineProps {
  patterns: TriggerPattern[];
  className?: string;
}

/**
 * Trigger Pattern Timeline & Analysis
 * 
 * Visualizes pain triggers with temporal patterns and risk scoring.
 * Accessible design with clear warning indicators.
 */
export const TriggerPatternTimeline: React.FC<TriggerPatternTimelineProps> = ({
  patterns,
  className = '',
}) => {
  if (patterns.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Trigger Patterns
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Keep tracking to identify your pain triggers and patterns!
        </p>
      </div>
    );
  }

  const getRiskLevel = (score: number): string => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Low';
    return 'Minimal';
  };

  const getRiskColor = (score: number): string => {
    if (score >= 75) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (score >= 50)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (score >= 25)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getRiskBorderColor = (score: number): string => {
    if (score >= 75) return 'border-red-500';
    if (score >= 50) return 'border-orange-500';
    if (score >= 25) return 'border-yellow-500';
    return 'border-green-500';
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Trigger Patterns
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Identified pain triggers ranked by risk and frequency
        </p>
      </div>

      <div className="space-y-4" role="list" aria-label="Trigger patterns">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className={`border-l-4 ${getRiskBorderColor(
              pattern.riskScore
            )} bg-white dark:bg-gray-800 rounded-r-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
            role="listitem"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {pattern.trigger}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                        pattern.riskScore
                      )}`}
                      aria-label={`Risk level: ${getRiskLevel(pattern.riskScore)}`}
                    >
                      {getRiskLevel(pattern.riskScore)} Risk
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Occurred {pattern.frequency} times
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Risk Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pattern.riskScore}
                  </p>
                </div>
              </div>

              {/* Pain Impact */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Pain Impact:</strong> Average increase of{' '}
                  <span
                    className={
                      pattern.averagePainIncrease > 0
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-green-600 dark:text-green-400 font-semibold'
                    }
                  >
                    {pattern.averagePainIncrease > 0 ? '+' : ''}
                    {pattern.averagePainIncrease.toFixed(1)} points
                  </span>
                </p>
              </div>

              {/* Temporal Patterns */}
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                {/* Time of Day */}
                {pattern.timeOfDayPattern && pattern.timeOfDayPattern.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                      Most Common Times
                    </p>
                    <ul className="space-y-1">
                      {pattern.timeOfDayPattern.slice(0, 3).map((time, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex justify-between"
                        >
                          <span>{formatHour(time.hour)}</span>
                          <span className="font-medium">{time.count}×</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Day of Week */}
                {pattern.dayOfWeekPattern && pattern.dayOfWeekPattern.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
                      Most Common Days
                    </p>
                    <ul className="space-y-1">
                      {pattern.dayOfWeekPattern
                        .sort(
                          (a, b) =>
                            dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
                        )
                        .slice(0, 3)
                        .map((day, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 flex justify-between"
                          >
                            <span>{day.day}</span>
                            <span className="font-medium">{day.count}×</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Associated Symptoms */}
              {pattern.associatedSymptoms.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Associated Symptoms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.associatedSymptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Educational footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Understanding trigger patterns
          </summary>
          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Risk Score:</strong> Combines frequency and pain impact.
              Higher scores indicate triggers that occur often and cause significant
              pain increases.
            </p>
            <p>
              <strong>Temporal Patterns:</strong> Shows when triggers are most
              likely to occur, helping you prepare and implement preventive
              strategies.
            </p>
            <p>
              <strong>Action:</strong> Share high-risk triggers with your healthcare
              provider to develop avoidance or mitigation strategies.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

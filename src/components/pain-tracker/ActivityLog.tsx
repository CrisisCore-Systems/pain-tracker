import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { PainEntry } from '../../types';
import { format } from 'date-fns';
import { formatNumber } from '../../utils/formatting';
import { ErrorBoundary } from './ErrorBoundary';

interface ActivityLogProps {
  entries: PainEntry[];
  period?: {
    start: string;
    end: string;
  };
}

export function ActivityLog({ entries, period }: ActivityLogProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const activityRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredEntries = useMemo(() => period
    ? entries.filter(entry => {
        const date = new Date(entry.timestamp);
        return date >= new Date(period.start) && date <= new Date(period.end);
      })
    : entries, [entries, period]);

  // Get unique activities from all entries
  const activities = useMemo(() => Array.from(
    new Set(filteredEntries.flatMap(entry => entry.functionalImpact?.limitedActivities || []))
  ), [filteredEntries]);

  // Calculate impact score for each activity
  const activityImpact = useMemo(() => activities
    .map(activity => {
      const entriesWithActivity = filteredEntries.filter(entry =>
        entry.functionalImpact?.limitedActivities?.includes(activity)
      );

      const averagePain =
        entriesWithActivity.reduce((sum, entry) => sum + entry.baselineData.pain, 0) /
        entriesWithActivity.length;

      return {
        activity,
        frequency: entriesWithActivity.length,
        averagePain: averagePain || 0,
      };
    })
    .sort((a, b) => b.frequency - a.frequency), [activities, filteredEntries]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        setFocusedIndex(Math.min(activityImpact.length - 1, index + 1));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedIndex(Math.max(0, index - 1));
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(Math.min(activityImpact.length - 1, index + 3));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(Math.max(0, index - 3));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(activityImpact.length - 1);
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && activityRefs.current[focusedIndex]) {
      activityRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <ErrorBoundary>
      <div
        className="bg-white p-6 rounded-lg shadow-md"
        role="region"
        aria-label="Activity Impact Log"
      >
        <h3 className="text-lg font-semibold mb-4">Activity Impact Log</h3>

        <div className="space-y-6">
          {/* Activity List */}
          <div>
            <h4
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              id="activities-heading"
            >
              Limited Activities
            </h4>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              role="grid"
              aria-labelledby="activities-heading"
            >
              {activityImpact.map(({ activity, frequency, averagePain }, index) => (
                <button
                  key={activity}
                  ref={el => (activityRefs.current[index] = el)}
                  onClick={() => setSelectedActivity(activity)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedActivity === activity
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  role="gridcell"
                  aria-selected={selectedActivity === activity}
                  aria-label={`${activity}: ${frequency} times, average pain ${formatNumber(averagePain, 1)}`}
                  tabIndex={activityImpact.length === 0 ? -1 : focusedIndex === index ? 0 : -1}
                >
                  <div className="font-medium">{activity}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Frequency: {frequency} times
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Pain: {formatNumber(averagePain, 1)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Details */}
          {selectedActivity && (
            <div className="mt-6" role="region" aria-label={`Details for ${selectedActivity}`}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Details: {selectedActivity}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="space-y-4" role="list">
                  {filteredEntries
                    .filter(entry =>
                      entry.functionalImpact?.limitedActivities?.includes(selectedActivity)
                    )
                    .map(entry => (
                      <div key={entry.id} className="border-b pb-2" role="listitem">
                        <div className="flex justify-between items-start">
                          <div>
                            <div
                              className="font-medium"
                              aria-label={`Pain Level: ${entry.baselineData.pain}`}
                            >
                              Pain Level: {entry.baselineData.pain}
                            </div>
                            <div
                              className="text-sm text-gray-600 dark:text-gray-400"
                              aria-label={`Date: ${format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}`}
                            >
                              {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                            </div>
                          </div>
                          {entry.notes && (
                            <div
                              className="text-sm text-gray-600 dark:text-gray-400 max-w-xs"
                              aria-label={`Notes: ${entry.notes}`}
                            >
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

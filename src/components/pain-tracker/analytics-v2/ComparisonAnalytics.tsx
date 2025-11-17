import React, { useState } from 'react';
import type { PainEntry } from '../../../types';
import { PlannedFeatureNotice } from '../../common/PlannedFeatureNotice';

interface ComparisonAnalyticsProps {
  entries: PainEntry[];
}

export const ComparisonAnalytics: React.FC<ComparisonAnalyticsProps> = ({ entries }) => {
  const [comparisonType, setComparisonType] = useState<'treatment' | 'time' | 'custom'>(
    'treatment'
  );
  const [selectedDate, setSelectedDate] = useState<string>('');

  if (!entries.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Comparison Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          No data available for comparison analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comparison Analytics</h2>
          <div className="flex gap-2">
            <select
              value={comparisonType}
              onChange={e => setComparisonType(e.target.value as 'treatment' | 'time' | 'custom')}
              className="border rounded px-3 py-1"
            >
              <option value="treatment">Before/After Treatment</option>
              <option value="time">Time Periods</option>
              <option value="custom">Custom Date</option>
            </select>
            {comparisonType === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border rounded px-3 py-1"
              />
            )}
          </div>
        </div>
        <PlannedFeatureNotice feature="comparisonAnalytics" />
      </div>
    </div>
  );
};

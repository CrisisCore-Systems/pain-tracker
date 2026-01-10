import { memo } from 'react';
import { format } from 'date-fns';
import { Cloud, Moon, Smile } from 'lucide-react';
import type { PainEntry } from '../../types';
import { ExtendedEntryDetails } from './EntryDetailsSections';

interface PainHistoryProps {
  entries: Pick<PainEntry, 'id' | 'timestamp' | 'baselineData' | 'notes' | 'weather' | 'qualityOfLife' | 'functionalImpact' | 'workImpact' | 'treatments' | 'comparison'>[];
}

const PainHistoryItem = memo(function PainHistoryItem({ entry }: { entry: PainHistoryProps['entries'][0] }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Pain Level: {entry.baselineData.pain}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
        </span>
      </div>
      {(entry.baselineData.locations?.length ?? 0) > 0 && (
        <div className="mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Locations: </span>
          {entry.baselineData.locations?.join(', ')}
        </div>
      )}
      {(entry.baselineData.symptoms?.length ?? 0) > 0 && (
        <div className="mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Symptoms: </span>
          {entry.baselineData.symptoms?.join(', ')}
        </div>
      )}
      {entry.qualityOfLife && (
        <div className="mb-2 flex items-center gap-4">
          {entry.qualityOfLife.sleepQuality !== undefined && (
            <div className="flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                Sleep {entry.qualityOfLife.sleepQuality}/10
              </span>
            </div>
          )}
          {entry.qualityOfLife.moodImpact !== undefined && (
            <div className="flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Mood {entry.qualityOfLife.moodImpact}/10
              </span>
            </div>
          )}
        </div>
      )}
      {entry.weather && (
        <div className="mb-2 flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-sm text-blue-600 dark:text-blue-400">{entry.weather}</span>
        </div>
      )}
      {entry.notes && (
        <div className="text-gray-700 dark:text-gray-300 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Notes: </span>
          {entry.notes}
        </div>
      )}
      {/* Extended details: functional impact, work impact, treatments, progression */}
      <ExtendedEntryDetails entry={entry} compact className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800" />
    </div>
  );
});

export function PainHistory({ entries }: PainHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <p className="text-gray-500 dark:text-gray-400">No entries yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">History</h2>
      <div className="space-y-4">
        {[...entries]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map(entry => (
            <PainHistoryItem key={entry.id} entry={entry} />
          ))}
      </div>
    </div>
  );
}

import { format } from "date-fns";
import type { PainEntry } from "../../types";

interface PainHistoryProps {
  entries: Pick<PainEntry, "id" | "timestamp" | "baselineData" | "notes">[];
}

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
          .map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Pain Level: {entry.baselineData.pain}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {format(new Date(entry.timestamp), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              {(entry.baselineData.locations?.length ?? 0) > 0 && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Locations: </span>
                  {entry.baselineData.locations?.join(", ")}
                </div>
              )}
              {(entry.baselineData.symptoms?.length ?? 0) > 0 && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Symptoms: </span>
                  {entry.baselineData.symptoms?.join(", ")}
                </div>
              )}
              {entry.notes && (
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Notes: </span>
                  {entry.notes}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

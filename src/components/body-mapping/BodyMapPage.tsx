import { useState } from 'react';
import { InteractiveBodyMap } from './InteractiveBodyMap';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

export function BodyMapPage() {
  const { entries, addEntry } = usePainTrackerStore();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Get recent locations from entries
  const recentLocations = entries
    .slice(0, 5)
    .flatMap(e => e.baselineData?.locations || [])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

  const handleSaveEntry = async () => {
    if (selectedRegions.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      await addEntry({
        baselineData: {
          pain: painLevel,
          locations: selectedRegions,
          symptoms: []
        },
        notes: notes || undefined
      });

      // Reset form
      setSelectedRegions([]);
      setPainLevel(5);
      setNotes('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Body Map
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Click on the body diagram to select pain locations
        </p>
      </div>

      {/* Quick Access to Recent Locations */}
      {recentLocations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Recent Locations
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentLocations.map((location, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!selectedRegions.includes(location)) {
                    setSelectedRegions([...selectedRegions, location]);
                  }
                }}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Body Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <InteractiveBodyMap
          selectedRegions={selectedRegions}
          onRegionSelect={setSelectedRegions}
          mode="selection"
        />
      </div>

      {/* Selected Regions Display */}
      {selectedRegions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Selected Areas ({selectedRegions.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-md text-sm"
              >
                {region}
                <button
                  onClick={() => setSelectedRegions(selectedRegions.filter(r => r !== region))}
                  className="hover:text-blue-700 dark:hover:text-blue-300"
                  aria-label={`Remove ${region}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Pain Level Slider */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pain Level: {painLevel}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>No Pain</span>
              <span>Worst Pain</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your pain, triggers, or any relevant details..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button
              onClick={handleSaveEntry}
              disabled={isSaving || selectedRegions.length === 0}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedRegions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select Pain Locations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Click on the body diagram above to mark where you're experiencing pain
          </p>
        </div>
      )}
    </div>
  );
}

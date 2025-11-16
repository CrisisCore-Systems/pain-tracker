import { useState } from "react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PAIN_LOCATIONS, SYMPTOMS } from "../utils/constants";
import useLocalStorage from "../hooks/useLocalStorage";
import classNames from "classnames";
import type { PainEntry } from "../types";
import { chartColors } from "../design-system/utils/chart-colors";
import { PainAnalytics } from "./pain-tracker/PainAnalytics";
import { useReducedMotion } from "../design-system/utils/accessibility";

type SimplePainEntry = PainEntry;

type ActiveTab = 'entry' | 'analytics';

function PainTracker() {
  const [entries, setEntries] = useLocalStorage<SimplePainEntry[]>("painEntries", []);
  const [currentPain, setCurrentPain] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>('entry');
  const [limitedActivities, setLimitedActivities] = useState<string[]>([]);
  const [assistanceNeeded, setAssistanceNeeded] = useState<string[]>([]);
  const [mobilityAids, setMobilityAids] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [moodImpact, setMoodImpact] = useState(5);
  const [missedWork, setMissedWork] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleAddEntry = () => {
    const newEntry: PainEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      baselineData: {
        pain: currentPain,
        locations: selectedLocations,
        symptoms: selectedSymptoms
      },
      functionalImpact: {
        limitedActivities,
        assistanceNeeded,
        mobilityAids
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: ''
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: []
      },
      qualityOfLife: {
        sleepQuality,
        moodImpact,
        socialImpact: []
      },
      workImpact: {
        missedWork,
        modifiedDuties: [],
        workLimitations: []
      },
      comparison: {
        worseningSince: '',
        newLimitations: []
      },
      notes
    };
    setEntries([...entries, newEntry]);
    
    // Reset form
    setCurrentPain(0);
    setSelectedLocations([]);
    setSelectedSymptoms([]);
    setLimitedActivities([]);
    setAssistanceNeeded([]);
    setMobilityAids([]);
    setSleepQuality(5);
    setMoodImpact(5);
    setMissedWork(0);
    setNotes("");
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const chartData = entries
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(entry => ({
      timestamp: format(new Date(entry.timestamp), "MM/dd HH:mm"),
      pain: entry.baselineData.pain,
    }));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('entry')}
              className={classNames(
                activeTab === 'entry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              )}
            >
              Record Pain
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={classNames(
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              )}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'entry' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Record Current Pain Level</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pain Level: {currentPain}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={currentPain}
                    onChange={(e) => setCurrentPain(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="grid grid-cols-11 w-full text-xs text-gray-500 dark:text-gray-400 px-1">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className="text-center">{i}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAIN_LOCATIONS.map((location: string) => (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      type="button"
                      className={classNames(
                        "px-3 py-1 rounded-full text-sm",
                        selectedLocations.includes(location)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((symptom: string) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      type="button"
                      className={classNames(
                        "px-3 py-1 rounded-full text-sm",
                        selectedSymptoms.includes(symptom)
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limited Activities
                </label>
                <input
                  type="text"
                  placeholder="Enter activities (comma-separated)"
                  className="w-full border rounded p-2"
                  value={limitedActivities.join(', ')}
                  onChange={(e) => setLimitedActivities(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sleep Quality (0-10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mood Impact (0-10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={moodImpact}
                  onChange={(e) => setMoodImpact(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Missed Work (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={missedWork}
                  onChange={(e) => setMissedWork(parseInt(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddEntry}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Add Entry
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pain History</h2>

            {chartData.length > 0 ? (
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pain" stroke={chartColors.analytics.trend} strokeWidth={3} dot={{ fill: chartColors.analytics.trend, strokeWidth: 2, r: 4 }} isAnimationActive={!prefersReducedMotion} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No pain entries yet
              </div>
            )}

            <div className="space-y-4">
              {entries
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
                    {entry.baselineData?.locations && entry.baselineData.locations.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Locations: </span>
                        {entry.baselineData.locations.join(", ")}
                      </div>
                    )}
                    {entry.baselineData?.symptoms && entry.baselineData.symptoms.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Symptoms: </span>
                        {entry.baselineData.symptoms.join(", ")}
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
        </div>
      ) : (
        <PainAnalytics entries={entries} />
      )}
    </div>
  );
}

export default PainTracker;

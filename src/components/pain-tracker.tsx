import { useState } from "react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PAIN_LOCATIONS, SYMPTOMS } from "../utils/constants";
import useLocalStorage from "../hooks/useLocalStorage";
import classNames from "classnames";
import type { PainEntry } from "../types";

type SimplePainEntry = Pick<PainEntry, "id" | "timestamp" | "baselineData" | "notes">;

function PainTracker() {
  const [entries, setEntries] = useLocalStorage<SimplePainEntry[]>("painEntries", []);
  const [currentPain, setCurrentPain] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const handleAddEntry = () => {
    const newEntry: SimplePainEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      baselineData: {
        pain: currentPain,
        locations: selectedLocations,
        symptoms: selectedSymptoms
      },
      notes
    };
    setEntries([...entries, newEntry]);

    setCurrentPain(0);
    setSelectedLocations([]);
    setSelectedSymptoms([]);
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pain Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Record Current Pain Level</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="grid grid-cols-11 w-full text-xs text-gray-500 px-1">
                  {[...Array(11)].map((_, i) => (
                    <div key={i} className="text-center">{i}</div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <Line type="monotone" dataKey="pain" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No pain entries yet
            </div>
          )}

          <div className="space-y-4">
            {entries
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Pain Level: {entry.baselineData.pain}</span>
                    <span className="text-gray-500">
                      {format(new Date(entry.timestamp), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  {entry.baselineData.locations.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Locations: </span>
                      {entry.baselineData.locations.join(", ")}
                    </div>
                  )}
                  {entry.baselineData.symptoms.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Symptoms: </span>
                      {entry.baselineData.symptoms.join(", ")}
                    </div>
                  )}
                  {entry.notes && (
                    <div className="text-gray-700">
                      <span className="text-sm text-gray-600">Notes: </span>
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PainTracker;

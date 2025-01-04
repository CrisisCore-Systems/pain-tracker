import { useState, useEffect, useRef } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import type { PainEntry } from "../../types";
import { PainChart } from "./PainChart";
import { PainHistory } from "./PainHistory";
import { PainEntryForm } from "./PainEntryForm";
import { WCBReportGenerator } from "./WCBReport";

const validatePainEntry = (entry: Partial<PainEntry>): boolean => {
  if (!entry.baselineData) return false;
  
  const { pain } = entry.baselineData;
  if (typeof pain !== 'number' || pain < 0 || pain > 10) return false;

  if (entry.qualityOfLife) {
    const { sleepQuality, moodImpact } = entry.qualityOfLife;
    if (
      typeof sleepQuality !== 'number' || sleepQuality < 0 || sleepQuality > 10 ||
      typeof moodImpact !== 'number' || moodImpact < 0 || moodImpact > 10
    ) {
      return false;
    }
  }

  return true;
};

export function PainTracker() {
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [showWCBReport, setShowWCBReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    end: new Date().toISOString().split("T")[0]
  });

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  // Handle localStorage separately to catch errors
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem("painEntries");
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (err) {
      setError("Unable to load pain entries. Please try refreshing the page.");
      console.error("Error loading pain entries:", err);
    }
  }, []);

  // Focus management for WCB report
  useEffect(() => {
    if (showWCBReport && startDateRef.current) {
      startDateRef.current.focus();
    }
  }, [showWCBReport]);

  const handleAddEntry = (entryData: Partial<PainEntry>) => {
    try {
      // Validate entry data
      if (!validatePainEntry(entryData)) {
        setError("Invalid pain entry data. Please check your input values.");
        return;
      }

      const newEntry: PainEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        baselineData: {
          pain: 0,
          locations: [],
          symptoms: [],
          ...entryData.baselineData
        },
        functionalImpact: {
          limitedActivities: [],
          assistanceNeeded: [],
          mobilityAids: [],
          ...entryData.functionalImpact
        },
        medications: {
          current: [],
          changes: "",
          effectiveness: "",
          ...entryData.medications
        },
        treatments: {
          recent: [],
          effectiveness: "",
          planned: [],
          ...entryData.treatments
        },
        qualityOfLife: {
          sleepQuality: 0,
          moodImpact: 0,
          socialImpact: [],
          ...entryData.qualityOfLife
        },
        workImpact: {
          missedWork: 0,
          modifiedDuties: [],
          workLimitations: [],
          ...entryData.workImpact
        },
        comparison: {
          worseningSince: "",
          newLimitations: [],
          ...entryData.comparison
        },
        notes: entryData.notes || "",
      };

      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      // Save to localStorage
      try {
        localStorage.setItem("painEntries", JSON.stringify(updatedEntries));
        setError(null);
      } catch (err) {
        setError("Failed to save entry. Your changes may not persist after refresh.");
        console.error("Error saving to localStorage:", err);
      }
    } catch (err) {
      setError("Failed to add pain entry. Please try again.");
      console.error("Error adding pain entry:", err);
    }
  };

  const handleToggleReport = () => {
    setShowWCBReport(!showWCBReport);
    if (!showWCBReport) {
      // Will focus start date input via useEffect
    } else {
      // Focus back on toggle button when closing
      toggleButtonRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleReport();
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert" aria-live="polite">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pain Tracker</h1>
        <button
          ref={toggleButtonRef}
          onClick={handleToggleReport}
          onKeyDown={handleKeyDown}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          type="button"
          aria-expanded={showWCBReport}
          aria-controls="wcb-report-section"
        >
          {showWCBReport ? "Hide WCB Report" : "Show WCB Report"}
        </button>
      </div>

      {showWCBReport && (
        <section id="wcb-report-section" className="mb-8" aria-label="WCB Report">
          <div className="mb-4 flex gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                ref={startDateRef}
                id="start-date"
                type="date"
                value={reportPeriod.start}
                onChange={(e) => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                className="border rounded px-2 py-1"
                aria-label="Report start date"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={reportPeriod.end}
                onChange={(e) => setReportPeriod(prev => ({ ...prev, end: e.target.value }))}
                className="border rounded px-2 py-1"
                aria-label="Report end date"
              />
            </div>
          </div>
          <WCBReportGenerator entries={entries} period={reportPeriod} />
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PainEntryForm onSubmit={handleAddEntry} />
        <PainChart entries={entries} />
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8" role="status">No pain entries yet. Add your first entry using the form above.</p>
      ) : (
        <PainHistory entries={entries} />
      )}
    </main>
  );
}

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
    <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Error message - mobile optimized */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg shadow-sm" role="alert" aria-live="polite">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header section with mobile-responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Pain Tracker</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage your pain levels</p>
        </div>
        
        {/* Mobile-optimized WCB Report toggle */}
        <button
          ref={toggleButtonRef}
          onClick={handleToggleReport}
          onKeyDown={handleKeyDown}
          className="touch-target w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
          aria-expanded={showWCBReport}
          aria-controls="wcb-report-section"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className={`w-4 h-4 transition-transform ${showWCBReport ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showWCBReport ? "Hide WCB Report" : "Show WCB Report"}
          </span>
        </button>
      </div>

      {/* WCB Report section - mobile optimized */}
      {showWCBReport && (
        <section id="wcb-report-section" className="bg-white rounded-lg shadow-sm overflow-hidden" aria-label="WCB Report">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">WCB Report Generator</h2>
            
            {/* Mobile-responsive date inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  ref={startDateRef}
                  id="start-date"
                  type="date"
                  value={reportPeriod.start}
                  onChange={(e) => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                  className="form-mobile focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Report start date"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={reportPeriod.end}
                  onChange={(e) => setReportPeriod(prev => ({ ...prev, end: e.target.value }))}
                  className="form-mobile focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Report end date"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <WCBReportGenerator entries={entries} period={reportPeriod} />
          </div>
        </section>
      )}

      {/* Main content grid - mobile-first responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="order-1">
          <PainEntryForm onSubmit={handleAddEntry} />
        </div>
        <div className="order-2">
          <PainChart entries={entries} />
        </div>
      </div>

      {/* History section */}
      <div className="bg-white rounded-lg shadow-sm">
        {entries.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pain entries yet</h3>
            <p className="text-gray-600 max-w-md mx-auto" role="status">
              Get started by adding your first pain entry using the form above. Track your pain levels, symptoms, and treatments over time.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <PainHistory entries={entries} />
          </div>
        )}
      </div>
    </div>
  );
}

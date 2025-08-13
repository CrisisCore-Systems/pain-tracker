import { useState, useEffect, useRef } from "react";

import type { PainEntry } from "../../types";
import { PainChart } from "./PainChart";
import { PainHistory } from "./PainHistory";
import { PainEntryForm } from "./PainEntryForm";
import { WCBReportGenerator } from "./WCBReport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, ThemeToggle } from "../../design-system";
import { FileText, Plus, Activity, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Pain Tracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                ref={toggleButtonRef}
                onClick={handleToggleReport}
                onKeyDown={handleKeyDown}
                variant="outline"
                className="hidden sm:flex"
                type="button"
                aria-expanded={showWCBReport}
                aria-controls="wcb-report-section"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showWCBReport ? "Hide WCB Report" : "Show WCB Report"}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2" role="alert" aria-live="polite">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <strong className="font-semibold text-destructive">Error: </strong>
                  <span className="text-destructive">{error}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showWCBReport && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>WCB Report</span>
              </CardTitle>
              <CardDescription>
                Generate a comprehensive report for WorkSafe BC submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-2">
                    Start Date
                  </label>
                  <input
                    ref={startDateRef}
                    id="start-date"
                    type="date"
                    value={reportPeriod.start}
                    onChange={(e) => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Report start date"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-foreground mb-2">
                    End Date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={reportPeriod.end}
                    onChange={(e) => setReportPeriod(prev => ({ ...prev, end: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Report end date"
                  />
                </div>
              </div>
              <WCBReportGenerator entries={entries} period={reportPeriod} />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Record Pain Entry</span>
              </CardTitle>
              <CardDescription>
                Track your pain levels, symptoms, and daily impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PainEntryForm onSubmit={handleAddEntry} />
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Pain History Chart</CardTitle>
              <CardDescription>
                Visual representation of your pain patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PainChart entries={entries} />
            </CardContent>
          </Card>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No pain entries yet</h3>
                <p className="text-muted-foreground mb-4">Start tracking your pain by adding your first entry above.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pain History</CardTitle>
              <CardDescription>
                Detailed view of all your pain entries and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PainHistory entries={entries} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

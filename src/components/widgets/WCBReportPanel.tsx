import { useRef, useEffect } from "react";
import { FileText } from "lucide-react";
import type { PainEntry } from "../../types";
import { WCBReportGenerator } from "../pain-tracker/WCBReport";
import { isFeatureEnabled } from '../../config/beta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../design-system";
import { usePainTrackerStore } from "../../stores/pain-tracker-store";

interface WCBReportPanelProps {
  entries: PainEntry[];
}

export function WCBReportPanel({ entries }: WCBReportPanelProps) {
  const { ui, setReportPeriod } = usePainTrackerStore();
  const startDateRef = useRef<HTMLInputElement>(null);

  // Focus management for WCB report
  useEffect(() => {
    if (startDateRef.current) {
      startDateRef.current.focus();
    }
  }, []);

  return (
    <Card className="mb-8" id="wcb-report-section">
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
              value={ui.reportPeriod.start}
              onChange={(e) => setReportPeriod({ start: e.target.value })}
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
              value={ui.reportPeriod.end}
              onChange={(e) => setReportPeriod({ end: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Report end date"
            />
          </div>
        </div>
        {isFeatureEnabled('workSafeBCExport') ? (
          <WCBReportGenerator entries={entries} period={ui.reportPeriod} />
        ) : (
          <div className="text-sm text-muted-foreground p-4 bg-muted/5 rounded">WorkSafe BC report export is not available in this release.</div>
        )}
      </CardContent>
    </Card>
  );
}
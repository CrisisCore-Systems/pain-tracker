import { useRef, useEffect, useState, useMemo } from 'react';
import { FileText, Eye, FileDown } from 'lucide-react';
import type { PainEntry } from '../../types';
import type { WCBReport } from '../../types';
import { WCBReportGenerator } from '../pain-tracker/WCBReport';
import { WCBReportPreview } from '../pain-tracker/WCBReportPreview';
import { isFeatureEnabled } from '../../config/features';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { analyzeTreatmentChanges, analyzeWorkImpact } from '../../utils/wcbAnalytics';

interface WCBReportPanelProps {
  entries: PainEntry[];
}

export function WCBReportPanel({ entries }: WCBReportPanelProps) {
  const { ui, setReportPeriod } = usePainTrackerStore();
  const startDateRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Focus management for WCB report
  useEffect(() => {
    if (startDateRef.current) {
      startDateRef.current.focus();
    }
  }, []);

  // Generate WCB report for preview
  const wcbReport = useMemo((): WCBReport | null => {
    if (!showPreview) return null;
    
    const periodStart = new Date(ui.reportPeriod.start);
    const periodEnd = new Date(ui.reportPeriod.end);
    
    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
      return null;
    }

    const filteredEntries = entries.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= periodStart && timestamp <= periodEnd;
    });

    if (filteredEntries.length === 0) return null;

    const painLevels = filteredEntries.map(e => e.baselineData.pain);
    const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;
    
    const locations = filteredEntries.reduce((acc, e) => {
      e.baselineData.locations?.forEach(loc => {
        acc[loc] = (acc[loc] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const workImpact = analyzeWorkImpact(filteredEntries);
    const treatments = analyzeTreatmentChanges(filteredEntries);

    const accommodationsNeeded = Array.from(
      new Set(filteredEntries.flatMap(entry => entry.workImpact?.modifiedDuties ?? []))
    ).sort();

    return {
      id: `wcb-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      period: ui.reportPeriod,
      painTrends: {
        average: Math.round(avgPain * 10) / 10,
        progression: [],
        locations,
      },
      workImpact: {
        missedDays: workImpact.missedDays,
        limitations: workImpact.commonLimitations,
        accommodationsNeeded,
      },
      functionalAnalysis: {
        limitations: [],
        deterioration: [],
        improvements: [],
      },
      treatments: {
        current: treatments,
        effectiveness: 'See detailed treatment analysis.',
      },
      recommendations: ['Continue monitoring pain levels', 'Follow up with healthcare provider'],
    };
  }, [showPreview, entries, ui.reportPeriod]);

  return (
    <Card className="mb-8" id="wcb-report-section">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>WCB Report</span>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Generate a comprehensive report for WorkSafe BC submission</span>
          {isFeatureEnabled('workSafeBCExport') && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
              aria-pressed={showPreview}
            >
              {showPreview ? <FileDown className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Show Editor' : 'Show Preview'}
            </button>
          )}
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
              onChange={e => setReportPeriod({ start: e.target.value })}
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
              onChange={e => setReportPeriod({ end: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Report end date"
            />
          </div>
        </div>
        {isFeatureEnabled('workSafeBCExport') ? (
          showPreview && wcbReport ? (
            <WCBReportPreview report={wcbReport} />
          ) : (
            <WCBReportGenerator entries={entries} period={ui.reportPeriod} />
          )
        ) : (
          <div className="text-sm text-muted-foreground p-4 bg-muted/5 rounded">
            WorkSafe BC report export is not available in this release.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

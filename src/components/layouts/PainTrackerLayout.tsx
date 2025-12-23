import { AlertCircle, FileText, HelpCircle } from 'lucide-react';
import { PainTrackerIcon } from '../branding/BrandedLogo';
import type { PainEntry } from '../../types';
import { PainEntryWidget } from '../widgets/PainEntryWidget';
import { EnhancedPainVisualizationPanel } from '../widgets/EnhancedPainVisualizationPanel';
import { PainHistoryPanel } from '../widgets/PainHistoryPanel';
import { lazy, Suspense } from 'react';
import { EmptyStatePanel } from '../widgets/EmptyStatePanel';
import { Card, CardContent, Button, ThemeToggle } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

// Lazy load WCBReportPanel to defer PDF library loading (Phase 3 optimization)
const WCBReportPanel = lazy(() =>
  import('../widgets/WCBReportPanel').then(m => ({ default: m.WCBReportPanel }))
);

interface PainTrackerLayoutProps {
  entries: PainEntry[];
  error: string | null;
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
}

export function PainTrackerLayout({
  entries,
  error,
  onAddEntry,
  onStartWalkthrough,
}: PainTrackerLayoutProps) {
  const { ui, setShowWCBReport } = usePainTrackerStore();

  const handleToggleReport = () => {
    setShowWCBReport(!ui.showWCBReport);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <PainTrackerIcon size={32} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pain Tracker</h1>
                <div className="text-xs text-muted-foreground font-medium tracking-wide">
                  PRIVACY-FIRST PAIN TRACKING
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={onStartWalkthrough}
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                type="button"
                aria-label="Start interactive tutorial"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button
                onClick={handleToggleReport}
                variant="outline"
                className="hidden sm:flex"
                type="button"
                aria-expanded={ui.showWCBReport}
                aria-controls="wcb-report-section"
              >
                <FileText className="h-4 w-4 mr-2" />
                {ui.showWCBReport ? 'Hide WCB Report' : 'Show WCB Report'}
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

        {ui.showWCBReport && (
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center p-8"
                role="status"
                aria-live="polite"
              >
                <div className="animate-pulse">Loading WCB Report...</div>
              </div>
            }
          >
            <WCBReportPanel entries={entries} />
          </Suspense>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <PainEntryWidget onSubmit={onAddEntry} />
          <EnhancedPainVisualizationPanel entries={entries} />
        </div>

        {entries.length === 0 ? (
          <EmptyStatePanel onStartWalkthrough={onStartWalkthrough} />
        ) : (
          <PainHistoryPanel entries={entries} />
        )}
      </main>
    </div>
  );
}

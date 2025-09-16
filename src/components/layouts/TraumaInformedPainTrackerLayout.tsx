/**
 * Enhanced Pain Tracker Layout with Trauma-Informed UX
 * Integrates existing pain tracker functionality with trauma-informed design patterns
 */

import React from 'react';
import { AlertCircle, FileText, HelpCircle, Settings } from "lucide-react";
import { PainTrackerIcon } from '../branding/BrandedLogo';
import type { PainEntry } from "../../types";
import { PainEntryWidget } from "../widgets/PainEntryWidget";
import { EnhancedPainVisualizationPanel } from "../widgets/EnhancedPainVisualizationPanel";
import { PainHistoryPanel } from "../widgets/PainHistoryPanel";
import { WCBReportPanel } from "../widgets/WCBReportPanel";
import { EmptyStatePanel } from "../widgets/EmptyStatePanel";
import { Card, CardContent, ThemeToggle } from "../../design-system";
import { usePainTrackerStore } from "../../stores/pain-tracker-store";
import { 
  TraumaInformedSection, 
  ProgressiveDisclosure, 
  MemoryAid, 
  ComfortPrompt,
  TouchOptimizedButton,
  useTraumaInformed,
  AccessibilitySettingsPanel
} from "../accessibility";

interface TraumaInformedPainTrackerLayoutProps {
  entries: PainEntry[];
  error: string | null;
  onAddEntry: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
  onStartWalkthrough: () => void;
}

export function TraumaInformedPainTrackerLayout({
  entries,
  error,
  onAddEntry,
  onStartWalkthrough
}: TraumaInformedPainTrackerLayoutProps) {
  const { preferences } = useTraumaInformed();
  const [showSettings, setShowSettings] = React.useState(false);
  
  const { 
    ui,
    setShowWCBReport
  } = usePainTrackerStore();

  const handleToggleReport = () => {
    setShowWCBReport(!ui.showWCBReport);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Header with trauma-informed improvements */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <PainTrackerIcon size={32} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pain Tracker</h1>
                <div className="text-xs text-muted-foreground font-medium tracking-wide">
                  AI-POWERED PAIN MANAGEMENT
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Accessibility Settings Button */}
              <TouchOptimizedButton
                onClick={() => setShowSettings(!showSettings)}
                variant="secondary"
                size="normal"
                aria-label="Open accessibility settings"
                aria-expanded={showSettings}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TouchOptimizedButton>

              {/* Help Button - Enhanced for trauma-informed UX */}
              <TouchOptimizedButton
                onClick={onStartWalkthrough}
                variant="secondary"
                size="normal"
                aria-label="Get help and tutorial"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Help</span>
              </TouchOptimizedButton>

              {/* WCB Report Toggle */}
              <TouchOptimizedButton
                onClick={handleToggleReport}
                variant="secondary"
                size="normal"
                aria-expanded={ui.showWCBReport}
                aria-controls="wcb-report-section"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {ui.showWCBReport ? "Hide Report" : "Show Report"}
                </span>
              </TouchOptimizedButton>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowSettings(false)}
              aria-hidden="true"
            />

            {/* Settings panel */}
            <div className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Accessibility & Comfort Settings
                </h2>
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  ✕
                </TouchOptimizedButton>
              </div>
              
              <AccessibilitySettingsPanel />
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Comfort Prompt */}
        {preferences.showComfortPrompts && (
          <div className="mb-6">
            <ComfortPrompt />
          </div>
        )}

        {/* Memory Aid for new users */}
        {preferences.showMemoryAids && entries.length === 0 && (
          <div className="mb-6">
            <MemoryAid
              text="Welcome! Start by recording your current pain level. Your information is automatically saved as you go, so you can take breaks anytime."
              type="tip"
            />
          </div>
        )}

        {/* Error Display with Gentle Language */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2" role="alert" aria-live="polite">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  {preferences.gentleLanguage ? (
                    <>
                      <strong className="font-semibold text-destructive">Something didn't work: </strong>
                      <span className="text-destructive">
                        We encountered an issue. Please try again when you're ready. Your data is safe.
                      </span>
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-destructive">Error: </strong>
                      <span className="text-destructive">{error}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WCB Report Section */}
        {ui.showWCBReport && (
          <TraumaInformedSection
            title="Workers' Compensation Report"
            description="Generate reports for your workers' compensation claim"
            importance="normal"
            canCollapse={preferences.simplifiedMode}
          >
            <WCBReportPanel entries={entries} />
          </TraumaInformedSection>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Pain Entry Section */}
          <TraumaInformedSection
            title="Record Your Pain"
            description="Track your current pain level and symptoms"
            importance="high"
            canCollapse={false}
          >
            <PainEntryWidget onSubmit={onAddEntry} />
          </TraumaInformedSection>

          {/* Visualization Section */}
          {preferences.simplifiedMode ? (
            <ProgressiveDisclosure
              title="Pain Visualization"
              level="helpful"
              memoryAid="View charts and graphs of your pain patterns"
              defaultOpen={entries.length > 0}
            >
              <EnhancedPainVisualizationPanel entries={entries} />
            </ProgressiveDisclosure>
          ) : (
            <TraumaInformedSection
              title="Pain Visualization"
              description="View patterns in your pain levels over time"
              importance="normal"
              canCollapse={false}
            >
              <EnhancedPainVisualizationPanel entries={entries} />
            </TraumaInformedSection>
          )}
        </div>

        {/* History or Empty State */}
        {entries.length === 0 ? (
          <TraumaInformedSection
            title="Getting Started"
            description="You haven't recorded any pain entries yet"
            importance="high"
            canCollapse={false}
          >
            <EmptyStatePanel onStartWalkthrough={onStartWalkthrough} />
          </TraumaInformedSection>
        ) : (
          <TraumaInformedSection
            title="Pain History"
            description={`Your ${entries.length} recorded pain ${entries.length === 1 ? 'entry' : 'entries'}`}
            importance="normal"
            canCollapse={preferences.simplifiedMode}
          >
            <PainHistoryPanel entries={entries} />
          </TraumaInformedSection>
        )}

        {/* Additional Memory Aid for users with multiple entries */}
        {preferences.showMemoryAids && entries.length >= 3 && (
          <div className="mt-6">
            <MemoryAid
              text="Great progress! You've been consistently tracking your pain. Look for patterns in your data to share with your healthcare provider."
              type="reminder"
            />
          </div>
        )}
      </main>

      {/* Footer with supportive messaging */}
      <footer className="bg-card/50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {preferences.gentleLanguage ? (
                "Your health journey matters. You're doing great by tracking your symptoms."
              ) : (
                "Pain Tracker - Manage your health information"
              )}
            </div>
            
            {preferences.showComfortPrompts && (
              <div className="text-sm text-muted-foreground">
                Remember to be gentle with yourself
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

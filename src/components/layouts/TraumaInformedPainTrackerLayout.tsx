/**
 * Enhanced Trauma-Informed Pain Tracker Layout with Modern UX
 * Integrates existing pain tracker functionality with modern design patterns
 */

import React from 'react';
import { AlertCircle, HelpCircle, Settings, BarChart3, Calendar, TrendingUp } from "lucide-react";
import { PainTrackerIcon } from '../branding/BrandedLogo';
import type { PainEntry } from "../../types";
import { PainHistoryPanel } from "../widgets/PainHistoryPanel";
import { AdvancedAnalyticsDashboard } from "../analytics/AdvancedAnalyticsDashboard";
import { DataExportModal } from "../export/DataExportModal";
import { CustomizableDashboard } from "../dashboard/CustomizableDashboard";
import { GoalManagerModal } from "../goals/GoalManagerModal";
import { Card, CardContent, Button, Badge, ThemeToggle } from "../../design-system";
import {
  MemoryAid,
  ComfortPrompt,
  TouchOptimizedButton,
  useTraumaInformed,
  AccessibilitySettingsPanel
} from "../accessibility";
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { DashboardPullToRefresh } from '../ui/PullToRefresh';
import { VoiceInput, TextToSpeechButton, GestureHint, useMobileAccessibility, HighContrastToggle } from '../accessibility/MobileAccessibility';

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
  const { preferences: mobilePrefs, updatePreferences: updateMobilePrefs } = useMobileAccessibility();
  const [showSettings, setShowSettings] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'dashboard' | 'analytics' | 'history'>('dashboard');
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showGoalManager, setShowGoalManager] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [showGestureHint, setShowGestureHint] = React.useState(true);

  // Pull to refresh handler
  const handlePullToRefresh = React.useCallback(async () => {
    // Simulate data refresh - in a real app, this would sync with server
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());

    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }, []);

  // Swipe gesture for navigation
  const swipeGesture = useSwipeGesture(
    { threshold: 75, velocity: 0.5 },
    {
      onSwipeLeft: () => {
        // Navigate to next view
        if (activeView === 'dashboard') setActiveView('analytics');
        else if (activeView === 'analytics') setActiveView('history');
      },
      onSwipeRight: () => {
        // Navigate to previous view
        if (activeView === 'history') setActiveView('analytics');
        else if (activeView === 'analytics') setActiveView('dashboard');
      },
    }
  );

  // Voice input handler
  const handleVoiceInput = React.useCallback((text: string) => {
    // Simple voice command processing
    const command = text.toLowerCase().trim();

    if (command.includes('dashboard') || command.includes('home')) {
      setActiveView('dashboard');
    } else if (command.includes('analytics') || command.includes('charts')) {
      setActiveView('analytics');
    } else if (command.includes('history') || command.includes('past')) {
      setActiveView('history');
    } else if (command.includes('settings') || command.includes('accessibility')) {
      setShowSettings(true);
    } else if (command.includes('help') || command.includes('tutorial')) {
      onStartWalkthrough();
    }

    // Haptic feedback for successful command
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, [onStartWalkthrough]);

  // Hide gesture hint after first interaction
  React.useEffect(() => {
    const timer = setTimeout(() => setShowGestureHint(false), 10000); // Hide after 10 seconds
    return () => clearTimeout(timer);
  }, []);



  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Detailed insights and trends' },
    { id: 'history', label: 'History', icon: Calendar, description: 'Past entries and patterns' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 shadow-lg"
      >
        Skip to main content
      </a>

      {/* Modern Header with Navigation */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <PainTrackerIcon size={40} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pain Tracker Pro</h1>
                <div className="text-xs text-muted-foreground font-medium tracking-wide">
                  AI-POWERED PAIN MANAGEMENT
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(item.id as 'dashboard' | 'analytics' | 'history')}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{entries.length} entries</span>
                </div>
                {entries.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Last: {new Date(entries[entries.length - 1]?.timestamp || '').toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {/* Voice Input for Mobile Accessibility */}
              {mobilePrefs.voiceInput && (
                <VoiceInput
                  onResult={handleVoiceInput}
                  placeholder="Voice commands..."
                  language="en-US"
                />
              )}

              {/* High Contrast Toggle */}
              <HighContrastToggle />

              {/* Accessibility Settings Button */}
              <TouchOptimizedButton
                onClick={() => setShowSettings(!showSettings)}
                variant="secondary"
                size="normal"
                aria-label="Open accessibility settings"
                aria-expanded={showSettings}
              >
                <Settings className="h-4 w-4" />
              </TouchOptimizedButton>

              {/* Help Button */}
              <TouchOptimizedButton
                onClick={onStartWalkthrough}
                variant="secondary"
                size="normal"
                aria-label="Get help and tutorial"
              >
                <HelpCircle className="h-4 w-4" />
              </TouchOptimizedButton>

              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <nav className="flex space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(item.id as 'dashboard' | 'analytics' | 'history')}
                  className="flex-1 flex items-center justify-center space-x-1"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
              aria-hidden="true"
            />

            {/* Settings panel */}
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-card-foreground">
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

      <main 
        id="main-content" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 swipe-indicator"
        ref={swipeGesture.ref}
      >
        <DashboardPullToRefresh
          onRefresh={handlePullToRefresh}
          lastRefresh={lastRefresh}
        >
        {/* Gesture Hint for Mobile Users */}
        <GestureHint
          gesture="swipe"
          direction="left"
          description="Swipe to navigate between views"
          show={showGestureHint && window.innerWidth < 768}
        />

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

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <CustomizableDashboard
            entries={entries}
            onAddEntry={onAddEntry}
            onStartWalkthrough={onStartWalkthrough}
            onOpenGoalManager={() => setShowGoalManager(true)}
          />
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Advanced Analytics Dashboard</h2>
                <p className="text-muted-foreground">Predictive insights and advanced visualizations for your pain journey</p>
              </div>
              <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                Back to Dashboard
              </Button>
            </div>

            <AdvancedAnalyticsDashboard entries={entries} />
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Pain History</h2>
                <p className="text-muted-foreground">Complete history of your pain entries and patterns</p>
              </div>
              <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                Back to Dashboard
              </Button>
            </div>

            <PainHistoryPanel entries={entries} />
          </div>
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
        </DashboardPullToRefresh>
      </main>

      {/* Modern Footer */}
      <footer className="bg-card/50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              {preferences.gentleLanguage ? (
                "Your health journey matters. You're doing great by tracking your symptoms."
              ) : (
                "Pain Tracker Pro - Manage your health information with confidence"
              )}
            </div>

            <div className="flex items-center space-x-4">
              {preferences.showComfortPrompts && (
                <div className="text-sm text-muted-foreground">
                  Remember to be gentle with yourself
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>v2.0.0</span>
                <span>•</span>
                <span>Enhanced UX</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Data Export Modal */}
      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        entries={entries}
      />

      {/* Goal Manager Modal */}
      <GoalManagerModal
        isOpen={showGoalManager}
        onClose={() => setShowGoalManager(false)}
      />
    </div>
  );
}

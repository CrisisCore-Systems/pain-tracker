/**
 * Enhanced Trauma-Informed Pain Tracker Layout with Modern UX
 * Integrates existing pain tracker functionality with modern design patterns
 */

import React, { lazy, Suspense, useEffect, useRef } from 'react';
import {
  AlertCircle,
  HelpCircle,
  Settings,
  BarChart3,
  Calendar,
  TrendingUp,
  LifeBuoy,
} from 'lucide-react';
import { PainTrackerIcon } from '../branding/BrandedLogo';
import type { PainEntry } from '../../types';
import { Card, CardContent, Button, Badge, ThemeToggle } from '../../design-system';
import {
  MemoryAid,
  ComfortPrompt,
  TouchOptimizedButton,
  useTraumaInformed,
  AccessibilitySettingsPanel,
} from '../accessibility';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { DashboardPullToRefresh } from '../ui/PullToRefresh';
import {
  VoiceInput,
  GestureHint,
  useMobileAccessibility,
  HighContrastToggle,
} from '../accessibility/MobileAccessibility';
import MedicationReminders from '../MedicationReminders';
import AlertsSettings from '../AlertsSettings';
import AlertsActivityLog from '../AlertsActivityLog';
import { BrandedLoadingScreen } from '../branding/BrandedLoadingScreen';
import {
  trackUsageEvent,
  trackNavigation,
  trackSessionStart,
  incrementSessionAction,
} from '../../utils/usage-tracking';
import { trackAnalyticsTabViewed, trackProgressViewed } from '../../analytics/ga4-events';
import { trackFeatureUsed } from '../../services/AnalyticsTrackingService';

// Lazy load large view components for code splitting (Phase 2 optimization)
const PainHistoryPanel = lazy(() =>
  import('../widgets/PainHistoryPanel').then(m => ({ default: m.PainHistoryPanel }))
);
const AnalyticsDashboard = lazy(() =>
  import('../analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))
);
const ClinicalPDFExportButton = lazy(() =>
  import('../export/ClinicalPDFExportButton').then(m => ({ default: m.ClinicalPDFExportButton }))
);
const DataExportModal = lazy(() =>
  import('../export/DataExportModal').then(m => ({ default: m.DataExportModal }))
);
const CustomizableDashboard = lazy(() =>
  import('../dashboard/CustomizableDashboard').then(m => ({ default: m.CustomizableDashboard }))
);
const GoalManagerModal = lazy(() =>
  import('../goals/GoalManagerModal').then(m => ({ default: m.GoalManagerModal }))
);

interface TraumaInformedPainTrackerLayoutProps {
  entries: PainEntry[];
  error: string | null;
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
}

export function TraumaInformedPainTrackerLayout({
  entries,
  error,
  onAddEntry,
  onStartWalkthrough,
}: TraumaInformedPainTrackerLayoutProps) {
  const { preferences } = useTraumaInformed();
  const { preferences: mobilePrefs } = useMobileAccessibility();
  const [showSettings, setShowSettings] = React.useState(false);
  const [activeView, setActiveView] = React.useState<
    'dashboard' | 'analytics' | 'history' | 'support'
  >('dashboard');
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showGoalManager, setShowGoalManager] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [showGestureHint, setShowGestureHint] = React.useState(true);
  const previousView = useRef(activeView);

  // Track session start on mount
  useEffect(() => {
    trackSessionStart();
    trackUsageEvent('layout_mounted', 'session');
  }, []);

  // Track view changes
  useEffect(() => {
    if (previousView.current !== activeView) {
      // Track navigation flow
      trackNavigation(previousView.current, activeView);
      trackUsageEvent(activeView, 'navigation');
      incrementSessionAction();

      // GA4 analytics events
      if (activeView === 'analytics') {
        trackAnalyticsTabViewed('main');
        trackFeatureUsed('analytics_dashboard');
      } else if (activeView === 'history') {
        trackProgressViewed('history');
        trackFeatureUsed('pain_history');
      } else if (activeView === 'support') {
        trackFeatureUsed('support_tools');
      }

      previousView.current = activeView;
    }
  }, [activeView]);

  // Track settings panel
  useEffect(() => {
    if (showSettings) {
      trackUsageEvent('settings_opened', 'settings');
      trackFeatureUsed('settings_panel');
      incrementSessionAction();
    }
  }, [showSettings]);

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
        else if (activeView === 'history') setActiveView('support');
      },
      onSwipeRight: () => {
        // Navigate to previous view
        if (activeView === 'support') setActiveView('history');
        else if (activeView === 'history') setActiveView('analytics');
        else if (activeView === 'analytics') setActiveView('dashboard');
      },
    }
  );

  // Voice input handler
  const handleVoiceInput = React.useCallback(
    (text: string) => {
      // Simple voice command processing
      const command = text.toLowerCase().trim();

      if (command.includes('dashboard') || command.includes('home')) {
        setActiveView('dashboard');
      } else if (command.includes('analytics') || command.includes('charts')) {
        setActiveView('analytics');
      } else if (command.includes('history') || command.includes('past')) {
        setActiveView('history');
      } else if (
        command.includes('support') ||
        command.includes('care') ||
        command.includes('help tools')
      ) {
        setActiveView('support');
      } else if (command.includes('settings') || command.includes('accessibility')) {
        setShowSettings(true);
      } else if (command.includes('help') || command.includes('tutorial')) {
        onStartWalkthrough();
      }

      // Haptic feedback for successful command
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    },
    [onStartWalkthrough]
  );

  // Hide gesture hint after first interaction
  React.useEffect(() => {
    const timer = setTimeout(() => setShowGestureHint(false), 10000); // Hide after 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and quick actions',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Detailed insights and trends',
    },
    { id: 'history', label: 'History', icon: Calendar, description: 'Past entries and patterns' },
    {
      id: 'support',
      label: 'Support',
      icon: LifeBuoy,
      description: 'Reminders, alerts, and safety tools',
    },
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
      <header className="border-b border-border/40 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 sticky top-0 z-40 shadow-lg shadow-black/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <PainTrackerIcon size={40} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent">
                  Pain Tracker Pro
                </h1>
                <div className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  AI-Powered Pain Management
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() =>
                    setActiveView(item.id as 'dashboard' | 'analytics' | 'history' | 'support')
                  }
                  data-nav-target={item.id}
                  className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
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
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
                  >
                    Last:{' '}
                    {new Date(entries[entries.length - 1]?.timestamp || '').toLocaleDateString()}
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
                className="min-h-[44px] min-w-[44px]"
              >
                <Settings className="h-5 w-5" />
              </TouchOptimizedButton>

              {/* Help Button */}
              <TouchOptimizedButton
                onClick={onStartWalkthrough}
                variant="secondary"
                size="normal"
                aria-label="Get help and tutorial"
                className="min-h-[44px] min-w-[44px]"
              >
                <HelpCircle className="h-5 w-5" />
              </TouchOptimizedButton>

              <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-2 px-2">
            <nav className="flex space-x-1 overflow-x-auto">
              {navigationItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() =>
                    setActiveView(item.id as 'dashboard' | 'analytics' | 'history' | 'support')
                  }
                  className="flex-1 flex items-center justify-center space-x-1 min-h-[44px] min-w-[44px]"
                  aria-label={item.description}
                  data-nav-target={item.id}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs whitespace-nowrap">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 animate-[fadeIn_0.2s_ease-out]">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity duration-300 bg-background/90 backdrop-blur-md"
              onClick={() => setShowSettings(false)}
              aria-hidden="true"
            />

            {/* Settings panel */}
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all duration-300 transform bg-gradient-to-br from-card via-card/95 to-card backdrop-blur-xl shadow-2xl shadow-black/20 rounded-2xl border border-border/50 animate-[scaleIn_0.3s_ease-out]">
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 swipe-indicator relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/2 before:to-transparent before:pointer-events-none before:-z-10"
        ref={swipeGesture.ref}
      >
        <DashboardPullToRefresh onRefresh={handlePullToRefresh} lastRefresh={lastRefresh}>
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
            <Card className="mb-6 border-destructive/50 bg-destructive/5 animate-[fadeInDown_0.5s_ease-out] shadow-lg shadow-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2" role="alert" aria-live="polite">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    {preferences.gentleLanguage ? (
                      <>
                        <strong className="font-semibold text-destructive">
                          Something didn't work:{' '}
                        </strong>
                        <span className="text-destructive">
                          We encountered an issue. Please try again when you're ready. Your data is
                          safe.
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
            <div className="space-y-6">
              <Suspense fallback={<BrandedLoadingScreen message="Loading Dashboard..." />}>
                <CustomizableDashboard
                  entries={entries}
                  onAddEntry={onAddEntry}
                  onStartWalkthrough={onStartWalkthrough}
                  onOpenGoalManager={() => setShowGoalManager(true)}
                />
              </Suspense>
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Advanced Analytics Dashboard
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive insights, correlations, and predictive indicators
                  </p>
                </div>
                <div className="flex gap-3">
                  <Suspense
                    fallback={<div className="text-muted-foreground text-sm">Loading...</div>}
                  >
                    <ClinicalPDFExportButton entries={entries} variant="compact" />
                  </Suspense>
                  <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>

              <Suspense fallback={<BrandedLoadingScreen message="Loading Analytics..." />}>
                <AnalyticsDashboard />
              </Suspense>
            </div>
          )}

          {/* History View */}
          {activeView === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Pain History</h2>
                  <p className="text-muted-foreground">
                    Complete history of your pain entries and patterns
                  </p>
                </div>
                <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                  Back to Dashboard
                </Button>
              </div>

              <Suspense fallback={<BrandedLoadingScreen message="Loading History..." />}>
                <PainHistoryPanel entries={entries} />
              </Suspense>
            </div>
          )}

          {/* Support View */}
          {activeView === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Support & Safety</h2>
                  <p className="text-muted-foreground">
                    Manage reminders, alerts, and comfort tools when you need extra help.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                  Back to Dashboard
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MedicationReminders variant="inline" />
                <AlertsSettings variant="inline" className="text-sm" />
              </div>

              <AlertsActivityLog variant="inline" className="text-sm" />
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
      <footer className="bg-gradient-to-t from-card/80 to-card/50 backdrop-blur-lg border-t border-border/40 mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              {preferences.gentleLanguage
                ? "Your health journey matters. You're doing great by tracking your symptoms."
                : 'Pain Tracker Pro - Manage your health information with confidence'}
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
      {showExportModal && (
        <Suspense fallback={null}>
          <DataExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            entries={entries}
          />
        </Suspense>
      )}

      {/* Goal Manager Modal */}
      {showGoalManager && (
        <Suspense fallback={null}>
          <GoalManagerModal isOpen={showGoalManager} onClose={() => setShowGoalManager(false)} />
        </Suspense>
      )}
    </div>
  );
}

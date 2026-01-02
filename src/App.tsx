/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./components/feedback";
import { TraumaInformedProvider } from "./components/accessibility";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ToneProvider } from "./contexts/ToneContext";
import { StartupPromptsProvider } from "./contexts/StartupPromptsContext";
import { initializeToneEngine } from "./services/ToneEngine";
import { useGlobalAccessibility } from "./hooks/useGlobalAccessibility";
import './i18n/config';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWAStatusIndicator } from './components/pwa/PWAStatusIndicator';
import NotificationConsentPrompt from './components/NotificationConsentPrompt';
import AnalyticsConsentPrompt from './components/AnalyticsConsentPrompt';
import { VaultGate } from './components/security/VaultGate';
import { usePatternAlerts } from './hooks/usePatternAlerts';
import { usePainTrackerStore, selectEntries } from './stores/pain-tracker-store';
import { OfflineBanner } from './components/pwa/OfflineIndicator';
import { BlackBoxSplashScreen } from './components/branding/BlackBoxSplashScreen';
import { pwaManager } from './utils/pwa-utils';
import { ToneStateTester } from './components/dev/ToneStateTester';
import { trackSessionStart as trackUsageSessionStart } from './utils/usage-tracking';
import { Analytics } from "@vercel/analytics/react";

// Lazy-loaded route components for code splitting
const PainTrackerContainer = lazy(() => import('./containers/PainTrackerContainer').then(m => ({ default: m.PainTrackerContainer })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const ScreenshotShowcase = lazy(() => import('./pages/ScreenshotShowcase').then(m => ({ default: m.ScreenshotShowcase })));
const ClinicPortal = lazy(() => import('./pages/clinic/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage').then(m => ({ default: m.SubscriptionManagementPage })));
const SubmitStoryPage = lazy(() => import('./pages/SubmitStoryPage').then(m => ({ default: m.SubmitStoryPage })));

const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-lg border shadow-lg max-w-md mx-4">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

const LoadingFallback = () => {
  return <BlackBoxSplashScreen message="Loading..." />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Ritual: Show splash screen for at least 2.5s on startup
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize global accessibility features
  useGlobalAccessibility({
    enableValidation: import.meta.env.DEV,
    enableAutoLabeling: true,
    announceRouteChanges: true,
  });

  // Defer non-critical initialization for faster mobile load
  useEffect(() => {
    // Use requestIdleCallback to defer analytics and tone engine
    const initializeDeferred = () => {
      // Initialize tone engine (non-blocking)
      initializeToneEngine().catch(error => {
        console.error('Failed to initialize tone engine:', error);
        // Continue without tone engine - app still works
      });
      
      // Defer analytics tracking to not block initial render
      trackUsageSessionStart();
      import('./services/AnalyticsTrackingService').then(({ trackSessionStart }) => {
        trackSessionStart();
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(initializeDeferred);
    } else {
      setTimeout(initializeDeferred, 100);
    }
  }, []);

  // Initialize PWA features
  useEffect(() => {
    // Initialize PWA manager
    pwaManager.isAppInstalled();

    // Initialize offline storage and background sync
    const initializePWAFeatures = async () => {
      try {
        // Initialize offline storage
        const { offlineStorage } = await import('./lib/offline-storage');
        await offlineStorage.init();

        // Initialize background sync with better error handling
        try {
          await import('./lib/background-sync');
        } catch {
          // Background sync not available - this is expected in some environments
        }
      } catch {
        // Continue without PWA features - trauma-informed UX still works
      }
    };

    initializePWAFeatures();

    // Add debugging method to window for development
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).resetPWA = async () => {
        try {
          await pwaManager.resetServiceWorker();
        } catch (error) {
          console.error('PWA Reset failed:', error);
        }
      };
      
      // Expose test data loaders for console access
      (window as unknown as Record<string, unknown>).loadChronicPainTestData = () => {
        import('./data/chronic-pain-12-month-seed').then(
          ({ chronicPain12MonthPainEntries, chronicPain12MonthMoodEntries, chronicPainDataStats }) => {
            console.log('[Dev] Loading 12-month chronic pain test data:', chronicPainDataStats);
            usePainTrackerStore.getState().clearAllData();
            usePainTrackerStore.setState({
              entries: chronicPain12MonthPainEntries,
              moodEntries: chronicPain12MonthMoodEntries,
            });
            console.log('[Dev] Loaded', chronicPainDataStats.totalPainEntries, 'pain entries and', chronicPainDataStats.totalMoodEntries, 'mood entries');
          }
        );
      };
      
      console.log('[Dev] Available commands: window.resetPWA(), window.loadChronicPainTestData()');
    }
  }, []);
  // Subscribe to entries and wire pattern alerts
  const storeEntries = usePainTrackerStore(selectEntries);
  const patternEntries = storeEntries.map(e => ({
    time: e.timestamp,
    pain: e.baselineData?.pain ?? 0,
  }));
  usePatternAlerts(patternEntries);

  // NOTE: Do NOT set basename when Vite handles the base path via VITE_BASE.
  // Vite's dev server already serves from /pain-tracker/ and rewrites URLs correctly.
  // Setting basename would cause React Router to strip the path from the URL bar,
  // breaking bookmarks and page refreshes. Only set basename in production builds
  // when deploying to a true subpath without server-side rewriting.
  // For now, leave basename empty - Vite's base config handles asset paths.

  if (showSplash) {
    return <BlackBoxSplashScreen />;
  }

  return (
    <BrowserRouter>
      <Analytics />
      <ThemeProvider>
        <SubscriptionProvider>
          <ToneProvider>
            <TraumaInformedProvider>
              <ToastProvider>
                <StartupPromptsProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Landing Page - Public */}
                      <Route path="/" element={<LandingPage />} />

                      {/* Pricing Page - Public */}
                      <Route path="/pricing" element={<PricingPage />} />

                      {/* Screenshot Showcase - Public */}
                      <Route path="/demo/*" element={<ScreenshotShowcase />} />

                      {/* Clinic Portal - Protected (separate UI/UX) */}
                      <Route path="/clinic/*" element={<ClinicPortal />} />

                      {/* Subscription Management - Protected */}
                      <Route
                        path="/subscription"
                        element={
                          <VaultGate>
                            <SubscriptionManagementPage />
                          </VaultGate>
                        }
                    />

                    {/* Vault Setup/Login - Public */}
                    <Route
                      path="/start"
                      element={
                        <VaultGate>
                          <Navigate to="/app" replace />
                        </VaultGate>
                      }
                    />

                    {/* Main Application - Protected */}
                    <Route path="/app" element={
                      <VaultGate>
                        <div className="min-h-screen bg-background transition-colors" role="application" aria-label="Pain Tracker Pro Application">
                          <OfflineBanner />
                          <NotificationConsentPrompt />
                          <AnalyticsConsentPrompt />
                          <ErrorBoundary fallback={<ErrorFallback />}>
                            <Suspense fallback={<LoadingFallback />}>
                              <PainTrackerContainer />
                            </Suspense>
                          </ErrorBoundary>
                          <PWAInstallPrompt />
                          <PWAStatusIndicator />
                          <ToneStateTester />
                        </div>
                      </VaultGate>
                    } />

                    {/* Route to open app and start daily check-in (used by notifications) */}
                    <Route path="/app/checkin" element={
                      <VaultGate>
                        <div className="min-h-screen bg-background transition-colors" role="application" aria-label="Pain Tracker Pro Application">
                          <OfflineBanner />
                          <NotificationConsentPrompt />
                          <AnalyticsConsentPrompt />
                          <ErrorBoundary fallback={<ErrorFallback />}>
                            <Suspense fallback={<LoadingFallback />}>
                              <PainTrackerContainer initialView="daily-checkin" />
                            </Suspense>
                          </ErrorBoundary>
                          <PWAInstallPrompt />
                          <PWAStatusIndicator />
                          <ToneStateTester />
                        </div>
                      </VaultGate>
                    } />

                    {/* Submit testimonial/stories */}
                    <Route path="/submit-story" element={<SubmitStoryPage />} />

                    {/* Fallback - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </StartupPromptsProvider>
              </ToastProvider>
            </TraumaInformedProvider>
          </ToneProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

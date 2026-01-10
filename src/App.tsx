/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./components/feedback";
import { TraumaInformedProvider } from "./components/accessibility";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ToneProvider } from "./contexts/ToneContext";
import { StartupPromptsProvider } from "./contexts/StartupPromptsContext";
import { initializeToneEngine } from "./services/ToneEngine";
import { useGlobalAccessibility } from "./hooks/useGlobalAccessibility";
import './i18n/config';
import { BlackBoxSplashScreen } from './components/branding/BlackBoxSplashScreen';
import { trackSessionStart as trackUsageSessionStart } from './utils/usage-tracking';
import { Analytics } from "@vercel/analytics/react";
import { getLocalUserId } from './utils/user-identity';
import { isAnalyticsAllowed } from './analytics/analytics-gate';

// Lazy-loaded route components for code splitting
const PainTrackerContainer = lazy(() => import('./containers/PainTrackerContainer').then(m => ({ default: m.PainTrackerContainer })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const ScreenshotShowcase = lazy(() => import('./pages/ScreenshotShowcase').then(m => ({ default: m.ScreenshotShowcase })));
const ClinicPortal = lazy(() => import('./pages/clinic/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage').then(m => ({ default: m.SubscriptionManagementPage })));
const SubmitStoryPage = lazy(() => import('./pages/SubmitStoryPage').then(m => ({ default: m.SubmitStoryPage })));
const VaultGate = lazy(() => import('./components/security/VaultGate').then(m => ({ default: m.VaultGate })));
const ProtectedAppShell = lazy(() => import('./routes/ProtectedAppShell').then(m => ({ default: m.ProtectedAppShell })));

const LoadingFallback = () => {
  return <BlackBoxSplashScreen message="Loading..." />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const userId = getLocalUserId();

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
      {isAnalyticsAllowed() && <Analytics />}
      <ThemeProvider>
        <SubscriptionProvider userId={userId}>
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
                        <ProtectedAppShell />
                      </VaultGate>
                    } />

                    {/* Route to open app and start daily check-in (used by notifications) */}
                    <Route
                      path="/app/checkin"
                      element={
                        <VaultGate>
                          <ProtectedAppShell initialView="daily-checkin" />
                        </VaultGate>
                      }
                    />

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

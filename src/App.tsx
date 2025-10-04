﻿/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PainTrackerContainer } from "./containers/PainTrackerContainer";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./components/feedback";
import { TraumaInformedProvider } from "./components/accessibility";
import { useGlobalAccessibility } from "./hooks/useGlobalAccessibility";
import './i18n/config';
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { PWAStatusIndicator } from "./components/pwa/PWAStatusIndicator";
import BetaWarning from './components/BetaWarning';
import QuickActions from './components/QuickActions';
import NotificationConsentPrompt from './components/NotificationConsentPrompt';
import BetaAnalyticsConsentPrompt from './components/BetaAnalyticsConsentPrompt';
import { VaultGate } from './components/security/VaultGate';
import { usePatternAlerts } from './hooks/usePatternAlerts';
import { usePainTrackerStore, selectEntries } from './stores/pain-tracker-store';
import { OfflineBanner } from "./components/pwa/OfflineIndicator";
import { BrandedLoadingScreen } from "./components/branding/BrandedLoadingScreen";
import { pwaManager } from "./utils/pwa-utils";

const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-lg border shadow-lg max-w-md mx-4">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
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
  return (
    <BrandedLoadingScreen message="Loading Pain Tracker Pro..." />
  );
};

function App() {
  // Initialize global accessibility features
  const { announceMessage } = useGlobalAccessibility({
    enableValidation: import.meta.env.DEV,
    enableAutoLabeling: true,
    announceRouteChanges: true,
  });

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

        // Setup health data sync if possible
        await pwaManager.enableHealthDataSync();

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
    }
  }, []);
  // Subscribe to entries and wire pattern alerts
  const storeEntries = usePainTrackerStore(selectEntries);
  const patternEntries = storeEntries.map(e => ({ time: e.timestamp, pain: e.baselineData?.pain ?? 0 }));
  usePatternAlerts(patternEntries);
  
  return (
    <ThemeProvider>
      <TraumaInformedProvider>
        <ToastProvider>
          <VaultGate>
            <div className="min-h-screen bg-background transition-colors" role="application" aria-label="Pain Tracker Pro Application">
              <OfflineBanner />
              <BetaWarning />
              <QuickActions />
              <NotificationConsentPrompt />
              <BetaAnalyticsConsentPrompt />
              <ErrorBoundary fallback={<ErrorFallback />}>
                <Suspense fallback={<LoadingFallback />}>
                  <PainTrackerContainer />
                </Suspense>
              </ErrorBoundary>
              <PWAInstallPrompt />
              <PWAStatusIndicator />
            </div>
          </VaultGate>
        </ToastProvider>
      </TraumaInformedProvider>
    </ThemeProvider>
  );
}

export default App;

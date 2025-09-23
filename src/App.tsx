/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PainTrackerContainer } from "./containers/PainTrackerContainer";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./components/feedback";
import { TraumaInformedProvider } from "./components/accessibility";
import './i18n/config';
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import BetaWarning from './components/BetaWarning';
import QuickActions from './components/QuickActions';
import MedicationReminders from './components/MedicationReminders';
import NotificationConsentPrompt from './components/NotificationConsentPrompt';
import AlertsSettings from './components/AlertsSettings';
import AlertsActivityLog from './components/AlertsActivityLog';
import { usePatternAlerts } from './hooks/usePatternAlerts';
import { usePainTrackerStore, selectEntries } from './stores/pain-tracker-store';
import { OfflineBanner } from "./components/pwa/OfflineIndicator";
import { BrandedLoadingScreen } from "./components/branding/BrandedLoadingScreen";
import { pwaManager } from "./utils/pwa-utils";

console.log("App component rendering");

// PWA Status Indicator Component
function PWAStatusIndicator() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    pendingSync: 0,
    isSyncing: false
  });

  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Get pending sync count if background sync is available
        const { backgroundSync } = await import('./lib/background-sync');
        // backgroundSync is used below for status updates
        const pendingSync = await backgroundSync.getPendingItemsCount();
        const { isSyncing } = backgroundSync.getSyncStatus();
        
        setStatus(prev => ({
          ...prev,
          pendingSync,
          isSyncing
        }));
      } catch {
        // Background sync not available, continue without it
        console.debug('PWA: Background sync not available for status updates');
        setStatus(prev => ({
          ...prev,
          pendingSync: 0,
          isSyncing: false
        }));
      }
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      updateStatus(); // Refresh sync status when back online
    };

    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    const handleSyncUpdate = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('background-sync-sync-completed', handleSyncUpdate);
    window.addEventListener('background-sync-sync-started', handleSyncUpdate);

    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('background-sync-sync-completed', handleSyncUpdate);
      window.removeEventListener('background-sync-sync-started', handleSyncUpdate);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if everything is good
  if (status.isOnline && status.pendingSync === 0 && !status.isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg border shadow-lg border-l-4 border-l-blue-500 p-3 max-w-xs">
        <div className="flex items-center space-x-2">
          {!status.isOnline && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">Offline</span>
            </div>
          )}
          {status.isSyncing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Syncing...</span>
            </div>
          )}
          {status.pendingSync > 0 && !status.isSyncing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-700">
                {status.pendingSync} pending
              </span>
            </div>
          )}
        </div>
        {!status.isOnline && (
          <p className="text-xs text-gray-600 mt-1">
            Your data is saved locally and will sync when you're back online
          </p>
        )}
      </div>
    </div>
  );
}

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
  console.log("Inside App render function");
  
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
        console.log('PWA: Offline storage initialized');
        
        // Initialize background sync with better error handling
        try {
          await import('./lib/background-sync');
          console.log('PWA: Background sync service initialized');
        } catch (syncError) {
          console.warn('PWA: Background sync not available:', syncError);
        }
        
        // Setup health data sync if possible
        await pwaManager.enableHealthDataSync();
        
      } catch (error) {
        console.warn('PWA: Some PWA features not available:', error);
        // Continue without PWA features - trauma-informed UX still works
      }
    };

    initializePWAFeatures();

    // Add debugging method to window for development
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).resetPWA = async () => {
        try {
          await pwaManager.resetServiceWorker();
          console.log('PWA Reset complete. Please refresh the page.');
        } catch (error) {
          console.error('PWA Reset failed:', error);
        }
      };
      console.log('PWA Debug: Run resetPWA() in console to reset service worker');
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
          <div className="min-h-screen bg-background transition-colors">
            <OfflineBanner />
            <BetaWarning />
            <QuickActions />
            <div className="fixed top-20 right-4 z-50 w-80 space-y-2">
              <MedicationReminders />
              <AlertsSettings />
              <AlertsActivityLog />
            </div>
            <NotificationConsentPrompt />
            <ErrorBoundary fallback={<ErrorFallback />}>
              <Suspense fallback={<LoadingFallback />}>
                <PainTrackerContainer />
              </Suspense>
            </ErrorBoundary>
            <PWAInstallPrompt />
            <PWAStatusIndicator />
          </div>
        </ToastProvider>
      </TraumaInformedProvider>
    </ThemeProvider>
  );
}

export default App;

/**
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
import './i18n/config';
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { OfflineBanner } from "./components/pwa/OfflineIndicator";
import { BrandedLoadingScreen } from "./components/branding/BrandedLoadingScreen";
import { pwaManager } from "./utils/pwa-utils";

console.log("App component rendering");

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
      // Trigger initialization
      pwaManager.isAppInstalled();
    }, []);
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background transition-colors">
          <OfflineBanner />
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense fallback={<LoadingFallback />}>
              <PainTrackerContainer />
            </Suspense>
          </ErrorBoundary>
          <PWAInstallPrompt />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

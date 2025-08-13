/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PainTracker } from "./components/pain-tracker/index.tsx";
import { ThemeProvider } from "./design-system";

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Pain Tracker...</p>
      </div>
    </div>
  );
};

function App() {
  console.log("Inside App render function");
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<LoadingFallback />}>
            <PainTracker />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;

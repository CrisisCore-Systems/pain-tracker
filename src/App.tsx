/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense } from "react";
import * as Sentry from "@sentry/react";
import { PainTracker } from "./components/pain-tracker/index.tsx";
import { SentryTest } from "./components/SentryTest";

console.log("App component rendering");

const ErrorFallback = (props: { error: unknown; resetError: () => void }) => {
  console.error("Error caught by boundary:", props.error);
  return (
    <div className="text-red-500 p-4">
      <h2>Something went wrong:</h2>
      <pre>{props.error instanceof Error ? props.error.message : String(props.error)}</pre>
      <button
        onClick={props.resetError}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
};

function App() {
  console.log("Inside App render function");
  
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <main className="min-h-screen-safe bg-gray-50">
          {/* Mobile-optimized container with safe area support */}
          <div className="container-mobile max-w-6xl mx-auto">
            {/* Mobile-responsive header */}
            <header className="py-4 sm:py-6 lg:py-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">
                Pain & Injury Tracking System
              </h1>
            </header>
            
            {/* Main content area */}
            <div className="pb-4 sm:pb-6 lg:pb-8">
              <PainTracker />
            </div>
          </div>
          
          {/* Development Sentry test - only visible in dev mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <SentryTest />
            </div>
          )}
        </main>
      </Suspense>
    </Sentry.ErrorBoundary>
  );
}

export default App;

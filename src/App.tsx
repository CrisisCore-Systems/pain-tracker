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
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Pain & Injury Tracking System</h1>
          <PainTracker />
          {process.env.NODE_ENV === 'development' && <SentryTest />}
        </main>
      </Suspense>
    </Sentry.ErrorBoundary>
  );
}

export default App;

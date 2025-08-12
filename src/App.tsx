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

console.log("App component rendering");

const ErrorFallback = () => {
  return (
    <div className="text-red-500 p-4">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Page
      </button>
    </div>
  );
};

function App() {
  console.log("Inside App render function");
  
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<div>Loading...</div>}>
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Pain & Injury Tracking System</h1>
          <PainTracker />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

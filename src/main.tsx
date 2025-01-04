import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Add type declaration for Vite's import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_APP_ENVIRONMENT: string;
    readonly PROD: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

Sentry.init({
  dsn: "https://aaaf91eaf21db739654b536dea749a34@o4508587043258368.ingest.us.sentry.io/4508587047780352",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions in development
  tracePropagationTargets: ["localhost", "https://crisiscore-systems.github.io"],
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
  environment: import.meta.env.VITE_APP_ENVIRONMENT,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

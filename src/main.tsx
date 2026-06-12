import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import reportWebVitals from './reportWebVitals';

import { recordLocalUsageSessionIfEnabled } from './services/localUsageBootstrap';

const PRELOAD_RECOVERY_KEY = 'pt:preload-recovery-url';

function installDynamicImportRecovery(): void {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.addEventListener('vite:preloadError', event => {
    event.preventDefault();
    const preloadErrorEvent = event as Event & { payload?: unknown };

    try {
      const currentUrl = `${globalThis.location.pathname}${globalThis.location.search}`;
      const lastRecoveredUrl = globalThis.sessionStorage.getItem(PRELOAD_RECOVERY_KEY);

      if (lastRecoveredUrl === currentUrl) {
        console.warn('Dynamic import recovery already attempted for this route.', preloadErrorEvent.payload);
        return;
      }

      globalThis.sessionStorage.setItem(PRELOAD_RECOVERY_KEY, currentUrl);
      globalThis.location.reload();
    } catch {
      globalThis.location.reload();
    }
  });
}

function shouldEnableDevTestMode(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }

  try {
    const url = new URL(globalThis.location.href);
    const param = url.searchParams.get('pt_test_mode');
    const lsFlag = localStorage.getItem('pt:test_mode');
    const isBrowserAutomation = typeof navigator !== 'undefined' && navigator.webdriver === true;
    return param === '1' || lsFlag === '1' || isBrowserAutomation;
  } catch {
    return false;
  }
}

// Bootstrap test-mode flag when present in URL or localStorage.
// This is intentionally limited to development builds (import.meta.env.DEV)
// so it cannot be used in production to bypass security.
if (shouldEnableDevTestMode()) {
  try {
    localStorage.setItem('pt:test_mode', '1');
    (globalThis as unknown as { __pt_test_mode?: boolean }).__pt_test_mode = true;
  } catch {
    // ignore errors reading URL/localStorage in some test harnesses
  }
}

installDynamicImportRecovery();

await Promise.all([recordLocalUsageSessionIfEnabled(), import('./lib/offline-storage').then(m => m.waitUntilWALInit?.()).catch(() => {})]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(metric => {
  if (import.meta.env.DEV) {
    console.log(metric);
  }
});

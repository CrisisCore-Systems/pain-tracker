import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Import analytics loader to ensure GA4 is initialized when VITE_ENABLE_ANALYTICS is true
import './analytics/analytics-loader';

// Bootstrap test-mode flag when present in URL or localStorage.
// This is intentionally limited to development builds (import.meta.env.DEV)
// so it cannot be used in production to bypass security.
if (import.meta.env.DEV) {
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('pt_test_mode');
    const lsFlag = localStorage.getItem('pt:test_mode');
    if (param === '1' || lsFlag === '1') {
      // set a well-known property on window for tests; typed as unknown to avoid `any`
      (window as unknown as { __pt_test_mode?: boolean }).__pt_test_mode = true;
    }
  } catch {
    // ignore errors reading URL/localStorage in some test harnesses
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

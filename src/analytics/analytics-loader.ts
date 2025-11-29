/* src/analytics/analytics-loader.ts */

// Vite exposes env vars as strings. Only enable real analytics when explicitly allowed.
const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

if (enableAnalytics) {
  // Load remote Google Tag Manager script from its host when enabled.
  const s = document.createElement('script');
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-X25RTEWBYL';
  s.async = true;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) { window.dataLayer!.push(args); }
  window.gtag = gtag;

  // Initialize gtag
  try {
    window.gtag('js', new Date());
    window.gtag('config', 'G-X25RTEWBYL');
  } catch {
    // swallow any runtime error during initialization
  }
} else {
  // Test / preview: provide a no-op implementation so callers won't throw
  window.dataLayer = window.dataLayer || [];
  window.gtag = () => { /* no-op during tests/preview */ };

  // Do not append the remote script when analytics disabled.
}

export {};

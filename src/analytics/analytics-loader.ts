/* src/analytics/analytics-loader.ts */

// NOTE: Do not load any remote analytics script until BOTH:
// 1) Build-time env enables analytics, AND
// 2) User has explicitly granted consent.

const GA4_MEASUREMENT_ID = 'G-X25RTEWBYL';
const CONSENT_KEY = 'pain-tracker:analytics-consent';

function isEnvEnabled(): boolean {
  try {
    if (import.meta.env && typeof import.meta.env.VITE_ENABLE_ANALYTICS === 'string') {
      return import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    }
  } catch {
    // ignore
  }

  try {
    // Vitest / Node fallback
    const env =
      (typeof process !== 'undefined'
        ? (process as unknown as { env?: Record<string, string | undefined> }).env
        : undefined) || {};
    return env.VITE_ENABLE_ANALYTICS === 'true';
  } catch {
    return false;
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function ensureNoopGtag(): void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = () => {
      /* no-op */
    };
  }
}

function markLoaded(): void {
  try {
    const w = window as Window & { __pt_ga4_loaded?: boolean };
    w.__pt_ga4_loaded = true;
  } catch {
    // ignore
  }
}

function isLoaded(): boolean {
  try {
    const w = window as Window & { __pt_ga4_loaded?: boolean };
    return Boolean(w.__pt_ga4_loaded);
  } catch {
    return false;
  }
}

export function loadAnalyticsIfAllowed(): void {
  ensureNoopGtag();

  if (!isEnvEnabled()) return;
  if (!hasConsent()) return;
  if (isLoaded()) return;

  // Load remote Google Tag Manager script only after explicit opt-in.
  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  s.async = true;
  document.head.appendChild(s);

  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;

  try {
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  } catch {
    // swallow any runtime error during initialization
  }

  markLoaded();
}

// Initialize once on startup.
loadAnalyticsIfAllowed();

export {};

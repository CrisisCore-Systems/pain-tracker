/* src/analytics/analytics-loader.ts */

// Outbound third-party analytics has been disabled.
// Defense-in-depth: even if this module is imported, it MUST NOT
// append remote scripts or enable network egress.

function ensureNoopGtag(): void {
  const w = globalThis as typeof globalThis & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  w.dataLayer ??= [];
  w.gtag ??= () => {
    /* no-op */
  };
}

export function loadAnalyticsIfAllowed(): void {
  ensureNoopGtag();
}

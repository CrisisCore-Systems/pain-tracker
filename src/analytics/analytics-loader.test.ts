import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// This suite enforces: no remote analytics script loads without consent.

describe('analytics-loader consent gating', () => {
  const originalEnv = process.env.VITE_ENABLE_ANALYTICS;

  beforeEach(() => {
    vi.resetModules();
    document.head.querySelectorAll('script').forEach(s => s.remove());

    // Reset loader state between tests.
    const w = window as Window & { __pt_ga4_loaded?: boolean };
    delete w.__pt_ga4_loaded;

    // Make sure loader can read env in tests.
    process.env.VITE_ENABLE_ANALYTICS = 'true';

    try {
      localStorage.removeItem('pain-tracker:analytics-consent');
    } catch {
      // ignore
    }
  });

  afterEach(() => {
    vi.resetModules();
    if (originalEnv === undefined) delete process.env.VITE_ENABLE_ANALYTICS;
    else process.env.VITE_ENABLE_ANALYTICS = originalEnv;

    const w = window as Window & { __pt_ga4_loaded?: boolean };
    delete w.__pt_ga4_loaded;

    document.head.querySelectorAll('script').forEach(s => s.remove());
  });

  it('does not append GA script when consent is missing', async () => {
    await import('./analytics-loader');

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(hasGtag).toBe(false);
  });

  it('appends GA script only when consent is granted', async () => {
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');

    await import('./analytics-loader');

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(hasGtag).toBe(true);
  });

  it('does not append duplicates when called multiple times', async () => {
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');

    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();
    mod.loadAnalyticsIfAllowed();

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const gtagScripts = scripts.filter(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(gtagScripts.length).toBe(1);
  });
});

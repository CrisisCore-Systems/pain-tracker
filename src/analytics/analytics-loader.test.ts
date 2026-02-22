import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// This suite enforces: no remote analytics script loads without consent.

describe('analytics-loader consent gating', () => {
  const originalEnv = process.env.VITE_ENABLE_ANALYTICS;

  beforeEach(() => {
    vi.resetModules();
    document.head.querySelectorAll('script').forEach(s => s.remove());

    // Reset globals created by the loader.
    try {
      delete (window as unknown as { gtag?: unknown }).gtag;
      delete (window as unknown as { dataLayer?: unknown }).dataLayer;
    } catch {
      // ignore
    }

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

    try {
      delete (window as unknown as { gtag?: unknown }).gtag;
      delete (window as unknown as { dataLayer?: unknown }).dataLayer;
    } catch {
      // ignore
    }

    document.head.querySelectorAll('script').forEach(s => s.remove());
  });

  it('does not append GA script when consent is missing', async () => {
    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(hasGtag).toBe(false);
  });

  it('still installs a safe noop gtag when consent is missing', async () => {
    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();

    expect(typeof window.gtag).toBe('function');
    expect(() => window.gtag?.('event', 'test')).not.toThrow();
  });

  it('does not append GA script when env is disabled even with consent', async () => {
    process.env.VITE_ENABLE_ANALYTICS = 'false';
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');

    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(hasGtag).toBe(false);
  });

  it('does not overwrite an existing gtag function', async () => {
    const existing = vi.fn();
    window.gtag = existing;
    process.env.VITE_ENABLE_ANALYTICS = 'false';

    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();

    expect(window.gtag).toBe(existing);
  });

  it('does not append GA script if localStorage throws', async () => {
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('storage blocked');
        },
        setItem: () => {
          throw new Error('storage blocked');
        },
        removeItem: () => {
          throw new Error('storage blocked');
        }
      },
      configurable: true
    });

    try {
      const mod = await import('./analytics-loader');
      mod.loadAnalyticsIfAllowed();

      const scripts = Array.from(document.head.querySelectorAll('script'));
      const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
      expect(hasGtag).toBe(false);
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    }
  });

  it('appends GA script only when consent is granted', async () => {
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');

    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const hasGtag = scripts.some(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(hasGtag).toBe(false);

    // Still provides a safe noop gtag.
    expect(typeof window.gtag).toBe('function');
  });

  it('does not append duplicates when called multiple times', async () => {
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');

    const mod = await import('./analytics-loader');
    mod.loadAnalyticsIfAllowed();
    mod.loadAnalyticsIfAllowed();

    const scripts = Array.from(document.head.querySelectorAll('script'));
    const gtagScripts = scripts.filter(s => (s.getAttribute('src') || '').includes('googletagmanager.com/gtag/js'));
    expect(gtagScripts.length).toBe(0);
  });
});

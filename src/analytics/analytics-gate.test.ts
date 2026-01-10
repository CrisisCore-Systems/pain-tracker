import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('analytics-gate', () => {
  const originalEnv = process.env.VITE_ENABLE_ANALYTICS;

  beforeEach(() => {
    vi.resetModules();
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

    try {
      localStorage.removeItem('pain-tracker:analytics-consent');
    } catch {
      // ignore
    }
  });

  it('returns envEnabled=false when env is disabled', async () => {
    process.env.VITE_ENABLE_ANALYTICS = 'false';

    const mod = await import('./analytics-gate');
    expect(mod.getAnalyticsGate().envEnabled).toBe(false);
    expect(mod.isAnalyticsAllowed()).toBe(false);
  });

  it('returns hasConsent=true only when consent is granted', async () => {
    const mod = await import('./analytics-gate');

    localStorage.setItem('pain-tracker:analytics-consent', 'granted');
    expect(mod.getAnalyticsGate().hasConsent).toBe(true);

    localStorage.setItem('pain-tracker:analytics-consent', 'denied');
    expect(mod.getAnalyticsGate().hasConsent).toBe(false);
  });

  it('returns hasConsent=false if localStorage throws', async () => {
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('blocked');
        },
      },
      configurable: true,
    });

    try {
      const mod = await import('./analytics-gate');
      expect(mod.getAnalyticsGate().hasConsent).toBe(false);
      expect(mod.isAnalyticsAllowed()).toBe(false);
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    }
  });

  it('isAnalyticsAllowed is true only when env enabled and consent granted', async () => {
    const mod = await import('./analytics-gate');

    process.env.VITE_ENABLE_ANALYTICS = 'true';
    localStorage.setItem('pain-tracker:analytics-consent', 'granted');
    expect(mod.isAnalyticsAllowed()).toBe(true);

    process.env.VITE_ENABLE_ANALYTICS = 'false';
    expect(mod.isAnalyticsAllowed()).toBe(false);
  });
});

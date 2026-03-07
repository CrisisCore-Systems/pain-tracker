import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Guardrails for the monetization boundary:
// - Core experience remains local-first (no required network calls)
// - Third-party analytics remains default-off unless explicitly enabled + consented

describe('monetization boundary guardrails', () => {
  const originalEnv = process.env.VITE_ENABLE_ANALYTICS;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();

    // Make fetch observable (core flows should not require it).
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Unexpected fetch() in core monetization boundary test');
    }) as unknown as typeof fetch;

    // Default posture: analytics must be off unless explicitly enabled.
    delete process.env.VITE_ENABLE_ANALYTICS;

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

    globalThis.fetch = originalFetch;

    try {
      localStorage.removeItem('pain-tracker:analytics-consent');
    } catch {
      // ignore
    }
  });

  it('keeps third-party analytics default-off when env is unset', async () => {
    const gate = await import('../analytics/analytics-gate');

    expect(gate.getAnalyticsGate().envEnabled).toBe(false);
    expect(gate.isAnalyticsAllowed()).toBe(false);
  });

  it('does not require network calls for local subscription state', async () => {
    const { subscriptionService } = await import('../services/SubscriptionService');
    const userIdentity = await import('../utils/user-identity');

    const userId = userIdentity.getLocalUserId();
    await subscriptionService.createSubscription(userId, 'free');

    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
  });

  it('does not import EntitlementService in core tracking modules', async () => {
    // If core tracking pulls in EntitlementService, this test will fail.
    // Use doMock (non-hoisted) so other tests in this file can still import EntitlementService.
    vi.resetModules();
    vi.doMock('../services/EntitlementService', () => {
      throw new Error('EntitlementService should not be imported by core tracking modules');
    });

    try {
      // Import representative core tracking modules.
      await import('../components/pain-tracker/PainEntryForm');
      await import('../stores/pain-tracker-store');
    } finally {
      vi.doUnmock('../services/EntitlementService');
      vi.resetModules();
    }
  });

  it('defaults to no entitlements when no tier and no local grants', async () => {
    const { entitlementService } = await import('../services/EntitlementService');

    entitlementService.clearLocal();

    expect(entitlementService.hasEntitlement('analytics_advanced')).toBe(false);
    expect(entitlementService.hasEntitlement('reports_clinical_pdf')).toBe(false);
    expect(entitlementService.hasEntitlement('reports_wcb_forms')).toBe(false);
    expect(entitlementService.hasEntitlement('sync_encrypted')).toBe(false);
    expect(entitlementService.listEntitlements()).toEqual([]);

    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
  });

  it('allows local grants without network calls', async () => {
    const { entitlementService } = await import('../services/EntitlementService');

    entitlementService.clearLocal();
    entitlementService.grantLocal('analytics_advanced');
    expect(entitlementService.hasEntitlement('analytics_advanced')).toBe(true);
    expect(entitlementService.listEntitlements()).toContain('analytics_advanced');

    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
  });

  it('does not treat Pro tier as implying encrypted sync', async () => {
    const { entitlementService } = await import('../services/EntitlementService');
    const { subscriptionService } = await import('../services/SubscriptionService');
    const userIdentity = await import('../utils/user-identity');

    entitlementService.clearLocal();

    const userId = userIdentity.getLocalUserId();
    await subscriptionService.createSubscription(userId, 'pro');

    expect(entitlementService.hasEntitlement('sync_encrypted')).toBe(false);
    expect(entitlementService.listEntitlements()).not.toContain('sync_encrypted');
    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
  });

  it('keeps core JSON export ungated and offline-capable', async () => {
    const React = (await import('react')).default;
    const { render, screen, fireEvent } = await import('@testing-library/react');
    const { SavePanel } = await import('../components/pain-tracker/SavePanel');

    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

    if (globalThis.URL.createObjectURL === undefined) {
      Object.defineProperty(globalThis.URL, 'createObjectURL', {
        value: () => 'blob:unit-test',
        configurable: true,
      });
    }
    if (globalThis.URL.revokeObjectURL === undefined) {
      Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
        value: () => undefined,
        configurable: true,
      });
    }

    const createObjectUrlSpy = vi.spyOn(globalThis.URL, 'createObjectURL');
    const revokeObjectUrlSpy = vi.spyOn(globalThis.URL, 'revokeObjectURL');
    const anchorClickSpy = vi
      .spyOn(globalThis.HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    try {
      render(React.createElement(SavePanel, { entries: [] }));
      fireEvent.click(screen.getByRole('button', { name: /export as json/i }));

      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
    } finally {
      createObjectUrlSpy.mockRestore();
      revokeObjectUrlSpy.mockRestore();
      anchorClickSpy.mockRestore();

      if (originalCreateObjectURL === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis.URL as any).createObjectURL;
      }
      if (originalRevokeObjectURL === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis.URL as any).revokeObjectURL;
      }
    }
  });
});

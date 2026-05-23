import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { createCheckoutSession } from '../utils/stripe-checkout';

describe('createCheckoutSession', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: {
        origin: 'https://example.test',
        href: 'https://example.test/pricing',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('redirects to the Stripe-hosted checkout URL returned by the API', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/test',
      }),
    } as Response);

    await createCheckoutSession({
      userId: 'user-123',
      tier: 'basic',
      interval: 'monthly',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/stripe/create-checkout-session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user-123',
        tier: 'basic',
        interval: 'monthly',
        successUrl: 'https://example.test/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'https://example.test/pricing?checkout=canceled',
        email: undefined,
      }),
    });
    expect(globalThis.location.href).toBe('https://checkout.stripe.com/c/pay/test');
  });

  it('targets the local API server when running under local preview', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/test',
      }),
    } as Response);

    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: {
        origin: 'http://127.0.0.1:4173',
        protocol: 'http:',
        hostname: '127.0.0.1',
        port: '4173',
        href: 'http://127.0.0.1:4173/pricing',
      },
    });

    await createCheckoutSession({
      userId: 'user-123',
      tier: 'basic',
      interval: 'monthly',
    });

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3001/api/stripe/create-checkout-session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user-123',
        tier: 'basic',
        interval: 'monthly',
        successUrl: 'http://127.0.0.1:4173/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://127.0.0.1:4173/pricing?checkout=canceled',
        email: undefined,
      }),
    });
  });

  it('surfaces plain-text backend failures without throwing a JSON parse error', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers({
        'content-type': 'text/plain; charset=utf-8',
      }),
      text: async () => 'Subscription ownership is not configured',
    } as Response);

    await expect(
      createCheckoutSession({
        userId: 'user-123',
        tier: 'basic',
        interval: 'monthly',
      })
    ).rejects.toThrow('Subscription ownership is not configured');
  });
});
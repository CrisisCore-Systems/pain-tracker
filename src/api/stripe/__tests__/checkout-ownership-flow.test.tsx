import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('micro', () => ({
  buffer: vi.fn(async () => Buffer.from('signed-payload')),
}));

const { checkoutCreateMock, constructEventMock } = vi.hoisted(() => ({
  checkoutCreateMock: vi.fn(),
  constructEventMock: vi.fn(),
}));

vi.mock('stripe', () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: checkoutCreateMock,
      },
    };

    webhooks = {
      constructEvent: constructEventMock,
    };

    static errors = {
      StripeError: class StripeError extends Error {
        type = 'stripe_error';
      },
    };

    constructor(_key: string) {}
  }

  return { default: MockStripe };
});

import { SubscriptionProvider, useSubscription } from '../../../contexts/SubscriptionContext';

let checkoutHandler: typeof import('../../../../api/stripe/create-checkout-session').default;
let webhookHandler: typeof import('../../../../api/stripe/webhook').default;
let db: typeof import('../../../../api-lib/database.js').db;

type MockReq = {
  method: string;
  headers: Record<string, string>;
  body?: unknown;
};

type MockRes = {
  _status: number;
  _body: unknown;
  _headers: Record<string, string | string[]>;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
  setHeader: (name: string, value: string | string[]) => void;
  getHeader: (name: string) => string | string[] | undefined;
};

function createMockRes(): MockRes {
  const headers = new Map<string, string | string[]>();
  const res: MockRes = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code: number) {
      this._status = code;
      return this;
    },
    json(payload: unknown) {
      this._body = payload;
      return this;
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  };
  return res;
}

function readSetCookie(res: MockRes): string[] {
  const raw = res.getHeader('set-cookie');
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function findCookie(setCookies: string[], cookieName: string): string | undefined {
  return setCookies.find(cookie => cookie.startsWith(`${cookieName}=`));
}

function SubscriptionProbe() {
  const { currentTier, hasFeature } = useSubscription();

  return (
    <div>
      <span data-testid="tier">{currentTier}</span>
      <span data-testid="analytics">{hasFeature('advancedAnalytics') ? 'enabled' : 'disabled'}</span>
    </div>
  );
}

describe('subscription checkout ownership flow', () => {
  const originalEnv = { ...process.env };
  let subscriptionRecord: null | {
    id: number;
    userId: string;
    customerId: string;
    subscriptionId?: string;
    tier: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
    billingInterval?: 'monthly' | 'yearly';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    trialStart?: Date;
    trialEnd?: Date;
    canceledAt?: Date;
    endedAt?: Date;
    cancelAtPeriodEnd: boolean;
    cancelReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      SUBSCRIPTION_OWNER_SECRET: 'owner_secret_123',
      STRIPE_PRICE_BASIC_MONTHLY: 'price_basic_monthly',
    };
    vi.resetModules();
    ({ db } = await import('../../../../api-lib/database.js'));
    ({ default: checkoutHandler } = await import('../../../../api/stripe/create-checkout-session'));
    ({ default: webhookHandler } = await import('../../../../api/stripe/webhook'));
    subscriptionRecord = null;
    checkoutCreateMock.mockReset();
    constructEventMock.mockReset();
    checkoutCreateMock.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/test',
    });
    vi.spyOn(db, 'getSubscriptionByUserId').mockImplementation(async (userId: string) => {
      return subscriptionRecord?.userId === userId ? (subscriptionRecord as never) : null;
    });
    vi.spyOn(db, 'upsertSubscription').mockImplementation(async (data) => {
      subscriptionRecord = {
        id: 1,
        userId: data.userId,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        tier: data.tier,
        status: data.status,
        billingInterval: data.billingInterval,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        canceledAt: undefined,
        endedAt: undefined,
        cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
        cancelReason: undefined,
        metadata: data.metadata,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
      };
      return subscriptionRecord as never;
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    cleanup();
  });

  it('enables premium features only after checkout ownership and webhook-backed reload', async () => {
    const checkoutRes = createMockRes();
    await checkoutHandler(
      {
        method: 'POST',
        headers: {
          host: 'example.test',
          'x-forwarded-proto': 'https',
          'x-forwarded-for': '203.0.113.10',
        },
        body: {
          userId: 'user-123',
          tier: 'basic',
          interval: 'monthly',
          successUrl: 'https://example.test/app?checkout=success',
          cancelUrl: 'https://example.test/pricing?checkout=canceled',
        },
      } as never,
      checkoutRes as never
    );

    expect(checkoutRes._status).toBe(200);
    const ownerCookie = findCookie(readSetCookie(checkoutRes), 'pt_subscription_owner');
    expect(ownerCookie).toContain('HttpOnly');
    expect(ownerCookie).toContain('SameSite=Strict');
    expect(ownerCookie).toContain('Secure');

    const cookieHeader = ownerCookie?.split(';')[0] || '';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      const req = {
        method: 'POST',
        headers: {
          cookie: cookieHeader,
        },
        body: init?.body ? JSON.parse(String(init.body)) : {},
      };
      const res = createMockRes();
      const statusHandler = (await import('../../../../api/stripe/subscription-status')).default;
      await statusHandler(req as never, res as never);

      return {
        ok: res._status >= 200 && res._status < 300,
        status: res._status,
        json: async () => res._body,
      } as Response;
    }) as typeof fetch;

    const firstRender = render(
      <SubscriptionProvider userId="user-123">
        <SubscriptionProbe />
      </SubscriptionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tier')).toHaveTextContent('free');
    });
    expect(screen.getByTestId('analytics')).toHaveTextContent('disabled');

    constructEventMock.mockReturnValue({
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_123',
          subscription: 'sub_123',
          client_reference_id: 'user-123',
          metadata: {
            userId: 'user-123',
            tier: 'basic',
            interval: 'monthly',
          },
        },
      },
    });

    const webhookRes = createMockRes();
    await webhookHandler(
      {
        method: 'POST',
        headers: {
          'stripe-signature': 'sig_test',
          'x-forwarded-for': '203.0.113.10',
        },
      } as never,
      webhookRes as never
    );

    expect(webhookRes._status).toBe(200);
    expect(subscriptionRecord?.tier).toBe('basic');

    firstRender.unmount();

    render(
      <SubscriptionProvider userId="user-123">
        <SubscriptionProbe />
      </SubscriptionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tier')).toHaveTextContent('basic');
    });
    expect(screen.getByTestId('analytics')).toHaveTextContent('enabled');

    globalThis.fetch = originalFetch;
  });
});
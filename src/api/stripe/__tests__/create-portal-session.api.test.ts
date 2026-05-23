import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../../api/stripe/create-portal-session';
import { db } from '../../../../api-lib/database.js';
import { issueSubscriptionOwnerCookie } from '../../../../api-lib/subscriptionOwnership';

const billingPortalCreateMock = vi.fn();

vi.mock('stripe', () => {
  class MockStripe {
    billingPortal = {
      sessions: {
        create: billingPortalCreateMock,
      },
    };

    constructor(_key: string) {}
  }

  return { default: MockStripe };
});

type MockReq = {
  method: string;
  body: unknown;
  headers: Record<string, string>;
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
  return {
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
}

function ownershipCookie(userId: string): string {
  const req = {
    method: 'POST',
    headers: {
      host: 'example.test',
      'x-forwarded-proto': 'https',
    },
  } as never;
  const res = createMockRes();
  issueSubscriptionOwnerCookie(res as never, req, userId);
  const raw = res.getHeader('set-cookie');
  const value = Array.isArray(raw) ? raw[0] : raw;
  return String(value || '').split(';')[0] || '';
}

describe('POST /api/stripe/create-portal-session', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_123',
      SUBSCRIPTION_OWNER_SECRET: 'owner_secret_123',
    };
    vi.restoreAllMocks();
    billingPortalCreateMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('rejects requests without matching ownership', async () => {
    const res = createMockRes();

    await handler(
      {
        method: 'POST',
        headers: {
          host: 'example.test',
          'x-forwarded-proto': 'https',
        },
        body: {
          userId: 'user-123',
          returnUrl: 'https://example.test/subscription',
        },
      } as never,
      res as never
    );

    expect(res._status).toBe(401);
    expect(res._body).toEqual({ error: 'Unauthorized billing portal request' });
  });

  it('creates a portal session for the owned Stripe customer', async () => {
    vi.spyOn(db, 'getSubscriptionByUserId').mockResolvedValue({
      id: 1,
      userId: 'user-123',
      customerId: 'cus_123',
      subscriptionId: 'sub_123',
      tier: 'basic',
      status: 'active',
      billingInterval: 'monthly',
      currentPeriodStart: new Date('2026-04-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00.000Z'),
      trialStart: undefined,
      trialEnd: undefined,
      canceledAt: undefined,
      endedAt: undefined,
      cancelAtPeriodEnd: false,
      cancelReason: undefined,
      metadata: undefined,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    });
    billingPortalCreateMock.mockResolvedValue({
      url: 'https://billing.stripe.com/p/session/test',
    });

    const res = createMockRes();
    await handler(
      {
        method: 'POST',
        headers: {
          host: 'example.test',
          'x-forwarded-proto': 'https',
          cookie: ownershipCookie('user-123'),
        },
        body: {
          userId: 'user-123',
          returnUrl: 'https://example.test/subscription',
        },
      } as never,
      res as never
    );

    expect(res._status).toBe(200);
    expect(res._body).toEqual({ url: 'https://billing.stripe.com/p/session/test' });
    expect(billingPortalCreateMock).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://example.test/subscription',
    });
  });
});
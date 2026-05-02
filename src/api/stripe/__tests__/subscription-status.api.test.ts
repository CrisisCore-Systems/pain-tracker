import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../../../api/stripe/subscription-status';
import { db } from '../../../../api-lib/database.js';
import { issueSubscriptionOwnerCookie } from '../../../../api-lib/subscriptionOwnership';

type MockReq = {
  method: string;
  body: unknown;
  headers: Record<string, string>;
};

type MockRes = {
  _status: number;
  _body: unknown;
  _headers: Record<string, string>;
  setHeader: (name: string, value: string) => MockRes;
  getHeader: (name: string) => string | undefined;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
};

function makeReq(body: unknown, method = 'POST'): MockReq {
  return {
    method,
    body,
    headers: {},
  };
}

function createMockRes(): MockRes {
  return {
    _status: 200,
    _body: null,
    _headers: {},
    setHeader(name: string, value: string) {
      this._headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name: string) {
      return this._headers[name.toLowerCase()];
    },
    status(code: number) {
      this._status = code;
      return this;
    },
    json(payload: unknown) {
      this._body = payload;
      return this;
    },
  };
}

function issueOwnerCookieHeader(userId: string): string {
  const req = {
    method: 'POST',
    headers: {
      host: 'example.test',
      'x-forwarded-proto': 'https',
    },
  } as never;
  const res = createMockRes();
  issueSubscriptionOwnerCookie(res as never, req, userId);
  const raw = res._headers['set-cookie'];
  const setCookie = Array.isArray(raw) ? raw[0] : raw;
  return String(setCookie || '').split(';')[0] || '';
}

describe('POST /api/stripe/subscription-status', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.SUBSCRIPTION_OWNER_SECRET = 'test-owner-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('rejects non-POST methods', async () => {
    const res = createMockRes();

    await handler(makeReq({}, 'GET') as never, res as never);

    expect(res._status).toBe(405);
    expect(res._body).toMatchObject({ error: 'Method not allowed' });
  });

  it('returns a normalized subscription payload for gating', async () => {
    vi.spyOn(db, 'getSubscriptionByUserId').mockResolvedValue({
      id: 9,
      userId: 'user-123',
      customerId: 'cus_hidden',
      subscriptionId: 'sub_123',
      tier: 'pro',
      status: 'active',
      billingInterval: 'yearly',
      currentPeriodStart: new Date('2026-04-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2027-04-01T00:00:00.000Z'),
      trialStart: null as never,
      trialEnd: null as never,
      canceledAt: undefined,
      endedAt: undefined,
      cancelAtPeriodEnd: false,
      cancelReason: undefined,
      metadata: undefined,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    });

    const res = createMockRes();
    const req = makeReq({ userId: 'user-123' });
    req.headers.cookie = issueOwnerCookieHeader('user-123');
    await handler(req as never, res as never);

    expect(res._status).toBe(200);
    expect(res._headers['cache-control']).toBe('no-store');
    expect(res._body).toEqual({
      subscription: {
        id: '9',
        userId: 'user-123',
        tier: 'pro',
        status: 'active',
        billingInterval: 'yearly',
        currentPeriodStart: '2026-04-01T00:00:00.000Z',
        currentPeriodEnd: '2027-04-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        trialStart: undefined,
        trialEnd: undefined,
        subscriptionId: 'sub_123',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
        usage: {
          painEntries: 0,
          moodEntries: 0,
          activityLogs: 0,
          storageMB: 0,
          apiCalls: 0,
          exportCount: 0,
          sharedUsers: 0,
        },
      },
    });
  });

  it('returns null when no paid subscription exists', async () => {
    vi.spyOn(db, 'getSubscriptionByUserId').mockResolvedValue(null);

    const res = createMockRes();
    const req = makeReq({ userId: 'user-123' });
    req.headers.cookie = issueOwnerCookieHeader('user-123');
    await handler(req as never, res as never);

    expect(res._status).toBe(200);
    expect(res._body).toEqual({ subscription: null });
  });

  it('rejects lookups without a matching ownership cookie', async () => {
    const res = createMockRes();
    await handler(
      {
        method: 'POST',
        body: { userId: 'user-123' },
        headers: {},
      } as never,
      res as never
    );

    expect(res._status).toBe(401);
    expect(res._body).toEqual({ error: 'Unauthorized subscription lookup' });
  });
});
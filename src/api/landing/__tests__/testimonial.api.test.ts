import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../../../../api/landing/testimonial';
import { db } from '../../../../src/lib/database';

type MockReq = {
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

type MockRes = {
  _status: number;
  _body: unknown;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
};

function makeReq(body: unknown, ip = '1.2.3.4'): MockReq {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body,
  };
}

function createMockRes() {
  const res: MockRes = {
    _status: 200,
    _body: null,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(payload: unknown) {
      this._body = payload;
      return this;
    },
  };
  return res;
}

describe('Testimonial submission API', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, created: { id: 1 } }) })
    );
    vi.spyOn(db, 'query').mockResolvedValueOnce([{ id: 1 }]).mockResolvedValue([]);
    process.env.REQ_RATE_LIMIT = '5';
  });
  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.REQ_RATE_LIMIT;
    delete process.env.ADMIN_SLACK_WEBHOOK;
    delete process.env.RECAPTCHA_SECRET;
    delete process.env.RECAPTCHA_REQUIRED;
  });

  it('blocks after exceeding rate limit', async () => {
    const b = { name: 'person', quote: 'my story', consent: true };
    for (let i = 0; i < 5; i++) {
      const res = createMockRes();
      await handler(makeReq(b, '5.6.7.8') as never, res as never);
      expect(res._status === 201 || res._status === 200 || res._status === 201).toBeTruthy();
    }
    const last = createMockRes();
    await handler(makeReq(b, '5.6.7.8') as never, last as never);
    expect(last._status).toBe(429);
  });

  it('never forwards user-provided strings to Slack (metadata-only)', async () => {
    process.env.ADMIN_SLACK_WEBHOOK = 'https://hooks.slack.com/services/test';

    const fetchMock = vi.fn(async (url: unknown, init?: RequestInit) => {
      // Slack notify
      if (String(url) === process.env.ADMIN_SLACK_WEBHOOK) {
        return { ok: true, json: async () => ({ ok: true }) } as never;
      }
      // Default mock
      return { ok: true, json: async () => ({ ok: true }) } as never;
    });
    vi.stubGlobal('fetch', fetchMock);

    const quote = 'VERY_SENSITIVE_QUOTE_DO_NOT_FORWARD_123';
    const email = 'person@example.com';
    const name = 'A Name';
    const role = 'A Role';

    const res = createMockRes();
    await handler(
      makeReq({ name, role, email, quote, anonymized: false, consent: true }, '9.9.9.9') as never,
      res as never
    );

    expect(res._status).toBe(201);

    const slackCalls = fetchMock.mock.calls.filter((c) => String(c[0]) === process.env.ADMIN_SLACK_WEBHOOK);
    expect(slackCalls.length).toBe(1);

    const slackInit = slackCalls[0]?.[1];
    const body =
      typeof slackInit === 'object' && slackInit !== null && 'body' in slackInit
        ? (slackInit as { body?: unknown }).body
        : undefined;
    if (typeof body !== 'string') {
      throw new TypeError('Expected Slack request body to be a JSON string');
    }

    const payload = JSON.parse(body) as { text?: string };
    expect(typeof payload.text).toBe('string');

    // Must not include raw user-provided strings.
    expect(payload.text).not.toContain(quote);
    expect(payload.text).not.toContain(email);
    expect(payload.text).not.toContain(name);
    expect(payload.text).not.toContain(role);

    // Should include coarse metadata.
    expect(payload.text).toContain('New testimonial submitted');
    expect(payload.text).toContain('quoteChars=');
  });

  it('sends only a generic Slack message on fatal error (no raw error forwarding)', async () => {
    process.env.ADMIN_SLACK_WEBHOOK = 'https://hooks.slack.com/services/test';

    const quote = 'SENSITIVE_QUOTE_IN_ERROR_456';
    const querySpy = vi.spyOn(db, 'query');
    querySpy.mockReset();
    querySpy.mockRejectedValueOnce(new Error(`db failed: ${quote}`));

    const fetchMock = vi.fn(async (url: unknown, init?: RequestInit) => {
      if (String(url) === process.env.ADMIN_SLACK_WEBHOOK) {
        return { ok: true, json: async () => ({ ok: true }) } as never;
      }
      return { ok: true, json: async () => ({ ok: true }) } as never;
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = createMockRes();
    await handler(makeReq({ quote, consent: true }, '8.8.8.8') as never, res as never);
    expect(res._status).toBe(500);

    const slackCalls = fetchMock.mock.calls.filter((c) => String(c[0]) === process.env.ADMIN_SLACK_WEBHOOK);
    expect(slackCalls.length).toBe(1);

    const slackInit = slackCalls[0]?.[1];
    const body =
      typeof slackInit === 'object' && slackInit !== null && 'body' in slackInit
        ? (slackInit as { body?: unknown }).body
        : undefined;
    if (typeof body !== 'string') {
      throw new TypeError('Expected Slack request body to be a JSON string');
    }

    const payload = JSON.parse(body) as { text?: string };
    expect(payload.text).toBe('Fatal error in submissions API: /api/landing/testimonial');
    expect(payload.text).not.toContain(quote);
  });
});

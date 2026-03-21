import handler from '../../../../api/landing/testimonials_verify';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../../../src/lib/database';

type MockRes = {
  _status: number;
  _body: unknown;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
};

type MockReq = {
  method: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
};

type Handler = typeof handler;

function createMockRes(): MockRes {
  const res: MockRes = {
    _status: 200,
    _body: null,
    status: (code: number) => {
      res._status = code;
      return res;
    },
    json: (payload: unknown) => {
      res._body = payload;
      return res;
    },
  };
  return res;
}

describe('POST /api/landing/testimonials_verify', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const authHeaders = {
    authorization: 'Bearer test-admin-key',
    host: 'example.test',
    'x-forwarded-proto': 'https',
    origin: 'https://example.test',
    cookie: 'csrfToken=abc123',
    'x-csrf-token': 'abc123',
  } as const;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });
  afterEach(() => { vi.resetAllMocks(); });

  it('returns 401 if unauthorized', async () => {
    const req: MockReq = { method: 'POST', headers: {}, body: {} };
    const res = createMockRes();
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(401);
    expect(res._body).toMatchObject({ ok: false });
  });

  it('returns 400 if id is missing', async () => {
    const req: MockReq = { method: 'POST', headers: { ...authHeaders }, body: {} };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(400);
  });

  it('returns 403 when csrf header is missing', async () => {
    const req: MockReq = {
      method: 'POST',
      headers: {
        ...authHeaders,
        'x-csrf-token': undefined,
      },
      body: { id: '1', verified: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Missing CSRF token' });
  });

  it('returns 403 when csrf token mismatches cookie token', async () => {
    const req: MockReq = {
      method: 'POST',
      headers: {
        ...authHeaders,
        'x-csrf-token': 'wrong-token',
      },
      body: { id: '1', verified: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid CSRF token' });
  });

  it('returns 403 when origin is absent', async () => {
    const req: MockReq = {
      method: 'POST',
      headers: {
        ...authHeaders,
        origin: undefined,
      },
      body: { id: '1', verified: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid request origin' });
  });

  it('updates testimonial and audits', async () => {
    const fakeResult = [{ id: '1', verified: true }];
    const querySpy = vi.spyOn(db, 'query');
    querySpy
      .mockResolvedValueOnce(fakeResult as unknown as Awaited<ReturnType<typeof db.query>>)
      .mockResolvedValueOnce([] as unknown as Awaited<ReturnType<typeof db.query>>);
    const req: MockReq = {
      method: 'POST',
      headers: {
        ...authHeaders,
        'x-admin-user': 'unit@test',
      },
      body: { id: '1', verified: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(200);
    expect(querySpy).toHaveBeenCalled();
    // audit insert should be the second call and include testimonials_audit
    expect(querySpy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

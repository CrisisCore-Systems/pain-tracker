import handler from '../../../../api/landing/[...route]';
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
  query: Record<string, string | string[]>;
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

describe('PATCH /api/landing/testimonials/[id]', () => {
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

  it('returns 401 if not admin', async () => {
    const req: MockReq = { method: 'PATCH', headers: {}, query: { id: '1' }, body: { name: 'new' } };
    const res = createMockRes();
    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(401);
  });

  it('returns 400 no changes', async () => {
    const req: MockReq = { method: 'PATCH', headers: { ...authHeaders }, query: { id: '1' }, body: {} };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(400);
  });

  it('returns 403 when csrf header is missing', async () => {
    const req: MockReq = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'x-csrf-token': undefined,
      },
      query: { id: '1' },
      body: { anonymized: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Missing CSRF token' });
  });

  it('returns 403 when csrf token mismatches cookie token', async () => {
    const req: MockReq = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'x-csrf-token': 'wrong-token',
      },
      query: { id: '1' },
      body: { anonymized: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid CSRF token' });
  });

  it('returns 403 when origin is missing', async () => {
    const req: MockReq = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        origin: undefined,
      },
      query: { id: '1' },
      body: { anonymized: true },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });

    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: 'Invalid request origin' });
  });

  it('updates and audits on change', async () => {
    const fakeResult = [{ id: '1', name: 'updated' }];
    const spy = vi.spyOn(db, 'query');
    spy
      .mockResolvedValueOnce(fakeResult as unknown as Awaited<ReturnType<typeof db.query>>)
      .mockResolvedValueOnce([] as unknown as Awaited<ReturnType<typeof db.query>>);
    const req: MockReq = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'x-admin-user': 'unit@test',
      },
      query: { id: '1' },
      body: { name: 'updated' },
    };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler({ ...req, query: { route: ['testimonials', '1'] }, url: '/api/landing/testimonials/1' } as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(200);
    expect(spy).toHaveBeenCalled();
    // Ensure the audit insertion was performed (second db.query call)
    expect(spy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

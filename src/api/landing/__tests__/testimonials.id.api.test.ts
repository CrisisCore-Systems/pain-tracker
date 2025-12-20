import handler from '../../../../api/landing/testimonials/[id]';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../../../src/lib/database';

type MockResBody = unknown;
type MockRes = {
  _status: number;
  _body: MockResBody;
  status: (code: number) => MockRes;
  json: (payload: MockResBody) => MockRes;
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
    json: (payload: MockResBody) => {
      res._body = payload;
      return res;
    },
  };
  return res;
}

describe('PATCH /api/landing/testimonials/[id]', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });
  afterEach(() => { vi.resetAllMocks(); });

  it('returns 401 if not admin', async () => {
    const req: MockReq = { method: 'PATCH', headers: {}, query: { id: '1' }, body: { name: 'new' } };
    const res = createMockRes();
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(401);
  });

  it('returns 400 no changes', async () => {
    const req: MockReq = { method: 'PATCH', headers: { authorization: 'Bearer test-admin-key' }, query: { id: '1' }, body: {} };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(400);
  });

  it('updates and audits on change', async () => {
    const fakeResult = [{ id: '1', name: 'updated' }];
    const spy = vi.spyOn(db, 'query');
    spy
      .mockResolvedValueOnce(fakeResult as unknown as Awaited<ReturnType<typeof db.query>>)
      .mockResolvedValueOnce([] as unknown as Awaited<ReturnType<typeof db.query>>);
    const req: MockReq = { method: 'PATCH', headers: { authorization: 'Bearer test-admin-key', 'x-admin-user': 'unit@test' }, query: { id: '1' }, body: { name: 'updated' } };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(200);
    expect(spy).toHaveBeenCalled();
    // Ensure the audit insertion was performed (second db.query call)
    expect(spy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

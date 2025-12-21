import handler from '../../../../api/landing/testimonials_verify';
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

describe('POST /api/landing/testimonials_verify', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

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
    const req: MockReq = { method: 'POST', headers: { authorization: 'Bearer test-admin-key' }, body: {} };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(400);
  });

  it('updates testimonial and audits', async () => {
    const fakeResult = [{ id: '1', verified: true }];
    const querySpy = vi.spyOn(db, 'query');
    querySpy
      .mockResolvedValueOnce(fakeResult as unknown as Awaited<ReturnType<typeof db.query>>)
      .mockResolvedValueOnce([] as unknown as Awaited<ReturnType<typeof db.query>>);
    const req: MockReq = { method: 'POST', headers: { authorization: 'Bearer test-admin-key', 'x-admin-user': 'unit@test' }, body: { id: '1', verified: true } };
    const res = createMockRes();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as unknown as Parameters<Handler>[0], res as unknown as Parameters<Handler>[1]);
    expect(res._status).toBe(200);
    expect(querySpy).toHaveBeenCalled();
    // audit insert should be the second call and include testimonials_audit
    expect(querySpy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

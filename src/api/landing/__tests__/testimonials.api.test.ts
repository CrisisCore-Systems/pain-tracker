import handler from '../../../../api/landing/testimonials';
import type { VercelRequest } from '../../../types/vercel';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../../../src/lib/database';

type MockRes = {
  _status: number;
  _body: unknown;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
};

function createMockRes() {
  const res: MockRes = {
    _status: 200,
    _body: null,
    status: (code: number) => { res._status = code; return res; },
    json: (payload: unknown) => { res._body = payload; return res; },
  };
  return res;
}

describe('GET /api/landing/testimonials', () => {
  beforeEach(() => {
    // Mock db.query
    // default fetch: not authorized
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 if not admin', async () => {
    const req = { method: 'GET', headers: {}, query: {} } as unknown as VercelRequest;
    const res = createMockRes();
    await handler(req as never, res as never);
  expect(res._status).toBe(401);
  expect(res._body).toMatchObject({ ok: false });
  });

  it('returns testimonials for admin', async () => {
    const fakeRows = [{ id: 1, quote: 'test' }];
    const querySpy = vi.spyOn(db, 'query').mockResolvedValueOnce(fakeRows);
  const req = { method: 'GET', headers: { authorization: 'Bearer test-admin-key' }, query: {} } as unknown as VercelRequest;
    const res = createMockRes();
    // Make fetch return successful admin verification
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req as never, res as never);
  expect(res._status).toBe(200);
  expect(res._body).toMatchObject({ ok: true, testimonials: fakeRows });
    expect(querySpy).toHaveBeenCalled();
  });
});

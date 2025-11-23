import handler from '../../../../api/landing/testimonials';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../../../src/lib/database';

function createMockRes() {
  const res: any = {
    _status: 200,
    _body: null,
    status: (code: number) => { res._status = code; return res; },
    json: (payload: any) => { res._body = payload; return res; },
  };
  return res as any;
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
    const req: any = { method: 'GET', headers: {}, query: {} } as VercelRequest;
    const res = createMockRes();
    await handler(req, res);
  expect((res as any)._status).toBe(401);
  expect((res as any)._body).toMatchObject({ ok: false });
  });

  it('returns testimonials for admin', async () => {
    const fakeRows = [{ id: 1, quote: 'test' }];
    const querySpy = vi.spyOn(db, 'query').mockResolvedValueOnce(fakeRows as any);
  const req: any = { method: 'GET', headers: { authorization: 'Bearer test-admin-key' }, query: {} } as VercelRequest;
    const res = createMockRes();
    // Make fetch return successful admin verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req, res);
  expect((res as any)._status).toBe(200);
  expect((res as any)._body).toMatchObject({ ok: true, testimonials: fakeRows });
    expect(querySpy).toHaveBeenCalled();
  });
});

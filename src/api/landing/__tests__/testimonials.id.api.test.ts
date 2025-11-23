import handler from '../../../../api/landing/testimonials/[id]';
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

describe('PATCH /api/landing/testimonials/[id]', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false })); });
  afterEach(() => { vi.resetAllMocks(); });

  it('returns 401 if not admin', async () => {
  const req: any = { method: 'PATCH', headers: {}, query: { id: '1' }, body: { name: 'new' } };
  const res = createMockRes();
  await handler(req, res);
    expect((res as any)._status).toBe(401);
  });

  it('returns 400 no changes', async () => {
  const req: any = { method: 'PATCH', headers: { authorization: 'Bearer test-admin-key' }, query: { id: '1' }, body: {} };
    const res = createMockRes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req, res);
    expect((res as any)._status).toBe(400);
  });

  it('updates and audits on change', async () => {
    const fakeResult = [{ id: '1', name: 'updated' }];
  const spy = vi.spyOn(db, 'query').mockResolvedValueOnce(fakeResult as any).mockResolvedValueOnce([] as any);
  const req: any = { method: 'PATCH', headers: { authorization: 'Bearer test-admin-key', 'x-admin-user': 'unit@test' }, query: { id: '1' }, body: { name: 'updated' } };
    const res = createMockRes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req, res);
    expect((res as any)._status).toBe(200);
  expect(spy).toHaveBeenCalled();
  // Ensure the audit insertion was performed (second db.query call)
  expect(spy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

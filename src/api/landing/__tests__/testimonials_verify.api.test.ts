import handler from '../../../../api/landing/testimonials_verify';
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

describe('POST /api/landing/testimonials_verify', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false })); });
  afterEach(() => { vi.resetAllMocks(); });

  it('returns 401 if unauthorized', async () => {
    const req: any = { method: 'POST', headers: {}, body: {} };
    const res = createMockRes();
    await handler(req, res);
    expect((res as any)._status).toBe(401);
    expect((res as any)._body).toMatchObject({ ok: false });
  });

  it('returns 400 if id is missing', async () => {
  const req: any = { method: 'POST', headers: { authorization: 'Bearer test-admin-key' }, body: {} };
    const res = createMockRes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req, res);
    expect((res as any)._status).toBe(400);
  });

  it('updates testimonial and audits', async () => {
    const fakeResult = [{ id: '1', verified: true }];
    const querySpy = vi.spyOn(db, 'query').mockResolvedValueOnce(fakeResult as any).mockResolvedValueOnce([] as any);
  const req: any = { method: 'POST', headers: { authorization: 'Bearer test-admin-key', 'x-admin-user': 'unit@test' }, body: { id: '1', verified: true } };
    const res = createMockRes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { role: 'admin' } }) });
    await handler(req, res);
    expect((res as any)._status).toBe(200);
    expect(querySpy).toHaveBeenCalled();
    // audit insert should be the second call and include testimonials_audit
    expect(querySpy.mock.calls[1][0]).toMatch(/testimonials_audit/);
  });
});

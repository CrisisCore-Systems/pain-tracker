import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../../../../api/landing/testimonial';
import { db } from '../../../../src/lib/database';

function makeReq(body: any, ip = '1.2.3.4') {
  return { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body } as any;
}

function createMockRes() {
  const res: any = { _status: 200, _body: null, status(code: number) { this._status = code; return this; }, json(payload: any) { this._body = payload; return this; } };
  return res as any;
}

describe('Testimonial submission API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, created: { id: 1 } }) } as any));
    vi.spyOn(db, 'query').mockResolvedValueOnce([{ id: 1 } as any]).mockResolvedValue([] as any);
    process.env.REQ_RATE_LIMIT = '5';
  });
  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.REQ_RATE_LIMIT;
  });

  it('blocks after exceeding rate limit', async () => {
    const b = { name: 'person', quote: 'my story', consent: true };
    for (let i = 0; i < 5; i++) {
      const res = createMockRes();
      await handler(makeReq(b, '5.6.7.8'), res);
      expect(res._status === 201 || res._status === 200 || res._status === 201).toBeTruthy();
    }
    const last = createMockRes();
    await handler(makeReq(b, '5.6.7.8'), last);
    expect(last._status).toBe(429);
  });
});

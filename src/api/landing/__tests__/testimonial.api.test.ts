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
});

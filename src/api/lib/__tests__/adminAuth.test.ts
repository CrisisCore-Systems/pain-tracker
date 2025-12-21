import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import verifyAdmin from '../../../../api-lib/adminAuth';
import type { VercelRequest } from '../../../types/vercel';

describe('adminAuth verifyAdmin helper', () => {
  const oldNodeEnv = process.env.NODE_ENV;
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { process.env.NODE_ENV = oldNodeEnv; vi.resetAllMocks(); });
  it('validates bearer token via internal verify endpoint and requires admin role', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user: { id: '1', role: 'admin' } }) }));
  const req = { headers: { authorization: 'Bearer token-value' } } as unknown as VercelRequest;
  const res = await verifyAdmin(req);
    expect(res.ok).toBe(true);
  });

  it('rejects bearer token when user role not admin', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user: { id: '1', role: 'viewer' } }) }));
  const req = { headers: { authorization: 'Bearer token-value' } } as unknown as VercelRequest;
  const res = await verifyAdmin(req);
    expect(res.ok).toBe(false);
  });
});

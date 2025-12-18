import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import crypto from 'node:crypto';

function getBearerToken(req: VercelRequest): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const value = Array.isArray(authHeader) ? authHeader[0] : String(authHeader);
  if (!value.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length).trim();
  return token.length ? token : null;
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    res.status(501).json({ ok: false, error: 'Admin auth not configured' });
    return;
  }

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  if (!safeEqual(token, expected)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  res.status(200).json({ ok: true, user: { id: 'admin', role: 'admin' } });
}

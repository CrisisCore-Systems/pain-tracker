import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import crypto from 'node:crypto';
import { enforceRateLimit, getClientIp } from '../../../api-lib/http';
import { readClinicSession, isClinicAuthConfigured } from '../../../api-lib/clinicAuthSession';

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
    res.status(405).json({ ok: false, success: false, error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const ok = await enforceRateLimit({
    req,
    res,
    key: `ip:${ip}:clinic:auth:verify`,
    limit: Number(process.env.ADMIN_VERIFY_RATE_LIMIT || 30),
    windowMs: Number(process.env.ADMIN_VERIFY_WINDOW_MS || 5 * 60 * 1000),
  });
  if (!ok) return;

  if (!isClinicAuthConfigured()) {
    res.status(503).json({
      ok: false,
      success: false,
      valid: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  const expected = process.env.ADMIN_API_TOKEN;
  const token = getBearerToken(req);

  // Internal admin-to-admin verification path (bearer token).
  if (expected && token) {
    if (!safeEqual(token, expected)) {
      res.status(401).json({ ok: false, success: false, valid: false, error: 'Unauthorized' });
      return;
    }

    const user = {
      id: 'admin',
      email: 'admin@clinic.com',
      name: 'Clinic Admin',
      role: 'admin',
      organizationId: 'demo-clinic',
      organizationName: 'Pain Tracker Clinic Demo',
      permissions: ['manage:users', 'view:audit_logs', 'export:data', 'configure:system'],
    };

    res.status(200).json({ ok: true, success: true, valid: true, user });
    return;
  }

  // Browser clinic session verification path (httpOnly cookie).
  const sessionUser = readClinicSession(req);
  if (!sessionUser) {
    res.status(401).json({ ok: false, success: false, valid: false, error: 'Unauthorized' });
    return;
  }

  res.status(200).json({ ok: true, success: true, valid: true, user: sessionUser });
}

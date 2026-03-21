import type { VercelRequest } from '../src/types/vercel';
import { getInternalOrigin, logWarn } from './http';

type VerifyAdminResult =
  | { ok: true; user?: unknown }
  | { ok: false; error: string };

function getInternalApiHost(req: VercelRequest): string {
  const configured = process.env.INTERNAL_API_HOST;
  if (configured) return configured;
  return getInternalOrigin(req);
}

export async function verifyAdmin(req: VercelRequest): Promise<VerifyAdminResult> {
  const authHeader = req.headers['authorization'];
  const cookieHeader = req.headers['cookie'];
  const hasBearer = Boolean(authHeader && String(authHeader).startsWith('Bearer '));
  const hasCookie = Boolean(cookieHeader);

  if (!hasBearer && !hasCookie) {
    return { ok: false, error: 'Unauthorized' };
  }

  const token = hasBearer ? String(authHeader).replace('Bearer ', '') : '';
  try {
    const host = getInternalApiHost(req);
    const url = `${host}/api/clinic/auth/verify`;
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
      headers.Cookie = cookieHeader;
    } else if (Array.isArray(cookieHeader) && cookieHeader.length > 0) {
      headers.Cookie = cookieHeader.join('; ');
    }

    const resp = await fetch(url, { method: 'GET', headers });
    if (!resp.ok) return { ok: false, error: 'Invalid auth token' };
    const data = await resp.json();

    const user = (data as { user?: unknown } | null | undefined)?.user;
    const role =
      typeof user === 'object' && user !== null && 'role' in user
        ? (user as { role?: unknown }).role
        : undefined;

    if (role === 'admin') {
      return { ok: true, user };
    }
    return { ok: false, error: 'Not authorized' };
  } catch (e) {
    logWarn('Admin token verify error:', e);
    return { ok: false, error: 'Verification error' };
  }
}

export default verifyAdmin;

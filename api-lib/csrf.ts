import type { VercelRequest } from '../src/types/vercel';
import crypto from 'node:crypto';
import { getInternalOrigin } from './http';
import { readCsrfTokenFromRequest } from './clinicAuthSession';

type CsrfValidationResult =
  | { ok: true }
  | { ok: false; status: 403; error: string };

function headerValue(req: VercelRequest, name: string): string | null {
  const raw = req.headers[name.toLowerCase()];
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function sameOrigin(url: string, expectedOrigin: string): boolean {
  try {
    return new URL(url).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function validateCsrfForMutation(req: VercelRequest): CsrfValidationResult {
  const expectedOrigin = getInternalOrigin(req);
  const origin = headerValue(req, 'origin');
  const referer = headerValue(req, 'referer');

  const originOk = origin ? sameOrigin(origin, expectedOrigin) : false;
  const refererOk = referer ? sameOrigin(referer, expectedOrigin) : false;
  if (!originOk && !refererOk) {
    return { ok: false, status: 403, error: 'Invalid request origin' };
  }

  const headerToken = headerValue(req, 'x-csrf-token');
  const cookieToken = readCsrfTokenFromRequest(req);
  if (!headerToken || !cookieToken) {
    return { ok: false, status: 403, error: 'Missing CSRF token' };
  }

  if (!timingSafeEqual(headerToken, cookieToken)) {
    return { ok: false, status: 403, error: 'Invalid CSRF token' };
  }

  return { ok: true };
}

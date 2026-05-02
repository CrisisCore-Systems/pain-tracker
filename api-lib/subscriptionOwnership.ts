import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '../src/types/vercel';

type OwnerPayload = {
  userId: string;
  exp: number;
};

const SUBSCRIPTION_OWNER_COOKIE = 'pt_subscription_owner';
const OWNER_TTL_SECONDS = 30 * 24 * 60 * 60;

function getSecret(): string | null {
  return (
    process.env.SUBSCRIPTION_OWNER_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.CLINIC_AUTH_SECRET ||
    null
  );
}

function isSecureCookieRequest(req: VercelRequest): boolean {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  if (typeof proto === 'string') {
    return proto.toLowerCase() === 'https';
  }

  const hostRaw = req.headers.host;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  return typeof host === 'string' && !host.includes('localhost');
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payloadBase64: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('Subscription owner secret not configured');
  }

  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function appendSetCookie(res: VercelResponse, cookieValue: string): void {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing.map(String), cookieValue]);
    return;
  }

  res.setHeader('Set-Cookie', [String(existing), cookieValue]);
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const raw = req.headers.cookie;
  if (!raw) return {};

  const source = Array.isArray(raw) ? raw.join(';') : raw;
  const cookies: Record<string, string> = {};

  for (const pair of source.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('='));
  }

  return cookies;
}

export function isSubscriptionOwnershipConfigured(): boolean {
  return Boolean(getSecret());
}

export function issueSubscriptionOwnerCookie(
  res: VercelResponse,
  req: VercelRequest,
  userId: string
): boolean {
  if (!isSubscriptionOwnershipConfigured()) {
    return false;
  }

  const payload: OwnerPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + OWNER_TTL_SECONDS,
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  const secure = isSecureCookieRequest(req);
  const attrs = [
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${OWNER_TTL_SECONDS}`,
    ...(secure ? ['Secure'] : []),
  ];

  appendSetCookie(res, `${SUBSCRIPTION_OWNER_COOKIE}=${payloadBase64}.${signature}; ${attrs.join('; ')}`);
  return true;
}

export function readSubscriptionOwner(req: VercelRequest): string | null {
  if (!isSubscriptionOwnershipConfigured()) {
    return null;
  }

  const token = parseCookies(req)[SUBSCRIPTION_OWNER_COOKIE];
  if (!token) return null;

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  const expected = sign(payloadBase64);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payloadBase64)) as OwnerPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.userId || !parsed.exp || parsed.exp <= now) return null;
    return parsed.userId;
  } catch {
    return null;
  }
}
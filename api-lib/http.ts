import type { VercelRequest, VercelResponse } from '../src/types/vercel';
import crypto from 'node:crypto';
import type { ZodTypeAny } from 'zod';
import rateLimiter from './rateLimiter';

export function getClientIp(req: VercelRequest): string {
  const ipRaw =
    req.headers['x-forwarded-for'] ||
    req.headers['x-vercel-forwarded-for'] ||
    // Some VercelRequest typings omit socket; runtime provides it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).socket?.remoteAddress ||
    'unknown';

  const ipStr = Array.isArray(ipRaw) ? ipRaw[0] : String(ipRaw || 'unknown');
  // x-forwarded-for may include a list
  return ipStr.split(',')[0]?.trim() || 'unknown';
}

export function hashForLogs(value: string): string {
  try {
    return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
  } catch {
    return 'hash_error';
  }
}

export function safeErrorForLogs(err: unknown): { name: string; message: string } {
  if (err instanceof Error) {
    return { name: err.name || 'Error', message: err.message || 'Unknown error' };
  }
  if (typeof err === 'string') {
    return { name: 'Error', message: err };
  }
  return { name: 'Error', message: 'Unknown error' };
}

export function logError(context: string, err: unknown): void {
  console.error(context, safeErrorForLogs(err));
}

export function logWarn(context: string, err: unknown): void {
  console.warn(context, safeErrorForLogs(err));
}

export async function enforceRateLimit(opts: {
  req: VercelRequest;
  res: VercelResponse;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<boolean> {
  const { req, res, key, limit, windowMs } = opts;

  // If the limiter errors, fail open (availability > soft abuse controls).
  try {
    const limited = await rateLimiter.isRateLimited(key, limit);
    if (limited) {
      const resetAt = await rateLimiter.getResetAt(key);
      res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.', resetAt });
      return false;
    }

    // Increment up-front to rate limit even if downstream fails.
    await rateLimiter.increment(key, limit, windowMs);
    return true;
  } catch (e) {
    logWarn('[rateLimit] limiter error (fail-open)', e);
    return true;
  }
}

export function parseBodyWithZod<T>(schema: ZodTypeAny, body: unknown): { ok: true; data: T } | { ok: false; issues: string[] } {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    return { ok: true, data: parsed.data as T };
  }

  const issues = parsed.error.issues.map((i) => {
    const path = i.path.length ? i.path.join('.') : '(root)';
    return `${path}: ${i.message}`;
  });

  return { ok: false, issues };
}

export function getInternalOrigin(req: VercelRequest): string {
  const protoRaw = req.headers['x-forwarded-proto'];
  const hostRaw = req.headers['host'];
  const proto = Array.isArray(protoRaw) ? protoRaw[0] : protoRaw;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;

  if (proto && host) return `${proto}://${host}`;
  if (host) return `https://${host}`;
  return 'http://localhost:3000';
}

export function isAllowedReturnUrl(req: VercelRequest, url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Only allow https in production, and allow http for localhost/dev.
  const origin = getInternalOrigin(req);
  let expected: URL;
  try {
    expected = new URL(origin);
  } catch {
    return false;
  }

  const isLocal = expected.hostname === 'localhost' || expected.hostname === '127.0.0.1';
  if (!isLocal && parsed.protocol !== 'https:') return false;

  // Restrict to same-origin to prevent open redirect abuse.
  return parsed.hostname === expected.hostname;
}

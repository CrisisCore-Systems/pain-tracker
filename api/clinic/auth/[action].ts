import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import crypto from 'node:crypto';
import { enforceRateLimit, getClientIp } from '../../../api-lib/http.js';
import {
  buildDemoUser,
  clearClinicSession,
  issueClinicSession,
  isClinicAuthConfigured,
  readClinicSession,
} from '../../../api-lib/clinicAuthSession.js';
import { validateCsrfForMutation } from '../../../api-lib/csrf.js';

type LoginBody = {
  email?: string;
  password?: string;
};

function readAction(req: VercelRequest): string | null {
  const actionRaw = (req.query as { action?: string | string[] } | undefined)?.action;
  if (typeof actionRaw === 'string') return actionRaw;
  if (Array.isArray(actionRaw) && actionRaw.length > 0) return actionRaw[0] ?? null;

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

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

export async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const ok = await enforceRateLimit({
    req,
    res,
    key: `ip:${ip}:clinic:auth:login`,
    limit: Number(process.env.CLINIC_LOGIN_RATE_LIMIT || 20),
    windowMs: Number(process.env.CLINIC_LOGIN_WINDOW_MS || 5 * 60 * 1000),
  });
  if (!ok) return;

  if (!isClinicAuthConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  const demoAuthEnabled =
    process.env.ALLOW_DEMO_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production';

  if (!demoAuthEnabled) {
    res.status(403).json({
      success: false,
      error: 'Demo authentication is disabled',
      code: 'DEMO_AUTH_DISABLED',
    });
    return;
  }

  const body = (req.body || {}) as LoginBody;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const user = buildDemoUser(email);
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const sessionIssued = issueClinicSession(res, req, user);
  if (!sessionIssued) {
    res.status(503).json({
      success: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  res.status(200).json({
    success: true,
    user,
    mfaEnabled: false,
  });
}

export async function handleRefresh(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  if (!isClinicAuthConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  const csrf = validateCsrfForMutation(req);
  if (!csrf.ok) {
    res.status(csrf.status).json({ success: false, error: csrf.error });
    return;
  }

  const user = readClinicSession(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Session expired' });
    return;
  }

  const sessionIssued = issueClinicSession(res, req, {
    ...user,
    lastLogin: user.lastLogin || new Date().toISOString(),
  });

  if (!sessionIssued) {
    res.status(503).json({
      success: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  res.status(200).json({ success: true, user });
}

export async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  if (!isClinicAuthConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Clinic authentication is not configured on this server',
      code: 'CLINIC_AUTH_MISCONFIGURED',
    });
    return;
  }

  const csrf = validateCsrfForMutation(req);
  if (!csrf.ok) {
    res.status(csrf.status).json({ success: false, error: csrf.error });
    return;
  }

  clearClinicSession(res, req);
  res.status(200).json({ success: true });
}

export async function handleVerify(req: VercelRequest, res: VercelResponse) {
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

  const sessionUser = readClinicSession(req);
  if (!sessionUser) {
    res.status(401).json({ ok: false, success: false, valid: false, error: 'Unauthorized' });
    return;
  }

  res.status(200).json({ ok: true, success: true, valid: true, user: sessionUser });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = readAction(req);

  switch (action) {
    case 'login':
      await handleLogin(req, res);
      return;
    case 'refresh':
      await handleRefresh(req, res);
      return;
    case 'logout':
      await handleLogout(req, res);
      return;
    case 'verify':
      await handleVerify(req, res);
      return;
    default:
      res.status(404).json({ ok: false, error: 'Not found' });
  }
}
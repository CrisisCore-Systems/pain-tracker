import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '../src/types/vercel';

export type ClinicUserRole = 'physician' | 'nurse' | 'admin' | 'researcher';

export type ClinicSessionUser = {
  id: string;
  email: string;
  name: string;
  role: ClinicUserRole;
  organizationId: string;
  organizationName: string;
  permissions: string[];
  lastLogin: string;
};

type SessionPayload = {
  user: ClinicSessionUser;
  exp: number;
};

const SESSION_COOKIE_NAME = 'clinic_session';
const CSRF_COOKIE_NAME = 'csrfToken';
const SESSION_TTL_SECONDS = 15 * 60;

const DEMO_USERS: Record<string, Omit<ClinicSessionUser, 'lastLogin'>> = {
  'doctor@clinic.com': {
    id: 'clinic-physician-1',
    email: 'doctor@clinic.com',
    name: 'Clinic Physician',
    role: 'physician',
    organizationId: 'demo-clinic',
    organizationName: 'Pain Tracker Clinic Demo',
    permissions: [
      'view:patients',
      'edit:patients',
      'create:reports',
      'view:reports',
      'edit:reports',
      'create:prescriptions',
      'view:full_medical_history',
      'schedule:appointments',
      'cancel:appointments',
    ],
  },
  'nurse@clinic.com': {
    id: 'clinic-nurse-1',
    email: 'nurse@clinic.com',
    name: 'Clinic Nurse',
    role: 'nurse',
    organizationId: 'demo-clinic',
    organizationName: 'Pain Tracker Clinic Demo',
    permissions: [
      'view:patients',
      'edit:patient_vitals',
      'view:reports',
      'schedule:appointments',
      'cancel:appointments',
      'create:notes',
    ],
  },
  'admin@clinic.com': {
    id: 'clinic-admin-1',
    email: 'admin@clinic.com',
    name: 'Clinic Admin',
    role: 'admin',
    organizationId: 'demo-clinic',
    organizationName: 'Pain Tracker Clinic Demo',
    permissions: [
      'view:patients',
      'edit:patients',
      'create:reports',
      'view:reports',
      'edit:reports',
      'view:full_medical_history',
      'schedule:appointments',
      'cancel:appointments',
      'manage:users',
      'view:audit_logs',
      'export:data',
      'configure:system',
    ],
  },
};

function getSecret(): string | null {
  const configured = process.env.CLINIC_AUTH_SECRET;
  if (!configured || configured.trim().length === 0) {
    return null;
  }
  return configured;
}

export function isClinicAuthConfigured(): boolean {
  return getSecret() !== null;
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
    throw new Error('Clinic auth secret not configured');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function toCookieString(name: string, value: string, attrs: string[]): string {
  return `${name}=${value}; ${attrs.join('; ')}`;
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

export function readCsrfTokenFromRequest(req: VercelRequest): string | null {
  const cookies = parseCookies(req);
  const token = cookies[CSRF_COOKIE_NAME];
  if (!token) return null;
  return token;
}

export function buildDemoUser(emailRaw: string): ClinicSessionUser | null {
  const email = emailRaw.trim().toLowerCase();
  const candidate = DEMO_USERS[email];
  if (!candidate) return null;

  return {
    ...candidate,
    lastLogin: new Date().toISOString(),
  };
}

export function issueClinicSession(res: VercelResponse, req: VercelRequest, user: ClinicSessionUser): boolean {
  if (!isClinicAuthConfigured()) {
    return false;
  }

  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  const token = `${payloadBase64}.${signature}`;
  const secure = isSecureCookieRequest(req);
  const maxAge = `Max-Age=${SESSION_TTL_SECONDS}`;

  const sessionAttrs = [
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    maxAge,
    ...(secure ? ['Secure'] : []),
  ];
  appendSetCookie(res, toCookieString(SESSION_COOKIE_NAME, token, sessionAttrs));

  const csrfToken = crypto.randomBytes(16).toString('hex');
  const csrfAttrs = ['Path=/', 'SameSite=Strict', maxAge, ...(secure ? ['Secure'] : [])];
  appendSetCookie(res, toCookieString(CSRF_COOKIE_NAME, csrfToken, csrfAttrs));

  return true;
}

export function clearClinicSession(res: VercelResponse, req: VercelRequest): void {
  const secure = isSecureCookieRequest(req);
  const expireAttrs = [
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    ...(secure ? ['Secure'] : []),
  ];
  appendSetCookie(res, toCookieString(SESSION_COOKIE_NAME, '', expireAttrs));

  const csrfExpireAttrs = ['Path=/', 'SameSite=Strict', 'Max-Age=0', ...(secure ? ['Secure'] : [])];
  appendSetCookie(res, toCookieString(CSRF_COOKIE_NAME, '', csrfExpireAttrs));
}

export function readClinicSession(req: VercelRequest): ClinicSessionUser | null {
  if (!isClinicAuthConfigured()) {
    return null;
  }

  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const [payloadBase64, sig] = token.split('.');
  if (!payloadBase64 || !sig) return null;

  const expected = sign(payloadBase64);
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payloadBase64)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed?.exp || parsed.exp <= now) return null;
    if (!parsed.user?.id || !parsed.user?.role) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

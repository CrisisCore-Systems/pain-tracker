import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import { enforceRateLimit, getClientIp } from '../../../api-lib/http';
import { buildDemoUser, isClinicAuthConfigured, issueClinicSession } from '../../../api-lib/clinicAuthSession';

type LoginBody = {
  email?: string;
  password?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  // This endpoint is intentionally bounded to explicit demo identities.
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

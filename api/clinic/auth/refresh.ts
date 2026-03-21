import type { VercelRequest, VercelResponse } from '../../../src/types/vercel';
import { readClinicSession, issueClinicSession, isClinicAuthConfigured } from '../../../api-lib/clinicAuthSession';
import { validateCsrfForMutation } from '../../../api-lib/csrf';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

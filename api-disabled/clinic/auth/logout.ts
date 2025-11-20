/**
 * Clinic Authentication API - Logout Endpoint
 * POST /api/clinic/auth/logout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import { query } from '../../lib/db';
import { verifyAccessToken, extractBearerToken } from '../../lib/auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
    return;
  }

  try {
    // Extract access token
    const accessToken = 
      req.cookies?.accessToken || 
      req.body?.accessToken ||
      extractBearerToken(req.headers.authorization);

    if (!accessToken) {
      res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
      return;
    }

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Revoke all sessions for this clinician (optional: revoke only current session)
    const revokeAll = req.body?.revokeAllSessions === true;

    if (revokeAll) {
      // Revoke all sessions
      await query(
        `UPDATE clinician_sessions 
         SET status = 'revoked' 
         WHERE clinician_id = $1 AND status = 'active'`,
        [payload.clinicianId]
      );
    } else {
      // Revoke only current session
      await query(
        `UPDATE clinician_sessions 
         SET status = 'revoked' 
         WHERE clinician_id = $1 AND session_token = $2`,
        [payload.clinicianId, accessToken]
      );
    }

    // Log logout event
    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        payload.clinicianId,
        'authentication',
        'logout',
        clientIp,
        'success',
        JSON.stringify({ revokeAllSessions: revokeAll })
      ]
    );

    // Clear httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookies = [
      serialize('accessToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      }),
      serialize('refreshToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/clinic/auth',
        maxAge: 0,
      }),
      serialize('csrfToken', '', {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      }),
    ];

    res.setHeader('Set-Cookie', cookies);

    res.status(200).json({ 
      success: true,
      message: revokeAll ? 'All sessions logged out' : 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

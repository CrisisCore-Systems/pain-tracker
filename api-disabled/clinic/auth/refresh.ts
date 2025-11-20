/**
 * Clinic Authentication API - Refresh Token Endpoint
 * POST /api/clinic/auth/refresh
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import { query } from '../../lib/db';
import { verifyRefreshToken, generateAccessToken, extractBearerToken, generateCSRFToken, signCSRFToken, verifyCSRFToken } from '../../lib/auth';

interface RefreshResponse {
  success: boolean;
  accessToken?: string;
  csrfToken?: string;
  error?: string;
}

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
    // Extract refresh token from cookie or body
    const refreshToken = 
      req.cookies?.refreshToken || 
      req.body?.refreshToken ||
      extractBearerToken(req.headers.authorization);

    if (!refreshToken) {
      res.status(401).json({ 
        success: false,
        error: 'Refresh token required' 
      });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid or expired refresh token' 
      });
      return;
    }

    // Verify session exists and is active
    const sessionResult = await query(
      `SELECT 
        cs.id, cs.clinician_id, cs.status, cs.refresh_expires_at,
        c.email, c.role, c.organization_id, c.status as clinician_status
      FROM clinician_sessions cs
      JOIN clinicians c ON cs.clinician_id = c.id
      WHERE cs.id = $1 AND cs.refresh_token = $2`,
      [payload.sessionId, refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      res.status(401).json({ 
        success: false,
        error: 'Session not found' 
      });
      return;
    }

    const session = sessionResult.rows[0];

    // Check if session is active
    if (session.status !== 'active') {
      res.status(401).json({ 
        success: false,
        error: 'Session has been revoked' 
      });
      return;
    }

    // Check if clinician account is still active
    if (session.clinician_status !== 'active') {
      res.status(403).json({ 
        success: false,
        error: 'Account is suspended or deactivated' 
      });
      return;
    }

    // Check if refresh token has expired
    if (new Date(session.refresh_expires_at) < new Date()) {
      await query(
        `UPDATE clinician_sessions SET status = 'expired' WHERE id = $1`,
        [session.id]
      );

      res.status(401).json({ 
        success: false,
        error: 'Refresh token has expired. Please log in again.' 
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      clinicianId: session.clinician_id,
      email: session.email,
      role: session.role,
      organizationId: session.organization_id,
    });

    // Generate new CSRF token
    const csrfToken = generateCSRFToken();
    const csrfSignature = signCSRFToken(csrfToken, session.id);

    // Update session with new access token, CSRF, and last activity
    await query(
      `UPDATE clinician_sessions 
       SET session_token = $1,
           expires_at = $2,
           last_activity = NOW(),
           metadata = metadata || jsonb_build_object('csrf', $3)
       WHERE id = $4`,
      [
        accessToken,
        new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        csrfSignature,
        session.id
      ]
    );

    const response: RefreshResponse = {
      success: true,
      accessToken,
      csrfToken,
    };

    // Set httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookies = [
      serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      }),
      serialize('csrfToken', `${csrfToken}.${csrfSignature}`, {
        httpOnly: false, // Client needs to read this
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }),
    ];

    res.setHeader('Set-Cookie', cookies);
    res.status(200).json(response);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

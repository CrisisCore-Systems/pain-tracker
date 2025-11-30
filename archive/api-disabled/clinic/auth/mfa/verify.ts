/**
 * Clinic Authentication API - MFA Verification Endpoint
 * POST /api/clinic/auth/mfa/verify
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { verifyAccessToken, extractBearerToken } from '../../../lib/auth';
import { authenticator } from 'otplib';

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
    // Verify authentication
    const token = extractBearerToken(req.headers.authorization) || req.cookies?.accessToken;
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized' 
      });
      return;
    }

    const { code } = req.body;

    if (!code) {
      res.status(400).json({ 
        success: false,
        error: 'MFA code is required' 
      });
      return;
    }

    // Get clinician details
    const result = await query(
      `SELECT id, email, mfa_secret FROM clinicians WHERE id = $1`,
      [payload.clinicianId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ 
        success: false,
        error: 'Clinician not found' 
      });
      return;
    }

    const clinician = result.rows[0];

    if (!clinician.mfa_secret) {
      res.status(400).json({ 
        success: false,
        error: 'MFA not set up. Please set up MFA first.' 
      });
      return;
    }

    // Verify MFA code
    const isValid = authenticator.verify({
      token: code,
      secret: clinician.mfa_secret,
    });

    if (!isValid) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid MFA code' 
      });
      return;
    }

    // Enable MFA
    await query(
      `UPDATE clinicians
       SET mfa_enabled = true,
           updated_at = NOW()
       WHERE id = $1`,
      [clinician.id]
    );

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Log event
    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clinician.id,
        'account_management',
        'mfa_enabled',
        clientIp,
        'success',
        JSON.stringify({ email: clinician.email })
      ]
    );

    res.status(200).json({ 
      success: true,
      message: 'MFA enabled successfully. You will now need to provide a code when logging in.' 
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * Clinic Authentication API - Email Verification Endpoint
 * GET /api/clinic/auth/verify-email?token=xxx
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../lib/db';
import { hashToken } from '../../lib/auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
    return;
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ 
        success: false,
        error: 'Verification token required' 
      });
      return;
    }

    // Hash token for lookup
    const tokenHash = hashToken(token);

    // Find clinician with matching token
    const result = await query(
      `SELECT id, email, email_verification_token, email_verification_expires
       FROM clinicians
       WHERE email_verification_token = $1
         AND email_verified = false`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid or expired verification token' 
      });
      return;
    }

    const clinician = result.rows[0];

    // Check if token has expired
    if (new Date(clinician.email_verification_expires) < new Date()) {
      res.status(400).json({ 
        success: false,
        error: 'Verification token has expired. Please request a new one.' 
      });
      return;
    }

    // Mark email as verified
    await query(
      `UPDATE clinicians
       SET email_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [clinician.id]
    );

    // Log event
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clinician.id,
        'account_management',
        'email_verified',
        clientIp,
        'success',
        JSON.stringify({ email: clinician.email })
      ]
    );

    res.status(200).json({ 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

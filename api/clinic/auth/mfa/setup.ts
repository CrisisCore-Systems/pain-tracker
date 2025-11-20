/**
 * Clinic Authentication API - MFA Setup Endpoint
 * POST /api/clinic/auth/mfa/setup
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { verifyAccessToken, extractBearerToken } from '../../../lib/auth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

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

    // Get clinician details
    const result = await query(
      `SELECT id, email, name, mfa_enabled, role FROM clinicians WHERE id = $1`,
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

    // Check if admin role (MFA required for admins)
    const requireMFA = clinician.role === 'admin';

    // Generate MFA secret
    const secret = authenticator.generateSecret();

    // Generate OTP auth URL
    const otpauthUrl = authenticator.keyuri(
      clinician.email,
      'Pain Tracker Clinic',
      secret
    );

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store secret temporarily (not enabled until verified)
    await query(
      `UPDATE clinicians
       SET mfa_secret = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [secret, clinician.id]
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
        'mfa_setup_initiated',
        clientIp,
        'success',
        JSON.stringify({ email: clinician.email, requireMFA })
      ]
    );

    res.status(200).json({ 
      success: true,
      secret,
      qrCode,
      otpauthUrl,
      message: 'Scan the QR code with your authenticator app and verify with a code to enable MFA.',
      requireMFA,
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

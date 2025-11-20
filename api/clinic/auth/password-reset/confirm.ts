/**
 * Clinic Authentication API - Password Reset Confirm Endpoint
 * POST /api/clinic/auth/password-reset/confirm
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { hashPassword, hashToken } from '../../../lib/auth';
import { rateLimit, passwordResetRateLimitConfig } from '../../../lib/rateLimit';

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

  // Apply rate limiting
  const rateLimitPassed = await rateLimit(passwordResetRateLimitConfig)(req, res);
  if (!rateLimitPassed) {
    return;
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ 
        success: false,
        error: 'Token and new password are required' 
      });
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
      return;
    }

    // Hash token for lookup
    const tokenHash = hashToken(token);

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Find clinician with matching token
    const result = await query(
      `SELECT id, email, password_reset_token, password_reset_expires
       FROM clinicians
       WHERE password_reset_token = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid or expired reset token' 
      });
      return;
    }

    const clinician = result.rows[0];

    // Check if token has expired
    if (new Date(clinician.password_reset_expires) < new Date()) {
      res.status(400).json({ 
        success: false,
        error: 'Reset token has expired. Please request a new one.' 
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await query(
      `UPDATE clinicians
       SET password_hash = $1,
           password_reset_token = NULL,
           password_reset_expires = NULL,
           last_password_change = NOW(),
           failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, clinician.id]
    );

    // Revoke all existing sessions for security
    await query(
      `UPDATE clinician_sessions
       SET status = 'revoked'
       WHERE clinician_id = $1 AND status = 'active'`,
      [clinician.id]
    );

    // Log event
    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clinician.id,
        'account_management',
        'password_reset_completed',
        clientIp,
        'success',
        JSON.stringify({ email: clinician.email })
      ]
    );

    res.status(200).json({ 
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.' 
    });

  } catch (error) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

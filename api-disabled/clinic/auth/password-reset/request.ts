/**
 * Clinic Authentication API - Password Reset Request Endpoint
 * POST /api/clinic/auth/password-reset/request
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../lib/db';
import { generateSecureToken, hashToken } from '../../../lib/auth';
import { rateLimit, passwordResetRateLimitConfig } from '../../../lib/rateLimit';
import { sendPasswordResetEmail } from '../../../lib/emailService';

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
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
      return;
    }

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Find clinician by email
    const result = await query(
      `SELECT id, email, status FROM clinicians WHERE email = $1`,
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      // Log anonymous attempt
      await query(
        `INSERT INTO clinician_audit_log (
          event_type, action, ip_address, outcome, details
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'account_management',
          'password_reset_requested',
          clientIp,
          'failure',
          JSON.stringify({ email, reason: 'user_not_found' })
        ]
      );

      res.status(200).json({ 
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
      return;
    }

    const clinician = result.rows[0];

    // Check if account is active
    if (clinician.status !== 'active') {
      await query(
        `INSERT INTO clinician_audit_log (
          clinician_id, event_type, action, ip_address, outcome, details
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          clinician.id,
          'account_management',
          'password_reset_requested',
          clientIp,
          'failure',
          JSON.stringify({ reason: 'account_not_active', status: clinician.status })
        ]
      );

      // Still return success to prevent enumeration
      res.status(200).json({ 
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
      return;
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await query(
      `UPDATE clinicians
       SET password_reset_token = $1,
           password_reset_expires = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [resetTokenHash, expiresAt, clinician.id]
    );

    // Log event
    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clinician.id,
        'account_management',
        'password_reset_requested',
        clientIp,
        'success',
        JSON.stringify({ email: clinician.email })
      ]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: clinician.email,
        name: clinician.name,
        resetToken,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue anyway - don't expose email sending errors to client
    }

    // For development, log the token (REMOVE IN PRODUCTION)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: http://localhost:3000/clinic/reset-password?token=${resetToken}`);
    }

    res.status(200).json({ 
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Include token in development only
      ...(process.env.NODE_ENV !== 'production' && { resetToken })
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

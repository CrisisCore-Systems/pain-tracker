/**
 * Clinic Authentication API - Register Endpoint
 * POST /api/clinic/auth/register
 * 
 * Note: In production, this should be restricted to admins only
 * or require an invitation token for security
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../lib/db';
import { hashPassword, generateSecureToken, hashToken } from '../../lib/auth';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '../../lib/emailService';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'physician' | 'nurse' | 'admin' | 'researcher';
  organizationId: string;
  organizationName: string;
  licenseNumber?: string;
  specialty?: string;
  npiNumber?: string;
  invitationToken?: string; // For secure registration
}

interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  message?: string;
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
    const {
      email,
      password,
      name,
      role,
      organizationId,
      organizationName,
      licenseNumber,
      specialty,
      npiNumber,
      invitationToken,
    }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !name || !role || !organizationId || !organizationName) {
      res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
      return;
    }

    // Validate role
    const validRoles = ['physician', 'nurse', 'admin', 'researcher'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid role' 
      });
      return;
    }

    // Check if invitation token is required (production security)
    if (process.env.REQUIRE_INVITATION_TOKEN === 'true' && !invitationToken) {
      res.status(403).json({ 
        success: false,
        error: 'Invitation token required' 
      });
      return;
    }

    // Verify invitation token if provided
    if (invitationToken) {
      const hashedToken = hashToken(invitationToken);
      const tokenResult = await query(
        `SELECT id, used, expires_at FROM invitation_tokens WHERE token_hash = $1`,
        [hashedToken]
      );

      if (tokenResult.rows.length === 0) {
        res.status(403).json({ 
          success: false,
          error: 'Invalid invitation token' 
        });
        return;
      }

      const tokenData = tokenResult.rows[0];

      if (tokenData.used) {
        res.status(403).json({ 
          success: false,
          error: 'Invitation token already used' 
        });
        return;
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        res.status(403).json({ 
          success: false,
          error: 'Invitation token has expired' 
        });
        return;
      }

      // Mark token as used
      await query(
        `UPDATE invitation_tokens SET used = true, used_at = NOW() WHERE id = $1`,
        [tokenData.id]
      );
    }

    // Check if email already exists
    const existingUser = await query(
      `SELECT id FROM clinicians WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ 
        success: false,
        error: 'Email already registered' 
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const verificationTokenHash = hashToken(verificationToken);

    // Create clinician account
    const clinicianId = randomUUID();
    await query(
      `INSERT INTO clinicians (
        id, email, password_hash, name, role,
        organization_id, organization_name,
        license_number, specialty, npi_number,
        email_verification_token, email_verification_expires,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        clinicianId,
        email.toLowerCase(),
        passwordHash,
        name,
        role,
        organizationId,
        organizationName,
        licenseNumber || null,
        specialty || null,
        npiNumber || null,
        verificationTokenHash,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        'active' // In production, may start as 'pending' until email verified
      ]
    );

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Log registration event
    await query(
      `INSERT INTO clinician_audit_log (
        clinician_id, event_type, action, ip_address, outcome, details
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        clinicianId,
        'account_management',
        'account_created',
        clientIp,
        'success',
        JSON.stringify({ email, role, organizationId })
      ]
    );

    // Send verification email
    try {
      await sendVerificationEmail({
        to: email,
        name,
        verificationToken,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user can request a new verification email
    }

    const response: RegisterResponse = {
      success: true,
      user: {
        id: clinicianId,
        email: email.toLowerCase(),
        name,
        role,
      },
      message: 'Account created successfully. Please check your email to verify your account.',
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for unique constraint violations
    if ((error as any).code === '23505') {
      res.status(409).json({ 
        success: false,
        error: 'Email already registered' 
      });
      return;
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

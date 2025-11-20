/**
 * Clinic Authentication API - Login Endpoint
 * POST /api/clinic/auth/login
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, generateCSRFToken, signCSRFToken } from '../../lib/auth';
import { rateLimit, loginRateLimitConfig, resetRateLimit, recordFailedAttempt } from '../../lib/rateLimit';
import { randomUUID } from 'crypto';
import { serialize } from 'cookie';

interface LoginRequest {
  email: string;
  password: string;
  deviceName?: string;
}

interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organizationName: string;
    permissions: string[];
    mfaEnabled?: boolean;
    requiresMfa?: boolean;
  };
  error?: string;
  message?: string;
}

// Role-based permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  physician: [
    'view:patients',
    'edit:patients',
    'create:reports',
    'view:reports',
    'edit:reports',
    'create:prescriptions',
    'view:full_medical_history',
    'schedule:appointments',
    'cancel:appointments',
  ],
  nurse: [
    'view:patients',
    'create:notes',
    'edit:patient_vitals',
    'view:reports',
    'schedule:appointments',
    'cancel:appointments',
  ],
  admin: [
    'view:patients',
    'edit:patients',
    'create:reports',
    'view:reports',
    'edit:reports',
    'view:full_medical_history',
    'schedule:appointments',
    'cancel:appointments',
    'manage:users',
    'view:audit_logs',
    'export:data',
    'configure:system',
  ],
  researcher: [
    'view:deidentified_data',
    'export:deidentified_data',
    'view:aggregate_analytics',
  ],
};

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
  const rateLimitPassed = await rateLimit(loginRateLimitConfig)(req, res);
  if (!rateLimitPassed) {
    return; // Response already sent by rate limiter
  }

  try {
    const { email, password, deviceName, mfaCode }: LoginRequest & { mfaCode?: string } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
      return;
    }

    // Get client IP for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';

    // Query clinician by email
    const result = await query(
      `SELECT 
        id, email, password_hash, name, role, 
        organization_id, organization_name, status,
        email_verified, failed_login_attempts, locked_until,
        mfa_enabled, mfa_secret
      FROM clinicians 
      WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Log failed attempt (anonymous)
      await query(
        `INSERT INTO clinician_audit_log (
          event_type, action, ip_address, outcome, error_message, details
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'authentication',
          'login_attempt',
          clientIp,
          'failure',
          'Invalid credentials',
          JSON.stringify({ email, reason: 'user_not_found' })
        ]
      );

      res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
      return;
    }

    const clinician = result.rows[0];

    // Check if account is locked
    if (clinician.locked_until && new Date(clinician.locked_until) > new Date()) {
      const lockMinutes = Math.ceil(
        (new Date(clinician.locked_until).getTime() - Date.now()) / (60 * 1000)
      );

      await query(
        `INSERT INTO clinician_audit_log (
          clinician_id, event_type, action, ip_address, outcome, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          clinician.id,
          'authentication',
          'login_attempt',
          clientIp,
          'failure',
          'Account locked'
        ]
      );

      res.status(403).json({ 
        success: false,
        error: `Account is locked. Please try again in ${lockMinutes} minutes.` 
      });
      return;
    }

    // Check if account is active
    if (clinician.status !== 'active') {
      res.status(403).json({ 
        success: false,
        error: 'Account is suspended or deactivated. Contact your administrator.' 
      });
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, clinician.password_hash);

    if (!isValidPassword) {
      // Record failed login attempt (both in DB and rate limiter)
      await query(
        `SELECT record_login_attempt($1, $2, $3)`,
        [clinician.id, clientIp, false]
      );
      
      recordFailedAttempt(req, loginRateLimitConfig);

      res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
      return;
    }

    // Check if MFA is enabled
    if (clinician.mfa_enabled && clinician.mfa_secret) {
      if (!mfaCode) {
        // Password correct but MFA required
        res.status(200).json({
          success: false,
          requiresMfa: true,
          message: 'MFA code required',
        });
        return;
      }

      // Verify MFA code
      const { authenticator } = await import('otplib');
      const isValidMFA = authenticator.verify({
        token: mfaCode,
        secret: clinician.mfa_secret,
      });

      if (!isValidMFA) {
        recordFailedAttempt(req, loginRateLimitConfig);
        res.status(401).json({
          success: false,
          error: 'Invalid MFA code',
        });
        return;
      }
    }

    // Get additional permissions (if any)
    const permissionsResult = await query(
      `SELECT permission 
       FROM clinician_permissions 
       WHERE clinician_id = $1 
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [clinician.id]
    );

    const customPermissions = permissionsResult.rows.map(row => row.permission);
    const rolePermissions = ROLE_PERMISSIONS[clinician.role] || [];
    const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];

    // Create session
    const sessionId = randomUUID();
    const userAgent = req.headers['user-agent'] || 'unknown';
    const accessToken = generateAccessToken({
      clinicianId: clinician.id,
      email: clinician.email,
      role: clinician.role,
      organizationId: clinician.organization_id,
    });
    const refreshToken = generateRefreshToken({
      clinicianId: clinician.id,
      sessionId,
    });

    // Store session in database
    await query(
      `INSERT INTO clinician_sessions (
        id, clinician_id, session_token, refresh_token,
        user_agent, ip_address, device_name,
        expires_at, refresh_expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        sessionId,
        clinician.id,
        accessToken,
        refreshToken,
        userAgent,
        clientIp,
        deviceName || 'Unknown Device',
        new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        'active'
      ]
    );

    // Record successful login
    await query(
      `SELECT record_login_attempt($1, $2, $3)`,
      [clinician.id, clientIp, true]
    );

    // Reset rate limit on successful login
    resetRateLimit(req);

    // Generate CSRF token
    const csrfToken = generateCSRFToken();
    const csrfSignature = signCSRFToken(csrfToken, sessionId);

    // Store CSRF token in session (in production, store in database)
    await query(
      `UPDATE clinician_sessions SET metadata = $1 WHERE id = $2`,
      [JSON.stringify({ csrfToken, csrfSignature }), sessionId]
    );

    // Return response
    const response: LoginResponse = {
      success: true,
      accessToken,
      refreshToken,
      csrfToken,
      user: {
        id: clinician.id,
        email: clinician.email,
        name: clinician.name,
        role: clinician.role,
        organizationId: clinician.organization_id,
        organizationName: clinician.organization_name,
        permissions: allPermissions,
        mfaEnabled: clinician.mfa_enabled,
      },
    };

    // Set secure httpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    const cookies = [
      serialize('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60, // 15 minutes
      }),
      serialize('refreshToken', refreshToken, {
        ...cookieOptions,
        path: '/api/clinic/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }),
      serialize('csrfToken', `${csrfToken}.${csrfSignature}`, {
        httpOnly: false, // CSRF token needs to be readable by client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }),
    ];

    res.setHeader('Set-Cookie', cookies);

    res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

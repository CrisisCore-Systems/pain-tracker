/**
 * Clinic Authentication API - Verify Token Endpoint
 * GET /api/clinic/auth/verify
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../lib/db';
import { verifyAccessToken, extractBearerToken } from '../../lib/auth';

interface VerifyResponse {
  success: boolean;
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organizationName: string;
    permissions: string[];
  };
  error?: string;
}

// Role-based permissions (same as login)
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
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ 
      success: false,
      valid: false,
      error: 'Method not allowed' 
    });
    return;
  }

  try {
    // Extract access token
    const accessToken = 
      req.cookies?.accessToken || 
      extractBearerToken(req.headers.authorization);

    if (!accessToken) {
      res.status(200).json({ 
        success: true,
        valid: false 
      });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      res.status(200).json({ 
        success: true,
        valid: false 
      });
      return;
    }

    // Verify session exists and is active
    const sessionResult = await query(
      `SELECT cs.id, cs.status, c.id as clinician_id, c.email, c.name, 
              c.role, c.organization_id, c.organization_name, c.status as clinician_status
       FROM clinician_sessions cs
       JOIN clinicians c ON cs.clinician_id = c.id
       WHERE cs.session_token = $1`,
      [accessToken]
    );

    if (sessionResult.rows.length === 0) {
      res.status(200).json({ 
        success: true,
        valid: false 
      });
      return;
    }

    const session = sessionResult.rows[0];

    // Check if session is active
    if (session.status !== 'active') {
      res.status(200).json({ 
        success: true,
        valid: false 
      });
      return;
    }

    // Check if clinician account is still active
    if (session.clinician_status !== 'active') {
      res.status(200).json({ 
        success: true,
        valid: false 
      });
      return;
    }

    // Get additional permissions
    const permissionsResult = await query(
      `SELECT permission 
       FROM clinician_permissions 
       WHERE clinician_id = $1 
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [session.clinician_id]
    );

    const customPermissions = permissionsResult.rows.map(row => row.permission);
    const rolePermissions = ROLE_PERMISSIONS[session.role] || [];
    const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];

    // Update last activity
    await query(
      `UPDATE clinician_sessions SET last_activity = NOW() WHERE session_token = $1`,
      [accessToken]
    );

    const response: VerifyResponse = {
      success: true,
      valid: true,
      user: {
        id: session.clinician_id,
        email: session.email,
        name: session.name,
        role: session.role,
        organizationId: session.organization_id,
        organizationName: session.organization_name,
        permissions: allPermissions,
      },
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false,
      valid: false,
      error: 'Internal server error' 
    });
  }
}

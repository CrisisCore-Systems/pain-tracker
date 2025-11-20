/**
 * CSRF Middleware
 * 
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 * Uses double-submit cookie pattern with session binding
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';
import { verifyAccessToken, verifyCSRFToken, extractBearerToken } from './auth';

/**
 * Paths that are exempt from CSRF validation
 * Typically authentication endpoints that don't have a session yet
 */
const CSRF_EXEMPT_PATHS = [
  '/api/clinic/auth/login',
  '/api/clinic/auth/register',
  '/api/clinic/auth/verify-email',
  '/api/clinic/auth/password-reset/request',
  '/api/clinic/auth/password-reset/confirm',
];

/**
 * CSRF Middleware
 * Call this at the start of endpoints that modify state
 * 
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns true if CSRF validation passed, false otherwise (response already sent)
 */
export async function validateCSRF(
  req: VercelRequest,
  res: VercelResponse
): Promise<boolean> {
  // Only validate state-changing requests
  const method = req.method?.toUpperCase();
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method || '')) {
    return true; // Allow GET, HEAD, OPTIONS without CSRF
  }

  // Check if path is exempt
  const path = req.url || '';
  if (CSRF_EXEMPT_PATHS.some(exemptPath => path.startsWith(exemptPath))) {
    return true;
  }

  try {
    // Extract CSRF token from header
    const csrfTokenHeader = req.headers['x-csrf-token'] as string;
    
    if (!csrfTokenHeader) {
      res.status(403).json({
        success: false,
        error: 'CSRF token required',
      });
      return false;
    }

    // Extract access token to get session ID
    const accessToken = 
      req.cookies?.accessToken || 
      extractBearerToken(req.headers.authorization);

    if (!accessToken) {
      res.status(401).json({
        success: false,
        error: 'Authentication required for CSRF validation',
      });
      return false;
    }

    // Verify access token to get payload
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid access token',
      });
      return false;
    }

    // Get session from database to retrieve CSRF signature
    const sessionResult = await query(
      `SELECT id, metadata, status
       FROM clinician_sessions
       WHERE session_token = $1 AND clinician_id = $2`,
      [accessToken, payload.clinicianId]
    );

    if (sessionResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Session not found',
      });
      return false;
    }

    const session = sessionResult.rows[0];

    // Check session is active
    if (session.status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'Session is not active',
      });
      return false;
    }

    // Get CSRF signature from session metadata
    const csrfSignature = session.metadata?.csrf;

    if (!csrfSignature) {
      res.status(403).json({
        success: false,
        error: 'CSRF token not found in session',
      });
      return false;
    }

    // Parse CSRF token from header (format: token.signature)
    const [csrfToken] = csrfTokenHeader.split('.');

    if (!csrfToken) {
      res.status(403).json({
        success: false,
        error: 'Invalid CSRF token format',
      });
      return false;
    }

    // Verify CSRF token
    const isValid = verifyCSRFToken(csrfToken, session.id, csrfSignature);

    if (!isValid) {
      res.status(403).json({
        success: false,
        error: 'CSRF token validation failed',
      });
      return false;
    }

    // CSRF validation passed
    return true;

  } catch (error) {
    console.error('CSRF validation error:', error);
    res.status(500).json({
      success: false,
      error: 'CSRF validation error',
    });
    return false;
  }
}

/**
 * Higher-order function to wrap endpoints with CSRF validation
 * 
 * @example
 * export default withCSRFProtection(async (req, res) => {
 *   // Your endpoint logic here
 * });
 */
export function withCSRFProtection(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const csrfPassed = await validateCSRF(req, res);
    if (!csrfPassed) {
      return; // Response already sent by validateCSRF
    }
    
    // CSRF validation passed, continue to handler
    await handler(req, res);
  };
}

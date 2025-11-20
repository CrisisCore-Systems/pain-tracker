/**
 * Database Migration: Security Enhancements
 * 
 * Adds support for:
 * - Session metadata (CSRF tokens)
 * - Updated password hashes (bcrypt compatible)
 * 
 * Run this after the initial clinic-auth-schema.sql
 */

-- Add metadata column to sessions for CSRF tokens
ALTER TABLE clinician_sessions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index on metadata for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_metadata ON clinician_sessions USING GIN (metadata);

-- Update sample data with bcrypt hashes (password: password123)
-- Bcrypt hash for "password123" with 12 rounds
DO $$
BEGIN
  UPDATE clinicians
  SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfXVFa0BmG'
  WHERE email IN ('doctor@clinic.com', 'nurse@clinic.com', 'admin@clinic.com')
    AND password_hash LIKE 'pbkdf2:%';
EXCEPTION
  WHEN OTHERS THEN
    -- Table might not exist yet, ignore
    NULL;
END $$;

-- Add comment
COMMENT ON COLUMN clinician_sessions.metadata IS 'Stores session-specific data like CSRF tokens';

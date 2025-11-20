/**
 * Clinic Authentication Schema
 * 
 * Database tables for clinician authentication and session management
 * Supports multi-device access for healthcare professionals
 */

-- ============================================================================
-- CLINICIANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile Information
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'physician',
  
  -- Professional Details
  license_number VARCHAR(100),
  specialty VARCHAR(100),
  npi_number VARCHAR(20),
  
  -- Organization
  organization_id VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  
  -- Account Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  
  -- Password Reset
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  
  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_expires_at TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  
  -- Timestamps
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT chk_role CHECK (role IN ('physician', 'nurse', 'admin', 'researcher')),
  CONSTRAINT chk_status CHECK (status IN ('active', 'suspended', 'deactivated')),
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_clinicians_email ON clinicians(email);
CREATE INDEX idx_clinicians_organization ON clinicians(organization_id);
CREATE INDEX idx_clinicians_status ON clinicians(status);
CREATE INDEX idx_clinicians_role ON clinicians(role);

-- ============================================================================
-- CLINICIAN SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinician_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clinician Reference
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  
  -- Session Details
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  
  -- Device Information
  user_agent TEXT,
  ip_address VARCHAR(45),
  device_fingerprint VARCHAR(255),
  device_name VARCHAR(255),
  
  -- Session Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  
  -- Timestamps
  expires_at TIMESTAMP NOT NULL,
  refresh_expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_session_status CHECK (status IN ('active', 'expired', 'revoked'))
);

-- Indexes
CREATE INDEX idx_sessions_clinician_id ON clinician_sessions(clinician_id);
CREATE INDEX idx_sessions_token ON clinician_sessions(session_token);
CREATE INDEX idx_sessions_refresh_token ON clinician_sessions(refresh_token);
CREATE INDEX idx_sessions_status ON clinician_sessions(status);
CREATE INDEX idx_sessions_expires_at ON clinician_sessions(expires_at);

-- ============================================================================
-- CLINICIAN PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinician_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clinician Reference
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  
  -- Permission
  permission VARCHAR(100) NOT NULL,
  
  -- Grant Details
  granted_by UUID REFERENCES clinicians(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Metadata
  reason TEXT,
  metadata JSONB,
  
  CONSTRAINT uq_clinician_permission UNIQUE (clinician_id, permission)
);

-- Indexes
CREATE INDEX idx_permissions_clinician_id ON clinician_permissions(clinician_id);
CREATE INDEX idx_permissions_permission ON clinician_permissions(permission);

-- ============================================================================
-- CLINICIAN AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinician_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clinician Reference
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  
  -- Event Details
  event_type VARCHAR(100) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  
  -- Request Details
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Outcome
  outcome VARCHAR(50) NOT NULL,
  error_message TEXT,
  
  -- Metadata
  details JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_outcome CHECK (outcome IN ('success', 'failure', 'partial'))
);

-- Indexes
CREATE INDEX idx_audit_clinician_id ON clinician_audit_log(clinician_id);
CREATE INDEX idx_audit_event_type ON clinician_audit_log(event_type);
CREATE INDEX idx_audit_created_at ON clinician_audit_log(created_at);
CREATE INDEX idx_audit_outcome ON clinician_audit_log(outcome);

-- ============================================================================
-- PATIENT-CLINICIAN ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_clinician_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  patient_id VARCHAR(255) NOT NULL,
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  
  -- Assignment Details
  role VARCHAR(50) NOT NULL DEFAULT 'primary',
  assigned_by UUID REFERENCES clinicians(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  effective_from DATE,
  effective_to DATE,
  
  -- Metadata
  notes TEXT,
  metadata JSONB,
  
  CONSTRAINT chk_assignment_role CHECK (role IN ('primary', 'consulting', 'covering', 'referring')),
  CONSTRAINT chk_assignment_status CHECK (status IN ('active', 'inactive', 'transferred')),
  CONSTRAINT uq_patient_clinician_role UNIQUE (patient_id, clinician_id, role, status)
);

-- Indexes
CREATE INDEX idx_assignments_patient_id ON patient_clinician_assignments(patient_id);
CREATE INDEX idx_assignments_clinician_id ON patient_clinician_assignments(clinician_id);
CREATE INDEX idx_assignments_status ON patient_clinician_assignments(status);

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_clinician_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinicians_updated_at
  BEFORE UPDATE ON clinicians
  FOR EACH ROW
  EXECUTE FUNCTION update_clinician_updated_at();

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM clinician_sessions
  WHERE expires_at < CURRENT_TIMESTAMP
    OR status = 'revoked';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get clinician with permissions
CREATE OR REPLACE FUNCTION get_clinician_with_permissions(p_email VARCHAR)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name VARCHAR,
  role VARCHAR,
  organization_id VARCHAR,
  permissions TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.email,
    c.name,
    c.role,
    c.organization_id,
    COALESCE(
      ARRAY_AGG(DISTINCT p.permission) FILTER (WHERE p.permission IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as permissions
  FROM clinicians c
  LEFT JOIN clinician_permissions p ON c.id = p.clinician_id
    AND (p.expires_at IS NULL OR p.expires_at > CURRENT_TIMESTAMP)
  WHERE c.email = p_email
    AND c.status = 'active'
  GROUP BY c.id, c.email, c.name, c.role, c.organization_id;
END;
$$ LANGUAGE plpgsql;

-- Record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_clinician_id UUID,
  p_ip_address VARCHAR,
  p_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_success THEN
    -- Reset failed attempts on successful login
    UPDATE clinicians
    SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login = CURRENT_TIMESTAMP
    WHERE id = p_clinician_id;
  ELSE
    -- Increment failed attempts
    UPDATE clinicians
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '30 minutes'
        ELSE locked_until
      END
    WHERE id = p_clinician_id;
  END IF;
  
  -- Log the attempt
  INSERT INTO clinician_audit_log (
    clinician_id,
    event_type,
    action,
    ip_address,
    outcome
  ) VALUES (
    p_clinician_id,
    'authentication',
    'login_attempt',
    p_ip_address,
    CASE WHEN p_success THEN 'success' ELSE 'failure' END
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Development Only)
-- ============================================================================

-- Sample clinicians (passwords are 'password123' hashed with bcrypt)
INSERT INTO clinicians (email, password_hash, name, role, organization_id, organization_name, email_verified)
VALUES 
  (
    'doctor@clinic.com',
    '$2b$10$rBV2uHJbSxCZzq6x6J8vQOqT2kZHXPm2Y4tYqGJ2wQdFVJtUqZqNi',
    'Dr. Sarah Johnson',
    'physician',
    'org-001',
    'Pain Management Clinic',
    true
  ),
  (
    'nurse@clinic.com',
    '$2b$10$rBV2uHJbSxCZzq6x6J8vQOqT2kZHXPm2Y4tYqGJ2wQdFVJtUqZqNi',
    'Emily Chen',
    'nurse',
    'org-001',
    'Pain Management Clinic',
    true
  ),
  (
    'admin@clinic.com',
    '$2b$10$rBV2uHJbSxCZzq6x6J8vQOqT2kZHXPm2Y4tYqGJ2wQdFVJtUqZqNi',
    'Michael Davis',
    'admin',
    'org-001',
    'Pain Management Clinic',
    true
  )
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- CLEANUP (Development Only)
-- ============================================================================

-- DROP TABLE IF EXISTS patient_clinician_assignments CASCADE;
-- DROP TABLE IF EXISTS clinician_audit_log CASCADE;
-- DROP TABLE IF EXISTS clinician_permissions CASCADE;
-- DROP TABLE IF EXISTS clinician_sessions CASCADE;
-- DROP TABLE IF EXISTS clinicians CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_expired_sessions CASCADE;
-- DROP FUNCTION IF EXISTS get_clinician_with_permissions CASCADE;
-- DROP FUNCTION IF EXISTS record_login_attempt CASCADE;
-- DROP FUNCTION IF EXISTS update_clinician_updated_at CASCADE;

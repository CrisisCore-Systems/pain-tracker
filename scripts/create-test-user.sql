-- Create test user for security testing
-- Password: password123
-- Bcrypt hash generated with 12 rounds

-- First, delete existing test users if they exist
DELETE FROM clinicians WHERE email LIKE 'test-%@clinic.com';
DELETE FROM clinicians WHERE email = 'testuser@clinic.com';

-- Insert test user with known password
-- Password 'password123' hashed with bcrypt (12 rounds)
INSERT INTO clinicians (
  email,
  password_hash,
  name,
  role,
  organization_id,
  organization_name,
  email_verified,
  status,
  failed_login_attempts,
  locked_until,
  created_at,
  updated_at
) VALUES (
  'testuser@clinic.com',
  '$2b$12$upf9q7ILAzOHJTsaPoIinuruYm1VqMNjBk5LxkHakAAWLqAQd5Tsu', -- password123
  'Test User',
  'physician',
  'test-org-001',
  'Test Clinic',
  true,
  'active',
  0,
  NULL,
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT email, role, email_verified, status FROM clinicians WHERE email = 'testuser@clinic.com';

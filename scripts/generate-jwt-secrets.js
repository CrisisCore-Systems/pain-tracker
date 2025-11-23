#!/usr/bin/env node
/* eslint-disable */

/**
 * Generate Secure JWT Secrets
 * 
 * Generates cryptographically secure 256-bit (64 hex character) secrets
 * for JWT signing in production environments.
 * 
 * Usage:
 *   node scripts/generate-jwt-secrets.js
 */

const crypto = require('crypto');

function generateSecret(bits = 256) {
  const bytes = bits / 8;
  return crypto.randomBytes(bytes).toString('hex');
}

function printSecret(name, secret) {
  console.log(`${name}=${secret}`);
}

console.log('🔐 Generating Secure JWT Secrets (256-bit)\n');
console.log('Copy these to your .env.local or .env.production file:\n');
console.log('=' .repeat(80));

const jwtSecret = generateSecret(256);
const jwtRefreshSecret = generateSecret(256);
const csrfSecret = generateSecret(256);

printSecret('JWT_SECRET', jwtSecret);
printSecret('JWT_REFRESH_SECRET', jwtRefreshSecret);
printSecret('CSRF_SECRET', csrfSecret);

console.log('=' .repeat(80));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('  1. Never commit these secrets to version control');
console.log('  2. Use different secrets for each environment (dev, staging, prod)');
console.log('  3. Store production secrets in secure environment variable systems');
console.log('  4. Rotate secrets periodically (every 90 days recommended)');
console.log('  5. If secrets are compromised, rotate immediately and revoke all sessions\n');

console.log('📋 Additional recommended environment variables:\n');
console.log('=' .repeat(80));
console.log('# Database');
console.log('DATABASE_URL=postgresql://user:password@localhost:5432/paintracker');
console.log('');
console.log('# App Configuration');
console.log('NODE_ENV=production');
console.log('APP_URL=https://paintracker.ca');
console.log('');
console.log('# Email (for verification and password reset)');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=your-email@gmail.com');
console.log('SMTP_PASSWORD=your-app-password');
console.log('');
console.log('# Security');
console.log('REQUIRE_INVITATION_TOKEN=true  # Require invitation for registration');
console.log('REQUIRE_EMAIL_VERIFICATION=true  # Require email verification');
console.log('=' .repeat(80));

console.log('\n✅ Secrets generated successfully!\n');

#!/usr/bin/env node

function isProductionEnv(nodeEnv) {
  return (nodeEnv || '').toLowerCase() === 'production';
}

function validateClinicAuthEnv(env) {
  const errors = [];
  const nodeEnv = env.NODE_ENV;

  if (!isProductionEnv(nodeEnv)) {
    return { ok: true, errors };
  }

  const clinicAuthSecret = env.CLINIC_AUTH_SECRET;
  if (!clinicAuthSecret || clinicAuthSecret.trim().length === 0) {
    errors.push('CLINIC_AUTH_SECRET is required in production.');
  }

  if ((env.ALLOW_DEMO_AUTH || '').toLowerCase() === 'true') {
    errors.push('ALLOW_DEMO_AUTH must be false in production.');
  }

  return { ok: errors.length === 0, errors };
}

const result = validateClinicAuthEnv(process.env);

if (!result.ok) {
  console.error('[clinic-auth-env] Invalid production environment configuration:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('[clinic-auth-env] Environment checks passed.');

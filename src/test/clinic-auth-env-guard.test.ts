import { describe, expect, it } from 'vitest';
import { validateClinicAuthEnv } from '../lib/clinic-auth-env-guard';

describe('validateClinicAuthEnv', () => {
  it('passes in non-production environments', () => {
    const result = validateClinicAuthEnv({
      NODE_ENV: 'development',
      ALLOW_DEMO_AUTH: 'true',
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('fails in production when CLINIC_AUTH_SECRET is missing', () => {
    const result = validateClinicAuthEnv({
      NODE_ENV: 'production',
      ALLOW_DEMO_AUTH: 'false',
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('CLINIC_AUTH_SECRET is required in production.');
  });

  it('fails in production when demo auth is enabled', () => {
    const result = validateClinicAuthEnv({
      NODE_ENV: 'production',
      CLINIC_AUTH_SECRET: 'configured',
      ALLOW_DEMO_AUTH: 'true',
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('ALLOW_DEMO_AUTH must be false in production.');
  });

  it('passes in production with a secret and demo auth disabled', () => {
    const result = validateClinicAuthEnv({
      NODE_ENV: 'production',
      CLINIC_AUTH_SECRET: 'configured',
      ALLOW_DEMO_AUTH: 'false',
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });
});

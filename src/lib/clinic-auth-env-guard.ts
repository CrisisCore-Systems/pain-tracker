type EnvLike = Record<string, string | undefined>;

export type ClinicAuthEnvGuardResult = {
  ok: boolean;
  errors: string[];
};

function isProductionEnv(nodeEnv: string | undefined): boolean {
  return (nodeEnv || '').toLowerCase() === 'production';
}

export function validateClinicAuthEnv(env: EnvLike): ClinicAuthEnvGuardResult {
  const errors: string[] = [];
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

#!/usr/bin/env node
import { validateClinicAuthEnv } from '../src/lib/clinic-auth-env-guard.ts';

const result = validateClinicAuthEnv(process.env);

if (!result.ok) {
  console.error('[clinic-auth-env] Invalid production environment configuration:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('[clinic-auth-env] Environment checks passed.');

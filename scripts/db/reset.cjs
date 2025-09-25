#!/usr/bin/env node
/*
 * Safe DB reset placeholder (CommonJS)
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('⚠️  Safe placeholder: db reset');
console.log('This script will NOT drop any production databases.');
console.log('If you want to run a real reset, set DRY_RUN=false and ensure you are on a local/test database.');

const dryRun = process.env.DRY_RUN !== 'false';

if (dryRun) {
  console.log('\nDry run mode: showing recommended commands:\n');
  console.log('  # Example (Postgres, local):');
  console.log("  psql -h localhost -U postgres -c \"DROP DATABASE IF EXISTS pain_tracker_test; CREATE DATABASE pain_tracker_test;\"");
  console.log('\nTo execute a real reset: DRY_RUN=false node scripts/db/reset.cjs');
  process.exit(0);
}

try {
  console.log('Running reset commands...');
  console.log('✅ Reset completed (placeholder).');
} catch (err) {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
}

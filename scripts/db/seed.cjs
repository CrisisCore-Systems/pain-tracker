#!/usr/bin/env node
/*
 * Safe DB seed placeholder (CommonJS)
 */
console.log('⚠️  Safe placeholder: db seed');
const dryRun = process.env.DRY_RUN !== 'false';

if (dryRun) {
  console.log('\nDry run mode: showing recommended seed commands:\n');
  console.log('  # Example (node script):');
  console.log('  node scripts/db/real-seed.js --env=development');
  console.log('\nTo execute a real seed: DRY_RUN=false node scripts/db/seed.cjs');
  process.exit(0);
}

try {
  console.log('Seeding database with test data...');
  console.log('✅ Seed completed (placeholder).');
} catch (err) {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
}

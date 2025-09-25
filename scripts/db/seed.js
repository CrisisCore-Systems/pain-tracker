#!/usr/bin/env node
/*
 * Safe DB seed placeholder
 * Prints recommended seed commands and will not modify DB unless DRY_RUN=false.
 */
console.log('⚠️  Safe placeholder: db seed');
const dryRun = process.env.DRY_RUN !== 'false';

if (dryRun) {
  console.log('\nDry run mode: showing recommended seed commands:\n');
  console.log('  # Example (node script):');
  console.log('  node scripts/db/real-seed.js --env=development');
  console.log('\nTo execute a real seed: DRY_RUN=false node scripts/db/seed.js');
  process.exit(0);
}

try {
  console.log('Seeding database with test data...');
  // Placeholder: add seeding logic when DB client and seeds are defined.
  console.log('✅ Seed completed (placeholder).');
} catch (err) {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
}

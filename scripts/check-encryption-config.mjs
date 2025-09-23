#!/usr/bin/env node
const key = process.env.ENCRYPTION_KEY_HEX;
if (!key) {
  console.error('ENCRYPTION_KEY_HEX is not set');
  process.exit(2);
}
if (!/^[0-9a-fA-F]{64}$/.test(key)) {
  console.error('ENCRYPTION_KEY_HEX must be a 256-bit hex string (64 hex chars)');
  process.exit(3);
}
console.log('ENCRYPTION_KEY_HEX looks valid');
process.exit(0);

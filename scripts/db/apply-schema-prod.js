#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load .env.production if present
const envPath = path.resolve(process.cwd(), '.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const connectionString = process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_PRISMA_URL;
if (!connectionString) {
  console.error('No DATABASE_POSTGRES_URL / DATABASE_URL found in environment. Please set it and retry.');
  process.exit(1);
}

const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at', schemaPath);
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');

(async () => {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to DB...');
    await client.connect();
    console.log('Applying schema...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Schema applied successfully');
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(1);
  } finally {
    await client.end();
  }
})();

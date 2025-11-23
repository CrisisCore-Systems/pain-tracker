#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

// Load production env
const envPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(envPath)) {
  console.error('.env.production not found, run vercel env pull first.');
  process.exit(1);
}
dotenv.config({ path: envPath });

const connectionString = process.env.DATABASE_POSTGRES_URL;
if (!connectionString) {
  console.error('No DATABASE_POSTGRES_URL in .env.production');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString });
  await client.connect();
  const res = await client.query('select * from subscriptions where user_id = $1 order by created_at desc limit 10', ['test-user-123']);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
})();

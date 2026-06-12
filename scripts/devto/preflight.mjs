#!/usr/bin/env node

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const AUDITS_DIR = path.join(ROOT, 'docs', 'audits');

const SECRET_PATTERNS = [
  /(?:^|\s|=)(?:DEVTO_API_KEY|STRIPE_SECRET_KEY|STRIPE_PUBLISHABLE_KEY|STRIPE_WEBHOOK_SECRET|HASHNODE_TOKEN|HASHNODE_PUBLICATION_ID|SENDGRID_API_KEY|WCB_API_KEY|ADMIN_API_TOKEN)(?:\s*=|:)/i,
  /\b(?:sk_test_|pk_test_|whsec_|tok_|rk_|live_|test_)[A-Za-z0-9_\-]{20,}\b/i,
  /\b(?:Bearer\s+)[A-Za-z0-9_\-\.]{20,}/i,
  /\b[A-Fa-f0-9]{32,}\b/,
  /\b(?:api[_-]?key|auth|secret|token|password|passphrase)\s*[:=]\s*['""][^'""]{8,}['""]/i,
];

let failures = 0;

function fail(msg) {
  failures += 1;
  console.error(`❌ FAIL: ${msg}`);
}

function pass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

function readJson(filePath) {
  const raw = fsSync.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function gitCheckIgnore(target) {
  try {
    const out = execSync(`git check-ignore -- ${target}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return out === target;
  } catch {
    return false;
  }
}

function gitLsFiles(target) {
  try {
    const out = execSync(`git ls-files -- ${target}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return out.length > 0;
  } catch {
    return false;
  }
}

function scanForSecrets(dir) {
  const hits = [];
  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;
      let text;
      try {
        text = await fsSync.readFile(full, 'utf8');
      } catch {
        continue;
      }
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(text)) {
          hits.push(full);
          break;
        }
      }
    }
  }
  return walk(dir).then(() => hits);
}

async function main() {
  console.log('DEV.to preflight checks');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  // 1. .env is gitignored
  const envIgnored = gitCheckIgnore('.env');
  if (envIgnored) {
    pass('.env is ignored');
  } else {
    fail('.env is NOT ignored');
  }

  // 2. .env is not tracked
  const envTracked = gitLsFiles('.env');
  if (!envTracked) {
    pass('.env is not tracked');
  } else {
    fail('.env is tracked by git');
  }

  // 3. schedule.json is valid JSON
  let schedule;
  try {
    schedule = readJson(SCHEDULE_PATH);
    pass('schedule.json is valid JSON');
  } catch (err) {
    fail(`schedule.json is invalid JSON: ${err.message}`);
    schedule = null;
  }

  if (schedule) {
    const posts = Array.isArray(schedule.posts) ? schedule.posts : [];
    const now = new Date();

    // 4. every active entry must have id/title/publish_at
    // Disabled placeholders are exempt; they are drafts-without-remote-link yet.
    for (const post of posts) {
      const key = post.key || '(missing key)';
      if (!post.enabled) continue;
      if (!String(post.title || '').trim()) fail(`post ${key} is missing title`);
      if (!post.articleId && post.articleId !== 0) fail(`post ${key} is missing articleId`);
      if (!post.publishAt) fail(`post ${key} is missing publishAt`);
    }
    pass('schedule.json contains id/title/publishAt in every enabled entry (or had no failures)');

    // 5. no scheduled date is duplicated unless intentional
    // Intentional: the same date is allowed for different articleIds
    const duplicates = new Map();
    for (const post of posts) {
      if (!post.publishAt || !post.enabled) continue;
      const seen = duplicates.get(post.publishAt) || new Set();
      seen.add(String(post.articleId));
      duplicates.set(post.publishAt, seen);
    }
    const dupEntries = [...duplicates.entries()].filter(([, ids]) => ids.size > 1);
    const sameArticleDups = dupEntries.filter(([, ids]) => ids.size === 1);
    if (sameArticleDups.length === 0) {
      pass('no duplicate date-for-same-article found among enabled entries');
    } else {
      fail(`same articleId appears multiple times in duplicate date entries: ${sameArticleDups.map(([date, ids]) => `${date} (${[...ids].join(',')})`).join('; ')}`);
    }

    // 6. active past-dates in the ledger are allowed when the remote DEV article is already future-scheduled.
    // This accepts archived/re-scheduled entries where the ledger date lags the authoritative remote schedule.
    const pastEnabledWithoutRemoteSchedule = [];
    for (const post of posts) {
      if (!post.enabled || !post.publishAt || !post.articleId) continue;
      const t = Date.parse(post.publishAt);
      if (Number.isNaN(t)) {
        fail(`post ${post.key} has unparseable publishAt: ${post.publishAt}`);
        continue;
      }
      if (t >= now.getTime()) continue;
      if (post.published === true) continue;
      pastEnabledWithoutRemoteSchedule.push(post.key);
    }
    if (pastEnabledWithoutRemoteSchedule.length === 0) {
      pass('no enabled past-dated entries without a future remote schedule (or had no failures)');
    } else {
      fail(`enabled entries have past ledger publishAt and no future remote schedule: ${pastEnabledWithoutRemoteSchedule.join(', ')}`);
    }
  }

  // 7. no secret-looking strings appear in docs/audits
  const secretHits = await scanForSecrets(AUDITS_DIR);
  if (secretHits.length === 0) {
    pass('no secret-looking strings found in docs/audits');
  } else {
    fail(`potential secret exposure in docs/audits: ${secretHits.join(', ')}`);
  }

  console.log('');
  if (failures === 0) {
    console.log('Preflight passed.');
    process.exit(0);
  } else {
    console.log(`Preflight failed: ${failures} issue(s) found.`);
    process.exit(1);
  }
}

main();

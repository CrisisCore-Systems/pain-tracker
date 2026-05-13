/**
 * anchor-fix.mjs
 *
 * Finds weak PainTracker anchor text in DEV.to source markdown files,
 * applies keyword-targeted replacements, and optionally pushes the
 * updated articles to DEV.to via the existing push-source pipeline.
 *
 * Usage (PowerShell — load DEVTO_API_KEY first if needed for --push):
 *
 *   node scripts/devto/anchor-fix.mjs                        # dry run (no changes)
 *   node scripts/devto/anchor-fix.mjs --write                 # fix source files only
 *   node scripts/devto/anchor-fix.mjs --write --push --yes    # fix + push to DEV.to
 *
 * What it fixes:
 *   - [PainTracker](https://paintracker.ca/)       → [private offline pain tracker](https://paintracker.ca/)
 *   - [live demo|open live app|live app|try it|…](paintracker.ca root)
 *                                                  → [private offline pain tracker](https://paintracker.ca/)
 *   - [live demo|download|…](paintracker.ca/download)
 *                                                  → [download PainTracker free](https://paintracker.ca/download)
 *
 * Push strategy: delegates to `node scripts/devto/devto.mjs push-source` for
 * the affected keys so the full CTA/series-injection pipeline runs correctly,
 * preserving injected conversion blocks and next-up footers.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const DEVTO_MJS = path.join(ROOT, 'scripts', 'devto', 'devto.mjs');

// ---------------------------------------------------------------------------
// Anchor replacement rules (ordered — first match wins per link instance).
// Each rule targets a specific weak-anchor / URL combination.
// ---------------------------------------------------------------------------
const ANCHOR_RULES = [
  {
    id: 'ref-impl-root',
    description: '"Reference implementation" brand anchor → primary keyword anchor',
    // Matches: [PainTracker](https://paintracker.ca) or [PainTracker](https://paintracker.ca/)
    // Does NOT match [PainTracker](https://paintracker.ca/something) — keep those unchanged.
    pattern: /\[PainTracker\]\(https?:\/\/(?:www\.)?paintracker\.ca\/?\)/g,
    replacement: '[private offline pain tracker](https://paintracker.ca/)',
  },
  {
    id: 'weak-cta-root',
    description: 'Weak CTA anchor for root URL → primary keyword anchor',
    // Matches generic CTA text pointing to the root app.
    pattern:
      /\[(?:live demo|open live app|live app|try it|open app|website|try the app)\]\(https?:\/\/(?:www\.)?paintracker\.ca\/?\)/gi,
    replacement: '[private offline pain tracker](https://paintracker.ca/)',
  },
  {
    id: 'weak-cta-download',
    description: 'Weak CTA anchor for /download → keyword anchor',
    pattern:
      /\[(?:live demo|open live app|live app|try it|download|download page|get it free)\]\(https?:\/\/(?:www\.)?paintracker\.ca\/download\/?\)/gi,
    replacement: '[download PainTracker free](https://paintracker.ca/download)',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (const token of argv) {
    if (!token.startsWith('--')) continue;
    const eq = token.indexOf('=');
    const k = eq === -1 ? token.slice(2) : token.slice(2, eq);
    const v = eq === -1 ? true : token.slice(eq + 1);
    args[k] = v;
  }
  return args;
}

function applyAnchorRules(md) {
  let out = md;
  const applied = [];
  for (const rule of ANCHOR_RULES) {
    const before = out;
    out = out.replace(rule.pattern, rule.replacement);
    if (out !== before) applied.push(rule);
  }
  return { md: out, applied };
}

function diffLines(original, fixed) {
  const origLines = original.split('\n');
  const fixedLines = fixed.split('\n');
  const diffs = [];
  for (let i = 0; i < Math.max(origLines.length, fixedLines.length); i++) {
    const o = origLines[i] ?? '';
    const f = fixedLines[i] ?? '';
    if (o !== f) diffs.push({ line: i + 1, before: o.trim(), after: f.trim() });
  }
  return diffs;
}

async function loadSchedule() {
  const raw = await fs.readFile(SCHEDULE_PATH, 'utf8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const write = Boolean(args.write);
  const push = Boolean(args.push);
  const yes = Boolean(args.yes);

  const schedule = await loadSchedule();
  const posts = Array.isArray(schedule?.posts) ? schedule.posts : [];

  // Include all posts that have a sourceFile and articleId (enabled or not),
  // because the SEO fix should apply to all live articles.
  const candidates = posts
    .filter((p) => p?.sourceFile)
    .map((p) => ({
      post: p,
      key: String(p.key ?? '').trim(),
      absPath: path.isAbsolute(p.sourceFile) ? p.sourceFile : path.join(ROOT, p.sourceFile),
    }));

  console.log(`Scanning ${candidates.length} source file(s)...\n`);

  const changes = [];

  for (const candidate of candidates) {
    let stat;
    try {
      stat = await fs.stat(candidate.absPath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const md = await fs.readFile(candidate.absPath, 'utf8');
    const { md: fixed, applied } = applyAnchorRules(md);
    if (md === fixed) continue;

    changes.push({ ...candidate, original: md, fixed, applied });
  }

  if (changes.length === 0) {
    console.log('No weak anchors found. Nothing to do.');
    return;
  }

  // ------------------------------------------------------------------
  // Report
  // ------------------------------------------------------------------
  console.log(`Found ${changes.length} file(s) with weak anchors:\n`);

  for (const change of changes) {
    const rel = path.relative(ROOT, change.absPath);
    const hasArticleId = Boolean(change.post?.articleId);
    const articleNote = hasArticleId ? `  [articleId: ${change.post.articleId}]` : '  [no articleId — not yet published]';
    console.log(`  ${rel}${articleNote}`);

    for (const rule of change.applied) {
      console.log(`    ✓ ${rule.description}`);
    }

    // Show inline diff
    const diffs = diffLines(change.original, change.fixed);
    for (const d of diffs) {
      console.log(`    L${d.line} before: ${d.before}`);
      console.log(`    L${d.line} after:  ${d.after}`);
    }
    console.log('');
  }

  // ------------------------------------------------------------------
  // Write source files
  // ------------------------------------------------------------------
  if (!write) {
    console.log('DRY RUN — no files written.');
    if (!push) {
      console.log('  → Pass --write to apply source file changes.');
      console.log('  → Pass --write --push --yes to also push to DEV.to.');
    }
    return;
  }

  for (const change of changes) {
    await fs.writeFile(change.absPath, change.fixed, 'utf8');
    const rel = path.relative(ROOT, change.absPath);
    console.log(`Wrote: ${rel}`);
  }
  console.log(`\nSource files updated: ${changes.length}\n`);

  // ------------------------------------------------------------------
  // Push to DEV.to via push-source
  // ------------------------------------------------------------------
  if (!push) {
    console.log('Pass --push --yes to push the updated articles to DEV.to.');
    return;
  }

  const pushable = changes.filter((c) => Boolean(c.post?.articleId) && c.key);
  const unpushable = changes.filter((c) => !c.post?.articleId || !c.key);

  if (unpushable.length > 0) {
    console.log(
      `Skipping ${unpushable.length} post(s) with no articleId (not yet published to DEV.to):`,
    );
    for (const c of unpushable) console.log(`  ${c.key || c.absPath}`);
    console.log('');
  }

  if (pushable.length === 0) {
    console.log('No published DEV.to articles to push.');
    return;
  }

  const onlyArg = `--only=${pushable.map((c) => c.key).join(',')}`;

  const baseCmd = [
    'node',
    DEVTO_MJS,
    'push-source',
    '--allow-published',
    onlyArg,
  ];

  if (yes) {
    baseCmd.push('--yes');
  }

  console.log(`Running: ${baseCmd.join(' ')}\n`);

  if (!yes) {
    console.log('DRY RUN — push-source will run without --yes (no API writes).');
    console.log('Pass --yes to apply changes to DEV.to.\n');
  }

  try {
    execFileSync(baseCmd[0], baseCmd.slice(1), {
      stdio: 'inherit',
      cwd: ROOT,
      env: {
        ...process.env,
        // Propagate DEV.to env vars explicitly so the child sees them.
        DEVTO_API_KEY: process.env.DEVTO_API_KEY ?? '',
        DEVTO_SPONSOR_URL: process.env.DEVTO_SPONSOR_URL ?? '',
        DEVTO_REPO_URL: process.env.DEVTO_REPO_URL ?? '',
      },
    });
  } catch (err) {
    // execFileSync throws on non-zero exit; output already printed via stdio:inherit.
    console.error(`\npush-source exited with error: ${err.message}`);
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exitCode = 1;
  });
}

#!/usr/bin/env node
/**
 * generate-loc-badge.mjs
 * Rough LOC (lines of code) badge generator.
 * Counts non-empty, non-comment lines for selected source extensions.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'badges', 'loc-badge.json');
const exts = new Set(['.ts', '.tsx']);
const EXCLUDED_DIRS = new Set([
  'node_modules','dist','coverage','public','assets','scripts','samples','docs','test','__tests__'
]);

async function* walk(dir){
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDED_DIRS.has(e.name)) continue;
      yield* walk(full);
    } else {
      if (exts.has(path.extname(e.name))) yield full;
    }
  }
}

function color(loc){
  // Adjust thresholds for core filtered footprint
  if (loc < 2000) return 'brightgreen';
  if (loc < 6000) return 'green';
  if (loc < 10000) return 'yellowgreen';
  if (loc < 15000) return 'yellow';
  if (loc < 22000) return 'orange';
  return 'red';
}

async function countLOC(){
  let total = 0;
  for await (const file of walk(SRC)) {
    try {
      const content = await readFile(file, 'utf8');
      const lines = content.split(/\r?\n/).filter(l => {
        const trimmed = l.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('//')) return false;
        if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return false;
        return true;
      });
      total += lines.length;
  } catch { /* ignore read error */ }
  }
  return total;
}

async function main(){
  if (!existsSync(SRC)) {
    console.error('src directory missing');
    process.exit(0);
  }
  const loc = await countLOC();
  const badge = {
    schemaVersion: 1,
    label: 'loc',
    message: String(loc),
    color: color(loc)
  };
  await writeFile(OUT, JSON.stringify(badge, null, 2));
  console.log('Generated loc badge', badge);
}

main().catch(e=>{ console.error(e); process.exit(1); });

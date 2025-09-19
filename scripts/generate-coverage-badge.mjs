#!/usr/bin/env node
/**
 * generate-coverage-badge.mjs
 * Reads coverage/coverage-summary.json (v8 format) and produces a shields endpoint JSON.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SUMMARY = path.join(ROOT, 'coverage', 'coverage-summary.json');
const OUTPUT = path.join(ROOT, 'badges', 'coverage-badge.json');

function color(pct){
  if (pct >= 90) return 'brightgreen';
  if (pct >= 80) return 'green'; // promote 80+ to green
  if (pct >= 70) return 'yellowgreen';
  if (pct >= 60) return 'yellow';
  if (pct >= 50) return 'orange';
  return 'red';
}

async function main(){
  if(!existsSync(SUMMARY)){
    console.error('Coverage summary not found');
    process.exit(0); // do not fail pipeline
  }
  const data = JSON.parse(await readFile(SUMMARY,'utf8'));
  const pct = data.total?.lines?.pct ?? data.total?.statements?.pct ?? 0;
  const rounded = Math.round(pct);
  const badge = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${rounded}%`,
    color: color(rounded)
  };
  await writeFile(OUTPUT, JSON.stringify(badge,null,2));
  console.log('Generated coverage badge', badge);
}

main().catch(e=>{ console.error(e); process.exit(1); });

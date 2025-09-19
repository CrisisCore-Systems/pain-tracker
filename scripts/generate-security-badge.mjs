#!/usr/bin/env node
/**
 * generate-security-badge.mjs
 * Reads security-audit-report.json and produces a shields endpoint JSON summarizing vulnerabilities.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'security-audit-report.json');
const OUTPUT = path.join(ROOT, 'badges', 'security-badge.json');

function color(total, critical){
  if (total === 0) return 'brightgreen';
  if (critical > 0) return 'red';
  if (total > 50) return 'orange';
  if (total > 10) return 'yellow';
  return 'yellowgreen';
}

async function main(){
  if(!existsSync(REPORT)){
    console.error('Security audit report not found');
    process.exit(0);
  }
  const data = JSON.parse(await readFile(REPORT,'utf8'));
  const total = data.totalVulnerabilities ?? data.summary?.vulnerabilities?.total ?? 0;
  const critical = data.criticalCount ?? data.summary?.vulnerabilities?.critical ?? 0;
  const label = 'vulns';
  const message = total === 0 ? '0' : `${total}${critical?'/'+critical+'C':''}`;
  const badge = {
    schemaVersion: 1,
    label,
    message,
    color: color(total, critical)
  };
  await writeFile(OUTPUT, JSON.stringify(badge,null,2));
  console.log('Generated security badge', badge);
}

main().catch(e=>{ console.error(e); process.exit(1); });

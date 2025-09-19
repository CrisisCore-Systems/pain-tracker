#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'reports', 'mutation', 'mutation.json');
const OUT = path.join(ROOT, 'badges', 'mutation-badge.json');

function color(score){
  if (score >= 85) return 'brightgreen';
  if (score >= 75) return 'green';
  if (score >= 65) return 'yellowgreen';
  if (score >= 55) return 'yellow';
  if (score >= 45) return 'orange';
  return 'red';
}

async function main(){
  if (!existsSync(REPORT)){
    const placeholder = { schemaVersion:1, label:'mutation', message:'n/a', color:'lightgrey' };
    await writeFile(OUT, JSON.stringify(placeholder,null,2));
    console.error('mutation.json not found; wrote placeholder badge');
    return;
  }
  const json = JSON.parse(await readFile(REPORT,'utf8'));
  const score = Math.max(0, Math.min(100, Number(json.mutationScore ?? json.metrics?.mutationScore ?? 0)));
  const badge = { schemaVersion:1, label:'mutation', message: `${score.toFixed(1)}%`, color: color(score) };
  await writeFile(OUT, JSON.stringify(badge,null,2));
  console.log('Generated mutation badge', badge);
}

main().catch(e=>{ console.error(e); process.exit(1); });

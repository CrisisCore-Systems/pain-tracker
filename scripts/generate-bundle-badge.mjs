#!/usr/bin/env node
/**
 * generate-bundle-badge.mjs
 * Uses esbuild metafile (generated via `npm run build -- --metafile=meta.json` or vite build config) to aggregate JS/CSS asset sizes.
 * If metafile absent, runs a vite build with analyze flag to produce one (lightweight attempt) then parses it.
 */
import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const META = path.join(ROOT, 'dist', 'meta.json');
const BADGE = path.join(ROOT, 'badges', 'bundle-badge.json');

function human(bytes){
  const u=['B','KB','MB','GB'];
  let i=0; let v=bytes;
  while(v>1024 && i<u.length-1){ v/=1024; i++; }
  return `${v.toFixed(v>100?0: (v>10?1:2))}${u[i]}`;
}

function color(kb){
  if (kb < 200) return 'brightgreen';
  if (kb < 350) return 'green';
  if (kb < 500) return 'yellowgreen';
  if (kb < 750) return 'yellow';
  if (kb < 1000) return 'orange';
  return 'red';
}

async function ensureMeta(){
  if (existsSync(META)) return true;
  // Skip auto build in developer local quick runs; return false so we fallback
  return false;
}

async function parseMeta(){
  const json = JSON.parse(await readFile(META,'utf8'));
  // esbuild metafile structure: outputs: { file: { bytes } }
  const outputs = json.outputs || {};
  let total=0;
  for (const [file, info] of Object.entries(outputs)) {
    if (/\.map$/.test(file)) continue;
    if (!/\.(js|css)$/.test(file)) continue;
    total += info.bytes || 0;
  }
  return total;
}

async function main(){
  const hasMeta = await ensureMeta();
  if (!hasMeta || !existsSync(META)) {
    const fallback = { schemaVersion:1,label:'bundle',message:'n/a',color:'lightgrey' };
    await writeFile(BADGE, JSON.stringify(fallback,null,2));
    console.error('Bundle metafile absent; wrote placeholder bundle badge.');
    return;  
  }
  const totalBytes = await parseMeta();
  const kb = totalBytes/1024;
  const badge = { schemaVersion:1, label:'bundle', message:human(totalBytes), color: color(kb) };
  await writeFile(BADGE, JSON.stringify(badge,null,2));
  console.log('Generated bundle badge', badge);
}

main().catch(e=>{ console.error(e); process.exit(1); });

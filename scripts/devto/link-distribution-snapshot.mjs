import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'artifacts', 'devto', 'link-distribution-report.json');
const HISTORY_DIR = path.join(ROOT, 'artifacts', 'devto', 'history');

function stampFromDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

if (!fs.existsSync(SRC)) {
  throw new Error('Missing artifacts/devto/link-distribution-report.json. Run the report first.');
}

const now = new Date();
const stamp = stampFromDate(now);
const outName = `link-distribution-report-${stamp}.json`;
const outPath = path.join(HISTORY_DIR, outName);

fs.mkdirSync(HISTORY_DIR, { recursive: true });
fs.copyFileSync(SRC, outPath);

console.log(`Snapshot saved: ${path.relative(ROOT, outPath)}`);

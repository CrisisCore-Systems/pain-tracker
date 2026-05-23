import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HISTORY_DIR = path.join(ROOT, 'artifacts', 'devto', 'history');

function parseArgs(argv) {
  const args = { _: [] };
  for (const token of argv) {
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [key, value] = token.slice(2).split('=');
    args[key] = value ?? true;
  }
  return args;
}

function readReport(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing report file: ${path.relative(ROOT, filePath)}`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return {
    filePath,
    generatedAt: raw.generatedAt ?? null,
    homepageShare: Number(raw.homepageShare ?? 0),
    totalLinks: Number(raw.totalPaintrackerLinks ?? 0),
    distinctTargets: Number(raw.distinctTargetPaths ?? 0),
  };
}

function findLastTwoHistoryReports() {
  if (!fs.existsSync(HISTORY_DIR)) {
    return [];
  }

  const files = fs.readdirSync(HISTORY_DIR)
    .filter((name) => /^link-distribution-report-\d{8}T\d{6}Z\.json$/i.test(name))
    .map((name) => ({
      name,
      fullPath: path.join(HISTORY_DIR, name),
      mtime: fs.statSync(path.join(HISTORY_DIR, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return files.slice(0, 2).map((entry) => entry.fullPath);
}

function formatPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function printReport(label, report) {
  console.log(`${label}: ${path.relative(ROOT, report.filePath)}`);
  console.log(`  generatedAt: ${report.generatedAt ?? '(unknown)'}`);
  console.log(`  homepageShare: ${formatPct(report.homepageShare)}`);
  console.log(`  totalLinks: ${report.totalLinks}`);
  console.log(`  distinctTargets: ${report.distinctTargets}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let previousPath = args.previous && args.previous !== true ? path.resolve(ROOT, String(args.previous)) : null;
  let currentPath = args.current && args.current !== true ? path.resolve(ROOT, String(args.current)) : null;

  if (!previousPath || !currentPath) {
    const latestTwo = findLastTwoHistoryReports();
    if (latestTwo.length < 2) {
      throw new Error(
        'Need at least two report snapshots. Provide --previous and --current, or create history snapshots first.',
      );
    }

    currentPath = currentPath ?? latestTwo[0];
    previousPath = previousPath ?? latestTwo[1];
  }

  const previous = readReport(previousPath);
  const current = readReport(currentPath);

  console.log('Dev.to link distribution trend check');
  console.log('-----------------------------------');
  printReport('Previous', previous);
  printReport('Current', current);

  const delta = Number((current.homepageShare - previous.homepageShare).toFixed(4));
  const improved = delta < 0;
  const unchanged = delta === 0;

  console.log(`Delta homepageShare: ${formatPct(delta)}`);

  if (improved) {
    console.log('PASS: homepage share decreased.');
    process.exit(0);
  }

  if (unchanged) {
    console.log('PASS: homepage share unchanged.');
    process.exit(0);
  }

  console.error('FAIL: homepage share increased. Rebalance deep links before continuing.');
  process.exit(1);
}

main();

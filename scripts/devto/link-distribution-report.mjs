import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const DEFAULT_OUT_PATH = path.join(ROOT, 'artifacts', 'devto', 'link-distribution-report.json');

const args = new Set(process.argv.slice(2));
const writeReport = args.has('--write');
const publishedOnly = args.has('--published-only');

function loadSchedule() {
  if (!fs.existsSync(SCHEDULE_PATH)) {
    throw new Error('Missing scripts/devto/schedule.json.');
  }
  return JSON.parse(fs.readFileSync(SCHEDULE_PATH, 'utf8'));
}

function stripTrailingPunctuation(value) {
  return value.replace(/[),.;:!?]+$/g, '');
}

function normalizePathname(urlString) {
  const parsed = new URL(urlString);
  const host = parsed.hostname.toLowerCase();
  if (host !== 'paintracker.ca' && host !== 'www.paintracker.ca') {
    return null;
  }

  const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath.includes('http://') || normalizedPath.includes('https://') || normalizedPath.includes('](')) {
    return null;
  }
  return normalizedPath;
}

function readSourceFile(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function summarize(schedule) {
  const linkRegex = /\bhttps?:\/\/[^\s<>"'\])]+/gi;
  const pathCounts = new Map();
  const keyCounts = new Map();

  let scannedPosts = 0;
  let missingSourceCount = 0;

  for (const post of schedule.posts ?? []) {
    if (publishedOnly && !post.published) {
      continue;
    }

    if (!post.sourceFile || typeof post.sourceFile !== 'string') {
      continue;
    }

    const source = readSourceFile(post.sourceFile);
    if (source == null) {
      missingSourceCount += 1;
      continue;
    }

    scannedPosts += 1;
    const matches = source.match(linkRegex) ?? [];

    for (const match of matches) {
      const cleaned = stripTrailingPunctuation(match);
      let normalizedPath;
      try {
        normalizedPath = normalizePathname(cleaned);
      } catch {
        continue;
      }

      if (!normalizedPath) {
        continue;
      }

      pathCounts.set(normalizedPath, (pathCounts.get(normalizedPath) ?? 0) + 1);
      keyCounts.set(post.key, (keyCounts.get(post.key) ?? 0) + 1);
    }
  }

  const sortedPathCounts = Array.from(pathCounts.entries())
    .map(([targetPath, count]) => ({ targetPath, count }))
    .sort((a, b) => b.count - a.count || a.targetPath.localeCompare(b.targetPath));

  const sortedKeyCounts = Array.from(keyCounts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  const totalLinks = sortedPathCounts.reduce((sum, item) => sum + item.count, 0);
  const homepageLinks = pathCounts.get('/') ?? 0;
  const homepageShare = totalLinks === 0 ? 0 : Number((homepageLinks / totalLinks).toFixed(4));

  return {
    generatedAt: new Date().toISOString(),
    publishedOnly,
    scannedPosts,
    missingSourceCount,
    totalPaintrackerLinks: totalLinks,
    distinctTargetPaths: sortedPathCounts.length,
    homepageLinks,
    homepageShare,
    targetPathCounts: sortedPathCounts,
    postKeyCounts: sortedKeyCounts
  };
}

function printSummary(report) {
  console.log('Dev.to link distribution report');
  console.log('--------------------------------');
  console.log(`Scanned posts: ${report.scannedPosts}`);
  console.log(`Missing source files: ${report.missingSourceCount}`);
  console.log(`Total paintracker.ca links: ${report.totalPaintrackerLinks}`);
  console.log(`Distinct target paths: ${report.distinctTargetPaths}`);
  console.log(`Homepage links: ${report.homepageLinks}`);
  console.log(`Homepage share: ${(report.homepageShare * 100).toFixed(2)}%`);

  if (report.targetPathCounts.length === 0) {
    console.log('No paintracker.ca links found in scanned source files.');
    return;
  }

  console.log('');
  console.log('Top target paths');
  for (const item of report.targetPathCounts.slice(0, 12)) {
    console.log(`- ${item.targetPath}: ${item.count}`);
  }
}

function writeJsonReport(report) {
  const outDir = path.dirname(DEFAULT_OUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(DEFAULT_OUT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${path.relative(ROOT, DEFAULT_OUT_PATH)}`);
}

const schedule = loadSchedule();
const report = summarize(schedule);
printSummary(report);

if (writeReport) {
  writeJsonReport(report);
}

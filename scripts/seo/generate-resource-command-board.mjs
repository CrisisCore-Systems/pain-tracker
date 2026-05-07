#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_BOARD_PATH = 'docs/product/RESOURCE_PAGE_COMMAND_BOARD.md';

export const RESOURCE_ROWS = [
  { label: 'Monthly pain tracker printable', slug: 'monthly-pain-tracker-printable' },
  { label: '7-day pain diary template', slug: '7-day-pain-diary-template' },
  { label: 'WorkSafeBC pain journal template', slug: 'worksafebc-pain-journal-template' },
  { label: 'Pain journal for disability benefits', slug: 'pain-journal-for-disability-benefits' },
  { label: 'How to track pain for doctors', slug: 'how-to-track-pain-for-doctors' },
  { label: 'Daily pain tracker printable', slug: 'daily-pain-tracker-printable' },
  { label: 'Symptom tracker printable', slug: 'symptom-tracker-printable' },
  { label: 'Pain diary for specialist appointment', slug: 'pain-diary-for-specialist-appointment' },
  { label: 'Documenting pain for disability claim', slug: 'documenting-pain-for-disability-claim' },
  { label: 'Resources index', slug: 'index' },
];

const SLUGS = new Set(RESOURCE_ROWS.map((row) => row.slug));
const LABEL_TO_SLUG = new Map(RESOURCE_ROWS.map((row) => [normalizeKey(row.label), row.slug]));

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function parseInteger(value) {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().replace(/,/g, '');
  if (!normalized) return null;

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFirstValue(row, candidates) {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

export function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }

      row.push(current);
      current = '';

      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((value) => normalizeHeader(value));
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, headerIndex) => {
      if (!header) return;
      record[header] = cells[headerIndex] ?? '';
    });
    return record;
  });
}

export function readStructuredRows(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.json') {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    throw new Error(`Unsupported JSON shape in ${filePath}. Expected an array or { rows: [] }.`);
  }

  if (extension === '.csv') {
    return parseCsv(content);
  }

  throw new Error(`Unsupported input type for ${filePath}. Use .csv or .json.`);
}

export function resolveResourceSlug(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  if (SLUGS.has(raw)) {
    return raw;
  }

  const labelSlug = LABEL_TO_SLUG.get(normalizeKey(raw));
  if (labelSlug) {
    return labelSlug;
  }

  const withBase = /^[a-z]+:\/\//i.test(raw) ? raw : `https://placeholder.local${raw.startsWith('/') ? '' : '/'}${raw}`;

  try {
    const url = new URL(withBase);
    const pathname = url.pathname.replace(/\/+$/, '');
    if (pathname === '/resources' || pathname === '/resources/index') {
      return 'index';
    }

    const match = /^\/resources\/([^/]+)$/.exec(pathname);
    if (!match) return null;

    const slug = decodeURIComponent(match[1]);
    return SLUGS.has(slug) ? slug : null;
  } catch {
    return null;
  }
}

function accumulateMetric(target, slug, field, value) {
  if (!slug) return;
  if (!target.has(slug)) {
    target.set(slug, {
      impressions: null,
      clicks: null,
      ctaClicks: null,
      firstLogs: null,
      exportClicks: null,
    });
  }

  const row = target.get(slug);
  row[field] = (row[field] ?? 0) + value;
}

function loadSearchConsoleMetrics(filePath, target) {
  if (!filePath) return;

  for (const row of readStructuredRows(filePath)) {
    const slug = resolveResourceSlug(getFirstValue(row, ['page', 'landingpage', 'url', 'path']));
    const impressions = parseInteger(getFirstValue(row, ['impressions', 'impression']));
    const clicks = parseInteger(getFirstValue(row, ['clicks', 'click']));

    if (!slug) continue;
    if (impressions !== null) accumulateMetric(target, slug, 'impressions', impressions);
    if (clicks !== null) accumulateMetric(target, slug, 'clicks', clicks);
  }
}

function loadRollupMetrics(filePath, target, field) {
  if (!filePath) return;

  for (const row of readStructuredRows(filePath)) {
    const slug = resolveResourceSlug(getFirstValue(row, ['resourcepageslug', 'resource_page_slug', 'slug', 'page', 'url', 'path']));
    const count = parseInteger(getFirstValue(row, ['count', 'total', 'clicks', 'events', 'value']));

    if (!slug || count === null) continue;
    accumulateMetric(target, slug, field, count);
  }
}

export function collectBoardMetrics({ searchConsolePath, ctaPath, firstLogsPath, exportsPath }) {
  const metrics = new Map();

  loadSearchConsoleMetrics(searchConsolePath, metrics);
  loadRollupMetrics(ctaPath, metrics, 'ctaClicks');
  loadRollupMetrics(firstLogsPath, metrics, 'firstLogs');
  loadRollupMetrics(exportsPath, metrics, 'exportClicks');

  return metrics;
}

function formatMetric(value) {
  return value === null || value === undefined ? 'pending import' : String(value);
}

export function applyMetricsToBoard(boardContent, metrics) {
  return boardContent
    .split(/\r?\n/)
    .map((line) => {
      const match = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line);
      if (!match) return line;

      const label = match[1].trim();
      const slug = LABEL_TO_SLUG.get(normalizeKey(label));
      if (!slug) return line;

      const rowMetrics = metrics.get(slug) ?? {
        impressions: null,
        clicks: null,
        ctaClicks: null,
        firstLogs: null,
        exportClicks: null,
      };

      return [
        '|',
        ` ${label} `,
        ` ${match[2].trim()} `,
        ` ${formatMetric(rowMetrics.impressions)} `,
        ` ${formatMetric(rowMetrics.clicks)} `,
        ` ${formatMetric(rowMetrics.ctaClicks)} `,
        ` ${formatMetric(rowMetrics.firstLogs)} `,
        ` ${formatMetric(rowMetrics.exportClicks)} `,
        '|',
      ].join('|');
    })
    .join('\n');
}

export function parseArgs(argv) {
  const args = {
    boardPath: DEFAULT_BOARD_PATH,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case '--search-console':
        args.searchConsolePath = next;
        index += 1;
        break;
      case '--cta':
        args.ctaPath = next;
        index += 1;
        break;
      case '--first-logs':
        args.firstLogsPath = next;
        index += 1;
        break;
      case '--exports':
        args.exportsPath = next;
        index += 1;
        break;
      case '--board':
        args.boardPath = next;
        index += 1;
        break;
      case '--write':
        args.write = true;
        break;
      case '--help':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/seo/generate-resource-command-board.mjs --search-console <file> [options]

Options:
  --search-console <file>  Search Console export in CSV or JSON form
  --cta <file>             CTA rollup keyed by resource slug/page
  --first-logs <file>      First-log rollup keyed by resource slug/page
  --exports <file>         Export rollup keyed by resource slug/page
  --board <file>           Command board markdown path (default: ${DEFAULT_BOARD_PATH})
  --write                  Write the updated board back to disk
  --help                   Show this help
`);
}

export function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return 0;
  }

  if (!args.searchConsolePath) {
    throw new Error('Missing required argument: --search-console <file>');
  }

  const boardPath = path.resolve(process.cwd(), args.boardPath);
  const boardContent = readFileSync(boardPath, 'utf8');
  const metrics = collectBoardMetrics({
    searchConsolePath: path.resolve(process.cwd(), args.searchConsolePath),
    ctaPath: args.ctaPath ? path.resolve(process.cwd(), args.ctaPath) : undefined,
    firstLogsPath: args.firstLogsPath ? path.resolve(process.cwd(), args.firstLogsPath) : undefined,
    exportsPath: args.exportsPath ? path.resolve(process.cwd(), args.exportsPath) : undefined,
  });
  const nextBoard = applyMetricsToBoard(boardContent, metrics);

  if (args.write) {
    writeFileSync(boardPath, `${nextBoard.trimEnd()}\n`, 'utf8');
    console.log(`Updated ${path.relative(process.cwd(), boardPath)}`);
    return 0;
  }

  process.stdout.write(`${nextBoard.trimEnd()}\n`);
  return 0;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

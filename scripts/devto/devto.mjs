import fs from 'node:fs/promises';
import path from 'node:path';

const ACCEPT = 'application/vnd.forem.api-v1+json, application/json';
const DEVTO_API_BASE = process.env.DEVTO_API_BASE ?? 'https://dev.to/api';
const DEVTO_API_KEY = process.env.DEVTO_API_KEY;

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const PUBLISHED_RETROFIT_PATH = path.join(ROOT, 'scripts', 'devto', 'published-retrofit.json');

function parseArgs(argv) {
  const args = { _: [] };
  for (const token of argv) {
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [k, v] = token.slice(2).split('=');
    args[k] = v ?? true;
  }
  return args;
}

function ensureStringArrayTags(tags) {
  if (!tags) return '';
  if (typeof tags === 'string') return tags;
  if (Array.isArray(tags)) return tags.join(', ');
  return '';
}

function buildCtas({ sponsorUrl, repoUrl, seriesStartUrl }) {
  const top = [
    '<!-- pain-tracker:cta-top -->',
    `> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → ${sponsorUrl}`,
    '',
  ].join('\n');

  const seriesLine = seriesStartUrl
    ? `- Read the full series from the start: ${seriesStartUrl}`
    : '- Read the full series from the start: (link)';

  const bottom = [
    '',
    '<!-- pain-tracker:cta-bottom -->',
    '---',
    '## Support this work',
    '',
    `- Sponsor the project (primary): ${sponsorUrl}`,
    `- Star the repo (secondary): ${repoUrl}`,
    seriesLine,
    '',
  ].join('\n');

  const pinnedComment = [
    'TL;DR',
    '- (bullet 1)',
    '- (bullet 2)',
    '- (bullet 3)',
    '',
    'Why this matters',
    '- (one line)',
    '',
    `Sponsor the build → ${sponsorUrl}`,
  ].join('\n');

  return { top, bottom, pinnedComment };
}

function injectCtasIntoMarkdown(md, { ctaTop, ctaBottom }) {
  const alreadyHasTop = md.includes('<!-- pain-tracker:cta-top -->');
  const alreadyHasBottom = md.includes('<!-- pain-tracker:cta-bottom -->');

  let out = md;

  if (!alreadyHasTop) {
    // Insert after the first 2-3 paragraphs. We approximate by splitting on blank lines.
    const parts = out.split(/\r?\n\r?\n/);
    const insertAfter = Math.min(3, Math.max(2, parts.length));
    parts.splice(insertAfter, 0, ctaTop.trimEnd());
    out = parts.join('\n\n');
  }

  if (!alreadyHasBottom) {
    out = out.replace(/\s*$/, '');
    out += ctaBottom;
  }

  return out;
}

function upsertFrontMatter(md, updates) {
  const normalized = String(md ?? '');
  const startsWithFrontMatter = normalized.startsWith('---\n') || normalized.startsWith('---\r\n');

  const eol = normalized.includes('\r\n') ? '\r\n' : '\n';

  if (!startsWithFrontMatter) {
    const lines = ['---'];
    for (const [k, v] of Object.entries(updates)) {
      lines.push(`${k}: ${v}`);
    }
    lines.push('---', '');
    return lines.join(eol) + normalized;
  }

  const endMarker = `${eol}---${eol}`;
  const start = `---${eol}`;
  const endIdx = normalized.indexOf(endMarker, start.length);
  if (endIdx === -1) {
    // Malformed front matter; fall back to prepend a new block.
    const lines = ['---'];
    for (const [k, v] of Object.entries(updates)) {
      lines.push(`${k}: ${v}`);
    }
    lines.push('---', '');
    return lines.join(eol) + normalized;
  }

  const fmRaw = normalized.slice(start.length, endIdx);
  const rest = normalized.slice(endIdx + endMarker.length);
  const fmLines = fmRaw.split(eol);

  const seen = new Set();
  const outLines = fmLines.map((line) => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) return line;
    const key = m[1];
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      seen.add(key);
      return `${key}: ${updates[key]}`;
    }
    return line;
  });

  for (const [k, v] of Object.entries(updates)) {
    if (!seen.has(k)) outLines.push(`${k}: ${v}`);
  }

  return `---${eol}${outLines.join(eol)}${endMarker}${rest}`;
}

function upsertScheduleInBodyMarkdown(md, desiredIso) {
  // DEV commonly stores scheduling in front matter; we set both keys for compatibility.
  const updates = {
    published: 'true',
    published_at: desiredIso,
    date: desiredIso,
  };
  return upsertFrontMatter(md, updates);
}

function upsertTitleInBodyMarkdown(md, desiredTitle) {
  const updates = {
    title: desiredTitle,
  };
  return upsertFrontMatter(md, updates);
}

function upsertSeriesInBodyMarkdown(md, desiredSeries) {
  const updates = {
    series: desiredSeries,
  };
  return upsertFrontMatter(md, updates);
}

function stripSectionByMarkers(md, startMarker, endMarker) {
  const s = String(md ?? '');
  const startIdx = s.indexOf(startMarker);
  if (startIdx === -1) return s;
  const endIdx = s.indexOf(endMarker, startIdx);
  if (endIdx === -1) return s;
  return s.slice(0, startIdx) + s.slice(endIdx + endMarker.length);
}

function readFrontMatter(md) {
  const normalized = String(md ?? '');
  const eol = normalized.includes('\r\n') ? '\r\n' : '\n';
  const startsWithFrontMatter = normalized.startsWith(`---${eol}`);
  if (!startsWithFrontMatter) return null;

  const endMarker = `${eol}---${eol}`;
  const start = `---${eol}`;
  const endIdx = normalized.indexOf(endMarker, start.length);
  if (endIdx === -1) return null;

  const fmRaw = normalized.slice(start.length, endIdx);
  const fmLines = fmRaw.split(eol);
  const out = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
  }
  return out;
}

function hasAllMarkers(md, markers) {
  const s = String(md ?? '');
  return markers.every((m) => s.includes(m));
}

function buildConversionBlock({ hook, startHereUrl, sponsorUrl, tryUrl, trustBullets }) {
  const safeHook = String(hook ?? '').trim();
  const safeStart = String(startHereUrl ?? '').trim();
  const safeSponsor = String(sponsorUrl ?? '').trim();
  const safeTry = String(tryUrl ?? '').trim();
  const bullets = Array.isArray(trustBullets) ? trustBullets.map((b) => String(b ?? '').trim()).filter(Boolean) : [];

  // Note: the two trailing spaces are intentional (DEV hard line breaks).
  const startLine = safeStart ? `**Start here →** ${safeStart}  ` : '**Start here →** (link)  ';
  const sponsorLine = `**Sponsor →** ${safeSponsor}  `;
  const tryLine = safeTry ? `**Live demo →** ${safeTry}  ` : '**Live demo →** (link)  ';

  const lines = [
    '<!-- pain-tracker:conversion-block:start -->',
    '<!-- pain-tracker:conversion-block:v5 -->',
    '',
    safeHook,
    '',
    startLine,
    sponsorLine,
    tryLine,
    '',
    '**Trust micro-proof**',
    ...bullets.slice(0, 3).map((b) => `- ${b}`),
    '',
    '<!-- pain-tracker:conversion-block:end -->',
    '',
  ];

  return lines.join('\n');
}

function extractMarkedSection(md, startMarker, endMarker) {
  const s = String(md ?? '');
  const startIdx = s.indexOf(startMarker);
  if (startIdx === -1) return null;
  const endIdx = s.indexOf(endMarker, startIdx);
  if (endIdx === -1) return null;
  return s.slice(startIdx, endIdx + endMarker.length);
}

function stripLegacyBuildLogLineAfterConversionBlock(md) {
  const s = String(md ?? '');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  const lines = s.split(/\r?\n/);

  const endMarker = '<!-- pain-tracker:conversion-block:end -->';
  const endLineIdx = lines.findIndex((l) => l.includes(endMarker));
  if (endLineIdx === -1) return s;

  const legacyRe = /^\s*(?:[-*]\s*)?crisiscore\s+build\s+log\s*[-—–].*live\s+demo.*$/i;
  const scanLimit = Math.min(lines.length, endLineIdx + 1 + 12);

  for (let i = endLineIdx + 1; i < scanLimit; i += 1) {
    if (legacyRe.test(lines[i])) {
      lines.splice(i, 1);
      break;
    }
  }

  return lines.join(eol);
}

function stripBuildLogNoiseLines(md) {
  const s = String(md ?? '');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  const lines = s.split(/\r?\n/);

  // Remove any line that contains the Build Log promo, even if quoted/bolded.
  const BUILD_LOG_NOISE_RE = /^\s*(?:[-*]\s*)?(?:>\s*)?(?:[*_]{1,2})?crisiscore\s+build\s+log\b/i;
  return lines.filter((line) => !BUILD_LOG_NOISE_RE.test(line)).join(eol);
}

// --- Smart Next up (series-aware) ---
const NEXT_UP_VERSION = 1;
const NEXT_UP_BLOCK_RE = /<!--\s*pain-tracker:next-up:v\d+\s*-->[\s\S]*?<!--\s*\/pain-tracker:next-up\s*-->/i;
const NEXT_UP_LEGACY_RE = /\nNext:\s*Start\s+here\s*→\s*\S+[^\n]*\n?/i;

function normalizeUrl(u = '') {
  return String(u)
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/g, '')
    .toLowerCase();
}

function coercePublishedMs(a) {
  const raw = a?.published_timestamp ?? a?.published_at ?? a?.created_at ?? 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function getCollectionOrderedArticles({ allPublished, collectionId }) {
  if (!collectionId) return [];
  const items = allPublished.filter((a) => String(a?.collection_id ?? '') === String(collectionId));
  return [...items].sort((a, b) => coercePublishedMs(a) - coercePublishedMs(b));
}

function buildNextUpBlock({ article, startHereUrl, sponsorUrl, orderedCollection }) {
  if (!article) return null;

  const safeStartHere = String(startHereUrl ?? '').trim();
  const safeSponsor = String(sponsorUrl ?? '').trim();
  if (!safeStartHere || !safeSponsor) return null;

  const isStartHere = normalizeUrl(article?.url ?? '') === normalizeUrl(safeStartHere);

  const list = Array.isArray(orderedCollection) ? orderedCollection : [];
  const idx = list.findIndex((a) => String(a?.id ?? '') === String(article?.id ?? ''));
  const next = idx >= 0 ? list[idx + 1] : null;
  const first = list[0] ?? null;

  const lines = [];
  lines.push('---');
  lines.push('');

  if (isStartHere) {
    // Avoid “Start here → Start here”
    if (first && String(first?.id ?? '') !== String(article?.id ?? '')) {
      lines.push(`**Start at Part 1 →** ${first.url}  `);
    } else {
      return null;
    }
  } else if (next && next?.url) {
    lines.push(`**Next up →** ${next.url}  `);
    lines.push(`**Start here →** ${safeStartHere}  `);
  } else {
    // Last post in series (or no series): still show Start here funnel
    lines.push(`**Start here →** ${safeStartHere}  `);
  }

  lines.push(`**Sponsor →** ${safeSponsor}`);

  return `<!-- pain-tracker:next-up:v${NEXT_UP_VERSION} -->\n${lines.join('\n')}\n<!-- /pain-tracker:next-up -->`;
}

function upsertNextUpBlock(body, blockOrNull) {
  let out = String(body ?? '');

  // Remove our older footer block to prevent duplication.
  out = stripSectionByMarkers(out, '<!-- pain-tracker:bottom-next:start -->', '<!-- pain-tracker:bottom-next:end -->');

  if (!blockOrNull) {
    return out.replace(NEXT_UP_BLOCK_RE, '').replace(NEXT_UP_LEGACY_RE, '\n');
  }

  if (NEXT_UP_BLOCK_RE.test(out)) {
    return out.replace(NEXT_UP_BLOCK_RE, `\n\n${blockOrNull}\n\n`);
  }
  if (NEXT_UP_LEGACY_RE.test(out)) {
    return out.replace(NEXT_UP_LEGACY_RE, `\n\n${blockOrNull}\n\n`);
  }

  return `${out.trimEnd()}\n\n${blockOrNull}\n`;
}

function removeReadingOrderSection(md) {
  let s = String(md ?? '');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';

  // Remove our previous collapsed block, if present.
  s = stripSectionByMarkers(s, '<!-- pain-tracker:reading-order:start -->', '<!-- pain-tracker:reading-order:end -->');

  const lines = s.split(/\r?\n/);

  // Remove a raw <details> reading order block (Option B legacy).
  const detailsSummaryRe = /^\s*<summary><strong>\s*reading\s+order\s*<\/strong><\/summary>\s*$/i;
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*<details>\s*$/i.test(lines[i])) continue;
    if (i + 1 >= lines.length) continue;
    if (!detailsSummaryRe.test(lines[i + 1])) continue;

    let j = i + 2;
    while (j < lines.length && !/^\s*<\/details>\s*$/i.test(lines[j])) j += 1;
    if (j < lines.length) {
      lines.splice(i, j - i + 1);
      s = lines.join(eol);
      break;
    }
  }

  const lines2 = s.split(/\r?\n/);
  const headingRe = /^(#{2,4})\s+.*reading\s+order.*$/i;
  const altRe = /^\*\*.*reading\s+order.*\*\*\s*$/i;

  let startLine = -1;
  for (let i = 0; i < lines2.length; i += 1) {
    const line = lines2[i];
    if (headingRe.test(line) || altRe.test(line)) {
      startLine = i;
      break;
    }
  }
  if (startLine === -1) return { md: s, changed: false };

  let endLine = lines2.length;
  for (let i = startLine + 1; i < lines2.length; i += 1) {
    const line = lines2[i];
    if (/^#{1,6}\s+/.test(line)) {
      endLine = i;
      break;
    }
    if (line.includes('<!-- pain-tracker:cta-bottom -->') || line.includes('<!-- pain-tracker:bottom-next:start -->')) {
      endLine = i;
      break;
    }
  }

  // Remove the section, then trim excessive blank lines around the cut.
  const before = lines2.slice(0, startLine).join(eol).replace(/\s*$/, '');
  const after = lines2.slice(endLine).join(eol).replace(/^\s*/, '');
  const out = [before, after].filter(Boolean).join(eol + eol);

  return { md: out, changed: true };
}

function upsertConversionBlock(md, { hook, startHereUrl, sponsorUrl, tryUrl, trustBullets }) {
  let out = String(md ?? '');

  // Remove any previous version of our injected block.
  out = stripSectionByMarkers(
    out,
    '<!-- pain-tracker:conversion-block:start -->',
    '<!-- pain-tracker:conversion-block:end -->',
  );

  const block = buildConversionBlock({ hook, startHereUrl, sponsorUrl, tryUrl, trustBullets });

  // Insert immediately after front matter if present, else at top.
  const eol = out.includes('\r\n') ? '\r\n' : '\n';
  const fmEnd = `${eol}---${eol}`;
  const hasFrontMatter = out.startsWith(`---${eol}`) && out.indexOf(fmEnd, `---${eol}`.length) !== -1;

  if (hasFrontMatter) {
    const endIdx = out.indexOf(fmEnd, `---${eol}`.length);
    const after = endIdx + fmEnd.length;
    out = out.slice(0, after) + block.split('\n').join(eol) + out.slice(after);
    return stripLegacyBuildLogLineAfterConversionBlock(out);
  }

  return stripLegacyBuildLogLineAfterConversionBlock(block.split('\n').join(eol) + out);
}

function toNormalizedMap(obj) {
  const out = new Map();
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const nk = normalizeTitle(k);
    if (!nk) continue;
    out.set(nk, v);
  }
  return out;
}

function injectSeriesChainIntoMarkdown(md, { seriesName, partLabel, startHereUrl, nextUpUrl }) {
  let out = String(md ?? '');

  // Remove any previous version of our injected block.
  out = stripSectionByMarkers(out, '<!-- pain-tracker:series-chain:start -->', '<!-- pain-tracker:series-chain:end -->');

  const headerLine = startHereUrl
    ? `> ${partLabel} of **${seriesName}** — Start here: ${startHereUrl}`
    : `> ${partLabel} of **${seriesName}**`;

  const footerLine = nextUpUrl ? `**Next up:** ${nextUpUrl}` : null;

  const blockLines = [
    '<!-- pain-tracker:series-chain:start -->',
    headerLine,
    '<!-- pain-tracker:series-chain:end -->',
    '',
  ];

  // Insert immediately after front matter if present, else at top.
  const eol = out.includes('\r\n') ? '\r\n' : '\n';
  const fmEnd = `${eol}---${eol}`;
  const hasFrontMatter = out.startsWith(`---${eol}`) && out.indexOf(fmEnd, `---${eol}`.length) !== -1;

  if (hasFrontMatter) {
    const endIdx = out.indexOf(fmEnd, `---${eol}`.length);
    const after = endIdx + fmEnd.length;
    out = out.slice(0, after) + blockLines.join(eol) + out.slice(after);
  } else {
    out = blockLines.join(eol) + out;
  }

  if (footerLine) {
    // Append at end (but before our CTA bottom if present, so the CTA stays last).
    const bottomMarker = '<!-- pain-tracker:cta-bottom -->';
    const idx = out.indexOf(bottomMarker);
    const insertion = `${eol}${footerLine}${eol}`;
    if (idx !== -1) {
      out = out.slice(0, idx) + insertion + out.slice(idx);
    } else {
      out = out.replace(/\s*$/, '') + insertion;
    }
  }

  return out;
}

async function loadSchedule() {
  const raw = await fs.readFile(SCHEDULE_PATH, 'utf8');
  return JSON.parse(raw);
}

async function loadPublishedRetrofitConfig() {
  const raw = await fs.readFile(PUBLISHED_RETROFIT_PATH, 'utf8');
  return JSON.parse(raw);
}

async function saveSchedule(schedule) {
  await fs.writeFile(SCHEDULE_PATH, JSON.stringify(schedule, null, 2) + '\n', 'utf8');
}

async function readSourceMarkdown(sourceFile) {
  const abs = path.isAbsolute(sourceFile) ? sourceFile : path.join(ROOT, sourceFile);
  const md = await fs.readFile(abs, 'utf8');
  return { abs, md };
}

function requireApiKey() {
  if (!DEVTO_API_KEY) {
    throw new Error('Missing DEVTO_API_KEY env var.');
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  // Retry-After can be seconds or an HTTP date. We handle seconds.
  const seconds = Number(s);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  return null;
}

async function devtoRequest(method, apiPath, body) {
  requireApiKey();

  const url = `${DEVTO_API_BASE}${apiPath}`;

  const maxAttempts = Number(process.env.DEVTO_MAX_RETRIES ?? 6);
  const baseDelayMs = Number(process.env.DEVTO_RETRY_BASE_MS ?? 1000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await fetch(url, {
      method,
      headers: {
        accept: ACCEPT,
        'api-key': DEVTO_API_KEY,
        'content-type': 'application/json',
        'user-agent': 'pain-tracker-devto-script',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }

    if (res.ok) return json;

    const retryable = res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504;
    const lastAttempt = attempt === maxAttempts;

    if (!retryable || lastAttempt) {
      const err = new Error(`DEV.to API ${method} ${apiPath} failed: ${res.status} ${res.statusText}`);
      err.details = json;
      throw err;
    }

    const retryAfterHeader = res.headers.get('retry-after');
    const retryAfterMs = parseRetryAfterMs(retryAfterHeader);
    const backoffMs = Math.min(30_000, baseDelayMs * 2 ** (attempt - 1));
    const jitterMs = Math.floor(Math.random() * 250);
    const delayMs = (retryAfterMs ?? backoffMs) + jitterMs;

    console.warn(
      `DEV.to rate-limited/transient error (${res.status}). Retrying in ${delayMs}ms (attempt ${attempt}/${maxAttempts}) for ${method} ${apiPath}`,
    );

    await sleep(delayMs);
  }

  // Unreachable, but keeps static analysis happy.
  throw new Error(`DEV.to API ${method} ${apiPath} failed after retries.`);
}

async function getMe() {
  return devtoRequest('GET', '/users/me');
}

function normalizeTitle(title) {
  return String(title ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeFunnelKey(title) {
  return String(title ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

async function getUserAllArticles({ page = 1, per_page = 100 } = {}) {
  const query = new URLSearchParams({ page: String(page), per_page: String(per_page) });
  return devtoRequest('GET', `/articles/me/all?${query.toString()}`);
}

async function listAllUserArticles() {
  const per_page = 100;
  const all = [];

  for (let page = 1; page <= 20; page += 1) {
    const items = await getUserAllArticles({ page, per_page });
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items);
    if (items.length < per_page) break;
  }

  return all;
}

function pickBestTitleMatch(matches, desiredIso, now = new Date()) {
  if (!Array.isArray(matches) || matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  // Prefer the one already scheduled for the future.
  const scheduled = matches.filter((a) => isScheduledForFuture(a, now));
  if (scheduled.length === 1) return scheduled[0];

  // Prefer the one whose current timestamp is closest to desired.
  const desiredMs = Date.parse(desiredIso);
  if (!Number.isNaN(desiredMs)) {
    const withTs = matches
      .map((a) => {
        const ts = a?.published_at ?? a?.published_timestamp ?? null;
        const ms = ts ? Date.parse(ts) : Number.NaN;
        return { a, ms };
      })
      .filter((x) => !Number.isNaN(x.ms));

    if (withTs.length > 0) {
      withTs.sort((x, y) => Math.abs(x.ms - desiredMs) - Math.abs(y.ms - desiredMs));
      return withTs[0].a;
    }
  }

  // Prefer most recently created/edited when available.
  const scored = matches
    .map((a) => {
      const t = a?.edited_at ?? a?.created_at ?? null;
      const ms = t ? Date.parse(t) : Number.NaN;
      return { a, ms };
    })
    .filter((x) => !Number.isNaN(x.ms));

  if (scored.length > 0) {
    scored.sort((x, y) => y.ms - x.ms);
    return scored[0].a;
  }

  return matches[0];
}

function isDueNow(publishAt, now = new Date()) {
  const t = Date.parse(publishAt);
  if (Number.isNaN(t)) return false;
  return t <= now.getTime();
}

function isPublishedInPast(article, now = new Date()) {
  const ts = article?.published_at ?? article?.published_timestamp;
  if (!ts) return Boolean(article?.published);
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return Boolean(article?.published);
  return t <= now.getTime();
}

function isScheduledForFuture(article, now = new Date()) {
  const ts = article?.published_at ?? article?.published_timestamp;
  if (!ts) return false;
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return false;
  return t > now.getTime();
}

function timestampsEqual(a, b) {
  const ams = Date.parse(a);
  const bms = Date.parse(b);
  if (!Number.isNaN(ams) && !Number.isNaN(bms)) return ams === bms;
  return String(a ?? '') === String(b ?? '');
}

async function writePinnedCommentsFile(items) {
  const outPath = path.join(ROOT, 'scripts', 'devto', 'pinned-comments.md');

  const chunks = [
    '# DEV pinned comments (copy/paste)',
    '',
    '> Note: Forem API v1 does not expose endpoints to create/pin comments. This file is generated to make manual pinning fast.',
    '',
  ];

  for (const item of items) {
    chunks.push(`## ${item.title}`);
    chunks.push('');
    chunks.push('```md');
    chunks.push(item.pinnedComment);
    chunks.push('```');
    chunks.push('');
  }

  await fs.writeFile(outPath, chunks.join('\n'), 'utf8');
}

async function cmdDryRun(schedule) {
  const now = new Date();
  console.log(`Now: ${now.toISOString()}`);
  console.log(`Schedule: ${SCHEDULE_PATH}`);
  console.log('');

  for (const post of schedule.posts) {
    const due = isDueNow(post.publishAt, now);
    const status = post.enabled ? (due ? 'DUE' : 'pending') : 'disabled';
    console.log(`- ${post.publishAt} | ${status} | ${post.title} (${post.sourceFile})`);
  }

  console.log('');
  console.log('Notes:');
  console.log('- Forem API docs do not clearly document rescheduling, but some instances accept `published_at` on update.');
  console.log('- If the API rejects direct rescheduling (422), the script can fall back to setting front matter in `body_markdown`.');
}

async function cmdCreateDrafts(schedule, { write }) {
  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? schedule.defaults?.sponsor_url;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url;
  const seriesStartUrl = process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url;
  const series = process.env.DEVTO_SERIES ?? schedule.defaults?.series;
  const organizationIdRaw = process.env.DEVTO_ORGANIZATION_ID ?? schedule.defaults?.organization_id;
  const organization_id = organizationIdRaw ? Number(organizationIdRaw) : undefined;

  if (!sponsorUrl || !repoUrl) {
    throw new Error('Missing sponsor/repo URL. Set DEVTO_SPONSOR_URL and DEVTO_REPO_URL (or schedule.defaults).');
  }

  const pinned = [];
  let created = 0;
  let linked = 0;

  // Use /articles/me/all so we can link already-scheduled posts (they may not appear under /me/unpublished).
  const existingAll = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!post.enabled) continue;
    if (post.articleId) continue;

    const wanted = normalizeTitle(post.title);
    const existing = existingAll.find((a) => normalizeTitle(a?.title) === wanted);
    if (existing?.id) {
      post.articleId = existing.id;
      post.devtoUrl = existing.url ?? null;
      linked += 1;
      console.log(`Linked existing draft: ${post.title}`);
      console.log(`  id: ${post.articleId}`);
      console.log(`  url: ${post.devtoUrl}`);
      continue;
    }

    const { md } = await readSourceMarkdown(post.sourceFile);
    const { top, bottom, pinnedComment } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });

    const body_markdown = injectCtasIntoMarkdown(md, { ctaTop: top, ctaBottom: bottom });

    const payload = {
      article: {
        title: post.title,
        body_markdown,
        published: false,
        series: series ?? null,
        main_image: null,
        canonical_url: post.canonical_url ?? null,
        description: post.description ?? undefined,
        tags: ensureStringArrayTags(post.tags),
        organization_id: organization_id ?? null,
      },
    };

    const createdArticle = await devtoRequest('POST', '/articles', payload);

    post.articleId = createdArticle.id ?? null;
    post.devtoUrl = createdArticle.url ?? null;

    created += 1;
    pinned.push({ title: post.title, pinnedComment });

    console.log(`Created draft: ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  url: ${post.devtoUrl}`);
  }

  if (created > 0) {
    await writePinnedCommentsFile(pinned);

    if (write) {
      await saveSchedule(schedule);
      console.log('');
      console.log('Wrote updated article IDs back into schedule.json');
    } else {
      console.log('');
      console.log('Drafts created, but schedule.json not modified (run with --write to persist IDs).');
    }
  } else if (linked > 0) {
    if (write) {
      await saveSchedule(schedule);
      console.log('');
      console.log('Wrote linked article IDs back into schedule.json');
    } else {
      console.log('');
      console.log('Linked drafts, but schedule.json not modified (run with --write to persist IDs).');
    }
  } else {
    console.log('No drafts to create or link.');
  }
}

async function cmdPublishDue(schedule, { yes, write }) {
  if (!yes) {
    throw new Error('Refusing to publish without --yes');
  }

  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? schedule.defaults?.sponsor_url;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url;
  const seriesStartUrl = process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url;
  const series = process.env.DEVTO_SERIES ?? schedule.defaults?.series;
  const organizationIdRaw = process.env.DEVTO_ORGANIZATION_ID ?? schedule.defaults?.organization_id;
  const organization_id = organizationIdRaw ? Number(organizationIdRaw) : undefined;

  if (!sponsorUrl || !repoUrl) {
    throw new Error('Missing sponsor/repo URL. Set DEVTO_SPONSOR_URL and DEVTO_REPO_URL (or schedule.defaults).');
  }

  const now = new Date();
  let publishedCount = 0;

  // Use /articles/me/all to avoid duplicating already-scheduled posts.
  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!post.enabled) continue;
    if (!isDueNow(post.publishAt, now)) continue;

    // Ensure we have an article ID (link existing draft by title, else create a draft).
    if (!post.articleId) {
      const wanted = normalizeTitle(post.title);
      const existing = allCache.find((a) => normalizeTitle(a?.title) === wanted);
      if (existing?.id) {
        post.articleId = existing.id;
        post.devtoUrl = existing.url ?? null;
      } else {
        const { md } = await readSourceMarkdown(post.sourceFile);
        const { top, bottom } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });

        const body_markdown = injectCtasIntoMarkdown(md, { ctaTop: top, ctaBottom: bottom });

        const createPayload = {
          article: {
            title: post.title,
            body_markdown,
            published: false,
            series: series ?? null,
            main_image: null,
            canonical_url: post.canonical_url ?? null,
            description: post.description ?? undefined,
            tags: ensureStringArrayTags(post.tags),
            organization_id: organization_id ?? null,
          },
        };

        const created = await devtoRequest('POST', '/articles', createPayload);
        post.articleId = created.id ?? null;
        post.devtoUrl = created.url ?? null;
      }
    }

    if (!post.articleId) {
      console.log(`Skip (no article id): ${post.title}`);
      continue;
    }

    // If already published on DEV, skip (automation-safe even without persisting local state).
    // NOTE: GET /articles/{id} only works for published articles; rely on /articles/me/all.
    const current = allCache.find((a) => a?.id === post.articleId) ?? null;
    if (current && isPublishedInPast(current, now)) {
      console.log(`Skip (already published): ${post.title}`);
      continue;
    }

    if (current && isScheduledForFuture(current, now)) {
      console.log(`Skip (already scheduled): ${post.title}`);
      continue;
    }

    const { md } = await readSourceMarkdown(post.sourceFile);
    const { top, bottom } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });

    const body_markdown = injectCtasIntoMarkdown(md, { ctaTop: top, ctaBottom: bottom });

    const payload = {
      article: {
        title: post.title,
        body_markdown,
        published: true,
        series: series ?? null,
        main_image: null,
        canonical_url: post.canonical_url ?? null,
        description: post.description ?? undefined,
        tags: ensureStringArrayTags(post.tags),
        organization_id: organization_id ?? null,
      },
    };

    const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);

    post.devtoUrl = updated.url ?? post.devtoUrl;

    publishedCount += 1;

    console.log(`Published: ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  url: ${post.devtoUrl}`);
  }

  if (publishedCount === 0) {
    console.log('No posts were due to publish.');
    return;
  }

  if (write) {
    await saveSchedule(schedule);
    console.log('');
    console.log('Wrote published flags back into schedule.json');
  } else {
    console.log('');
    console.log('Published posts, but schedule.json not modified (run with --write to persist flags).');
  }
}

async function cmdSyncSchedule(schedule, { yes, write, allowPast }) {
  const now = new Date();
  let changed = 0;
  let linked = 0;
  let skipped = 0;

  // Pull once so title matching works even if schedule.json is missing IDs.
  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!post.enabled) continue;

    const desired = post.publishAt;
    const desiredMs = Date.parse(desired);
    if (Number.isNaN(desiredMs)) {
      console.log(`Skip (invalid publishAt): ${post.title}`);
      skipped += 1;
      continue;
    }

    if (!allowPast && desiredMs <= now.getTime()) {
      console.log(`Skip (publishAt is in the past): ${post.title}`);
      skipped += 1;
      continue;
    }

    // Resolve the target article from /articles/me/all.
    // Avoid GET /articles/{id} because Forem docs say it only returns *published* articles.
    let current = null;

    if (post.articleId) {
      current = allCache.find((a) => a?.id === post.articleId) ?? null;
    }

    if (!current) {
      const wanted = normalizeTitle(post.title);
      const matches = allCache.filter((a) => normalizeTitle(a?.title) === wanted);
      const best = pickBestTitleMatch(matches, desired, now);

      if (best?.id) {
        if (post.articleId && post.articleId !== best.id) {
          console.log(`Re-linked stale articleId for: ${post.title}`);
          console.log(`  from: ${post.articleId}`);
          console.log(`  to:   ${best.id}`);
        }
        post.articleId = best.id;
        post.devtoUrl = best.url ?? post.devtoUrl ?? null;
        current = best;
        linked += 1;
      }
    }

    if (!current || !post.articleId) {
      console.log(`Skip (not found via /articles/me/all): ${post.title}`);
      skipped += 1;
      continue;
    }

    // Don't reschedule already-published posts.
    if (isPublishedInPast(current, now) && !isScheduledForFuture(current, now)) {
      console.log(`Skip (already published): ${post.title}`);
      skipped += 1;
      continue;
    }

    const currentTs = current?.published_at ?? current?.published_timestamp ?? null;
    const needsChange = !currentTs || !timestampsEqual(currentTs, desired);

    if (!needsChange) {
      console.log(`OK (already scheduled): ${post.title}`);
      continue;
    }

    if (!yes) {
      console.log(`DRY RUN: reschedule ${post.title}`);
      console.log(`  from: ${currentTs ?? '(none)'}`);
      console.log(`  to:   ${desired}`);
      console.log(`  id:   ${post.articleId}`);
      continue;
    }

    // Try direct published_at first (some Forem instances accept it).
    try {
      const payload = {
        article: {
          published: true,
          published_at: desired,
        },
      };

      const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
      post.devtoUrl = updated?.url ?? post.devtoUrl;
      changed += 1;
      console.log(`Rescheduled: ${post.title}`);
      console.log(`  id: ${post.articleId}`);
      console.log(`  to: ${desired}`);
      continue;
    } catch (err) {
      const msg = String(err?.message ?? '');
      if (!msg.includes('422')) throw err;
    }

    // Fallback: patch scheduling into the article's front matter in body_markdown.
    if (!current?.body_markdown) {
      throw new Error(
        `Cannot reschedule ${post.title}: /articles/me/all did not include body_markdown (needed for front-matter fallback). ` +
          'Try again without front matter fallback (or share the DEV response so we can adjust).',
      );
    }

    const body_markdown = upsertScheduleInBodyMarkdown(current.body_markdown, desired);

    const fallbackPayload = {
      article: {
        published: true,
        body_markdown,
      },
    };

    const updated2 = await devtoRequest('PUT', `/articles/${post.articleId}`, fallbackPayload);
    post.devtoUrl = updated2?.url ?? post.devtoUrl;
    changed += 1;
    console.log(`Rescheduled (front matter): ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  to: ${desired}`);
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Rescheduled: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdSyncTitles(schedule, { yes, write, allowPublished }) {
  const now = new Date();
  let changed = 0;
  let linked = 0;
  let skipped = 0;

  // Reads must use /articles/me/all because GET /articles/{id} only returns published.
  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!post.enabled) continue;

    if (!allowPublished) {
      // If the scheduled timestamp is in the past, treat it as published/locked.
      const desiredMs = Date.parse(post.publishAt);
      if (!Number.isNaN(desiredMs) && desiredMs <= now.getTime()) {
        console.log(`Skip (publishAt is in the past): ${post.title}`);
        skipped += 1;
        continue;
      }
    }

    const desiredTitleRaw = String(post.title ?? '').trim();
    if (!desiredTitleRaw) {
      console.log('Skip (missing title):', post.key);
      skipped += 1;
      continue;
    }

    let current = null;
    if (post.articleId) {
      current = allCache.find((a) => a?.id === post.articleId) ?? null;
    }

    if (!current) {
      const wanted = normalizeTitle(post.title);
      const matches = allCache.filter((a) => normalizeTitle(a?.title) === wanted);
      const best = pickBestTitleMatch(matches, post.publishAt, now);
      if (best?.id) {
        post.articleId = best.id;
        post.devtoUrl = best.url ?? post.devtoUrl ?? null;
        current = best;
        linked += 1;
      }
    }

    if (!current || !post.articleId) {
      console.log(`Skip (not found via /articles/me/all): ${post.title}`);
      skipped += 1;
      continue;
    }

    // Avoid renaming already-published posts unless explicitly allowed.
    if (!allowPublished && isPublishedInPast(current, now) && !isScheduledForFuture(current, now)) {
      console.log(`Skip (already published): ${desiredTitleRaw}`);
      skipped += 1;
      continue;
    }

    const currentTitle = String(current?.title ?? '').trim();
    const needsChange = currentTitle !== desiredTitleRaw;

    if (!needsChange) {
      console.log(`OK (title matches): ${desiredTitleRaw}`);
      continue;
    }

    if (!yes) {
      console.log(`DRY RUN: retitle ${currentTitle || '(untitled)'} → ${desiredTitleRaw}`);
      console.log(`  id:  ${post.articleId}`);
      console.log(`  url: ${current?.url ?? post.devtoUrl ?? '(unknown)'}`);
      continue;
    }

    let body_markdown;
    if (typeof current?.body_markdown === 'string' && current.body_markdown.length > 0) {
      // If a front matter exists, it can override JSON params. Patch it to be safe.
      body_markdown = upsertTitleInBodyMarkdown(current.body_markdown, desiredTitleRaw);
    }

    const payload = {
      article: {
        title: desiredTitleRaw,
        ...(body_markdown ? { body_markdown } : null),
      },
    };

    const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
    post.devtoUrl = updated?.url ?? post.devtoUrl;
    changed += 1;
    console.log(`Retitled: ${desiredTitleRaw}`);
    console.log(`  id: ${post.articleId}`);
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Retitled: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdSyncContent(schedule, { yes, write, allowPublished }) {
  const now = new Date();
  let changed = 0;
  let linked = 0;
  let skipped = 0;

  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? schedule.defaults?.sponsor_url;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url;
  const seriesStartUrlEnv = process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url;
  const seriesName = process.env.DEVTO_SERIES ?? schedule.defaults?.series;
  const organizationIdRaw = process.env.DEVTO_ORGANIZATION_ID ?? schedule.defaults?.organization_id;
  const organization_id = organizationIdRaw ? Number(organizationIdRaw) : undefined;

  if (!sponsorUrl || !repoUrl) {
    throw new Error('Missing sponsor/repo URL. Set DEVTO_SPONSOR_URL and DEVTO_REPO_URL (or schedule.defaults).');
  }
  if (!seriesName) {
    throw new Error('Missing series name. Set DEVTO_SERIES (or schedule.defaults.series).');
  }

  const allCache = await listAllUserArticles();

  // Determine ordering for Part X and Next up links.
  const enabled = schedule.posts
    .filter((p) => p?.enabled)
    .slice()
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));

  const seriesStartUrl =
    seriesStartUrlEnv || (typeof enabled[0]?.devtoUrl === 'string' ? enabled[0].devtoUrl : null) || null;

  for (let i = 0; i < enabled.length; i += 1) {
    const post = enabled[i];

    const desiredTitleRaw = String(post.title ?? '').trim();
    if (!desiredTitleRaw) {
      console.log('Skip (missing title):', post.key);
      skipped += 1;
      continue;
    }

    // Resolve article via /articles/me/all.
    let current = null;
    if (post.articleId) {
      current = allCache.find((a) => a?.id === post.articleId) ?? null;
    }

    if (!current) {
      const wanted = normalizeTitle(post.title);
      const matches = allCache.filter((a) => normalizeTitle(a?.title) === wanted);
      const best = pickBestTitleMatch(matches, post.publishAt, now);
      if (best?.id) {
        post.articleId = best.id;
        post.devtoUrl = best.url ?? post.devtoUrl ?? null;
        current = best;
        linked += 1;
      }
    }

    if (!current || !post.articleId) {
      console.log(`Skip (not found via /articles/me/all): ${post.title}`);
      skipped += 1;
      continue;
    }

    if (!allowPublished && isPublishedInPast(current, now) && !isScheduledForFuture(current, now)) {
      console.log(`Skip (already published): ${desiredTitleRaw}`);
      skipped += 1;
      continue;
    }

    if (typeof current?.body_markdown !== 'string' || current.body_markdown.length === 0) {
      throw new Error(`Cannot sync content for ${desiredTitleRaw}: API did not return body_markdown.`);
    }

    const partLabel = `Part ${i + 1}`;
    const nextUpUrl = enabled[i + 1]?.devtoUrl ?? null;

    const { top, bottom } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });

    let body_markdown = current.body_markdown;
    body_markdown = injectCtasIntoMarkdown(body_markdown, { ctaTop: top, ctaBottom: bottom });
    body_markdown = injectSeriesChainIntoMarkdown(body_markdown, {
      seriesName,
      partLabel,
      startHereUrl: seriesStartUrl,
      nextUpUrl,
    });
    body_markdown = upsertTitleInBodyMarkdown(body_markdown, desiredTitleRaw);
    body_markdown = upsertSeriesInBodyMarkdown(body_markdown, seriesName);

    const desiredSeries = seriesName;
    const currentTitle = String(current?.title ?? '').trim();

    const fm = readFrontMatter(current.body_markdown);
    const fmTitleOk = !fm || String(fm.title ?? '').trim() === desiredTitleRaw;
    const fmSeriesOk = !fm || String(fm.series ?? '').trim() === desiredSeries;

    // If front matter exists, it can override the JSON title. Treat title as OK if front matter is OK.
    const needsTitle = !fmTitleOk && currentTitle !== desiredTitleRaw;

    const ctaMarkersOk = hasAllMarkers(current.body_markdown, [
      '<!-- pain-tracker:cta-top -->',
      '<!-- pain-tracker:cta-bottom -->',
    ]);

    const chainMarkersOk = hasAllMarkers(current.body_markdown, [
      '<!-- pain-tracker:series-chain:start -->',
      '<!-- pain-tracker:series-chain:end -->',
    ]);

    // If we already have the markers + correct front matter keys, treat it as in-sync.
    // (DEV may normalize markdown text on write, so strict string equality is unreliable.)
    const needsBody = !(ctaMarkersOk && chainMarkersOk && fmTitleOk && fmSeriesOk);
    const needsSeries = !fmSeriesOk;

    const needsAny = needsTitle || needsSeries || needsBody;

    if (!needsAny) {
      console.log(`OK (content matches): ${desiredTitleRaw}`);
      continue;
    }

    if (!yes) {
      console.log(`DRY RUN: sync content for ${desiredTitleRaw}`);
      console.log(`  id:  ${post.articleId}`);
      console.log(`  url: ${current?.url ?? post.devtoUrl ?? '(unknown)'}`);
      console.log(`  changes: ${[needsTitle ? 'title' : null, needsSeries ? 'series' : null, needsBody ? 'body' : null].filter(Boolean).join(', ')}`);
      continue;
    }

    const payload = {
      article: {
        title: desiredTitleRaw,
        series: desiredSeries,
        body_markdown,
        organization_id: organization_id ?? null,
      },
    };

    const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
    post.devtoUrl = updated?.url ?? post.devtoUrl;
    changed += 1;
    console.log(`Synced: ${desiredTitleRaw}`);
    console.log(`  id: ${post.articleId}`);
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Synced: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdPushSource(schedule, { yes, write, allowPublished }) {
  const now = new Date();
  let pushed = 0;
  let linked = 0;
  let skipped = 0;

  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? schedule.defaults?.sponsor_url;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url;
  const seriesStartUrl = process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url;
  const seriesName = process.env.DEVTO_SERIES ?? schedule.defaults?.series;
  const organizationIdRaw = process.env.DEVTO_ORGANIZATION_ID ?? schedule.defaults?.organization_id;
  const organization_id = organizationIdRaw ? Number(organizationIdRaw) : undefined;

  if (!sponsorUrl || !repoUrl) {
    throw new Error('Missing sponsor/repo URL. Set DEVTO_SPONSOR_URL and DEVTO_REPO_URL (or schedule.defaults).');
  }

  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!post.enabled) continue;
    if (!post.sourceFile) {
      console.log(`Skip (no sourceFile): ${post.key}`);
      skipped += 1;
      continue;
    }

    // Resolve article via /articles/me/all.
    let current = null;
    if (post.articleId) {
      current = allCache.find((a) => a?.id === post.articleId) ?? null;
    }

    if (!current) {
      const wanted = normalizeTitle(post.title);
      const matches = allCache.filter((a) => normalizeTitle(a?.title) === wanted);
      const best = pickBestTitleMatch(matches, post.publishAt, now);
      if (best?.id) {
        post.articleId = best.id;
        post.devtoUrl = best.url ?? post.devtoUrl ?? null;
        current = best;
        linked += 1;
      }
    }

    if (!current || !post.articleId) {
      console.log(`Skip (no article on DEV — run create-drafts first): ${post.title}`);
      skipped += 1;
      continue;
    }

    if (!allowPublished && isPublishedInPast(current, now) && !isScheduledForFuture(current, now)) {
      console.log(`Skip (already published — use --allow-published to force): ${post.title}`);
      skipped += 1;
      continue;
    }

    // Read the local source markdown file.
    const { md } = await readSourceMarkdown(post.sourceFile);
    const { top, bottom } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });

    let body_markdown = injectCtasIntoMarkdown(md, { ctaTop: top, ctaBottom: bottom });

    if (seriesName) {
      body_markdown = upsertSeriesInBodyMarkdown(body_markdown, seriesName);
    }

    if (!yes) {
      console.log(`DRY RUN: push source for ${post.title}`);
      console.log(`  id:     ${post.articleId}`);
      console.log(`  url:    ${current?.url ?? post.devtoUrl ?? '(unknown)'}`);
      console.log(`  source: ${post.sourceFile}`);
      continue;
    }

    const payload = {
      article: {
        title: post.title,
        body_markdown,
        series: seriesName ?? null,
        canonical_url: post.canonical_url ?? null,
        description: post.description ?? undefined,
        tags: ensureStringArrayTags(post.tags),
        organization_id: organization_id ?? null,
      },
    };

    const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
    post.devtoUrl = updated?.url ?? post.devtoUrl;
    pushed += 1;
    console.log(`Pushed: ${post.title}`);
    console.log(`  id:  ${post.articleId}`);
    console.log(`  url: ${post.devtoUrl}`);
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Pushed: ${pushed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdRetrofitPublished(schedule, { yes }) {
  const now = new Date();

  const retrofit = await loadPublishedRetrofitConfig();

  const sponsorUrl =
    process.env.DEVTO_SPONSOR_URL ?? retrofit?.defaults?.sponsor_url ?? schedule.defaults?.sponsor_url ?? null;

  const tryUrl =
    process.env.DEVTO_TRY_URL ?? retrofit?.defaults?.try_url ?? schedule.defaults?.try_url ?? 'https://paintracker.ca';

  const envStartHere = process.env.DEVTO_START_HERE_URL;
  const envIsPlaceholder = /dev\.to\/yourname\//i.test(String(envStartHere ?? ''));

  const startHereUrl =
    (!envIsPlaceholder ? envStartHere : null) ??
    retrofit?.defaults?.start_here_url ??
    process.env.DEVTO_SERIES_START_URL ??
    schedule.defaults?.series_start_url ??
    null;

  const trustBullets =
    (Array.isArray(retrofit?.defaults?.trust_bullets) ? retrofit.defaults.trust_bullets : null) ?? [
      'Offline-first (works without a connection)',
      'No backend (data stays on-device)',
      'Client-side encryption + open source',
    ];

  const defaultHook =
    String(retrofit?.defaults?.default_hook ?? '').trim() ||
    'For people living with chronic pain (and the devs supporting them): a privacy-first, offline-first pain tracker.';

  const lowViewThresholdRaw = retrofit?.defaults?.low_view_threshold;
  const lowViewThreshold = Number.isFinite(Number(lowViewThresholdRaw)) ? Number(lowViewThresholdRaw) : 25;

  const funnelASeries = String(retrofit?.defaults?.funnelA_series ?? 'Foundations').trim() || 'Foundations';
  const funnelBSeries =
    String(retrofit?.defaults?.funnelB_series ?? schedule.defaults?.series ?? 'CrisisCore Build Log').trim() ||
    'CrisisCore Build Log';

  const foundationsMatchers = (retrofit?.funnels?.foundations_titles ?? [])
    .map((t) => normalizeFunnelKey(t))
    .filter(Boolean);

  const buildlogMatchers = (retrofit?.funnels?.buildlog_titles ?? [])
    .map((t) => normalizeFunnelKey(t))
    .filter(Boolean);

  const matchesAnyFunnel = (articleKey, matchers) =>
    matchers.some((m) => articleKey === m || articleKey.startsWith(m) || articleKey.includes(m));

  const hooksByTitle = toNormalizedMap(retrofit?.overrides?.hooks_by_title);
  const descByTitle = toNormalizedMap(retrofit?.overrides?.description_by_title);
  const coverByTitle = toNormalizedMap(retrofit?.overrides?.cover_image_by_title);

  if (!sponsorUrl) {
    throw new Error('Missing sponsor URL. Set DEVTO_SPONSOR_URL (or retrofit.defaults.sponsor_url).');
  }
  if (yes && !startHereUrl) {
    throw new Error(
      'Missing Start Here URL. Set DEVTO_START_HERE_URL (or scripts/devto/published-retrofit.json defaults.start_here_url).',
    );
  }
  if (yes && /dev\.to\/yourname\//i.test(String(startHereUrl ?? ''))) {
    throw new Error(
      'Refusing to apply with a placeholder Start Here URL. Set DEVTO_START_HERE_URL to the real DEV URL for your Start Here post.',
    );
  }
  if (!startHereUrl) {
    console.warn('Warning: Start Here URL is not set (DEVTO_START_HERE_URL). Dry run will use a placeholder link.');
  }

  const throttleMsRaw = process.env.DEVTO_THROTTLE_MS ?? retrofit?.defaults?.throttle_ms;
  const throttleMs = Number.isFinite(Number(throttleMsRaw)) ? Number(throttleMsRaw) : 1200;

  const all = await listAllUserArticles();
  const published = all.filter((a) => isPublishedInPast(a, now) && !isScheduledForFuture(a, now));
  const publishedFiltered = published.filter((a) => String(a?.url ?? '') !== String(startHereUrl ?? ''));

  const collectionOrderedCache = new Map();
  const getOrderedFor = (collectionId) => {
    if (!collectionId) return [];
    const key = String(collectionId);
    if (collectionOrderedCache.has(key)) return collectionOrderedCache.get(key);
    const ordered = getCollectionOrderedArticles({ allPublished: published, collectionId: key });
    collectionOrderedCache.set(key, ordered);
    return ordered;
  };

  let updatedCount = 0;
  let skippedCount = 0;
  let lowViewMissingMeta = 0;
  let funnelAssigned = 0;

  for (const article of publishedFiltered) {
    const title = String(article?.title ?? '').trim();
    const ntitle = normalizeTitle(title);
    const funnelKey = normalizeFunnelKey(title);

    if (!title || !ntitle) {
      skippedCount += 1;
      continue;
    }

    if (typeof article?.body_markdown !== 'string' || article.body_markdown.length === 0) {
      console.log(`Skip (missing body_markdown): ${title}`);
      skippedCount += 1;
      continue;
    }

    const desiredSeries = matchesAnyFunnel(funnelKey, foundationsMatchers)
      ? funnelASeries
      : matchesAnyFunnel(funnelKey, buildlogMatchers)
        ? funnelBSeries
        : null;

    const desiredHook = String(hooksByTitle.get(ntitle) ?? defaultHook).trim() || defaultHook;

    const desiredDescriptionRaw = descByTitle.get(ntitle);
    const desiredDescription = typeof desiredDescriptionRaw === 'string' ? desiredDescriptionRaw.trim() : null;

    const desiredCoverRaw = coverByTitle.get(ntitle);
    const desiredCover = typeof desiredCoverRaw === 'string' ? desiredCoverRaw.trim() : null;

    const fm = readFrontMatter(article.body_markdown);
    const fmSeriesOk = !desiredSeries ? true : String(fm?.series ?? '').trim() === desiredSeries;

    const conversionMarkersOk = hasAllMarkers(article.body_markdown, [
      '<!-- pain-tracker:conversion-block:start -->',
      '<!-- pain-tracker:conversion-block:end -->',
    ]);

    const existingBlock = extractMarkedSection(
      article.body_markdown,
      '<!-- pain-tracker:conversion-block:start -->',
      '<!-- pain-tracker:conversion-block:end -->',
    );

    const conversionBlockOk =
      conversionMarkersOk &&
      Boolean(existingBlock) &&
      existingBlock.includes('<!-- pain-tracker:conversion-block:v5 -->') &&
      existingBlock.includes(sponsorUrl) &&
      existingBlock.includes(String(startHereUrl ?? '').trim() || '**Start here →** (link)') &&
      existingBlock.includes(String(tryUrl ?? '').trim() || '**Live demo →** (link)');

    const hasNextUp = NEXT_UP_BLOCK_RE.test(article.body_markdown);
    const readingOrderPresent =
      /(^|\r?\n)#{2,4}\s+.*reading\s+order.*$/im.test(article.body_markdown) ||
      /(^|\r?\n)\*\*.*reading\s+order.*\*\*\s*$/im.test(article.body_markdown) ||
      article.body_markdown.includes('<!-- pain-tracker:reading-order:start -->') ||
      article.body_markdown.includes('<summary><strong>Reading order</strong></summary>');

    const currentSeriesApi = typeof article?.series === 'string' ? article.series.trim() : null;
    const currentSeriesFm = String(fm?.series ?? '').trim() || null;
    const currentSeries = currentSeriesApi ?? currentSeriesFm;
    const needsSeries = Boolean(desiredSeries) && currentSeries !== desiredSeries;

    const needsBody =
      !conversionBlockOk ||
      (desiredSeries ? !fmSeriesOk : false) ||
      readingOrderPresent ||
      !hasNextUp;

    const currentDescription = typeof article?.description === 'string' ? article.description.trim() : '';
    const needsDescription = Boolean(desiredDescription) && currentDescription !== desiredDescription;

    const currentCover = typeof article?.main_image === 'string' ? article.main_image.trim() : '';
    const needsCover = Boolean(desiredCover) && currentCover !== desiredCover;

    const views =
      typeof article?.page_views_count === 'number'
        ? article.page_views_count
        : typeof article?.page_views_count === 'string'
          ? Number(article.page_views_count)
          : null;

    const isLowView = typeof views === 'number' && Number.isFinite(views) && views < lowViewThreshold;
    const missingMeta = isLowView && (!currentDescription || !currentCover);
    if (missingMeta) lowViewMissingMeta += 1;

    const needsAny = needsBody || needsSeries || needsDescription || needsCover;

    if (!needsAny) {
      console.log(`OK: ${title}`);
      continue;
    }

    const parts = [
      needsSeries ? 'series' : null,
      needsBody ? 'conversion-block' : null,
      readingOrderPresent ? 'reading-order' : null,
      !hasNextUp ? 'next-up' : null,
      needsDescription ? 'description' : null,
      needsCover ? 'cover' : null,
    ].filter(Boolean);

    const viewNote = typeof views === 'number' && Number.isFinite(views) ? ` (views: ${views})` : '';

    if (!yes) {
      console.log(`DRY RUN: retrofit ${title}${viewNote}`);
      console.log(`  id:  ${article?.id ?? '(unknown)'}`);
      console.log(`  url: ${article?.url ?? '(unknown)'}`);
      console.log(`  changes: ${parts.join(', ')}`);
      if (missingMeta) {
        console.log(
          `  note: low views (<${lowViewThreshold}) and missing cover/description (add overrides in ${PUBLISHED_RETROFIT_PATH})`,
        );
      }
      continue;
    }

    let body_markdown = article.body_markdown;
    if (desiredSeries) {
      body_markdown = upsertSeriesInBodyMarkdown(body_markdown, desiredSeries);
    }
    body_markdown = upsertConversionBlock(body_markdown, {
      hook: desiredHook,
      startHereUrl,
      sponsorUrl,
      tryUrl,
      trustBullets,
    });
    body_markdown = stripBuildLogNoiseLines(body_markdown);
    body_markdown = removeReadingOrderSection(body_markdown).md;
    {
      const ordered = getOrderedFor(article?.collection_id);
      const nextUp = buildNextUpBlock({ article, startHereUrl, sponsorUrl, orderedCollection: ordered });
      body_markdown = upsertNextUpBlock(body_markdown, nextUp);
    }

    const payload = {
      article: {
        ...(needsSeries ? { series: desiredSeries } : null),
        ...(needsBody ? { body_markdown } : null),
        ...(needsDescription ? { description: desiredDescription } : null),
        ...(needsCover ? { main_image: desiredCover } : null),
      },
    };

    await devtoRequest('PUT', `/articles/${article.id}`, payload);
    updatedCount += 1;
    if (desiredSeries) funnelAssigned += 1;

    console.log(`Retrofitted: ${title}`);
    console.log(`  id: ${article.id}`);

    if (throttleMs > 0) {
      await sleep(throttleMs);
    }
  }

  if (!yes) {
    console.log('');
    console.log(`Dry run complete. Published posts scanned: ${publishedFiltered.length}.`);
    console.log('Notes:');
    console.log('- Funnel assignment applies only to the configured title lists.');
    console.log(
      `- Low-view posts (<${lowViewThreshold}) missing cover/description: ${lowViewMissingMeta} (fill overrides in ${PUBLISHED_RETROFIT_PATH})`,
    );
    return;
  }

  console.log('');
  console.log(`Done. Updated: ${updatedCount}. Skipped: ${skippedCount}. Funnel-assigned: ${funnelAssigned}.`);
}

function buildStartHereMarkdown({ title, promiseLines, pillarLinks, buildLogLink, sponsorUrl, repoUrl, tryUrl }) {
  const lines = [];

  lines.push(`# ${title}`);
  lines.push('');

  for (const line of promiseLines) {
    lines.push(line);
  }

  lines.push('');
  lines.push('## Start with these 3 posts');
  lines.push('');
  for (const l of pillarLinks) lines.push(`- ${l}`);

  lines.push('');
  lines.push('## Follow the build log');
  lines.push('');
  lines.push(`- ${buildLogLink}`);

  lines.push('');
  lines.push('---');
  lines.push('## Support / Try it');
  lines.push('');
  lines.push(`- Sponsor → ${sponsorUrl}`);
  lines.push(`- Star → ${repoUrl}`);
  lines.push(`- Try PainTracker → ${tryUrl}`);
  lines.push('');
  lines.push('> If you’re building healthcare software, these posts are written for the moments when things go wrong — offline, under stress, and with privacy on the line.');
  lines.push('');

  return lines.join('\n');
}

async function cmdPublishStartHere(schedule, { yes, write, writeMd }) {
  const retrofit = await loadPublishedRetrofitConfig();

  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? retrofit?.defaults?.sponsor_url ?? schedule.defaults?.sponsor_url ?? null;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url ?? retrofit?.defaults?.repo_url ?? null;
  const tryUrl = process.env.DEVTO_TRY_URL ?? 'https://paintracker.ca';

  if (!sponsorUrl) throw new Error('Missing sponsor URL. Set DEVTO_SPONSOR_URL (or retrofit.defaults.sponsor_url).');
  if (!repoUrl) throw new Error('Missing repo URL. Set DEVTO_REPO_URL (or schedule.defaults.repo_url).');

  const funnelASeries = String(retrofit?.defaults?.funnelA_series ?? 'Foundations').trim() || 'Foundations';
  const funnelBSeries = String(retrofit?.defaults?.funnelB_series ?? 'CrisisCore Build Log').trim() || 'CrisisCore Build Log';

  const title =
    String(
      process.env.DEVTO_START_HERE_TITLE ??
        'Start Here: PainTracker + CrisisCore Build Log (Privacy-First, Offline-First, No Surveillance)',
    ).trim();

  const description = String(
    process.env.DEVTO_START_HERE_DESCRIPTION ??
      'Start here for the privacy-first, offline-first PainTracker series: foundations, threat models, and the CrisisCore build log.',
  ).trim();

  const tags = String(process.env.DEVTO_START_HERE_TAGS ?? 'healthtech, privacy, webdev, testing').trim();

  const all = await listAllUserArticles();
  const published = all.filter((a) => isPublishedInPast(a) && !isScheduledForFuture(a));

  const foundationsMatchers = (retrofit?.funnels?.foundations_titles ?? [])
    .map((t) => normalizeFunnelKey(t))
    .filter(Boolean);
  const buildlogMatchers = (retrofit?.funnels?.buildlog_titles ?? [])
    .map((t) => normalizeFunnelKey(t))
    .filter(Boolean);

  const matchesAnyFunnel = (articleKey, matchers) =>
    matchers.some((m) => articleKey === m || articleKey.startsWith(m) || articleKey.includes(m));

  const foundationsPublished = published.filter((a) => matchesAnyFunnel(normalizeFunnelKey(a?.title), foundationsMatchers));
  const buildlogPublished = published.filter((a) => matchesAnyFunnel(normalizeFunnelKey(a?.title), buildlogMatchers));

  const byViewsDesc = (a, b) => {
    const av = typeof a?.page_views_count === 'number' ? a.page_views_count : Number(a?.page_views_count ?? 0);
    const bv = typeof b?.page_views_count === 'number' ? b.page_views_count : Number(b?.page_views_count ?? 0);
    return (Number.isFinite(bv) ? bv : 0) - (Number.isFinite(av) ? av : 0);
  };

  const topPillars = foundationsPublished.slice().sort(byViewsDesc).slice(0, 3);
  const pillarLinks = topPillars
    .map((a) => {
      const t = String(a?.title ?? '').trim();
      const u = String(a?.url ?? '').trim();
      if (!t || !u) return null;
      return `[${t}](${u})`;
    })
    .filter(Boolean);

  if (pillarLinks.length < 3) {
    console.warn(
      `Warning: only found ${pillarLinks.length}/3 pillar posts from the configured Foundations list. Add missing titles to scripts/devto/published-retrofit.json if needed.`,
    );
  }

  // Choose a build log entry point:
  // - Prefer earliest published build log article
  // - Fallback to the first scheduled post URL
  const byPublishedAtAsc = (a, b) => Date.parse(a?.published_at ?? a?.published_timestamp ?? '') - Date.parse(b?.published_at ?? b?.published_timestamp ?? '');
  const buildLogStartArticle = buildlogPublished.slice().sort(byPublishedAtAsc).find((a) => a?.url) ?? null;
  const buildLogStartUrl =
    (buildLogStartArticle ? String(buildLogStartArticle.url) : null) ??
    (typeof schedule?.posts?.[0]?.devtoUrl === 'string' ? schedule.posts[0].devtoUrl : null) ??
    null;

  const buildLogLink = buildLogStartUrl
    ? `CrisisCore Build Log → ${buildLogStartUrl}`
    : `CrisisCore Build Log → (link)`;

  const promiseLines = [
    'PainTracker is a privacy-first, offline-first pain tracker built for the moments that matter.',
    'No cloud dependency. No surveillance business model. Client-side encryption where it counts.',
    'These posts share the foundations (why) and the build log (how) behind CrisisCore systems.',
    'If you’re living with chronic pain, you deserve tools that don’t trade your safety for “engagement.”',
    'If you’re building healthcare software, you deserve patterns that survive crisis conditions.',
  ];

  const body_markdown = buildStartHereMarkdown({
    title,
    promiseLines,
    pillarLinks,
    buildLogLink,
    sponsorUrl,
    repoUrl,
    tryUrl,
  });

  if (writeMd) {
    const outPath = path.join(ROOT, 'scripts', 'devto', 'start-here.md');
    await fs.writeFile(outPath, body_markdown + '\n', 'utf8');
    console.log(`Wrote: ${outPath}`);
  }

  if (!yes) {
    console.log('DRY RUN: would publish Start Here post');
    console.log(`  title: ${title}`);
    console.log(`  series: ${funnelASeries}`);
    console.log(`  tags:   ${tags}`);
    console.log(`  desc:   ${description}`);
    console.log(`  build-log-series: ${funnelBSeries}`);
    console.log(`  build-log-start:  ${buildLogStartUrl ?? '(missing)'}`);
    console.log(`  pillars: ${pillarLinks.length}`);
    return;
  }

  const payload = {
    article: {
      title,
      body_markdown,
      published: true,
      series: funnelASeries,
      description,
      tags,
    },
  };

  const created = await devtoRequest('POST', '/articles', payload);
  const url = created?.url ?? null;
  const id = created?.id ?? null;

  console.log(`Published Start Here: ${title}`);
  console.log(`  id:  ${id ?? '(unknown)'}`);
  console.log(`  url: ${url ?? '(unknown)'}`);

  if (write && url) {
    retrofit.defaults = retrofit.defaults ?? {};
    retrofit.defaults.start_here_url = url;
    await fs.writeFile(PUBLISHED_RETROFIT_PATH, JSON.stringify(retrofit, null, 2) + '\n', 'utf8');
    console.log(`Wrote Start Here URL into: ${PUBLISHED_RETROFIT_PATH}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] ?? 'dry-run';

  const schedule = await loadSchedule();

  if (cmd === 'dry-run') {
    await cmdDryRun(schedule);
    return;
  }

  if (cmd === 'auth-check') {
    const me = await getMe();
    console.log(`OK: authenticated as ${me?.username ?? me?.name ?? '(unknown)'}`);
    return;
  }

  if (cmd === 'create-drafts') {
    await cmdCreateDrafts(schedule, { write: Boolean(args.write) });
    return;
  }

  if (cmd === 'publish-due') {
    await cmdPublishDue(schedule, { yes: Boolean(args.yes), write: Boolean(args.write) });
    return;
  }

  if (cmd === 'sync-schedule') {
    await cmdSyncSchedule(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPast: Boolean(args['allow-past']),
    });
    return;
  }

  if (cmd === 'sync-titles') {
    await cmdSyncTitles(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPublished: Boolean(args['allow-published']),
    });
    return;
  }

  if (cmd === 'sync-content') {
    await cmdSyncContent(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPublished: Boolean(args['allow-published']),
    });
    return;
  }

  if (cmd === 'push-source') {
    await cmdPushSource(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPublished: Boolean(args['allow-published']),
    });
    return;
  }

  if (cmd === 'retrofit-published') {
    await cmdRetrofitPublished(schedule, {
      yes: Boolean(args.yes),
    });
    return;
  }

  if (cmd === 'publish-start-here') {
    await cmdPublishStartHere(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      writeMd: Boolean(args['write-md']),
    });
    return;
  }

  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  if (err?.details) {
    console.error(JSON.stringify(err.details, null, 2));
  }
  if (String(err?.message ?? '').includes('401 Unauthorized')) {
    console.error('');
    console.error('Auth troubleshooting:');
    console.error('- Confirm DEVTO_API_KEY is the full key (no quotes/spaces)');
    console.error('- Confirm the key is from dev.to Settings → Extensions');
    console.error('- Try: node scripts/devto/devto.mjs auth-check');
  }
  process.exitCode = 1;
});

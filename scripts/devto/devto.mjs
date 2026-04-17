import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ACCEPT = 'application/vnd.forem.api-v1+json, application/json';
const DEVTO_API_BASE = process.env.DEVTO_API_BASE ?? 'https://dev.to/api';
const DEVTO_API_KEY = process.env.DEVTO_API_KEY;

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const PUBLISHED_RETROFIT_PATH = path.join(ROOT, 'scripts', 'devto', 'published-retrofit.json');
const FRONT_MATTER_LINE_RE = /^([A-Za-z_]\w*):\s*(.*)$/;

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

function parseOnlyKeysArg(onlyRaw) {
  if (!onlyRaw) return null;
  if (onlyRaw === true) return null;
  const s = String(onlyRaw).trim();
  if (!s) return null;
  const keys = s
    .split(',')
    .map((k) => String(k).trim())
    .filter(Boolean);
  if (keys.length === 0) return null;
  return new Set(keys);
}

function parseFrontMatterLine(line) {
  const match = FRONT_MATTER_LINE_RE.exec(line);
  if (!match) return null;
  return { key: match[1], value: match[2] };
}

function hasFrontMatterBlock(md, eol) {
  const body = String(md ?? '');
  const start = `---${eol}`;
  const marker = `${eol}---${eol}`;
  return body.startsWith(start) && body.includes(marker, start.length);
}

function resolveOrganizationId(raw) {
  return raw ? Number(raw) : undefined;
}

function requireSponsorAndRepoUrls({ sponsorUrl, repoUrl }) {
  if (!sponsorUrl || !repoUrl) {
    throw new Error('Missing sponsor/repo URL. Set DEVTO_SPONSOR_URL and DEVTO_REPO_URL (or schedule.defaults).');
  }
}

function getDevtoPublishConfig(schedule) {
  const sponsorUrl = process.env.DEVTO_SPONSOR_URL ?? schedule.defaults?.sponsor_url;
  const repoUrl = process.env.DEVTO_REPO_URL ?? schedule.defaults?.repo_url;
  const seriesStartUrl = process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url;
  const series = process.env.DEVTO_SERIES ?? schedule.defaults?.series;
  const organizationIdRaw = process.env.DEVTO_ORGANIZATION_ID ?? schedule.defaults?.organization_id;
  const organization_id = resolveOrganizationId(organizationIdRaw);

  requireSponsorAndRepoUrls({ sponsorUrl, repoUrl });

  return {
    sponsorUrl,
    repoUrl,
    seriesStartUrl,
    series,
    organization_id,
    schedule,
  };
}

function getSeriesProfiles(config) {
  const profiles = config?.schedule?.defaults?.series_profiles;
  if (!profiles || typeof profiles !== 'object') return {};
  return profiles;
}

function normalizeOrderedKeys(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((key) => String(key ?? '').trim()).filter(Boolean);
}

function findSeriesProfileBySeriesName(seriesName, config) {
  const desired = String(seriesName ?? '').trim();
  if (!desired) return null;

  for (const [key, value] of Object.entries(getSeriesProfiles(config))) {
    if (!value || typeof value !== 'object') continue;
    if (String(value.series ?? '').trim() !== desired) continue;
    return {
      key,
      series: desired,
      chainKey: String(value.chainKey ?? '').trim() || null,
      startHereKey: String(value.startHereKey ?? '').trim() || null,
      startHereUrl: String(value.startHereUrl ?? '').trim() || null,
      orderedKeys: normalizeOrderedKeys(value.orderedKeys),
    };
  }

  return null;
}

function resolveSeriesProfile(post, config) {
  const explicitKey = String(post?.seriesProfile ?? post?.seriesKey ?? '').trim();
  if (explicitKey) {
    const value = getSeriesProfiles(config)[explicitKey];
    if (value && typeof value === 'object') {
      return {
        key: explicitKey,
        series: String(value.series ?? '').trim() || null,
        chainKey: String(value.chainKey ?? '').trim() || null,
        startHereKey: String(value.startHereKey ?? '').trim() || null,
        startHereUrl: String(value.startHereUrl ?? '').trim() || null,
        orderedKeys: normalizeOrderedKeys(value.orderedKeys),
      };
    }
  }

  if (post && Object.hasOwn(post, 'series')) {
    return findSeriesProfileBySeriesName(post.series, config);
  }

  return findSeriesProfileBySeriesName(config?.series, config);
}

function getSchedulePostByKey(schedule, key) {
  const safeKey = String(key ?? '').trim();
  if (!safeKey) return null;
  return schedule?.posts?.find((entry) => String(entry?.key ?? '').trim() === safeKey) ?? null;
}

function getOrderedSeriesPosts({ schedule, config, chainKey, profile }) {
  const keyedPosts = new Map((schedule?.posts ?? []).map((entry) => [String(entry?.key ?? '').trim(), entry]));
  const explicitOrdered = (profile?.orderedKeys ?? []).map((key) => keyedPosts.get(key)).filter(Boolean);

  if (explicitOrdered.length > 0) {
    if (!chainKey) return explicitOrdered;

    const seen = new Set(explicitOrdered.map((entry) => String(entry?.key ?? '').trim()));
    const extras = (schedule?.posts ?? [])
      .filter((entry) => resolvePostSeriesChain(entry, config) === chainKey)
      .filter((entry) => !seen.has(String(entry?.key ?? '').trim()))
      .slice()
      .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));

    return [...explicitOrdered, ...extras];
  }

  if (!chainKey) return [];

  return (schedule?.posts ?? [])
    .filter((entry) => resolvePostSeriesChain(entry, config) === chainKey)
    .slice()
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));
}

function resolveSeriesStartUrl({ schedule, config, profile, orderedPosts }) {
  if (profile?.startHereUrl) return profile.startHereUrl;

  if (profile?.startHereKey) {
    const startHerePost = getSchedulePostByKey(schedule, profile.startHereKey);
    if (startHerePost?.devtoUrl) return startHerePost.devtoUrl;
  }

  return orderedPosts[0]?.devtoUrl ?? config.seriesStartUrl ?? null;
}

function buildBodyMarkdown(md, post, { sponsorUrl, repoUrl, seriesStartUrl }) {
  const { top, bottom } = buildCtas({ sponsorUrl, repoUrl, seriesStartUrl });
  const normalizedMd = normalizeBodyMarkdownForDev(md);
  return shouldInjectCtasForPost(post)
    ? injectCtasIntoMarkdown(normalizedMd, { ctaTop: top, ctaBottom: bottom })
    : normalizedMd;
}

async function readBodyMarkdownForPost(post, config) {
  const { md } = await readSourceMarkdown(post.sourceFile);
  return buildBodyMarkdown(md, post, config);
}

function inferPublishedStateForExistingArticle(currentArticle) {
  if (!currentArticle || typeof currentArticle !== 'object') return false;
  if (typeof currentArticle.published === 'boolean') return currentArticle.published;
  return Boolean(currentArticle.published_at ?? currentArticle.published_timestamp);
}

function resolvePostSeriesName(post, config) {
  if (post && Object.hasOwn(post, 'series')) {
    return post.series ?? null;
  }
  const profile = resolveSeriesProfile(post, config);
  if (profile?.series) return profile.series;
  return config.series ?? null;
}

function resolvePostSeriesChain(post, config) {
  if (!post) return null;
  if (Object.hasOwn(post, 'seriesChain')) return post.seriesChain ?? null;
  const profile = resolveSeriesProfile(post, config);
  return profile?.chainKey ?? null;
}

function buildArticleUpsertPayload(post, body_markdown, config, overrides = {}) {
  const explicitPublished = overrides.article && Object.hasOwn(overrides.article, 'published')
    ? overrides.article.published
    : undefined;
  const explicitCanonical = overrides.article && Object.hasOwn(overrides.article, 'canonical_url')
    ? overrides.article.canonical_url
    : undefined;

  return {
    article: {
      title: post.title,
      body_markdown,
      published: explicitPublished ?? inferPublishedStateForExistingArticle(overrides.currentArticle),
      series: resolvePostSeriesName(post, config),
      main_image: resolvePostMainImage(post, overrides.currentArticle ?? null),
      canonical_url: resolvePostCanonicalUrl(post, overrides.currentArticle ?? null, explicitCanonical),
      description: post.description ?? undefined,
      tags: ensureStringArrayTags(post.tags),
      organization_id: config.organization_id ?? null,
      ...overrides.article,
    },
  };
}

function matchesOnlyKeys(post, onlyKeys) {
  if (!onlyKeys) return true;
  return onlyKeys.has(String(post?.key ?? ''));
}

function ensureStringArrayTags(tags) {
  if (!tags) return '';
  if (typeof tags === 'string') return tags;
  if (Array.isArray(tags)) return tags.join(', ');
  return '';
}

function resolvePostMainImage(post, currentArticle = null) {
  const explicitImage =
    (typeof post?.main_image === 'string' && post.main_image.trim()) ||
    (typeof post?.cover_image === 'string' && post.cover_image.trim()) ||
    null;

  if (explicitImage) return explicitImage;

  const existingImage =
    (typeof currentArticle?.main_image === 'string' && currentArticle.main_image.trim()) || null;

  return existingImage;
}

function resolvePostCanonicalUrl(post, currentArticle = null, explicitCanonical = undefined) {
  if (explicitCanonical !== undefined) return explicitCanonical;

  const existingCanonical =
    (typeof currentArticle?.canonical_url === 'string' && currentArticle.canonical_url.trim()) || null;

  if (existingCanonical) return existingCanonical;

  return (typeof post?.canonical_url === 'string' && post.canonical_url.trim()) || null;
}

function shouldInjectCtasForPost(post) {
  return post?.injectCtas !== false;
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
    const parsed = parseFrontMatterLine(line);
    if (!parsed) return line;
    const { key } = parsed;
    if (Object.hasOwn(updates, key)) {
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
    const parsed = parseFrontMatterLine(line);
    if (!parsed) continue;
    out[parsed.key] = parsed.value;
  }
  return out;
}

function stripFrontMatter(md) {
  const normalized = String(md ?? '');
  const eol = normalized.includes('\r\n') ? '\r\n' : '\n';
  const startsWithFrontMatter = normalized.startsWith(`---${eol}`);
  if (!startsWithFrontMatter) return normalized;

  const endMarker = `${eol}---${eol}`;
  const start = `---${eol}`;
  const endIdx = normalized.indexOf(endMarker, start.length);
  if (endIdx === -1) return normalized;

  return normalized.slice(endIdx + endMarker.length);
}

function normalizeBodyMarkdownForDev(md) {
  return stripFrontMatter(md).trimStart();
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
    .replaceAll(/\/+$/g, '')
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

  const lines = ['---', ''];

  if (isStartHere) {
    // Avoid “Start here → Start here”
    if (first && String(first?.id ?? '') !== String(article?.id ?? '')) {
      lines.push(`**Start at Part 1 →** ${first.url}  `);
    } else {
      return null;
    }
  } else if (next?.url) {
    lines.push(`**Next up →** ${next.url}  `, `**Start here →** ${safeStartHere}  `);
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

  s = removeLegacyReadingOrderDetailsBlock(s, eol);

  const range = findReadingOrderSectionRange(s);
  if (!range) return { md: s, changed: false };

  // Remove the section, then trim excessive blank lines around the cut.
  const lines = s.split(/\r?\n/);
  const before = lines.slice(0, range.startLine).join(eol).replace(/\s*$/, '');
  const after = lines.slice(range.endLine).join(eol).replace(/^\s*/, '');
  const out = [before, after].filter(Boolean).join(eol + eol);

  return { md: out, changed: true };
}

function removeLegacyReadingOrderDetailsBlock(md, eol) {
  const lines = String(md ?? '').split(/\r?\n/);
  const detailsSummaryRe = /^\s*<summary><strong>\s*reading\s+order\s*<\/strong><\/summary>\s*$/i;

  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*<details>\s*$/i.test(lines[i])) continue;
    if (i + 1 >= lines.length || !detailsSummaryRe.test(lines[i + 1])) continue;

    let endIdx = i + 2;
    while (endIdx < lines.length && !/^\s*<\/details>\s*$/i.test(lines[endIdx])) endIdx += 1;
    if (endIdx < lines.length) {
      lines.splice(i, endIdx - i + 1);
      break;
    }
  }

  return lines.join(eol);
}

function findReadingOrderSectionRange(md) {
  const lines = String(md ?? '').split(/\r?\n/);
  const headingRe = /^(#{2,4})\s+.*reading\s+order.*$/i;
  const altRe = /^\*\*.*reading\s+order.*\*\*\s*$/i;

  let startLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (headingRe.test(lines[i]) || altRe.test(lines[i])) {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) return null;

  let endLine = lines.length;
  for (let i = startLine + 1; i < lines.length; i += 1) {
    if (isReadingOrderBoundaryLine(lines[i])) {
      endLine = i;
      break;
    }
  }

  return { startLine, endLine };
}

function isReadingOrderBoundaryLine(line) {
  return (
    /^#{1,6}\s+/.test(line) ||
    line.includes('<!-- pain-tracker:cta-bottom -->') ||
    line.includes('<!-- pain-tracker:bottom-next:start -->')
  );
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
  const hasFrontMatter = hasFrontMatterBlock(out, eol);

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
  const hasFrontMatter = hasFrontMatterBlock(out, eol);

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
    if (idx === -1) {
      out = out.replace(/\s*$/, '') + insertion;
    } else {
      out = out.slice(0, idx) + insertion + out.slice(idx);
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
    .replaceAll(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeDevComparableTitle(title) {
  return String(title ?? '')
    .normalize('NFKD')
    .replaceAll(/[\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F]/g, ' ')
    .replaceAll(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replaceAll(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeFunnelKey(title) {
  return String(title ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim()
    .replaceAll(/\s+/g, ' ');
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

async function getArticleById(articleId) {
  try {
    return await devtoRequest('GET', `/articles/${articleId}`);
  } catch (err) {
    if (String(err?.message ?? '').includes('404')) {
      return null;
    }
    throw err;
  }
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

function isLockedPublishedArticle(article, now = new Date()) {
  return isPublishedInPast(article, now) && !isScheduledForFuture(article, now);
}

function resolveCurrentArticleForPost({ post, allCache, now, desiredIso = post.publishAt }) {
  let current = null;
  let linked = false;
  let relinkedFrom = null;

  if (post.articleId) {
    current = allCache.find((a) => a?.id === post.articleId) ?? null;
  }

  if (current) {
    return { current, linked, relinkedFrom };
  }

  const wanted = normalizeTitle(post.title);
  const matches = allCache.filter((a) => normalizeTitle(a?.title) === wanted);
  const best = pickBestTitleMatch(matches, desiredIso, now);
  if (!best?.id) {
    return { current: null, linked, relinkedFrom };
  }

  relinkedFrom = post.articleId && post.articleId !== best.id ? post.articleId : null;
  post.articleId = best.id;
  post.devtoUrl = best.url ?? post.devtoUrl ?? null;
  linked = true;
  current = best;

  return { current, linked, relinkedFrom };
}

async function createDraftArticleForPost(post, config) {
  const body_markdown = await readBodyMarkdownForPost(post, config);
  const payload = buildArticleUpsertPayload(post, body_markdown, config);
  const createdArticle = await devtoRequest('POST', '/articles', payload);

  post.articleId = createdArticle.id ?? null;
  post.devtoUrl = createdArticle.url ?? null;

  return createdArticle;
}

async function ensureDraftArticleForPost({ post, allCache, now, config }) {
  const resolved = resolveCurrentArticleForPost({ post, allCache, now });
  if (resolved.current) {
    return { current: resolved.current, linked: resolved.linked, created: false, relinkedFrom: resolved.relinkedFrom };
  }

  const created = await createDraftArticleForPost(post, config);
  allCache.push(created);
  return { current: created, linked: false, created: true, relinkedFrom: null };
}

function buildPublishedPayload(post, current, body_markdown, config) {
  return buildArticleUpsertPayload(post, body_markdown, config, {
    currentArticle: current,
    article: {
      published: true,
    },
  });
}

async function publishArticleForPost(post, current, config) {
  const body_markdown = await readBodyMarkdownForPost(post, config);
  const payload = buildPublishedPayload(post, current, body_markdown, config);
  const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
  post.devtoUrl = updated.url ?? post.devtoUrl;
  post.published = true;
  return updated;
}

async function persistScheduleWrite({ write, schedule, onWrite, onSkip }) {
  if (write) {
    await saveSchedule(schedule);
    if (onWrite) console.log(onWrite);
    return;
  }
  if (onSkip) console.log(onSkip);
}

function buildRetitlePayload(post, current, desiredTitleRaw, body_markdown) {
  return {
    article: {
      title: desiredTitleRaw,
      ...(body_markdown ? { body_markdown } : null),
      main_image: resolvePostMainImage(post, current),
    },
  };
}

function buildCountResult({ changed = 0, linked = 0, skipped = 0, pushed = 0 }) {
  return { changed, linked, skipped, pushed };
}

function linkedCount(resolved) {
  return resolved?.linked ? 1 : 0;
}

function logRelinkIfNeeded(post, resolved) {
  if (!resolved?.relinkedFrom) return;
  console.log(`Re-linked stale articleId for: ${post.title}`);
  console.log(`  from: ${resolved.relinkedFrom}`);
  console.log(`  to:   ${post.articleId}`);
}

function resolveArticleOrSkip({ post, allCache, now, desiredIso, missingMessage }) {
  const resolved = resolveCurrentArticleForPost({ post, allCache, now, desiredIso });
  logRelinkIfNeeded(post, resolved);
  if (resolved.current && post.articleId) {
    return { resolved };
  }

  console.log(missingMessage);
  return {
    result: buildCountResult({ linked: linkedCount(resolved), skipped: 1 }),
  };
}

function getScheduleWindowSkipResult(post, allowPast, now) {
  const desired = post.publishAt;
  const desiredMs = Date.parse(desired);
  if (Number.isNaN(desiredMs)) {
    console.log(`Skip (invalid publishAt): ${post.title}`);
    return buildCountResult({ skipped: 1 });
  }
  if (allowPast || desiredMs > now.getTime()) {
    return null;
  }

  console.log(`Skip (publishAt is in the past): ${post.title}`);
  return buildCountResult({ skipped: 1 });
}

function getTitleWindowSkipResult(post, allowPublished, now) {
  if (allowPublished) {
    return null;
  }

  const desiredMs = Date.parse(post.publishAt);
  if (Number.isNaN(desiredMs) || desiredMs > now.getTime()) {
    return null;
  }

  console.log(`Skip (publishAt is in the past): ${post.title}`);
  return buildCountResult({ skipped: 1 });
}

function getRequiredTitleOrSkip(post) {
  const desiredTitleRaw = String(post.title ?? '').trim();
  if (desiredTitleRaw) {
    return { desiredTitleRaw };
  }

  console.log('Skip (missing title):', post.key);
  return { result: buildCountResult({ skipped: 1 }) };
}

function getNormalizedCurrentBodyOrThrow(post, current, desiredTitleRaw) {
  if (typeof current?.body_markdown === 'string' && current.body_markdown.length > 0) {
    return current.body_markdown;
  }
  throw new Error(`Cannot sync content for ${desiredTitleRaw}: API did not return body_markdown.`);
}

function buildSyncContentState({ post, current, config, desiredSeries, seriesStartUrl, nextUpUrl, partLabel }) {
  const currentBody = getNormalizedCurrentBodyOrThrow(post, current, String(post.title ?? '').trim());
  const fm = readFrontMatter(currentBody);
  const ctaArgs = buildCtaArgs(config);
  let body_markdown = normalizeBodyMarkdownForDev(currentBody);
  if (shouldInjectCtasForPost(post)) {
    body_markdown = injectCtasIntoMarkdown(body_markdown, ctaArgs);
  }
  if (desiredSeries && partLabel) {
    body_markdown = injectSeriesChainIntoMarkdown(body_markdown, {
      seriesName: desiredSeries,
      partLabel,
      startHereUrl: seriesStartUrl,
      nextUpUrl,
    });
  }

  const shouldHaveCtas = shouldInjectCtasForPost(post);
  const shouldHaveSeriesChain = Boolean(desiredSeries && partLabel);
  const ctaMarkersOk = !shouldHaveCtas || hasAllMarkers(currentBody, [
    '<!-- pain-tracker:cta-top -->',
    '<!-- pain-tracker:cta-bottom -->',
  ]);
  const chainMarkersOk = !shouldHaveSeriesChain || hasAllMarkers(currentBody, [
    '<!-- pain-tracker:series-chain:start -->',
    '<!-- pain-tracker:series-chain:end -->',
  ]);

  return {
    body_markdown,
    currentTitle: String(current?.title ?? '').trim(),
    currentSeries: typeof current?.series === 'string' ? current.series.trim() : '',
    hasFrontMatter: Boolean(fm),
    ctaMarkersOk,
    chainMarkersOk,
  };
}

function getPostsForSync(schedule, onlyKeys) {
  if (onlyKeys) {
    return schedule.posts
      .filter((post) => matchesOnlyKeys(post, onlyKeys))
      .slice()
      .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));
  }

  return schedule.posts
    .filter((post) => post?.enabled)
    .slice()
    .sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt));
}

function getSeriesChainContext({ schedule, post, config }) {
  const desiredSeries = resolvePostSeriesName(post, config);
  const profile = resolveSeriesProfile(post, config);
  const chainKey = resolvePostSeriesChain(post, config);

  if (!desiredSeries) {
    return { desiredSeries, partLabel: null, nextUpUrl: null, seriesStartUrl: null };
  }

  const chainPosts = getOrderedSeriesPosts({ schedule, config, chainKey, profile });
  const seriesStartUrl = resolveSeriesStartUrl({ schedule, config, profile, orderedPosts: chainPosts });

  if (!chainKey) {
    return { desiredSeries, partLabel: null, nextUpUrl: null, seriesStartUrl };
  }

  const index = chainPosts.findIndex((entry) => entry?.key === post?.key);
  const partLabel = index >= 0 ? `Part ${index + 1}` : null;
  const nextUpUrl = index >= 0 ? chainPosts[index + 1]?.devtoUrl ?? null : null;

  return { desiredSeries, partLabel, nextUpUrl, seriesStartUrl };
}

async function processSyncSchedulePost({ post, allCache, now, yes, allowPast }) {
  const desired = post.publishAt;
  const windowSkip = getScheduleWindowSkipResult(post, allowPast, now);
  if (windowSkip) return windowSkip;

  const articleState = resolveArticleOrSkip({
    post,
    allCache,
    now,
    desiredIso: desired,
    missingMessage: `Skip (not found via /articles/me/all): ${post.title}`,
  });
  if (articleState.result) return articleState.result;

  const { resolved } = articleState;
  if (isLockedPublishedArticle(resolved.current, now)) {
    console.log(`Skip (already published): ${post.title}`);
    return buildCountResult({ linked: linkedCount(resolved), skipped: 1 });
  }

  const currentTs = resolved.current?.published_at ?? resolved.current?.published_timestamp ?? null;
  if (currentTs && timestampsEqual(currentTs, desired)) {
    console.log(`OK (already scheduled): ${post.title}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  if (!yes) {
    console.log(`DRY RUN: reschedule ${post.title}`);
    console.log(`  from: ${currentTs ?? '(none)'}`);
    console.log(`  to:   ${desired}`);
    console.log(`  id:   ${post.articleId}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  await applyScheduleUpdate(post, resolved.current, desired);
  return buildCountResult({ changed: 1, linked: linkedCount(resolved) });
}

async function applyScheduleUpdate(post, current, desired) {
  try {
    const payload = {
      article: {
        published: true,
        published_at: desired,
      },
    };
    const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
    post.devtoUrl = updated?.url ?? post.devtoUrl;
    console.log(`Rescheduled: ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  to: ${desired}`);
    return;
  } catch (err) {
    const msg = String(err?.message ?? '');
    if (!msg.includes('422')) throw err;
  }

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

  const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, fallbackPayload);
  post.devtoUrl = updated?.url ?? post.devtoUrl;
  console.log(`Rescheduled (front matter): ${post.title}`);
  console.log(`  id: ${post.articleId}`);
  console.log(`  to: ${desired}`);
}

async function processSyncTitlePost({ post, allCache, now, yes, allowPublished }) {
  const titleState = getRequiredTitleOrSkip(post);
  if (titleState.result) return titleState.result;
  const { desiredTitleRaw } = titleState;

  const windowSkip = getTitleWindowSkipResult(post, allowPublished, now);
  if (windowSkip) return windowSkip;

  const articleState = resolveArticleOrSkip({
    post,
    allCache,
    now,
    desiredIso: post.publishAt,
    missingMessage: `Skip (not found via /articles/me/all): ${post.title}`,
  });
  if (articleState.result) return articleState.result;

  const { resolved } = articleState;
  if (!allowPublished && isLockedPublishedArticle(resolved.current, now)) {
    console.log(`Skip (already published): ${desiredTitleRaw}`);
    return buildCountResult({ linked: linkedCount(resolved), skipped: 1 });
  }

  const currentTitle = String(resolved.current?.title ?? '').trim();
  if (normalizeDevComparableTitle(currentTitle) === normalizeDevComparableTitle(desiredTitleRaw)) {
    console.log(`OK (title matches): ${desiredTitleRaw}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  if (!yes) {
    console.log(`DRY RUN: retitle ${currentTitle || '(untitled)'} → ${desiredTitleRaw}`);
    console.log(`  id:  ${post.articleId}`);
    console.log(`  url: ${resolved.current?.url ?? post.devtoUrl ?? '(unknown)'}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  let body_markdown;
  if (typeof resolved.current?.body_markdown === 'string' && resolved.current.body_markdown.length > 0) {
    body_markdown = normalizeBodyMarkdownForDev(resolved.current.body_markdown);
  }

  const payload = buildRetitlePayload(post, resolved.current, desiredTitleRaw, body_markdown);
  const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
  post.devtoUrl = updated?.url ?? post.devtoUrl;
  console.log(`Retitled: ${desiredTitleRaw}`);
  console.log(`  id: ${post.articleId}`);
  return buildCountResult({ changed: 1, linked: linkedCount(resolved) });
}

async function processPushSourcePost({ post, allCache, now, yes, allowPublished, config }) {
  if (!post.sourceFile) {
    console.log(`Skip (no sourceFile): ${post.key}`);
    return { pushed: 0, linked: 0, skipped: 1 };
  }

  const resolved = resolveCurrentArticleForPost({ post, allCache, now, desiredIso: post.publishAt });
  if (!resolved.current || !post.articleId) {
    console.log(`Skip (no article on DEV — run create-drafts first): ${post.title}`);
    return { pushed: 0, linked: resolved.linked ? 1 : 0, skipped: 1 };
  }
  if (!allowPublished && isLockedPublishedArticle(resolved.current, now)) {
    console.log(`Skip (already published — use --allow-published to force): ${post.title}`);
    return { pushed: 0, linked: resolved.linked ? 1 : 0, skipped: 1 };
  }

  const body_markdown = await readBodyMarkdownForPost(post, config);
  if (!yes) {
    console.log(`DRY RUN: push source for ${post.title}`);
    console.log(`  id:     ${post.articleId}`);
    console.log(`  url:    ${resolved.current?.url ?? post.devtoUrl ?? '(unknown)'}`);
    console.log(`  source: ${post.sourceFile}`);
    return { pushed: 0, linked: resolved.linked ? 1 : 0, skipped: 0 };
  }

  const payload = buildArticleUpsertPayload(post, body_markdown, config, {
    currentArticle: resolved.current,
  });

  const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
  post.devtoUrl = updated?.url ?? post.devtoUrl;
  console.log(`Pushed: ${post.title}`);
  console.log(`  id:  ${post.articleId}`);
  console.log(`  url: ${post.devtoUrl}`);
  return { pushed: 1, linked: resolved.linked ? 1 : 0, skipped: 0 };
}

async function processSyncContentPost({ post, allCache, now, yes, allowPublished, config, desiredSeries, seriesStartUrl, nextUpUrl, partLabel }) {
  const titleState = getRequiredTitleOrSkip(post);
  if (titleState.result) return titleState.result;
  const { desiredTitleRaw } = titleState;

  const articleState = resolveArticleOrSkip({
    post,
    allCache,
    now,
    desiredIso: post.publishAt,
    missingMessage: `Skip (not found via /articles/me/all): ${post.title}`,
  });
  if (articleState.result) return articleState.result;

  const { resolved } = articleState;
  if (!allowPublished && isLockedPublishedArticle(resolved.current, now)) {
    console.log(`Skip (already published): ${desiredTitleRaw}`);
    return buildCountResult({ linked: linkedCount(resolved), skipped: 1 });
  }

  const contentState = buildSyncContentState({
    post,
    current: resolved.current,
    config,
    desiredSeries,
    seriesStartUrl,
    nextUpUrl,
    partLabel,
  });
  const needsTitle = normalizeDevComparableTitle(contentState.currentTitle) !== normalizeDevComparableTitle(desiredTitleRaw);
  const currentSeries = contentState.currentSeries || null;
  const needsSeries = shouldTreatSeriesAsDrift({ currentSeries, desiredSeries });
  const needsBody = !(contentState.ctaMarkersOk && contentState.chainMarkersOk) || contentState.hasFrontMatter;

  if (!(needsTitle || needsSeries || needsBody)) {
    console.log(`OK (content matches): ${desiredTitleRaw}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  if (!yes) {
    console.log(`DRY RUN: sync content for ${desiredTitleRaw}`);
    console.log(`  id:  ${post.articleId}`);
    console.log(`  url: ${resolved.current?.url ?? post.devtoUrl ?? '(unknown)'}`);
    console.log(`  changes: ${buildSyncContentChangeList({ needsTitle, needsSeries, needsBody }).join(', ')}`);
    return buildCountResult({ linked: linkedCount(resolved) });
  }

  const payload = buildArticleUpsertPayload(post, contentState.body_markdown, config, {
    currentArticle: resolved.current,
    article: {
      title: desiredTitleRaw,
      series: desiredSeries,
    },
  });
  const updated = await devtoRequest('PUT', `/articles/${post.articleId}`, payload);
  post.devtoUrl = updated?.url ?? post.devtoUrl;
  console.log(`Synced: ${desiredTitleRaw}`);
  console.log(`  id: ${post.articleId}`);
  return buildCountResult({ changed: 1, linked: linkedCount(resolved) });
}

function buildCtaArgs(config) {
  const { top, bottom } = buildCtas(config);
  return { ctaTop: top, ctaBottom: bottom };
}

function buildSyncContentChangeList({ needsTitle, needsSeries, needsBody }) {
  return [needsTitle ? 'title' : null, needsSeries ? 'series' : null, needsBody ? 'body' : null].filter(Boolean);
}

function shouldTreatSeriesAsDrift({ currentSeries, desiredSeries }) {
  if (!desiredSeries) return false;
  if (!currentSeries) return false;
  return currentSeries !== desiredSeries;
}

function buildSeriesReportGroupLabel({ profile, desiredSeries }) {
  if (profile?.key) return `${profile.key} (${desiredSeries ?? 'no-series'})`;
  return desiredSeries ?? 'standalone';
}

async function cmdSeriesReport(schedule, { onlyKeys }) {
  const config = {
    schedule,
    seriesStartUrl: process.env.DEVTO_SERIES_START_URL ?? schedule.defaults?.series_start_url ?? null,
    series: process.env.DEVTO_SERIES ?? schedule.defaults?.series ?? null,
  };

  const scopedPosts = (schedule.posts ?? [])
    .filter((post) => matchesOnlyKeys(post, onlyKeys))
    .filter((post) => resolvePostSeriesName(post, config));

  if (scopedPosts.length === 0) {
    console.log('No schedule-mapped posts with a configured series matched the current scope.');
    return;
  }

  const groups = new Map();

  for (const post of scopedPosts) {
    const desiredSeries = resolvePostSeriesName(post, config);
    const profile = resolveSeriesProfile(post, config);
    const groupKey = profile?.key ?? desiredSeries;
    const chainContext = getSeriesChainContext({ schedule, post, config });
    const liveArticle = post.articleId ? await getArticleById(post.articleId) : null;
    const collectionId = liveArticle?.collection_id ?? null;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        label: buildSeriesReportGroupLabel({ profile, desiredSeries }),
        desiredSeries,
        seriesStartUrl: chainContext.seriesStartUrl,
        items: [],
      });
    }

    groups.get(groupKey).items.push({
      key: post.key,
      title: post.title,
      articleId: post.articleId ?? null,
      devtoUrl: post.devtoUrl ?? liveArticle?.url ?? null,
      collectionId,
      partLabel: chainContext.partLabel,
      nextUpUrl: chainContext.nextUpUrl,
    });
  }

  const collectionUsage = new Map();
  for (const group of groups.values()) {
    const collectionIds = [...new Set(group.items.map((item) => item.collectionId).filter(Boolean))];
    for (const collectionId of collectionIds) {
      if (!collectionUsage.has(collectionId)) {
        collectionUsage.set(collectionId, new Set());
      }
      collectionUsage.get(collectionId).add(group.label);
    }
  }

  for (const group of groups.values()) {
    const collectionIds = [...new Set(group.items.map((item) => item.collectionId).filter(Boolean))];
    console.log(`Series: ${group.label}`);
    console.log(`  desired: ${group.desiredSeries}`);
    console.log(`  start-here: ${group.seriesStartUrl ?? '(none)'}`);
    console.log(`  collection_ids: ${collectionIds.length > 0 ? collectionIds.join(', ') : '(none from API)'}`);
    console.log(`  items: ${group.items.length}`);

    for (const item of group.items) {
      console.log(`  - ${item.key}`);
      console.log(`    title: ${item.title}`);
      console.log(`    articleId: ${item.articleId ?? '(none)'}`);
      console.log(`    collectionId: ${item.collectionId ?? '(none)'}`);
      console.log(`    part: ${item.partLabel ?? '(none)'}`);
      console.log(`    next: ${item.nextUpUrl ?? '(none)'}`);
      console.log(`    url: ${item.devtoUrl ?? '(none)'}`);
    }

    console.log('');
  }

  for (const [collectionId, labels] of collectionUsage.entries()) {
    if (labels.size < 2) continue;
    console.log(`Warning: collection_id ${collectionId} is shared by ${[...labels].join(', ')}`);
  }
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
    chunks.push(`## ${item.title}`, '', '```md', item.pinnedComment, '```', '');
  }

  await fs.writeFile(outPath, chunks.join('\n'), 'utf8');
}

async function cmdDryRun(schedule, { onlyKeys } = {}) {
  const now = new Date();
  console.log(`Now: ${now.toISOString()}`);
  console.log(`Schedule: ${SCHEDULE_PATH}`);
  if (onlyKeys) {
    console.log(`Only keys: ${Array.from(onlyKeys).join(', ')}`);
  }
  console.log('');

  for (const post of schedule.posts) {
    if (!matchesOnlyKeys(post, onlyKeys)) continue;
    const due = isDueNow(post.publishAt, now);
    let status = 'disabled';
    if (post.enabled) {
      status = due ? 'DUE' : 'pending';
    }
    console.log(`- ${post.publishAt} | ${status} | ${post.title} (${post.sourceFile})`);
  }

  console.log('');
  console.log('Notes:');
  console.log('- Forem API docs do not clearly document rescheduling, but some instances accept `published_at` on update.');
  console.log('- If the API rejects direct rescheduling (422), the script can fall back to setting front matter in `body_markdown`.');
}

async function cmdCreateDrafts(schedule, { write, onlyKeys } = {}) {
  const config = getDevtoPublishConfig(schedule);

  const pinned = [];
  let created = 0;
  let linked = 0;

  // Use /articles/me/all so we can link already-scheduled posts (they may not appear under /me/unpublished).
  const existingAll = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!matchesOnlyKeys(post, onlyKeys)) continue;
    if (!post.enabled) continue;
    if (post.articleId) continue;

    const resolved = resolveCurrentArticleForPost({ post, allCache: existingAll, now: new Date() });
    if (resolved.current?.id) {
      linked += 1;
      console.log(`Linked existing draft: ${post.title}`);
      console.log(`  id: ${post.articleId}`);
      console.log(`  url: ${post.devtoUrl}`);
      continue;
    }

    const createdArticle = await createDraftArticleForPost(post, config);
    existingAll.push(createdArticle);
    created += 1;

    const { pinnedComment } = buildCtas(config);
    pinned.push({ title: post.title, pinnedComment });

    console.log(`Created draft: ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  url: ${post.devtoUrl}`);
  }

  if (created > 0) {
    await writePinnedCommentsFile(pinned);
    console.log('');
    await persistScheduleWrite({
      write,
      schedule,
      onWrite: 'Wrote updated article IDs back into schedule.json',
      onSkip: 'Drafts created, but schedule.json not modified (run with --write to persist IDs).',
    });
  } else if (linked > 0) {
    console.log('');
    await persistScheduleWrite({
      write,
      schedule,
      onWrite: 'Wrote linked article IDs back into schedule.json',
      onSkip: 'Linked drafts, but schedule.json not modified (run with --write to persist IDs).',
    });
  } else {
    console.log('No drafts to create or link.');
  }
}

async function cmdPublishDue(schedule, { yes, write, onlyKeys } = {}) {
  if (!yes) {
    throw new Error('Refusing to publish without --yes');
  }

  const config = getDevtoPublishConfig(schedule);

  const now = new Date();
  let publishedCount = 0;

  // Use /articles/me/all to avoid duplicating already-scheduled posts.
  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!matchesOnlyKeys(post, onlyKeys)) continue;
    if (!post.enabled) continue;
    if (!isDueNow(post.publishAt, now)) continue;

    const ensured = await ensureDraftArticleForPost({ post, allCache, now, config });
    if (!post.articleId || !ensured.current) {
      console.log(`Skip (no article id): ${post.title}`);
      continue;
    }
    if (isLockedPublishedArticle(ensured.current, now)) {
      console.log(`Skip (already published): ${post.title}`);
      continue;
    }
    if (isScheduledForFuture(ensured.current, now)) {
      console.log(`Skip (already scheduled): ${post.title}`);
      continue;
    }

    await publishArticleForPost(post, ensured.current, config);

    publishedCount += 1;

    console.log(`Published: ${post.title}`);
    console.log(`  id: ${post.articleId}`);
    console.log(`  url: ${post.devtoUrl}`);
  }

  if (publishedCount === 0) {
    console.log('No posts were due to publish.');
    return;
  }

  console.log('');
  await persistScheduleWrite({
    write,
    schedule,
    onWrite: 'Wrote published flags back into schedule.json',
    onSkip: 'Published posts, but schedule.json not modified (run with --write to persist flags).',
  });
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

    const result = await processSyncSchedulePost({ post, allCache, now, yes, allowPast });
    changed += result.changed;
    linked += result.linked;
    skipped += result.skipped;
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Rescheduled: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdSyncTitles(schedule, { yes, write, allowPublished, onlyKeys }) {
  const now = new Date();
  let changed = 0;
  let linked = 0;
  let skipped = 0;

  // Reads must use /articles/me/all because GET /articles/{id} only returns published.
  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!matchesOnlyKeys(post, onlyKeys)) continue;
    if (!post.enabled) continue;

    const result = await processSyncTitlePost({ post, allCache, now, yes, allowPublished });
    changed += result.changed;
    linked += result.linked;
    skipped += result.skipped;
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Retitled: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdSyncContent(schedule, { yes, write, allowPublished, onlyKeys }) {
  const now = new Date();
  let changed = 0;
  let linked = 0;
  let skipped = 0;

  const config = getDevtoPublishConfig(schedule);

  const allCache = await listAllUserArticles();

  const syncPosts = getPostsForSync(schedule, onlyKeys);

  for (const post of syncPosts) {
    const chainContext = getSeriesChainContext({ schedule, post, config });

    const result = await processSyncContentPost({
      post,
      allCache,
      now,
      yes,
      allowPublished,
      config,
      desiredSeries: chainContext.desiredSeries,
      seriesStartUrl: chainContext.seriesStartUrl,
      nextUpUrl: chainContext.nextUpUrl,
      partLabel: chainContext.partLabel,
    });
    changed += result.changed;
    linked += result.linked;
    skipped += result.skipped;
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Synced: ${changed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

async function cmdPushSource(schedule, { yes, write, allowPublished, onlyKeys }) {
  const now = new Date();
  let pushed = 0;
  let linked = 0;
  let skipped = 0;

  const config = getDevtoPublishConfig(schedule);

  const allCache = await listAllUserArticles();

  for (const post of schedule.posts) {
    if (!matchesOnlyKeys(post, onlyKeys)) continue;
    if (!post.enabled) continue;

    const result = await processPushSourcePost({ post, allCache, now, yes, allowPublished, config });
    pushed += result.pushed;
    linked += result.linked;
    skipped += result.skipped;
  }

  if (!yes) return;

  console.log('');
  console.log(`Done. Pushed: ${pushed}. Linked: ${linked}. Skipped: ${skipped}.`);

  if (write) {
    await saveSchedule(schedule);
    console.log('Wrote updated article IDs/URLs back into schedule.json');
  }
}

function matchesAnyFunnelKey(articleKey, matchers) {
  return matchers.some((matcher) => articleKey === matcher || articleKey.startsWith(matcher) || articleKey.includes(matcher));
}

function resolveRetrofitStartHereUrl(retrofit, schedule) {
  const envStartHere = process.env.DEVTO_START_HERE_URL;
  const envIsPlaceholder = /dev\.to\/yourname\//i.test(String(envStartHere ?? ''));
  const safeEnvStartHere = envIsPlaceholder ? null : envStartHere;

  return (
    safeEnvStartHere ??
    retrofit?.defaults?.start_here_url ??
    process.env.DEVTO_SERIES_START_URL ??
    schedule.defaults?.series_start_url ??
    null
  );
}

function getRetrofitContext(schedule, retrofit) {
  const sponsorUrl =
    process.env.DEVTO_SPONSOR_URL ?? retrofit?.defaults?.sponsor_url ?? schedule.defaults?.sponsor_url ?? null;
  const tryUrl =
    process.env.DEVTO_TRY_URL ?? retrofit?.defaults?.try_url ?? schedule.defaults?.try_url ?? 'https://paintracker.ca';
  const startHereUrl = resolveRetrofitStartHereUrl(retrofit, schedule);
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

  return {
    sponsorUrl,
    tryUrl,
    startHereUrl,
    trustBullets,
    defaultHook,
    lowViewThreshold,
    funnelASeries,
    funnelBSeries,
    foundationsMatchers: (retrofit?.funnels?.foundations_titles ?? []).map((t) => normalizeFunnelKey(t)).filter(Boolean),
    buildlogMatchers: (retrofit?.funnels?.buildlog_titles ?? []).map((t) => normalizeFunnelKey(t)).filter(Boolean),
    hooksByTitle: toNormalizedMap(retrofit?.overrides?.hooks_by_title),
    descByTitle: toNormalizedMap(retrofit?.overrides?.description_by_title),
    coverByTitle: toNormalizedMap(retrofit?.overrides?.cover_image_by_title),
  };
}

function validateRetrofitContext(context, yes) {
  if (!context.sponsorUrl) {
    throw new Error('Missing sponsor URL. Set DEVTO_SPONSOR_URL (or retrofit.defaults.sponsor_url).');
  }
  if (yes && !context.startHereUrl) {
    throw new Error(
      'Missing Start Here URL. Set DEVTO_START_HERE_URL (or scripts/devto/published-retrofit.json defaults.start_here_url).',
    );
  }
  if (yes && /dev\.to\/yourname\//i.test(String(context.startHereUrl ?? ''))) {
    throw new Error(
      'Refusing to apply with a placeholder Start Here URL. Set DEVTO_START_HERE_URL to the real DEV URL for your Start Here post.',
    );
  }
  if (context.startHereUrl) {
    return;
  }
  console.warn('Warning: Start Here URL is not set (DEVTO_START_HERE_URL). Dry run will use a placeholder link.');
}

function getRetrofitThrottleMs(retrofit) {
  const throttleMsRaw = process.env.DEVTO_THROTTLE_MS ?? retrofit?.defaults?.throttle_ms;
  return Number.isFinite(Number(throttleMsRaw)) ? Number(throttleMsRaw) : 1200;
}

function getArticleViews(article) {
  if (typeof article?.page_views_count === 'number') {
    return article.page_views_count;
  }
  if (typeof article?.page_views_count === 'string') {
    return Number(article.page_views_count);
  }
  return null;
}

function getDesiredRetrofitSeries(funnelKey, context) {
  if (matchesAnyFunnelKey(funnelKey, context.foundationsMatchers)) {
    return context.funnelASeries;
  }
  if (matchesAnyFunnelKey(funnelKey, context.buildlogMatchers)) {
    return context.funnelBSeries;
  }
  return null;
}

function getRetrofitDescriptionAndCover(ntitle, context) {
  const desiredDescriptionRaw = context.descByTitle.get(ntitle);
  const desiredCoverRaw = context.coverByTitle.get(ntitle);
  return {
    desiredDescription: typeof desiredDescriptionRaw === 'string' ? desiredDescriptionRaw.trim() : null,
    desiredCover: typeof desiredCoverRaw === 'string' ? desiredCoverRaw.trim() : null,
  };
}

function buildRetrofitArticleState(article, context) {
  const title = String(article?.title ?? '').trim();
  const ntitle = normalizeTitle(title);
  if (!title || !ntitle) {
    return { skip: true, silentSkip: true };
  }
  if (typeof article?.body_markdown !== 'string' || article.body_markdown.length === 0) {
    return { skip: true, title, logMessage: `Skip (missing body_markdown): ${title}` };
  }

  const funnelKey = normalizeFunnelKey(title);
  const desiredSeries = getDesiredRetrofitSeries(funnelKey, context);
  const desiredHook = String(context.hooksByTitle.get(ntitle) ?? context.defaultHook).trim() || context.defaultHook;
  const { desiredDescription, desiredCover } = getRetrofitDescriptionAndCover(ntitle, context);
  const fm = readFrontMatter(article.body_markdown);
  const fmSeriesOk = !desiredSeries || String(fm?.series ?? '').trim() === desiredSeries;
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
    existingBlock.includes(context.sponsorUrl) &&
    existingBlock.includes(String(context.startHereUrl ?? '').trim() || '**Start here →** (link)') &&
    existingBlock.includes(String(context.tryUrl ?? '').trim() || '**Live demo →** (link)');
  const hasNextUp = NEXT_UP_BLOCK_RE.test(article.body_markdown);
  const readingOrderPresent =
    /(^|\r?\n)#{2,4}\s+.*reading\s+order.*$/im.test(article.body_markdown) ||
    /(^|\r?\n)\*\*.*reading\s+order.*\*\*\s*$/im.test(article.body_markdown) ||
    article.body_markdown.includes('<!-- pain-tracker:reading-order:start -->') ||
    article.body_markdown.includes('<summary><strong>Reading order</strong></summary>');
  const currentSeriesApi = typeof article?.series === 'string' ? article.series.trim() : null;
  const currentSeriesFm = String(fm?.series ?? '').trim() || null;
  const currentSeries = currentSeriesApi ?? currentSeriesFm;
  const currentDescription = typeof article?.description === 'string' ? article.description.trim() : '';
  const currentCover = typeof article?.main_image === 'string' ? article.main_image.trim() : '';
  const views = getArticleViews(article);
  const isLowView = typeof views === 'number' && Number.isFinite(views) && views < context.lowViewThreshold;
  const missingMeta = isLowView && (!currentDescription || !currentCover);
  const needsSeries = Boolean(desiredSeries) && currentSeries !== desiredSeries;
  const needsBody = !conversionBlockOk || (desiredSeries ? !fmSeriesOk : false) || readingOrderPresent || !hasNextUp;
  const needsDescription = Boolean(desiredDescription) && currentDescription !== desiredDescription;
  const needsCover = Boolean(desiredCover) && currentCover !== desiredCover;

  return {
    title,
    desiredSeries,
    desiredHook,
    desiredDescription,
    desiredCover,
    readingOrderPresent,
    hasNextUp,
    views,
    missingMeta,
    needsSeries,
    needsBody,
    needsDescription,
    needsCover,
    needsAny: needsBody || needsSeries || needsDescription || needsCover,
  };
}

function buildRetrofitChangeParts(state) {
  const nextUpMissing = state.hasNextUp ? null : 'next-up';
  return [
    state.needsSeries ? 'series' : null,
    state.needsBody ? 'conversion-block' : null,
    state.readingOrderPresent ? 'reading-order' : null,
    nextUpMissing,
    state.needsDescription ? 'description' : null,
    state.needsCover ? 'cover' : null,
  ].filter(Boolean);
}

function buildRetrofittedBody(article, state, context, orderedCollection) {
  let body_markdown = article.body_markdown;
  if (state.desiredSeries) {
    body_markdown = upsertSeriesInBodyMarkdown(body_markdown, state.desiredSeries);
  }
  body_markdown = upsertConversionBlock(body_markdown, {
    hook: state.desiredHook,
    startHereUrl: context.startHereUrl,
    sponsorUrl: context.sponsorUrl,
    tryUrl: context.tryUrl,
    trustBullets: context.trustBullets,
  });
  body_markdown = stripBuildLogNoiseLines(body_markdown);
  body_markdown = removeReadingOrderSection(body_markdown).md;
  const nextUp = buildNextUpBlock({
    article,
    startHereUrl: context.startHereUrl,
    sponsorUrl: context.sponsorUrl,
    orderedCollection,
  });
  return upsertNextUpBlock(body_markdown, nextUp);
}

function buildRetrofitPayload(article, state, context, orderedCollection) {
  const body_markdown = buildRetrofittedBody(article, state, context, orderedCollection);
  return {
    article: {
      ...(state.needsSeries ? { series: state.desiredSeries } : null),
      ...(state.needsBody ? { body_markdown } : null),
      ...(state.needsDescription ? { description: state.desiredDescription } : null),
      ...(state.needsCover ? { main_image: state.desiredCover } : null),
    },
  };
}

function logRetrofitDryRun(article, state, context) {
  const viewNote = typeof state.views === 'number' && Number.isFinite(state.views) ? ` (views: ${state.views})` : '';
  console.log(`DRY RUN: retrofit ${state.title}${viewNote}`);
  console.log(`  id:  ${article?.id ?? '(unknown)'}`);
  console.log(`  url: ${article?.url ?? '(unknown)'}`);
  console.log(`  changes: ${buildRetrofitChangeParts(state).join(', ')}`);
  if (!state.missingMeta) {
    return;
  }
  console.log(
    `  note: low views (<${context.lowViewThreshold}) and missing cover/description (add overrides in ${PUBLISHED_RETROFIT_PATH})`,
  );
}

function createCollectionOrderResolver(publishedArticles) {
  const collectionOrderedCache = new Map();
  return (collectionId) => {
    if (!collectionId) return [];

    const key = String(collectionId);
    if (collectionOrderedCache.has(key)) {
      return collectionOrderedCache.get(key);
    }

    const ordered = getCollectionOrderedArticles({ allPublished: publishedArticles, collectionId: key });
    collectionOrderedCache.set(key, ordered);
    return ordered;
  };
}

async function processRetrofitArticle({ article, yes, context, getOrderedFor, throttleMs }) {
  const state = buildRetrofitArticleState(article, context);
  if (state.silentSkip) {
    return { updated: 0, skipped: 1, lowViewMissingMeta: 0, funnelAssigned: 0 };
  }
  if (state.skip) {
    console.log(state.logMessage);
    return { updated: 0, skipped: 1, lowViewMissingMeta: 0, funnelAssigned: 0 };
  }

  const lowViewMissingMeta = state.missingMeta ? 1 : 0;
  if (!state.needsAny) {
    console.log(`OK: ${state.title}`);
    return { updated: 0, skipped: 0, lowViewMissingMeta, funnelAssigned: 0 };
  }
  if (!yes) {
    logRetrofitDryRun(article, state, context);
    return { updated: 0, skipped: 0, lowViewMissingMeta, funnelAssigned: 0 };
  }

  const ordered = getOrderedFor(article?.collection_id);
  const payload = buildRetrofitPayload(article, state, context, ordered);
  await devtoRequest('PUT', `/articles/${article.id}`, payload);

  console.log(`Retrofitted: ${state.title}`);
  console.log(`  id: ${article.id}`);

  if (throttleMs > 0) {
    await sleep(throttleMs);
  }

  return {
    updated: 1,
    skipped: 0,
    lowViewMissingMeta,
    funnelAssigned: state.desiredSeries ? 1 : 0,
  };
}

async function cmdRetrofitPublished(schedule, { yes }) {
  const now = new Date();
  const retrofit = await loadPublishedRetrofitConfig();
  const context = getRetrofitContext(schedule, retrofit);
  validateRetrofitContext(context, yes);
  const throttleMs = getRetrofitThrottleMs(retrofit);

  const all = await listAllUserArticles();
  const published = all.filter((a) => isPublishedInPast(a, now) && !isScheduledForFuture(a, now));
  const publishedFiltered = published.filter((a) => String(a?.url ?? '') !== String(context.startHereUrl ?? ''));
  const getOrderedFor = createCollectionOrderResolver(published);

  let updatedCount = 0;
  let skippedCount = 0;
  let lowViewMissingMeta = 0;
  let funnelAssigned = 0;

  for (const article of publishedFiltered) {
    const result = await processRetrofitArticle({ article, yes, context, getOrderedFor, throttleMs });
    updatedCount += result.updated;
    skippedCount += result.skipped;
    lowViewMissingMeta += result.lowViewMissingMeta;
    funnelAssigned += result.funnelAssigned;
  }

  if (!yes) {
    console.log('');
    console.log(`Dry run complete. Published posts scanned: ${publishedFiltered.length}.`);
    console.log('Notes:');
    console.log('- Funnel assignment applies only to the configured title lists.');
    console.log(
      `- Low-view posts (<${context.lowViewThreshold}) missing cover/description: ${lowViewMissingMeta} (fill overrides in ${PUBLISHED_RETROFIT_PATH})`,
    );
    return;
  }

  console.log('');
  console.log(`Done. Updated: ${updatedCount}. Skipped: ${skippedCount}. Funnel-assigned: ${funnelAssigned}.`);
}

function buildStartHereMarkdown({ title, promiseLines, pillarLinks, buildLogLink, sponsorUrl, repoUrl, tryUrl }) {
  const lines = [
    `# ${title}`,
    '',
    ...promiseLines,
    '',
    '## Start with these 3 posts',
    '',
    ...pillarLinks.map((link) => `- ${link}`),
    '',
    '## Follow the build log',
    '',
    `- ${buildLogLink}`,
    '',
    '---',
    '## Support / Try it',
    '',
    `- Sponsor → ${sponsorUrl}`,
    `- Star → ${repoUrl}`,
    `- Try PainTracker → ${tryUrl}`,
    '',
    '> If you’re building healthcare software, these posts are written for the moments when things go wrong — offline, under stress, and with privacy on the line.',
    '',
  ];

  return lines.join('\n');
}

async function runCommand(cmd, schedule, args, onlyKeys) {
  if (cmd === 'dry-run') {
    await cmdDryRun(schedule, { onlyKeys });
    return;
  }
  if (cmd === 'auth-check') {
    const me = await getMe();
    console.log(`OK: authenticated as ${me?.username ?? me?.name ?? '(unknown)'}`);
    return;
  }
  if (cmd === 'series-report') {
    await cmdSeriesReport(schedule, { onlyKeys });
    return;
  }
  if (cmd === 'create-drafts') {
    await cmdCreateDrafts(schedule, { write: Boolean(args.write), onlyKeys });
    return;
  }
  if (cmd === 'publish-due') {
    await cmdPublishDue(schedule, { yes: Boolean(args.yes), write: Boolean(args.write), onlyKeys });
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
      onlyKeys,
    });
    return;
  }
  if (cmd === 'sync-content') {
    await cmdSyncContent(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPublished: Boolean(args['allow-published']),
      onlyKeys,
    });
    return;
  }
  if (cmd === 'push-source') {
    await cmdPushSource(schedule, {
      yes: Boolean(args.yes),
      write: Boolean(args.write),
      allowPublished: Boolean(args['allow-published']),
      onlyKeys,
    });
    return;
  }
  if (cmd === 'retrofit-published') {
    await cmdRetrofitPublished(schedule, { yes: Boolean(args.yes) });
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

function logAuthTroubleshooting(message) {
  if (!String(message ?? '').includes('401 Unauthorized')) {
    return;
  }

  console.error('');
  console.error('Auth troubleshooting:');
  console.error('- Confirm DEVTO_API_KEY is the full key (no quotes/spaces)');
  console.error('- Confirm the key is from dev.to Settings → Extensions');
  console.error('- Try: node scripts/devto/devto.mjs auth-check');
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
  const onlyKeys = parseOnlyKeysArg(args.only);
  const schedule = await loadSchedule();
  await runCommand(cmd, schedule, args, onlyKeys);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

export {
  buildSyncContentState,
  getSeriesChainContext,
  normalizeDevComparableTitle,
  resolvePostSeriesName,
  resolveSeriesProfile,
  shouldTreatSeriesAsDrift,
};

if (isDirectRun) {
  try {
    await main();
  } catch (err) {
    console.error(err?.message ?? err);
    if (err?.details) {
      console.error(JSON.stringify(err.details, null, 2));
    }
    logAuthTroubleshooting(err?.message);
    process.exitCode = 1;
  }
}

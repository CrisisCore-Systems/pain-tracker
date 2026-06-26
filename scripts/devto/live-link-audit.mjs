#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const DEFAULT_REPORT_PATH = path.join(ROOT, 'artifacts', 'devto', 'live-link-audit.json');
const DEVTO_API_BASE = process.env.DEVTO_API_BASE ?? 'https://dev.to/api';
const ACCEPT = 'application/vnd.forem.api-v1+json, application/json';
const USER_AGENT = 'PainTrackerDevtoLinkAudit/1.0 (+https://paintracker.ca)';

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

function splitCsv(raw) {
  if (!raw || raw === true) return null;
  const values = String(raw)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? new Set(values) : null;
}

async function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env');
  let raw;
  try {
    raw = await fs.readFile(envPath, 'utf8');
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function devtoGet(apiPath) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEVTO_API_KEY. Set it in the environment or .env before running the audit.');
  }

  const res = await fetch(`${DEVTO_API_BASE}${apiPath}`, {
    headers: {
      Accept: ACCEPT,
      'api-key': apiKey,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`DEV.to API ${apiPath} failed with ${res.status}: ${text.slice(0, 240)}`);
  }
  return JSON.parse(text);
}

async function listAllUserArticles() {
  const articles = [];
  const perPage = 100;

  for (let page = 1; ; page += 1) {
    const batch = await devtoGet(`/articles/me/all?per_page=${perPage}&page=${page}`);
    if (!Array.isArray(batch)) {
      throw new Error('DEV.to API returned a non-array article list.');
    }
    articles.push(...batch);
    if (batch.length < perPage) break;
  }

  return articles;
}

function parseSitemapPaths(xml) {
  const paths = new Set();
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  for (const match of xml.matchAll(locRegex)) {
    let url;
    try {
      url = new URL(match[1]);
    } catch {
      continue;
    }
    const host = url.hostname.toLowerCase();
    if (host !== 'paintracker.ca' && host !== 'www.paintracker.ca') continue;
    paths.add(url.pathname.replace(/\/+$/, '') || '/');
  }
  return paths;
}

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function markRange(ranges, start, end) {
  ranges.push([start, end]);
}

function isInsideRanges(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function stripTrailingPunctuation(value) {
  return String(value ?? '').replace(/[),.;:!?]+$/g, '');
}

function normalizeUrl(raw) {
  const cleaned = stripTrailingPunctuation(raw).trim();
  if (!cleaned) return null;
  try {
    return new URL(cleaned).href;
  } catch {
    return null;
  }
}

function extractLinks(markdown) {
  const body = String(markdown ?? '');
  const links = [];
  const linkedUrlRanges = [];

  const markdownLinkRegex = /!?\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of body.matchAll(markdownLinkRegex)) {
    const urlStart = match.index + match[0].indexOf(match[2]);
    const urlEnd = urlStart + match[2].length;
    markRange(linkedUrlRanges, urlStart, urlEnd);
    const url = normalizeUrl(match[2]);
    if (!url) continue;
    links.push({
      kind: match[0].startsWith('!') ? 'markdown-image' : 'markdown',
      url,
      text: match[1],
      line: lineForIndex(body, match.index),
    });
  }

  const htmlHrefRegex = /\bhref=(["'])(https?:\/\/[^"']+)\1/gi;
  for (const match of body.matchAll(htmlHrefRegex)) {
    const urlStart = match.index + match[0].indexOf(match[2]);
    const urlEnd = urlStart + match[2].length;
    markRange(linkedUrlRanges, urlStart, urlEnd);
    const url = normalizeUrl(match[2]);
    if (!url) continue;
    links.push({
      kind: 'html',
      url,
      text: null,
      line: lineForIndex(body, match.index),
    });
  }

  const bareUrls = [];
  const bareUrlRegex = /\bhttps?:\/\/[^\s<>"'\])]+/gi;
  for (const match of body.matchAll(bareUrlRegex)) {
    if (isInsideRanges(match.index, linkedUrlRanges)) continue;
    const url = normalizeUrl(match[0]);
    if (!url) continue;
    bareUrls.push({
      url,
      line: lineForIndex(body, match.index),
    });
    links.push({
      kind: 'bare',
      url,
      text: null,
      line: lineForIndex(body, match.index),
    });
  }

  return { links, bareUrls };
}

function readTargetLinkBlock(markdown) {
  const normalized = String(markdown ?? '').replace(/\r\n/g, '\n');
  const blockRegex =
    /<!-- pain-tracker:target-link:start -->\n> ([^\n]+): \[([^\]]+)\]\((https:\/\/paintracker\.ca([^)]*))\)\n<!-- pain-tracker:target-link:end -->/g;
  const matches = [...normalized.matchAll(blockRegex)];
  if (matches.length === 0) return null;
  return {
    count: matches.length,
    cue: matches[0][1],
    anchorText: matches[0][2],
    url: matches[0][3],
    path: matches[0][4] || '/',
  };
}

function getPaintrackerPath(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host !== 'paintracker.ca' && host !== 'www.paintracker.ca') return null;
  return url.pathname.replace(/\/+$/, '') || '/';
}

function getArticleTimestamp(article) {
  return article?.published_timestamp ?? article?.published_at ?? null;
}

function isPublishedNow(article, now) {
  if (!article?.published) return false;
  const raw = getArticleTimestamp(article);
  if (!raw) return true;
  const timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) return true;
  return timestamp <= now.getTime();
}

function compareArray(a, b) {
  const left = Array.isArray(a) ? a.map(String) : [];
  const right = Array.isArray(b) ? b.map(String) : [];
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function auditArticleStructure({ article, post, targetMap, sitemapPaths, now }) {
  const body = String(article?.body_markdown ?? '');
  const findings = [];
  const warnings = [];
  const targetBlock = readTargetLinkBlock(body);

  if (!post) {
    warnings.push({ type: 'schedule-missing', message: 'Live article is not mapped in scripts/devto/schedule.json.' });
  } else {
    if (!post.sourceFile) {
      findings.push({ type: 'sourceFile-missing', message: 'Schedule entry has no repo-backed sourceFile.' });
    }
    if (!post.devtoUrl) {
      findings.push({ type: 'devtoUrl-missing', message: 'Schedule entry has no live devtoUrl.' });
    } else if (article?.url && post.devtoUrl !== article.url) {
      findings.push({ type: 'devtoUrl-drift', message: `Schedule URL differs from DEV URL (${post.devtoUrl} != ${article.url}).` });
    }

    if (post.title && article?.title && post.title !== article.title) {
      warnings.push({ type: 'title-drift', message: `Schedule title differs from DEV title (${post.title} != ${article.title}).` });
    }
    if (post.description && article?.description && post.description !== article.description) {
      warnings.push({ type: 'description-drift', message: 'Schedule description differs from DEV description.' });
    }
    if (post.canonical_url !== undefined && article?.canonical_url && post.canonical_url !== article.canonical_url) {
      warnings.push({ type: 'canonical-drift', message: `Schedule canonical differs from DEV canonical (${post.canonical_url} != ${article.canonical_url}).` });
    }
    if (post.tags && article?.tag_list && !compareArray(post.tags, article.tag_list)) {
      warnings.push({ type: 'tag-drift', message: 'Schedule tags differ from DEV tags.' });
    }

    const targetSpec = targetMap[String(post.key ?? '').trim()];
    if (!targetSpec) {
      findings.push({ type: 'target-map-missing', message: 'Schedule entry has no target_link_map entry.' });
    } else {
      const expectedPath = String(targetSpec.path ?? '').trim();
      const expectedUrl = `https://paintracker.ca${expectedPath}`;
      if (!targetBlock) {
        findings.push({ type: 'target-block-missing', message: 'Live article is missing the target-link block.' });
      } else {
        if (targetBlock.count !== 1) {
          findings.push({ type: 'target-block-count', message: `Live article has ${targetBlock.count} target-link blocks.` });
        }
        if (targetBlock.url !== expectedUrl) {
          findings.push({ type: 'target-url-drift', message: `Live target link differs from schedule (${targetBlock.url} != ${expectedUrl}).` });
        }
        if (targetBlock.anchorText !== String(targetSpec.anchorText ?? '').trim()) {
          findings.push({ type: 'target-anchor-drift', message: 'Live target anchor text differs from schedule.' });
        }
        if (targetBlock.cue !== String(targetSpec.cue ?? '').trim()) {
          findings.push({ type: 'target-cue-drift', message: 'Live target cue differs from schedule.' });
        }
      }
      if (!sitemapPaths.has(expectedPath)) {
        findings.push({ type: 'target-sitemap-missing', message: `Mapped target path is not present in public/sitemap.xml: ${expectedPath}` });
      }
    }
  }

  const ctaRequired = Boolean(post) && post.injectCtas !== false;
  if (ctaRequired && isPublishedNow(article, now)) {
    if (!body.includes('<!-- pain-tracker:cta-top -->')) {
      findings.push({ type: 'cta-top-missing', message: 'Published live article is missing the CTA top marker.' });
    }
    if (!body.includes('<!-- pain-tracker:cta-bottom -->')) {
      findings.push({ type: 'cta-bottom-missing', message: 'Published live article is missing the CTA bottom marker.' });
    }
  }

  return { findings, warnings, targetBlock };
}

function classifyStatus(status) {
  if (status >= 200 && status < 400) return 'ok';
  if ([401, 403, 429].includes(status)) return 'warning';
  if (status >= 400) return 'broken';
  return 'warning';
}

async function fetchWithTimeout(url, method, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
    });
    return {
      ok: true,
      method,
      status: res.status,
      statusText: res.statusText,
      finalUrl: res.url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUrl(url, timeoutMs) {
  let lastError = null;
  for (const method of ['HEAD', 'GET']) {
    try {
      const result = await fetchWithTimeout(url, method, timeoutMs);
      if (method === 'HEAD' && [400, 403, 405, 406, 429, 500, 501].includes(result.status)) {
        continue;
      }
      return {
        url,
        status: result.status,
        statusText: result.statusText,
        finalUrl: result.finalUrl,
        method: result.method,
        classification: classifyStatus(result.status),
      };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    url,
    status: null,
    statusText: null,
    finalUrl: null,
    method: null,
    classification: 'warning',
    error: lastError?.name === 'AbortError' ? 'timeout' : String(lastError?.message ?? lastError),
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function summarizeLinkOccurrences(articles, postsByArticleId, targetMap, sitemapPaths, now) {
  const articleReports = [];
  const uniqueUrls = new Map();
  const bareUrlFindings = [];
  const paintrackerSitemapFindings = [];

  for (const article of articles) {
    const post = postsByArticleId.get(Number(article.id)) ?? null;
    const { links, bareUrls } = extractLinks(article.body_markdown);
    const structure = auditArticleStructure({ article, post, targetMap, sitemapPaths, now });

    for (const link of links) {
      if (!uniqueUrls.has(link.url)) uniqueUrls.set(link.url, []);
      uniqueUrls.get(link.url).push({
        articleId: article.id,
        articleTitle: article.title,
        articleUrl: article.url,
        scheduleKey: post?.key ?? null,
        line: link.line,
        kind: link.kind,
        text: link.text,
      });

      const paintrackerPath = getPaintrackerPath(link.url);
      if (paintrackerPath && !sitemapPaths.has(paintrackerPath)) {
        paintrackerSitemapFindings.push({
          articleId: article.id,
          articleTitle: article.title,
          scheduleKey: post?.key ?? null,
          url: link.url,
          path: paintrackerPath,
          line: link.line,
        });
      }
    }

    for (const bare of bareUrls) {
      bareUrlFindings.push({
        articleId: article.id,
        articleTitle: article.title,
        articleUrl: article.url,
        scheduleKey: post?.key ?? null,
        url: bare.url,
        line: bare.line,
      });
    }

    articleReports.push({
      articleId: article.id,
      scheduleKey: post?.key ?? null,
      title: article.title,
      url: article.url,
      published: Boolean(article.published),
      publishedAt: getArticleTimestamp(article),
      publishedNow: isPublishedNow(article, now),
      linkCount: links.length,
      bareUrlCount: bareUrls.length,
      targetBlock: structure.targetBlock,
      findings: structure.findings,
      warnings: structure.warnings,
    });
  }

  return {
    articleReports,
    uniqueUrls,
    bareUrlFindings,
    paintrackerSitemapFindings,
  };
}

function buildReport({ articles, schedule, linkSummary, linkChecks, now }) {
  const brokenLinks = [];
  const linkWarnings = [];
  for (const check of linkChecks) {
    const occurrences = linkSummary.uniqueUrls.get(check.url) ?? [];
    const entry = { ...check, occurrences };
    if (check.classification === 'broken') brokenLinks.push(entry);
    if (check.classification === 'warning') linkWarnings.push(entry);
  }

  const structuralFindings = linkSummary.articleReports
    .flatMap((article) =>
      article.findings.map((finding) => ({
        articleId: article.articleId,
        scheduleKey: article.scheduleKey,
        title: article.title,
        url: article.url,
        ...finding,
      })),
    );

  const structuralWarnings = linkSummary.articleReports
    .flatMap((article) =>
      article.warnings.map((warning) => ({
        articleId: article.articleId,
        scheduleKey: article.scheduleKey,
        title: article.title,
        url: article.url,
        ...warning,
      })),
    );

  return {
    generatedAt: now.toISOString(),
    source: 'DEV.to API /articles/me/all',
    schedulePath: path.relative(ROOT, SCHEDULE_PATH),
    articleCount: articles.length,
    schedulePostCount: Array.isArray(schedule.posts) ? schedule.posts.length : 0,
    publishedNowCount: articles.filter((article) => isPublishedNow(article, now)).length,
    scheduledFutureCount: articles.filter((article) => article?.published && !isPublishedNow(article, now)).length,
    uniqueUrlCount: linkSummary.uniqueUrls.size,
    brokenLinkCount: brokenLinks.length,
    linkWarningCount: linkWarnings.length,
    structuralFindingCount: structuralFindings.length,
    structuralWarningCount: structuralWarnings.length,
    bareUrlCount: linkSummary.bareUrlFindings.length,
    paintrackerSitemapFindingCount: linkSummary.paintrackerSitemapFindings.length,
    brokenLinks,
    linkWarnings,
    structuralFindings,
    structuralWarnings,
    bareUrls: linkSummary.bareUrlFindings,
    paintrackerSitemapFindings: linkSummary.paintrackerSitemapFindings,
    articles: linkSummary.articleReports,
  };
}

function printReport(report) {
  console.log('DEV.to live link audit');
  console.log('----------------------');
  console.log(`Articles from API: ${report.articleCount}`);
  console.log(`Published now: ${report.publishedNowCount}`);
  console.log(`Scheduled future: ${report.scheduledFutureCount}`);
  console.log(`Unique URLs checked: ${report.uniqueUrlCount}`);
  console.log(`Broken links: ${report.brokenLinkCount}`);
  console.log(`Link warnings: ${report.linkWarningCount}`);
  console.log(`Structural findings: ${report.structuralFindingCount}`);
  console.log(`Structural warnings: ${report.structuralWarningCount}`);
  console.log(`Bare URL occurrences: ${report.bareUrlCount}`);
  console.log(`PainTracker sitemap warnings: ${report.paintrackerSitemapFindingCount}`);

  if (report.brokenLinks.length > 0) {
    console.log('');
    console.log('Broken links');
    for (const link of report.brokenLinks.slice(0, 20)) {
      const first = link.occurrences[0];
      console.log(`- ${link.status ?? 'error'} ${link.url}`);
      console.log(`  ${first?.scheduleKey ?? first?.articleId ?? '(unknown)'} line ${first?.line ?? '?'}`);
    }
  }

  if (report.structuralFindings.length > 0) {
    console.log('');
    console.log('Structural findings');
    for (const finding of report.structuralFindings.slice(0, 24)) {
      console.log(`- ${finding.scheduleKey ?? finding.articleId}: ${finding.type} - ${finding.message}`);
    }
  }

  if (report.paintrackerSitemapFindings.length > 0) {
    console.log('');
    console.log('PainTracker URLs not in sitemap');
    for (const finding of report.paintrackerSitemapFindings.slice(0, 20)) {
      console.log(`- ${finding.scheduleKey ?? finding.articleId} line ${finding.line}: ${finding.path}`);
    }
  }

  if (report.bareUrls.length > 0) {
    console.log('');
    console.log('Bare URL samples');
    for (const finding of report.bareUrls.slice(0, 12)) {
      console.log(`- ${finding.scheduleKey ?? finding.articleId} line ${finding.line}: ${finding.url}`);
    }
  }
}

async function writeReport(report, outPath) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outPath)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await loadLocalEnv();

  const now = new Date();
  const onlyIds = splitCsv(args.ids);
  const onlyKeys = splitCsv(args.only);
  const timeoutMs = Number(args.timeoutMs ?? 15000);
  const concurrency = Number(args.concurrency ?? 6);
  const write = Boolean(args.write);
  const outPath = typeof args.out === 'string' ? path.resolve(ROOT, args.out) : DEFAULT_REPORT_PATH;

  const [schedule, sitemapRaw, allArticles] = await Promise.all([
    readJson(SCHEDULE_PATH),
    fs.readFile(SITEMAP_PATH, 'utf8'),
    listAllUserArticles(),
  ]);

  const posts = Array.isArray(schedule.posts) ? schedule.posts : [];
  const postsByArticleId = new Map(posts.filter((post) => post.articleId != null).map((post) => [Number(post.articleId), post]));
  const targetMap = schedule.defaults?.target_link_map ?? {};
  const sitemapPaths = parseSitemapPaths(sitemapRaw);

  const articles = allArticles
    .filter((article) => article?.body_markdown)
    .filter((article) => {
      const post = postsByArticleId.get(Number(article.id));
      if (onlyIds && !onlyIds.has(String(article.id))) return false;
      if (onlyKeys && !onlyKeys.has(String(post?.key ?? ''))) return false;
      return true;
    });

  const linkSummary = summarizeLinkOccurrences(articles, postsByArticleId, targetMap, sitemapPaths, now);
  const urls = [...linkSummary.uniqueUrls.keys()].sort();
  const linkChecks = await mapWithConcurrency(urls, concurrency, (url) => checkUrl(url, timeoutMs));
  const report = buildReport({ articles, schedule, linkSummary, linkChecks, now });

  printReport(report);
  if (write) await writeReport(report, outPath);

  if (report.brokenLinkCount > 0 || report.structuralFindingCount > 0) {
    process.exitCode = 1;
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

export {
  extractLinks,
  readTargetLinkBlock,
  parseSitemapPaths,
  summarizeLinkOccurrences,
};

if (isDirectRun) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exitCode = 1;
  });
}

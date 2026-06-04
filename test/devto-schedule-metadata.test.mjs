import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');
const PUBLIC_SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');

function normalizeScalar(value) {
  if (value === undefined) return null;
  if (value === null) return null;

  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeExpectedScalar(value) {
  if (value === undefined || value === null) return undefined;

  const trimmed = String(value).trim();
  return trimmed === '' ? undefined : trimmed;
}

function normalizeTags(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);

  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseFrontMatter(md) {
  const body = String(md ?? '');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(body);
  if (!match) return null;

  const lines = match[1].split(/\r?\n/);
  const data = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;

    const listMatch = /^(\w+):\s*$/.exec(line);
    if (listMatch) {
      const items = [];
      while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        index += 1;
        items.push(lines[index].replace(/^\s*-\s+/, '').trim());
      }
      data[listMatch[1]] = items;
      continue;
    }

    const pairMatch = /^(\w+):\s*(.*)$/.exec(line);
    if (!pairMatch) continue;

    const [, key, rawValue] = pairMatch;
    let value = rawValue.trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      continue;
    }

    data[key] = value;
  }

  return data;
}

function extractSitemapPaths(xml) {
  const paths = new Set();
  const locRegex = /<loc>([^<]+)<\/loc>/g;

  for (const match of xml.matchAll(locRegex)) {
    const url = new URL(match[1]);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== 'paintracker.ca' && hostname !== 'www.paintracker.ca') continue;

    paths.add(url.pathname.replace(/\/+$/, '') || '/');
  }

  return paths;
}

function readTargetLinkBlock(md) {
  const normalized = String(md ?? '').replace(/\r\n/g, '\n');
  const blockRegex =
    /<!-- pain-tracker:target-link:start -->\n> ([^\n]+): \[([^\]]+)\]\((https:\/\/paintracker\.ca[^)]+)\)\n<!-- pain-tracker:target-link:end -->/g;
  const matches = [...normalized.matchAll(blockRegex)];

  if (matches.length === 0) return null;

  return {
    count: matches.length,
    cue: matches[0][1],
    anchorText: matches[0][2],
    url: matches[0][3],
  };
}

test('schedule metadata stays aligned with repo-backed source front matter', async () => {
  const schedule = JSON.parse(await fs.readFile(SCHEDULE_PATH, 'utf8'));
  const mismatches = [];

  for (const post of schedule.posts) {
    if (!post?.sourceFile) continue;

    const sourcePath = path.join(ROOT, post.sourceFile);
    const md = await fs.readFile(sourcePath, 'utf8');
    const frontMatter = parseFrontMatter(md);
    if (!frontMatter) continue;

    const checks = [
      ['title', normalizeExpectedScalar(frontMatter.title), normalizeScalar(post.title)],
      ['description', normalizeExpectedScalar(frontMatter.description), normalizeScalar(post.description)],
      ['canonical_url', normalizeExpectedScalar(frontMatter.canonical_url), normalizeScalar(post.canonical_url)],
      ['tags', normalizeTags(frontMatter.tags), normalizeTags(post.tags)],
      ['main_image', normalizeExpectedScalar(frontMatter.cover_image), normalizeScalar(post.main_image)],
    ];

    for (const [field, expected, actual] of checks) {
      if (expected === undefined) continue;
      try {
        assert.deepEqual(actual, expected);
      } catch {
        mismatches.push({ key: post.key, field, expected, actual });
      }
    }
  }

  assert.deepEqual(mismatches, []);
});

test('schedule structure stays internally consistent', async () => {
  const schedule = JSON.parse(await fs.readFile(SCHEDULE_PATH, 'utf8'));
  const posts = Array.isArray(schedule.posts) ? schedule.posts : [];
  const profiles = schedule.defaults?.series_profiles ?? {};
  const postKeys = posts.map((post) => String(post?.key ?? '').trim()).filter(Boolean);
  const postKeySet = new Set(postKeys);

  assert.equal(postKeys.length, postKeySet.size, 'schedule post keys must be unique');

  for (const post of posts) {
    assert.ok(String(post?.key ?? '').trim(), 'each schedule post must have a key');
    assert.ok(String(post?.sourceFile ?? '').trim(), `post ${post.key} must have a sourceFile`);
    assert.ok(!Number.isNaN(Date.parse(post.publishAt)), `post ${post.key} must have a valid publishAt timestamp`);

    await assert.doesNotReject(async () => {
      await fs.access(path.join(ROOT, post.sourceFile));
    }, `post ${post.key} must reference an existing source file`);

    if (post.seriesProfile) {
      assert.ok(profiles[post.seriesProfile], `post ${post.key} references unknown seriesProfile ${post.seriesProfile}`);
    }

    if (post.articleId != null || post.devtoUrl != null) {
      assert.ok(post.articleId != null, `post ${post.key} must have articleId when devtoUrl is present`);
      assert.ok(post.devtoUrl != null, `post ${post.key} must have devtoUrl when articleId is present`);
    }

    if (post.published) {
      assert.ok(post.articleId != null, `published post ${post.key} must have articleId`);
      assert.ok(post.devtoUrl != null, `published post ${post.key} must have devtoUrl`);
    }
  }

  for (const [profileKey, profile] of Object.entries(profiles)) {
    const orderedKeys = Array.isArray(profile?.orderedKeys) ? profile.orderedKeys.map((key) => String(key).trim()).filter(Boolean) : [];
    const uniqueOrderedKeys = new Set(orderedKeys);

    assert.equal(orderedKeys.length, uniqueOrderedKeys.size, `series profile ${profileKey} has duplicate orderedKeys`);

    for (const orderedKey of orderedKeys) {
      assert.ok(postKeySet.has(orderedKey), `series profile ${profileKey} references unknown post key ${orderedKey}`);
    }

    if (profile?.startHereKey) {
      assert.ok(postKeySet.has(String(profile.startHereKey).trim()), `series profile ${profileKey} references unknown startHereKey ${profile.startHereKey}`);
    }
  }
});

test('Dev.to target CTA routing stays sitemap-backed and source-aligned', async () => {
  const schedule = JSON.parse(await fs.readFile(SCHEDULE_PATH, 'utf8'));
  const sitemapPaths = extractSitemapPaths(await fs.readFile(PUBLIC_SITEMAP_PATH, 'utf8'));
  const posts = Array.isArray(schedule.posts) ? schedule.posts : [];
  const postByKey = new Map(posts.map((post) => [String(post?.key ?? '').trim(), post]));
  const targetMap = schedule.defaults?.target_link_map ?? {};
  const mismatches = [];

  const enabledMissingMaps = posts
    .filter((post) => post?.enabled)
    .map((post) => String(post?.key ?? '').trim())
    .filter((key) => key && !targetMap[key]);

  assert.deepEqual(enabledMissingMaps, [], 'enabled schedule posts must have target_link_map entries');

  for (const [key, spec] of Object.entries(targetMap)) {
    const post = postByKey.get(key);
    const targetPath = String(spec?.path ?? '').trim();
    const anchorText = String(spec?.anchorText ?? '').trim();
    const cue = String(spec?.cue ?? '').trim();

    if (!post) {
      mismatches.push({ key, field: 'post', expected: 'scheduled post', actual: null });
      continue;
    }

    if (!targetPath.startsWith('/')) {
      mismatches.push({ key, field: 'path', expected: 'leading slash path', actual: targetPath });
      continue;
    }

    if (!sitemapPaths.has(targetPath)) {
      mismatches.push({ key, field: 'sitemap', expected: 'path present in public sitemap', actual: targetPath });
    }

    if (!anchorText) {
      mismatches.push({ key, field: 'anchorText', expected: 'non-empty anchor text', actual: anchorText });
    }

    if (!cue) {
      mismatches.push({ key, field: 'cue', expected: 'non-empty cue', actual: cue });
    }

    const sourcePath = path.join(ROOT, post.sourceFile);
    const source = await fs.readFile(sourcePath, 'utf8');
    const block = readTargetLinkBlock(source);
    const expectedUrl = `https://paintracker.ca${targetPath}`;

    if (!block) {
      mismatches.push({ key, field: 'source target-link block', expected: expectedUrl, actual: null });
      continue;
    }

    if (block.count !== 1) {
      mismatches.push({ key, field: 'source target-link block count', expected: 1, actual: block.count });
    }

    if (block.cue !== cue) {
      mismatches.push({ key, field: 'source cue', expected: cue, actual: block.cue });
    }

    if (block.anchorText !== anchorText) {
      mismatches.push({ key, field: 'source anchorText', expected: anchorText, actual: block.anchorText });
    }

    if (block.url !== expectedUrl) {
      mismatches.push({ key, field: 'source target URL', expected: expectedUrl, actual: block.url });
    }
  }

  assert.deepEqual(mismatches, []);
});

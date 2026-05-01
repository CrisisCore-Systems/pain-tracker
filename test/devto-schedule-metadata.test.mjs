import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');

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
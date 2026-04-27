import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  privateRouteMetadata,
  publicResourcePrerenderSlugs,
  publicRouteMetadata,
  publicTopLevelPrerenderSlugs,
} from '../seo/publicRouteMetadata.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

function parseSitemapPaths(xml) {
  return [...xml.matchAll(/<loc>https:\/\/www\.paintracker\.ca([^<]*)<\/loc>/g)]
    .map((match) => match[1] || '/')
    .sort((left, right) => left.localeCompare(right));
}

describe('SEO prerendered entrypoints', () => {
  it('covers every sitemap URL with unique prerender metadata', () => {
    const sitemapPaths = parseSitemapPaths(readUtf8('public/sitemap.xml'));
    const metadataPaths = publicRouteMetadata.map((route) => route.path).sort();

    expect(metadataPaths).toEqual(sitemapPaths);

    for (const route of publicRouteMetadata) {
      expect(route.title.length).toBeGreaterThan(10);
      expect(route.description.length).toBeGreaterThan(20);
      expect(route.canonicalUrl).toBe(`https://www.paintracker.ca${route.path === '/' ? '/' : route.path}`);
      expect(Array.isArray(route.structuredData)).toBe(true);
      expect(route.structuredData.length).toBeGreaterThan(0);
    }
  });

  it('keeps private auth and protected entrypoints out of the index with dedicated HTML shells', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json'));

    for (const route of privateRouteMetadata) {
      expect(route.noindex).toBe(true);
      expect(route.canonicalUrl).toBe(`https://www.paintracker.ca${route.path}`);
    }

    expect(rewrites.some((entry) => entry.destination === '/clinic/login/index.html')).toBe(true);
    expect(rewrites.some((entry) => entry.destination === '/app/checkin/index.html')).toBe(true);
  });

  it('routes top-level prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json'));
    const topLevelRewrite = rewrites.find((entry) => entry.destination === '/:route/index.html');

    expect(topLevelRewrite).toBeDefined();

    for (const slug of publicTopLevelPrerenderSlugs) {
      expect(topLevelRewrite.source).toContain(slug);
    }
  });

  it('routes resource prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json'));
    const resourceRewrite = rewrites.find((entry) => entry.destination === '/resources/:slug/index.html');

    expect(resourceRewrite).toBeDefined();

    for (const slug of publicResourcePrerenderSlugs) {
      expect(resourceRewrite.source).toContain(slug);
    }
  });
});
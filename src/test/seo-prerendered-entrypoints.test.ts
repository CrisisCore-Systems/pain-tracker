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

type RewriteEntry = {
  source: string;
  destination: string;
};

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

function parseSitemapPaths(xml: string) {
  return [...xml.matchAll(/<loc>https:\/\/www\.paintracker\.ca([^<]*)<\/loc>/g)]
    .map((match) => match[1] || '/')
    .sort((left, right) => left.localeCompare(right));
}

describe('SEO prerendered entrypoints', () => {
  it('gives the resources hub FAQ schema and a prerendered body shell', () => {
    const resourcesRoute = publicRouteMetadata.find((route) => route.path === '/resources');

    expect(resourcesRoute).toBeDefined();
    expect(resourcesRoute?.title).toBe('Free Pain Tracker Templates & Pain Journal Printables | PainTracker.ca');
    expect(resourcesRoute?.structuredData.some((item: Record<string, unknown>) => item['@type'] === 'FAQPage')).toBe(true);
    expect(typeof resourcesRoute?.prerenderBodyHtml).toBe('string');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Printable Pain Tracker Templates');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/resources/monthly-pain-tracker-printable');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/resources/pain-tracking-for-migraines');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Download the free pain tracking starter pack');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Choose the right pain tracker');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('How to start tracking pain without overthinking it');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('What is a pain tracker template?');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('PainTracker is built around local-first privacy.');
    expect(resourcesRoute?.structuredData.some((item: Record<string, unknown>) => item['@type'] === 'CollectionPage')).toBe(true);
    expect(resourcesRoute?.structuredData.some((item: Record<string, unknown>) => item['@type'] === 'ItemList')).toBe(true);
  });

  it('covers every sitemap URL with unique prerender metadata', () => {
    const sitemapPaths = parseSitemapPaths(readUtf8('public/sitemap.xml'));
    const metadataPaths = publicRouteMetadata
      .map((route) => route.path)
      .sort((left, right) => left.localeCompare(right));

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
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };

    for (const route of privateRouteMetadata) {
      expect(route.noindex).toBe(true);
      expect(route.canonicalUrl).toBe(`https://www.paintracker.ca${route.path}`);
    }

    expect(rewrites.some((entry: RewriteEntry) => entry.destination === '/clinic/login/index.html')).toBe(true);
    expect(rewrites.some((entry: RewriteEntry) => entry.destination === '/app/checkin/index.html')).toBe(true);
  });

  it('routes top-level prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };
    const topLevelRewrite = rewrites.find((entry: RewriteEntry) => entry.destination === '/:route/index.html');

    expect(topLevelRewrite).toBeDefined();
    if (!topLevelRewrite) throw new Error('Top-level rewrite not found');

    for (const slug of publicTopLevelPrerenderSlugs) {
      expect(topLevelRewrite.source).toContain(slug);
    }
  });

  it('routes resource prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };
    const resourceRewrite = rewrites.find((entry: RewriteEntry) => entry.destination === '/resources/:slug/index.html');

    expect(resourceRewrite).toBeDefined();
    if (!resourceRewrite) throw new Error('Resource rewrite not found');

    for (const slug of publicResourcePrerenderSlugs) {
      expect(resourceRewrite.source).toContain(slug);
    }
  });
});
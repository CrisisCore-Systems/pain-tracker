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
    .map(match => match[1] || '/')
    .sort((left, right) => left.localeCompare(right));
}

function parseRobotsRules(contents: string) {
  const lines = contents
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  return {
    hasWildcardAgent: lines.includes('User-agent: *'),
    hasPublicAllow: lines.includes('Allow: /'),
    hasResourcesAllow: lines.includes('Allow: /resources/'),
    hasAppDisallow: lines.includes('Disallow: /app'),
    hasApiDisallow: lines.includes('Disallow: /api'),
    hasSitemap: lines.includes('Sitemap: https://www.paintracker.ca/sitemap.xml'),
    hasHost: lines.includes('Host: www.paintracker.ca'),
  };
}

describe('SEO prerendered entrypoints', () => {
  it('gives the resources hub FAQ schema and a prerendered body shell', () => {
    const resourcesRoute = publicRouteMetadata.find(route => route.path === '/resources');

    expect(resourcesRoute).toBeDefined();
    expect(resourcesRoute?.title).toBe(
      'Free Pain Tracking Resources, Templates, Charts and Journals | PainTracker.ca'
    );
    expect(
      resourcesRoute?.structuredData.some(
        (item: Record<string, unknown>) => item['@type'] === 'FAQPage'
      )
    ).toBe(true);
    expect(typeof resourcesRoute?.prerenderBodyHtml).toBe('string');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Free Pain Tracking Resources');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Free pain tracking resources by task');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/resources/daily-pain-tracker-printable');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/resources/chronic-pain-diary-template');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/resources/pain-scale-chart-printable');
    expect(resourcesRoute?.prerenderBodyHtml).toContain(
      '/resources/what-to-include-in-pain-journal'
    );
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/tracking-data-policy');
    expect(resourcesRoute?.prerenderBodyHtml).toContain('/download');
    expect(resourcesRoute?.prerenderBodyHtml).toContain(
      'Download the Free Pain Tracking Starter Pack ZIP'
    );
    expect(resourcesRoute?.prerenderBodyHtml).toContain('Choose the right pain tracker');
    expect(resourcesRoute?.prerenderBodyHtml).toContain(
      'How to start tracking pain without overthinking it'
    );
    expect(resourcesRoute?.prerenderBodyHtml).toContain('What is a pain tracker template?');
    expect(resourcesRoute?.prerenderBodyHtml).toContain(
      'PainTracker is built around local-first privacy.'
    );
    expect(
      resourcesRoute?.structuredData.some(
        (item: Record<string, unknown>) => item['@type'] === 'CollectionPage'
      )
    ).toBe(true);
    expect(
      resourcesRoute?.structuredData.some(
        (item: Record<string, unknown>) => item['@type'] === 'ItemList'
      )
    ).toBe(true);
  });

  it('covers every sitemap URL with unique prerender metadata', () => {
    const sitemapPaths = parseSitemapPaths(readUtf8('public/sitemap.xml'));
    const metadataPaths = publicRouteMetadata
      .map(route => route.path)
      .sort((left, right) => left.localeCompare(right));

    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
    expect(metadataPaths).toEqual(sitemapPaths);
    expect(sitemapPaths).not.toContain('/resources-query');

    for (const route of privateRouteMetadata) {
      expect(sitemapPaths).not.toContain(route.path);
    }

    for (const route of publicRouteMetadata) {
      expect(route.title.length).toBeGreaterThan(10);
      expect(route.description.length).toBeGreaterThan(20);
      expect(route.canonicalUrl).toBe(
        `https://www.paintracker.ca${route.path === '/' ? '/' : route.path}`
      );
      expect(Array.isArray(route.structuredData)).toBe(true);
      expect(route.structuredData.length).toBeGreaterThan(0);
    }
  });

  it('keeps private auth and protected entrypoints out of the index with dedicated HTML shells', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };

    for (const route of privateRouteMetadata) {
      expect(route.noindex).toBe(true);
      if (route.path === '/resources-query') {
        expect(route.canonicalUrl).toBe('https://www.paintracker.ca/resources');
      } else {
        expect(route.canonicalUrl).toBe(`https://www.paintracker.ca${route.path}`);
      }
    }

    expect(
      rewrites.some((entry: RewriteEntry) => entry.destination === '/clinic/login/index.html')
    ).toBe(true);
    expect(
      rewrites.some((entry: RewriteEntry) => entry.destination === '/app/checkin/index.html')
    ).toBe(true);
  });

  it('routes top-level prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };
    const topLevelRewrite = rewrites.find(
      (entry: RewriteEntry) => entry.destination === '/:route/index.html'
    );

    expect(topLevelRewrite).toBeDefined();
    if (!topLevelRewrite) throw new Error('Top-level rewrite not found');

    for (const slug of publicTopLevelPrerenderSlugs) {
      expect(topLevelRewrite.source).toContain(slug);
    }
  });

  it('routes resource prerendered pages to dedicated HTML files before SPA fallback', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };
    const resourceRewrite = rewrites.find(
      (entry: RewriteEntry) => entry.destination === '/resources/:slug/index.html'
    );

    expect(resourceRewrite).toBeDefined();
    if (!resourceRewrite) throw new Error('Resource rewrite not found');

    for (const slug of publicResourcePrerenderSlugs) {
      expect(resourceRewrite.source).toContain(slug);
    }
  });

  it('keeps crawl controls explicit for launch-facing public routes', () => {
    const robots = parseRobotsRules(readUtf8('public/robots.txt'));
    const sitemapPaths = parseSitemapPaths(readUtf8('public/sitemap.xml'));

    expect(robots.hasWildcardAgent).toBe(true);
    expect(robots.hasPublicAllow).toBe(true);
    expect(robots.hasResourcesAllow).toBe(true);
    expect(robots.hasAppDisallow).toBe(true);
    expect(robots.hasApiDisallow).toBe(true);
    expect(robots.hasSitemap).toBe(true);
    expect(robots.hasHost).toBe(true);

    expect(sitemapPaths).toContain('/');
    expect(sitemapPaths).toContain('/pricing');
    expect(sitemapPaths).toContain('/proof');
    expect(sitemapPaths).toContain('/providers/pmmp');
    expect(sitemapPaths).toContain('/resources');
    expect(sitemapPaths).not.toContain('/clinic');
    expect(sitemapPaths).not.toContain('/app');
    expect(sitemapPaths).not.toContain('/start');
  });

  it('ships the PMMP provider route as a crawlable nested prerendered page', () => {
    const { rewrites } = JSON.parse(readUtf8('vercel.json')) as { rewrites: RewriteEntry[] };
    const providerRoute = publicRouteMetadata.find(route => route.path === '/providers/pmmp');

    expect(providerRoute).toBeDefined();
    expect(providerRoute?.title).toContain('PMMP Provider Review');
    expect(providerRoute?.description).toContain('no clinic login');
    expect(providerRoute?.description).toContain('no EMR integration');
    expect(providerRoute?.canonicalUrl).toBe('https://www.paintracker.ca/providers/pmmp');
    expect(publicTopLevelPrerenderSlugs).not.toContain('providers/pmmp');
    expect(
      rewrites.some(
        (entry: RewriteEntry) =>
          entry.source === '/providers/pmmp' && entry.destination === '/providers/pmmp/index.html'
      )
    ).toBe(true);
  });

  it('keeps top resource metadata crawlable with canonical and prerendered heading shell', () => {
    const topResourceRoutes = publicRouteMetadata
      .filter(route => route.path.startsWith('/resources/'))
      .slice(0, 25);

    expect(topResourceRoutes.length).toBe(25);

    for (const route of topResourceRoutes) {
      expect(route.title.length).toBeGreaterThan(20);
      expect(route.description.length).toBeGreaterThan(40);
      expect(route.canonicalUrl).toBe(`https://www.paintracker.ca${route.path}`);
      expect(Array.isArray(route.structuredData)).toBe(true);
      expect(route.structuredData.length).toBeGreaterThan(0);

      if (typeof route.prerenderBodyHtml === 'string') {
        expect(route.prerenderBodyHtml).toContain('initial-route-heading');
      }
    }
  });

  it('ships an offline fallback page with user recovery guidance', () => {
    const offlineHtml = readUtf8('public/offline.html');

    expect(offlineHtml).toContain('<title>');
    expect(offlineHtml.toLowerCase()).toContain('offline');
    expect(offlineHtml.toLowerCase()).toContain('pain tracker');
    expect(offlineHtml).toContain('Retry');
  });

  it('keeps launch entry paths split between public home and protected app shell', () => {
    const appRoutesSource = readUtf8('src/App.tsx');
    const sitemapPaths = parseSitemapPaths(readUtf8('public/sitemap.xml'));

    expect(appRoutesSource).toContain('<Route path="/" element={<LandingPage />} />');
    expect(appRoutesSource).toMatch(/path="\/start"/);
    expect(appRoutesSource).toMatch(/path="\/app"/);
    expect(sitemapPaths).toContain('/');
    expect(sitemapPaths).not.toContain('/app');
  });
});

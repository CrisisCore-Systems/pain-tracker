import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicRouteMetadata, privateRouteMetadata } from '../../src/seo/publicRouteMetadata.js';

const SITE_URL = 'https://www.paintracker.ca';
const SITE_HOST = 'www.paintracker.ca';
const today = new Date().toISOString().slice(0, 10);
const publicDir = path.join(process.cwd(), 'public');
const distDir = path.join(process.cwd(), 'dist');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const scriptPath = fileURLToPath(import.meta.url);

const priorityOverrides = new Map([
  ['/', '1.0'],
  ['/pricing', '0.8'],
  ['/case-study', '0.7'],
  ['/proof', '0.6'],
  ['/download', '0.6'],
  ['/privacy', '0.4'],
  ['/privacy-architecture', '0.4'],
  ['/pain-tracker-app', '0.9'],
  ['/pain-tracking-app', '0.9'],
  ['/pain-management-tracker', '0.8'],
  ['/pain-locator-app', '0.8'],
  ['/share-pain-records-with-doctor-without-giving-an-app-your-data', '0.9'],
  ['/pain-diary-template', '0.9'],
  ['/pain-tracking-apps-comparison', '0.8'],
  ['/offline-pain-tracker-app', '0.8'],
  ['/privacy-offline-first-pain-tracker', '0.8'],
  ['/tracking-data-policy', '0.4'],
  ['/whitepaper', '0.5'],
  ['/overton-framework', '0.4'],
  ['/cnet-download', '0.3'],
  ['/demo', '0.7'],
  ['/submit-story', '0.5'],
  ['/resources', '0.9'],
  ['/resources/pain-diary-template-pdf', '0.9'],
]);

const changefreqOverrides = new Map([
  ['/', 'weekly'],
  ['/pricing', 'monthly'],
  ['/case-study', 'monthly'],
  ['/proof', 'monthly'],
  ['/download', 'monthly'],
  ['/privacy', 'yearly'],
  ['/privacy-architecture', 'yearly'],
  ['/tracking-data-policy', 'yearly'],
  ['/whitepaper', 'monthly'],
  ['/overton-framework', 'yearly'],
  ['/demo', 'monthly'],
  ['/submit-story', 'monthly'],
  ['/resources', 'weekly'],
]);

const lastmodOverrides = new Map([
  ['/resources', today],
]);

const imageOverrides = new Map([
  ['/', [
    {
      loc: `${SITE_URL}/og-image.png`,
      title: 'Pain Tracker - Private Offline-First Pain Tracking App',
      caption: 'Comprehensive pain tracking application for medical documentation and disability claims',
    },
    {
      loc: `${SITE_URL}/main-dashboard.png`,
      title: 'Pain Tracker Dashboard',
      caption: 'Main dashboard showing pain trends and analytics',
    },
  ]],
]);

export function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function readExistingLastmods(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const xml = fs.readFileSync(filePath, 'utf8');
  const matches = [...xml.matchAll(/<url>\s*<loc>https:\/\/www\.paintracker\.ca([^<]*)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];
  return new Map(matches.map((match) => [match[1] || '/', match[2]]));
}

export function deriveChangefreq(routePath) {
  if (changefreqOverrides.has(routePath)) {
    return changefreqOverrides.get(routePath);
  }

  if (routePath.startsWith('/resources/')) {
    return 'monthly';
  }

  return 'weekly';
}

export function derivePriority(routePath) {
  if (priorityOverrides.has(routePath)) {
    return priorityOverrides.get(routePath);
  }

  if (routePath.startsWith('/resources/')) {
    return '0.8';
  }

  return '0.7';
}

export function deriveLastmod(routePath, existingLastmods) {
  return lastmodOverrides.get(routePath) ?? existingLastmods.get(routePath) ?? today;
}

export function createUrlNode(route, existingLastmods) {
  const canonical = route.canonicalUrl;
  const canonicalUrl = new URL(canonical);

  if (canonicalUrl.host !== SITE_HOST) {
    throw new Error(`Sitemap route ${route.path} has non-canonical host: ${canonical}`);
  }

  const routePath = route.path;
  const images = imageOverrides.get(routePath) ?? [];

  const imageXml = images.map((image) => `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
      <image:caption>${escapeXml(image.caption)}</image:caption>
    </image:image>`).join('');

  return `  <url>
    <loc>${escapeXml(canonical)}</loc>
    <lastmod>${escapeXml(deriveLastmod(routePath, existingLastmods))}</lastmod>
    <changefreq>${escapeXml(deriveChangefreq(routePath))}</changefreq>
    <priority>${escapeXml(derivePriority(routePath))}</priority>${imageXml}
  </url>`;
}

export function buildSitemapXml(routes, existingLastmods = new Map()) {
  const seenLocs = new Set();
  const seenPaths = new Set();
  const urlNodes = routes.map((route) => {
    if (route.noindex) {
      throw new Error(`Public sitemap cannot include noindex route: ${route.path}`);
    }

    if (seenPaths.has(route.path)) {
      throw new Error(`Duplicate sitemap path detected: ${route.path}`);
    }

    if (seenLocs.has(route.canonicalUrl)) {
      throw new Error(`Duplicate sitemap canonical URL detected: ${route.canonicalUrl}`);
    }

    seenPaths.add(route.path);
    seenLocs.add(route.canonicalUrl);
    return createUrlNode(route, existingLastmods);
  });

  const privatePaths = new Set(privateRouteMetadata.map((route) => route.path));
  for (const privatePath of privatePaths) {
    if (seenPaths.has(privatePath)) {
      throw new Error(`Private/noindex path leaked into sitemap: ${privatePath}`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlNodes.join('\n')}
</urlset>
`;
}

export function generateSitemapXml(existingLastmods = readExistingLastmods(sitemapPath)) {
  return buildSitemapXml(publicRouteMetadata, existingLastmods);
}

export function writeSitemapFiles(xml) {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
  }
}

function isDirectExecution() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === path.resolve(scriptPath);
}

if (isDirectExecution()) {
  const sitemapXml = generateSitemapXml();
  writeSitemapFiles(sitemapXml);
  console.log(`Generated sitemap.xml with ${publicRouteMetadata.length} public routes.`);
}
import fs from 'node:fs';
import path from 'node:path';
import { generateSitemapXml } from './generate-sitemap.mjs';

const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  throw new Error('public/sitemap.xml is missing. Run "npm run seo:generate-sitemap" and commit the result.');
}

const existingXml = fs.readFileSync(sitemapPath, 'utf8');
const expectedXml = generateSitemapXml();

if (existingXml !== expectedXml) {
  throw new Error('public/sitemap.xml is out of sync with route metadata. Run "npm run seo:generate-sitemap" and commit the updated sitemap.');
}

console.log('public/sitemap.xml matches generated route metadata output.');
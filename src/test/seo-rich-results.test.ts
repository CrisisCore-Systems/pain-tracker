import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicRouteMetadataByPath } from '../seo/publicRouteMetadata.js';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('SEO rich-result coverage', () => {
  it('adds FAQ schema to the landing page from the visible FAQ content', () => {
    const landingPage = readUtf8('pages/LandingPage.tsx');
    const landingFaq = readUtf8('components/landing/FAQ.tsx');
    const homeRoute = publicRouteMetadataByPath.get('/');

    expect(landingPage).toContain('generateFAQSchema');
    expect(landingPage).toContain('landingFaqs');
    expect(landingFaq).toContain('export const landingFaqs');
    expect(homeRoute?.structuredData.some((item) => item['@type'] === 'FAQPage')).toBe(false);
  });

  it('keeps breadcrumb and FAQ markup on the download page', () => {
    const downloadPage = readUtf8('pages/DownloadPage.tsx');

    expect(downloadPage).toContain('generateBreadcrumbSchema');
    expect(downloadPage).toContain('generateFAQSchema');
    expect(downloadPage).toContain('aria-label="Breadcrumb"');
    expect(downloadPage).toContain('Download FAQs');
  });
});
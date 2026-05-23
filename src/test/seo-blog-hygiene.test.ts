import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('Blog SEO hygiene', () => {
  it('noindexes blog utility archive pages', () => {
    const tagPage = readUtf8('packages/blog/src/app/tag/[slug]/page.tsx');
    const featuresPage = readUtf8('packages/blog/src/app/features/page.tsx');
    const useCasesPage = readUtf8('packages/blog/src/app/use-cases/page.tsx');

    for (const content of [tagPage, featuresPage, useCasesPage]) {
      expect(content).toContain('index: false');
      expect(content).toContain('follow: true');
    }
  });

  it('keeps utility archives out of the blog sitemap', () => {
    const sitemap = readUtf8('packages/blog/src/app/sitemap.ts');

    expect(sitemap).not.toContain('/features/${slug}');
    expect(sitemap).not.toContain('/use-cases/${slug}');
    expect(sitemap).not.toContain('featureEntries');
    expect(sitemap).not.toContain('useCaseEntries');
  });
});
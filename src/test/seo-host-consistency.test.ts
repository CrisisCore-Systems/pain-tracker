import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type TargetFile = {
  filePath: string;
  mustContain?: string[];
  mustNotContain?: string[];
};

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

const APEX = 'https://paintracker.ca';
const WWW = 'https://www.paintracker.ca';

describe('SEO host consistency (www is canonical)', () => {
  const targets: TargetFile[] = [
    {
      filePath: 'index.html',
      mustContain: [WWW],
      mustNotContain: [APEX],
    },
    {
      filePath: 'public/robots.txt',
      mustContain: [`Sitemap: ${WWW}/sitemap.xml`, 'Host: www.paintracker.ca'],
      mustNotContain: [APEX],
    },
    {
      filePath: 'public/sitemap.xml',
      mustContain: [WWW],
      mustNotContain: [APEX],
    },
    {
      filePath: 'src/lib/seo.ts',
      mustContain: [WWW],
      mustNotContain: [APEX],
    },
    {
      filePath: 'src/components/seo/CanonicalUrlManager.tsx',
      mustContain: [WWW],
      mustNotContain: [APEX],
    },
  ];

  for (const target of targets) {
    it(`${target.filePath} uses www and not apex`, () => {
      const content = readUtf8(target.filePath);

      for (const needle of target.mustContain ?? []) {
        expect(content, `Expected ${target.filePath} to contain: ${needle}`).toContain(needle);
      }

      for (const needle of target.mustNotContain ?? []) {
        expect(content, `Expected ${target.filePath} to NOT contain: ${needle}`).not.toContain(needle);
      }
    });
  }
});

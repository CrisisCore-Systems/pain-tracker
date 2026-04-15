import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('SEO entrypoint consistency', () => {
  it('keeps shared blog CTAs pointed at the chosen /start app entrypoint', () => {
    const linkingMap = readUtf8('packages/blog/src/data/articles/linking-map.ts');

    expect(linkingMap).toContain("APP_CTA_URL = 'https://www.paintracker.ca/start'");
    expect(linkingMap).not.toContain("APP_CTA_URL = 'https://www.paintracker.ca/download'");
  });

  it('keeps the download page web and install CTAs aligned to the same app entrypoint', () => {
    const downloadPage = readUtf8('src/pages/DownloadPage.tsx');

    expect(downloadPage).toContain('href="https://www.paintracker.ca/start"');
    expect(downloadPage).toContain('href={defaultSEOConfig.appUrl}');
    expect(downloadPage).not.toContain('href="https://www.paintracker.ca/"');
  });
});
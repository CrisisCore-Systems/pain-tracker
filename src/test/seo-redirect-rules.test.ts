import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('SEO redirect rules consistency', () => {
  it('root vercel redirects apex /blog directly to blog subdomain', () => {
    const vercelConfig = readUtf8('vercel.json');

    expect(vercelConfig).toContain('"source": "/blog/:path*"');
    expect(vercelConfig).toContain('"value": "paintracker.ca"');
    expect(vercelConfig).toContain('"destination": "https://blog.paintracker.ca/:path*"');
    expect(vercelConfig).toContain('"source": "/blog"');
    expect(vercelConfig).toContain('"destination": "https://blog.paintracker.ca/"');
  });

  it('blog next config serves /start-here via rewrite (not redirect)', () => {
    const blogNextConfig = readUtf8('packages/blog/next.config.js');

    expect(blogNextConfig).toContain("source: '/start-here'");
    expect(blogNextConfig).toContain("destination: '/page/start-here'");
    expect(blogNextConfig).toContain('async redirects() {');
    expect(blogNextConfig).toContain('return [];');
  });
});

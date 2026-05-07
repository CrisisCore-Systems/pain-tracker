import { describe, expect, it } from 'vitest';
import { buildSitemapXml, deriveChangefreq, derivePriority } from '../../scripts/seo/generate-sitemap.mjs';

describe('SEO sitemap generator', () => {
  it('applies explicit priority overrides and resource defaults', () => {
    expect(derivePriority('/resources/pain-diary-template-pdf')).toBe('0.9');
    expect(derivePriority('/resources/how-to-start-a-pain-journal')).toBe('0.8');
    expect(derivePriority('/submit-story')).toBe('0.5');
    expect(derivePriority('/some-other-page')).toBe('0.7');
  });

  it('applies explicit changefreq overrides and resource defaults', () => {
    expect(deriveChangefreq('/resources')).toBe('weekly');
    expect(deriveChangefreq('/resources/how-to-start-a-pain-journal')).toBe('monthly');
    expect(deriveChangefreq('/privacy')).toBe('yearly');
    expect(deriveChangefreq('/some-other-page')).toBe('weekly');
  });

  it('allows the intentional /resources-query canonical overlap but blocks leaked private paths', () => {
    const existingLastmods = new Map([
      ['/resources', '2026-02-11'],
    ]);

    expect(() => buildSitemapXml([
      {
        path: '/resources',
        canonicalUrl: 'https://www.paintracker.ca/resources',
      },
    ], existingLastmods)).not.toThrow();

    expect(() => buildSitemapXml([
      {
        path: '/resources-query',
        canonicalUrl: 'https://www.paintracker.ca/resources',
      },
    ], existingLastmods)).toThrow('Private/noindex path leaked into sitemap: /resources-query');
  });
});
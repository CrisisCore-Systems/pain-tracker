import { describe, expect, it } from 'vitest';
import {
  buildSitemapXml,
  deriveChangefreq,
  deriveLastmod,
  derivePriority,
} from '../../scripts/seo/generate-sitemap.mjs';

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

  it('uses route-level lastmod overrides before existing sitemap lastmods', () => {
    const existingLastmods = new Map([['/resources', '2026-02-11']]);

    expect(deriveLastmod('/resources', existingLastmods, { lastmod: '2026-06-15' })).toBe(
      '2026-06-15'
    );
  });

  it('preserves committed lastmod values instead of stamping routes with the current date', () => {
    const existingLastmods = new Map([['/resources', '2026-02-11']]);

    expect(deriveLastmod('/resources', existingLastmods)).toBe('2026-02-11');
  });

  it('allows the intentional /resources-query canonical overlap but blocks leaked private paths', () => {
    const existingLastmods = new Map([['/resources', '2026-02-11']]);

    expect(() =>
      buildSitemapXml(
        [
          {
            path: '/resources',
            canonicalUrl: 'https://www.paintracker.ca/resources',
          },
        ],
        existingLastmods
      )
    ).not.toThrow();

    expect(() =>
      buildSitemapXml(
        [
          {
            path: '/resources-query',
            canonicalUrl: 'https://www.paintracker.ca/resources',
          },
        ],
        existingLastmods
      )
    ).toThrow('Private/noindex path leaked into sitemap: /resources-query');
  });
});

import { describe, expect, it } from 'vitest';
import { generateWebSiteSchema } from '../lib/seo';
import { shouldNoindexRoute, toCanonicalUrl } from '../components/seo/CanonicalUrlManager';

describe('SEO query-state behavior', () => {
  it('does not advertise a site search entry point for resources query pages', () => {
    const schema = generateWebSiteSchema() as Record<string, unknown>;

    expect(schema.potentialAction).toBeUndefined();
  });

  it('keeps /resources canonical even when query-state exists', () => {
    expect(toCanonicalUrl('/resources')).toBe('https://www.paintracker.ca/resources');
  });

  it('marks parameterized resources pages as non-indexable', () => {
    expect(shouldNoindexRoute('/resources', '?q=pain+log')).toBe(true);
    expect(shouldNoindexRoute('/resources', '')).toBe(false);
    expect(shouldNoindexRoute('/pricing', '?ref=seo')).toBe(false);
  });
});

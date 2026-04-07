import { describe, expect, it } from 'vitest';

import { generateWebSiteSchema } from '../lib/seo';

describe('SEO schema hygiene', () => {
  it('does not publish a search template URL placeholder', () => {
    const schema = generateWebSiteSchema() as Record<string, unknown>;

    expect(schema).not.toHaveProperty('potentialAction');
  });
});
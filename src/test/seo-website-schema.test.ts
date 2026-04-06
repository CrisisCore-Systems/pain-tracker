import { describe, expect, it } from 'vitest';
import { generateWebSiteSchema } from '../lib/seo';

describe('generateWebSiteSchema', () => {
  it('does not advertise the resources search query as a crawlable search action', () => {
    const schema = generateWebSiteSchema() as Record<string, unknown>;

    expect(schema.potentialAction).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain('/resources?q={search_term_string}');
  });
});

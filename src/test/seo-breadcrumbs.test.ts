import { describe, expect, it } from 'vitest';
import { generateBreadcrumbSchema } from '../lib/seo';

describe('generateBreadcrumbSchema', () => {
  it('normalizes relative breadcrumb URLs to absolute @id URLs', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Resources', url: '/resources' },
      { name: 'What to Include', url: '/resources/what-to-include-in-pain-journal' },
    ]) as any;

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);

    const ids = schema.itemListElement.map((li: any) => li.item['@id']);
    expect(ids[0]).toBe('https://www.paintracker.ca/');
    expect(ids[1]).toBe('https://www.paintracker.ca/resources');
    expect(ids[2]).toBe('https://www.paintracker.ca/resources/what-to-include-in-pain-journal');
  });

  it('supports a siteUrl override for absolute @id URLs', () => {
    const schema = generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    ) as any;

    const ids = schema.itemListElement.map((li: any) => li.item['@id']);
    expect(ids[0]).toBe('https://www.paintracker.ca/');
    expect(ids[1]).toBe('https://www.paintracker.ca/resources');
  });

  it('leaves absolute URLs as-is', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://www.paintracker.ca/' },
      { name: 'Resources', url: 'https://www.paintracker.ca/resources' },
    ]) as any;

    const ids = schema.itemListElement.map((li: any) => li.item['@id']);
    expect(ids[0]).toBe('https://www.paintracker.ca/');
    expect(ids[1]).toBe('https://www.paintracker.ca/resources');
  });
});

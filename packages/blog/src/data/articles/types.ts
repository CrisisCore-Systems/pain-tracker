/**
 * Shared types for SEO article definitions.
 *
 * Schema rules:
 *   - Pillar & supporting articles → Article (+ FAQPage where noted)
 *   - Use-case / utility pages     → WebPage + FAQPage
 *   - Trust / transparency pages   → WebPage
 *   - Getting started              → HowTo + FAQPage
 */

export type SchemaType = 'Article' | 'FAQPage' | 'WebPage' | 'HowTo';

export interface ArticleSection {
  h2: string;
  paragraphs: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

/**
 * Cross-domain internal linking for subdomain SEO architecture.
 *
 * Every blog article on blog.paintracker.ca must include exactly 3 outbound links:
 *   1. Contextual link to an assigned root-domain pillar page (mid-article)
 *   2. Related blog article link (preserves topical clustering)
 *   3. App CTA link (rendered in the CTA block)
 *
 * See docs/seo/SUBDOMAIN_LINKING_ARCHITECTURE.md for the full specification.
 */
export interface InternalLinks {
  /** Absolute URL of the root-domain pillar page this article feeds authority to */
  pillarUrl: string;
  /** Human-readable label for the pillar link (used as anchor text) */
  pillarLabel: string;
  /** Slug of a related blog article on blog.paintracker.ca */
  relatedSlug: string;
}

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  cluster: string;
  isPillar: boolean;
  schemaTypes: SchemaType[];
  sections: ArticleSection[];
  faqs?: FAQ[];
  howToSteps?: HowToStep[];
  /** Cross-domain + internal linking directives (required for SEO) */
  internalLinks?: InternalLinks;
}

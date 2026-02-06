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
}

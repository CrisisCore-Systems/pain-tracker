/**
 * JSON-LD structured data helpers for SEO.
 *
 * Inject these into page <head> via Next.js <Script> or a <script> tag
 * to improve search result appearance (rich snippets, knowledge panels).
 *
 * References:
 *   - https://schema.org/SoftwareApplication
 *   - https://schema.org/Organization
 *   - https://schema.org/FAQPage
 */

import { siteConfig } from './utils';

// ── Site-wide schemas (inject once in layout.tsx) ─────────────────────

/**
 * Organization schema — tells Google who publishes the site.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CrisisCore Systems',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.twitter,
    ],
    description:
      'Building privacy-first, trauma-informed health technology for the chronic pain community.',
  };
}

/**
 * SoftwareApplication schema — describes Pain Tracker as a product.
 */
export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pain Tracker',
    url: `${siteConfig.url}/app`,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description:
      'A privacy-first, offline-capable chronic pain tracking app with clinical-grade exports, built for autonomy and psychological safety.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
    },
    featureList: [
      'Offline-first architecture',
      'End-to-end encryption',
      'WorkSafeBC export templates',
      'WCAG 2.2 AA accessibility',
      'Trauma-informed UX',
      'Local-only analytics',
    ],
    author: {
      '@type': 'Organization',
      name: 'CrisisCore Systems',
      url: siteConfig.url,
    },
  };
}

/**
 * WebSite schema — enables sitelinks search box in Google results.
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: 'CrisisCore Systems',
    },
  };
}

// ── Per-page helpers ──────────────────────────────────────────────────

/**
 * FAQPage schema — for pages with question/answer content.
 *
 * @param faqs - Array of { question, answer } pairs.
 */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList schema — breadcrumb navigation for a page.
 *
 * @param items - Array of { name, url } pairs in order.
 */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── React helper ──────────────────────────────────────────────────────

/**
 * Renders one or more JSON-LD schemas as a <script> tag.
 *
 * Usage in a Server Component:
 *   <JsonLd data={organizationJsonLd()} />
 *   <JsonLd data={[organizationJsonLd(), softwareApplicationJsonLd()]} />
 */
export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(Array.isArray(data) ? data : data);
}

/**
 * SEO Utilities for Pain Tracker
 * Generates structured data and meta tags for SEO-optimized pages
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

function normalizeToAbsoluteUrl(url: string, siteUrl: string): string {
  const rawUrl = (url ?? '').trim();
  const rawSiteUrl = (siteUrl ?? '').trim();
  const normalizedSiteUrl = /^https?:\/\//i.test(rawSiteUrl)
    ? rawSiteUrl
    : `https://${rawSiteUrl}`;

  try {
    return new URL(rawUrl, normalizedSiteUrl).toString().trim();
  } catch {
    // If it's already absolute, keep it.
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

    // Best-effort absolute fallback (avoid returning a relative URL in schema).
    const base = normalizedSiteUrl.replace(/\/$/, '');
    if (rawUrl.startsWith('/')) return `${base}${rawUrl}`;
    if (rawUrl.length > 0) return `${base}/${rawUrl}`;

    // Last resort: site root.
    return `${base}/`;
  }
}

/**
 * Generate MedicalWebPage structured data (JSON-LD)
 */
export function generateMedicalWebPageSchema(metadata: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: metadata.name,
    description: metadata.description,
    url: metadata.url,
    datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
    dateModified: metadata.dateModified || new Date().toISOString().split('T')[0],
    keywords: metadata.keywords?.join(', '),
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: 18,
      healthCondition: {
        '@type': 'MedicalCondition',
        name: 'Chronic Pain'
      }
    },
    specialty: {
      '@type': 'MedicalSpecialty',
      name: 'Pain Management'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pain Tracker Pro',
      url: 'https://www.paintracker.ca',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.paintracker.ca/og-image.png'
      }
    },
    inLanguage: 'en-CA',
    isAccessibleForFree: true
  };
}

/**
 * Generate FAQ structured data (JSON-LD)
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate SoftwareApplication structured data (JSON-LD)
 */
export function generateSoftwareApplicationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pain Tracker Pro',
    description: 'Privacy-first chronic pain tracking application for medical documentation and disability claims',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock'
    },
    featureList: [
      'Privacy-first local storage',
      'No cloud dependency',
      'Medical-grade exports',
      'WorkSafeBC compatible',
      'Disability documentation',
      'Pain scale tracking',
      'Symptom logging',
      'Medication tracking'
    ],
    screenshot: 'https://www.paintracker.ca/main-dashboard.png',
    softwareVersion: '1.0.0',
    creator: {
      '@type': 'Organization',
      name: 'Pain Tracker Pro'
    }
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  opts?: { siteUrl?: string }
): object {
  const siteUrl = opts?.siteUrl ?? defaultSEOConfig.siteUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: normalizeToAbsoluteUrl(item.url, siteUrl)
    }))
  };
}

/**
 * Generate Article structured data (JSON-LD)
 */
export function generateArticleSchema(metadata: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
}): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': metadata.url
    },
    headline: metadata.headline,
    description: metadata.description,
    url: metadata.url,
    author: {
      '@type': 'Organization',
      name: defaultSEOConfig.siteName,
      url: defaultSEOConfig.siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: defaultSEOConfig.siteName,
      url: defaultSEOConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: defaultSEOConfig.defaultImage
      }
    },
    image: metadata.imageUrl ?? defaultSEOConfig.defaultImage
  };

  if (metadata.datePublished) schema.datePublished = metadata.datePublished;
  if (metadata.dateModified) schema.dateModified = metadata.dateModified;

  return schema;
}

/**
 * Generate HowTo structured data (JSON-LD) for step-by-step guides
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  totalTime?: string;
  steps: Array<{ name: string; text: string; image?: string }>;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    totalTime: data.totalTime,
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image
    }))
  };
}

/**
 * Combine multiple schema objects into a single JSON-LD script
 */
export function combineSchemas(...schemas: object[]): string {
  if (schemas.length === 1) {
    return JSON.stringify(schemas[0]);
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      // Remove @context from individual schemas when combining
      const { '@context': _, ...rest } = schema as Record<string, unknown>;
      return rest;
    })
  });
}

/**
 * Generate Organization structured data (JSON-LD)
 * Helps establish brand identity in search results
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pain Tracker Pro',
    alternateName: 'PainTracker',
    url: 'https://www.paintracker.ca',
    logo: 'https://www.paintracker.ca/og-image.png',
    description: 'Privacy-first chronic pain tracking application for medical documentation and disability claims. No cloud dependency, no account required.',
    foundingDate: '2024',
    knowsAbout: [
      'Chronic Pain Management',
      'Pain Tracking',
      'Medical Documentation',
      'WorkSafeBC Claims',
      'Disability Documentation',
      'Privacy-First Healthcare Applications'
    ],
    sameAs: [
      'https://github.com/CrisisCore-Systems/pain-tracker'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'French']
    }
  };
}

/**
 * Generate WebSite structured data (JSON-LD)
 * Enables sitelinks search box and better site indexing
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pain Tracker Pro',
    alternateName: 'PainTracker',
    url: 'https://www.paintracker.ca',
    description: 'Privacy-first chronic pain tracking application. Track symptoms, generate medical reports, and document for disability claims without cloud dependency.',
    inLanguage: 'en-CA',
    publisher: {
      '@type': 'Organization',
      name: 'Pain Tracker Pro',
      url: 'https://www.paintracker.ca'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.paintracker.ca/resources?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Default SEO configuration for the site
 */
export const defaultSEOConfig = {
  siteName: 'Pain Tracker Pro',
  siteUrl: 'https://www.paintracker.ca',
  defaultTitle: 'Pain Tracker Pro - Privacy-First Pain Tracking',
  defaultDescription: 'Track and manage your chronic pain with our privacy-first, offline-capable pain tracking application. Medical-grade exports for doctors and disability claims.',
  defaultImage: 'https://www.paintracker.ca/og-image.png',
  twitterHandle: '@paintrackerpro',
  locale: 'en_CA'
};

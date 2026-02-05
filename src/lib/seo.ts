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
      url: 'https://paintracker.ca',
      logo: {
        '@type': 'ImageObject',
        url: 'https://paintracker.ca/og-image.png'
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
    screenshot: 'https://paintracker.ca/main-dashboard.png',
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
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
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
 * Default SEO configuration for the site
 */
export const defaultSEOConfig = {
  siteName: 'Pain Tracker Pro',
  siteUrl: 'https://paintracker.ca',
  defaultTitle: 'Pain Tracker Pro - Privacy-First Pain Tracking',
  defaultDescription: 'Track and manage your chronic pain with our privacy-first, offline-capable pain tracking application. Medical-grade exports for doctors and disability claims.',
  defaultImage: 'https://paintracker.ca/og-image.png',
  twitterHandle: '@paintrackerpro',
  locale: 'en_CA'
};

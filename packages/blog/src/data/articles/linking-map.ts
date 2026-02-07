/**
 * Centralized cross-domain linking map for subdomain SEO architecture.
 *
 * Architecture: blog.paintracker.ca → paintracker.ca
 *
 * Every blog article gets exactly 3 outbound links:
 *   1. Contextual pillar link → root domain (authority transfer)
 *   2. Related article link → blog subdomain (topical clustering)
 *   3. App CTA → root domain (rendered by page component)
 *
 * @see docs/seo/SUBDOMAIN_LINKING_ARCHITECTURE.md
 */

import type { InternalLinks } from './types';

// ── Root-domain pillar URLs ──────────────────────────────────────────

export const PILLAR_URLS = {
  offline: 'https://paintracker.ca/offline-pain-diary',
  privacy: 'https://paintracker.ca/private-pain-tracker',
  clinical: 'https://paintracker.ca/pain-log-for-doctors',
  chronic: 'https://paintracker.ca/track-chronic-pain-symptoms',
} as const;

export const PILLAR_LABELS = {
  offline: 'Offline Pain Diary',
  privacy: 'Private Pain Tracker',
  clinical: 'Pain Log for Doctors',
  chronic: 'Track Chronic Pain Symptoms',
} as const;

export const APP_CTA_URL = 'https://paintracker.ca/app';

// ── Per-article linking directives ───────────────────────────────────

export const linkingMap: Record<string, InternalLinks> = {
  // ── Pillar articles (link to their root-domain counterpart) ────────
  'offline-pain-diary': {
    pillarUrl: PILLAR_URLS.offline,
    pillarLabel: PILLAR_LABELS.offline,
    relatedSlug: 'cloud-vs-local-pain-tracking',
  },
  'private-pain-tracker': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'encrypted-health-data-safety',
  },
  'pain-log-for-doctors': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'what-doctors-look-for-symptom-journals',
  },
  'track-chronic-pain-symptoms': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'pain-tracking-fibromyalgia',
  },

  // ── Privacy / Offline cluster → Offline pillar ─────────────────────
  'cloud-vs-local-pain-tracking': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'why-offline-health-apps-matter',
  },
  'why-offline-health-apps-matter': {
    pillarUrl: PILLAR_URLS.offline,
    pillarLabel: PILLAR_LABELS.offline,
    relatedSlug: 'cloud-vs-local-pain-tracking',
  },
  'zero-cloud-medical-privacy': {
    pillarUrl: PILLAR_URLS.offline,
    pillarLabel: PILLAR_LABELS.offline,
    relatedSlug: 'encrypted-health-data-safety',
  },
  'pain-diary-template': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'export-pain-logs-pdf',
  },

  // ── Privacy / Security cluster → Privacy pillar ────────────────────
  'encrypted-health-data-safety': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'local-only-encryption-explained',
  },
  'local-only-encryption-explained': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'encrypted-health-data-safety',
  },
  'health-data-threat-model': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'security-architecture',
  },
  'security-architecture': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'health-data-threat-model',
  },
  'why-paintracker-is-open-source': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'security-architecture',
  },

  // ── Clinical / Documentation cluster → Clinical pillar ─────────────
  'can-doctors-trust-offline-diaries': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'what-doctors-look-for-symptom-journals',
  },
  'what-doctors-look-for-symptom-journals': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'can-doctors-trust-offline-diaries',
  },
  'export-pain-logs-pdf': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'pain-diary-template',
  },
  'pain-tracking-insurance-evidence': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'paintracker-worksafebc-claims',
  },
  'paintracker-worksafebc-claims': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'pain-tracking-insurance-evidence',
  },
  'how-detailed-pain-diary': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'what-doctors-look-for-symptom-journals',
  },
  'preparing-physiotherapy-pain-logs': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'export-pain-logs-pdf',
  },
  'sharing-symptom-data-safely': {
    pillarUrl: PILLAR_URLS.clinical,
    pillarLabel: PILLAR_LABELS.clinical,
    relatedSlug: 'can-doctors-trust-offline-diaries',
  },

  // ── Chronic Conditions cluster → Chronic pillar ────────────────────
  'pain-tracking-fibromyalgia': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'migraine-symptom-diary',
  },
  'migraine-symptom-diary': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'pain-tracking-fibromyalgia',
  },
  'tracking-flare-ups-chronic-illness': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'identifying-pain-triggers',
  },
  'identifying-pain-triggers': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'tracking-flare-ups-chronic-illness',
  },
  'tracking-recovery-after-injury': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'tracking-flare-ups-chronic-illness',
  },

  // ── Comparison cluster → Privacy pillar ────────────────────────────
  'paper-vs-app-pain-diary': {
    pillarUrl: PILLAR_URLS.offline,
    pillarLabel: PILLAR_LABELS.offline,
    relatedSlug: 'why-offline-health-apps-matter',
  },
  'best-pain-tracking-apps': {
    pillarUrl: PILLAR_URLS.privacy,
    pillarLabel: PILLAR_LABELS.privacy,
    relatedSlug: 'paper-vs-app-pain-diary',
  },

  // ── Transparency cluster → Privacy pillar ──────────────────────────
  'accessibility-in-pain-tracking': {
    pillarUrl: PILLAR_URLS.chronic,
    pillarLabel: PILLAR_LABELS.chronic,
    relatedSlug: 'best-pain-tracking-apps',
  },

  // ── Utility cluster → Offline pillar ───────────────────────────────
  'getting-started': {
    pillarUrl: PILLAR_URLS.offline,
    pillarLabel: PILLAR_LABELS.offline,
    relatedSlug: 'how-detailed-pain-diary',
  },
};

/**
 * Get internal links for a given article slug.
 * Returns undefined if no linking directive exists (should not happen for published articles).
 */
export function getLinksForArticle(slug: string): InternalLinks | undefined {
  return linkingMap[slug];
}

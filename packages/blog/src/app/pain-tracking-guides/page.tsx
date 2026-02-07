import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { articles, PILLAR_URLS, PILLAR_LABELS, APP_CTA_URL } from '@/data/articles';
import { breadcrumbJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Pain Tracking Guides — Complete Resource Library',
  description:
    'Browse all pain tracking guides: offline diaries, privacy-first tracking, clinical documentation, chronic pain management, and more. Free, evidence-based resources.',
  openGraph: {
    title: 'Pain Tracking Guides — Complete Resource Library',
    description:
      'Browse all pain tracking guides: offline diaries, privacy-first tracking, clinical documentation, chronic pain management, and more.',
    url: `${siteConfig.url}/pain-tracking-guides`,
    type: 'website',
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/pain-tracking-guides`,
  },
};

// ── Cluster groupings ────────────────────────────────────────────────

const clusters = [
  {
    id: 'pillar',
    label: 'Pillar Guides',
    description: 'Comprehensive guides covering the core areas of pain tracking.',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    description: 'How local-only architecture protects your health data.',
  },
  {
    id: 'clinical',
    label: 'Clinical Documentation',
    description: 'Prepare structured symptom data for doctors, specialists, and claims.',
  },
  {
    id: 'chronic',
    label: 'Chronic Conditions',
    description: 'Condition-specific tracking strategies for fibromyalgia, migraines, and more.',
  },
  {
    id: 'comparison',
    label: 'Comparisons',
    description: 'How PainTracker compares to other approaches and apps.',
  },
  {
    id: 'transparency',
    label: 'Transparency & Trust',
    description: 'Architecture decisions, open source values, and accessibility.',
  },
  {
    id: 'utility',
    label: 'Getting Started & Resources',
    description: 'Practical guides to begin tracking and share data safely.',
  },
] as const;

// ── Pillar cards (prominent cross-domain links) ─────────────────────

const pillarCards = [
  {
    title: PILLAR_LABELS.offline,
    description: 'Track symptoms privately on your device with no cloud dependency.',
    url: PILLAR_URLS.offline,
    icon: '📱',
  },
  {
    title: PILLAR_LABELS.privacy,
    description: 'Encrypted, local-only health data that never leaves your control.',
    url: PILLAR_URLS.privacy,
    icon: '🔒',
  },
  {
    title: PILLAR_LABELS.clinical,
    description: 'Clinical-grade exports for doctors, specialists, and WorkSafeBC claims.',
    url: PILLAR_URLS.clinical,
    icon: '🩺',
  },
  {
    title: PILLAR_LABELS.chronic,
    description: 'Multi-symptom tracking for fibromyalgia, migraines, and chronic illness.',
    url: PILLAR_URLS.chronic,
    icon: '📊',
  },
];

export default function PainTrackingGuidesPage() {
  return (
    <>
      {/* JSON-LD breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Pain Tracking Guides', url: `${siteConfig.url}/pain-tracking-guides` },
            ]),
          ),
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-700 dark:text-gray-200">Pain Tracking Guides</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Complete Pain Tracking Guides
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Evidence-based resources for tracking chronic pain, protecting your health data, 
            and preparing clinical documentation. All free. All private.
          </p>
        </div>

        {/* ── Pillar highlight cards (cross-domain authority bridge) ──── */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Core Guides
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {pillarCards.map((card) => (
              <a
                key={card.url}
                href={card.url}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-600"
              >
                <div className="mb-3 text-3xl" aria-hidden="true">
                  {card.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  Read guide
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Article listings by cluster ─────────────────────────────── */}
        {clusters.map((cluster) => {
          const clusterArticles = articles.filter((a) => a.cluster === cluster.id);
          if (clusterArticles.length === 0) return null;

          return (
            <section key={cluster.id} className="mb-12">
              <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                {cluster.label}
              </h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {cluster.description}
              </p>
              <ul className="space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
                {clusterArticles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/${article.slug}`}
                      className="group flex items-start gap-2"
                    >
                      {article.isPillar && (
                        <span className="mt-0.5 shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Pillar
                        </span>
                      )}
                      <div>
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {article.title}
                        </span>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {article.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* ── Bottom CTA ─────────────────────────────────────────────── */}
        <div className="mt-16 rounded-xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-900/30">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Ready to start tracking?
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            PainTracker is free, private, and works offline. No sign-up required.
          </p>
          <a
            href={APP_CTA_URL}
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            Open PainTracker
          </a>
        </div>
      </main>
    </>
  );
}

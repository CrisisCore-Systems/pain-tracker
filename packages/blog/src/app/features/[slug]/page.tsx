import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/schema';

/**
 * Feature detail data — keyed by slug.
 *
 * In a real CMS-backed setup you'd fetch this from Hashnode / MDX / DB.
 * For now we keep it co-located so the page is fully SSR-indexable.
 */
const featureDetails: Record<
  string,
  { title: string; description: string; sections: { heading: string; body: string }[] }
> = {
  'offline-first': {
    title: 'Offline-First Architecture',
    description:
      'Pain Tracker is a Progressive Web App that works fully offline. Your data never leaves your device unless you explicitly export it.',
    sections: [
      {
        heading: 'How it works',
        body: 'Pain Tracker uses IndexedDB for local persistence and a service worker for asset caching. Once installed, the app loads instantly — even without an internet connection.',
      },
      {
        heading: 'Why it matters',
        body: 'People in pain shouldn\u2019t depend on a server being up. Local-first means your tracking never stops, whether you\u2019re in a hospital waiting room with no Wi-Fi or at home during an outage.',
      },
    ],
  },
  encryption: {
    title: 'End-to-End Encryption',
    description:
      'All health data is encrypted at rest on your device with keys derived locally. We never see your data.',
    sections: [
      {
        heading: 'Key derivation',
        body: 'Encryption keys are derived from a passphrase you choose, using industry-standard algorithms. Keys never leave the browser.',
      },
      {
        heading: 'What\u2019s protected',
        body: 'Pain entries, symptoms, medications, mood logs, free-text notes, and any attachments are all encrypted before being written to IndexedDB.',
      },
    ],
  },
  'clinical-exports': {
    title: 'Clinical-Grade Exports',
    description:
      'Generate PDF, CSV, and JSON reports formatted for WorkSafeBC claims, physiotherapy, and clinical review.',
    sections: [
      {
        heading: 'Supported formats',
        body: 'Export your data as PDF (with charts), CSV (for spreadsheets), or structured JSON (for interoperability).',
      },
      {
        heading: 'WorkSafeBC integration',
        body: 'Exports include fields and formatting that align with WorkSafeBC claim documentation requirements, saving you and your practitioner time.',
      },
    ],
  },
  accessibility: {
    title: 'Trauma-Informed Accessibility',
    description:
      'Designed to WCAG 2.2 AA standards with trauma-informed patterns: gentle language, panic mode, reduced motion, and large touch targets.',
    sections: [
      {
        heading: 'Keyboard & screen reader support',
        body: 'Every control is keyboard-reachable with visible focus indicators. ARIA labels are used throughout for screen reader compatibility.',
      },
      {
        heading: 'Panic mode',
        body: 'A discreet, always-accessible shortcut that immediately clears the screen and displays neutral content — designed for people in unsafe or coercive situations.',
      },
    ],
  },
  analytics: {
    title: 'Local-Only Analytics',
    description:
      'Trends, time-of-day patterns, and correlations — computed entirely on your device. No data transmitted.',
    sections: [
      {
        heading: 'What you can see',
        body: 'Pain trends over time, medication effectiveness, symptom frequency, time-of-day patterns, and weather correlations.',
      },
      {
        heading: 'Privacy guarantee',
        body: 'All computation happens in your browser using Web Workers. Analytics data is never sent to any server.',
      },
    ],
  },
  'weather-correlation': {
    title: 'Weather Correlation',
    description:
      'See how barometric pressure, temperature, and humidity relate to your pain levels — powered by Open-Meteo.',
    sections: [
      {
        heading: 'How data is fetched',
        body: 'Weather data is requested from the free Open-Meteo API using your approximate location (if you allow it). Only the weather response is stored — no location data is persisted.',
      },
      {
        heading: 'Correlation analysis',
        body: 'The app overlays weather variables on your pain timeline so you can spot patterns visually, without any data leaving your device.',
      },
    ],
  },
};

/** Pre-generate static params for all known feature slugs. */
export function generateStaticParams() {
  return Object.keys(featureDetails).map((slug) => ({ slug }));
}

/** Dynamic metadata per feature. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = featureDetails[slug];
  if (!feature) return { title: 'Feature Not Found' };

  return {
    title: feature.title,
    description: feature.description,
    alternates: {
      canonical: `${siteConfig.url}/features/${slug}`,
    },
  };
}

export default async function FeatureDetailPage(
  { params }: Readonly<{ params: Promise<{ slug: string }> }>,
) {
  const { slug } = await params;
  const feature = featureDetails[slug];

  if (!feature) notFound();

  return (
    <div className="container-blog py-12">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Features', url: `${siteConfig.url}/features` },
              { name: feature.title, url: `${siteConfig.url}/features/${slug}` },
            ]),
          ),
        }}
      />

      {/* Back link */}
      <Link href="/features" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Features
      </Link>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6">{feature.title}</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-12">{feature.description}</p>

      {/* Sections */}
      <div className="space-y-10 mb-16">
        {feature.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl font-semibold mb-3">{s.heading}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{s.body}</p>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">Try it now</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          No account needed. Your data stays on your device.
        </p>
        <Link href="/app" className="btn-primary">
          Open Pain Tracker
        </Link>
      </section>
    </div>
  );
}

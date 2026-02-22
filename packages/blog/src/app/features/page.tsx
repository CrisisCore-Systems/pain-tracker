import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScript } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore Pain Tracker features: offline-first architecture, encryption, clinical exports, trauma-informed accessibility, and more.',
  alternates: {
    canonical: `${siteConfig.url}/features`,
  },
};

const features = [
  {
    slug: 'offline-first',
    title: 'Offline-First Architecture',
    summary:
      'Your data lives on your device. No cloud dependency, no login walls — just a PWA that works anywhere.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    slug: 'encryption',
    title: 'End-to-End Encryption',
    summary:
      'Health data is encrypted at rest with keys derived on your device. We never see your data.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    slug: 'clinical-exports',
    title: 'Clinical-Grade Exports',
    summary:
      'Generate PDF, CSV, and JSON reports formatted for WorkSafeBC and clinical workflows.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    slug: 'accessibility',
    title: 'Trauma-Informed Accessibility',
    summary:
      'WCAG 2.2 AA target. Keyboard navigable, reduced-motion aware, gentle language, and panic mode.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    slug: 'analytics',
    title: 'Local-Only Analytics',
    summary:
      'Trends, correlations, and pattern analysis — all computed on-device. Nothing leaves your browser.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    slug: 'weather-correlation',
    title: 'Weather Correlation',
    summary:
      'See how barometric pressure, temperature, and humidity relate to your pain — powered by Open-Meteo.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
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
            ]),
          ),
        }}
      />

      {/* FAQ JSON-LD for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            faqPageJsonLd([
              {
                question: 'Is Pain Tracker free?',
                answer:
                  'Yes. Pain Tracker is free and open-source. Your data stays on your device — no subscription, no cloud account required.',
              },
              {
                question: 'Does Pain Tracker work offline?',
                answer:
                  'Absolutely. Pain Tracker is a Progressive Web App (PWA) that works fully offline once installed.',
              },
              {
                question: 'Is my health data encrypted?',
                answer:
                  'Yes. All health data is encrypted at rest on your device using keys derived locally. We never have access to your data.',
              },
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Features</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Every feature is designed around one principle:{' '}
          <strong>your data, your device, your control</strong>.
        </p>
      </section>

      {/* Feature grid */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {features.map((f) => (
          <Link
            key={f.slug}
            href={`/features/${f.slug}`}
            className="card p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              {f.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {f.title}
            </h2>
            <p className="text-muted-foreground">{f.summary}</p>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">Ready to take control?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Start tracking in seconds — no account, no cloud, no compromise.
        </p>
        <Link href="/app" className="btn-primary">
          Open Pain Tracker
        </Link>
      </section>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScript } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Pain Tracker\u2019s privacy architecture: local-first, no cloud, no telemetry by default, data minimization, and user-controlled exports.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container-blog py-12">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Privacy', url: `${siteConfig.url}/privacy` },
            ]),
          ),
        }}
      />

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            faqPageJsonLd([
              {
                question: 'Does Pain Tracker collect my health data?',
                answer:
                  'No. All health data is stored locally on your device in encrypted IndexedDB. We have no server that receives or stores your entries.',
              },
              {
                question: 'Does Pain Tracker use analytics or telemetry?',
                answer:
                  'No Class A (health) data is ever sent to analytics services. Optional, minimal usage analytics are disabled by default and require explicit opt-in.',
              },
              {
                question: 'What happens when I export my data?',
                answer:
                  'Exports are generated locally in your browser and saved as files on your device. Nothing is uploaded to any server during export.',
              },
              {
                question: 'Can Pain Tracker access my location?',
                answer:
                  'Only if you explicitly allow it for weather correlation. Even then, only approximate coordinates are sent to the weather API — and no location data is stored.',
              },
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Privacy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Pain Tracker is built on a simple principle: <strong>your health data belongs to you</strong>.
        </p>
      </section>

      {/* Core principles */}
      <section className="space-y-10 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Local-First Architecture</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            All data is stored in your browser&apos;s IndexedDB, encrypted at rest. There is no
            cloud database, no user accounts, and no server that ever sees your health information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">No Telemetry by Default</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Class A data (pain entries, symptoms, medications, mood, notes) is <strong>never</strong>{' '}
            sent to any analytics service. Optional, minimal usage analytics (page views) are
            disabled by default and require explicit opt-in.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Data Minimization</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            We store only what the app strictly needs to function. Audit logs record action types
            and outcomes — never free-text content or identifiers.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">User-Controlled Exports</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            When you generate a PDF, CSV, or JSON report, it&apos;s created locally in your browser.
            You decide when, what, and with whom to share. Exports include clear warnings about
            sensitive content.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Open Source</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Every line of code is{' '}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              publicly auditable on GitHub
            </a>
            {'. '}You don&apos;t have to trust our words — you can verify our code.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">Privacy without compromise</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Start tracking with full confidence that your data stays yours.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/app" className="btn-primary">
            Open Pain Tracker
          </Link>
          <Link href="/security" className="btn-secondary">
            Security Details →
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Use Cases',
  description:
    'See how Pain Tracker helps people with chronic pain, WorkSafeBC claims, physiotherapy tracking, and clinical advocacy.',
  alternates: {
    canonical: `${siteConfig.url}/use-cases`,
  },
};

const useCases = [
  {
    slug: 'chronic-pain',
    title: 'Daily Chronic Pain Management',
    summary:
      'Track flare-ups, medications, and triggers over time to understand your own patterns.',
    audience: 'Anyone living with chronic pain',
  },
  {
    slug: 'worksafebc',
    title: 'WorkSafeBC Claims',
    summary:
      'Generate clinical-grade reports that align with WorkSafeBC documentation requirements for injury claims.',
    audience: 'Injured workers in British Columbia',
  },
  {
    slug: 'physiotherapy',
    title: 'Physiotherapy & Rehab Tracking',
    summary:
      'Share structured pain data with your physiotherapist to demonstrate progress or setbacks.',
    audience: 'Patients in rehabilitation programs',
  },
  {
    slug: 'clinical-advocacy',
    title: 'Clinical Self-Advocacy',
    summary:
      'Bring data to appointments. Show trends, correlations, and medication impact to make the most of limited consult time.',
    audience: 'Anyone navigating the healthcare system',
  },
];

export default function UseCasesPage() {
  return (
    <div className="container-blog py-12">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Use Cases', url: `${siteConfig.url}/use-cases` },
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Use Cases</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Pain Tracker is built for real situations — not hypothetical users.
        </p>
      </section>

      {/* Use case cards */}
      <section className="grid gap-8 md:grid-cols-2 mb-16">
        {useCases.map((uc) => (
          <Link
            key={uc.slug}
            href={`/use-cases/${uc.slug}`}
            className="card p-6 hover:shadow-lg transition-shadow group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {uc.title}
            </h2>
            <p className="text-muted-foreground mb-4">{uc.summary}</p>
            <span className="text-sm text-primary/80 font-medium">
              For: {uc.audience}
            </span>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">See yourself here?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Get started in seconds. No sign-up required.
        </p>
        <Link href="/app" className="btn-primary">
          Open Pain Tracker
        </Link>
      </section>
    </div>
  );
}

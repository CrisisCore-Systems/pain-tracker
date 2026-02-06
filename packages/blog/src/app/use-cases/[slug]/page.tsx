import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd } from '@/lib/schema';

/**
 * Use-case detail data — keyed by slug.
 */
const useCaseDetails: Record<
  string,
  {
    title: string;
    description: string;
    audience: string;
    sections: { heading: string; body: string }[];
  }
> = {
  'chronic-pain': {
    title: 'Daily Chronic Pain Management',
    description:
      'Track flare-ups, medications, symptoms, and triggers over time to reveal patterns your memory alone can\u2019t capture.',
    audience: 'Anyone living with chronic pain',
    sections: [
      {
        heading: 'Why tracking matters',
        body: 'Chronic pain is invisible. Without data, it\u2019s your word against a clinician\u2019s 15-minute window. Structured tracking gives you evidence to advocate for yourself.',
      },
      {
        heading: 'What you can track',
        body: 'Pain intensity, location, time of day, medications taken, mood, sleep quality, weather, activities, and free-text notes — all encrypted on your device.',
      },
      {
        heading: 'What you\u2019ll learn',
        body: 'Over weeks, the local analytics surface patterns: which medications help most, what triggers flare-ups, and how pain fluctuates with weather or activity.',
      },
    ],
  },
  worksafebc: {
    title: 'WorkSafeBC Claims',
    description:
      'Generate documentation that aligns with WorkSafeBC reporting requirements — directly from your tracking data.',
    audience: 'Injured workers in British Columbia',
    sections: [
      {
        heading: 'The documentation challenge',
        body: 'WorkSafeBC claims require detailed, consistent records of pain, treatment, and functional limitations. Maintaining these by hand is exhausting — especially when you\u2019re in pain.',
      },
      {
        heading: 'How Pain Tracker helps',
        body: 'Export your tracked data as PDF or CSV reports that include timestamps, pain levels, medications, and clinician-friendly formatting.',
      },
      {
        heading: 'Privacy during claims',
        body: 'You choose what to export and when. Data never leaves your device until you explicitly generate a report.',
      },
    ],
  },
  physiotherapy: {
    title: 'Physiotherapy & Rehab Tracking',
    description:
      'Share structured pain data with your physiotherapist to demonstrate progress, regressions, or treatment impact.',
    audience: 'Patients in rehabilitation programs',
    sections: [
      {
        heading: 'Between-session visibility',
        body: 'Physio sessions are typically 30\u201360 minutes, weeks apart. Daily tracking fills the gap, giving your therapist a complete picture rather than a snapshot.',
      },
      {
        heading: 'Exporting for your therapist',
        body: 'Generate a date-range PDF export before your appointment. The report shows pain trends, medication changes, and activity correlations in a clinical-friendly layout.',
      },
    ],
  },
  'clinical-advocacy': {
    title: 'Clinical Self-Advocacy',
    description:
      'Bring data to medical appointments. Show trends, correlations, and medication impact to make the most of limited consultation time.',
    audience: 'Anyone navigating the healthcare system',
    sections: [
      {
        heading: 'The 15-minute problem',
        body: 'Most doctor appointments are 10\u201315 minutes. Having structured data means you can communicate more in less time — and be taken seriously.',
      },
      {
        heading: 'What clinicians see',
        body: 'Pain Tracker exports include timestamped entries, trend charts, and medication logs — the kind of data clinicians can actually use to adjust treatment plans.',
      },
      {
        heading: 'Staying in control',
        body: 'You decide which date ranges and data types to include in each export. Nothing is shared automatically.',
      },
    ],
  },
};

/** Pre-generate static params for all known use-case slugs. */
export function generateStaticParams() {
  return Object.keys(useCaseDetails).map((slug) => ({ slug }));
}

/** Dynamic metadata per use case. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uc = useCaseDetails[slug];
  if (!uc) return { title: 'Use Case Not Found' };

  return {
    title: uc.title,
    description: uc.description,
    alternates: {
      canonical: `${siteConfig.url}/use-cases/${slug}`,
    },
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = useCaseDetails[slug];

  if (!uc) notFound();

  return (
    <div className="container-blog py-12">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Use Cases', url: `${siteConfig.url}/use-cases` },
              { name: uc.title, url: `${siteConfig.url}/use-cases/${slug}` },
            ]),
          ),
        }}
      />

      {/* Back link */}
      <Link href="/use-cases" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Use Cases
      </Link>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{uc.title}</h1>
      <p className="text-sm text-primary/80 font-medium mb-2">For: {uc.audience}</p>
      <p className="text-xl text-muted-foreground max-w-2xl mb-12">{uc.description}</p>

      {/* Sections */}
      <div className="space-y-10 mb-16">
        {uc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl font-semibold mb-3">{s.heading}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{s.body}</p>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">Start tracking today</h2>
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

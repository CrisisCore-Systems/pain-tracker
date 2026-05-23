import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Download, HeartPulse } from 'lucide-react';
import {
  resolveResourcePageSlug,
  resolveResourcePageType,
  trackResourceStartTrackingFreeClick,
  type ResourcePageType,
} from '../../analytics/resource-funnel-events';

type ResourceIntent = ResourcePageType;

interface ResourceCta {
  title: string;
  description: string;
  href: string;
  icon: typeof HeartPulse;
}

interface ResourceIntentConfig {
  heading: string;
  body: string;
  freeLabel: string;
  upgradeLabel: string;
  ctas: ResourceCta[];
}

const intentConfigs: Record<ResourceIntent, ResourceIntentConfig> = {
  general: {
    heading: 'Choose the next step that fits today',
    body: 'Start free, download a printable, or move into cleaner records for appointments and documentation when you are ready.',
    freeLabel: 'Free helps you capture what happened without friction.',
    upgradeLabel: 'When upgrading helps: you want clearer summaries, longer history, and records that are easier to bring forward.',
    ctas: [
      {
        title: 'Start tracking free',
        description: 'Track pain privately on your device with no account required.',
        href: '/start',
        icon: HeartPulse,
      },
      {
        title: 'Download a printable',
        description: 'Start with a paper pain diary, symptom log, or monthly tracker PDF.',
        href: '/resources/pain-diary-template-pdf',
        icon: Download,
      },
      {
        title: 'Prepare records to share',
        description: 'Move into appointment-ready resources and structured records when you need to be clearer with doctors or advocates.',
        href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
        icon: ClipboardList,
      },
    ],
  },
  printable: {
    heading: 'Tired of paper? Move to the offline-first app when you need cleaner records',
    body: 'Printable pages are the fastest way to begin. When paper starts getting messy, try the offline-first app at PainTracker.ca for less manual summarizing, calmer daily logging, and a record you can keep going.',
    freeLabel: 'Free helps you start now with paper or the app.',
    upgradeLabel: 'When upgrading helps: your entries are piling up and you want review, exports, and less manual work before appointments.',
    ctas: [
      {
        title: 'Start tracking free',
        description: 'Tired of paper? Open the offline-first app without an account and keep your records on your device.',
        href: '/start',
        icon: HeartPulse,
      },
      {
        title: 'Browse more printables',
        description: 'Compare daily, weekly, monthly, and symptom templates that match how you track.',
        href: '/resources',
        icon: Download,
      },
      {
        title: 'Turn notes into usable records',
        description: 'See how to bring private pain records into appointments without handing your history to another app.',
        href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
        icon: ClipboardList,
      },
    ],
  },
  doctor: {
    heading: 'Leave this page with something your doctor can use',
    body: 'The goal is not more reading. It is one useful record, one clearer summary, and less scrambling before the next appointment.',
    freeLabel: 'Free helps you track the basics privately and consistently.',
    upgradeLabel: 'When upgrading helps: you want cleaner summaries, longer history, and less effort turning raw notes into appointment-ready records.',
    ctas: [
      {
        title: 'Start tracking free',
        description: 'Capture daily pain, symptoms, and function privately without an account.',
        href: '/start',
        icon: HeartPulse,
      },
      {
        title: 'Get a doctor-ready template',
        description: 'Use a printable when you need something simple to bring into your next visit.',
        href: '/resources/pain-diary-template-pdf',
        icon: Download,
      },
      {
        title: 'Prepare a clearer appointment summary',
        description: 'Move into record-sharing guidance built for short appointments and hard-to-explain symptoms.',
        href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
        icon: ClipboardList,
      },
    ],
  },
  claims: {
    heading: 'Build records that are easier to bring into claims and disability workflows',
    body: 'Claims pages work best when they end with a concrete next step: start free, use a printable, or move into cleaner summaries for work impact and function.',
    freeLabel: 'Free helps you keep a private day-by-day record of pain, function, and treatment response.',
    upgradeLabel: 'When upgrading helps: you need less scattered documentation and more usable summaries for appointments, advocates, or case review.',
    ctas: [
      {
        title: 'Start tracking free',
        description: 'Keep pain, work impact, and symptom history on your device with no account required.',
        href: '/start',
        icon: HeartPulse,
      },
      {
        title: 'Open claim-friendly resources',
        description: 'Move into printable templates for disability, WorkSafeBC, and daily functioning notes.',
        href: '/resources/documenting-pain-for-disability-claim',
        icon: Download,
      },
      {
        title: 'Prepare records you can share',
        description: 'Use the patient-facing workflow for turning private tracking into cleaner summaries and evidence.',
        href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
        icon: ClipboardList,
      },
    ],
  },
};

interface ResourceCtaStackProps {
  heading?: string;
  body?: string;
  intent?: ResourceIntent;
  resourcePageSlug?: string;
  resourcePageType?: ResourcePageType;
}

export const ResourceCtaStack: React.FC<ResourceCtaStackProps> = ({
  heading,
  body,
  intent = 'general',
  resourcePageSlug,
  resourcePageType,
}) => {
  const config = intentConfigs[intent];
  const resolvedHeading = heading ?? config.heading;
  const resolvedBody = body ?? config.body;
  const resolvedSlug = resolveResourcePageSlug(resourcePageSlug);
  const resolvedType = resolveResourcePageType(resourcePageType ?? intent, resolvedSlug);

  return (
  <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 border-t border-slate-700/50" aria-labelledby="resource-cta-stack-heading">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 id="resource-cta-stack-heading" className="text-3xl font-bold text-white mb-4">
          {resolvedHeading}
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed">{resolvedBody}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 mb-2">Free</p>
          <p className="text-sm leading-relaxed text-slate-200">{config.freeLabel}</p>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 mb-2">Upgrade</p>
          <p className="text-sm leading-relaxed text-slate-200">{config.upgradeLabel}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {config.ctas.map((cta) => {
          const Icon = cta.icon;
          return (
            <Link
              key={cta.href}
              to={cta.href}
              onClick={() => {
                if (cta.href !== '/start' || !resolvedSlug || !resolvedType) {
                  return;
                }

                trackResourceStartTrackingFreeClick({
                  resourcePageSlug: resolvedSlug,
                  resourcePageType: resolvedType,
                  resourceCtaLocation: 'cta_stack_start_free',
                  routeTarget: cta.href,
                });
              }}
              className="group rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left transition-all hover:border-primary/40 hover:bg-slate-800"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-primary transition-colors">
                {cta.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-400">{cta.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
  );
};
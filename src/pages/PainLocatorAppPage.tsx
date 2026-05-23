import React from 'react';
import { ActivitySquare, MapPinned, Shield } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-locator-app',
  canonicalPath: '/pain-locator-app',
  title: 'Pain Locator App',
  metaTitle: 'Pain Locator App for Tracking Where Pain Shows Up and Spreads | Pain Tracker',
  metaDescription:
    'Need a pain locator app? Pain Tracker helps you record where pain is, how it changes, and what else was happening when it flared, without requiring an account.',
  keywords: [
    'pain locator app',
    'pain location tracker',
    'body pain tracker app',
    'track where pain is',
    'pain map app',
  ],
  badge: 'Pain Locator App',
  headline: 'Pain Locator App for Tracking Where Pain Lives, Moves, and Spreads',
  subheadline:
    'Use Pain Tracker to record pain location alongside intensity, symptoms, triggers, and daily impact so your records describe more than a single number.',
  primaryCTA: {
    text: 'Use the app free',
    href: '/start',
  },
  secondaryCTA: {
    text: 'Download a printable',
    href: '/resources/pain-diary-template-pdf',
  },
  utilityBlock: {
    type: 'tool-embed',
  },
  whatIsThis:
    'This page is for people who want a pain locator app or pain map workflow. Pain Tracker helps you document where pain shows up, whether it radiates or changes sides, what else is happening with symptoms, and how the pain affects what you can do.',
  whoShouldUse: [
    'People whose pain shifts location or spreads and needs more than a single daily number.',
    'Anyone preparing for specialist visits where location and radiation matter.',
    'Patients who want to track body location privately instead of handing that record to an app account system.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Record the location with each entry',
      description: 'Track where the pain is happening, whether it is staying put, and whether it is radiating or changing pattern.',
    },
    {
      step: 2,
      title: 'Pair location with symptoms and triggers',
      description: 'A pain location log becomes more useful when it is tied to timing, symptom quality, and what was happening before the flare.',
    },
    {
      step: 3,
      title: 'Use those records in appointments',
      description: 'Body location details are often the part that gets lost in conversation. A structured record makes them easier to review.',
    },
  ],
  whyItMatters:
    'Pain location is clinically useful because where pain shows up, how it spreads, and what else changes with it can shape diagnosis and treatment decisions. A pain locator app should help you capture that without turning daily tracking into a burden.',
  trustSignals: {
    medicalNote: 'Location, radiation, and symptom quality often matter as much as intensity when clinicians are trying to understand a pain pattern.',
    privacyNote: 'Pain location records remain local-first and export only when you deliberately share them.',
    legalNote: 'Detailed records can also support explanations of function change or worsening symptoms when documentation is needed later.',
  },
  faqs: [
    {
      question: 'What is a pain locator app?',
      answer: 'It is an app that helps you track where pain occurs in the body, whether it changes or spreads, and what other details go with that pattern.',
    },
    {
      question: 'Why track location as well as pain level?',
      answer: 'Location, radiation, and symptom quality can make patterns easier for clinicians to interpret than a number alone.',
    },
    {
      question: 'Do I need an account to track pain location in Pain Tracker?',
      answer: 'No. Pain Tracker is designed so you can start using it without creating an account first.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracking App',
      description: 'See the broader app page for daily logging.',
      href: '/pain-tracking-app',
    },
    {
      title: 'What to Include in a Pain Journal',
      description: 'Use the checklist page to decide what details belong in each entry.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'How to share pain records with a doctor without giving an app your data',
      description: 'See the privacy-safe sharing workflow.',
      href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Locator App', url: '/pain-locator-app' },
  ],
};

const points = [
  {
    title: 'Track where it hurts',
    description: 'Keep body location tied to the rest of each entry instead of separated into a different notebook or memory.',
    icon: MapPinned,
  },
  {
    title: 'Describe how it changes',
    description: 'Record radiation, shifting sides, and symptom quality so the location data stays clinically meaningful.',
    icon: ActivitySquare,
  },
  {
    title: 'Keep it private until you need to share it',
    description: 'Pain location is health data. Pain Tracker keeps routine records local-first by default.',
    icon: Shield,
  },
];

export const PainLocatorAppPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-3">
      {points.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{point.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{point.description}</p>
          </div>
        );
      })}
    </div>
  </SEOPageLayout>
);

export default PainLocatorAppPage;
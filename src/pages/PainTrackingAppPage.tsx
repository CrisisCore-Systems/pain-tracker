import React from 'react';
import { Activity, FileText, Shield } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-tracking-app',
  canonicalPath: '/pain-tracking-app',
  title: 'Pain Tracking App',
  metaTitle: 'Pain Tracking App That Works Offline and Keeps Records Private | Pain Tracker',
  metaDescription:
    'Looking for a pain tracking app? Pain Tracker lets you track pain privately, works offline, requires no account, and helps you bring better records to appointments.',
  keywords: [
    'pain tracking app',
    'pain tracker app',
    'track pain app',
    'pain diary app',
    'pain journal app',
    'offline pain tracking app',
  ],
  badge: 'Pain Tracking App',
  headline: 'Pain Tracking App for Daily Use, Not Just Good Days',
  subheadline:
    'Track pain privately. No account. Works offline. Bring better records to appointments. Pain Tracker is built for the people who actually have to use the app while tired, hurting, or interrupted.',
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
    'This page is the direct answer for people searching for a pain tracking app. Pain Tracker helps you log pain, symptoms, triggers, treatment response, and daily function in a way that stays private by default and remains useful when it is time to share a record with a doctor.',
  whoShouldUse: [
    'People who want a pain tracking app that does not force an account before they can start.',
    'Anyone who needs tracking to keep working during weak connectivity or low-energy days.',
    'Patients who want better records for appointments without giving routine health data to a cloud service.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Use it for daily check-ins or flare entries',
      description: 'Track pain intensity, location, symptoms, and functional impact in a structured format that is still manageable on a bad day.',
    },
    {
      step: 2,
      title: 'Keep routine tracking local',
      description: 'Let the app work as your private record first instead of treating sharing as the default behavior.',
    },
    {
      step: 3,
      title: 'Export only when you choose',
      description: 'Prepare a record for a clinician, appointment, or documentation workflow when you are ready to hand it over.',
    },
  ],
  whyItMatters:
    'The useful question is not whether an app can log pain. It is whether the app stays usable and respectful when you are hurting, offline, interrupted, or trying to explain a pattern to a doctor later. That is the standard Pain Tracker is built around.',
  trustSignals: {
    medicalNote: 'Structured pain and function logs are easier for clinicians to review than reconstructed memory alone.',
    privacyNote: 'Daily use stays local-first by default and does not require an account to get started.',
    legalNote: 'When you later need records for appointments or documentation, consistent entries are easier to defend than scattered notes.',
  },
  faqs: [
    {
      question: 'What should a pain tracking app include?',
      answer: 'It should let you record pain, symptoms, triggers, treatments, and daily function without making the workflow so heavy that you stop using it.',
    },
    {
      question: 'Does a pain tracking app have to use the cloud?',
      answer: 'No. Pain Tracker is designed so everyday tracking works locally first instead of making network access or account recovery part of routine use.',
    },
    {
      question: 'Can I bring the records to a doctor?',
      answer: 'Yes. The point is to create a record that is useful for you first and shareable later when you choose to export it.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracker App',
      description: 'Read the product overview page focused on the broader category intent.',
      href: '/pain-tracker-app',
    },
    {
      title: 'Pain Management Tracker',
      description: 'See the page focused on treatment response, symptom patterns, and daily function.',
      href: '/pain-management-tracker',
    },
    {
      title: 'How to share pain records with a doctor without giving an app your data',
      description: 'Use the privacy-safe sharing workflow page.',
      href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Tracking App', url: '/pain-tracking-app' },
  ],
};

const featureCards = [
  {
    title: 'Private by default',
    description: 'Routine pain logging stays on your device until you decide it is time to export a record.',
    icon: Shield,
  },
  {
    title: 'Built for appointments',
    description: 'Turn daily entries into a clearer record instead of reconstructing weeks of pain from memory.',
    icon: FileText,
  },
  {
    title: 'Simple enough to keep using',
    description: 'The app is designed to reduce friction so daily tracking still happens on low-energy days.',
    icon: Activity,
  },
];

export const PainTrackingAppPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-3">
      {featureCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{card.description}</p>
          </div>
        );
      })}
    </div>
  </SEOPageLayout>
);

export default PainTrackingAppPage;
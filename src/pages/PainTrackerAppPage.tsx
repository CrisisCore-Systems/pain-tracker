import React from 'react';
import { Activity, FileText, Shield } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-tracker-app',
  canonicalPath: '/pain-tracker-app',
  title: 'Pain Tracker App',
  metaTitle: 'Pain Tracker App That Works Offline and Protects Privacy | PainTracker',
  metaDescription:
    'PainTracker is a private offline-first pain tracker app for daily symptom logging, trigger tracking, flare patterns, and clinician-friendly exports when you choose.',
  keywords: [
    'pain tracker',
    'pain tracker app',
    'pain tracking app',
    'chronic pain tracker',
    'pain diary app',
    'pain journal app',
    'pain app',
    'chronic pain app',
  ],
  badge: 'Pain Tracking App',
  headline: 'Pain Tracker App That Works Offline and Protects Privacy',
  subheadline:
    'Track pain, symptoms, triggers, flare patterns, and daily functioning on your device. Use clinician-friendly exports when you choose instead of making daily tracking depend on the cloud.',
  primaryCTA: {
    text: 'Open PainTracker',
    href: '/start',
    download: false,
  },
  secondaryCTA: {
    text: 'See Printable Templates',
    href: '/pain-diary-template',
  },
  utilityBlock: {
    type: 'tool-embed',
  },
  whatIsThis:
    'PainTracker is a pain tracking app designed for daily use under unstable conditions. It helps you record pain levels, symptoms, triggers, treatments, and functional impact in a structured format that remains useful for your own pattern tracking and for appointments.',
  whoShouldUse: [
    'People who want a chronic pain tracker that works offline for daily logging.',
    'Anyone who needs clinician-friendly records without handing routine tracking to a third-party account system.',
    'Patients preparing for doctor visits, benefits paperwork, or structured symptom review.',
    'People who want a pain diary app that can replace fragmented notes, screenshots, or paper scraps.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Open the app and record the basics',
      description: 'Log pain intensity, symptoms, location, triggers, and daily impact as entries happen or during a check-in.',
    },
    {
      step: 2,
      title: 'Build a record over time',
      description: 'Use consistent entries to make flare patterns, trigger patterns, and day-to-day changes easier to spot.',
    },
    {
      step: 3,
      title: 'Export only when needed',
      description: 'Generate the record you want to share for a doctor visit or documentation workflow instead of syncing everything by default.',
    },
  ],
  whyItMatters:
    'A pain tracker is most useful when the data stays legible under fatigue, interruption, and low-trust conditions. The goal is not just logging more. The goal is producing a record you can actually use later when you need to explain patterns, treatment response, or daily impact.',
  trustSignals: {
    medicalNote: 'Structured symptom logging makes appointments more specific and less dependent on memory alone.',
    privacyNote: 'Daily tracking is local-first by default. Sharing remains a deliberate user action.',
    legalNote: 'Consistent records are easier to review for documentation workflows than scattered notes or reconstructed timelines.',
  },
  faqs: [
    {
      question: 'What should a pain tracker app record?',
      answer: 'At minimum: pain intensity, symptom type, location, triggers, treatments, and how pain affected daily function. A useful tracker should also make those records easy to review later.',
    },
    {
      question: 'Why use a pain tracker app instead of random notes?',
      answer: 'Structured entries make your records easier to compare over time, easier to bring to appointments, and less dependent on memory when you are tired or in pain.',
    },
    {
      question: 'Can I use PainTracker as a chronic pain tracker?',
      answer: 'Yes. It is suitable for ongoing symptom logging, flare documentation, treatment changes, and daily functioning records over time.',
    },
    {
      question: 'Does a pain tracker app have to use the cloud?',
      answer: 'No. PainTracker is built so everyday pain logging remains local-first by default instead of making routine tracking depend on network access or account creation.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Diary Template',
      description: 'Start with a printable pain diary or pain log if paper fits better right now.',
      href: '/pain-diary-template',
    },
    {
      title: 'Pain Tracking Apps Comparison',
      description: 'See what to compare before choosing an app for privacy, offline use, or doctor visits.',
      href: '/pain-tracking-apps-comparison',
    },
    {
      title: 'Privacy and Offline Use',
      description: 'Read how PainTracker approaches local-first use and trauma-informed design.',
      href: '/privacy-offline-first-pain-tracker',
    },
    {
      title: 'Printable Resources',
      description: 'Browse printable templates and clinician-oriented guides.',
      href: '/resources',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Tracker App', url: '/pain-tracker-app' },
  ],
};

const featureCards = [
  {
    title: 'Daily pain logging',
    description: 'Capture pain, symptoms, triggers, and treatment response in one place.',
    icon: Activity,
  },
  {
    title: 'Clinician-friendly records',
    description: 'Export a structured record when you decide it is time to share.',
    icon: FileText,
  },
  {
    title: 'Local-first privacy',
    description: 'Routine tracking stays on your device unless you intentionally export it.',
    icon: Shield,
  },
];

export const PainTrackerAppPage: React.FC = () => (
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

export default PainTrackerAppPage;
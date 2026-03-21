import React from 'react';
import { Lock, ShieldCheck, WifiOff } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'privacy-offline-first-pain-tracker',
  canonicalPath: '/privacy-offline-first-pain-tracker',
  title: 'Private Offline-First Pain Tracker',
  metaTitle: 'Private Offline-First Pain Tracker with Trauma-Informed Design | PainTracker',
  metaDescription:
    'Learn how PainTracker approaches local-first use, privacy, offline pain tracking, and trauma-informed design for daily symptom logging and clinician-friendly records.',
  keywords: [
    'offline pain tracker',
    'private pain tracker',
    'privacy pain tracker',
    'trauma informed app',
    'offline first pain tracker',
    'local first pain tracker',
  ],
  badge: 'Privacy Explainer',
  headline: 'Private Offline-First Pain Tracker for Real-Life Instability',
  subheadline:
    'PainTracker is designed so routine pain logging stays useful without ideal conditions. Local-first use, deliberate sharing, and trauma-informed design matter because people do not track pain only when life is neat.',
  primaryCTA: {
    text: 'Open PainTracker',
    href: '/start',
    download: false,
  },
  secondaryCTA: {
    text: 'Read App Overview',
    href: '/pain-tracker-app',
  },
  utilityBlock: {
    type: 'tool-embed',
  },
  whatIsThis:
    'This page explains the privacy and offline-first positioning of PainTracker. It is not a vague promise page. It describes why local-first design, user-controlled exports, and lower-pressure workflows matter for a health app used under fatigue, interruption, and stress.',
  whoShouldUse: [
    'People who are specifically looking for an offline pain tracker instead of an account-centric app.',
    'Users who care about privacy and want clearer boundaries around when data leaves their device.',
    'Anyone evaluating whether a trauma-informed app design claim is actually reflected in the workflow.',
    'People who need a daily tracker that remains usable under unstable conditions.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Use the app locally for routine tracking',
      description: 'Log pain, symptoms, and daily impact without treating the network as a prerequisite for everyday use.',
    },
    {
      step: 2,
      title: 'Export only when you choose',
      description: 'Keep sharing as an explicit action for appointments or documentation instead of a hidden background assumption.',
    },
    {
      step: 3,
      title: 'Prefer clarity over complexity',
      description: 'Use the app as a humane record-keeping tool, not as a place that pressures you into constant engagement.',
    },
  ],
  whyItMatters:
    'Privacy, offline use, and trauma-informed design are not separate extras. They shape whether a pain tracker remains trustworthy and usable when a person is exhausted, interrupted, or under pressure. A local-first design lowers exposure. A clearer workflow lowers cognitive burden. Deliberate export keeps the user in charge of when data moves.',
  trustSignals: {
    medicalNote: 'Clinician-friendly records are more useful when daily capture remains consistent instead of failing whenever connectivity or energy drops.',
    privacyNote: 'Everyday tracking is local-first by default. Sharing is a user-controlled step, not a background expectation.',
    legalNote: 'Clearer control over records and exports helps when you later need documentation for appointments or administrative workflows.',
  },
  faqs: [
    {
      question: 'Is an offline pain tracker more private?',
      answer: 'It often is, because daily records do not need to leave your device just to remain usable. PainTracker is designed around that local-first posture.',
    },
    {
      question: 'What does trauma-informed design mean in this app?',
      answer: 'It means reducing shame, coercion, and cognitive burden through clearer language, more user control, and workflows designed for use under stress or fatigue.',
    },
    {
      question: 'Does private mean I cannot export anything?',
      answer: 'No. Private and local-first does not mean locked in. It means exports happen because you choose them, not because daily use requires routine sharing.',
    },
    {
      question: 'Why mention offline-first so explicitly?',
      answer: 'Because searchers looking for a private pain tracker often need a tool that still works under unstable connectivity, low energy, or low trust.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracker App',
      description: 'See the app overview page focused on category intent.',
      href: '/pain-tracker-app',
    },
    {
      title: 'Pain Tracking Apps Comparison',
      description: 'Compare privacy, offline use, and doctor-visit readiness.',
      href: '/pain-tracking-apps-comparison',
    },
    {
      title: 'Pain Diary Template',
      description: 'Start with a printable option if paper is easier right now.',
      href: '/pain-diary-template',
    },
    {
      title: 'Privacy Policy',
      description: 'Read the formal privacy policy for the product.',
      href: '/privacy',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Privacy and Offline Use', url: '/privacy-offline-first-pain-tracker' },
  ],
};

const privacyPoints = [
  {
    title: 'Local-first routine use',
    description: 'Daily tracking is built to remain useful without making a network or remote account the center of the workflow.',
    icon: WifiOff,
  },
  {
    title: 'User-controlled sharing',
    description: 'Exports are deliberate actions so you stay in charge of when records leave the device.',
    icon: Lock,
  },
  {
    title: 'Trauma-informed posture',
    description: 'The interface aims for lower pressure, clearer language, and user control rather than coercive engagement patterns.',
    icon: ShieldCheck,
  },
];

export const PrivacyOfflineFirstPainTrackerPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-3">
      {privacyPoints.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
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

export default PrivacyOfflineFirstPainTrackerPage;
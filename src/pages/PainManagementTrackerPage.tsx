import React from 'react';
import { BarChart3, Pill, Shield } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-management-tracker',
  canonicalPath: '/pain-management-tracker',
  title: 'Pain Management Tracker',
  metaTitle: 'Pain Management Tracker for Symptoms, Treatments, and Daily Function | Pain Tracker',
  metaDescription:
    'Use Pain Tracker as a pain management tracker for symptoms, medications, flare triggers, and daily function. Works offline and keeps routine records private.',
  keywords: [
    'pain management tracker',
    'pain management app',
    'track pain treatment',
    'pain symptom tracker',
    'pain medication tracker',
  ],
  badge: 'Pain Management Tracker',
  headline: 'Pain Management Tracker for What Hurts, What Helps, and What Changes',
  subheadline:
    'Use Pain Tracker to follow symptoms, treatment response, triggers, and daily function in one place so appointments become about patterns and decisions, not guesswork.',
  primaryCTA: {
    text: 'Use the app free',
    href: '/start',
  },
  secondaryCTA: {
    text: 'Prepare records for appointments',
    href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
  },
  utilityBlock: {
    type: 'tool-embed',
  },
  whatIsThis:
    'This page is for people searching for a pain management tracker rather than a generic diary. Pain Tracker helps you keep symptoms, medications, flare triggers, and day-to-day function in one private record so treatment changes are easier to review over time.',
  whoShouldUse: [
    'People adjusting medications or treatment plans and wanting cleaner before-and-after records.',
    'Patients trying to spot flare patterns across sleep, stress, weather, or daily activity.',
    'Anyone who wants a pain management tracker that stays useful without relying on an account or constant connectivity.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Track symptoms and treatments together',
      description: 'Keep pain levels, symptom changes, medications, and functional impact in the same record instead of spreading them across notes and memory.',
    },
    {
      step: 2,
      title: 'Use entries to compare changes over time',
      description: 'Daily structure makes it easier to see whether a treatment helps, whether a trigger repeats, and how your function shifts week to week.',
    },
    {
      step: 3,
      title: 'Share summaries only when needed',
      description: 'Bring better records to appointments without giving routine day-to-day tracking to an app vendor by default.',
    },
  ],
  whyItMatters:
    'Pain management is usually not one number. It is symptom changes, treatment response, sleep, activity, and whether your day got smaller or bigger. A pain management tracker is useful when it holds those pieces together without making the workflow harder than the condition itself.',
  trustSignals: {
    medicalNote: 'Treatment decisions improve when symptoms, meds, and function are captured in the same timeline.',
    privacyNote: 'Pain Tracker keeps routine records local-first and sharing user-controlled.',
    legalNote: 'Better day-to-day records also help when care decisions overlap with benefits or documentation workflows.',
  },
  faqs: [
    {
      question: 'What is a pain management tracker?',
      answer: 'It is a structured way to track pain, symptoms, treatments, triggers, and daily function so you can review what changed and what helped over time.',
    },
    {
      question: 'Should I track medications and pain together?',
      answer: 'Yes. Treatment response is easier to understand when symptom changes and medication timing are captured in the same record.',
    },
    {
      question: 'Can I use this without giving an app my daily data?',
      answer: 'Yes. Pain Tracker is designed so routine logging stays on your device and sharing happens only when you deliberately export a record.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracking App',
      description: 'See the broader product page for daily tracking intent.',
      href: '/pain-tracking-app',
    },
    {
      title: 'Pain Locator App',
      description: 'See the page focused on tracking where pain lives in the body.',
      href: '/pain-locator-app',
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Use the clinician-facing resource page for appointments.',
      href: '/resources/how-to-track-pain-for-doctors',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Management Tracker', url: '/pain-management-tracker' },
  ],
};

const points = [
  {
    title: 'Track treatment response',
    description: 'See whether medications, exercises, pacing, or other interventions change pain and function over time.',
    icon: Pill,
  },
  {
    title: 'See patterns instead of isolated bad days',
    description: 'A structured tracker is more useful than one-off notes when you need to review flare timing or repeated triggers.',
    icon: BarChart3,
  },
  {
    title: 'Keep the record under your control',
    description: 'The app is built so daily use stays private first and sharing becomes a deliberate choice later.',
    icon: Shield,
  },
];

export const PainManagementTrackerPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-3">
      {points.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
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

export default PainManagementTrackerPage;
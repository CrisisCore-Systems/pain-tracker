import React from 'react';
import { FileText, Printer, Shield } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'share-pain-records-with-doctor-without-giving-an-app-your-data',
  canonicalPath: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
  title: 'How to Share Pain Records with a Doctor Without Giving an App Your Data',
  metaTitle: 'How to Share Pain Records with a Doctor Without Giving an App Your Data | Pain Tracker',
  metaDescription:
    'Use Pain Tracker to keep pain records private by default, then export or print a structured record for a doctor, disability workflow, or WorkSafeBC documentation when you choose.',
  keywords: [
    'how to share pain records with a doctor without giving an app your data',
    'share pain records privately',
    'doctor pain records private app',
    'print pain records for doctor',
    'share pain diary with doctor privately',
  ],
  badge: 'Privacy-Safe Sharing',
  headline: 'How to Share Pain Records with a Doctor Without Giving an App Your Data',
  subheadline:
    'Keep daily pain tracking private. Then export or print a structured record only when you are ready to bring it to a doctor, disability workflow, or WorkSafeBC documentation process.',
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
    'This page answers the search intent behind private sharing workflows. Pain Tracker is designed so routine pain tracking stays local-first by default. When you need to show a doctor, bring records to an appointment, or support a disability or WorkSafeBC workflow, you can export or print a structured record instead of giving an app your everyday data as a condition of use.',
  whoShouldUse: [
    'People who want to bring pain records to a doctor without making cloud sharing the default.',
    'Anyone preparing disability, insurance, or WorkSafeBC documentation from daily logs.',
    'Patients who want a clearer separation between private tracking and deliberate disclosure.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Track pain privately day to day',
      description: 'Use Pain Tracker as your private record for symptoms, pain levels, treatments, and daily function without creating a remote data exhaust trail by default.',
    },
    {
      step: 2,
      title: 'Choose the record you want to share',
      description: 'When it is time for an appointment or documentation workflow, export or print the structured record you want instead of exposing everything automatically.',
    },
    {
      step: 3,
      title: 'Bring that record to the right workflow',
      description: 'Use the same private-first foundation for doctor visits, disability documentation, or WorkSafeBC-oriented paperwork support.',
    },
  ],
  whyItMatters:
    'A lot of health apps treat sharing as the default architecture and privacy as a settings problem. The safer model is the reverse: keep daily tracking local, then share on purpose when you need a record outside the device. That reduces exposure and gives you a clearer boundary between private logging and public documentation.',
  trustSignals: {
    medicalNote: 'A structured export or printed summary is usually more useful in an appointment than trying to summarize weeks of pain from memory.',
    privacyNote: 'Pain Tracker is built so daily records remain private by default and sharing is user-controlled.',
    legalNote: 'The same export-first posture supports disability and WorkSafeBC documentation workflows without pretending the product is the authority itself.',
  },
  faqs: [
    {
      question: 'Can I share pain records with a doctor without giving an app my daily data?',
      answer: 'Yes. Pain Tracker is designed so routine tracking stays private and local-first, while exports and prints happen only when you choose to create a shareable record.',
    },
    {
      question: 'What is the safest way to bring pain records to an appointment?',
      answer: 'Use a structured export or printable summary that you generate on purpose for the visit instead of relying on a cloud dashboard that stores your day-to-day record by default.',
    },
    {
      question: 'Can the same workflow help with disability or WorkSafeBC documentation?',
      answer: 'Yes. The same record-preparation posture helps when you need cleaner summaries and supporting records for claims or administrative review.',
    },
  ],
  relatedLinks: [
    {
      title: 'How to Track Pain for Doctors',
      description: 'Use the appointment-focused guide.',
      href: '/resources/how-to-track-pain-for-doctors',
    },
    {
      title: 'Documenting Pain for Disability Claims',
      description: 'Use the resource page for benefit and claim documentation.',
      href: '/resources/documenting-pain-for-disability-claim',
    },
    {
      title: 'WorkSafeBC Pain Journal Template',
      description: 'Use the WorkSafeBC-oriented template page.',
      href: '/resources/worksafebc-pain-journal-template',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    {
      name: 'Share Pain Records Privately',
      url: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    },
  ],
};

const steps = [
  {
    title: 'Keep daily tracking local',
    description: 'Use the app as your private working record first instead of treating remote storage as the baseline.',
    icon: Shield,
  },
  {
    title: 'Export or print the record you need',
    description: 'Create a structured summary when you are preparing for a doctor, disability process, or WorkSafeBC workflow.',
    icon: FileText,
  },
  {
    title: 'Share the artifact, not your whole routine',
    description: 'Bring the output to the appointment or documentation process without making full-time cloud disclosure the price of using the app.',
    icon: Printer,
  },
];

export const SharePainRecordsPrivatelyPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
          </div>
        );
      })}
    </div>
  </SEOPageLayout>
);

export default SharePainRecordsPrivatelyPage;
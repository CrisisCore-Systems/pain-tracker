import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-diary-template',
  canonicalPath: '/pain-diary-template',
  title: 'Pain Diary Template',
  metaTitle: 'Free Pain Diary Template and Printable Pain Log | PainTracker',
  metaDescription:
    'Download a free pain diary template and printable pain log, then compare paper tracking with PainTracker for daily symptom logging and clinician-friendly records.',
  keywords: [
    'pain diary template',
    'free printable pain diary template',
    'pain log template',
    'pain journal template',
    'free printable pain tracker',
    'chronic pain tracker printable',
    'pain log',
    'printable pain diary',
  ],
  badge: 'Printable Template',
  headline: 'Free Pain Diary Template and Printable Pain Log',
  subheadline:
    'Start with a printable pain diary template if paper is the easiest way to begin. Use it on its own or as the bridge into PainTracker when you want search, structure, and clinician-friendly exports.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/pain-diary-template.pdf',
    download: true,
  },
  secondaryCTA: {
    text: 'Browse More Templates',
    href: '/resources',
  },
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/pain-diary-template.pdf',
    downloadFileName: 'pain-diary-template.pdf',
  },
  whatIsThis:
    'This page is the paper-first entry point for people searching for a pain diary template, pain log template, or printable chronic pain tracker. The template gives you a simple structure for pain intensity, symptoms, triggers, treatments, and notes you may want to bring to appointments.',
  whoShouldUse: [
    'Anyone who wants to begin with a printable pain diary before committing to an app.',
    'People who need a pain log template for appointments, claim paperwork, or personal review.',
    'Users who want a paper backup for travel, interruption, or low-screen days.',
    'People comparing printable pain tracking with app-based tracking.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Download and print the template',
      description: 'Keep copies where you are most likely to remember them: bedside, desk, or appointment folder.',
    },
    {
      step: 2,
      title: 'Record pain and context consistently',
      description: 'Use the same fields each time so patterns become easier to review later.',
    },
    {
      step: 3,
      title: 'Move to digital only if it helps',
      description: 'If paper starts feeling limiting, use PainTracker for faster daily logging and structured exports without losing the same basic tracking dimensions.',
    },
  ],
  whyItMatters:
    'Printable tracking is often the easiest top-of-funnel tool because it lowers the commitment needed to begin. Many people search for a free printable pain tracker first, then realize they need something more consistent, searchable, and easier to export later.',
  trustSignals: {
    medicalNote: 'A structured paper record is still more useful in appointments than trying to summarize from memory alone.',
    privacyNote: 'Printable tracking keeps the first step simple and low-exposure. PainTracker extends that with local-first digital use.',
    legalNote: 'Consistent logs can support documentation workflows better than sporadic retrospective notes.',
  },
  faqs: [
    {
      question: 'Is there a free printable pain diary template?',
      answer: 'Yes. This page provides a free printable PDF that you can use as a daily pain diary or pain log.',
    },
    {
      question: 'What should a pain log template include?',
      answer: 'A good pain log should include pain intensity, symptom type, location, triggers, treatments, and how pain affected your daily function.',
    },
    {
      question: 'When should I use paper instead of an app?',
      answer: 'Paper is useful when you want the lowest-friction way to start, need a screen break, or want a physical sheet for appointments. Many people later move to an app for consistency and export convenience.',
    },
    {
      question: 'Can I use the printable template with PainTracker?',
      answer: 'Yes. The printable template and the app are compatible approaches to the same core tracking job. Many people use paper first and move to the app when they want pattern review and structured exports.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Go straight to the dedicated printable page and related template resources.',
      href: '/resources/pain-diary-template-pdf',
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Use a faster one-page daily sheet for quick routine tracking.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'Pain Tracker App',
      description: 'See the digital app page for local-first logging and exports.',
      href: '/pain-tracker-app',
    },
    {
      title: 'Pain Tracking Apps Comparison',
      description: 'Compare paper, local-first apps, and what to look for before choosing.',
      href: '/pain-tracking-apps-comparison',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Diary Template', url: '/pain-diary-template' },
  ],
};

export const PainDiaryTemplatePage: React.FC = () => <SEOPageLayout content={pageContent} />;

export default PainDiaryTemplatePage;
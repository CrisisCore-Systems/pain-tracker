import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'offline-pain-tracker-app',
  canonicalPath: '/offline-pain-tracker-app',
  title: 'Offline Pain Tracker App',
  metaTitle: 'Offline Pain Tracker App: Private Daily Logging Without Account Lock-In',
  metaDescription:
    'Use an offline pain tracker app for private daily symptom logging, flare tracking, medication notes, and doctor-ready summaries without account lock-in.',
  keywords: [
    'offline pain tracker app',
    'private pain tracker app',
    'pain tracker without account',
    'local pain journal app',
    'offline symptom tracker'
  ],
  badge: 'App Guide',
  headline: 'Offline Pain Tracker App',
  subheadline: 'Track pain privately even when connectivity is unstable. No account required for core daily use.',
  primaryCTA: { text: 'Start tracking pain', href: '/start' },
  secondaryCTA: { text: 'Download free printables', href: '/resources' },
  utilityBlock: { type: 'tool-embed' },
  whatIsThis:
    'A practical guide to using PainTracker as an offline-first, local-first pain tracker app for daily logs, flare records, and appointment summaries.',
  whoShouldUse: [
    'People who need tracking without account dependency',
    'Users in unstable connectivity environments',
    'Patients who prioritize local data control',
    'Anyone who wants printable + app flexibility'
  ],
  howToUse: [
    { step: 1, title: 'Start local tracking', description: 'Log pain, symptoms, triggers, medication, and function daily.' },
    { step: 2, title: 'Review weekly patterns', description: 'Use recurring trend review for trigger and flare management.' },
    { step: 3, title: 'Export when needed', description: 'Share summaries only when you choose.' }
  ],
  whyItMatters:
    'Offline reliability and local control reduce failure points during the moments when tracking matters most.',
  trustSignals: {
    medicalNote: 'Structured records improve doctor-visit clarity.',
    privacyNote: 'Core tracking stays under your control by default.',
    legalNote: 'Consistent logs support documentation continuity.'
  },
  faqs: [
    { question: 'Can I use PainTracker without an account?', answer: 'Yes. Core tracking can be used without an account.' },
    { question: 'Does it work offline?', answer: 'Yes. Core daily workflows are built for offline-first use.' },
    { question: 'Can I still use printables?', answer: 'Yes. Printables and app workflows are complementary.' }
  ],
  relatedLinks: [
    { title: 'Private Pain Tracker App', description: 'Understand privacy-first positioning', href: '/privacy-offline-first-pain-tracker' },
    { title: 'Daily Pain Tracker Printable', description: 'Use a paper-first format', href: '/resources/daily-pain-tracker-printable' },
    { title: 'How to Track Pain for a Doctor', description: 'Prepare appointment-ready records', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Pain Tracking Apps Comparison', description: 'Compare offline/privacy options', href: '/pain-tracking-apps-comparison' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Offline Pain Tracker App', url: '/offline-pain-tracker-app' }
  ]
};

export const OfflinePainTrackerAppPage: React.FC = () => <SEOPageLayout content={pageContent} />;

export default OfflinePainTrackerAppPage;

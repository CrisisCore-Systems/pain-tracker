import React from 'react';
import { CheckCircle2, FileText, Shield, WifiOff } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-tracking-apps-comparison',
  canonicalPath: '/pain-tracking-apps-comparison',
  title: 'Pain Tracking Apps Comparison',
  metaTitle: 'Pain Tracking Apps Comparison: Privacy, Offline Use, and Doctor Visits | PainTracker',
  metaDescription:
    'Compare pain tracking apps by privacy, offline use, doctor-visit readiness, exports, and daily usability. See how PainTracker approaches local-first tracking and clinician-friendly records.',
  keywords: [
    'pain tracking apps',
    'pain management apps',
    'chronic pain apps',
    'pain management software',
    'pain tracker comparison',
    'pain tracking app comparison',
    'pain tracker doctor report',
  ],
  badge: 'Comparison Guide',
  headline: 'Pain Tracking Apps Comparison: What Actually Matters',
  subheadline:
    'If you are comparing pain tracking apps, do not stop at screenshots. Compare privacy, offline use, clinician-ready exports, and whether the app still works when you are tired, interrupted, or offline.',
  primaryCTA: {
    text: 'Open PainTracker',
    href: '/start',
    download: false,
  },
  secondaryCTA: {
    text: 'See Printable Option',
    href: '/pain-diary-template',
  },
  utilityBlock: {
    type: 'tool-embed',
  },
  whatIsThis:
    'This is a comparison framework for pain tracking apps. Instead of making broad claims about every competitor, it focuses on the questions that determine whether an app is actually useful in practice: how it handles privacy, whether it works offline, what happens when you need to export records, and how much daily friction it adds.',
  whoShouldUse: [
    'People evaluating pain tracking apps before committing their health data to one workflow.',
    'Anyone looking for a pain management app that stays useful during low-connectivity or low-energy days.',
    'Patients who need to bring structured records to doctor visits.',
    'Users deciding between paper tracking, local-first apps, and account-centric apps.',
  ],
  howToUse: [
    {
      step: 1,
      title: 'Check privacy and storage defaults',
      description: 'Find out where daily records live, what requires an account, and whether sharing is your choice or a default assumption.',
    },
    {
      step: 2,
      title: 'Check offline behavior',
      description: 'See whether the app still lets you log pain and review records without relying on network access.',
    },
    {
      step: 3,
      title: 'Check export usefulness',
      description: 'Look for exports that are actually usable in appointments instead of vague summaries or trapped data.',
    },
  ],
  whyItMatters:
    'A pain app can look polished and still fail when the moment of use is difficult. The right comparison criteria are not just feature count. They are whether the app reduces cognitive load, preserves your control over sharing, and stays usable when you need it most.',
  trustSignals: {
    medicalNote: 'Doctor visits go better when the app can turn daily records into something reviewable instead of asking you to summarize from memory.',
    privacyNote: 'Privacy depends on structure, not slogans. The right app should make storage and sharing boundaries legible.',
    legalNote: 'Documentation workflows benefit from consistent records and reversible sharing decisions.',
  },
  faqs: [
    {
      question: 'What should I compare when choosing a pain tracking app?',
      answer: 'Compare privacy defaults, offline use, how easy daily logging feels, what export options exist, and whether the app produces records you can actually use in appointments.',
    },
    {
      question: 'Do I need an app that works offline?',
      answer: 'If you want tracking to remain available during unstable connectivity, travel, low trust, or account issues, yes. Offline capability reduces a common failure point in daily use.',
    },
    {
      question: 'Why do exports matter in a pain tracker?',
      answer: 'Because the point of tracking is often to review patterns later or share a structured record with a clinician. If the data cannot leave the app cleanly, your control is weaker.',
    },
    {
      question: 'How does PainTracker position itself in that comparison?',
      answer: 'PainTracker is built around local-first daily tracking, user-controlled exports, and clinician-friendly records rather than account-first engagement loops.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracker App',
      description: 'Read the direct category page for PainTracker itself.',
      href: '/pain-tracker-app',
    },
    {
      title: 'Privacy and Offline Use',
      description: 'See the privacy and offline-first explainer.',
      href: '/privacy-offline-first-pain-tracker',
    },
    {
      title: 'Pain Diary Template',
      description: 'Compare app-based tracking with printable tracking.',
      href: '/pain-diary-template',
    },
    {
      title: 'Resources',
      description: 'Browse printable templates and clinician-oriented guides.',
      href: '/resources',
    },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Pain Tracking Apps Comparison', url: '/pain-tracking-apps-comparison' },
  ],
};

const comparisonPoints = [
  {
    title: 'Where does daily data live?',
    description: 'PainTracker keeps day-to-day tracking local-first by default instead of making routine use depend on a remote account.',
    icon: Shield,
  },
  {
    title: 'Can I still log pain offline?',
    description: 'PainTracker is built so daily logging remains available without treating network access as a prerequisite.',
    icon: WifiOff,
  },
  {
    title: 'Can I bring records to a doctor visit?',
    description: 'PainTracker focuses on exports and structured records that support later review rather than trapping the data inside the app.',
    icon: FileText,
  },
  {
    title: 'Does the workflow stay humane?',
    description: 'The app is shaped around low-friction daily use, clearer language, and trauma-informed design rather than feature sprawl alone.',
    icon: CheckCircle2,
  },
];

export const PainTrackingAppsComparisonPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="grid gap-6 md:grid-cols-2">
      {comparisonPoints.map((point) => {
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

export default PainTrackingAppsComparisonPage;
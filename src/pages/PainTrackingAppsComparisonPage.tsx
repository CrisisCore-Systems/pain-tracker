import React from 'react';
import { CheckCircle2, FileText, Shield, WifiOff } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../components/seo';

const pageContent: SEOPageContent = {
  slug: 'pain-tracking-apps-comparison',
  canonicalPath: '/pain-tracking-apps-comparison',
  title: 'Best Pain Tracking Apps in 2026',
  metaTitle: 'Best Pain Tracking Apps in 2026: Private, Free, Offline, and Printable Options',
  metaDescription:
    'Compare the best pain tracking apps for privacy, offline use, printable logs, chronic pain journaling, and doctor-ready symptom reports.',
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
  headline: 'Best pain tracking apps in 2026',
  subheadline:
    'Most pain apps can log symptoms. Fewer let you track privately without account lock-in, keep working offline, and hand over printable records when needed.',
  primaryCTA: {
    text: 'Try PainTracker free',
    href: '/start',
    download: false,
  },
  secondaryCTA: {
    text: 'Get the printable PDF',
    href: '/resources/daily-pain-tracker-printable',
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
      question: 'How does Pain Tracker position itself in that comparison?',
      answer: 'Pain Tracker is built around local-first daily tracking, user-controlled exports, and clinician-friendly records rather than account-first engagement loops.',
    },
  ],
  relatedLinks: [
    {
      title: 'Pain Tracker App',
      description: 'Read the direct category page for Pain Tracker itself.',
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
    description: 'Pain Tracker keeps day-to-day tracking local-first by default instead of making routine use depend on a remote account.',
    icon: Shield,
  },
  {
    title: 'Can I still log pain offline?',
    description: 'Pain Tracker is built so daily logging remains available without treating network access as a prerequisite.',
    icon: WifiOff,
  },
  {
    title: 'Can I bring records to a doctor visit?',
    description: 'Pain Tracker focuses on exports and structured records that support later review rather than trapping the data inside the app.',
    icon: FileText,
  },
  {
    title: 'Does the workflow stay humane?',
    description: 'The app is shaped around low-friction daily use, clearer language, and trauma-informed design rather than feature sprawl alone.',
    icon: CheckCircle2,
  },
];

const comparisonRows = [
  {
    app: 'PainTracker',
    free: 'Yes',
    offline: 'Yes',
    accountRequired: 'No',
    printableExport: 'Yes',
    privacyPosture: 'Local-first',
  },
  {
    app: 'App 2',
    free: 'Maybe',
    offline: 'No',
    accountRequired: 'Yes',
    printableExport: 'Maybe',
    privacyPosture: 'Cloud account',
  },
  {
    app: 'App 3',
    free: 'Maybe',
    offline: 'Maybe',
    accountRequired: 'Yes',
    printableExport: 'Maybe',
    privacyPosture: 'Cloud account',
  },
];

const nextStepCards = [
  {
    title: 'Try the free app',
    description: 'Use the local-first app if you want structured records, analysis, and export without cloud-first workflow lock-in.',
    href: '/start',
  },
  {
    title: 'Start with a printable',
    description: 'Use the daily printable if you need a no-setup option right now or want a paper backup lane.',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'Browse clinician resources',
    description: 'Move from comparison into doctor-visit and documentation pages that help convert tracking into usable records.',
    href: '/resources',
  },
];

export const PainTrackingAppsComparisonPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <div className="space-y-8">
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

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-left">
        <h2 className="mb-3 text-2xl font-semibold text-white">Quick comparison table</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          Compare the options by what changes real outcomes: privacy posture, offline reliability, account lock-in, and printable outputs.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-200">
                <th className="px-3 py-3 font-semibold">App</th>
                <th className="px-3 py-3 font-semibold">Free</th>
                <th className="px-3 py-3 font-semibold">Offline</th>
                <th className="px-3 py-3 font-semibold">Account Required</th>
                <th className="px-3 py-3 font-semibold">Printable Export</th>
                <th className="px-3 py-3 font-semibold">Privacy Posture</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.app} className="border-b border-slate-800 align-top text-slate-300">
                  <td className="px-3 py-3 font-medium text-white">{row.app}</td>
                  <td className="px-3 py-3">{row.free}</td>
                  <td className="px-3 py-3">{row.offline}</td>
                  <td className="px-3 py-3">{row.accountRequired}</td>
                  <td className="px-3 py-3">{row.printableExport}</td>
                  <td className="px-3 py-3">{row.privacyPosture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left">
        <h2 className="mb-3 text-2xl font-semibold text-white">Want a private option you can start using now?</h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-300">
          Start with the free app if you want daily tracking now, or move into the printable and doctor-visit lanes if paper fits better today.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {nextStepCards.map((card) => (
            <a key={card.title} href={card.href} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-left transition hover:border-emerald-500/60 hover:bg-slate-900">
              <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{card.description}</p>
            </a>
          ))}
        </div>
      </section>

    </div>
  </SEOPageLayout>
);

export default PainTrackingAppsComparisonPage;
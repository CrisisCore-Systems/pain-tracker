import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  HardDrive,
  CloudOff,
  Download,
  TriangleAlert,
  Database,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';
import { LandingFooter } from '../components/landing/LandingFooter';

const breadcrumbSchema = combineSchemas(
  generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Privacy Architecture', url: '/privacy-architecture' },
    ],
    { siteUrl: 'https://www.paintracker.ca' }
  )
);

const deviceItems = [
  'Pain entries, symptom logs, medication notes, and daily function records stay in browser storage on your device by default.',
  'Accessibility and interface preferences such as theme or layout settings also stay local.',
  'Reports do not leave the device unless you deliberately export or share them.',
  'The app is designed so routine tracking does not require an account or a remote profile.',
];

const noCollectItems = [
  'No account sign-up flow for everyday use.',
  'No central cloud database collecting your day-to-day pain history by default.',
  'No routine need to send symptom logs to a backend just to keep using the app.',
  'No promise that a third party will hold a recovery copy of your records for you.',
];

const tradeoffItems = [
  'Local-first storage reduces routine exposure, but it also means you carry more responsibility for backup and recovery.',
  'If browser storage is cleared, the device is lost, or local data becomes corrupted, records may be unrecoverable unless you exported them earlier.',
  'A local-first app can lower cloud risk without eliminating device risk, browser risk, or human error.',
  'PainTracker.ca is designed to be useful under fatigue and interruption, not to make data loss impossible.',
];

const whyItMattersItems = [
  {
    title: 'Chronic pain is often tracked under bad conditions',
    body: 'People do not log pain only when they are rested, online, and ready to troubleshoot. Local-first design lowers the number of things that have to go right before someone can write down what happened.',
  },
  {
    title: 'Documentation is often assembled gradually',
    body: 'For appointments, disability paperwork, or claim-related discussions, the value is often in the accumulated record. Keeping that routine capture local by default gives users more control over when those records leave the device.',
  },
  {
    title: 'Some users need lower visibility and lower friction',
    body: 'People dealing with trauma, cognitive overload, coercive dynamics, unstable housing, or shared devices may need a tool that does less by default, not more. Local-first is partly about reducing needless exposure surfaces.',
  },
];

const faqs = [
  {
    question: 'Do I need an account to use PainTracker.ca?',
    answer:
      'No. Routine use does not require an account. That is part of the privacy posture, because daily tracking does not need to be tied to a remote profile just to work.',
  },
  {
    question: 'What happens if I clear browser storage?',
    answer:
      'If browser storage is cleared, local records may be removed with it. PainTracker.ca does not assume that a remote service is keeping a backup copy for you.',
  },
  {
    question: 'Does PainTracker.ca send my pain history to a cloud database?',
    answer:
      'Routine pain history is intended to stay local by default rather than being uploaded into a central cloud database as part of normal use.',
  },
  {
    question: 'How do exports work?',
    answer:
      'Exports are user-controlled actions. You decide when to generate a PDF, CSV, or JSON file and where to keep or share it after that.',
  },
  {
    question: 'Who is responsible for backups?',
    answer:
      'You are. Local-first design gives you more control, but it also means you should export and keep backups yourself if the records matter later.',
  },
  {
    question: 'Does local-first mean my data is impossible to lose?',
    answer:
      'No. Local-first changes where routine data lives. It does not make loss impossible, and it does not replace good backup habits.',
  },
  {
    question: 'What does the app not promise?',
    answer:
      'It does not promise perfect security, guaranteed privacy, guaranteed recoverability, or any medical, legal, insurance, disability, or claim outcome.',
  },
  {
    question: 'Why not just keep everything in the cloud?',
    answer:
      'For many users, cloud-first design adds exposure, account friction, and more moving parts. PainTracker.ca treats local-first storage as a way to keep routine tracking usable and more controlled by default.',
  },
];

export const PrivacyArchitecturePage: React.FC = () => {
  useEffect(() => {
    return applyPageMetadata({
      title: 'Privacy Architecture | PainTracker.ca',
      description:
        'See how PainTracker.ca approaches local-first storage, user-controlled exports, backup responsibility, and privacy tradeoffs without cloud-default data collection.',
      canonicalUrl: 'https://www.paintracker.ca/privacy-architecture',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md"
      >
        Skip to main content
      </a>

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-semibold text-white tracking-tight">
            Pain Tracker
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="text-sm text-slate-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/start" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition-colors">
              Start Tracking Free
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
        <section className="mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 mb-6">
            <Shield className="h-4 w-4" />
            Privacy Architecture
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Privacy is architecture, not a slogan
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-slate-300 mb-6">
            PainTracker.ca is built so routine tracking can stay local by default. That is a product decision, not just a policy statement. No account is required for everyday use, exports are deliberate user actions, and the app is designed to avoid turning daily pain history into a cloud-default data stream.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-slate-400">
            This page explains what that means in practical terms, where the limits are, and what responsibilities still stay with the user.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 mb-16 lg:mb-20">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h2 className="flex items-center gap-3 text-2xl font-semibold mb-5">
              <HardDrive className="h-6 w-6 text-emerald-300" />
              What stays on your device
            </h2>
            <ul className="space-y-4 text-slate-300 leading-relaxed">
              {deviceItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h2 className="flex items-center gap-3 text-2xl font-semibold mb-5">
              <CloudOff className="h-6 w-6 text-sky-300" />
              What PainTracker.ca does not collect
            </h2>
            <ul className="space-y-4 text-slate-300 leading-relaxed">
              {noCollectItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Download className="h-6 w-6 text-amber-300" />
            Exports are user-controlled
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed max-w-4xl">
            <p>
              PainTracker.ca can generate exports such as PDF, CSV, or JSON files, but those files are created because you asked for them. Export is an explicit action, not a background behavior hidden inside routine use.
            </p>
            <p>
              That matters for appointments, documentation prep, and claim-related discussions because it lets you choose when to package the record, what form it takes, and where it goes next.
            </p>
            <p>
              Once you export a file, its handling becomes your responsibility. The export can be copied, printed, emailed, or stored elsewhere depending on what you do with it afterward.
            </p>
          </div>
        </section>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-5">
            <TriangleAlert className="h-6 w-6 text-amber-300" />
            Local-first tradeoffs
          </h2>
          <ul className="space-y-4 text-slate-300 leading-relaxed">
            {tradeoffItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Database className="h-6 w-6 text-rose-300" />
            Backup responsibilities
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed max-w-4xl">
            <p>
              If the record matters later, you should back it up yourself. PainTracker.ca does not assume a remote service is quietly storing a recovery copy behind the scenes.
            </p>
            <p>
              If browser storage is cleared, a device is lost, or local data is damaged, the app may not be able to restore those records unless you exported them earlier.
            </p>
            <p>
              The practical rule is simple: use local-first storage for routine privacy, and create user-controlled exports for anything you cannot afford to lose.
            </p>
          </div>
        </section>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Shield className="h-6 w-6 text-purple-300" />
            What the app does not promise
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed max-w-4xl">
            <p>
              PainTracker.ca does not promise perfect security, impossible-to-lose data, guaranteed privacy under every device condition, or automatic recoverability after local data is removed.
            </p>
            <p>
              It also does not promise any medical, legal, insurance, disability, or claim outcome. It is a record-keeping tool, not an official decision document.
            </p>
            <p>
              The goal is narrower and more defensible: reduce routine exposure by default, keep everyday tracking usable, and let users decide when records leave the device.
            </p>
          </div>
        </section>

        <section className="mb-16 lg:mb-20">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-8">
            <HeartHandshake className="h-6 w-6 text-emerald-300" />
            Why this matters
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {whyItMattersItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16 lg:mb-20">
          <h2 className="text-2xl font-semibold mb-8">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 p-6 group">
                <summary className="cursor-pointer list-none font-medium text-white flex items-center justify-between gap-4">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-slate-300 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-slate-900 to-emerald-500/10 p-8 lg:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Start tracking free</h2>
          <p className="max-w-2xl mx-auto text-slate-300 leading-relaxed mb-6">
            Use PainTracker.ca without creating an account, keep routine records local by default, and export only when you decide the record needs to travel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/start" className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-6 py-3 font-medium text-slate-950 hover:bg-sky-300 transition-colors">
              Start Tracking Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/privacy" className="text-sm font-medium text-sky-200 hover:text-white transition-colors">
              Read the privacy policy
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default PrivacyArchitecturePage;
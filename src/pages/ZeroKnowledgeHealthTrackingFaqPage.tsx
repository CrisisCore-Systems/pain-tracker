import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CloudOff,
  HardDrive,
  Lock,
  ArrowRight,
  CircleHelp,
  FileText,
  Download,
} from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema, generateFAQSchema } from '../lib/seo';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';
import { LandingFooter } from '../components/landing/LandingFooter';

const faqs = [
  {
    question: 'What does zero-knowledge mean in a health tracker?',
    answer:
      'In plain language, it means the provider is not supposed to hold a readable copy of your routine health records. In Pain Tracker, the stronger practical idea is local-first routine use: daily records stay on your device by default instead of being uploaded into a central service just to keep using the app.',
  },
  {
    question: 'Is Pain Tracker a cloud app with privacy settings?',
    answer:
      'No. The core distinction is architectural. A cloud app can still expose routine health data to server-side storage, admin access, or policy changes. Pain Tracker is designed so routine tracking does not require a cloud account or cloud-default storage path.',
  },
  {
    question: 'Does local-first mean no risk?',
    answer:
      'No. Local-first changes where routine data lives. It lowers routine cloud exposure, but device loss, cleared browser storage, human error, and unsafe export handling still matter. It is a narrower and more truthful claim than perfect privacy.',
  },
  {
    question: 'Why do Reddit and Hacker News users care about this distinction?',
    answer:
      'Because private is often used as marketing language for products that still centralize sensitive data. Technical users usually want to know where the data lives, whether routine use requires a server, and what the product can or cannot access by design.',
  },
  {
    question: 'Does Pain Tracker require an account?',
    answer:
      'No. You can start routine tracking without creating an account. That keeps the first session focused on your records instead of sign-up, passwords, and cloud dependency.',
  },
  {
    question: 'What happens when I need to share records with a doctor or claim reviewer?',
    answer:
      'That is handled through explicit exports. The point is to make sharing a deliberate act instead of a permanent condition of using the app. Once you export a file, handling that file becomes your responsibility.',
  },
];

const breadcrumbSchema = combineSchemas(
  generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Zero-Knowledge Health Tracking FAQ', url: '/zero-knowledge-health-tracking-faq' },
    ],
    { siteUrl: 'https://www.paintracker.ca' }
  ),
  generateFAQSchema(faqs)
);

const trustPoints = [
  {
    icon: <CloudOff className="h-5 w-5 text-sky-300" />,
    title: 'No cloud-default routine tracking',
    body: 'The app is designed so everyday logging does not depend on a remote profile or server-side pain history.',
  },
  {
    icon: <HardDrive className="h-5 w-5 text-emerald-300" />,
    title: 'Local-first by default',
    body: 'Routine records stay on your device unless you deliberately export or share them.',
  },
  {
    icon: <Lock className="h-5 w-5 text-amber-300" />,
    title: 'Truthful boundary language',
    body: 'The promise is not that nothing can ever go wrong. The promise is a narrower architecture with fewer routine exposure surfaces.',
  },
];

export const ZeroKnowledgeHealthTrackingFaqPage: React.FC = () => {
  useEffect(() => {
    return applyPageMetadata({
      title: 'Zero-Knowledge Health Tracking FAQ | PainTracker.ca',
      description:
        'A technical FAQ on zero-knowledge health tracking, local-first apps, and why Pain Tracker avoids cloud-default routine health storage.',
      canonicalUrl: 'https://www.paintracker.ca/zero-knowledge-health-tracking-faq',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
        <section className="mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 mb-6">
            <CircleHelp className="h-4 w-4" />
            Technical privacy FAQ
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Zero-knowledge health tracking, in plain language
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-slate-300 mb-6">
            This page is for people arriving from privacy-engineering communities, Reddit threads, or Hacker News discussions who want the architectural answer first: where the data lives, what the app does not need from you, and what local-first actually changes.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-slate-400">
            Pain Tracker is not presented here as magic, perfect secrecy, or a compliance shortcut. The point is simpler: routine symptom tracking should not have to become a cloud service relationship by default.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3 mb-16 lg:mb-20">
          {trustPoints.map((point) => (
            <article key={point.title} className="rounded-2xl border border-white/10 bg-white/10 p-6 lg:p-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                {point.icon}
              </div>
              <h2 className="text-xl font-semibold mb-3">{point.title}</h2>
              <p className="text-slate-300 leading-relaxed">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-white/10 bg-white/10 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16 lg:mb-20 rounded-2xl border border-white/10 bg-slate-900/60 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-4">Where to go next</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/privacy-architecture" className="rounded-xl border border-white/10 bg-white/10 p-5 hover:border-sky-400/40 transition-colors">
              <Shield className="h-5 w-5 text-sky-300 mb-3" />
              <h3 className="font-semibold mb-2">Read the privacy architecture</h3>
              <p className="text-sm text-slate-300">See the narrower product boundary in detail, including exports, local storage, and backup responsibility.</p>
            </Link>
            <Link to="/pain-tracking-apps-comparison" className="rounded-xl border border-white/10 bg-white/10 p-5 hover:border-sky-400/40 transition-colors">
              <FileText className="h-5 w-5 text-emerald-300 mb-3" />
              <h3 className="font-semibold mb-2">Compare private pain tracking apps</h3>
              <p className="text-sm text-slate-300">Use the comparison page if you want the practical tradeoffs between paper, local-first apps, and cloud account apps.</p>
            </Link>
            <Link to="/start" className="rounded-xl border border-white/10 bg-white/10 p-5 hover:border-sky-400/40 transition-colors">
              <Download className="h-5 w-5 text-amber-300 mb-3" />
              <h3 className="font-semibold mb-2">Start tracking free</h3>
              <p className="text-sm text-slate-300">Open the app without an account if you want to test the local-first workflow directly instead of reading more theory.</p>
            </Link>
          </div>
        </section>

        <section className="text-center">
          <Link to="/start" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors">
            Start tracking free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ZeroKnowledgeHealthTrackingFaqPage;
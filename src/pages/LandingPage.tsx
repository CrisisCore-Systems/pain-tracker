import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  Lock,
  Smartphone,
  FileText,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import '../styles/pages/landing.css';
import { LandingFooter } from '../components/landing';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  combineSchemas,
  defaultSEOConfig,
} from '../lib/seo';
import { trackUsageEvent } from '../utils/usage-tracking';

const homepageFaqs = [
  {
    question: 'Do I need an account?',
    answer: 'No. PainTracker.ca does not require an account to begin tracking.',
  },
  {
    question: 'Where are my pain records stored?',
    answer: 'Your core pain records are stored on your device.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'PainTracker.ca is designed to work offline after first load, depending on browser and device behavior.',
  },
  {
    question: 'Can I export my records?',
    answer: 'Yes. You can create a report when you choose to share information.',
  },
  {
    question: 'What happens if I lose my device?',
    answer:
      'Local records may be lost if the device is lost, damaged, reset, or browser data is cleared. Export important records regularly.',
  },
  {
    question: 'What happens if I forget my passphrase?',
    answer:
      'If encrypted records depend on your passphrase, PainTracker.ca cannot recover them for you.',
  },
  {
    question: 'Is this medical advice?',
    answer:
      'No. PainTracker.ca helps organize personal symptom records. It does not diagnose, treat, or replace professional advice.',
  },
  {
    question: 'Can it guarantee a claim outcome?',
    answer:
      'No. PainTracker.ca can help organize documentation, but it cannot guarantee medical, legal, insurance, disability, or WorkSafeBC outcomes.',
  },
] as const;

const trackingCards = [
  { title: 'Pain intensity', text: 'Track pain levels over time.' },
  { title: 'Body location', text: 'Record where pain shows up.' },
  {
    title: 'Symptoms',
    text: 'Capture burning, stabbing, aching, throbbing, numbness, fatigue, and other patterns.',
  },
  { title: 'Medication', text: 'Log medication use, dose changes, and timing notes.' },
  {
    title: 'Triggers',
    text: 'Record sleep, movement, weather, stress, food, injury, or activity patterns.',
  },
  {
    title: 'Daily function',
    text: 'Document what pain changed about walking, lifting, working, sleeping, self care, or household tasks.',
  },
  { title: 'Notes', text: 'Add context without being forced into a long journal entry.' },
  { title: 'Exports', text: 'Create a shareable record when you are ready.' },
] as const;

const pathCards = [
  {
    title: 'Start tracking privately',
    text: 'Open the app, log one pain entry, and keep the record on this device.',
    href: '/start',
    cta: 'Log Your First Entry',
  },
  {
    title: 'Use paper first',
    text: 'Print a simple daily pain tracker before you commit to a longer workflow.',
    href: '/resources/daily-pain-tracker-printable',
    cta: 'Open Daily Pain Tracker Printable',
  },
  {
    title: 'Compare free templates first',
    text: 'Browse the full resource hub or open the printable starter pack if you want the shortest paper-first path.',
    href: '/assets/free-pain-tracking-starter-pack.zip',
    cta: 'Download Starter Pack ZIP',
    download: 'free-pain-tracking-starter-pack.zip',
  },
  {
    title: 'Prepare for an appointment',
    text: 'Organize symptoms, medication changes, triggers, and functional impact.',
    href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    cta: 'Prepare Records',
  },
  {
    title: 'Document injury or disability impact',
    text: 'Keep structured notes about pain, limitations, and recovery changes.',
    href: '/resources/worksafebc-pain-journal-template',
    cta: 'Open WorkSafeBC Template',
  },
  {
    title: 'Review the privacy model',
    text: 'See how PainTracker.ca is built around local control.',
    href: '/tracking-data-policy',
    cta: 'Read Tracking Data Policy',
  },
] as const;

const freePainResourceLinks = [
  {
    title: 'Pain tracking resources',
    text: 'Use the resource hub as the central starting point for printables, guides, app paths, and privacy details.',
    href: '/resources',
    cta: 'Open resources hub',
  },
  {
    title: 'Daily pain tracker printable',
    text: 'Print a simple daily tracker for pain, flares, medication patterns, function, and notes.',
    href: '/resources/daily-pain-tracker-printable',
    cta: 'Open daily printable',
  },
  {
    title: 'Chronic pain diary template',
    text: 'Track longer term pain patterns across baseline days, flares, sleep, medication, and daily function.',
    href: '/resources/chronic-pain-diary-template',
    cta: 'Open chronic pain diary',
  },
  {
    title: 'Pain scale chart printable',
    text: 'Use a printable 0-10 reference so pain scores are easier to compare across entries and appointments.',
    href: '/resources/pain-scale-chart-printable',
    cta: 'Open pain scale chart',
  },
  {
    title: 'What to include in a pain journal',
    text: 'Use the checklist before appointments so entries stay useful without becoming too much to maintain.',
    href: '/resources/what-to-include-in-pain-journal',
    cta: 'Open pain journal guide',
  },
  {
    title: 'Download PainTracker',
    text: 'Install or open the private offline pain tracker when paper becomes hard to review or carry forward.',
    href: '/download',
    cta: 'Download PainTracker',
  },
  {
    title: 'Tracking data policy',
    text: 'Review what PainTracker stores locally, what it does not collect by default, and how exports are handled.',
    href: '/tracking-data-policy',
    cta: 'Read data policy',
  },
] as const;

export const LandingPage: React.FC = () => {
  const trackFunnelEvent = (type: string, surface: string) => {
    trackUsageEvent(type, 'funnel', { surface, route: '/' });
  };

  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const faqSchema = generateFAQSchema(
    homepageFaqs.map(faq => ({ question: faq.question, answer: faq.answer }))
  );
  const combinedSchema = combineSchemas(organizationSchema, webSiteSchema, faqSchema);

  useEffect(() => {
    const meta = {
      title: 'PainTracker.ca | Free Private Pain Tracker App That Works Offline',
      description:
        'PainTracker.ca helps you log a first pain entry, keep records on your device, and export when ready. No account, offline capable, and built for user controlled sharing.',
      keywords:
        'private pain tracker, offline pain tracker, pain documentation app, no account pain tracker, pain tracker printable, worksafebc pain journal template',
    };

    document.title = meta.title;

    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', content);
    };

    updateMeta('meta[name="description"]', meta.description);
    updateMeta('meta[name="keywords"]', meta.keywords);
    updateMeta('meta[property="og:title"]', meta.title);
    updateMeta('meta[property="og:description"]', meta.description);
    updateMeta('meta[property="og:site_name"]', defaultSEOConfig.siteName);
    updateMeta('meta[property="og:image"]', defaultSEOConfig.defaultImage);
    updateMeta('meta[property="og:image:alt"]', defaultSEOConfig.defaultImageAlt);
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
    updateMeta('meta[name="twitter:image"]', defaultSEOConfig.defaultImage);
    updateMeta('meta[name="twitter:image:alt"]', defaultSEOConfig.defaultImageAlt);

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute('href', `${defaultSEOConfig.siteUrl}/`);

    return () => {
      document.title = defaultSEOConfig.siteName;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: combinedSchema }} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        role="main"
        className="landing-always-dark bg-slate-950 text-slate-100"
      >
        <section className="border-b border-white/10">
          <div className="container mx-auto px-4 py-16 lg:py-20 text-center max-w-4xl">
            <h1 className="landing-headline landing-headline-xl mb-5 text-white">
              Log your first pain entry privately, even offline.
            </h1>
            <p className="landing-subhead text-lg lg:text-xl mx-auto max-w-3xl mb-7">
              PainTracker.ca helps you log today's pain in under 90 seconds, keep the record on your
              device, and export a printable report when you choose. No account, no cloud pain
              database, no forced sharing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-5">
              <Link
                to="/start"
                data-testid="hero-cta-start"
                onClick={() => trackFunnelEvent('app_open_intent', 'landing_hero')}
                className="btn-cta-primary inline-flex items-center justify-center gap-2 px-7 py-3"
              >
                Log Your First Entry
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/resources/pain-diary-template-pdf"
                onClick={() => trackFunnelEvent('resource_page_opened', 'landing_hero')}
                className="btn-cta-outline inline-flex items-center justify-center gap-2 px-7 py-3"
              >
                <Download className="h-4 w-4" />
                Download Printable Pain Journal
              </Link>
            </div>
            <p className="text-sm text-slate-300">
              Use the printable if paper is safer today. Use the app if you want searchable,
              exportable records on this device.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-200">
              <Link
                to="/resources"
                onClick={() => trackFunnelEvent('resource_hub_opened', 'landing_hero')}
                className="inline-flex items-center gap-2 hover:text-sky-300 transition-colors"
              >
                Browse free pain tracker templates
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="/assets/free-pain-tracking-starter-pack.zip"
                download="free-pain-tracking-starter-pack.zip"
                className="inline-flex items-center gap-2 hover:text-sky-300 transition-colors"
              >
                Download the printable starter pack
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/45">
          <div className="container mx-auto px-4 py-10 lg:py-12 max-w-5xl">
            <img
              src="/assets/paintracker-local-first-architecture.svg"
              alt="Local-first architecture diagram showing on-device pain tracking and user-controlled export boundary"
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70"
            />
          </div>
        </section>

        <section id="trust-proof" className="border-b border-white/10 bg-slate-900/45">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-5xl">
            <h2 className="landing-headline landing-headline-md mb-4 text-white text-center">
              Private by architecture, not by promise.
            </h2>
            <p className="landing-subhead text-center max-w-3xl mx-auto mb-8">
              PainTracker.ca is built around local control. You can begin without an account, log a
              first pain record on your device, and export only when you choose.
            </p>
            <div className="mb-8">
              <img
                src="/assets/paintracker-privacy-refusal-strip.svg"
                alt="Privacy refusal strip showing no account gate, no cloud default, no silent sharing, and user-controlled export"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <h3 className="font-semibold text-white mb-1">No account required</h3>
                <p className="text-sm text-slate-300">
                  Start tracking without creating a profile, email login, or cloud identity.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <h3 className="font-semibold text-white mb-1">Local records</h3>
                <p className="text-sm text-slate-300">
                  Your core pain entries are stored on your device.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <h3 className="font-semibold text-white mb-1">Offline capable</h3>
                <p className="text-sm text-slate-300">
                  The app is designed to keep working after first load when your connection is
                  unreliable.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <h3 className="font-semibold text-white mb-1">Export by choice</h3>
                <p className="text-sm text-slate-300">
                  Create a report only when you decide to share records with someone else.
                </p>
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm text-slate-200">
              <li className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-300" />
                No account gate.
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                No central pain entry database.
              </li>
              <li className="inline-flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-300" />
                No required cloud login.
              </li>
              <li className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-300" />
                No forced sharing.
              </li>
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3">
              <Link
                to="/case-study"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition-colors"
              >
                Read the case study
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/proof"
                onClick={() => trackFunnelEvent('proof_page_opened', 'landing_trust')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-sky-400/40 hover:text-sky-200 transition-colors"
              >
                Inspect proof materials
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/CrisisCore-Systems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-sky-400/40 hover:text-sky-200 transition-colors"
              >
                View GitHub org
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-5xl">
            <h2 className="landing-headline landing-headline-md mb-7 text-white text-center">
              Track the details that matter.
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trackingCards.map(card => (
                <article
                  key={card.title}
                  className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <h3 className="font-semibold text-white mb-1.5">{card.title}</h3>
                  <p className="text-sm text-slate-300">{card.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <img
                src="/assets/paintracker-flare-safe-logging-flow.svg"
                alt="Flare-safe logging flow showing low-friction capture and delayed export by user choice"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/45">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-4xl text-center">
            <h2 className="landing-headline landing-headline-md mb-4 text-white">
              Make pain easier to explain.
            </h2>
            <p className="landing-subhead text-lg">
              Pain is hard to explain after the fact. Appointments are short. Memory is unreliable.
              Flares blur together. Important details disappear when you need them most.
            </p>
            <p className="text-base text-slate-300 mt-5">
              PainTracker.ca helps turn scattered pain experiences into structured records you can
              review, export, and explain.
            </p>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-4xl">
            <h2 className="landing-headline landing-headline-md mb-4 text-white text-center">
              Share records only when you choose.
            </h2>
            <p className="landing-subhead text-center mb-5">
              Create reports for appointments, physiotherapy, recovery tracking, workplace injury
              discussions, disability documentation, or personal review.
            </p>
            <p className="text-center text-slate-200 mb-5">
              PainTracker.ca helps organize your information. It does not decide what your records
              prove.
            </p>
            <div className="rounded-xl border border-amber-300/40 bg-amber-900/60 p-4 text-sm text-amber-100">
              PainTracker.ca does not provide medical advice, diagnosis, treatment, legal advice, or
              guaranteed claim outcomes. Always review exports before sharing them.
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/45">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-5xl">
            <h2 className="landing-headline landing-headline-md mb-7 text-white text-center">
              Choose your path
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pathCards.map(path => {
                const cardContent = (
                  <>
                    <h3 className="text-white font-semibold mb-1.5">{path.title}</h3>
                    <p className="text-sm text-slate-300 mb-4">{path.text}</p>
                    <span className="text-sm text-sky-300 inline-flex items-center gap-1">
                      {path.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </>
                );

                return 'download' in path ? (
                  <a
                    key={path.href}
                    href={path.href}
                    download={path.download}
                    className="rounded-xl border border-white/10 bg-slate-900/70 p-5 hover:border-sky-400/40 transition-colors"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    key={path.href}
                    to={path.href}
                    className="rounded-xl border border-white/10 bg-slate-900/70 p-5 hover:border-sky-400/40 transition-colors"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-5xl">
            <h2 className="landing-headline landing-headline-md mb-4 text-white text-center">
              Free Pain Tracking Resources
            </h2>
            <p className="landing-subhead text-center max-w-3xl mx-auto mb-8">
              Use PainTracker digitally, print a simple daily tracker, or prepare better notes
              before an appointment. These free resources help you record pain, flares, function,
              medication patterns, and symptom changes without giving up unnecessary personal data.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {freePainResourceLinks.map(guide => (
                <Link
                  key={guide.href}
                  to={guide.href}
                  className="rounded-xl border border-white/10 bg-slate-900/70 p-5 hover:border-sky-400/40 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-1.5">{guide.title}</h3>
                  <p className="text-sm text-slate-300 mb-4">{guide.text}</p>
                  <span className="text-sm text-sky-300 inline-flex items-center gap-1">
                    {guide.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-4xl text-center">
            <h2 className="landing-headline landing-headline-md mb-4 text-white">
              Built by CrisisCore Systems.
            </h2>
            <p className="landing-subhead mb-0">
              PainTracker.ca is built using Protective Computing principles: local control, data
              minimization, offline resilience, user controlled export, and privacy as architecture
              instead of decoration.
            </p>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/45">
          <div className="container mx-auto px-4 py-14 lg:py-16 max-w-4xl">
            <h2 className="landing-headline landing-headline-md mb-8 text-white text-center">
              FAQ
            </h2>
            <div className="space-y-3">
              {homepageFaqs.map(faq => (
                <details
                  key={faq.question}
                  className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <summary className="cursor-pointer font-semibold text-white">
                    {faq.question}
                  </summary>
                  <p className="text-sm text-slate-300 mt-3">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <ClipboardList className="h-8 w-8 text-sky-300 mx-auto mb-3" />
            <h2 className="landing-headline landing-headline-md mb-4 text-white">
              Documentation under pressure, without surrendering control.
            </h2>
            <p className="landing-subhead mb-7">
              Log what you can. Partial records are still useful. Your record does not need to be
              perfect to be helpful.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/start"
                className="btn-cta-primary inline-flex items-center justify-center gap-2 px-7 py-3"
              >
                Log Your First Entry
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/download"
                className="btn-cta-outline inline-flex items-center justify-center gap-2 px-7 py-3"
              >
                Download PainTracker Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

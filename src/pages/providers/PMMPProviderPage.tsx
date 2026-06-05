import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  CloudOff,
  Download,
  FileCheck,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../../lib/seo';
import { applyPageMetadata } from '../../components/seo/applyPageMetadata';

const SITE_URL = 'https://www.paintracker.ca';

const breadcrumbSchema = combineSchemas(
  generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'PMMP Provider Review', url: '/providers/pmmp' },
    ],
    { siteUrl: SITE_URL }
  )
);

const boundaryItems = [
  'No clinic login',
  'No EMR integration',
  'No staff dashboard',
  'No monitoring',
  'No automatic clinic access',
  'No WorkSafeBC integration',
];

const workerTrackingItems = [
  'Pain intensity, location, quality, and spread',
  'Flares, triggers, sleep disruption, and recovery timing',
  'Medication timing, perceived effect, and side effects',
  'Daily function limits, work impact, pacing, and missed tasks',
  'Appointment notes, questions, and worker-selected exports',
];

const clinicUseItems = [
  {
    title: 'Resource handout',
    body: 'Clinics can mention PainTracker.ca as an optional worker-controlled tracking resource without creating a clinic account or adding staff workflow.',
  },
  {
    title: 'Appointment preparation',
    body: 'Workers can bring a short PDF, CSV, JSON, or printed summary when they choose. The record remains self-reported and should be reviewed like any patient-provided note.',
  },
  {
    title: 'Feedback pilot',
    body: 'PMMP reviewers can assess readability, burden, safety language, and clinic fit over a 30-day feedback window without patient recruitment or live data access.',
  },
];

const pilotSteps = [
  'Review this PMMP overview and privacy summary.',
  'Test the public app with sample or personal non-sensitive entries only.',
  'Share feedback on appointment usefulness, wording, and missing safety boundaries.',
  'Decide whether the clinic wants to reference the resource, request changes, or decline.',
];

const privacyPoints = [
  'Routine pain records stay in browser storage on the worker device by default.',
  'No account is required for the basic tracking workflow.',
  'Exports are deliberate user actions. A clinic, employer, insurer, or WorkSafeBC does not receive records automatically.',
  'PainTracker.ca is not a diagnostic tool, not medical advice, and not an official WorkSafeBC form.',
  'Local-first design reduces routine exposure, but users still need their own backup/export habits.',
];

const mailtoHref =
  'mailto:support@paintracker.ca?subject=PainTracker%20PMMP%20provider%20feedback%20call&body=I%20would%20like%20to%20review%20PainTracker.ca%20for%20PMMP%20appointment-preparation%20fit.%0A%0AClinic%2Frole%3A%0APreferred%20times%3A%0AFeedback%20focus%3A%20privacy%20summary%20%2F%20appointment%20prep%20%2F%20WorkSafeBC-related%20wording%20%2F%20other';

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {children && <div className="mt-4 text-base leading-7 text-slate-300">{children}</div>}
    </div>
  );
}

export const PMMPProviderPage: React.FC = () => {
  useEffect(() => {
    return applyPageMetadata({
      title: 'PainTracker for PMMP Provider Review | Worker-Controlled Pain Tracking',
      description:
        'PMMP provider overview for PainTracker.ca: worker-controlled pain tracking, no clinic login, no EMR integration, no monitoring, and privacy-first appointment preparation.',
      canonicalUrl: `${SITE_URL}/providers/pmmp`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to main content
      </a>

      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            Pain Tracker
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
            <a href="#clinic-overview" className="hover:text-white">
              Overview
            </a>
            <a href="#privacy-summary" className="hover:text-white">
              Privacy
            </a>
            <a href="#pilot" className="hover:text-white">
              Pilot
            </a>
          </nav>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-md border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
          >
            <Mail className="h-4 w-4" />
            Feedback call
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="border-b border-white/10 bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                PMMP provider review
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pain tracking for PMMP appointment preparation, controlled by the worker.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                PainTracker.ca is a private, offline-capable pain tracking and appointment-preparation
                tool injured workers can use independently. It helps record pain, flares,
                medication effects, sleep disruption, function limits, triggers, and appointment notes
                without creating clinic workload or opening a monitoring relationship.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  Request a 30-minute feedback call
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/privacy-architecture"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  View privacy architecture
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Clinic-safe boundary</p>
                  <p className="text-sm text-slate-400">Positioned as an optional worker resource.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {boundaryItems.map(item => (
                  <div key={item} className="flex items-center gap-2 rounded-md bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="clinic-overview" className="border-b border-white/10 bg-slate-950 py-14">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <SectionHeading eyebrow="Clinic overview" title="What the tool is, and what it is not">
              <p>
                PainTracker.ca is for worker-controlled self-report and appointment preparation. It
                is not a clinic portal, not a patient monitoring service, not a diagnostic tool, not
                medical advice, and not an official WorkSafeBC form.
              </p>
            </SectionHeading>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {clinicUseItems.map(item => (
                <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/70 py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading eyebrow="Worker record" title="What workers can track">
              <p>
                The record is intentionally practical: short, dated notes that help a worker
                describe what changed between visits without relying on memory during pain, fatigue,
                or stress.
              </p>
            </SectionHeading>
            <div className="grid gap-3">
              {workerTrackingItems.map(item => (
                <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-slate-950/70 p-4">
                  <ClipboardList className="mt-0.5 h-5 w-5 flex-none text-sky-300" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy-summary" className="border-b border-white/10 bg-slate-950 py-14">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <SectionHeading eyebrow="Privacy summary" title="Privacy and consent boundaries">
              <p>
                The safest clinic framing is simple: workers control the record. A clinic can
                suggest the resource, but the app does not grant staff access and does not move
                routine tracking into a third-party health database by default.
              </p>
            </SectionHeading>

            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {privacyPoints.map((point, index) => {
                const Icon = [LockKeyhole, CloudOff, Download, FileCheck, ShieldCheck][index] ?? ShieldCheck;
                return (
                  <div key={point} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <p className="mt-3 text-sm leading-6 text-slate-300">{point}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pilot" className="border-b border-white/10 bg-slate-900/70 py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading eyebrow="30-day feedback pilot" title="Provider feedback without patient data access">
                <p>
                  The first outreach ask should be a review conversation, not a clinic integration.
                  The pilot asks whether the resource is readable, appropriately bounded, and useful
                  enough to mention during appointment-preparation conversations.
                </p>
              </SectionHeading>
              <a
                href={mailtoHref}
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start provider feedback request
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <ol className="grid gap-3">
              {pilotSteps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-lg border border-white/10 bg-slate-950/70 p-4">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-sky-400/15 text-sm font-semibold text-sky-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-slate-950 py-14">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-6 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <Stethoscope className="h-6 w-6 text-sky-300" />
              <h3 className="mt-4 text-base font-semibold text-white">For PMMP reviewers</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Review copy, privacy posture, and export readability before any clinic recommends the
                resource to workers.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <Users className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 text-base font-semibold text-white">For workers</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Keep a personal record that can be exported only when the worker decides it is useful
                to bring into a conversation.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <HeartPulse className="h-6 w-6 text-rose-300" />
              <h3 className="mt-4 text-base font-semibold text-white">For vulnerable-state use</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Preserve basic tracking when connectivity, energy, attention, or institutional access
                is unreliable.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 px-5 py-8 text-sm text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>PainTracker.ca is a worker-controlled tracking resource from CrisisCore Systems.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-architecture" className="hover:text-white">
              Privacy architecture
            </Link>
            <Link to="/proof" className="hover:text-white">
              Proof materials
            </Link>
            <a href="mailto:support@paintracker.ca" className="hover:text-white">
              support@paintracker.ca
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PMMPProviderPage;

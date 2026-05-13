import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, FileText, Shield, TriangleAlert } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';
import { LandingFooter } from '../components/landing/LandingFooter';

const CASE_STUDY_URL =
  'https://blog.paintracker.ca/how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study';

const breadcrumbSchema = combineSchemas(
  generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Case Study', url: '/case-study' },
    ],
    { siteUrl: 'https://www.paintracker.ca' }
  )
);

const problemPoints = [
  'Notes scattered across notebooks, phones, and memory.',
  'Missing days during the hardest periods.',
  'Inconsistent detail when someone needs a clear timeline later.',
  'Hours lost to manual formatting and reconstruction.',
];

const beforeSteps = [
  'Symptoms tracked inconsistently when pain or fatigue is already high.',
  'Details reconstructed later from memory, texts, and scraps of notes.',
  'Timeline reformatted again for every new request.',
  'Gaps weaken the record right when clarity matters most.',
];

const afterSteps = [
  'Short structured entries captured closer to the event.',
  'Optional context added when relevant instead of rebuilt later.',
  'Date range selected only when the user decides to export.',
  'Output reviewed before any sharing happens.',
];

const improvements = [
  'Tracking consistency improves because the record shape stays the same from day to day.',
  'Required details become easier to capture because the workflow is structured.',
  'Patterns and triggers become easier to explain because the entries are chronological and comparable.',
  'Packaging shifts from manual assembly toward user-controlled export.',
];

const privacyPoints = [
  'Routine records stay on the device by default.',
  'Exports happen only when the user chooses to create them.',
  'The output can be reviewed before it is shared with anyone else.',
  'The workflow is designed to reduce reconstruction work without promising claim outcomes.',
];

const nonClaims = [
  'It does not guarantee claim acceptance.',
  'It does not replace advice from a clinician, adjudicator, or lawyer.',
  'It does not claim affiliation with or endorsement by WorkSafeBC.',
  'It does not promise perfect record completeness or legal effect.',
];

export const CaseStudyPage: React.FC = () => {
  useEffect(() => {
    return applyPageMetadata({
      title: 'Case Study: Structured Documentation Without a Cloud Health Database | PainTracker.ca',
      description:
        'A composite case study showing how a local-first PainTracker workflow can reduce documentation burden while keeping health records under user control.',
      canonicalUrl: 'https://www.paintracker.ca/case-study',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-semibold text-white tracking-tight">
            Pain Tracker
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/proof" className="text-sm text-slate-300 hover:text-white transition-colors">
              Proof Materials
            </Link>
            <Link
              to="/start"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Start Tracking Free
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
        <section className="mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 mb-6">
            <FileText className="h-4 w-4" />
            Composite Workflow Case Study
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Structured documentation without a cloud health database.
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-slate-300 mb-6">
            This composite case study shows how a local-first PainTracker workflow can reduce documentation burden, improve consistency, and keep the user in control of what gets shared.
          </p>
          <div className="max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100 mb-8">
            Illustrative composite example. Individual outcomes vary. PainTracker is not affiliated with or endorsed by WorkSafeBC. This page is informational only and not medical or legal advice.
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/start" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-medium text-slate-950 hover:bg-sky-400 transition-colors">
              View PainTracker
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://crisiscore-systems.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium text-white hover:border-sky-400/40 hover:text-sky-200 transition-colors"
            >
              Contact CrisisCore
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-white/10 bg-white/10 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-4">The problem</h2>
          <p className="text-slate-300 leading-relaxed mb-5">
            When documentation depends on memory, scattered notes, and last-minute formatting, the result is predictable: missing days, inconsistent detail, and a stressful rewrite cycle exactly when the user has the least capacity.
          </p>
          <ul className="space-y-3 text-slate-300 leading-relaxed">
            {problemPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-rose-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-5">Workflow improvement summary</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="text-lg font-semibold mb-3">Before</h3>
              <ol className="space-y-3 text-slate-300 leading-relaxed list-decimal list-inside">
                {beforeSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-5">
              <h3 className="text-lg font-semibold mb-3">After</h3>
              <ol className="space-y-3 text-slate-300 leading-relaxed list-decimal list-inside">
                {afterSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-white/10 bg-white/10 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <ClipboardList className="h-6 w-6 text-sky-300" />
            What improved in the composite example
          </h2>
          <p className="text-slate-300 leading-relaxed mb-5">
            The gain comes from reducing reconstruction work, not from collecting more personal data than necessary.
          </p>
          <ul className="space-y-3 text-slate-300 leading-relaxed">
            {improvements.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-sky-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Shield className="h-6 w-6 text-emerald-300" />
            Privacy boundary summary
          </h2>
          <ul className="space-y-3 text-slate-300 leading-relaxed mb-5">
            {privacyPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-400 leading-relaxed">
            PainTracker helps organize a record. It does not decide what that record proves.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <TriangleAlert className="h-6 w-6 text-amber-300" />
            What this case study does not claim
          </h2>
          <ul className="space-y-3 text-slate-300 leading-relaxed">
            {nonClaims.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/10 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-4">Need a proof path, not a pitch deck?</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Read the full case-study article, inspect the proof materials behind the trust story, or use the product directly when you need structured records that can survive real life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={CASE_STUDY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Read the full case study
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/proof" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium text-white hover:border-sky-400/40 hover:text-sky-200 transition-colors">
              Inspect proof materials
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default CaseStudyPage;
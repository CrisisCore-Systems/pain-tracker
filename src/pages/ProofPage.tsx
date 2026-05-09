import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, Github, Shield, TriangleAlert } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';
import { LandingFooter } from '../components/landing/LandingFooter';

const GITHUB_ORG_URL = 'https://github.com/CrisisCore-Systems';
const REPO_BASE_URL = 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main';

const breadcrumbSchema = combineSchemas(
  generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Proof Materials', url: '/proof' },
    ],
    { siteUrl: 'https://www.paintracker.ca' }
  )
);

const artifactGroups = [
  {
    title: 'Canonical reference packet',
    description: 'Primary implementation artifact. This is the canonical versioned proof packet and should be used before legacy mapping drafts.',
    links: [
      {
        label: 'PainTracker Protective Computing Reference Packet v1.0',
        href: `${REPO_BASE_URL}/docs/trust/paintracker-protective-computing-reference-packet-v1.0.md`,
      },
    ],
  },
  {
    title: 'Defensibility packet',
    description: 'Shortest release-evidence summary covering scope, checks run, provisional scoring, and gate decision.',
    links: [
      {
        label: 'Defensibility packet execution snapshot',
        href: `${REPO_BASE_URL}/docs/trust/defensibility-packet.md`,
      },
    ],
  },
  {
    title: 'Threat model and boundaries',
    description: 'Read these first if you need the scope, exclusions, and explicit non-guarantees behind the trust story.',
    links: [
      { label: 'Threat model', href: `${REPO_BASE_URL}/docs/trust/threat-model.md` },
      { label: 'Boundary statement', href: `${REPO_BASE_URL}/docs/trust/boundary-statement.md` },
    ],
  },
  {
    title: 'Release evidence',
    description: 'Dated receipts from concrete verification passes. These are snapshots, not timeless guarantees.',
    links: [
      { label: 'Release evidence 2026-03-20', href: `${REPO_BASE_URL}/docs/trust/release-evidence-2026-03-20.md` },
      { label: 'Release evidence 2026-03-19', href: `${REPO_BASE_URL}/docs/trust/release-evidence-2026-03-19.md` },
      { label: 'Release evidence 2026-03-12', href: `${REPO_BASE_URL}/docs/trust/release-evidence-2026-03-12.md` },
    ],
  },
  {
    title: 'Verification policy',
    description: 'These documents explain how release evidence is supposed to be produced and reviewed.',
    links: [
      { label: 'Release gating policy', href: `${REPO_BASE_URL}/docs/trust/release-gating-policy.md` },
      { label: 'Scenario test protocol', href: `${REPO_BASE_URL}/docs/trust/scenario-test-protocol.md` },
      { label: 'Reversibility contract', href: `${REPO_BASE_URL}/docs/trust/reversibility-contract.md` },
    ],
  },
];

const nonGuarantees = [
  'These artifacts do not claim zero risk.',
  'They do not replace independent review.',
  'They do not claim every threat has been solved.',
  'They do not prove a deployed system forever without ongoing verification.',
];

export const ProofPage: React.FC = () => {
  useEffect(() => {
    return applyPageMetadata({
      title: 'Proof Materials and Release Evidence | PainTracker.ca',
      description:
        'Inspect release evidence, threat model documents, and defensibility materials behind CrisisCore trust claims.',
      canonicalUrl: 'https://www.paintracker.ca/proof',
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
            <Link to="/case-study" className="text-sm text-slate-300 hover:text-white transition-colors">
              Case Study
            </Link>
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              View GitHub Org
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16 lg:py-20">
        <section className="mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 mb-6">
            <FileCheck className="h-4 w-4" />
            Release Evidence and Trust Materials
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Trust is only useful if someone else can inspect it.
          </h1>
          <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-slate-300 mb-6">
            This page collects the public proof materials behind the trust story: release evidence, boundary statements, threat-model context, and defensibility artifacts.
          </p>
          <div className="max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100 mb-8">
            These materials show what was checked, what was in scope, and what remains out of scope. They are not a claim of perfect security or universal protection.
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              View GitHub proof-of-work
              <ArrowRight className="h-4 w-4" />
            </a>
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

        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-4">What this page is</h2>
          <p className="text-slate-300 leading-relaxed">
            This is an index of public materials that make trust claims inspectable: what the system says it does, what the threat model includes, what release evidence captured, what verification steps ran, and what non-guarantees still apply.
          </p>
          <p className="mt-4 text-slate-300 leading-relaxed">
            The canonical PainTracker implementation artifact is the PainTracker Protective Computing Reference Packet v1.0. Legacy mappings are retained only as historical drafts until rewritten against the current repository, CI evidence, and claim badge taxonomy.
          </p>
        </section>

        <section className="mb-12 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <TriangleAlert className="h-6 w-6 text-amber-300" />
            What this page is not
          </h2>
          <ul className="space-y-3 text-slate-300 leading-relaxed">
            {nonGuarantees.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-5">Artifact index</h2>
          <div className="grid gap-5">
            {artifactGroups.map((group) => (
              <article key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
                <h3 className="text-xl font-semibold mb-3">{group.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-5">{group.description}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200 transition-colors"
                      >
                        {link.label}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Shield className="h-6 w-6 text-emerald-300" />
            Verification path for reviewers
          </h2>
          <ol className="space-y-3 text-slate-300 leading-relaxed list-decimal list-inside">
            <li>Start with the defensibility packet for the shortest evidence summary.</li>
            <li>Read the threat model and boundary statement to understand scope and exclusions.</li>
            <li>Check the dated release evidence snapshots.</li>
            <li>Inspect the GitHub organization and related repository materials.</li>
            <li>Contact CrisisCore if you want this level of review applied to your own product.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
            <Github className="h-6 w-6 text-sky-300" />
            GitHub proof surface
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Public code and docs are part of the proof path because they let reviewers inspect implementation surfaces, tests, and artifacts at the source instead of taking summary copy on faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              View GitHub org
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/case-study" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium text-white hover:border-sky-400/40 hover:text-sky-200 transition-colors">
              Read the case study
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ProofPage;
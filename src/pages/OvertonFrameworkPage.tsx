import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Link as LinkIcon, Shield } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';

const OVERTON_FRAMEWORK_VERSION = '1.3';
const OVERTON_FRAMEWORK_DOI = '10.5281/zenodo.18688516';
const OVERTON_FRAMEWORK_DOI_URL = `https://doi.org/${OVERTON_FRAMEWORK_DOI}`;

const PAGE_META_DESCRIPTION =
  'The Overton Framework is a scope-locked canon for Protective Computing: systems-engineering principles for software operating under conditions of human vulnerability.';

const PAINTRACKER_REPO_URL = 'https://github.com/CrisisCore-Systems/pain-tracker';
const OVERTON_FRAMEWORK_SOURCE_URL = `${PAINTRACKER_REPO_URL}/tree/main/overton-framework`;

const CANONICAL_CITATION =
  'Overton, K. (2026). *The Overton Framework: Protective Computing in Conditions of Human Vulnerability* (Version 1.3). Zenodo. https://doi.org/10.5281/zenodo.18688516';

const BIBTEX = `@misc{overton2026overtonframework,
  author    = {Overton, K.},
  title     = {The Overton Framework: Protective Computing in Conditions of Human Vulnerability},
  year      = {2026},
  version   = {1.3},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.18688516},
  url       = {https://doi.org/10.5281/zenodo.18688516}
}`;

export const OvertonFrameworkPage: React.FC = () => {
  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Overton Framework', url: '/overton-framework' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  useEffect(() => {
    document.title = 'The Overton Framework — Protective Computing (Canon)';

    // Keep basic meta tags stable for this canonical page.
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', PAGE_META_DESCRIPTION);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'The Overton Framework — Protective Computing (Canon)');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', PAGE_META_DESCRIPTION);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'The Overton Framework — Protective Computing (Canon)');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', PAGE_META_DESCRIPTION);
    }

    return () => {
      document.title = 'Pain Tracker Pro';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main" className="max-w-3xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-cyan-400" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            The Overton Framework
          </h1>
          <p className="text-lg text-slate-300">Protective Computing · Canon v{OVERTON_FRAMEWORK_VERSION}</p>
          <p className="text-sm text-slate-400 mt-3">
            Author note: “Overton” is the author’s surname (not related to the political term “Overton window”).
          </p>
        </header>

        <section
          className="mb-10 p-6 rounded-xl bg-slate-800/60 border border-cyan-500/20"
          aria-labelledby="positioning"
        >
          <h2 id="positioning" className="text-xl font-bold mb-3 text-cyan-400">
            Positioning
          </h2>
          <p className="text-slate-300 leading-relaxed">
            The Overton Framework is a systems-engineering discipline for designing software under conditions of human
            vulnerability. PainTracker is its reference implementation.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={OVERTON_FRAMEWORK_DOI_URL}
              className="text-cyan-400 hover:text-cyan-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              Read the Canon (DOI)
            </a>
            <a
              href={OVERTON_FRAMEWORK_SOURCE_URL}
              className="text-cyan-400 hover:text-cyan-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              Source materials (GitHub)
            </a>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="stability-assumption">
          <h2 id="stability-assumption" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            The Stability Assumption
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Modern software often assumes users are operating inside a “stability envelope”. The Canon defines this
            assumption explicitly so systems can be engineered for what happens when stability degrades.
          </p>
          <ul className="space-y-2 text-slate-300 ml-4">
            <li>• Continuous connectivity</li>
            <li>• Cognitive surplus (enough executive function for complex flows)</li>
            <li>• Environmental safety (low coercion / surveillance risk)</li>
            <li>• Institutional trust (platforms are neutral/benevolent)</li>
          </ul>
        </section>

        <section className="mb-10" aria-labelledby="principles">
          <h2 id="principles" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            Protective Design Principles (summary)
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Canon specifies five normative principles (RFC-style requirement language). This is a short summary;
            the DOI is the authoritative reference.
          </p>
          <div className="space-y-4 text-slate-300">
            <div>
              <p className="font-semibold text-slate-200">Principle 1 — Radical Reversibility</p>
              <p className="leading-relaxed">No irreversible loss from actions taken during vulnerability states.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">Principle 2 — Minimum Necessary Exposure (Zero-Knowledge Default)</p>
              <p className="leading-relaxed">Minimize remote exposure; treat remote infrastructure as compellable.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">Principle 3 — Failure Containment (Local-First Authority)</p>
              <p className="leading-relaxed">Preserve essential read (and ideally write) utility without the network.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">Principle 4 — Cognitive Load Preservation</p>
              <p className="leading-relaxed">Reduce cognitive demand in crisis and avoid non-essential interruptions.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">Principle 5 — Asymmetric Power Defense</p>
              <p className="leading-relaxed">Mitigate coercion/surveillance and preserve user sovereignty and portability.</p>
            </div>
          </div>
        </section>

        <section
          className="mb-10 p-6 rounded-xl bg-slate-800/40 border border-slate-700/50"
          aria-labelledby="reference-implementation"
        >
          <h2 id="reference-implementation" className="text-xl font-bold mb-3 text-slate-100">
            PainTracker as reference implementation
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            PainTracker is designed so the default user experience works without reading the Canon, while still being a
            concrete implementation of Protective Computing constraints.
          </p>
          <ul className="space-y-2 text-slate-300 ml-4">
            <li>• Local-first operation (offline-capable after first load)</li>
            <li>• Strong privacy boundary by default (sensitive data stays on-device)</li>
            <li>• Non-proprietary exports for clinical and WorkSafeBC workflows</li>
          </ul>
          <div className="mt-4">
            <a
              href={PAINTRACKER_REPO_URL}
              className="text-cyan-400 hover:text-cyan-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              PainTracker source code
            </a>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="citation">
          <h2 id="citation" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            DOI + citation
          </h2>

          <div className="space-y-4">
            <p className="text-slate-300">
              Canonical DOI:{' '}
              <a
                href={OVERTON_FRAMEWORK_DOI_URL}
                className="text-cyan-400 hover:text-cyan-300 underline"
                target="_blank"
                rel="noreferrer"
              >
                {OVERTON_FRAMEWORK_DOI_URL}
              </a>
            </p>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Use this exact citation line:</p>
              <p className="text-slate-200 text-sm leading-relaxed">{CANONICAL_CITATION}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">BibTeX:</p>
              <pre className="text-xs text-slate-200 overflow-x-auto whitespace-pre" aria-label="BibTeX citation">
                {BIBTEX}
              </pre>
            </div>
          </div>
        </section>

        <section
          className="mb-12 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          aria-labelledby="boundary"
        >
          <h2 id="boundary" className="text-xl font-bold mb-3 text-emerald-400">
            Boundary
          </h2>
          <p className="text-slate-300 leading-relaxed">
            PainTracker can be used without knowledge of the framework.
          </p>
        </section>

        <div className="text-center">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
};

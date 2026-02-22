import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Link as LinkIcon, Shield } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';

const OVERTON_FRAMEWORK_VERSION = '1.3';
const OVERTON_FRAMEWORK_DOI = '10.5281/zenodo.18688516';
const OVERTON_FRAMEWORK_DOI_URL = `https://doi.org/${OVERTON_FRAMEWORK_DOI}`;

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
        </section>

        <section className="mb-10" aria-labelledby="concepts">
          <h2 id="concepts" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            Core concepts
          </h2>
          <ul className="space-y-2 text-slate-300 ml-4">
            <li>• Stability Assumption</li>
            <li>• Stability Bias</li>
            <li>• Vulnerability State Machine</li>
            <li>• Protective Design Principles</li>
            <li>• Protective Legitimacy Score (PLS)</li>
          </ul>
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

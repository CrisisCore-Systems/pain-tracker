import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Lock, Shield } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';
import '../styles/pages/landing.css';

const WHITEPAPER_VERSION = '1.3.0';
const WHITEPAPER_PDF_FILENAME = `PainTracker-Whitepaper-v${WHITEPAPER_VERSION}.pdf`;

export function WhitepaperPage() {
  useEffect(() => {
    document.title = 'Pain Tracker Whitepaper (PDF)';
    return () => {
      document.title = 'Pain Tracker Pro';
    };
  }, []);

  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Whitepaper', url: '/whitepaper' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  const pdfHref = `${import.meta.env.BASE_URL}assets/${WHITEPAPER_PDF_FILENAME}`;

  return (
    <div className="hero-section-dramatic">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md"
      >
        Skip to main content
      </a>

      <div className="hero-bg-mesh" />
      <div className="hero-grid-pattern" />
      <div className="hero-noise-overlay" />

      <div className="orb-container" aria-hidden="true">
        <div className="orb-glow orb-glow-sky w-96 h-96 -top-48 -left-48" />
        <div className="orb-glow orb-glow-purple w-72 h-72 top-1/4 -right-36" />
        <div className="orb-glow orb-glow-emerald w-72 h-72 -bottom-40 left-1/3" />
      </div>

      <main
        id="main-content"
        role="main"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 landing-badge">
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Whitepaper PDF</span>
            </span>
          </div>

          <h1 className="landing-headline landing-headline-lg text-white mb-6">
            Pain Tracker Whitepaper
          </h1>

          <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Technical framing of the local-first architecture, privacy boundary, and threat model.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href={pdfHref}
              download
              className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
              aria-label={`Download Pain Tracker whitepaper PDF v${WHITEPAPER_VERSION}`}
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Download PDF (v{WHITEPAPER_VERSION})
            </a>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">What’s inside</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              A concise description of the system boundaries and the choices made to keep sensitive health
              data on-device by default.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-200">
              <li className="flex items-start gap-3">
                <span className="landing-check mt-0.5" aria-hidden="true">✓</span>
                <span>Threat model + limitations (no over-claims)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="landing-check mt-0.5" aria-hidden="true">✓</span>
                <span>Local-first data flow and storage decisions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="landing-check mt-0.5" aria-hidden="true">✓</span>
                <span>Clinical export boundary and workflow intent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="landing-check mt-0.5" aria-hidden="true">✓</span>
                <span>Governance and validation roadmap</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-left">
            <h2 className="text-xl font-bold text-white mb-4">Key principles</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Local-first</h3>
                  <p className="text-sm text-slate-300">Designed to work offline after first load.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-emerald-300" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Privacy boundary</h3>
                  <p className="text-sm text-slate-300">No cloud storage of health data by default.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400">
                File: <span className="text-slate-300">{WHITEPAPER_PDF_FILENAME}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Eye, Lock, Server, Shield } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';

export const TrackingDataPolicyPage: React.FC = () => {
  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Tracking & Data Policy', url: '/tracking-data-policy' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  useEffect(() => {
    document.title = 'Tracking & Data Policy — Pain Tracker';
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
            <Shield className="h-12 w-12 text-emerald-400" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Tracking &amp; Data Policy
          </h1>
          <p className="text-lg text-slate-300">Pain Tracker by CrisisCore Systems</p>
          <p className="text-sm text-slate-500 mt-2">Effective: February 2026 · Version 1.0</p>
        </header>

        <section
          className="mb-12 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          aria-labelledby="default-heading"
        >
          <h2 id="default-heading" className="text-xl font-bold mb-3 text-emerald-400">
            Default: no off-device tracking
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Pain Tracker is designed to work <strong className="text-white">locally on your device</strong>. By default,
            your pain entries, notes, and reports stay on-device.
            Third-party analytics that would send data off-device is <strong className="text-white">disabled</strong>.
          </p>
        </section>

        <section className="mb-10" aria-labelledby="local-collection">
          <h2 id="local-collection" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            What we store locally (on your device)
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Health data you create</h3>
              <ul className="space-y-1 text-slate-400 ml-4">
                <li>• Pain entries (including timestamps, symptoms, and optional notes)</li>
                <li>• Mood/sleep/activity logs (if you use those features)</li>
                <li>• Exports you generate (PDF/CSV/JSON) saved via your browser/device</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Product usage counters (local-only)</h3>
              <p className="text-slate-300">
                The app can keep basic usage counters in your browser storage to help you understand your own patterns and
                to help us debug issues during development.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                These counters are designed to avoid storing free-text notes or raw health details in plaintext.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="no-collection">
          <h2 id="no-collection" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            What we do not collect (by default)
          </h2>
          <div className="space-y-3">
            {[
              {
                label: 'No health-content telemetry',
                desc: 'we do not send your pain entries, notes, or report contents to analytics providers by default',
              },
              {
                label: 'No account required',
                desc: 'we do not require sign-up, and we do not ask for your name or email to use the core app',
              },
              {
                label: 'No ads',
                desc: 'we do not run ad networks or behavioral advertising inside the app',
              },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="text-red-400 flex-shrink-0">❌</span>
                <span className="text-slate-300 text-sm">
                  <strong className="text-slate-200">{label}</strong> — {desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10" aria-labelledby="optional-analytics">
          <h2 id="optional-analytics" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            Third-party analytics (disabled)
          </h2>
          <p className="text-slate-300 mb-4">
            Pain Tracker does not load third-party analytics (for example, GA/GTM/Vercel Analytics), and our Content Security Policy blocks
            those origins as defense-in-depth.
          </p>
          <div className="space-y-3">
            {[
              {
                label: 'No remote analytics scripts',
                desc: 'the app does not append third-party analytics scripts into the page',
              },
              {
                label: 'No health-content telemetry',
                desc: 'pain entries, notes, and report contents are not sent to analytics providers by default',
              },
              {
                label: 'Local-only counters remain optional',
                desc: 'you can enable/disable local usage counters in Settings without sending data off-device',
              },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-cyan-400 font-semibold flex-shrink-0">{label}</span>
                <span className="text-slate-400 text-sm">— {desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mb-10 p-6 rounded-xl bg-slate-800/60 border border-cyan-500/20"
          aria-labelledby="controls"
        >
          <h2 id="controls" className="text-xl font-bold mb-3 text-cyan-400 flex items-center gap-2">
            <Lock className="h-5 w-5" aria-hidden="true" />
            Your controls
          </h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Enable/disable local usage counters in Settings</li>
            <li>• Export your data on demand (PDF/CSV/JSON)</li>
            <li>• Clear local data from the app (with a cancel window on destructive actions)</li>
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="alignment">
          <h2 id="alignment" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            How this aligns with Protective Computing
          </h2>
          <p className="text-slate-300 mb-4">
            This policy is intentionally conservative: we prefer product improvement through local-first design and
            user controls, rather than silent background collection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Local-first by default (no cloud dependency for core tracking)',
              'Minimum necessary exposure (avoid sending health content)',
              'Defense-in-depth network controls (CSP blocks third-party analytics origins)',
              'User agency (clear controls to opt out and export/delete data)',
            ].map(item => (
              <div
                key={item}
                className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <span className="text-emerald-400 flex-shrink-0">✅</span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 text-center" aria-labelledby="more">
          <h2 id="more" className="text-xl font-bold mb-4 text-white">More details</h2>
          <p className="text-slate-400 text-sm">
            For the broader privacy posture (local storage, encryption, and optional network features), see the{' '}
            <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              Privacy Policy
            </Link>
            .
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

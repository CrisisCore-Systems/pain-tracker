import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Download, Server } from 'lucide-react';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';

export const PrivacyPolicyPage: React.FC = () => {
  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  useEffect(() => {
    document.title = 'Privacy Policy — Pain Tracker';
    return () => { document.title = 'Pain Tracker Pro'; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main" className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-emerald-400" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-300">
            Pain Tracker by CrisisCore Systems
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Effective: February 2026 · Version 1.0
          </p>
        </header>

        {/* Privacy Promise Summary */}
        <section className="mb-12 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20" aria-labelledby="promise-heading">
          <h2 id="promise-heading" className="text-xl font-bold mb-3 text-emerald-400">Our Privacy Promise</h2>
          <p className="text-slate-300 leading-relaxed">
            Pain Tracker is built on a simple principle: <strong className="text-white">your health data belongs to you</strong>.
            We designed this application from the ground up to keep your information private and under your control.
            This is not a policy bolted on after the fact — it is the architecture of the software itself.
          </p>
        </section>

        {/* What Data Is Collected */}
        <section className="mb-10" aria-labelledby="data-collected">
          <h2 id="data-collected" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            What Data Is Collected
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Data You Create</h3>
              <ul className="space-y-1 text-slate-400 ml-4">
                <li>• Pain entries — severity, location, symptoms, notes, timestamps</li>
                <li>• Mood, sleep, and activity logs</li>
                <li>• Medication and treatment records</li>
                <li>• Export reports (PDF, CSV, JSON)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Data Stored Automatically</h3>
              <ul className="space-y-1 text-slate-400 ml-4">
                <li>• Application preferences (theme, layout, accessibility settings)</li>
                <li>• Encryption keys — derived from your passphrase, stored locally</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Where Data Is Stored */}
        <section className="mb-10" aria-labelledby="data-storage">
          <h2 id="data-storage" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            Where Your Data Is Stored
          </h2>
          <p className="text-slate-300 mb-4">
            <strong className="text-white">All data is stored locally on your device.</strong> Pain Tracker uses
            your browser&#39;s IndexedDB for persistence. Your health data is encrypted at rest using AES-GCM encryption.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Data stays on your device by default',
              'No cloud database',
              'No server-side storage of health records',
              'No account or sign-up required',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-emerald-400 flex-shrink-0">✅</span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do NOT Do */}
        <section className="mb-10" aria-labelledby="what-we-dont-do">
          <h2 id="what-we-dont-do" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            What We Do NOT Do
          </h2>
          <div className="space-y-3">
            {[
              { label: 'No cloud transmission', desc: 'your health data is never sent to our servers' },
              { label: 'No analytics on health data', desc: 'we do not analyze or profile your pain entries' },
              { label: 'No background health telemetry', desc: 'we do not send your entries, notes, or report contents to analytics providers by default' },
              { label: 'No third-party data sharing', desc: 'your data is never sold or shared' },
              { label: 'No advertising', desc: 'no ads, no ad tracking, no ad networks' },
              { label: 'No account required', desc: 'no email, no registration, no identity collection' },
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

        {/* User Controls */}
        <section className="mb-10" aria-labelledby="user-controls">
          <h2 id="user-controls" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            Your Controls
          </h2>
          <p className="text-slate-300 mb-4">You have full control over your data at all times:</p>
          <div className="space-y-3">
            {[
              { label: 'Export', desc: 'Generate PDF, CSV, or JSON reports whenever you choose' },
              { label: 'Delete', desc: 'Clear all data from your device through app settings' },
              { label: 'Encryption', desc: 'Your data is protected by a passphrase only you know' },
              { label: 'Sharing', desc: 'You decide when and with whom to share your exports' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-cyan-400 font-semibold flex-shrink-0">{label}</span>
                <span className="text-slate-400 text-sm">— {desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Optional Network Features */}
        <section className="mb-10" aria-labelledby="network-features">
          <h2 id="network-features" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            Optional Network Features
          </h2>
          <p className="text-slate-300 mb-4">
            Some features may make network requests when explicitly enabled.
            These features do <strong className="text-white">not</strong> transmit your health data.
          </p>
          <p className="text-slate-500 text-sm mb-4">
            For details on local usage counters and data handling, see the{' '}
            <Link to="/tracking-data-policy" className="text-cyan-400 hover:text-cyan-300 underline">
              Tracking &amp; Data Policy
            </Link>
            .
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" role="table">
              <thead>
                <tr className="border-b border-slate-700">
                  <th scope="col" className="py-2 pr-4 text-slate-400 font-medium">Feature</th>
                  <th scope="col" className="py-2 pr-4 text-slate-400 font-medium">Purpose</th>
                  <th scope="col" className="py-2 text-slate-400 font-medium">When Active</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2 pr-4 text-slate-300">Weather correlation</td>
                  <td className="py-2 pr-4 text-slate-400">Fetches local weather via same-origin proxy</td>
                  <td className="py-2 text-slate-400">Only when enabled in settings</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-slate-300">PWA updates</td>
                  <td className="py-2 pr-4 text-slate-400">Checks for new app versions</td>
                  <td className="py-2 text-slate-400">On app load (service worker)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Encryption */}
        <section className="mb-10 p-6 rounded-xl bg-slate-800/60 border border-cyan-500/20" aria-labelledby="encryption">
          <h2 id="encryption" className="text-xl font-bold mb-3 text-cyan-400">Encryption</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• <strong>AES-GCM</strong> encryption via libsodium</li>
            <li>• <strong>Passphrase-derived keys</strong> that never leave your device</li>
            <li>• <strong>Vault-based session management</strong> — data only accessible after you unlock</li>
          </ul>
          <p className="text-sm text-slate-500 mt-3">
            We cannot recover your data if you lose your passphrase. This is by design.
          </p>
        </section>

        {/* Contact & Links */}
        <section className="mb-12 text-center" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-xl font-bold mb-4 text-white">Questions?</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Open an Issue
            </a>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Security Policy
            </a>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Summary Box */}
        <section className="mb-12 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="font-bold text-emerald-400 mb-2">Summary</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your data is stored locally, encrypted, and never transmitted by default. You control exports and sharing.
            Third-party analytics is disabled; local usage counters are stored on-device.
          </p>
        </section>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
};

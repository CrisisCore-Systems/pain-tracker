import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Shield, Smartphone, Monitor, Globe, HelpCircle } from 'lucide-react';
import { combineSchemas, defaultSEOConfig, generateBreadcrumbSchema, generateFAQSchema } from '../lib/seo';
import { ResourceCtaStack } from '../components/seo';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Download', url: '/download' },
];

const downloadFaqs = [
  {
    question: 'Do I need an account to use Pain Tracker?',
    answer:
      'No. Pain Tracker is designed so you can start tracking without creating an account. Daily use stays local-first by default.',
  },
  {
    question: 'Can I install Pain Tracker like an app on my phone?',
    answer:
      'Yes. You can open Pain Tracker in a supported mobile browser and install it as a PWA so it behaves more like an app from your home screen.',
  },
  {
    question: 'Does the download page give me access to printable pain logs too?',
    answer:
      'Yes. Pain Tracker includes printable pain diary and symptom log resources for people who want paper-first tracking or appointment-ready records.',
  },
  {
    question: 'Can I export records for a doctor or claim paperwork?',
    answer:
      'Yes. Pain Tracker supports user-controlled exports so you can prepare structured records for appointments, documentation, or claim workflows when you decide to share them.',
  },
];

export const DownloadPage: React.FC = () => {
  const schema = combineSchemas(
    generateBreadcrumbSchema(
      breadcrumbs,
      { siteUrl: defaultSEOConfig.siteUrl }
    ),
    generateFAQSchema(downloadFaqs)
  );

  useEffect(() => {
    const meta = {
      title: 'Use Pain Tracker Online, Installed, or Self-Hosted | Pain Tracker',
      description:
        'Track pain privately. No account. Works offline. Bring better records to appointments.',
      canonicalUrl: `${defaultSEOConfig.siteUrl}/download`,
    };

    document.title = meta.title;

    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      }
    };

    updateMeta('meta[name="description"]', meta.description);
    updateMeta('meta[property="og:title"]', meta.title);
    updateMeta('meta[property="og:description"]', meta.description);
    updateMeta('meta[property="og:site_name"]', defaultSEOConfig.siteName);
    updateMeta('meta[property="og:url"]', meta.canonicalUrl);
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
    updateMeta('meta[name="twitter:url"]', meta.canonicalUrl);

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', meta.canonicalUrl);
    }

    return () => { document.title = defaultSEOConfig.siteName; };
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

      <main id="main-content" role="main" className="max-w-4xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.url} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-600">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-slate-300">{crumb.name}</span>
                ) : (
                  <Link to={crumb.url} className="hover:text-white transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Use Pain Tracker your way
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Track pain privately. No account. Works offline. Bring better records to appointments.
          </p>
        </header>

        {/* What It Does */}
        <section className="mb-16" aria-labelledby="what-it-does">
          <h2 id="what-it-does" className="text-2xl font-bold mb-6 text-white">What Pain Tracker helps you do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Track pain levels, locations, and symptoms',
              'Visualize patterns with charts and analytics',
              'Generate clinical PDF reports for your doctor',
              'WorkSafeBC-oriented export templates',
              'Fibromyalgia-specific scoring and tracking',
              'Works offline after first load',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Download Options */}
        <section className="mb-16" aria-labelledby="download-options">
          <h2 id="download-options" className="text-2xl font-bold mb-6 text-white">Get Pain Tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Web App */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-center">
              <Globe className="h-10 w-10 mx-auto mb-4 text-cyan-400" aria-hidden="true" />
              <h3 className="font-bold text-lg mb-2">Web App</h3>
              <p className="text-sm text-slate-400 mb-4">Use directly in your browser. No install needed.</p>
              <a
                href="https://www.paintracker.ca/start"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                Use the app free
              </a>
            </div>

            {/* PWA Install */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-center">
              <Smartphone className="h-10 w-10 mx-auto mb-4 text-emerald-400" aria-hidden="true" />
              <h3 className="font-bold text-lg mb-2">Install as App</h3>
              <p className="text-sm text-slate-400 mb-4">Install to your home screen for a native experience.</p>
              <a
                href="https://www.paintracker.ca/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Install for offline use
              </a>
            </div>

            {/* Source Code */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-violet-500/30 text-center">
              <Monitor className="h-10 w-10 mx-auto mb-4 text-violet-400" aria-hidden="true" />
              <h3 className="font-bold text-lg mb-2">Source Code</h3>
              <p className="text-sm text-slate-400 mb-4">Review the code or self-host if that matters to your trust model.</p>
              <a
                href="https://github.com/CrisisCore-Systems/pain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 transition-all"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="mb-16" aria-labelledby="screenshots">
          <h2 id="screenshots" className="text-2xl font-bold mb-6 text-white">Screenshots</h2>
          <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50">
            <img
              src="/main-dashboard.png"
              alt="Pain Tracker dashboard showing pain assessment form, analytics charts, and customizable widgets"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-sm text-slate-500 text-center mt-3">
            The Pain Tracker dashboard with 7-step assessment, analytics, and trauma-informed design.
          </p>
        </section>

        {/* Privacy Promise */}
        <section className="mb-16 p-8 rounded-xl bg-slate-800/60 border border-emerald-500/20" aria-labelledby="privacy-promise">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <h2 id="privacy-promise" className="text-2xl font-bold text-white">Privacy Promise</h2>
          </div>
          <div className="space-y-3 text-slate-300">
            <p>Your health data stays on your device. Always.</p>
            <ul className="space-y-2 ml-4">
              <li>✅ All data stored locally and encrypted</li>
              <li>✅ No cloud database, no server-side storage</li>
              <li>✅ No analytics on health data, no telemetry</li>
              <li>✅ No account or registration required</li>
              <li>✅ You control all exports and sharing</li>
            </ul>
            <p className="text-sm text-slate-400 mt-4">
              <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                Read our full Privacy Policy →
              </Link>
            </p>
          </div>
        </section>

        {/* Version & Links */}
        <section className="text-center mb-16" aria-labelledby="version-info">
          <h2 id="version-info" className="sr-only">Version Information</h2>
          <p className="text-slate-400 mb-4">
            Current version: <strong className="text-white">1.2.0</strong> ·
            License: <strong className="text-white">MIT</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Changelog
            </a>
            <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              Privacy Policy
            </Link>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              GitHub Source
            </a>
          </div>
        </section>

        <section
          className="mb-16 rounded-xl border border-slate-700/50 bg-slate-900/60 p-8"
          aria-labelledby="download-faq-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-cyan-400" aria-hidden="true" />
            <h2 id="download-faq-heading" className="text-2xl font-bold text-white">
              Download FAQs
            </h2>
          </div>
          <div className="space-y-4">
            {downloadFaqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-white">
                  {faq.question}
                </summary>
                <p className="mt-3 text-slate-300 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <ResourceCtaStack
          heading="Stay in the patient lane from here"
          body="If you are not ready to use the app yet, move sideways into printables or the record-sharing workflow instead of dropping into builder content."
        />

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

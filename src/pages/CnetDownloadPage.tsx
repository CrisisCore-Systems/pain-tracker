import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import '../styles/pages/landing.css';
import { CNET_DOWNLOAD_URL } from '../config/cnetDownload';

export function CnetDownloadPage() {
  const url = CNET_DOWNLOAD_URL;
  const isHttpUrl = /^https?:\/\//i.test(url);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      <div className="hero-grid-pattern" />

      <main className="relative container mx-auto px-4 py-16 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
            <Download className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">CNET Download</h1>
        </div>

        <p className="text-slate-300 leading-relaxed">
          This page is a single, stable place to reference the current CNET download location for Pain Tracker.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white">Download URL</h2>
          <p className="text-sm text-slate-400 mt-1">
            If this is an https link, you can click it. If it’s a local build path, copy it from below.
          </p>

          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
            {isHttpUrl ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 hover:text-sky-200 underline break-all"
              >
                {url}
              </a>
            ) : (
              <div className="font-mono text-sm text-slate-200 break-all">{url}</div>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

import React, { useEffect } from 'react';
import { Download } from 'lucide-react';

const WHITEPAPER_VERSION = '1.3.0';
const WHITEPAPER_PDF_FILENAME = `PainTracker-Whitepaper-v${WHITEPAPER_VERSION}.pdf`;

export function WhitepaperPage() {
  useEffect(() => {
    document.title = 'Pain Tracker Whitepaper (PDF)';
    return () => {
      document.title = 'Pain Tracker Pro';
    };
  }, []);

  const pdfHref = `${import.meta.env.BASE_URL}assets/${WHITEPAPER_PDF_FILENAME}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main" className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Pain Tracker Whitepaper
        </h1>

        <div className="mt-10">
          <a
            href={pdfHref}
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
            aria-label={`Download Pain Tracker whitepaper PDF v${WHITEPAPER_VERSION}`}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF (v{WHITEPAPER_VERSION})
          </a>
        </div>
      </main>
    </div>
  );
}

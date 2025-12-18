import React from 'react';
import { AlertTriangle, BookOpen, HelpCircle, LifeBuoy, HeartHandshake } from 'lucide-react';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

export default function HelpAndSupportPage() {
  const setShowWalkthrough = usePainTrackerStore(state => state.setShowWalkthrough);

  const handleViewTutorials = () => {
    setShowWalkthrough(true);
  };

  const handleOpenFaq = () => {
    window.open('https://paintracker.ca/docs/faq', '_blank', 'noopener');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@paintracker.ca?subject=Pain%20Tracker%20Support%20Request';
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30"
          >
            <HeartHandshake className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help &amp; Support</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              We're here to help you navigate your journey
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-slate-500 max-w-2xl leading-relaxed">
          If something feels confusing or overwhelming, you're not alone. These options can help
          you get oriented, find answers, or reach out for technical support.
        </p>
      </header>

      {/* Support Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Getting Started Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/15"
            >
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Getting started</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
            Walk through the core features step by step, at your own pace, inside the app.
          </p>
          <button
            onClick={handleViewTutorials}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/25"
          >
            View tutorials
          </button>
        </div>

        {/* FAQs Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/15"
            >
              <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">FAQs</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
            Find answers to common questions about privacy, backups, and everyday use.
          </p>
          <button
            onClick={handleOpenFaq}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25"
          >
            Browse FAQs
          </button>
        </div>

        {/* Contact Support Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg bg-sky-100 dark:bg-sky-500/15"
            >
              <LifeBuoy className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact support</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
            If something doesn't feel right in the app or you're stuck, you can email our team for technical help.
          </p>
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50"
          >
            Contact support
          </button>
        </div>
      </div>

      {/* Crisis Warning Section */}
      <section 
        className="rounded-xl p-5 flex gap-4 items-start bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
      >
        <div 
          className="p-2 rounded-lg flex-shrink-0 bg-amber-100 dark:bg-amber-500/15"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">If you're in crisis</h3>
          <p className="text-sm text-gray-700 dark:text-slate-400 leading-relaxed">
            Pain Tracker can't monitor your safety or respond to emergencies. If you're in
            immediate danger or thinking about harming yourself, please contact your local emergency
            services or crisis line right away.
          </p>
        </div>
      </section>
    </div>
  );
}

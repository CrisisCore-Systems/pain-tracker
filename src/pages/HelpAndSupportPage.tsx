import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../design-system';
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
            className="p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
            }}
          >
            <HeartHandshake className="h-6 w-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Help &amp; Support</h2>
            <p className="text-sm text-slate-400">
              We're here to help you navigate your journey
            </p>
          </div>
        </div>
        <p className="text-slate-500 max-w-2xl leading-relaxed">
          If something feels confusing or overwhelming, you're not alone. These options can help
          you get oriented, find answers, or reach out for technical support.
        </p>
      </header>

      {/* Support Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Getting Started Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <BookOpen className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Getting started</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Walk through the core features step by step, at your own pace, inside the app.
          </p>
          <button
            onClick={handleViewTutorials}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
            }}
          >
            View tutorials
          </button>
        </div>

        {/* FAQs Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'rgba(139, 92, 246, 0.15)' }}
            >
              <HelpCircle className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white">FAQs</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Find answers to common questions about privacy, backups, and everyday use.
          </p>
          <button
            onClick={handleOpenFaq}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
            }}
          >
            Browse FAQs
          </button>
        </div>

        {/* Contact Support Card */}
        <div
          className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'rgba(14, 165, 233, 0.15)' }}
            >
              <LifeBuoy className="h-5 w-5 text-sky-400" />
            </div>
            <h3 className="font-semibold text-white">Contact support</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            If something doesn't feel right in the app or you're stuck, you can email our team for technical help.
          </p>
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
            }}
          >
            Contact support
          </button>
        </div>
      </div>

      {/* Crisis Warning Section */}
      <section 
        className="rounded-xl p-5 flex gap-4 items-start"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        }}
      >
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(245, 158, 11, 0.15)' }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-300">If you're in crisis</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pain Tracker can't monitor your safety or respond to emergencies. If you're in
            immediate danger or thinking about harming yourself, please contact your local emergency
            services or crisis line right away.
          </p>
        </div>
      </section>
    </div>
  );
}

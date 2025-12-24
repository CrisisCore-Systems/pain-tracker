/**
 * Screenshot Showcase Page
 * Provides clean, demonstration-ready views for screenshot capture
 */

import React from 'react';
import { DataExportModal } from '../components/export/DataExportModal';
import { InteractiveBodyMap } from '../components/body-mapping/InteractiveBodyMap';
import { CrisisTestingDashboard } from '../components/accessibility/CrisisTestingDashboard';
import { Lock, Zap, DollarSign, Heart, Shield, Sparkles, Check, X } from 'lucide-react';
import type { PainEntry } from '../types';

// Demo data for screenshots
const DEMO_PAIN_ENTRIES: PainEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    baselineData: {
      pain: 7,
      locations: ['lower-back', 'right-knee'],
      symptoms: ['sharp', 'throbbing'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 5,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Demo pain entry for screenshot purposes',
  },
];

/**
 * Clean export modal view for screenshots
 */
export function ExportModalShowcase() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <DataExportModal
        isOpen={true}
        onClose={() => {}}
        entries={DEMO_PAIN_ENTRIES}
        title="Export to WorkSafe BC Forms"
      />
    </div>
  );
}

/**
 * Body map interaction showcase
 */
export function BodyMapShowcase() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Pinpoint Your Pain Locations
        </h1>
        <InteractiveBodyMap
          entries={DEMO_PAIN_ENTRIES}
          selectedRegions={['lower-back', 'right-knee']}
          onRegionSelect={() => {}}
          mode="selection"
        />
      </div>
    </div>
  );
}

/**
 * Privacy and security settings showcase
 */
export function PrivacySettingsShowcase() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
      </div>
      
      <div 
        className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-slate-700/50"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
              <p className="text-slate-400">Your data is protected by design</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">
                Local Storage Only
              </h3>
              <p className="text-slate-400">
                Your data is stored locally on your device using encrypted IndexedDB. We cannot
                access your information even if we wanted to.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="p-2 rounded-lg bg-sky-500/20">
              <Lock className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">
                AES-256 Encryption
              </h3>
              <p className="text-slate-400">
                All sensitive pain data is encrypted using military-grade AES-256 encryption before
                storage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">
                HIPAA Aligned
              </h3>
              <p className="text-slate-400">
                Built with HIPAA-aligned controls in mind, including audit trails and data protection
                measures (not a formal compliance certification).
              </p>
            </div>
          </div>

          <div className="text-center pt-4 mt-4 border-t border-slate-700/50">
            <p className="text-slate-400">
              <span className="text-emerald-400 font-medium">Unlike cloud-based competitors,</span> your medical data never leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Benefits grid showcase for social media
 */
export function BenefitsGridShowcase() {
  const benefits = [
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Local-only storage',
      gradient: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Zap,
      title: 'One-Click Forms',
      description: 'WorkSafe BC ready',
      gradient: 'from-sky-500 to-cyan-500',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      iconColor: 'text-sky-400',
    },
    {
      icon: DollarSign,
      title: 'Free Forever',
      description: 'No subscriptions',
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      icon: Heart,
      title: 'Clinical Grade',
      description: 'Evidence-based',
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">Why Choose Us</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Why Pain Tracker?
          </h1>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className={`p-8 rounded-2xl ${benefit.bgColor} border ${benefit.borderColor} text-center transition-all hover:-translate-y-1`}
                style={{
                  boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison grid showcase
 */
export function ComparisonGridShowcase() {
  const features = [
    { feature: 'Local Storage', us: true, competitor1: false, competitor2: false },
    { feature: 'WorkSafe BC Forms', us: true, competitor1: false, competitor2: true },
    { feature: 'Free Forever', us: true, competitor1: false, competitor2: false },
    { feature: 'Offline Mode', us: true, competitor1: true, competitor2: false },
    { feature: 'Trauma-Informed UI', us: true, competitor1: false, competitor2: false },
    { feature: 'No Subscription', us: true, competitor1: false, competitor2: false },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      
      <div 
        className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-slate-700/50"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div 
          className="p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Why Pay for Less?
          </h2>
        </div>
        
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-4 text-slate-300 font-medium">Feature</th>
                <th className="text-center py-4 px-4">
                  <span className="text-sky-400 font-bold">Pain Tracker</span>
                </th>
                <th className="text-center py-4 px-4 text-slate-500">
                  Competitor A
                </th>
                <th className="text-center py-4 px-4 text-slate-500">
                  Competitor B
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((item, index) => (
                <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 text-slate-300">{item.feature}</td>
                  <td className="text-center py-4 px-4">
                    {item.us ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
                        <X className="w-5 h-5 text-slate-500" />
                      </span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {item.competitor1 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
                        <X className="w-5 h-5 text-slate-500" />
                      </span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {item.competitor2 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50">
                        <X className="w-5 h-5 text-slate-500" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              Get More for Free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Crisis support showcase
 */
export function CrisisSupportShowcase() {
  return (
    <div className="min-h-screen bg-slate-900">
      <CrisisTestingDashboard />
    </div>
  );
}

/**
 * Main showcase router component
 */
export function ScreenshotShowcase() {
  const hash = window.location.hash;

  // Route to appropriate showcase based on hash
  switch (hash) {
    case '#demo-export':
    case '#demo-export-modal':
      return <ExportModalShowcase />;
    case '#demo-body-map':
      return <BodyMapShowcase />;
    case '#demo-settings':
      return <PrivacySettingsShowcase />;
    case '#demo-comparison':
      return <ComparisonGridShowcase />;
    case '#demo-crisis':
      return <CrisisSupportShowcase />;
    case '#demo-benefits':
      return <BenefitsGridShowcase />;
    default:
      return null;
  }
}
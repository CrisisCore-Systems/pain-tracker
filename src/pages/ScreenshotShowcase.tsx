/**
 * Screenshot Showcase Page
 * Provides clean, demonstration-ready views for screenshot capture
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { DataExportModal } from '../components/export/DataExportModal';
import { InteractiveBodyMap } from '../components/body-mapping/InteractiveBodyMap';
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
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
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
    </main>
  );
}

type FauxWcbField = {
  label: string;
  value: string;
};

function FauxWcbFieldRow({ label, value }: FauxWcbField) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-3">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-slate-200 text-sm font-medium text-right whitespace-pre-line">{value}</div>
    </div>
  );
}

function FauxWcbFormFrame({
  title,
  subtitle,
  mockFields,
}: {
  title: string;
  subtitle: string;
  mockFields?: FauxWcbField[];
}) {
  return (
    <div className="relative max-w-5xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className="p-8">
        {mockFields && mockFields.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/40 bg-slate-900/20 px-4 py-3">
              <div className="text-slate-300 text-sm font-semibold">Example Preview</div>
              <div className="text-slate-400 text-xs">Mock data — not real personal information</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockFields.map((field) => (
                <FauxWcbFieldRow key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
            <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-3">
              <div className="text-slate-400 text-sm">Notes / Summary</div>
              <div className="text-slate-200 text-sm mt-2 whitespace-pre-line">
                Auto-filled from recent entries. Average pain: 7/10. Primary locations: lower back, right knee.
                Functional impact: limited lifting, stairs.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <div className="h-8 rounded bg-slate-800/60" />
            </div>
            <div className="col-span-7">
              <div className="h-6 rounded bg-slate-800/40" />
            </div>
            <div className="col-span-5">
              <div className="h-6 rounded bg-slate-800/40" />
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="col-span-12">
                <div className="h-10 rounded bg-slate-800/30" />
              </div>
            ))}
            <div className="col-span-12">
              <div className="h-24 rounded bg-slate-800/25" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BlankWcbFormShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl" />
      </div>
      <FauxWcbFormFrame
        title="WorkSafeBC Form 6 (Blank)"
        subtitle="The paperwork wall: manual, repetitive, and easy to get wrong"
      />
    </main>
  );
}

export function ExportProcessShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white text-center">Export Options</h2>
          <p className="text-slate-400 text-center mt-2">
            One-click outputs that hold up in appointments and forms
          </p>
        </div>
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">WorkSafeBC Form 6</h3>
            <p className="text-slate-400 mt-1 text-sm">Claimant report, auto-filled</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">WorkSafeBC Form 7</h3>
            <p className="text-slate-400 mt-1 text-sm">Employer report, consistent formatting</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/20 border border-slate-700/30">
            <h3 className="text-white font-semibold">Clinical Summary (PDF)</h3>
            <p className="text-slate-400 mt-1 text-sm">Clean timeline and highlights</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/20 border border-slate-700/30">
            <h3 className="text-white font-semibold">Data Export (CSV/JSON)</h3>
            <p className="text-slate-400 mt-1 text-sm">Portable, audit-friendly</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function Form6PreviewShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
      </div>
      <FauxWcbFormFrame
        title="Generated Form 6 (Preview)"
        subtitle="Auto-filled from your entries — consistent, readable, defensible"
        mockFields={[
          { label: 'Worker name', value: 'Example Worker' },
          { label: 'Claim number', value: 'WCB-EXAMPLE-001' },
          { label: 'Date of injury', value: '2025-11-03' },
          { label: 'Employer', value: 'Example Construction Ltd.' },
          { label: 'Phone', value: '555-0100' },
          { label: 'City / Province', value: 'Vancouver, BC' },
          { label: 'Occupation', value: 'Site labourer (example)' },
          { label: 'Report date', value: '2026-01-13' },
        ]}
      />
    </main>
  );
}

export function Form7PreviewShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
      </div>
      <FauxWcbFormFrame
        title="Generated Form 7 (Preview)"
        subtitle="Employer report preview — the same structure every time"
        mockFields={[
          { label: 'Employer', value: 'Example Construction Ltd.' },
          { label: 'Claim number', value: 'WCB-EXAMPLE-001' },
          { label: 'Contact name', value: 'J. Example (HR)' },
          { label: 'Contact phone', value: '555-0123' },
          { label: 'Worksite', value: 'Vancouver, BC (example)' },
          { label: 'Job title', value: 'Labourer' },
          { label: 'Modified duties', value: 'Light duty; no lifting > 10 kg' },
          { label: 'Report date', value: '2026-01-13' },
        ]}
      />
    </main>
  );
}

export function TraumaModeShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white text-center">Trauma-Informed Mode</h2>
          <p className="text-slate-400 text-center mt-2">Choose the tone that helps you survive today</p>
        </div>
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Clinical</h3>
            <p className="text-slate-400 mt-2 text-sm">"Rate pain severity and functional limitation."</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Gentle</h3>
            <p className="text-slate-400 mt-2 text-sm">"How heavy is it right now? What feels harder today?"</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function OfflineShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white text-center">Offline-Ready</h2>
          <p className="text-slate-400 text-center mt-2">Works without internet — because life doesn’t wait for Wi‑Fi</p>
        </div>
        <div className="p-8 grid grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Log</h3>
            <p className="text-slate-400 mt-1 text-sm">Entries save locally</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Review</h3>
            <p className="text-slate-400 mt-1 text-sm">History stays available</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Export</h3>
            <p className="text-slate-400 mt-1 text-sm">Generate when you’re ready</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function BcBrandingShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white text-center">Built in BC</h2>
          <p className="text-slate-400 text-center mt-2">Built for BC workers navigating WorkSafe realities</p>
        </div>
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">Local-first</h3>
            <p className="text-slate-400 mt-1 text-sm">Your data stays on your device</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40">
            <h3 className="text-white font-semibold">WorkSafe-ready</h3>
            <p className="text-slate-400 mt-1 text-sm">Exports aligned to real paperwork</p>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Body map interaction showcase
 */
export function BodyMapShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
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
    </main>
  );
}

/**
 * Privacy and security settings showcase
 */
export function PrivacySettingsShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
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
    </main>
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
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
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
    </main>
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
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
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
    </main>
  );
}

/**
 * Crisis support showcase
 */
export function CrisisSupportShowcase() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/40">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Crisis Support</h2>
              <p className="text-slate-400 mt-2">
                If pain feels overwhelming, the app can surface support options—fast, private, and without judgment.
              </p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/20">
              <Heart className="w-6 h-6 text-rose-300" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20">
                <Shield className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <div className="text-white font-semibold">You’re not alone</div>
                <div className="text-slate-300 text-sm mt-1">
                  This is a supportive check-in screen. It’s here when you need it.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5">
              <div className="text-white font-semibold">Grounding</div>
              <div className="text-slate-400 text-sm mt-1">A 60‑second reset to lower intensity.</div>
              <div className="mt-4 inline-flex items-center justify-center w-full rounded-lg bg-slate-800/50 border border-slate-700/60 px-4 py-2 text-slate-200 text-sm">
                Start grounding
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5">
              <div className="text-white font-semibold">Reach out</div>
              <div className="text-slate-400 text-sm mt-1">Call or text your trusted contact.</div>
              <div className="mt-4 inline-flex items-center justify-center w-full rounded-lg bg-slate-800/50 border border-slate-700/60 px-4 py-2 text-slate-200 text-sm">
                Contact support
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5">
              <div className="text-white font-semibold">Emergency help</div>
              <div className="text-slate-400 text-sm mt-1">If you’re in immediate danger, contact local emergency services.</div>
              <div className="mt-4 inline-flex items-center justify-center w-full rounded-lg bg-rose-500/15 border border-rose-500/25 px-4 py-2 text-rose-100 text-sm">
                Show emergency options
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/20 p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20">
                <Sparkles className="w-5 h-5 text-violet-200" />
              </div>
              <div className="text-slate-300 text-sm">
                Privacy note: this screen is designed to avoid showing personal details.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Main showcase router component
 */
export function ScreenshotShowcase() {
  const location = useLocation();
  const hash = location.hash;

  // Route to appropriate showcase based on hash
  switch (hash) {
    case '#demo-blank-form':
      return <BlankWcbFormShowcase />;
    case '#demo-export':
      return <ExportModalShowcase />;
    case '#demo-export-modal':
      return <ExportProcessShowcase />;
    case '#demo-form-6':
      return <Form6PreviewShowcase />;
    case '#demo-form-7':
      return <Form7PreviewShowcase />;
    case '#demo-body-map':
      return <BodyMapShowcase />;
    case '#demo-settings':
      return <PrivacySettingsShowcase />;
    case '#demo-offline':
      return <OfflineShowcase />;
    case '#demo-trauma-mode':
      return <TraumaModeShowcase />;
    case '#demo-comparison':
      return <ComparisonGridShowcase />;
    case '#demo-crisis':
      return <CrisisSupportShowcase />;
    case '#demo-bc-branding':
      return <BcBrandingShowcase />;
    case '#demo-benefits':
      return <BenefitsGridShowcase />;
    default:
      return <ExportModalShowcase />;
  }
}
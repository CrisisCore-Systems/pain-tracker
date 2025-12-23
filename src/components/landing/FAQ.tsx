import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

const faqs: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: 'Is my pain data stored in the cloud?',
    a: (
      <>
        By default, Pain Tracker Pro stores your health data locally on your device. Some optional features (like backups or sharing)
        may involve leaving the device only when you explicitly enable them.
      </>
    ),
  },
  {
    q: 'What does “HIPAA-aligned” mean here?',
    a: (
      <>
        It describes privacy and security controls we aim to follow (data minimization, encryption, access controls), but it does not
        claim formal HIPAA compliance or that using the app makes an organization compliant.
      </>
    ),
  },
  {
    q: 'Can I export my data and leave anytime?',
    a: (
      <>
        Yes — export tools are built in. Available formats depend on your plan, and exports are initiated by you.
      </>
    ),
  },
  {
    q: 'Does it sync across devices?',
    a: (
      <>
        Pain Tracker Pro is offline-first. Cross-device sync is available only through explicitly enabled features (for example, backups).
      </>
    ),
  },
  {
    q: 'What is “trauma-informed design” in the app?',
    a: (
      <>
        It means the UI is designed to reduce shame, coercion, and cognitive load — with clear consent, gentle language, accessible
        defaults, and user control.
      </>
    ),
  },
  {
    q: 'Is WorkSafe BC export only for Canada?',
    a: (
      <>
        WorkSafe BC workflows are Canada-specific. You can still export clinical summaries and data for other regions, but the WCB format
        is targeted to WorkSafeBC.
      </>
    ),
  },
];

export const FAQ: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/60 to-slate-900" />

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-14 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-emerald inline-flex items-center gap-2 mb-6">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </div>
          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">Common questions, </span>
            <span className="gradient-text-animated">answered plainly</span>
          </h2>
          <p className="landing-subhead text-lg lg:text-xl">Quick clarity on privacy, pricing, exports, and clinician workflow.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 stagger-fade-up">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="glass-card-premium rounded-2xl p-6 border border-white/10"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-6">
                <span className="text-white font-semibold">{item.q}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </summary>
              <div className="mt-4 text-slate-400 text-sm leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const landingFaqs = [
  {
    question: 'What is a pain tracker?',
    answer:
      'A pain tracker is a structured log for recording pain, symptoms, triggers, treatments, and daily functioning over time. Pain Tracker is designed to work as a daily pain diary app and chronic pain tracker without making everyday use depend on the cloud.',
  },
  {
    question: 'What is the best pain tracking app to use offline?',
    answer:
      'If offline use and privacy are priorities, look for an app that keeps daily logging available without an account, stores data locally by default, and lets you export your records when you choose. Pain Tracker is built around that model.',
  },
  {
    question: 'Is there a free printable pain diary template?',
    answer:
      'Yes. The site includes printable pain diary and pain log templates under Resources, including daily, weekly, monthly, and condition-specific formats. They are meant to work as paper-first tools or as a bridge into the app.',
  },
  {
    question: 'Can I share a pain tracker report with my doctor?',
    answer:
      'Yes. Pain Tracker supports user-initiated exports so you can bring structured records to appointments or share them with a clinician when you decide to. Daily tracking remains local-first by default.',
  },
  {
    question: 'Is an offline pain tracker more private?',
    answer:
      'It can be. An offline-first design reduces how often your health data needs to leave your device. Pain Tracker is built so everyday pain logging works locally, with exports and sharing remaining user-controlled actions.',
  },
  {
    question: 'What is trauma-informed design in a pain tracker app?',
    answer:
      'It means the interface is designed to reduce shame, coercion, and cognitive load with clearer language, accessible defaults, and more user control. In a pain tracker, that matters because the app gets used under fatigue, distress, and interruption.',
  },
] as const;

export const FAQ: React.FC = () => {
  return (
    <section className="landing-always-dark relative py-24 lg:py-32 overflow-hidden">
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
          {landingFaqs.map((item) => (
            <details
              key={item.question}
              className="glass-card-premium rounded-2xl p-6 border border-white/10"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-6">
                <span className="text-white font-semibold">{item.question}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </summary>
              <div className="mt-4 text-slate-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

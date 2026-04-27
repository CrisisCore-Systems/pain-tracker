import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Download, HeartPulse } from 'lucide-react';

const ctas = [
  {
    title: 'Use the free pain tracker',
    description: 'Track pain privately on your device with no account required.',
    href: '/start',
    icon: HeartPulse,
  },
  {
    title: 'Get the printable PDF',
    description: 'Start with a paper pain diary, symptom log, or daily tracker PDF.',
    href: '/resources/pain-diary-template-pdf',
    icon: Download,
  },
  {
    title: 'Prepare for doctor visits',
    description: 'Move into appointment-ready resources and structured records when you are ready to bring evidence forward.',
    href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    icon: ClipboardList,
  },
] as const;

interface ResourceCtaStackProps {
  heading?: string;
  body?: string;
}

export const ResourceCtaStack: React.FC<ResourceCtaStackProps> = ({
  heading = 'Choose the next step that fits today',
  body = 'Use the free pain tracker, get the printable PDF, or prepare for doctor visits without being pushed into builder content first.',
}) => (
  <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 border-t border-slate-700/50" aria-labelledby="resource-cta-stack-heading">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 id="resource-cta-stack-heading" className="text-3xl font-bold text-white mb-4">
          {heading}
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed">{body}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {ctas.map((cta) => {
          const Icon = cta.icon;
          return (
            <Link
              key={cta.href}
              to={cta.href}
              className="group rounded-2xl border border-slate-700 bg-slate-800/70 p-6 text-left transition-all hover:border-primary/40 hover:bg-slate-800"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-primary transition-colors">
                {cta.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-400">{cta.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);
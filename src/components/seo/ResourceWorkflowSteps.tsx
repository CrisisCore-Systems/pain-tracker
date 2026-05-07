import React from 'react';
import { BarChart3, ClipboardList, Download, HeartPulse, Shield } from 'lucide-react';

export type ResourcePageIntent = 'general' | 'printable' | 'doctor' | 'claims';

interface WorkflowStep {
  title: string;
  description: string;
  icon: typeof HeartPulse;
}

interface WorkflowConfig {
  eyebrow: string;
  heading: string;
  body: string;
  steps: [WorkflowStep, WorkflowStep, WorkflowStep];
}

const workflowConfigs: Record<ResourcePageIntent, WorkflowConfig> = {
  general: {
    eyebrow: 'How it works',
    heading: 'Start with one useful record, then build from there',
    body: 'The best acquisition path is simple: capture what happened, review the pattern, then bring forward only what you choose to share.',
    steps: [
      {
        title: 'Track privately',
        description: 'Start with the app or a printable template. No account is required to get a first useful record.',
        icon: HeartPulse,
      },
      {
        title: 'Review patterns',
        description: 'Use a few days of entries to spot triggers, treatment response, and what is changing over time.',
        icon: BarChart3,
      },
      {
        title: 'Bring records forward',
        description: 'Turn raw notes into something you can use for appointments, advocates, or your own planning.',
        icon: ClipboardList,
      },
    ],
  },
  printable: {
    eyebrow: 'Paper to app',
    heading: 'Download it, use it, then move up only when paper becomes too much',
    body: 'Printable pages are the front door. They work immediately. The app becomes useful when you want cleaner history, less manual review, and easier summaries.',
    steps: [
      {
        title: 'Download or start free',
        description: 'Begin with a printable if you need something now, or open the app if you want to keep tracking on-device from day one.',
        icon: Download,
      },
      {
        title: 'Review a few days together',
        description: 'Look across 7 to 30 days for recurring flares, medication response, sleep disruption, and functional limits.',
        icon: BarChart3,
      },
      {
        title: 'Bring a clearer summary',
        description: 'Use the app when you want less chaos before appointments, claims, or treatment reviews.',
        icon: ClipboardList,
      },
    ],
  },
  doctor: {
    eyebrow: 'Appointment path',
    heading: 'Track first, then show the parts your doctor can actually use',
    body: 'A short appointment goes better when you arrive with a pattern instead of trying to reconstruct a month from memory.',
    steps: [
      {
        title: 'Track pain and function',
        description: 'Log pain, symptoms, medication response, sleep, and activity in a way that is sustainable for low-energy days.',
        icon: HeartPulse,
      },
      {
        title: 'Review the pattern',
        description: 'Notice what got worse, what helped, and which points matter most for the next treatment decision.',
        icon: BarChart3,
      },
      {
        title: 'Bring the summary forward',
        description: 'Use a cleaner record in the appointment so less time is spent explaining and more time is spent deciding.',
        icon: ClipboardList,
      },
    ],
  },
  claims: {
    eyebrow: 'Documentation path',
    heading: 'Build a record that is easier to follow under claim or disability pressure',
    body: 'Claims and benefit workflows usually fail on missing structure. The safer path is daily notes first, then a clearer summary of work impact, function, and treatment response.',
    steps: [
      {
        title: 'Track pain, work impact, and function',
        description: 'Keep day-by-day notes on pain, limits, flares, treatment, and what work or daily life you could not do.',
        icon: Shield,
      },
      {
        title: 'Review consistency over time',
        description: 'A longer record makes trends, recurring limitations, and treatment attempts easier to follow than isolated anecdotes.',
        icon: BarChart3,
      },
      {
        title: 'Bring forward what matters',
        description: 'Use cleaner summaries for doctors, advocates, or case review without handing over your entire private history by default.',
        icon: ClipboardList,
      },
    ],
  },
};

interface ResourceWorkflowStepsProps {
  intent?: ResourcePageIntent;
}

export const ResourceWorkflowSteps: React.FC<ResourceWorkflowStepsProps> = ({
  intent = 'general',
}) => {
  const config = workflowConfigs[intent];

  return (
    <section className="py-14 bg-slate-900/80 border-b border-slate-800" aria-labelledby="resource-workflow-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            {config.eyebrow}
          </p>
          <h2 id="resource-workflow-heading" className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {config.heading}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {config.body}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {config.steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">Step {index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResourceWorkflowSteps;
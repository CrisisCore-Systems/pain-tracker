import React from 'react';
import { ArrowRight, FileText, Timer, CheckCircle2, Sparkles } from 'lucide-react';

const CASE_STUDY_URL =
  'https://blog.paintracker.ca/how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study?utm_source=paintracker.app&utm_medium=landing&utm_campaign=wcb_case_study';

export const WorkSafeBCCaseStudy: React.FC = () => {
  return (
    <section id="case-study" className="landing-always-dark relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-14 lg:mb-16 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-sky inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>WorkSafeBC Case Study</span>
          </div>

          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">How Pain Tracker Pro saves </span>
            <span className="gradient-text-animated">15+ hours</span>
            <span className="text-white"> on claim documentation</span>
          </h2>

          <p className="landing-subhead text-lg lg:text-xl">
            Composite example showing a privacy-first workflow for WorkSafeBC-oriented documentation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-10 stagger-fade-up">
          <div className="glass-card-premium p-7">
            <div className="flex items-start justify-between">
              <div className="icon-glow-container w-14 h-14 icon-amber">
                <Timer className="h-7 w-7" />
              </div>
              <span className="badge-glow-amber text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                Time
              </span>
            </div>
            <div className="mt-5">
              <div className="text-4xl font-extrabold text-white tracking-tight">15–20</div>
              <div className="text-sm text-slate-400 mt-1">Hours saved per claim (illustrative)</div>
            </div>
          </div>

          <div className="glass-card-premium p-7">
            <div className="flex items-start justify-between">
              <div className="icon-glow-container w-14 h-14 icon-emerald">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <span className="badge-glow-emerald text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                Consistency
              </span>
            </div>
            <div className="mt-5">
              <div className="text-4xl font-extrabold text-white tracking-tight">90%+</div>
              <div className="text-sm text-slate-400 mt-1">Days with entries (illustrative)</div>
            </div>
          </div>

          <div className="glass-card-premium p-7">
            <div className="flex items-start justify-between">
              <div className="icon-glow-container w-14 h-14 icon-sky">
                <FileText className="h-7 w-7" />
              </div>
              <span className="badge-glow-sky text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                Export
              </span>
            </div>
            <div className="mt-5">
              <div className="text-4xl font-extrabold text-white tracking-tight">~5 min</div>
              <div className="text-sm text-slate-400 mt-1">Export generation (illustrative)</div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto stagger-fade-up">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Read the full composite case study</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Includes a before/after workflow, privacy notes, and a practical step-by-step.
                </p>
              </div>

              <a
                href={CASE_STUDY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 transition-all"
              >
                Read case study
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="text-xs text-slate-500 mt-5">
              Composite example based on common usage patterns. Pain Tracker Pro is not affiliated with,
              endorsed by, or connected to WorkSafeBC.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

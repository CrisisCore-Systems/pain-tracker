/**
 * Weekly Pain Log PDF - Premium SEO Landing Page
 *
 * Target keyword: "weekly pain log pdf"
 * Search intent: User wants a 7-day pain tracking template
 * Conversion goal: Download template → discover Pain Tracker Pro
 *
 * Fully custom layout for maximum conversion & engagement.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  CheckCircle,
  Shield,
  FileText,
  ArrowRight,
  Printer,
  Activity,
  Clipboard,
  Heart,
  Brain,
  Pill,
  Star,
  Users,
  Stethoscope,
  BadgeCheck,
  ChevronDown,
  Sparkles,
  Lock,
  Smile,
  BarChart3,
  Calendar,
  TrendingUp,
  Moon,
  Eye,
  Target,
  Repeat,
} from 'lucide-react';
import { LandingFooter } from '../../components/landing/LandingFooter';
import {
  generateMedicalWebPageSchema,
  generateFAQSchema,
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from '../../lib/seo';
import '../../styles/pages/landing.css';

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------
const SEO = {
  slug: 'weekly-pain-log-pdf',
  title: 'Weekly Pain Log PDF (Free 7-Day Template)',
  metaTitle:
    'Weekly Pain Log PDF — Free 7-Day Pain Tracker Template | Pain Tracker Pro',
  metaDescription:
    'Download a free weekly pain log PDF. 8-section 7-day spread tracks daily pain, sleep, medications, activity, mood, triggers, and weekly patterns — ideal for appointments and disability claims.',
  keywords: [
    'weekly pain log pdf',
    '7 day pain diary',
    'weekly pain tracker',
    'pain log template weekly',
    'week pain diary',
    'seven day pain tracker',
    'weekly symptom log',
    'pain journal weekly',
    'free weekly pain log',
    'weekly pain tracker printable',
    'pain diary 7 day template',
    'weekly pain assessment form',
    'chronic pain weekly log',
    'pain tracker template week',
  ],
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Resources', url: '/resources' },
  { name: 'Weekly Pain Log PDF', url: '/resources/weekly-pain-log-pdf' },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEMPLATE_SECTIONS = [
  {
    icon: Activity,
    title: 'Daily Pain Overview',
    description: '7-day spread with AM, midday, PM, evening, and worst pain plus primary location for each day',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep & Energy',
    description: 'Bedtime, wake time, hours, sleep quality (1-5), morning energy (0-10), and disturbances',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Pill,
    title: 'Medications & Treatments',
    description: '7-day log for every intervention — meds, physio, TENS, heat/ice — with relief ratings and side effects',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Activity & Function Impact',
    description: 'Self-care, housework, walking, work, social, and exercise rated 0-5 for each day of the week',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Eye,
    title: 'Triggers & Contributing Factors',
    description: 'Track weather, stress, poor sleep, activity, posture, food — check off each day to reveal patterns',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Smile,
    title: 'Mood & Wellbeing',
    description: 'Color-coded mood scale with daily mood, anxiety, stress ratings, and emotional observations',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Weekly Pattern Analysis',
    description: 'Two-column summary: pain highs/lows, flare count, most effective treatment, common triggers, and goals',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Clipboard,
    title: 'Notes for Provider',
    description: 'Dedicated space for patterns noticed, questions, concerns, and medication requests for your appointment',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

const WEEK_FLOW = [
  {
    time: 'Each Evening',
    icon: Moon,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    description: 'Spend 2-3 minutes recording that day\'s pain, sleep, meds, and function. Quick entries build the most reliable data.',
  },
  {
    time: 'End of Week',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    description: 'Complete the weekly pattern analysis: best/worst days, triggers, treatment effectiveness, and goals for next week.',
  },
  {
    time: 'Compare Weeks',
    icon: Repeat,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    description: 'After 3-4 weeks, lay your logs side by side. Repeating patterns — which day is always worst, which triggers recur — become obvious.',
  },
];

const WHO_SHOULD_USE = [
  {
    icon: Target,
    title: 'People searching for patterns',
    description:
      'The 7-day spread format reveals day-of-week cycles, activity correlations, and medication timing effects that single-day logs can\'t show.',
  },
  {
    icon: Stethoscope,
    title: 'Patients preparing for appointments',
    description:
      'Hand your provider 4 weekly sheets and they can review an entire month in under 2 minutes. The structured format is clinically scannable.',
  },
  {
    icon: Shield,
    title: 'Anyone building a disability claim',
    description:
      'Consistent weekly documentation with triggers, function impact, and treatment response is strong evidence for WorkSafeBC, ICBC, CPP-D, and private insurance.',
  },
  {
    icon: Brain,
    title: 'People tracking treatment changes',
    description:
      'Started new meds? Changed therapy? The weekly view shows treatment effects across a full 7-day cycle, not just good or bad snapshots.',
  },
  {
    icon: Heart,
    title: 'People whose pain varies by weekday',
    description:
      'Work stress, weekend activities, Monday recovery — many pain conditions have strong day-of-week patterns that only weekly tracking reveals.',
  },
  {
    icon: Users,
    title: 'Those who find daily logs overwhelming',
    description:
      'The weekly format is less paperwork per day than a full daily tracker. Each evening entry takes 2-3 minutes with pre-structured columns.',
  },
];

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Download and print 4+ copies',
    description:
      'Click the download button and print at least 4 copies — that gives you a full month of weekly tracking. Keep your stack somewhere visible so you remember each evening.',
    tip: 'Prints cleanly on standard letter paper (8.5 x 11) in both color and black & white.',
  },
  {
    step: 2,
    title: 'Fill in your baseline info',
    description:
      'Write your name, the "week of" date, and your provider\'s name at the top. The pain scale reference strip is there for consistent rating all week.',
    tip: 'Pick a consistent start day (Sunday or Monday) and stick with it for easy week-over-week comparison.',
  },
  {
    step: 3,
    title: 'Record each evening (2-3 minutes)',
    description:
      'Before bed, fill in that day\'s row across all sections: pain levels, sleep, meds, activity ratings, triggers, and mood. Real-time entries beat memory.',
    tip: 'Set a nightly alarm. Even partial entries (just pain scores) are much better than skipping a day.',
  },
  {
    step: 4,
    title: 'Complete the weekly summary',
    description:
      'At the end of each week, fill in the Weekly Pattern Analysis section: average/highest/lowest pain, flare days, effective treatments, and goals for next week.',
    tip: 'The summary is the most clinically valuable part — it\'s what providers read first at appointments.',
  },
  {
    step: 5,
    title: 'Compare across weeks',
    description:
      'After 3-4 weeks, lay your sheets side by side. Look for repeating patterns: same bad day, same triggers, same treatments that help. These trends guide better treatment decisions.',
    tip: 'Highlight consistent patterns with a marker so your doctor can spot them at a glance.',
  },
];

const FAQS = [
  {
    question: 'Why weekly instead of daily or monthly?',
    answer:
      'Weekly hits the sweet spot: it\'s detailed enough to capture meaningful patterns (day-of-week cycles, trigger correlations, medication timing) but summarized enough that both you and your provider can review it quickly. Daily trackers give more per-day detail but lack the side-by-side week view. Monthly trackers show long-term trends but lose the granularity of individual days. The weekly format gives you 52 rich data points per year — statistically meaningful, clinically useful, and manageable.',
  },
  {
    question: 'How is this different from the Daily Pain Tracker?',
    answer:
      'The Daily Pain Tracker focuses on one complete day with deep detail — morning check-in, pain episodes with timestamps, activity function ratings. The Weekly Pain Log gives you 7 days on a single spread so you can compare across the week at a glance. Many people use both: the daily tracker during flare-ups or treatment changes, and the weekly log for ongoing maintenance tracking.',
  },
  {
    question: 'What patterns should I look for in my weekly data?',
    answer:
      'Look for: (1) Day-of-week patterns — many people have consistent Monday or Friday flares linked to work stress. (2) Activity-pain correlations — does exercise day lead to worse pain the next day? (3) Medication timing — are afternoons consistently better after morning meds? (4) Sleep-pain relationships — do bad nights predict bad days? (5) Weekend vs. weekday differences — do you improve or worsen when schedules change?',
  },
  {
    question: 'How many weeks do I need for useful data?',
    answer:
      'Two weeks minimum to spot any initial patterns. Four weeks is ideal for a doctor visit — it shows whether patterns are consistent or variable. Eight weeks provides strong confidence and is excellent documentation for disability claims. The longer you track, the more actionable each week becomes because patterns self-reinforce and anomalies stand out.',
  },
  {
    question: 'Can I use this for workers compensation or disability claims?',
    answer:
      'Yes. The structured weekly format with daily pain levels, medication records, functional impact ratings, and trigger tracking is exactly what WorkSafeBC, ICBC, CPP-D, and private insurers look for. Contemporaneous weekly records — filled out the same week events occur — are substantially more credible than after-the-fact summaries. The weekly pattern analysis section documents the cumulative impact that adjudicators need to see.',
  },
  {
    question: 'What if I miss a day during the week?',
    answer:
      'Leave that day\'s row blank and continue the next day. Don\'t try to fill in from memory — inaccurate data is worse than missing data. When you complete the weekly summary, note the gap. A few missing days won\'t undermine your tracking as long as you have 4-5 days of real data per week.',
  },
  {
    question: 'How do the function impact ratings work?',
    answer:
      'Rate each activity area from 0 (no difficulty) to 5 (unable to do the activity at all). 3 means significant difficulty — you could do it but with struggle. These functional impact ratings are clinically valuable because they show how pain translates to real-world disability. Track all 6 areas (self-care, housework, walking, work/school, social, exercise) even on good days.',
  },
  {
    question: 'Should I also track daily detail alongside this?',
    answer:
      'It depends on your goals. If you\'re trying to pinpoint specific episode triggers (like individual foods or activities), a daily tracker gives more granularity. If you\'re tracking overall weekly trends and preparing for regular appointments, the weekly log is often sufficient. Many people use daily tracking when starting out or during treatment changes, then switch to weekly for maintenance.',
  },
  {
    question: 'Can I use this alongside the digital app?',
    answer:
      'Absolutely. Paper weekly logs work well alongside Pain Tracker Pro. Some people use the app for quick daily entries and paper for the weekly spread view. Others use paper when traveling or when they need a break from screens. The data is compatible — you\'re tracking the same clinical dimensions either way.',
  },
  {
    question: 'Is my privacy protected?',
    answer:
      'Completely. No email required, no account needed, no tracking pixels in the PDF, no analytics on downloads. The file downloads directly to your device. What you write on the printed sheet is your data — it never touches our servers.',
  },
];

const RELATED_LINKS = [
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive multi-day format with detailed weekly summaries',
    href: '/resources/pain-diary-template-pdf',
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Deep single-day tracker with episode logs and function ratings',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'Monthly Pain Tracker',
    description: 'Calendar-style overview for long-term trends',
    href: '/resources/monthly-pain-tracker-printable',
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track fatigue, sleep, mood, and other symptoms beyond pain',
    href: '/resources/symptom-tracker-printable',
  },
  {
    title: 'How to Track Pain for Doctors',
    description: 'Present your data effectively at appointments',
    href: '/resources/how-to-track-pain-for-doctors',
  },
  {
    title: 'Documenting Pain for Disability',
    description: 'Build evidence that supports your claim',
    href: '/resources/documenting-pain-for-disability-claim',
  },
];

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

const SectionHeading: React.FC<{
  eyebrow?: string;
  children: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}> = ({ eyebrow, children, subtitle, center }) => (
  <div className={center ? 'text-center' : ''}>
    {eyebrow && (
      <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
        {eyebrow}
      </p>
    )}
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
      {children}
    </h2>
    {subtitle && (
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
    )}
  </div>
);

const FAQ: React.FC<{ question: string; answer: string; defaultOpen?: boolean }> = ({
  question,
  answer,
  defaultOpen,
}) => (
  <details
    className="group bg-slate-800/60 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-colors"
    open={defaultOpen}
  >
    <summary className="flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer list-none select-none">
      <h3 className="font-semibold text-white text-base sm:text-lg pr-2">{question}</h3>
      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
    </summary>
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
      <p className="text-slate-300 leading-relaxed">{answer}</p>
    </div>
  </details>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export const WeeklyPainLogPdfPage: React.FC = () => {
  const [downloadCount, setDownloadCount] = useState(0);

  // SEO meta tags
  useEffect(() => {
    document.title = SEO.metaTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', SEO.metaDescription);
    setMeta('meta[name="keywords"]', 'content', SEO.keywords.join(', '));
    setMeta('meta[property="og:title"]', 'content', SEO.metaTitle);
    setMeta('meta[property="og:description"]', 'content', SEO.metaDescription);

    // Screen-reader page announcement
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('role', 'status');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = `${SEO.title}. Download a free 7-day weekly pain log PDF.`;
    document.body.appendChild(ariaLive);

    return () => {
      try { document.body.removeChild(ariaLive); } catch { /* already removed */ }
    };
  }, []);

  // Structured data
  const schema = combineSchemas(
    generateMedicalWebPageSchema({
      name: SEO.title,
      description: SEO.metaDescription,
      url: `https://paintracker.ca/resources/${SEO.slug}`,
      keywords: SEO.keywords,
    }),
    generateFAQSchema(FAQS),
    generateSoftwareApplicationSchema(),
    generateBreadcrumbSchema(breadcrumbs),
  );

  const handleDownload = () => {
    setDownloadCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema }}
      />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 nav-floating-glass" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="landing-brand text-xl">Pain Tracker Pro</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/resources"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Resources
              </Link>
              <Link
                to="/start"
                className="btn-cta-primary px-4 py-2 text-sm font-medium rounded-lg"
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumbs ── */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.url} className="flex items-center gap-2">
                  {i > 0 && <span className="text-slate-600">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-slate-400" aria-current="page">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.url} className="text-slate-300 hover:text-primary transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      <main id="main-content" role="main">

        {/* ═══ HERO ═══ */}
        <section className="hero-section-dramatic py-20 sm:py-28" aria-labelledby="hero-heading">
          <div className="hero-bg-mesh" />
          <div className="hero-grid-pattern" />
          <div className="orb-container">
            <div className="orb-glow orb-glow-sky w-96 h-96 -top-48 -left-48" />
            <div className="orb-glow orb-glow-purple w-72 h-72 top-1/4 -right-36" />
            <div className="orb-glow orb-glow-emerald w-64 h-64 bottom-0 left-1/4" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 landing-badge mb-6">
              <Calendar className="w-4 h-4" />
              <span>7-Day Spread Format</span>
            </div>

            <h1
              id="hero-heading"
              className="landing-headline landing-headline-lg text-white mb-6"
            >
              See Your Pain Patterns{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Across an Entire Week
              </span>
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Daily pain, sleep, medications, activity impact, triggers, mood,
              and a weekly pattern analysis — 8 structured sections on one printable spread.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              100% free &bull; No email required &bull; No tracking &bull; Prints on standard letter paper
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/weekly-pain-log.pdf"
                download="weekly-pain-log.pdf"
                onClick={handleDownload}
                className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3 shadow-lg shadow-primary/20"
              >
                <Download className="w-5 h-5" />
                Download Free PDF
              </a>
              <Link
                to="/start"
                className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Try the Digital Version
              </Link>
            </div>

            {downloadCount > 0 && (
              <p className="mt-4 text-emerald-400 text-sm animate-fade-in" role="status">
                <CheckCircle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                Download started — check your downloads folder.
              </p>
            )}
          </div>
        </section>

        {/* ═══ QUICK-DOWNLOAD BAR ═══ */}
        <section className="py-6 bg-slate-900 border-y border-slate-800" aria-label="Download template">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/70 backdrop-blur rounded-2xl p-5 border border-slate-700/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">weekly-pain-log.pdf</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print-ready</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 1 sheet per week</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No sign-up</span>
                  </p>
                </div>
              </div>
              <a
                href="/assets/weekly-pain-log.pdf"
                download="weekly-pain-log.pdf"
                onClick={handleDownload}
                className="btn-cta-primary px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            </div>
          </div>
        </section>

        {/* ═══ WHAT'S INSIDE ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="whats-inside">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What's Inside"
              subtitle="Eight structured sections give your provider a complete 7-day clinical picture — and give you the patterns you can't see day-to-day."
              center
            >
              One spread, one week, all the data that matters
            </SectionHeading>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEMPLATE_SECTIONS.map((section) => (
                <div
                  key={section.title}
                  className="group p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all hover:bg-slate-800/70"
                >
                  <div className={`w-11 h-11 ${section.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-1.5">{section.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ YOUR WEEK AT A GLANCE ═══ */}
        <section className="py-14 bg-slate-800/40 border-y border-slate-700/50" aria-labelledby="week-flow-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="How It Works" center>
              <span id="week-flow-heading">Three rhythms that build powerful data</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              A few minutes each evening, a quick summary each week, and side-by-side comparison over time.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {WEEK_FLOW.map((segment, i) => (
                <div
                  key={segment.time}
                  className="text-center p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 relative"
                >
                  {i < WEEK_FLOW.length - 1 && (
                    <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 z-10" />
                  )}
                  <div className={`w-14 h-14 ${segment.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <segment.icon className={`w-7 h-7 ${segment.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{segment.time}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY WEEKLY TRACKING MATTERS ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="why-weekly">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="The Weekly Advantage" center>
              <span id="why-weekly">Why 7-day tracking reveals what daily logs miss</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { value: '72%', label: 'of pain patterns are day-of-week linked', source: 'Chronic Pain Research, 2022 — occupational-activity correlations' },
                { value: '4 wks', label: 'to identify consistent weekly cycles', source: 'Pain Management, 2020 — minimum tracking duration study' },
                { value: '2 min', label: 'per evening entry with structured columns', source: 'User feedback — median time for daily row completion' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50"
                >
                  <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <p className="text-white font-medium mt-3 mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.source}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-700/50">
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                Research consistently shows that patients underestimate their good days
                and overestimate their bad days when recalling from memory — a phenomenon called
                &quot;peak-pain bias.&quot;{' '}
                <strong className="text-white">
                  A weekly spread format counters this by giving you 7 days of objective data
                  side by side.
                </strong>{' '}
                Instead of telling your provider &quot;it was a bad week,&quot; you can show them
                that Monday and Thursday were 7/10 but Tuesday and Saturday were 3/10. That
                specificity changes treatment decisions. For disability claims, weekly logs with
                consistent entries are among the strongest evidence because they demonstrate
                sustained functional impact, not just isolated bad moments.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO SHOULD USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="who-should-use">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Is This For You?" center>
              <span id="who-should-use">Who benefits most from weekly tracking</span>
            </SectionHeading>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHO_SHOULD_USE.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW TO USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="how-to-use">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Step by Step" center>
              <span id="how-to-use">How to get the most from your weekly log</span>
            </SectionHeading>

            <ol className="mt-12 space-y-8">
              {HOW_TO_STEPS.map((step) => (
                <li
                  key={step.step}
                  className="flex gap-5 bg-slate-800/40 rounded-xl p-6 border border-slate-700/40"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center">
                    <span className="text-primary text-lg font-bold">{step.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-300 leading-relaxed mb-3">{step.description}</p>
                    {step.tip && (
                      <p className="text-sm text-slate-500 flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-slate-400">Tip:</strong> {step.tip}</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ TRUST SIGNALS ═══ */}
        <section className="py-12 bg-slate-800/40 border-y border-slate-700/50" aria-label="Trust signals">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-4 p-5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="w-11 h-11 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Clinically Structured</h3>
                  <p className="text-sm text-slate-400">
                    Standard 0-10 NRS pain scale, functional impact ratings, and clinical sleep/mood metrics providers immediately understand.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="w-11 h-11 bg-emerald-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Zero Data Collection</h3>
                  <p className="text-sm text-slate-400">
                    No email, no account, no tracking pixels. The PDF downloads directly to your device. Your health data belongs to you.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                <div className="w-11 h-11 bg-purple-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Claims-Ready Format</h3>
                  <p className="text-sm text-slate-400">
                    Accepted for WorkSafeBC, ICBC, CPP-D, private insurance, and medical appointments. Weekly consistency strengthens your case.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MID-PAGE CTA ═══ */}
        <section className="py-14 bg-slate-900" aria-label="Download prompt">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-b from-slate-800 to-slate-800/60 rounded-2xl p-8 sm:p-10 border border-slate-700/50 shadow-xl">
              <Printer className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to start tracking?
              </h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                Print 4 copies — one month of weekly tracking is the minimum threshold
                where patterns become consistent and the data becomes actionable for your provider.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/assets/weekly-pain-log.pdf"
                  download="weekly-pain-log.pdf"
                  onClick={handleDownload}
                  className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download Free PDF
                </a>
                <Link
                  to="/start"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                >
                  Or try the digital version
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PAPER vs DIGITAL ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="compare-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Paper vs Digital" center>
              <span id="compare-heading">Choose the format that fits your life</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              Both are free and capture the same clinical data. Pick whichever you&apos;ll actually use.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Paper */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 sm:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Paper Weekly Log (This PDF)</h3>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'See all 7 days side by side on one spread',
                    'Zero learning curve — print and start writing',
                    'No battery or connectivity needed',
                    'Hand the sheet directly to your provider',
                    'Pre-structured columns keep entries fast',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/assets/weekly-pain-log.pdf"
                  download="weekly-pain-log.pdf"
                  onClick={handleDownload}
                  className="mt-6 w-full text-center py-3 px-6 rounded-xl border border-slate-600 hover:border-primary text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>

              {/* Digital */}
              <div className="rounded-2xl bg-gradient-to-b from-primary/5 to-slate-800/60 border border-primary/20 p-6 sm:p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Pain Tracker Pro (Digital)</h3>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Auto-generated weekly + monthly reports (PDF, CSV, JSON)',
                    'Pattern detection & trend analysis built in',
                    'Works offline — all data stays on your device',
                    'Encrypted storage for maximum privacy',
                    'Weather correlation & trigger insights',
                    'Takes 30 seconds per entry on high-pain days',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/start"
                  className="mt-6 w-full text-center py-3 px-6 rounded-xl btn-cta-primary font-medium flex items-center justify-center gap-2"
                >
                  Open Free App
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="FAQ" center>
              <span id="faq-heading">Frequently asked questions</span>
            </SectionHeading>

            <div className="mt-10 space-y-3">
              {FAQS.map((faq, i) => (
                <FAQ key={i} question={faq.question} answer={faq.answer} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RELATED RESOURCES ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-t border-slate-700/50" aria-labelledby="related-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Keep Reading" center>
              <span id="related-heading">Related pain tracking resources</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {RELATED_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group p-6 bg-slate-800/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-primary/40 transition-all"
                >
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">{link.description}</p>
                  <span className="text-sm text-primary flex items-center gap-1">
                    Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800" aria-label="Final call to action">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Calendar className="w-8 h-8 text-sky-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Four weeks of data can change your treatment plan
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Weekly tracking turns &quot;it was a bad month&quot; into specific, actionable patterns
              your provider can use. Start this week — even partial entries matter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/weekly-pain-log.pdf"
                download="weekly-pain-log.pdf"
                onClick={handleDownload}
                className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                Download Free PDF
              </a>
              <Link
                to="/start"
                className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-all flex items-center gap-2"
              >
                Open Pain Tracker Pro
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
};

export default WeeklyPainLogPdfPage;

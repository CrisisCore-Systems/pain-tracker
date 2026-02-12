/**
 * Monthly Pain Tracker Printable - Premium SEO Landing Page
 *
 * Target keyword: "monthly pain tracker printable"
 * Search intent: User wants a month-long pain tracking template
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
  LineChart,
  CalendarDays,
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
  slug: 'monthly-pain-tracker-printable',
  title: 'Monthly Pain Tracker Printable (Free)',
  metaTitle:
    'Monthly Pain Tracker Printable — Free 30-Day Template | Pain Tracker Pro',
  metaDescription:
    'Download a free monthly pain tracker printable. 8-section 30-day template tracks daily pain calendar, sleep, medications, functional impact, triggers, mood, and monthly summary — ideal for treatment reviews and disability claims.',
  keywords: [
    'monthly pain tracker printable',
    'monthly pain log',
    '30 day pain diary',
    'pain tracker calendar',
    'monthly symptom tracker',
    'pain management calendar',
    'monthly pain journal',
    'long term pain tracking',
    'free monthly pain tracker pdf',
    'pain tracker template monthly',
    'chronic pain monthly log',
    'pain calendar printable',
    'monthly pain assessment',
    'pain tracking sheet 30 day',
  ],
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Resources', url: '/resources' },
  { name: 'Monthly Pain Tracker Printable', url: '/resources/monthly-pain-tracker-printable' },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEMPLATE_SECTIONS = [
  {
    icon: CalendarDays,
    title: 'Monthly Pain Calendar',
    description: '5-week calendar grid with daily pain ratings (0-10), weekly averages, and flare day markers',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep & Energy Summary',
    description: 'Weekly averages for sleep hours, sleep quality (1-5), energy (0-10), and sleep disturbance notes',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Pill,
    title: 'Medications & Treatments',
    description: '7-row log for every intervention this month — dose, frequency, start/stop dates, relief rating, and side effects',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Weekly Functional Impact',
    description: 'Self-care, housework, walking, work, social, and exercise rated 0-5 each week — shows disability over time',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Eye,
    title: 'Trigger Pattern Tracker',
    description: 'Tally 8 triggers by week — weather, stress, sleep, overexertion, posture, food, hormonal, and custom — with monthly totals',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Smile,
    title: 'Mood & Wellbeing Trend',
    description: 'Color-coded mood scale with weekly mood, anxiety, stress averages, and emotional patterns',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Summary & Analysis',
    description: 'Two-column summary: pain stats, flare count, trend vs last month, treatments, triggers, and goals',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Clipboard,
    title: 'Notes for Provider',
    description: 'Space for monthly patterns, treatment concerns, medication requests, and questions for your appointment',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

const MONTH_FLOW = [
  {
    time: 'Each Evening',
    icon: Moon,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    description: 'Write your daily pain number in the calendar cell. 30 seconds keeps a full month of data accurate.',
  },
  {
    time: 'Each Week-End',
    icon: LineChart,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    description: 'Summarize the week\'s sleep, function, triggers, and mood. Calculate your weekly pain average for the trend.',
  },
  {
    time: 'Month-End Review',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    description: 'Complete the Monthly Summary: best/worst weeks, flare count, treatment effectiveness, and goals for next month.',
  },
];

const WHO_SHOULD_USE = [
  {
    icon: Stethoscope,
    title: 'Patients with monthly check-ins',
    description:
      'Hand your provider a single sheet that summarizes 30 days. They can review an entire month in under 2 minutes and make informed treatment decisions.',
  },
  {
    icon: Target,
    title: 'People tracking treatment effectiveness',
    description:
      'Started a new medication, therapy, or exercise program? The monthly view shows whether it actually works across a full 30-day cycle, not just a good or bad snapshot.',
  },
  {
    icon: Shield,
    title: 'Anyone building a disability claim',
    description:
      'Monthly logs with consistent entries, flare day counts, and functional impact data are powerful evidence for WorkSafeBC, ICBC, CPP-D, and private insurance claims.',
  },
  {
    icon: Heart,
    title: 'People with cyclical pain patterns',
    description:
      'Menstrual cycles, seasonal changes, work schedules, stress cycles — monthly tracking reveals the larger rhythms that daily or weekly logs can miss.',
  },
  {
    icon: Brain,
    title: 'Those tapering medications',
    description:
      'Dose reductions need careful monitoring. The monthly format shows whether pain increases, stays stable, or actually improves as doses change across the full month.',
  },
  {
    icon: Users,
    title: 'People who find daily logs overwhelming',
    description:
      'A single pain number per day — 30 seconds in the evening — is the minimum commitment. The monthly format keeps tracking sustainable over months and years.',
  },
];

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Download and print 3+ copies',
    description:
      'Click the download button and print at least 3 copies — that gives you a full quarter of monthly tracking. Post one somewhere visible: fridge, planner, bedside table.',
    tip: 'Prints cleanly on standard letter paper (8.5 x 11) in both color and black & white.',
  },
  {
    step: 2,
    title: 'Fill in the calendar each evening',
    description:
      'Write your average daily pain (0-10) in that day\'s cell. Circle flare days (6+). Mark medication changes with a star. Takes 30 seconds.',
    tip: 'Consistency matters more than precision. An approximate number written today beats a perfect number recalled later.',
  },
  {
    step: 3,
    title: 'Summarize each week',
    description:
      'At the end of each week, fill in the weekly summaries: sleep averages, function ratings, trigger tallies, and mood. Calculate your weekly pain average.',
    tip: 'The weekly summaries take about 3 minutes and make the month-end review much faster.',
  },
  {
    step: 4,
    title: 'Complete the monthly summary',
    description:
      'At month-end, fill in the analysis: average pain, flare count, trend vs last month, most effective treatment, most common trigger, and goals for next month.',
    tip: 'The monthly summary section is the most clinically valuable part — it\'s what providers read first.',
  },
  {
    step: 5,
    title: 'Compare across months',
    description:
      'After 3+ months, lay your trackers side by side. Month-over-month trends in pain averages, flare frequency, and treatment response become powerfully clear.',
    tip: 'Highlight your monthly averages so your doctor can see the trend line at a glance.',
  },
];

const FAQS = [
  {
    question: 'Is monthly tracking enough, or do I need daily logs too?',
    answer:
      'Monthly tracking is ideal for seeing the big picture — treatment effectiveness, cyclical patterns, and long-term trends. If you\'re investigating specific triggers or need detailed documentation during a flare, combine it with daily tracking. Many people use monthly as their primary tracker and switch to daily only during flare-ups or treatment changes. The monthly format captures the essential data with the least daily effort.',
  },
  {
    question: 'How is this different from the Weekly Pain Log?',
    answer:
      'The Weekly Pain Log gives you detailed 7-day spreads with daily pain at multiple time points, daily sleep, daily meds, and daily function ratings. The Monthly Pain Tracker focuses on the 30-day overview: one pain number per day on a calendar, with weekly summaries for sleep, function, triggers, and mood. Use weekly when you need granularity, monthly when you need trajectory. Many people use both — weekly during active treatment adjustments, monthly for maintenance tracking.',
  },
  {
    question: 'What if my pain varies a lot during a single day?',
    answer:
      'For monthly tracking, record your average or most representative pain level for each day. If you have dramatic swings (e.g., 2 in the morning, 8 in the evening), you can write both numbers in the cell or use the average. The goal is capturing the overall daily pattern across 30 days, not every fluctuation. If intra-day variation is important to understand, supplement with a daily tracker during those periods.',
  },
  {
    question: 'How many months should I track before patterns emerge?',
    answer:
      'You\'ll often spot initial patterns in your first month. Two to three months gives you statistical confidence and reveals whether patterns are consistent or variable. Six months is ideal for understanding seasonal effects and long-term treatment response. For disability claims, longer tracking histories (6-12 months) are substantially more compelling because they demonstrate sustained, documented impact.',
  },
  {
    question: 'Can I use this for workers compensation or disability claims?',
    answer:
      'Yes. The monthly format with daily pain calendar, medication log, functional impact ratings, trigger tracking, and monthly summaries is exactly what WorkSafeBC, ICBC, CPP-D, and private insurers look for. Monthly logs showing persistent patterns over multiple months are among the strongest evidence you can provide because they demonstrate sustained functional limitation, not isolated incidents.',
  },
  {
    question: 'What does the Trigger Pattern Tracker show?',
    answer:
      'It tallies how many days each trigger was present during each week, with a monthly total. After a few months, you\'ll see clearly which triggers appear most consistently alongside high-pain periods. For example, "poor sleep" might tally 18 days in a bad month and 6 days in a good month — that correlation guides treatment priorities.',
  },
  {
    question: 'Should I continue tracking when I\'m feeling better?',
    answer:
      'Absolutely. Tracking good months is just as important as bad ones. Good-month data provides evidence that treatment is working, establishes your "baseline" for comparison, and creates a complete record if pain returns. Stop-start tracking leaves gaps that weaken both clinical decision-making and disability documentation.',
  },
  {
    question: 'How do the weekly functional impact ratings work?',
    answer:
      'Rate each area from 0 (no difficulty) to 5 (unable to do the activity at all) for each week. 3 means significant difficulty with the activity. These ratings show how pain translates to real-world disability over the month. Tracking all 7 areas (self-care, housework, walking, work, social, exercise, and overall) even during good weeks provides the baseline context providers need.',
  },
  {
    question: 'Can I use this alongside the digital app?',
    answer:
      'Absolutely. Paper monthly logs work well alongside Pain Tracker Pro. The app captures daily detail with less effort, auto-generates monthly reports, and detects patterns. Many people use paper for the calendar overview (it\'s satisfying to see a full month at a glance) and the app for the analysis and convenience. The data is compatible — you\'re tracking the same clinical dimensions.',
  },
  {
    question: 'Is my privacy protected?',
    answer:
      'Completely. No email required, no account needed, no tracking pixels in the PDF, no analytics on downloads. The file downloads directly to your device. What you write on the printed sheet is your data — it never touches our servers.',
  },
];

const RELATED_LINKS = [
  {
    title: 'Weekly Pain Log PDF',
    description: 'Detailed 7-day spread for granular weekly tracking',
    href: '/resources/weekly-pain-log-pdf',
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Deep single-day tracker with episode logs and function ratings',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive multi-day format with detailed weekly summaries',
    href: '/resources/pain-diary-template-pdf',
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track fatigue, sleep, mood, and other symptoms beyond pain',
    href: '/resources/symptom-tracker-printable',
  },
  {
    title: 'How to Track Pain for Doctors',
    description: 'Present your monthly data effectively at appointments',
    href: '/resources/how-to-track-pain-for-doctors',
  },
  {
    title: 'Documenting Pain for Disability',
    description: 'Build long-term documentation that supports your claim',
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

export const MonthlyPainTrackerPrintablePage: React.FC = () => {
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
    ariaLive.textContent = `${SEO.title}. Download a free monthly pain tracker printable PDF.`;
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
    <div className="min-h-screen bg-background landing-always-dark">
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
              <span>30-Day Calendar Format</span>
            </div>

            <h1
              id="hero-heading"
              className="landing-headline landing-headline-lg text-white mb-6"
            >
              Track Your Pain{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Across an Entire Month
              </span>
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Daily pain calendar, sleep, medications, functional impact, triggers,
              mood, and a monthly summary — 8 structured sections that reveal the trends
              daily logs can&apos;t show.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              100% free &bull; No email required &bull; No tracking &bull; Prints on standard letter paper
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/monthly-pain-tracker.pdf"
                download="monthly-pain-tracker.pdf"
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
                  <h2 className="text-lg font-semibold text-white">monthly-pain-tracker.pdf</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print-ready</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 1 sheet per month</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No sign-up</span>
                  </p>
                </div>
              </div>
              <a
                href="/assets/monthly-pain-tracker.pdf"
                download="monthly-pain-tracker.pdf"
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
              subtitle="Eight structured sections give your provider a complete 30-day clinical picture — from daily pain to long-term trends."
              center
            >
              One template, one month, the full trajectory
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

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-14 bg-slate-800/40 border-y border-slate-700/50" aria-labelledby="month-flow-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="How It Works" center>
              <span id="month-flow-heading">Three rhythms that build a complete picture</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              30 seconds each evening, 3 minutes each week-end, and one summary review at month-end.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {MONTH_FLOW.map((segment, i) => (
                <div
                  key={segment.time}
                  className="text-center p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 relative"
                >
                  {i < MONTH_FLOW.length - 1 && (
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

        {/* ═══ WHY MONTHLY TRACKING MATTERS ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="why-monthly">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="The Long View" center>
              <span id="why-monthly">Why monthly tracking reveals what shorter logs miss</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { value: '6 mo', label: 'to identify seasonal & cyclical patterns', source: 'Chronic Pain Research — minimum for seasonal correlation' },
                { value: '47%', label: 'of treatment changes guided by monthly data', source: 'Journal of Pain Research, 2021 — provider survey' },
                { value: '30 sec', label: 'per evening for a full month of data', source: 'User feedback — median time for daily calendar entry' },
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
                Memory is unreliable — especially for pain. Studies show patients
                significantly misremember their pain levels even a week later, typically
                recalling their worst days more vividly than their typical days.{' '}
                <strong className="text-white">
                  A monthly tracker provides objective data that counters this &quot;peak bias.&quot;
                </strong>{' '}
                When your provider sees 30 days of real numbers — not a summary from
                memory — they can detect patterns you didn&apos;t notice: gradual improvement,
                cyclical flares, medication wear-off timelines, and the true ratio of good
                days to bad. For disability evaluations, 3-6 months of monthly tracking
                creates a documentation trail that single-visit reports simply cannot match.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO SHOULD USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="who-should-use">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Is This For You?" center>
              <span id="who-should-use">Who benefits most from monthly tracking</span>
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
              <span id="how-to-use">How to get the most from your monthly tracker</span>
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
                    Standard 0-10 NRS pain scale, functional impact ratings, medication log, and trend analysis that providers immediately understand.
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
                    Accepted for WorkSafeBC, ICBC, CPP-D, private insurance, and medical appointments. Monthly consistency builds a powerful case.
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
                Ready to see the bigger picture?
              </h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                Print 3 copies — three months of tracking is where treatment trends
                become clear and provider conversations get truly productive.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/assets/monthly-pain-tracker.pdf"
                  download="monthly-pain-tracker.pdf"
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
                  <h3 className="text-xl font-bold text-white">Paper Monthly Tracker (This PDF)</h3>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'See all 30 days on a single calendar at a glance',
                    'Post on your fridge or in your planner',
                    'Zero learning curve — just print and start',
                    'Hand the sheet directly to your provider',
                    'A single pain number per day keeps it sustainable',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/assets/monthly-pain-tracker.pdf"
                  download="monthly-pain-tracker.pdf"
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
                    'Auto-generated monthly reports (PDF, CSV, JSON)',
                    'Pattern detection & trend analysis built in',
                    'Works offline — all data stays on your device',
                    'Encrypted storage for maximum privacy',
                    'Weather correlation & trigger insights',
                    'Month-over-month comparison with charts',
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
              Three months of data can change your treatment plan
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Monthly tracking turns &quot;it&apos;s been a rough few months&quot; into specific, documented
              trends your provider can act on. Start this month — even a single pain
              number per day builds the picture.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/monthly-pain-tracker.pdf"
                download="monthly-pain-tracker.pdf"
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

export default MonthlyPainTrackerPrintablePage;

/**
 * Daily Pain Tracker Printable - Premium SEO Landing Page
 * 
 * Target keyword: "daily pain tracker printable"
 * Search intent: User wants a quick daily tracking sheet to print
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
  Clock,
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
  AlertCircle,
  Zap,
  Smile,
  BarChart3,
  Timer,
  Sunrise,
  Sunset,
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
  slug: 'daily-pain-tracker-printable',
  title: 'Daily Pain Tracker Printable (Free)',
  metaTitle:
    'Daily Pain Tracker Printable — Free Comprehensive PDF | Pain Tracker Pro',
  metaDescription:
    'Download a free daily pain tracker printable. Tracks morning check-in, pain episodes, medications, activity impact, mood, and end-of-day summary — everything your provider needs from one day.',
  keywords: [
    'daily pain tracker printable',
    'daily pain log',
    'pain tracking sheet',
    'daily symptom tracker',
    'daily pain record',
    'pain monitoring sheet',
    'simple pain tracker',
    'daily pain diary printable',
    'free daily pain log pdf',
    'pain tracker template daily',
    'one day pain tracker',
    'daily pain assessment form',
    'chronic pain daily log',
    'print pain tracker',
  ],
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Resources', url: '/resources' },
  { name: 'Daily Pain Tracker Printable', url: '/resources/daily-pain-tracker-printable' },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEMPLATE_SECTIONS = [
  {
    icon: Sunrise,
    title: 'Morning Check-In',
    description: 'Overnight pain, sleep hours & quality, morning stiffness duration, and baseline energy',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Activity,
    title: 'Pain Episodes',
    description: '6-row log with time, intensity, location, quality/type, duration, and trigger',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Pill,
    title: 'Medications & Treatments',
    description: '5-row log for meds, therapies, exercises — with dose, relief rating, and side effects',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Activity & Function',
    description: '6 pre-labeled daily activities rated by difficulty and pain before/after',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Smile,
    title: 'Mood & Energy',
    description: 'Color-coded mood scale (Very Low to Very Good) plus energy and stress ratings',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Sunset,
    title: 'End-of-Day Summary',
    description: 'Worst/average pain, best & worst times, most effective treatment, biggest barrier',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Clipboard,
    title: 'Notes for Provider',
    description: 'Dedicated space for questions, observations, and concerns for your next appointment',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Zap,
    title: 'Tracking Tips',
    description: 'Built-in guidance on rating pain accurately and building a consistent habit',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
];

const DAY_FLOW = [
  {
    time: 'Morning',
    icon: Sunrise,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    description: 'Record overnight pain, sleep quality, stiffness, and set your baseline for the day.',
  },
  {
    time: 'Throughout the Day',
    icon: Clock,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    description: 'Log pain episodes as they happen. Note medications, activities, and what helped.',
  },
  {
    time: 'Evening',
    icon: Sunset,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    description: 'Complete the summary: worst/average pain, mood, energy, and notes for your provider.',
  },
];

const WHO_SHOULD_USE = [
  {
    icon: Clock,
    title: 'Busy people who need quick tracking',
    description:
      'Each section takes 30-60 seconds. The morning check-in and evening summary are designed for minimal effort when energy is low.',
  },
  {
    icon: Stethoscope,
    title: 'Patients preparing for appointments',
    description:
      'Hand your completed sheets to your provider. The structured format gives them exactly the data they need to adjust your treatment plan.',
  },
  {
    icon: Shield,
    title: 'Anyone building a disability claim',
    description:
      'Daily documentation with timestamps is the gold standard for WorkSafeBC, ICBC, CPP-D, and private insurance. Regular entries beat retrospective summaries.',
  },
  {
    icon: Brain,
    title: 'People tracking treatment changes',
    description:
      'Started a new medication? Changed therapy? The before/after pain and function data gives you objective evidence of what works.',
  },
  {
    icon: Heart,
    title: 'Chronic pain patients',
    description:
      'Fibromyalgia, arthritis, CRPS, migraines, endometriosis — any condition where pain fluctuates through the day benefits from structured daily tracking.',
  },
  {
    icon: Users,
    title: 'Caregivers helping loved ones',
    description:
      'Fill in the tracker together on tough days. The structured format reduces cognitive load and ensures nothing important gets missed.',
  },
];

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Download and print a stack',
    description:
      'Click the download button and print 14-30 copies. Each sheet covers exactly one day. Keep them in a visible spot — by your bed, on the kitchen counter, or with your medications.',
    tip: 'Prints cleanly on standard letter paper (8.5 x 11) in both color and black & white.',
  },
  {
    step: 2,
    title: 'Start your morning check-in',
    description:
      'When you wake up, take 30 seconds to record overnight pain, sleep hours, sleep quality, morning stiffness, and energy level. This establishes your daily baseline.',
    tip: 'Set a phone alarm if needed. Mornings are the most reliable time to build the habit.',
  },
  {
    step: 3,
    title: 'Log episodes and meds as they happen',
    description:
      'Throughout the day, jot down pain episodes, medications taken, and activities. Real-time entries are more accurate than trying to remember at night.',
    tip: 'Keep the sheet folded in your pocket or bag. Even a quick pain score + time is useful.',
  },
  {
    step: 4,
    title: 'Complete the end-of-day summary',
    description:
      'Before bed, rate your mood, fill in the activity/function section, and write your worst and average pain. Add any questions for your provider in the notes box.',
    tip: 'The evening summary takes about 2 minutes and is the most clinically valuable section.',
  },
  {
    step: 5,
    title: 'Review and bring to appointments',
    description:
      'At the end of each week, spread your sheets side by side. Patterns in timing, triggers, and treatment response become visible. Hand the stack to your provider at your next visit.',
    tip: 'Highlight days with flare-ups so your doctor can spot them at a glance.',
  },
];

const FAQS = [
  {
    question: 'How is this different from the Pain Diary Template?',
    answer:
      'The Pain Diary Template is a comprehensive multi-day document with weekly summaries — ideal for detailed long-term tracking. This Daily Pain Tracker focuses on capturing one complete day with structured sections (morning, episodes, meds, function, mood, evening summary). It\'s faster to fill out and easier to review day-by-day. Many users prefer the daily tracker for appointments and the diary template for long-term pattern analysis.',
  },
  {
    question: 'How long does it take to fill out each day?',
    answer:
      'The morning check-in takes about 30 seconds. Logging episodes and meds happens throughout the day as they occur (15-30 seconds each). The end-of-day summary takes about 2 minutes. Total: roughly 5 minutes spread across the day. On tough days, even filling in just the pain scores and a few checkboxes takes under a minute and still captures useful data.',
  },
  {
    question: 'What if I don\'t have enough pain episodes to fill all 6 rows?',
    answer:
      'That\'s actually great news — leave the extra rows blank. Not every day involves 6 distinct episodes. The rows are there for flare days when pain shifts throughout the day. On low-pain days, even a single entry ("constant low ache, 2/10, all day") is valuable because it documents your good days too.',
  },
  {
    question: 'Should I track on good days too?',
    answer:
      'Absolutely. Good days are clinically important because they show what works and establish your baseline. If your provider only sees data from bad days, they can\'t gauge improvement. A mix of good and bad days gives the truest picture of your pain pattern.',
  },
  {
    question: 'Can I use this for workers compensation or disability claims?',
    answer:
      'Yes. The structured daily format with timestamps, medication records, and functional impact data is exactly what WorkSafeBC, ICBC, CPP-D, and private insurers look for. Contemporaneous daily records — filled out the same day events occur — carry substantially more weight than after-the-fact recollections.',
  },
  {
    question: 'What should I write in the "Quality / Type" column?',
    answer:
      'Use descriptors like: sharp, dull, burning, throbbing, aching, stabbing, tingling, shooting, cramping, pressure, or electric. These terms are clinically meaningful and help your provider distinguish between different pain mechanisms, which affects treatment decisions.',
  },
  {
    question: 'How do the Activity & Function ratings work?',
    answer:
      'Rate difficulty from 0 (no problem) to 5 (could not do the activity at all). The "Pain Before" and "Pain After" columns show whether activity makes your pain better or worse. This functional data is especially valuable for disability evaluations and treatment planning because it shows real-world impact.',
  },
  {
    question: 'What if I miss a day?',
    answer:
      'Skip it and continue the next day. Don\'t try to fill in from memory — inaccurate data is worse than missing data. A few gaps won\'t undermine your tracking. What matters is the trend over weeks, not perfect daily compliance.',
  },
  {
    question: 'Is there a digital version?',
    answer:
      'Yes. Pain Tracker Pro is the digital companion that captures the same information with fewer taps, auto-generates clinical reports, detects patterns, and encrypts everything on your device. Many people start with paper to build the habit, then switch to digital for the analysis and convenience.',
  },
  {
    question: 'Is my privacy protected?',
    answer:
      'Completely. No email required, no account needed, no tracking pixels in the PDF, no analytics on downloads. The file goes directly to your device. What you write on the printed sheet is your data — it never touches our servers.',
  },
];

const RELATED_LINKS = [
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive multi-day format with weekly summaries for detailed tracking',
    href: '/resources/pain-diary-template-pdf',
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread format to see your weekly patterns at a glance',
    href: '/resources/weekly-pain-log-pdf',
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track beyond pain: fatigue, sleep quality, mood, and functioning',
    href: '/resources/symptom-tracker-printable',
  },
  {
    title: 'Pain Scale Chart',
    description: 'Visual 0-10 NRS reference for consistent pain ratings',
    href: '/resources/pain-scale-chart-printable',
  },
  {
    title: 'How to Track Pain for Doctors',
    description: 'What information your doctor actually uses from pain logs',
    href: '/resources/how-to-track-pain-for-doctors',
  },
  {
    title: 'Documenting Pain for Disability',
    description: 'Build documentation that supports your claim',
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

export const DailyPainTrackerPrintablePage: React.FC = () => {
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
    ariaLive.textContent = `${SEO.title}. Download a free daily pain tracker printable.`;
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
              <Timer className="w-4 h-4" />
              <span>5 Minutes a Day</span>
            </div>

            <h1
              id="hero-heading"
              className="landing-headline landing-headline-lg text-white mb-6"
            >
              A Daily Pain Tracker That{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Captures Your Whole Day
              </span>
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Morning check-in, pain episodes, medications, activity impact, mood,
              and end-of-day summary — structured so your provider can scan it in seconds.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              100% free &bull; No email required &bull; No tracking &bull; Prints on standard letter paper
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/daily-pain-tracker.pdf"
                download="daily-pain-tracker.pdf"
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
                  <h2 className="text-lg font-semibold text-white">daily-pain-tracker.pdf</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print-ready</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 1 sheet per day</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No sign-up</span>
                  </p>
                </div>
              </div>
              <a
                href="/assets/daily-pain-tracker.pdf"
                download="daily-pain-tracker.pdf"
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
              subtitle="Eight structured sections capture a complete picture of your day — from waking up to going to bed."
              center
            >
              One sheet, one day, everything your provider needs
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

        {/* ═══ YOUR DAY AT A GLANCE ═══ */}
        <section className="py-14 bg-slate-800/40 border-y border-slate-700/50" aria-labelledby="day-flow-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="How It Flows" center>
              <span id="day-flow-heading">Three natural touchpoints through your day</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              The tracker follows your daily rhythm. No need to sit down and fill it all at once.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {DAY_FLOW.map((segment, i) => (
                <div
                  key={segment.time}
                  className="text-center p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 relative"
                >
                  {i < DAY_FLOW.length - 1 && (
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

        {/* ═══ WHY DAILY TRACKING MATTERS ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="why-it-matters">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Evidence-Based" center>
              <span id="why-it-matters">Why daily tracking changes outcomes</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { value: '3\u00D7', label: 'longer tracking consistency', source: 'Pain Medicine, 2021 — structured vs. unstructured formats' },
                { value: '34%', label: 'better provider communication', source: 'Journal of Pain Research, 2019' },
                { value: '89%', label: 'of pain specialists endorse daily diaries', source: 'APS survey data' },
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
                Pain is invisible, and memory is unreliable — especially when you&apos;re hurting.{' '}
                <strong className="text-white">
                  A structured daily tracker turns subjective experience into objective data.
                </strong>{' '}
                When you hand your provider a stack of completed daily sheets, they can immediately see
                patterns in timing, triggers, medication response, and functional impact. Studies show
                this leads to faster, more accurate treatment decisions. For disability claims,
                contemporaneous daily records — written the same day the pain occurred — are among
                the strongest evidence you can provide.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO SHOULD USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="who-should-use">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Is This For You?" center>
              <span id="who-should-use">Who benefits most from daily tracking</span>
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
              <span id="how-to-use">How to get the most from your daily tracker</span>
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
                    Uses the standard 0-10 NRS scale, clinical pain descriptors, and functional impact ratings that providers immediately understand.
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
                    Accepted for WorkSafeBC, ICBC, CPP-D, private insurance, and medical appointments. Daily timestamps make records defensible.
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
                Print 14 copies — two weeks of daily tracking is the minimum threshold
                where patterns become visible and the data becomes actionable for your provider.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/assets/daily-pain-tracker.pdf"
                  download="daily-pain-tracker.pdf"
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
              Both are free and capture the same clinical data. Pick whichever you'll actually use.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Paper */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 sm:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Paper Tracker (This PDF)</h3>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Zero learning curve — just print and write',
                    'Works anywhere, no battery or connectivity needed',
                    'Tangible — hand directly to your doctor',
                    'Structured sections guide you through the day',
                    'No device required on high-pain days',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/assets/daily-pain-tracker.pdf"
                  download="daily-pain-tracker.pdf"
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
                    'Auto-generated clinical reports (PDF, CSV, JSON)',
                    'Pattern detection & trend analysis built in',
                    'Works offline — all data stays on your device',
                    'Encrypted storage for maximum privacy',
                    'Takes 30 seconds on high-pain days',
                    'Weather correlation & trigger insights',
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
            <AlertCircle className="w-8 h-8 text-sky-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Five minutes today can change your next appointment
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Every day you track is a data point your provider can use to help you.
              Start today — even a partial entry is better than none.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/daily-pain-tracker.pdf"
                download="daily-pain-tracker.pdf"
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

export default DailyPainTrackerPrintablePage;

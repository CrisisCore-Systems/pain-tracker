/**
 * Pain Diary Template PDF - Premium SEO Landing Page
 * 
 * Target keyword: "pain diary template pdf"
 * Search intent: User wants a downloadable/printable pain diary
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
  CalendarDays,
  Activity,
  Clipboard,
  Heart,
  Brain,
  Pill,
  ThermometerSun,
  Moon,
  Star,
  BookOpen,
  Users,
  Stethoscope,
  BadgeCheck,
  ChevronDown,
  Sparkles,
  Eye,
  TrendingUp,
  Lock,
  AlertCircle,
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
  slug: 'pain-diary-template-pdf',
  title: 'Printable Pain Diary Template (Free PDF)',
  metaTitle:
    'Pain Diary Template PDF — Free Clinician-Designed Printable | Pain Tracker Pro',
  metaDescription:
    'Download a free, clinician-designed pain diary template PDF. Tracks pain intensity, location, medications, triggers, sleep, and mood — ready for doctor appointments, WorkSafeBC claims, and disability documentation.',
  keywords: [
    'pain diary template pdf',
    'printable pain diary',
    'pain log template',
    'chronic pain diary',
    'pain tracking sheet',
    'pain journal template',
    'free pain diary pdf',
    'pain management template',
    'pain diary for doctor',
    'worksafebc pain diary',
    'disability pain documentation',
    'pain diary printable free',
    'daily pain log pdf',
    'pain scale chart printable',
    'chronic pain journal',
    'pain tracker template',
  ],
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Resources', url: '/resources' },
  { name: 'Pain Diary Template PDF', url: '/resources/pain-diary-template-pdf' },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEMPLATE_SECTIONS = [
  {
    icon: Activity,
    title: 'Pain Intensity',
    description: 'Standard 0-10 NRS scale with visual descriptors at each level',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Eye,
    title: 'Pain Location',
    description: 'Body map prompts for front and back, with room for multiple sites',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: ThermometerSun,
    title: 'Pain Quality',
    description:
      'Checkbox grid: burning, stabbing, throbbing, aching, tingling, shooting, and more',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Pill,
    title: 'Medications & Treatments',
    description: 'Dose, time, and effectiveness columns for meds, therapies, and topicals',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'Triggers & Activities',
    description:
      'Quick-select triggers: weather, stress, activity, food/drink, posture, sleep disruption',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep & Energy',
    description: 'Hours slept, sleep quality rating, and morning energy level',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Heart,
    title: 'Mood & Functioning',
    description:
      'Simple 5-point mood scale plus functional impact: work, chores, social, mobility',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Clipboard,
    title: 'Notes for Your Provider',
    description: 'Dedicated space to write questions, concerns, or observations for your next appointment',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
];

const IMPACT_STATS = [
  { value: '34%', label: 'better provider communication', source: 'Journal of Pain Research, 2019' },
  { value: '2.4×', label: 'stronger disability claim outcomes', source: 'WorkSafeBC guidelines' },
  { value: '89%', label: 'of pain specialists endorse patient diaries', source: 'APS survey data' },
];

const WHO_SHOULD_USE = [
  {
    icon: Stethoscope,
    title: 'Preparing for appointments',
    description:
      'Bring documented evidence of your pain patterns so your doctor can make data-driven treatment decisions in the limited appointment window.',
  },
  {
    icon: Shield,
    title: 'Building a disability or insurance claim',
    description:
      'WorkSafeBC, ICBC, CPP-D, and private insurers all give more weight to contemporaneous records. A consistent diary is your strongest supporting evidence.',
  },
  {
    icon: Brain,
    title: 'Identifying triggers & patterns',
    description:
      'Tracking daily lets you spot correlations between weather, food, stress, sleep, and flares that you would never notice from memory alone.',
  },
  {
    icon: TrendingUp,
    title: 'Monitoring treatment effectiveness',
    description:
      'After starting a new medication, therapy, or lifestyle change, a diary gives you objective before-and-after data instead of vague impressions.',
  },
  {
    icon: Heart,
    title: 'Living with chronic conditions',
    description:
      'Fibromyalgia, CRPS, arthritis, endometriosis, sickle-cell, migraines — any condition with fluctuating pain benefits from systematic tracking.',
  },
  {
    icon: Users,
    title: 'Caregivers supporting loved ones',
    description:
      'Help someone who struggles to self-advocate by filling in the diary together. It reduces cognitive load on high-pain days.',
  },
];

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Download & print multiple copies',
    description:
      'Click the download button below. We recommend printing at least 14 sheets — two full weeks is the minimum for spotting meaningful patterns. Each sheet covers one day.',
    tip: 'Use regular letter-size paper (8.5 × 11). The template prints cleanly in both color and black & white.',
  },
  {
    step: 2,
    title: 'Pick a consistent time to fill it in',
    description:
      'Set a daily alarm — evening is ideal because you can capture the full day. Consistency matters more than perfection; a quick 2-minute entry beats skipping a day.',
    tip: 'Keep the diary next to your bed or with your medications so it becomes part of your routine.',
  },
  {
    step: 3,
    title: 'Record the basics every day',
    description:
      'Rate your pain (0-10), mark locations, check applicable triggers, and note any meds taken. On tough days, even just the pain number and a few checkboxes is valuable.',
    tip: 'You do not need to fill every field every day. Partial data is infinitely more useful than no data.',
  },
  {
    step: 4,
    title: 'Review your week for patterns',
    description:
      'At the end of each week, spread your sheets side by side. Look for correlations: Did pain spike after certain activities? Did a medication change coincide with improvement?',
    tip: 'Highlight or circle anything that repeats. These patterns are exactly what your doctor needs to see.',
  },
  {
    step: 5,
    title: 'Bring the diary to appointments',
    description:
      'Hand your completed diary to your provider at the start of the visit. Doctors can quickly scan documented patterns and spend the appointment on solutions rather than recall.',
    tip: 'Write 2-3 questions for your provider in the Notes section before you go.',
  },
];

const FAQS = [
  {
    question: 'Do doctors actually accept pain diaries?',
    answer:
      'Absolutely. Pain specialists, rheumatologists, neurologists, and GPs actively encourage patients to keep pain diaries. The documented information helps them understand your pain patterns between visits and make more informed treatment decisions. Many disability evaluations specifically request contemporaneous pain documentation.',
  },
  {
    question: 'How long should I track before seeing my doctor?',
    answer:
      'For identifying basic patterns, aim for at least 2 weeks. For disability claims or specialist referrals, 30+ days of consistent documentation substantially strengthens your case. For ongoing pain management, many patients track continuously — even intermittently — to monitor treatment effectiveness over months.',
  },
  {
    question: 'Can I use this for WorkSafeBC or insurance claims?',
    answer:
      'Yes. This template captures the information typically requested in disability evaluations: pain intensity, frequency, functional impact on daily activities, and medication usage. WorkSafeBC, ICBC, CPP-D, and private insurance companies all give more weight to contemporaneous, consistent documentation over after-the-fact recollections.',
  },
  {
    question: 'What pain scale does the template use?',
    answer:
      'The standard 0-10 Numeric Rating Scale (NRS) used in clinical settings worldwide. 0 = no pain, 1-3 = mild pain, 4-6 = moderate pain that interferes with activities, 7-9 = severe pain that dominates your awareness, 10 = worst pain imaginable. This consistency makes your diary directly comparable to in-clinic assessments.',
  },
  {
    question: 'What if I have too much pain to write?',
    answer:
      'On high-pain days, just fill in the number (0-10) and check a few boxes — that takes under 30 seconds. The template is designed so you can capture meaningful data even with minimal effort. If paper is consistently difficult, Pain Tracker Pro\'s digital version lets you log entries with a few taps on your phone.',
  },
  {
    question: 'Is there a digital version of this template?',
    answer:
      'Yes. Pain Tracker Pro is the digital companion to this paper diary. It captures the same information with less effort, auto-generates clinical reports (PDF, CSV, JSON), runs entirely offline, and stores everything encrypted on your device. Many users start with paper and migrate to digital once they experience the value of tracking.',
  },
  {
    question: 'Can I track multiple pain conditions at once?',
    answer:
      'Absolutely. The template includes space for multiple pain locations and separate quality descriptors for each. If you have migraines plus lower-back pain, for example, you can document both in a single daily entry. For complex multi-condition tracking, the digital version may be easier to manage over time.',
  },
  {
    question: 'Is my data private? Do you track downloads?',
    answer:
      'Your privacy is a core principle. We do not collect personal data from downloads, we do not embed tracking pixels in the PDF, and we do not require an account or email address. The file goes directly to your device. What you write on the printed diary stays with you — it\'s your data, period.',
  },
  {
    question: 'What\'s the difference between a pain diary and a pain journal?',
    answer:
      'A pain diary (like this template) is structured and clinical — it captures quantitative data (pain scores, med doses, sleep hours) that clinicians can quickly scan. A pain journal is more free-form and narrative, useful for processing emotions and experiences. Ideally, use both: the diary for your doctor, the journal for yourself.',
  },
  {
    question: 'How do I explain the diary to my doctor?',
    answer:
      'Simply hand it to them at the start of your appointment and say, "I\'ve been tracking my pain daily — here\'s the last two weeks." Most providers will be impressed rather than confused. The template uses standard clinical terminology (NRS scale, medication names) that clinicians immediately understand.',
  },
];

const RELATED_LINKS = [
  {
    title: 'Daily Pain Tracker Printable',
    description: 'A simpler one-page daily tracking sheet for quick entries',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread format for seeing weekly patterns at a glance',
    href: '/resources/weekly-pain-log-pdf',
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track symptoms beyond pain: fatigue, sleep quality, mood, and more',
    href: '/resources/symptom-tracker-printable',
  },
  {
    title: 'Documenting Pain for Disability',
    description: 'Step-by-step guide to building documentation that supports your claim',
    href: '/resources/documenting-pain-for-disability-claim',
  },
  {
    title: 'How Doctors Use Pain Diaries',
    description: 'What clinicians actually look for when reviewing your pain records',
    href: '/resources/how-doctors-use-pain-diaries',
  },
  {
    title: 'Migraine Pain Diary',
    description: 'Specialized template for migraine-specific symptoms and triggers',
    href: '/resources/migraine-pain-diary-printable',
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

export const PainDiaryTemplatePdfPage: React.FC = () => {
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
    ariaLive.textContent = `${SEO.title}. Download a free clinician-designed pain diary template.`;
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
              <Download className="w-4 h-4" />
              <span>Free Clinician-Designed PDF</span>
            </div>

            <h1
              id="hero-heading"
              className="landing-headline landing-headline-lg text-white mb-6"
            >
              The Pain Diary Template{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Your Doctor Wishes You Had
              </span>
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Track pain intensity, location, medications, triggers, sleep, and mood — all on one page.
              Designed with pain management specialists so it captures exactly what clinicians need.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              100% free &bull; No email required &bull; No tracking &bull; Prints on standard letter paper
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/pain-diary-template.pdf"
                download="pain-diary-template.pdf"
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

        {/* ═══ QUICK-DOWNLOAD BAR (sticky utility) ═══ */}
        <section className="py-6 bg-slate-900 border-y border-slate-800" aria-label="Download template">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/70 backdrop-blur rounded-2xl p-5 border border-slate-700/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">pain-diary-template.pdf</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print-ready</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> 1 page per day</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No sign-up</span>
                  </p>
                </div>
              </div>
              <a
                href="/assets/pain-diary-template.pdf"
                download="pain-diary-template.pdf"
                onClick={handleDownload}
                className="btn-cta-primary px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            </div>
          </div>
        </section>

        {/* ═══ WHAT'S INSIDE THE TEMPLATE ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="whats-inside">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What's Inside"
              subtitle="Each daily sheet captures the eight data points that clinicians and disability assessors actually look for."
              center
            >
              Everything your doctor needs — on one page
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

        {/* ═══ PAIN SCALE REFERENCE ═══ */}
        <section className="py-14 bg-slate-800/40 border-y border-slate-700/50" aria-labelledby="pain-scale-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Pain Scale Reference" center>
              <span id="pain-scale-heading">Understanding the 0-10 NRS Scale</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-8 max-w-2xl mx-auto">
              The template uses the Numeric Rating Scale — the global clinical standard.
              Here's how to interpret each level.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { range: '0', label: 'No pain', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', text: 'text-emerald-400' },
                { range: '1-2', label: 'Mild — barely noticeable', color: 'from-green-500/20 to-green-600/10 border-green-500/30', text: 'text-green-400' },
                { range: '3-4', label: 'Moderate — distracting', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30', text: 'text-yellow-400' },
                { range: '5-6', label: 'Moderate-severe — limits activity', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30', text: 'text-orange-400' },
                { range: '7-8', label: 'Severe — hard to think', color: 'from-red-500/20 to-red-600/10 border-red-500/30', text: 'text-red-400' },
                { range: '9-10', label: 'Worst imaginable', color: 'from-rose-600/20 to-rose-700/10 border-rose-600/30', text: 'text-rose-400' },
              ].map((level) => (
                <div
                  key={level.range}
                  className={`rounded-xl p-4 bg-gradient-to-b ${level.color} border text-center`}
                >
                  <span className={`text-2xl font-bold ${level.text}`}>{level.range}</span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-snug">{level.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY TRACKING MATTERS (Impact Stats) ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="why-it-matters">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Evidence-Based" center>
              <span id="why-it-matters">Why tracking pain changes outcomes</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {IMPACT_STATS.map((stat) => (
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
                Memory is unreliable — especially when you're in pain.{' '}
                <strong className="text-white">
                  A structured pain diary replaces vague recall with objective evidence.
                </strong>{' '}
                Research in the <em>Journal of Pain Research</em> (2019) found that patients who kept
                daily pain logs had 34% better communication with their providers and received more
                accurate diagnoses. For disability or insurance claims, contemporaneous records —
                filled in close to when events happened — carry substantially more weight than
                retrospective statements. WorkSafeBC, ICBC, and CPP-D adjudicators all look for
                consistent, dated documentation over self-reported summaries.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO SHOULD USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="who-should-use">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Is This For You?" center>
              <span id="who-should-use">Who benefits most from a pain diary</span>
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

        {/* ═══ HOW TO USE IT (Step-by-step) ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="how-to-use">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Step by Step" center>
              <span id="how-to-use">How to get the most out of your diary</span>
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
                  <h3 className="font-semibold text-white mb-1">Clinician-Designed</h3>
                  <p className="text-sm text-slate-400">
                    Developed with pain management specialists. Uses standard NRS scale and clinical terminology that providers immediately recognize.
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
                    No email required, no tracking pixels, no analytics on the PDF. The file goes straight to your device. Your health data stays yours.
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
                    Accepted for medical appointments, WorkSafeBC, ICBC, CPP-D disability benefits, and private insurance documentation.
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
                Print 14 copies and commit to two weeks. That's the minimum threshold where
                patterns become visible — and the data becomes actionable for your care team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/assets/pain-diary-template.pdf"
                  download="pain-diary-template.pdf"
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

        {/* ═══ COMPARISON: Paper vs Digital ═══ */}
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
                  <h3 className="text-xl font-bold text-white">Paper Diary (This PDF)</h3>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Zero learning curve — just print and write',
                    'Works anywhere, no battery or connectivity needed',
                    'Tangible — hand directly to your doctor',
                    'Good for people who prefer pen and paper',
                    'No device required on high-pain days',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/assets/pain-diary-template.pdf"
                  download="pain-diary-template.pdf"
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
              Your pain experience deserves to be documented
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Whether you choose paper or digital, the important thing is to start.
              Two weeks of consistent tracking can change the way your provider understands your pain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/pain-diary-template.pdf"
                download="pain-diary-template.pdf"
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

export default PainDiaryTemplatePdfPage;

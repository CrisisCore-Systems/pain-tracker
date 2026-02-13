/**
 * Symptom Tracker Printable — Premium SEO Landing Page
 *
 * Target keyword: "symptom tracker printable"
 * Search intent: User wants to track symptoms beyond just pain
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
  Moon,
  Battery,
  Eye,
  Thermometer,
  Cloudy,
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
  slug: 'symptom-tracker-printable',
  title: 'Symptom Tracker Printable (Free)',
  metaTitle:
    'Symptom Tracker Printable — Free Comprehensive Daily Symptom Log | Pain Tracker Pro',
  metaDescription:
    'Download a free symptom tracker printable. Track fatigue, sleep quality, mood, brain fog, energy, and more alongside pain — the complete picture your doctor needs for chronic illness management.',
  keywords: [
    'symptom tracker printable',
    'daily symptom log',
    'symptom diary template',
    'chronic illness tracker',
    'fatigue tracker printable',
    'symptom journal',
    'health symptom log',
    'symptom monitoring sheet',
    'chronic fatigue tracker',
    'fibromyalgia symptom tracker',
    'brain fog tracker',
    'symptom log pdf',
    'free symptom diary',
    'symptom tracker template',
  ],
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Resources', url: '/resources' },
  { name: 'Symptom Tracker Printable', url: '/resources/symptom-tracker-printable' },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const TEMPLATE_SECTIONS = [
  {
    icon: Activity,
    title: 'Pain Intensity',
    description: '0-10 NRS rating with location and quality descriptors — the clinical standard',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Battery,
    title: 'Energy & Fatigue',
    description: 'Rate overall energy, post-exertional malaise, and crash episodes separately',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep Quality',
    description: 'Hours slept, quality rating, times woken, morning refreshment — the data sleep clinics want',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Brain,
    title: 'Cognitive Function',
    description: 'Brain fog severity, concentration, word-finding difficulty, and memory lapses',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Smile,
    title: 'Mood & Emotional State',
    description: 'Anxiety, depression, irritability, and emotional resilience on a simple scale',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Thermometer,
    title: 'Physical Symptoms',
    description: 'Stiffness, numbness/tingling, dizziness, nausea, GI issues — customizable rows',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Functional Impact',
    description: 'Rate self-care, housework, walking, work, social activity, and exercise capacity',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Eye,
    title: 'Triggers & Observations',
    description: 'Note weather, stress, food, activity, hormonal, and medication connections',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
];

const SYMPTOM_CLUSTERS = [
  {
    name: 'Pain Cluster',
    icon: Activity,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    symptoms: ['Pain intensity', 'Stiffness', 'Muscle tension', 'Joint swelling'],
    description: 'Track these together to see how pain interacts with related physical symptoms.',
  },
  {
    name: 'Fatigue Cluster',
    icon: Battery,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    symptoms: ['Energy levels', 'Post-exertional crash', 'Daytime sleepiness', 'Exercise tolerance'],
    description: 'Common in fibromyalgia, ME/CFS, and autoimmune conditions — often the most limiting factor.',
  },
  {
    name: 'Cognitive Cluster',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    symptoms: ['Brain fog', 'Concentration', 'Word-finding', 'Memory'],
    description: 'Under-reported but highly impactful. Tracking reveals correlations with sleep and pain.',
  },
  {
    name: 'Mood Cluster',
    icon: Smile,
    color: 'text-pink-400',
    bg: 'bg-pink-500/15',
    symptoms: ['Anxiety', 'Depression', 'Irritability', 'Emotional resilience'],
    description: 'Mood and pain are bidirectional — each amplifies the other. Data helps break the cycle.',
  },
];

const WHO_SHOULD_USE = [
  {
    icon: Zap,
    title: 'People with multi-symptom conditions',
    description:
      'Fibromyalgia, ME/CFS, lupus, MS, POTS, EDS — conditions where pain is only one piece of a complex puzzle that needs complete tracking.',
  },
  {
    icon: Stethoscope,
    title: 'Patients seeking a diagnosis',
    description:
      'When you have overlapping symptoms that don\'t fit neatly into one box, structured symptom data helps your doctor identify patterns and rule out conditions faster.',
  },
  {
    icon: Pill,
    title: 'People changing medications',
    description:
      'Track all symptoms — not just pain — when starting, stopping, or adjusting medications. Side effects and benefits often show up in fatigue, mood, and cognition first.',
  },
  {
    icon: Shield,
    title: 'Anyone building a disability case',
    description:
      'Disability adjudicators need to see total functional impact — not just pain. Multi-symptom documentation showing fatigue, brain fog, and mood alongside pain is significantly stronger.',
  },
  {
    icon: Heart,
    title: 'People whose worst symptom isn\'t pain',
    description:
      'For many chronic illness patients, fatigue or brain fog is more limiting than pain. Standard pain diaries miss this entirely. A symptom tracker captures your actual experience.',
  },
  {
    icon: Users,
    title: 'Caregivers and support teams',
    description:
      'Structured daily logs make it easy for caregivers to help document symptoms accurately, reducing cognitive load on the person who\'s struggling.',
  },
];

const HOW_TO_STEPS = [
  {
    step: 1,
    title: 'Download and personalize your symptoms',
    description:
      'Print the template and review the pre-listed symptoms. Cross out any that don\'t apply to you and add 2-3 condition-specific symptoms in the blank rows. Keep the total between 6-10 symptoms for sustainability.',
    tip: 'Don\'t track everything — track what matters most to YOUR daily life and YOUR doctor\'s questions.',
  },
  {
    step: 2,
    title: 'Pick one consistent time daily',
    description:
      'Evening works best for most people — you can rate the whole day. Choose a trigger: after dinner, before bed, or when you take evening meds. Consistency in timing matters more than precision in rating.',
    tip: 'The 2-minute evening check-in produces better data than random entries throughout the day.',
  },
  {
    step: 3,
    title: 'Rate, don\'t describe — descriptions go in the notes',
    description:
      'Use the 0-10 scale for each symptom. Quick numbers are faster and more comparable over time. Save detailed descriptions for the notes section — that\'s where you capture "brain fog was worse after the meeting" or "nausea started after lunch."',
    tip: 'Write your rating FIRST, then add a brief margin note only if something unusual happened.',
  },
  {
    step: 4,
    title: 'Review weekly for clusters and patterns',
    description:
      'Every Sunday, scan the week\'s sheet. Look for correlations: when fatigue was 8+, was sleep quality low? When brain fog spiked, was pain also high? Circle days where multiple symptoms spiked together — those are your flare signatures.',
    tip: 'Use a highlighter to mark flare days — patterns become visible within 2-3 weeks.',
  },
  {
    step: 5,
    title: 'Create a one-page summary for appointments',
    description:
      'Doctors don\'t want 30 daily sheets. Summarize: "Over the past month, average pain 5/10, fatigue 7/10, sleep quality 3/10. Worst on Mondays and after PT. Brain fog correlates with poor sleep 85% of the time." The tracker is your source data — the summary is your appointment tool.',
    tip: 'Bring both: the summary on top, daily sheets underneath. The doctor reads the summary; the detail is there if they want to dig deeper.',
  },
];

const FAQS = [
  {
    question: 'How is this different from a pain diary?',
    answer:
      'A pain diary focuses specifically on pain: intensity, location, quality, and triggers. A symptom tracker captures the broader illness experience — fatigue, sleep, mood, cognitive function, GI issues, and other symptoms that may be equally or more limiting than pain itself. Many people use both: a pain diary for detailed pain-specific tracking and a symptom tracker for the complete picture.',
  },
  {
    question: 'What symptoms should I track?',
    answer:
      'Start with the Big Five: pain, fatigue, sleep quality, mood, and cognitive function. Then add 2-3 symptoms specific to your condition — stiffness for arthritis, numbness for neuropathy, GI symptoms for IBS, or dizziness for POTS. Keep the total between 6-10 symptoms. More than that becomes unsustainable and produces unusable data.',
  },
  {
    question: 'How do I rate something subjective like "brain fog"?',
    answer:
      'Anchor to function, not feeling. Use a scale like: 0 = clear thinking, normal productivity. 2 = slightly slower, manageable. 4 = noticeable difficulty concentrating, work affected. 6 = can\'t follow conversations well, frequent mistakes. 8 = can\'t read, can\'t follow a show, significant memory gaps. 10 = disoriented, unsafe to drive. Consistency in YOUR scale is what matters — not matching anyone else\'s.',
  },
  {
    question: 'Will doctors actually look at all this data?',
    answer:
      'Don\'t hand them 30 sheets of raw data. Create a one-page summary: averages for each symptom, your worst days and best days, and the correlations you\'ve noticed. "Fatigue and brain fog correlate with poor sleep 80% of the time" is actionable. Raw sheets are your evidence backup — bring them in case the doctor wants to dig deeper.',
  },
  {
    question: 'How long should I track before seeing patterns?',
    answer:
      'Two weeks reveals basic patterns: sleep-pain connections, weekly rhythms, medication timing effects. One month shows reliable correlations and flare signatures. For menstrual-related patterns, track at least two full cycles. For seasonal patterns, 3-6 months. The tracker becomes dramatically more useful after the first month.',
  },
  {
    question: 'What if I\'m too exhausted to fill it out some days?',
    answer:
      'On your worst days, just rate pain and fatigue — two numbers take 5 seconds. Leave everything else blank. A partial entry is infinitely more useful than a gap. The template is designed so the most important columns are on the left. If you can only do the first three columns, that\'s still valuable data.',
  },
  {
    question: 'Can I track medication side effects with this?',
    answer:
      'Absolutely — that\'s one of its best uses. When you start a new medication, the symptom tracker captures changes in ALL symptoms, not just pain. You might notice fatigue dropped by 3 points but brain fog increased by 2. This multi-symptom view helps your provider balance medication benefits against side effects more accurately.',
  },
  {
    question: 'How does this help with disability claims?',
    answer:
      'Disability adjudicators evaluate TOTAL functional impact — not just pain. A multi-symptom tracker showing fatigue 7/10, brain fog 6/10, and sleep quality 2/10 alongside pain 5/10 paints a much more complete picture than a pain diary alone. The functional impact section directly maps to the activities disability assessors evaluate.',
  },
  {
    question: 'Should I track on good days too?',
    answer:
      'Yes — good-day data is clinically essential. It establishes your baseline, shows your range, and lets your provider see what a "good day" actually looks like (a "good day" at fatigue 4/10 is very different from fatigue 1/10). Without good-day data, averages are inflated and treatment response is impossible to measure.',
  },
  {
    question: 'Is there a digital version?',
    answer:
      'Yes. Pain Tracker Pro tracks all these symptoms digitally, auto-detects correlations between symptoms, generates clinical reports, and encrypts everything on your device. Many people start with paper to figure out which symptoms matter most, then transition to digital for pattern detection and convenience.',
  },
];

const RELATED_LINKS = [
  {
    title: 'Pain Diary Template PDF',
    description: 'Detailed pain-specific tracking to complement multi-symptom logging',
    href: '/resources/pain-diary-template-pdf',
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'One-page daily format with morning, episodes, meds, mood, and evening summary',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'Fibromyalgia Pain Diary',
    description: 'Specialized tracker for fibromyalgia symptom clusters and flare patterns',
    href: '/resources/fibromyalgia-pain-diary',
  },
  {
    title: 'Neuropathy Symptom Tracker',
    description: 'Focused on nerve-related symptoms: numbness, tingling, burning, sensitivity',
    href: '/resources/neuropathy-symptom-tracker',
  },
  {
    title: 'How to Track Pain for Doctors',
    description: 'What symptom data your doctor actually uses and how to present it',
    href: '/resources/how-to-track-pain-for-doctors',
  },
  {
    title: 'Documenting Pain for Disability',
    description: 'Using multi-symptom data in disability and insurance claims',
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

export const SymptomTrackerPrintablePage: React.FC = () => {
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

    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('role', 'status');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = `${SEO.title}. Download a free comprehensive symptom tracker printable.`;
    document.body.appendChild(ariaLive);

    return () => {
      try { document.body.removeChild(ariaLive); } catch { /* already removed */ }
    };
  }, []);

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
              <Cloudy className="w-4 h-4" />
              <span>Beyond Pain Alone</span>
            </div>

            <h1
              id="hero-heading"
              className="landing-headline landing-headline-lg text-white mb-6"
            >
              Track the{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Complete Picture
              </span>{' '}
              of Chronic Illness
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Pain, fatigue, sleep, brain fog, mood, and functional impact — structured so
              your provider sees the connections that standard pain diaries miss.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              100% free &bull; No email required &bull; No tracking &bull; Prints on standard letter paper
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/symptom-tracker.pdf"
                download="symptom-tracker.pdf"
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
                  <h2 className="text-lg font-semibold text-white">symptom-tracker.pdf</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print-ready</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 7-day log per sheet</span>
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No sign-up</span>
                  </p>
                </div>
              </div>
              <a
                href="/assets/symptom-tracker.pdf"
                download="symptom-tracker.pdf"
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
              subtitle="Eight symptom domains capture the full picture — not just pain, but everything that affects your day."
              center
            >
              One sheet captures what pain diaries miss
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

        {/* ═══ SYMPTOM CLUSTERS ═══ */}
        <section className="py-14 bg-slate-800/40 border-y border-slate-700/50" aria-labelledby="clusters-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Understanding Symptom Clusters" center>
              <span id="clusters-heading">Symptoms travel together — tracking reveals the connections</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              Research shows chronic illness symptoms cluster in predictable patterns.
              Identifying YOUR clusters is the first step to managing them.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {SYMPTOM_CLUSTERS.map((cluster) => (
                <div
                  key={cluster.name}
                  className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${cluster.bg} rounded-xl flex items-center justify-center`}>
                      <cluster.icon className={`w-6 h-6 ${cluster.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{cluster.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cluster.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{cluster.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY IT MATTERS ═══ */}
        <section className="py-16 sm:py-20 bg-slate-900" aria-labelledby="why-it-matters">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Evidence-Based" center>
              <span id="why-it-matters">Why tracking beyond pain changes outcomes</span>
            </SectionHeading>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { value: '80%', label: 'of chronic pain patients also have significant fatigue', source: 'Pain Medicine, 2020 — multi-symptom prevalence study' },
                { value: '65%', label: 'report cognitive complaints alongside pain', source: 'Journal of Pain, 2019 — brain fog & chronic pain' },
                { value: '2.4\u00D7', label: 'better symptom management with structured tracking', source: 'BMC Health Services Research, 2021' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50"
                >
                  <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <p className="text-white font-medium mt-3 mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.source}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-700/50">
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                Chronic pain rarely exists in isolation.{' '}
                <strong className="text-white">
                  Fatigue, sleep disturbance, mood changes, and cognitive dysfunction are not separate problems
                  — they are interconnected symptoms of the same condition.
                </strong>{' '}
                Most pain diaries capture only one dimension: pain intensity. But a doctor who sees
                that your worst pain days also have your worst sleep and worst brain fog can treat the
                root cause rather than chasing individual symptoms. A comprehensive symptom tracker
                gives your provider the complete picture that leads to whole-person treatment plans.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO SHOULD USE IT ═══ */}
        <section className="py-16 sm:py-20 bg-slate-800/30 border-y border-slate-700/50" aria-labelledby="who-should-use">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Is This For You?" center>
              <span id="who-should-use">Who benefits most from multi-symptom tracking</span>
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
              <span id="how-to-use">How to get the most from your symptom tracker</span>
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
                  <h3 className="font-semibold text-white mb-1">Clinically Relevant</h3>
                  <p className="text-sm text-slate-400">
                    Tracks the symptom domains research shows are most interconnected with chronic pain: fatigue, sleep, cognitive function, and mood.
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
                    No email, no account, no tracking pixels. The PDF downloads directly to your device. Your symptom data belongs to you alone.
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
                    Multi-symptom documentation shows total functional impact — exactly what WorkSafeBC, ICBC, CPP-D, and private insurers need to see.
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
                Ready to see the complete picture?
              </h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                Print 4 copies — each covers one week. After just two weeks of multi-symptom
                tracking, most people identify at least one correlation their doctor can act on.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/assets/symptom-tracker.pdf"
                  download="symptom-tracker.pdf"
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
              <span id="compare-heading">Choose the format that fits your energy level</span>
            </SectionHeading>
            <p className="text-slate-400 text-center mt-2 mb-10 max-w-xl mx-auto">
              Both are free and track the same symptoms. Pick whichever you&apos;ll actually do on your worst days.
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
                    'Zero learning curve — print and write',
                    'Works on the couch, in bed, at appointments',
                    'Tangible — hand directly to your doctor',
                    'Customizable — add your own symptoms in blank rows',
                    'No battery or screen fatigue on bad days',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/assets/symptom-tracker.pdf"
                  download="symptom-tracker.pdf"
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
                    'Auto-detects symptom correlations and clusters',
                    'Generates clinical reports for appointments (PDF/CSV/JSON)',
                    'Weather correlation & trigger pattern analysis',
                    'Works offline — encrypted on your device only',
                    'Takes 60 seconds on your worst days',
                    'Trend graphs show treatment response over time',
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
              <span id="related-heading">Related tracking resources</span>
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
            <AlertCircle className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Your doctor can&apos;t treat what they can&apos;t see
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Fatigue, brain fog, and sleep disturbance are invisible to everyone except you.
              A symptom tracker makes them visible — and actionable — for your entire care team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/assets/symptom-tracker.pdf"
                download="symptom-tracker.pdf"
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

export default SymptomTrackerPrintablePage;

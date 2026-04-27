/**
 * Chronic Pain Log Printable – SEO Landing Page
 *
 * Target keyword: "chronic pain log printable"
 * Tier 1 – Printable / Download Intent
 */

import React from 'react';
import {
  FileText, TrendingUp, Clock, Calendar,
  CheckCircle, Flame, Activity, BarChart3,
} from 'lucide-react';
import {
  SEOPageLayout,
  type SEOPageContent,
  type StatItem,
  type PdfPage,
  StatsBanner,
  BottomCTACallout,
  PdfContentsPreview,
} from '../../components/seo';

/* ── Log Format Comparison ────────────────────────────────────────────────── */

const LogFormatComparison: React.FC = () => {
  const formats = [
    {
      name: 'Daily Log Sheet',
      icon: Clock,
      color: 'bg-blue-50 border-blue-200',
      best: 'Ongoing daily tracking',
      captures: ['Pain level at 3 fixed times', 'Medications and timing', 'Sleep quality', 'One functional note', 'Flare flag'],
      notBest: 'Long trend analysis',
    },
    {
      name: 'Weekly Summary Page',
      icon: Calendar,
      color: 'bg-emerald-50 border-emerald-200',
      best: 'Identifying weekly patterns',
      captures: ['7-day pain average', 'Flare count and duration', 'Best/worst days', 'Medication response summary', 'Doctor appointment prep'],
      notBest: 'Real-time tracking',
    },
    {
      name: 'Monthly Trend Log',
      icon: BarChart3,
      color: 'bg-violet-50 border-violet-200',
      best: 'Specialist appointments and reviews',
      captures: ['Month-over-month comparison', 'Trigger pattern summary', 'Treatment effectiveness', 'Functional capacity changes', 'Questions for next appointment'],
      notBest: 'Day-to-day recording',
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Three Log Formats, One Chronic Pain System</h3>
      <p className="text-sm text-slate-500 mb-6">
        Use all three together. Daily for consistency, weekly for patterns, monthly for clinical conversations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formats.map((f) => (
          <div key={f.name} className={`rounded-xl border p-5 ${f.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <f.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Best for: {f.best}</p>
            <ul className="space-y-1 mb-3">
              {f.captures.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">Not designed for: {f.notBest}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Pain Pattern Visual ──────────────────────────────────────────────────── */

const PainPatternTypes: React.FC = () => {
  const patterns = [
    {
      name: 'Stable Chronic',
      description: 'Consistent baseline with predictable variation. Your log shows similar numbers week to week with identifiable triggers.',
      what: 'Track baseline carefully. Focus on what keeps pain at its lower end.',
      color: 'border-l-4 border-l-blue-400 bg-blue-50',
    },
    {
      name: 'Episodic Flares',
      description: 'Periods of manageable pain punctuated by acute flare episodes. The gap between flares is as important as the flares themselves.',
      what: 'Log the 48 hours before each flare. Trigger patterns emerge after 5–6 flare cycles.',
      color: 'border-l-4 border-l-red-400 bg-red-50',
    },
    {
      name: 'Progressive',
      description: 'Pain that trends upward or changes character over months. Visible on monthly logs as a slow drift in averages.',
      what: 'Monthly comparison is essential. Early detection of worsening trends supports timely treatment changes.',
      color: 'border-l-4 border-l-amber-400 bg-amber-50',
    },
    {
      name: 'Unpredictable',
      description: 'Pain that seems to follow no clear pattern. This is the most frustrating — and the most important to track, because patterns do exist.',
      what: 'Log context categories (sleep, weather, stress, activity) consistently. Patterns in unpredictable pain take 6–8 weeks to emerge.',
      color: 'border-l-4 border-l-purple-400 bg-purple-50',
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What Type of Chronic Pain Pattern Do You Have?</h3>
      <p className="text-sm text-slate-500 mb-6">
        Different patterns need different tracking emphasis. Identify yours and adjust your log accordingly.
      </p>
      <div className="space-y-4">
        {patterns.map((p) => (
          <div key={p.name} className={`rounded-xl p-5 ${p.color}`}>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{p.name}</h4>
            <p className="text-sm text-slate-600 mb-2">{p.description}</p>
            <p className="text-xs font-medium text-slate-700 bg-white/60 rounded-lg px-3 py-1.5">
              <Flame className="w-3.5 h-3.5 inline mr-1 text-orange-400" aria-hidden="true" />
              {p.what}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const pdfPages: PdfPage[] = [
  { page: 1, title: 'Daily Pain Log', desc: 'Morning / afternoon / evening pain scores, medications, sleep, functional note, flare flag' },
  { page: 2, title: 'Flare Episode Record', desc: 'Onset, peak severity, duration, suspected trigger, what helped or didn\'t' },
  { page: 3, title: 'Weekly Summary', desc: 'Average pain, flare count, best/worst days, medication observations, next steps' },
  { page: 4, title: 'Monthly Trend Log', desc: 'Month-over-month comparison, trigger patterns, treatment effectiveness, appointment notes' },
];

const logStats: StatItem[] = [
  { value: '4 pg', label: 'Daily, flare, weekly, and monthly', icon: FileText },
  { value: '3×', label: 'Daily pain readings (morning, afternoon, evening)', icon: Clock },
  { value: '2 min', label: 'Minimum daily entry time', icon: Activity },
  { value: '30 day', label: 'Sheets per printable set', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'chronic-pain-log-printable',
  title: 'Chronic Pain Log — Free Printable',
  metaTitle: 'Chronic Pain Log Printable: Free Daily, Flare, and Monthly Tracking Sheets',
  metaDescription: 'Download a free printable chronic pain log with four formats: daily entry sheet, flare episode record, weekly summary, and monthly trend log. Works for all chronic pain conditions.',
  keywords: [
    'chronic pain log printable', 'chronic pain log sheet',
    'printable chronic pain tracker', 'chronic pain log pdf',
    'chronic pain daily log', 'chronic pain record sheet',
    'pain log for chronic pain', 'chronic pain tracking printable',
    'free chronic pain log', 'printable pain tracking sheet',
    'chronic illness log printable', 'daily pain log printable',
    'chronic pain monitoring log', 'pain management log printable',
  ],
  badge: 'Free Printable',
  headline: 'Chronic Pain Log — Free Printable',
  subheadline: 'A chronic pain log needs to work on good days, bad days, flare days, and the quiet weeks in between. This free printable set includes four formats — daily, flare episode, weekly, and monthly — so your log fits your pain, not the other way around.',
  primaryCTA: { text: 'Download free PDF', href: '/assets/chronic-pain-log-printable.pdf', download: true },
  secondaryCTA: { text: 'Try digital version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/chronic-pain-log-printable.pdf', downloadFileName: 'chronic-pain-log-printable.pdf' },
  whatIsThis: 'A 4-format printable chronic pain log designed for long-term daily use. The daily log sheet takes under 2 minutes with fields for morning/afternoon/evening pain levels, medications and timing, sleep quality, and one sentence of functional impact. When flares occur, a dedicated flare episode record captures onset, peak severity, duration, potential triggers, and treatment response. The weekly summary condenses seven days of data into a one-page snapshot, and the monthly trend log shows month-over-month change — the view your doctor needs to make treatment decisions.',
  whoShouldUse: [
    'Anyone with chronic pain lasting more than 12 weeks',
    'People who want a simple, paper-based tracking option',
    'Patients managing conditions like fibromyalgia, arthritis, chronic back pain, neuropathy, or CRPS',
    'Anyone who has tried tracking apps but prefers pen-and-paper',
    'People who want a reliable backup when technology is unavailable',
    'Patients whose doctors have asked for a pain history',
    'Anyone preparing documentation for a disability claim or insurance review',
    'People who want to understand their own pain patterns better',
  ],
  howToUse: [
    { step: 1, title: 'Print a month\'s worth of daily sheets', description: 'Print 30 copies of the daily log sheet and keep them somewhere accessible — your bedside table, desk, or in a binder. Make the habit frictionless: the sheet should be easy to find and fill in quickly.' },
    { step: 2, title: 'Track pain at three fixed times daily', description: 'Morning (when you wake up), afternoon (12–2pm), and evening (before bed) give a consistent picture. Rate each 0–10. Write the time alongside the rating. Consistency in timing is more important than precision in rating.' },
    { step: 3, title: 'Use the flare page when pain spikes', description: 'When pain climbs significantly above your typical level, switch to the flare episode record. Document when it started, how high it peaked, what you tried, and what happened in the 24–48 hours before it began. This data reveals triggers over time.' },
    { step: 4, title: 'Complete the weekly summary on Sunday evenings', description: 'Spend 5 minutes calculating your week\'s average pain, counting flare days, and noting your best and worst days. This is the most efficient 5 minutes in your tracking week — and the format your doctor finds most useful.' },
    { step: 5, title: 'Compile the monthly log at month\'s end', description: 'Transfer your weekly summaries into the monthly trend log. Compare this month\'s average to last month\'s. Note any changes in flare frequency, trigger patterns, or treatment effectiveness. This is your appointment preparation document.' },
  ],
  whyItMatters: 'Chronic pain\'s most insidious feature is how it distorts memory. When you\'re in a bad month, you struggle to remember that last month was better — and vice versa. A written chronic pain log creates an objective record that your memory can\'t overwrite. Over months, it reveals truths that are invisible in real time: a medication that\'s slowly becoming less effective, a trigger pattern that only emerges across a dozen flares, a seasonal cycle that explains why spring and autumn are always harder. That is information you cannot hold in your head and cannot give your doctor without tracking.',
  trustSignals: {
    medicalNote: 'Daily, weekly, and monthly tracking formats align with validated chronic pain outcome measurement approaches used in pain clinics and occupational therapy settings.',
    privacyNote: 'Printable PDF — nothing is stored or transmitted. Your log stays on paper, in your hands.',
    legalNote: 'A consistent chronic pain log with daily entries is among the strongest forms of evidence for disability claims, insurance reviews, and WorkSafeBC documentation.',
  },
  faqs: [
    { question: 'How is this different from a generic pain diary?', answer: 'Most pain diaries are designed for short-term use — tracking a specific episode, pre-surgical baseline, or a few weeks of medication trial. This chronic pain log is built for years of use: the daily sheet is minimal enough to sustain indefinitely, the flare page captures episodic events, and the monthly log reveals the long-term trends that matter most for chronic conditions.' },
    { question: 'I\'ve been in chronic pain for years. Is there any point in starting now?', answer: 'Yes. Your doctor needs your current data, not a complete history. Two to four weeks of consistent logging gives them actionable information about your present state and treatment response. Start from today.' },
    { question: 'What if I miss days?', answer: 'Leave them blank. Don\'t backfill. Note gaps in your weekly summary ("4 days tracked, 3 missed — flu"). Missing days don\'t invalidate your data; they just represent gaps. Clinicians understand that consistency is difficult with chronic illness.' },
    { question: 'How many daily sheets should I print at once?', answer: 'Print 30 at a time (a month\'s worth). Having sheets ready removes the friction of running out. Store in a binder with weekly summary and monthly trend pages at the back.' },
    { question: 'Should I track medications that aren\'t working?', answer: 'Yes. "Took ibuprofen 400mg — no change" is useful clinical data. It documents what you\'ve tried and that it failed. This informs future treatment decisions and supports requests for different or stronger medication.' },
    { question: 'My pain is so variable that rating it feels meaningless. What should I do?', answer: 'Note the range. "Morning: 4, afternoon: 8 (after walking), evening: 6" tells the story of a variable day. Over time, patterns in that variability become visible — what reliably increases or decreases your pain during the day.' },
    { question: 'Can I customize this template?', answer: 'The printable PDF has fixed fields, but you can annotate the margins. If you want a fully customizable digital version, Pain Tracker\'s app lets you add custom fields, notes, and tags to every entry.' },
    { question: 'How do I know if my condition is improving, worsening, or stable?', answer: 'Use the monthly trend log. If your month-over-month average pain is decreasing and flare frequency is dropping, you\'re improving. If averages are rising and flares are increasing, discuss with your doctor. The trend, not any single day, is the signal.' },
    { question: 'What is the minimum I should track to make this worthwhile?', answer: 'One pain rating per day plus any medications taken. This takes under a minute and produces a useful baseline. Adding one functional note ("couldn\'t cook dinner," "walked to the corner") turns it into clinically actionable data.' },
    { question: 'Can I share these logs with my doctor digitally?', answer: 'Yes — photograph or scan completed sheets and send through your clinic\'s patient portal, or bring the physical pages. For digital-first documentation, Pain Tracker\'s app generates formatted PDF reports directly.' },
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Long-term diary with 6 tracking pages', href: '/resources/chronic-pain-diary-template' },
    { title: 'Daily Pain Tracker Printable', description: 'Single-day tracking sheet', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Weekly Pain Log PDF', description: '7-day weekly overview', href: '/resources/weekly-pain-log-pdf' },
    { title: 'Printable Pain Log Sheet', description: 'Simple single-page log', href: '/resources/printable-pain-log-sheet' },
    { title: 'What to Include in a Pain Journal', description: 'What data matters most', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Fibromyalgia Pain Diary', description: 'Condition-specific tracking', href: '/resources/fibromyalgia-pain-diary' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Log Printable', url: '/resources/chronic-pain-log-printable' },
  ],
};

export const ChronicPainLogPrintablePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={logStats} colorScheme="emerald" />
    <LogFormatComparison />
    <PainPatternTypes />
    <PdfContentsPreview pages={pdfPages} accentColor="emerald" variant="badge" heading="What\'s in Your Chronic Pain Log" subtitle="Four formats, one printable set. Use the daily log every day; the others as needed." />
    <BottomCTACallout
      icon={TrendingUp}
      heading="Chronic Pain Hides Its Patterns. Your Log Reveals Them."
      body="Two minutes a day for a month produces data your doctor can act on and that you can\'t hold in memory alone."
      pdfUrl="/assets/chronic-pain-log-printable.pdf"
      gradientClasses="from-emerald-600 to-teal-600"
      tintClass="text-emerald-100"
      buttonTextClass="text-emerald-700"
      buttonHoverClass="hover:bg-emerald-50"
      primaryLabel="Download Free Log"
      secondaryLabel="Try Digital Tracking"
    />
  </SEOPageLayout>
);

export default ChronicPainLogPrintablePage;

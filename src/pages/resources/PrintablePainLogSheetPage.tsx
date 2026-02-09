/**
 * Printable Pain Log Sheet – SEO Landing Page (Enhanced)
 *
 * Target keyword: "printable pain log sheet"
 * Tier 1 – Immediate Survival Traffic
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Clock, Printer,
  FileText, TrendingUp, Zap, PenLine,
  BarChart3, Clipboard, Star, Download
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout, PdfContentsPreview } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Quick-start guide */
const QuickStartGuide: React.FC = () => {
  const steps = [
    { num: 1, action: 'Print', desc: 'Click download, print double-sided. One sheet = one day.', icon: Printer, time: '30 sec' },
    { num: 2, action: 'Fill in basics', desc: 'Date, name, pain level (0-10), location, quality (ache/sharp/burning).', icon: PenLine, time: '30 sec' },
    { num: 3, action: 'Track through the day', desc: 'Morning, midday, evening pain ratings. One word for energy. Meds taken.', icon: Clock, time: '2 min' },
    { num: 4, action: 'End-of-day note', desc: 'What helped, what didn\'t, one thing about your pain today.', icon: Star, time: '30 sec' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 md:p-8 border border-orange-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Print → Fill → Track (Under 4 Minutes)</h3>
      <p className="text-sm text-slate-500 mb-6">No app setup. No account creation. Print a sheet, pick up a pen, and start tracking right now.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => (
          <div key={s.num} className="relative rounded-xl bg-white border border-orange-200 p-4">
            <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">{s.num}</span>
            <s.icon className="w-5 h-5 text-orange-600 mb-2" aria-hidden="true" />
            <h4 className="font-bold text-slate-800 text-sm">{s.action}</h4>
            <p className="text-xs text-slate-600 mt-1">{s.desc}</p>
            <span className="inline-block mt-2 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Why paper tracking still matters */
const WhyPaper: React.FC = () => {
  const benefits = [
    { title: 'No Screen Required', desc: 'Track pain during medical appointments, in waiting rooms, or when screens feel overwhelming. Paper works everywhere.', icon: Clipboard },
    { title: 'Show It to Anyone', desc: 'Hand your log sheet directly to a doctor, nurse, physiotherapist, or family member. No login, no app, no dependency.', icon: FileText },
    { title: 'Lowest Barrier to Start', desc: 'The best tracking system is one you actually use. For many people, pen and paper beats any app — especially on bad pain days.', icon: Zap },
    { title: 'Backup Your Digital Data', desc: 'Use printable logs alongside digital tracking for redundancy, or during phone/computer issues. Analog never crashes.', icon: Download },
  ];
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {benefits.map((b) => (
        <div key={b.title} className="rounded-xl border border-slate-200 bg-white p-5">
          <b.icon className="w-6 h-6 mb-3 text-orange-500" aria-hidden="true" />
          <h4 className="font-bold text-slate-800 mb-1">{b.title}</h4>
          <p className="text-sm text-slate-600">{b.desc}</p>
        </div>
      ))}
    </div>
  );
};

/** What's on the log sheet */
const LogSheetContents: React.FC = () => {
  const sections = [
    { label: 'Header', items: ['Date', 'Name', 'Week number', 'Overall pain goal'], color: 'bg-orange-100' },
    { label: 'Pain Rating', items: ['0-10 numeric scale with anchors', 'Pain location (body area)', 'Pain quality (ache, sharp, burning, etc.)', 'Morning / midday / evening ratings'], color: 'bg-amber-100' },
    { label: 'Symptoms & Impact', items: ['Symptom checklist (fatigue, stiffness, etc.)', 'Sleep quality rating', 'Activity level / function', 'Mood (one word)'], color: 'bg-yellow-100' },
    { label: 'Treatments', items: ['Medications taken + dosage', 'Non-med treatments (heat, ice, exercise)', 'Effectiveness rating (helped / didn\'t)', 'Side effects noted'], color: 'bg-lime-100' },
    { label: 'Notes', items: ['What helped today', 'What made it worse', 'Triggers identified', 'Free text for anything else'], color: 'bg-green-100' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Everything on One Page — Nothing Wasted</h3>
      <p className="text-sm text-slate-500 mb-6">The log sheet is designed to fit everything you need on a single printable page. No flipping, no extra pages.</p>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="font-bold text-slate-800 text-sm sm:w-32 flex-shrink-0">{s.label}</span>
              <div className="flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <span key={item} className="text-xs bg-white/60 text-slate-700 px-2 py-1 rounded-md border border-white/40">{item}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const painLogPdfPages: PdfPage[] = [
  { page: 1, title: 'Daily Pain Log Sheet', desc: 'Complete one-page tracking: pain ratings, symptoms, medications, notes' },
  { page: 2, title: 'Pain Scale Reference', desc: 'Visual 0-10 scale with descriptors and examples for consistent rating' },
  { page: 3, title: 'Symptom Checklist', desc: 'Common symptoms to circle/check alongside pain (fatigue, stiffness, etc.)' },
  { page: 4, title: 'Medication & Treatment Log', desc: 'Structured tracking for treatments, doses, timing, and effectiveness' },
  { page: 5, title: 'Weekly Summary Table', desc: 'Seven-column table to compare daily ratings at a glance' },
  { page: 6, title: 'Notes & Doctor Prep', desc: 'Free space for observations + appointment preparation questions' },
];

const painLogStats: StatItem[] = [
  { value: '< 4 min', label: 'Total daily tracking time', icon: Clock },
  { value: '1 page', label: 'Core daily log — everything in one place', icon: FileText },
  { value: '6 pg', label: 'Complete log kit with reference materials', icon: BarChart3 },
  { value: '0', label: 'Apps, accounts, or tech required', icon: TrendingUp },
];
/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'printable-pain-log-sheet',
  title: 'Printable Pain Log Sheet (Free)',
  metaTitle: 'Printable Pain Log Sheet — Free Simple Daily Pain Tracker You Can Print Right Now | Pain Tracker Pro',
  metaDescription: 'Download a free printable pain log sheet with daily pain ratings, symptom tracking, medication log, and notes section. Print and start tracking in under a minute.',
  keywords: [
    'printable pain log sheet', 'pain log printable',
    'simple pain tracker', 'pain tracking sheet',
    'pain record form', 'pain log form',
    'print pain diary', 'pain documentation sheet',
    'daily pain log printable', 'pain log template printable',
    'free printable pain log', 'pain tracking form',
    'pain record sheet printable', 'simple pain diary printable'
  ],
  badge: 'Free Download',
  headline: 'Printable Pain Log Sheet',
  subheadline: 'The simplest way to start tracking pain: print this sheet, pick up a pen, and log your day in under 4 minutes. No app, no account, no learning curve — just a clean, structured format that captures what your doctor needs to know.',
  primaryCTA: { text: 'Download Free PDF', href: '/assets/printable-pain-log-sheet.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/printable-pain-log-sheet.pdf', downloadFileName: 'printable-pain-log-sheet.pdf' },
  whatIsThis: 'A simple, one-page daily pain log sheet designed for people who want to track their pain without complexity. It covers the essentials — pain level (0-10), location, quality, symptoms, medications, sleep, function, and a notes section — all on a single printable page. The complete kit includes 6 pages: the daily log, a pain scale reference card, symptom checklist, medication tracker, weekly summary table, and a doctor preparation page. Print page 1 alone for daily use, or print the full kit.',
  whoShouldUse: [
    'Anyone who prefers paper tracking over apps',
    'People who want to start tracking pain TODAY with zero setup',
    'Patients who need to bring a pain record to a doctor appointment',
    'People who find digital tools overwhelming, especially on bad pain days',
    'Caregivers tracking pain for someone else',
    'People in medical environments where phones aren\'t convenient',
    'Anyone who wants a simple backup alongside digital tracking',
    'First-time pain trackers who want the lowest possible barrier to start'
  ],
  howToUse: [
    { step: 1, title: 'Download and print — 30 seconds', description: 'Click the download button, print the PDF. For daily use, print page 1 (the daily log sheet). For a complete kit, print all 6 pages.' },
    { step: 2, title: 'Fill in the header — date, name, week number', description: 'If you\'re tracking daily, note which day of the week it is. Week numbers help your doctor see the bigger picture.' },
    { step: 3, title: 'Rate and record throughout the day', description: 'Mark your pain level at morning, midday, and evening. Circle symptoms from the checklist. Note medications and doses. This takes about 30 seconds per check-in.' },
    { step: 4, title: 'End-of-day notes — what helped, what hurt', description: 'Before bed, jot down what helped today (heat, rest, medication), what made pain worse, and any triggers you noticed. One sentence each is enough.' },
    { step: 5, title: 'Stack your sheets — patterns emerge in days', description: 'After 3-5 days, compare your sheets side by side. You\'ll see patterns: morning pain vs evening, activity days vs rest days, medication effects. Bring the stack to your doctor.' }
  ],
  whyItMatters: 'The biggest barrier to pain tracking isn\'t motivation — it\'s friction. If the tool is complicated, requires setup, or adds cognitive load on a bad pain day, it won\'t get used. A printable log sheet removes every barrier: it\'s instant, tangible, and requires only a pen. Research shows that even simple daily pain logs improve diagnosis accuracy and treatment decisions because they replace "I think my pain is usually about a 6" with documented daily data that shows actual patterns.',
  trustSignals: {
    medicalNote: 'Uses the standard NRS (0-10) and captures the core data points clinicians need: temporal pain patterns, functional impact, and treatment response.',
    privacyNote: 'Paper logs are the most private form of health tracking. Your data exists only on paper you physically control.',
    legalNote: 'Dated, signed pain log sheets constitute contemporaneous medical documentation, which carries significant weight in disability claims and legal proceedings.'
  },
  faqs: [
    { question: 'Can I just print page 1 over and over?', answer: 'Absolutely — that\'s how it\'s designed. Page 1 is a standalone daily log that captures everything essential. Print a stack of 7 or 14 and you\'re set for the week or two. The other 5 pages are supplementary.' },
    { question: 'Paper seems old-fashioned. Why not just use an app?', answer: 'Paper works when your phone is dead, when you\'re in a medical office, when screens feel overwhelming on a bad day, and when you need to physically hand something to a doctor. It\'s not either/or — many people use paper alongside digital tracking.' },
    { question: 'How do I show patterns if it\'s just paper?', answer: 'Stack your daily sheets side by side and scan the pain ratings. After 5-7 days, patterns are visible: morning peaks, medication response timing, trigger effects. The weekly summary page (page 5) helps you organize this into a clear snapshot.' },
    { question: 'Should I fill it in all at once or throughout the day?', answer: 'Throughout the day is more accurate — you\'re recording in the moment rather than from memory. But if you can only do it once, evening is best when the full day is fresh. Anything is better than nothing.' },
    { question: 'What pen should I use?', answer: 'Any pen, but: use the same pen for consistency, avoid pencil (it fades/smudges), and consider a different color for flare days so they visually stand out when you stack sheets.' },
    { question: 'Can I modify the sheet?', answer: 'The PDF is pre-formatted but the notes section is intentionally large. Add your own tracking items there (specific symptoms, specific medications, etc.). If you need a highly customized format, try our digital tracker which is fully configurable.' },
    { question: 'Is this the same as a pain diary?', answer: 'A pain log sheet is the simpler version of a pain diary. It focuses on structured data (numbers, checkboxes, short notes) rather than narrative entries. If you want more space to write about your experience, consider our pain diary templates.' },
    { question: 'How should I store completed sheets?', answer: 'Keep them in a folder or binder, ordered by date. Take photos of completed sheets with your phone as a backup. Bring the original sheets (or photos) to doctor appointments.' },
    { question: 'My handwriting is terrible on bad pain days. Does that matter?', answer: 'Not at all. The format uses mostly numbers (0-10), checkboxes, and circled items specifically so handwriting quality doesn\'t matter. The notes section is the only free-text area.' },
    { question: 'Can a caregiver fill this in for me?', answer: 'Yes — caregivers commonly complete pain logs based on the patient\'s verbal reports. Note "filled by [name]" at the top and record what the patient describes. The patient should rate their own pain level if possible.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Detailed daily tracking with more narrative space', href: '/resources/pain-diary-template-pdf' },
    { title: '7-Day Pain Diary', description: 'One-week tracking format', href: '/resources/7-day-pain-diary-template' },
    { title: 'Chronic Pain Diary', description: 'Long-term tracking with trend analysis', href: '/resources/chronic-pain-diary-template' },
    { title: 'Pain Scale Chart', description: 'Visual 0-10 scale reference', href: '/resources/pain-scale-chart-printable' },
    { title: 'Symptom Tracker Printable', description: 'Full symptom tracking beyond pain', href: '/resources/symptom-tracker-printable' },
    { title: 'What to Include in Pain Journal', description: 'Content guide for tracking', href: '/resources/what-to-include-in-pain-journal' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Printable Pain Log Sheet', url: '/resources/printable-pain-log-sheet' }
  ]
};

export const PrintablePainLogSheetPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={painLogStats} colorScheme="orange" />
    <QuickStartGuide />
    <WhyPaper />
    <LogSheetContents />
    <PdfContentsPreview pages={painLogPdfPages} accentColor="orange" variant="badge" heading="Your 6-Page Printable Pain Log Kit" subtitle="Print the daily log (page 1) by itself for quick tracking, or print all 6 pages for a complete kit." />
    <BottomCTACallout
      icon={Printer}
      heading="Print. Pen. Track. That's It."
      body="No app to install, no account to create, no tutorial to watch. Download, print, and start tracking your pain in the next 60 seconds."
      pdfUrl="/assets/printable-pain-log-sheet.pdf"
      gradientClasses="from-orange-500 to-amber-500"
      tintClass="text-orange-100"
      buttonTextClass="text-orange-700"
      buttonHoverClass="hover:bg-orange-50"
      primaryLabel="Download Log Sheet"
      secondaryLabel="Try Digital Version"
    />
  </SEOPageLayout>
);

export default PrintablePainLogSheetPage;

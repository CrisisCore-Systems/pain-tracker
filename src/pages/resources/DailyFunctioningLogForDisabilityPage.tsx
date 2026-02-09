/**
 * Daily Functioning Log for Disability – SEO Landing Page (Enhanced)
 *
 * Target keyword: "daily functioning log for disability"
 * Tier 3 – Disability / Legal Documentation
 */

import React from 'react';
import {
  ArrowRight, Activity, CheckCircle, Clock, TrendingUp,
  Users, FileText, Home, Briefcase, Heart,
  MonitorSmartphone, AlertTriangle, UserCheck
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout, PdfContentsPreview } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Functioning domains */
const FunctioningDomains: React.FC = () => {
  const domains = [
    { icon: Home, label: 'Self-Care & Household', activities: ['Bathing / dressing', 'Cooking meals', 'Housework / laundry', 'Grocery shopping', 'Managing medications'], color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { icon: Briefcase, label: 'Work & Productivity', activities: ['Sitting duration', 'Standing / walking', 'Lifting / carrying', 'Concentration span', 'Task completion'], color: 'bg-amber-50 border-amber-200 text-amber-600' },
    { icon: Users, label: 'Social & Community', activities: ['Leaving the house', 'Social interactions', 'Driving / transport', 'Community activities', 'Appointments kept'], color: 'bg-purple-50 border-purple-200 text-purple-600' },
    { icon: Heart, label: 'Physical Capacity', activities: ['Walking distance', 'Stair climbing', 'Grip strength', 'Balance / stability', 'Endurance (hours active)'], color: 'bg-rose-50 border-rose-200 text-rose-600' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 4 Functioning Domains Evaluators Assess</h3>
      <p className="text-sm text-slate-500 mb-6">Disability evaluations measure what you CAN and CAN'T do across these domains — not just your pain level.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {domains.map((d) => (
          <div key={d.label} className={`rounded-xl border p-5 ${d.color.split(' ').slice(0, 2).join(' ')}`}>
            <div className="flex items-center gap-3 mb-3">
              <d.icon className={`w-6 h-6 ${d.color.split(' ')[2]}`} aria-hidden="true" />
              <h4 className="font-bold text-slate-800">{d.label}</h4>
            </div>
            <ul className="space-y-1.5">
              {d.activities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Activity capacity scale */
const CapacityScale: React.FC = () => {
  const levels = [
    { level: 5, label: 'Full Capacity', desc: 'Completed without difficulty or modification', color: 'bg-emerald-500' },
    { level: 4, label: 'Minor Difficulty', desc: 'Completed but with pain, slower, or minor modification', color: 'bg-emerald-400' },
    { level: 3, label: 'Moderate Difficulty', desc: 'Completed with significant pain, extended rest, or help', color: 'bg-amber-400' },
    { level: 2, label: 'Major Difficulty', desc: 'Partially completed. Had to stop or needed substantial help', color: 'bg-orange-400' },
    { level: 1, label: 'Unable', desc: 'Could not attempt or had to abandon the activity entirely', color: 'bg-red-400' },
    { level: 0, label: 'N/A', desc: 'Not applicable or not attempted today (note why)', color: 'bg-slate-300' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 text-white">
      <h3 className="text-lg font-bold mb-2">The Functioning Scale: How to Rate Each Activity</h3>
      <p className="text-sm text-slate-300 mb-6">Rate each activity you attempt using this 0-5 scale. The log uses this consistently so evaluators see immediately comparable data.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {levels.map((l) => (
          <div key={l.level} className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-7 h-7 rounded-full ${l.color} flex items-center justify-center text-sm font-bold text-white`}>{l.level}</span>
              <h4 className="font-semibold text-white text-sm">{l.label}</h4>
            </div>
            <p className="text-xs text-slate-300">{l.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Daily timeline example */
const DailyTimeline: React.FC = () => {
  const entries = [
    { time: '7:00 AM', activity: 'Got out of bed', rating: 3, note: 'Took 15 minutes to sit up. Needed grab bar to stand. Back stiffness severe.', color: 'bg-amber-100' },
    { time: '7:45 AM', activity: 'Shower + dressing', rating: 2, note: 'Sat on shower bench. Could not reach feet to wash — used long-handled brush. Spouse helped with socks.', color: 'bg-orange-100' },
    { time: '9:00 AM', activity: 'Made breakfast', rating: 3, note: 'Simple cereal only. Standing at counter for 5 min caused back spasm. Ate standing — couldn\'t sit on hard chair.', color: 'bg-amber-100' },
    { time: '10:30 AM', activity: 'Attempted housework', rating: 1, note: 'Started laundry but couldn\'t bend to load machine. Had to abandon. Lay down for 45 minutes.', color: 'bg-red-100' },
    { time: '2:00 PM', activity: 'Grocery store', rating: 1, note: 'Left after 10 min. Couldn\'t push cart. Pain 8/10. Sat in car 20 min before driving home.', color: 'bg-red-100' },
  ];
  return (
    <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Example: What a Strong Functioning Log Entry Looks Like</h3>
      <p className="text-sm text-slate-500 mb-6">This level of detail is what evaluators need. Notice: specific activities, capacity ratings, and concrete details.</p>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.time} className={`rounded-lg p-4 ${e.color}`}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-slate-500 w-16">{e.time}</span>
              <span className="font-semibold text-slate-800 text-sm flex-1">{e.activity}</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${e.rating >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}>{e.rating}</span>
            </div>
            <p className="text-xs text-slate-600 ml-[76px]">{e.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 italic">Each entry takes ~30 seconds to write. Five entries per day = 2-3 minutes total. This adds up to overwhelming evidence.</p>
    </div>
  );
};

const functioningPdfPages: PdfPage[] = [
  { page: 1, title: 'Functioning Assessment Baseline', desc: 'Pre-disability capacity levels, current capacity levels, domains affected, medications, diagnoses' },
  { page: 2, title: 'Daily Activity Log (Morning)', desc: 'Wake time, sleep quality, self-care activities + capacity rating, morning medications + effectiveness' },
  { page: 3, title: 'Daily Activity Log (Afternoon/Evening)', desc: 'Household tasks, outings, social activities, evening routine — each with capacity ratings and notes' },
  { page: 4, title: 'Physical Capacity Measurements', desc: 'Walking distance, sitting/standing tolerance, stair ability, lifting capacity — with pre/post pain levels' },
  { page: 5, title: 'Weekly Functioning Summary', desc: 'Total active hours, activities abandoned, help needed, worst/best functioning days, pattern notes' },
  { page: 6, title: 'Monthly Evaluator Summary', desc: 'One-page overview: functioning trends, capacity ratings by domain, treatment impact, evaluator-ready formatting' },
];

const functioningStats: StatItem[] = [
  { value: '20+', label: 'Activities tracked per day', icon: Activity },
  { value: '4', label: 'Functioning domains covered', icon: UserCheck },
  { value: '0-5', label: 'Capacity rating scale', icon: TrendingUp },
  { value: '6', label: 'Pages in the log template', icon: FileText },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'daily-functioning-log-for-disability',
  title: 'Daily Functioning Log for Disability (Free)',
  metaTitle: 'Daily Functioning Log for Disability — Free Functional Capacity Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free daily functioning log designed for disability claims. Track self-care, household, work, social, and physical activities with capacity ratings evaluators use.',
  keywords: [
    'daily functioning log for disability', 'functional capacity log',
    'disability functioning diary', 'ADL tracking for disability',
    'activities of daily living log', 'functional limitation tracker',
    'disability evidence daily log', 'functioning capacity assessment',
    'daily activity log disability claim', 'ADL disability documentation',
    'functional impairment diary', 'disability evaluation evidence',
    'physical capacity tracking', 'self-care limitation log'
  ],
  badge: 'Free Download',
  headline: 'Daily Functioning Log for Disability',
  subheadline: 'Disability evaluators don\'t just ask "how much does it hurt?" — they ask "what can you do?" This log tracks functional capacity across self-care, household, work, social, and physical domains with the rating scale evaluators actually use.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/daily-functioning-log.pdf', download: true },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/daily-functioning-log.pdf', downloadFileName: 'daily-functioning-log.pdf' },
  whatIsThis: 'A daily functioning log that documents what you CAN and CAN\'T do — the evidence that actually determines disability claim outcomes. Pain levels matter, but functional limitations are what evaluators use to decide your claim. This 6-page log tracks 20+ daily activities across four domains (self-care, household/work, social, physical), uses a standardized 0-5 capacity scale, and formats weekly/monthly summaries for evaluators, attorneys, and physicians. It turns your daily reality into the structured evidence that wins claims.',
  whoShouldUse: [
    'Anyone filing for disability benefits (SSDI, SSI, LTD, WCB) where pain limits function',
    'People whose disability claim was denied for "insufficient functional evidence"',
    'Patients preparing for a Functional Capacity Evaluation (FCE)',
    'Anyone facing an Independent Medical Examination (IME) who needs daily evidence',
    'People whose condition fluctuates — good days and bad days both need documentation',
    'Physical or occupational therapists who want patients to track between sessions',
    'Disability attorneys building evidence packages for clients',
    'Anyone who needs to prove "I have pain" means "I cannot function normally"'
  ],
  howToUse: [
    { step: 1, title: 'Rate every activity you attempt', description: 'Use the 0-5 capacity scale: 5 = full capacity, 4 = minor difficulty, 3 = moderate difficulty with modifications, 2 = major difficulty/needed help, 1 = unable/abandoned, 0 = not attempted. Every activity gets a number.' },
    { step: 2, title: 'Add specific details to each rating', description: '"Showered — rating 2. Sat on shower bench. Couldn\'t wash feet. Spouse helped with socks and shoes." The rating is the data; the detail is the evidence. Both matter.' },
    { step: 3, title: 'Track time and endurance', description: 'How long could you stand? How far could you walk? How many minutes before you had to rest? Time-based measurements are objective evidence evaluators can verify against clinical findings.' },
    { step: 4, title: 'Document what you didn\'t do', description: 'Activities NOT attempted are evidence too. "Didn\'t attempt laundry — couldn\'t bend" is a functional limitation. "Cancelled dinner plans — too fatigued to drive" shows social impact. Record absences, not just attempts.' },
    { step: 5, title: 'Complete weekly summaries', description: 'At week\'s end: total active hours, number of activities abandoned, help received, best and worst days. This summary is what evaluators actually read first.' }
  ],
  whyItMatters: 'Disability claims are won or lost on functional evidence. An evaluator asking "can you work?" isn\'t asking about your pain level — they\'re asking whether you can sit for 6 hours, stand for 2, lift 10 pounds, concentrate for sustained periods. Your functioning log provides the daily, systematic evidence that answers these exact questions. Medical records say what your condition IS. Your functioning log shows what your condition DOES to your daily life.',
  trustSignals: {
    medicalNote: 'Uses the same functional capacity domains assessed in clinical Functional Capacity Evaluations (FCE) and Activities of Daily Living (ADL) assessments used by disability evaluators.',
    privacyNote: 'Your functioning data stays completely private on your device until you choose to share it with your attorney, physician, or evaluator.',
    legalNote: 'Formatted for SSDI, SSI, LTD, and workers\' compensation evaluation standards. Not legal advice — consult a disability attorney for claim-specific guidance.'
  },
  faqs: [
    { question: 'Why is functional logging more important than pain tracking?', answer: 'Pain is subjective — evaluators can\'t verify it independently. Functional limitations are observable and testable. "Can\'t lift more than 5 pounds" is a fact that can be confirmed in an evaluation. "Pain is 8/10" is your report alone. Functional evidence gives evaluators confidence in your claim.' },
    { question: 'How is this different from a pain diary?', answer: 'A pain diary tracks pain levels, medications, and symptoms. This functioning log tracks what you can and can\'t DO. "Pain 7/10" tells evaluators you hurt. "Couldn\'t load dishwasher, sat during child\'s soccer game, spouse drove me to pharmacy" tells them you\'re disabled. Both are useful; this log addresses the #1 reason claims get denied.' },
    { question: 'What if my functioning varies day to day?', answer: 'That variability IS the evidence. Log both good days (capacity 4-5 on some tasks) and bad days (capacity 1-2). The pattern of fluctuation — and the average — is exactly what evaluators need to assess your overall functional capacity.' },
    { question: 'Should I attempt activities even if I know they\'ll cause pain?', answer: 'Only if it\'s safe to do so. Don\'t injure yourself for documentation purposes. If you attempt an activity and have to stop, that\'s powerful evidence. If you know you can\'t do it and don\'t attempt it, document that too with the reason why.' },
    { question: 'How does this work with a Functional Capacity Evaluation?', answer: 'Your daily log provides context for the FCE. The FCE is a 4-6 hour snapshot; your log shows what daily life actually looks like over weeks and months. Evaluators use both — and if they align, your credibility is very strong.' },
    { question: 'What time-based measurements should I track?', answer: 'Walking distance (minutes or blocks), sitting tolerance (before needing to stand), standing tolerance (before needing to sit), how long you can concentrate on a task, and how many hours per day you\'re active vs. resting. These map directly to work capacity questions.' },
    { question: 'Should I include activities I can still do?', answer: 'Absolutely. "Made the bed (rating 4, minor stiffness)" shows you\'re being honest. Claims with ONLY limitations look exaggerated. A mix of things you can do, things you struggle with, and things you can\'t do is the most credible pattern.' },
    { question: 'What if I need help with activities?', answer: 'Document exactly what help you need and from whom. "Spouse carried groceries from car." "Daughter helped with laundry." "Used a reacher tool for items above waist height." Needed assistance is strong functional limitation evidence.' },
    { question: 'Can physical therapists use this?', answer: 'Yes — many PTs and OTs ask patients to keep functioning logs between sessions. This template provides structure. Sharing the log with your therapist also helps them document your progress (or lack thereof) in their clinical notes, which supports your case.' },
    { question: 'How does this help with appeal after denial?', answer: 'Denial letters typically cite "insufficient evidence of functional limitations." This log directly addresses that gap. Daily functioning evidence is often what distinguishes successful appeals from unsuccessful ones — it fills the exact evidence gap the denial identified.' }
  ],
  relatedLinks: [
    { title: 'Documenting Pain for Disability', description: 'Complete evidence-building guide', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Journal for Disability Benefits', description: 'Benefits-ready journal format', href: '/resources/pain-journal-for-disability-benefits' },
    { title: 'WorkSafeBC Pain Journal', description: 'BC workplace injury claims', href: '/resources/worksafebc-pain-journal-template' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Pain Diary for Specialist', description: 'Prepare for evaluations', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Symptom Tracker Printable', description: 'Track symptoms beyond pain', href: '/resources/symptom-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Daily Functioning Log for Disability', url: '/resources/daily-functioning-log-for-disability' }
  ]
};

export const DailyFunctioningLogForDisabilityPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={functioningStats} colorScheme="blue" />
    <FunctioningDomains />
    <CapacityScale />
    <DailyTimeline />
    <PdfContentsPreview pages={functioningPdfPages} accentColor="blue" heading="What’s in the Functioning Log (6 Pages)" />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading='Evaluators Ask "What Can You Do?" Your Log Answers.'
      body="Every activity you rate, every limitation you document, every modification you note — it builds the functional evidence that pain levels alone can't provide. Download the log and start turning your daily reality into evidence."
      pdfUrl="/assets/daily-functioning-log.pdf"
      gradientClasses="from-blue-600 to-indigo-600"
      tintClass="text-blue-100"
      buttonTextClass="text-blue-700"
      buttonHoverClass="hover:bg-blue-50"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default DailyFunctioningLogForDisabilityPage;

/**
 * How Doctors Use Pain Diaries – SEO Landing Page (Enhanced)
 *
 * Target keyword: "how doctors use pain diaries"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  ArrowRight, Stethoscope, CheckCircle, TrendingUp,
  FileText, Brain, Activity, Pill, BarChart3,
  MonitorSmartphone, Eye, Users
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** How doctors use each diary section */
const ClinicalUseMap: React.FC = () => {
  const uses = [
    { data: 'Pain Level Trends', clinical: 'Assess treatment effectiveness over time. If averages aren\'t improving, change strategy.', decision: 'Adjust dose, switch medication, add therapy', icon: TrendingUp, color: 'bg-blue-50 border-blue-200' },
    { data: 'Pain Timing & Patterns', clinical: 'Identify inflammatory vs. mechanical vs. neuropathic patterns from when pain is worst.', decision: 'Narrow diagnosis, target specific pain type', icon: BarChart3, color: 'bg-purple-50 border-purple-200' },
    { data: 'Medication Response', clinical: 'Measure onset time, duration of relief, partial vs. full response, side effects.', decision: 'Optimize dosing, timing, or switch class', icon: Pill, color: 'bg-emerald-50 border-emerald-200' },
    { data: 'Functional Limitations', clinical: 'Document disability impact for referrals, work restrictions, disability paperwork.', decision: 'Justify referrals, PT orders, work restrictions', icon: Activity, color: 'bg-amber-50 border-amber-200' },
    { data: 'Sleep & Mood Data', clinical: 'Screen for co-occurring conditions. Poor sleep worsens pain neurologically.', decision: 'Add sleep medication, psychology referral, antidepressant', icon: Brain, color: 'bg-rose-50 border-rose-200' },
    { data: 'Trigger Documentation', clinical: 'Identify modifiable risk factors. Guide lifestyle recommendations and PT programs.', decision: 'PT protocol, ergonomic changes, activity modification', icon: Eye, color: 'bg-teal-50 border-teal-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What Doctors Actually Do With Your Pain Diary</h3>
      <p className="text-sm text-slate-500 mb-6">Every data point triggers a specific clinical decision. Here's the direct line from your tracking to your treatment.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uses.map((u) => (
          <div key={u.data} className={`rounded-xl border p-5 ${u.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <u.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800 text-sm">{u.data}</h4>
            </div>
            <p className="text-sm text-slate-600 mb-2">{u.clinical}</p>
            <div className="flex items-center gap-2 text-xs bg-white/70 rounded-lg px-3 py-2 border border-slate-100">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="text-slate-600 font-medium">Clinical decision: {u.decision}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Clinical decision timeline */
const DecisionTimeline: React.FC = () => {
  const visits = [
    { visit: 'Visit 1', action: 'Baseline assessment', diary: 'No diary yet → relying on recall and exam alone', outcome: 'Initial treatment plan based on limited data', quality: 'bg-red-100 border-red-200' },
    { visit: 'Visit 2 (with diary)', action: 'Pattern recognition', diary: '2-4 weeks of daily data → clear patterns emerge', outcome: 'First evidence-based treatment adjustment', quality: 'bg-amber-100 border-amber-200' },
    { visit: 'Visit 3', action: 'Treatment response assessment', diary: 'Before/after medication data → objective measure of change', outcome: 'Optimize or change approach with confidence', quality: 'bg-emerald-100 border-emerald-200' },
    { visit: 'Visit 4+', action: 'Long-term management', diary: 'Months of data → trends visible, seasonal patterns, trigger library built', outcome: 'Personalized treatment plan based on YOUR data', quality: 'bg-blue-100 border-blue-200' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-2">How Your Diary Improves Care Over Time</h3>
      <p className="text-sm text-slate-500 mb-6">Each appointment with diary data compounds the quality of your clinical care.</p>
      <div className="space-y-4">
        {visits.map((v) => (
          <div key={v.visit} className={`rounded-xl border p-4 ${v.quality}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-800 bg-white px-2 py-0.5 rounded">{v.visit}</span>
              <span className="text-sm font-semibold text-slate-700">{v.action}</span>
            </div>
            <p className="text-sm text-slate-600 mb-1">📋 {v.diary}</p>
            <p className="text-sm text-slate-700 font-medium">→ {v.outcome}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Research evidence */
const ResearchEvidence: React.FC = () => {
  const facts = [
    { finding: 'Patients who bring structured pain records report higher satisfaction with appointments', source: 'Pain management literature' },
    { finding: 'Recall of pain intensity at appointments differs significantly from actual daily ratings', source: 'Memory bias research' },
    { finding: 'Medication adjustments happen faster when doctors have response data between visits', source: 'Treatment optimization studies' },
    { finding: 'Structured pain assessment contributes to more accurate diagnosis and targeted treatment', source: 'Clinical assessment guidelines' },
  ];
  return (
    <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6">What Research Shows</h3>
      <div className="space-y-3">
        {facts.map((f, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-sky-50 border border-sky-100">
            <CheckCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm text-slate-700 font-medium">{f.finding}</p>
              <p className="text-xs text-slate-400 mt-0.5">{f.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const doctorStats: StatItem[] = [
  { value: '6', label: 'Ways doctors use diary data', icon: Stethoscope },
  { value: '15 min', label: 'Average appointment duration', icon: FileText },
  { value: '2-4 wk', label: 'To establish useful patterns', icon: TrendingUp },
  { value: '10×', label: 'More productive appointments', icon: Users },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'how-doctors-use-pain-diaries',
  title: 'How Doctors Use Pain Diaries',
  metaTitle: 'How Doctors Use Pain Diaries — The Clinical Perspective | Pain Tracker Pro',
  metaDescription: 'Understand how doctors actually use pain diary data to make treatment decisions. 6 clinical uses, decision timeline, and how to make your tracking clinically useful.',
  keywords: [
    'how doctors use pain diaries', 'pain diary clinical use',
    'doctor pain diary assessment', 'clinical pain tracking',
    'pain diary medical decisions', 'doctor pain journal review',
    'clinical use of pain records', 'pain assessment tools',
    'pain diary treatment decisions', 'how physicians use pain data',
    'clinical pain diary value', 'pain diary patient outcomes',
    'medical pain tracking benefits', 'pain diary evidence based'
  ],
  badge: 'Guide',
  headline: 'How Doctors Use Pain Diaries',
  subheadline: 'Your pain diary isn\'t just for you. Here\'s exactly how doctors use each piece of data to make treatment decisions, narrow diagnoses, and justify referrals — and why the diary you keep directly impacts the care you receive.',
  primaryCTA: { text: 'Download Free Pain Diary', href: '/resources/pain-diary-template-pdf' },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/clinical-pain-diary-guide.pdf', downloadFileName: 'clinical-pain-diary-guide.pdf' },
  whatIsThis: 'An inside look at how healthcare providers actually use pain diary data in clinical practice. Most patients track pain because they were told to — but don\'t understand HOW their data changes clinical decisions. This guide maps every piece of diary data to its clinical use: pain trends drive medication adjustments, timing patterns narrow diagnoses, functional data justifies referrals, and sleep/mood data reveals co-occurring conditions. Understanding the clinical perspective makes your tracking more focused and more useful.',
  whoShouldUse: [
    'Anyone who wonders "does my doctor even look at this?"',
    'Patients who want to track the RIGHT things (not just everything)',
    'People starting pain treatment who want to accelerate improvement',
    'Patients whose treatment hasn\'t been working and want to understand why',
    'Medical students or healthcare trainees learning about patient-reported outcomes',
    'Anyone who wants their tracking to directly improve their clinical care',
    'Patients preparing to see a new specialist and wanting to bring the right data',
    'Healthcare advocates helping patients prepare for appointments'
  ],
  howToUse: [
    { step: 1, title: 'Learn what each data point IS for', description: 'Each section of this guide maps diary data → clinical use → treatment decision. Once you understand the clinical purpose, your tracking becomes focused and efficient rather than tedious.' },
    { step: 2, title: 'Focus your tracking on what YOUR doctor needs', description: 'A pain specialist needs medication response data. A rheumatologist needs morning stiffness timing. A neurologist needs pain quality descriptors. Match your tracking to your provider.' },
    { step: 3, title: 'Present data in the clinical framework', description: 'Lead with patterns, not individual entries. "My pain averages 6, worse in mornings, medication helps for 3 hours" is clinical language. This saves time and improves communication.' },
    { step: 4, title: 'Track treatment response specifically', description: 'Before/after comparisons are the most clinically useful data. Track pain levels before medication changes and after, before new therapies and after. This is how doctors measure whether something is working.' },
    { step: 5, title: 'Understand the cumulative value', description: 'Each appointment with diary data improves the next one. By visit 3-4, your doctor has enough trend data for truly personalized treatment decisions based on YOUR patterns, not textbook averages.' }
  ],
  whyItMatters: 'Doctors make treatment decisions with incomplete information every day. Office visits capture a snapshot — 15 minutes out of weeks of living with pain. Your diary fills the gap between visits with the daily reality that snapshots miss. When your doctor can see that mornings are worse (suggesting inflammation), that medication relief lasts only 3 hours (suggesting dose adjustment), or that pain correlates with certain activities (suggesting specific PT) — treatment becomes targeted instead of trial-and-error.',
  trustSignals: {
    medicalNote: 'Reflects clinical pain assessment practices and patient-reported outcome standards used in pain management.',
    privacyNote: 'Your tracking data stays on your device. You control what to share with healthcare providers.',
    legalNote: 'Understanding clinical use helps ensure your tracking supports referral requests, prior authorizations, and disability documentation.'
  },
  faqs: [
    { question: 'Do doctors actually read pain diaries?', answer: 'Most don\'t read every entry — they scan for patterns. That\'s why summaries matter. A doctor who sees "average pain 6, medication helps 2 points for 3 hours, worse in mornings, 2 flares per week" can make decisions in 30 seconds. Bring summaries, not novels.' },
    { question: 'What\'s the most clinically useful thing I can track?', answer: 'Medication response. Doctors can examine, image, and test everything else — but they can\'t observe how medication works at home. "Pain before dose: 7, after 1 hour: 5, wore off at 3 hours" is the single most valuable data point for treatment optimization.' },
    { question: 'How do doctors use pain diaries for diagnosis?', answer: 'Pain patterns are diagnostic. Morning stiffness lasting >30 minutes suggests inflammatory arthritis. Pain that worsens with activity but improves with rest suggests mechanical issues. Burning pain in a stocking-glove pattern suggests neuropathy. Your diary reveals the pattern that a single visit might miss.' },
    { question: 'My doctor seems rushed — how do I share data efficiently?', answer: 'One-line summary: "Pain averages [X], medication helps [Y points] for [Z hours], worst trigger is [A], sleep is [B hours]." Under 30 seconds, contains all the clinically actionable data. Then: "I have detailed entries if you want to review."' },
    { question: 'Can my diary influence referral decisions?', answer: 'Absolutely. "Patient reports daily pain 7/10, medication provides only 2 hours relief, functional limitations in ADLs" — written in clinical notes based on your diary — provides the documentation needed for specialist referrals and prior authorizations.' },
    { question: 'What if my diary contradicts what my doctor says?', answer: 'Your diary IS the data. If your doctor says "you seem fine" but your diary shows consistent 6-7/10 pain with significant functional limitations, the diary provides evidence for a second opinion or referral discussion. Data is powerful.' },
    { question: 'How do doctors use diaries for treatment evaluation?', answer: 'They compare pre-treatment and post-treatment data. If your average pain was 7 before starting a medication and is now 5, that\'s a clear response. If it hasn\'t changed after 6 weeks, it\'s time to try something else. Your diary provides the before/after comparison.' },
    { question: 'Do specialists use diaries differently than primary care?', answer: 'Yes. Pain specialists focus heavily on medication response and pain quality. Rheumatologists look at morning stiffness and joint patterns. Neurologists analyze pain descriptors and progression. Surgeons look at positional triggers. Know your audience.' },
    { question: 'How does my diary help with insurance/prior auth?', answer: 'Insurance requires "medical necessity" for procedures, specialists, and expensive medications. Your diary documenting "failed conservative treatment for 6 weeks — pain unchanged at 7/10" is the evidence that gets prior authorizations approved.' },
    { question: 'Is there a "wrong" way to keep a pain diary?', answer: 'Yes: constant 10/10 with no variation looks unreliable. Not tracking medication response wastes the most useful data point. Very sporadic entries show no patterns. But honestly tracking — even imperfectly — is always better than not tracking at all.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain for Doctors', description: 'Practical tracking guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'What to Include in Pain Journal', description: 'Complete content checklist', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Pain Diary for Specialist', description: 'Specialist-specific preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Pain Diary Template PDF', description: 'Start tracking with proven format', href: '/resources/pain-diary-template-pdf' },
    { title: 'Weekly Pain Log PDF', description: 'See patterns doctors look for', href: '/resources/weekly-pain-log-pdf' },
    { title: 'Symptom Tracking Before Diagnosis', description: 'Pre-diagnosis documentation', href: '/resources/symptom-tracking-before-diagnosis' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How Doctors Use Pain Diaries', url: '/resources/how-doctors-use-pain-diaries' }
  ]
};

export const HowDoctorsUsePainDiariesPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={doctorStats} colorScheme="sky" />
    <ClinicalUseMap />
    <DecisionTimeline />
    <ResearchEvidence />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Now That You Know What Doctors Need — Start Providing It."
      body="Understanding the clinical use of your data makes tracking purposeful, not tedious. Every entry you make is a data point that drives better treatment decisions."
      pdfUrl="/resources/pain-diary-template-pdf"
      download={false}
      gradientClasses="from-sky-600 to-indigo-600"
      tintClass="text-sky-100"
      buttonTextClass="text-sky-700"
      buttonHoverClass="hover:bg-sky-50"
      primaryLabel="Get Free Templates"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default HowDoctorsUsePainDiariesPage;

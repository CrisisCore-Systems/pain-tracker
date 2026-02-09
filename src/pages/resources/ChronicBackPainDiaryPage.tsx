/**
 * Chronic Back Pain Diary – SEO Landing Page (Enhanced)
 *
 * Target keyword: "chronic back pain diary"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, Users, FileText, Clock, Shield,
  Compass, Ruler, Dumbbell, MonitorSmartphone
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Spine region map showing cervical/thoracic/lumbar/sacral */
const SpineRegionGuide: React.FC = () => {
  const regions = [
    { code: 'C', name: 'Cervical (Neck)', vertebrae: 'C1–C7', common: 'Neck pain, headaches, arm tingling', color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { code: 'T', name: 'Thoracic (Mid-Back)', vertebrae: 'T1–T12', common: 'Postural pain, rib-area pain, stiffness', color: 'border-green-200 bg-green-50 text-green-700' },
    { code: 'L', name: 'Lumbar (Lower Back)', vertebrae: 'L1–L5', common: 'Disc herniation, sciatica, lifting pain', color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { code: 'S', name: 'Sacral / SI Joint', vertebrae: 'S1–S5 + Coccyx', common: 'SI joint dysfunction, tailbone pain', color: 'border-red-200 bg-red-50 text-red-700' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Spine Regions: Be Specific in Your Diary</h3>
      <p className="text-sm text-slate-500 mb-6">"Back pain" is too vague for diagnosis. Use these codes to document exactly where — location determines treatment.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {regions.map((r) => (
          <div key={r.code} className={`rounded-xl border p-5 ${r.color}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-black">{r.code}</span>
              <div>
                <h4 className="font-semibold text-slate-800">{r.name}</h4>
                <span className="text-xs text-slate-500">{r.vertebrae}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">{r.common}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Mechanical vs Inflammatory back pain comparison */
const PainTypeComparison: React.FC = () => {
  const rows = [
    { feature: 'Morning stiffness', mechanical: '< 30 min', inflammatory: '> 30 min (often hours)' },
    { feature: 'Worse with', mechanical: 'Activity, lifting, sitting', inflammatory: 'Rest, inactivity' },
    { feature: 'Better with', mechanical: 'Rest, position change', inflammatory: 'Movement, exercise' },
    { feature: 'Night pain', mechanical: 'Position-dependent', inflammatory: 'Wakes you in 2nd half of night' },
    { feature: 'Age of onset', mechanical: 'Any age (often 30-50)', inflammatory: 'Usually < 40' },
    { feature: 'Pattern', mechanical: 'Activity → pain → rest → relief', inflammatory: 'Rest → stiffness → movement → relief' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-6 md:p-8 border border-blue-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Mechanical vs. Inflammatory: Your Diary Reveals the Difference</h3>
      <p className="text-sm text-slate-500 mb-6">These respond to completely different treatments. Your tracking patterns help identify which type you have.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-4 font-semibold text-slate-700">Feature</th>
              <th className="text-left py-2 px-4 font-semibold text-amber-700">Mechanical</th>
              <th className="text-left py-2 pl-4 font-semibold text-blue-700">Inflammatory</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-700 font-medium">{r.feature}</td>
                <td className="py-2 px-4 text-slate-600">{r.mechanical}</td>
                <td className="py-2 pl-4 text-slate-600">{r.inflammatory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Red flag warning signs */
const RedFlagChecklist: React.FC = () => {
  const flags = [
    'Progressive leg weakness or numbness',
    'Loss of bladder or bowel control',
    'Pain with fever or unexplained weight loss',
    'Pain after significant trauma (fall, accident)',
    'Pain that wakes you from deep sleep',
    'Numbness in the groin/saddle area',
  ];
  return (
    <div className="my-10 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
        <h3 className="text-xl font-bold text-red-800">Red Flags — Seek Immediate Medical Attention</h3>
      </div>
      <p className="text-sm text-red-700 mb-4">If you experience any of these alongside back pain, see a doctor urgently. Note these in your diary for the visit.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {flags.map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm text-red-800">
            <XCircle className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" aria-hidden="true" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
};

/** PDF contents data */
const backPainPdfPages: PdfPage[] = [
  { page: 1, title: 'Pain Profile & History', desc: 'Spine region, injury history, diagnosis, current treatments, and baseline pain levels' },
  { page: 2, title: 'Daily Back Pain Log', desc: 'Location-coded tracking (C/T/L/S), radiation pattern, stiffness, activity triggers' },
  { page: 3, title: 'Activity & Position Impact', desc: 'How sitting, standing, walking, bending, lifting, and driving affect your pain' },
  { page: 4, title: 'Exercise & PT Log', desc: 'Prescribed exercises, reps, duration, and pain response for physical therapy tracking' },
  { page: 5, title: 'Medication & Treatment', desc: 'What you\'re taking, when, how it works, and side effects to discuss with your doctor' },
  { page: 6, title: 'Weekly Summary & Doctor Prep', desc: 'One-page overview for spine specialist, PT, or chiropractor appointments' },
];

/** Stats data */
const backPainStats: StatItem[] = [
  { value: '#1', label: 'Cause of disability worldwide', icon: TrendingUp },
  { value: '80%', label: 'Of adults experience back pain', icon: Users },
  { value: '6', label: 'Page back-specific template', icon: FileText },
  { value: '4 types', label: 'Of back pain distinguished', icon: Compass },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'chronic-back-pain-diary',
  title: 'Chronic Back Pain Diary (Free)',
  metaTitle: 'Chronic Back Pain Diary — Free 6-Page Back Pain Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free chronic back pain diary designed for spine-specific tracking. Document pain location, radiation patterns, activity triggers, posture, and PT exercises for better treatment outcomes.',
  keywords: [
    'chronic back pain diary', 'back pain tracker', 'spine pain journal',
    'lower back pain log', 'back pain activity tracker', 'lumbar pain diary',
    'back pain template', 'spinal pain tracking', 'sciatica pain diary',
    'back pain PT tracker', 'herniated disc diary', 'back pain worker comp',
    'mechanical back pain log', 'spine specialist preparation'
  ],
  badge: 'Free Download',
  headline: 'Chronic Back Pain Diary',
  subheadline: 'Track exactly where it hurts, what makes it worse, and what helps. Location-coded spine tracking, activity impact, and PT exercise logging — because "my back hurts" isn\'t enough for a diagnosis.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/chronic-back-pain-diary.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/chronic-back-pain-diary.pdf', downloadFileName: 'chronic-back-pain-diary.pdf' },
  whatIsThis: 'A chronic back pain diary designed specifically for spinal conditions. It uses location codes (C/T/L/S) to pinpoint pain by spine region, tracks radiation patterns that indicate nerve involvement, logs activity and posture impact, and includes a dedicated physical therapy exercise tracker. Your spine specialist, PT, or chiropractor gets the precise data they need — not vague descriptions of "back pain."',
  whoShouldUse: [
    'Anyone with chronic lower back, upper back, or spinal pain',
    'People working with physical therapists, chiropractors, or spine specialists',
    'Patients with herniated discs, sciatica, spinal stenosis, or degenerative disc disease',
    'Workers whose job causes or worsens back pain (desk workers, healthcare, labor, driving)',
    'People preparing for spine specialist consultations or MRI follow-ups',
    'Those filing workers\' compensation claims for back injuries',
    'Post-surgical patients tracking recovery and PT progress',
    'Anyone who\'s been told "your back looks fine on imaging" but still hurts'
  ],
  howToUse: [
    { step: 1, title: 'Use spine region codes', description: 'Mark pain as C (cervical/neck), T (thoracic/mid-back), L (lumbar/lower), or S (sacral). Note radiation: "L4-L5, radiating to left calf." Precise location guides diagnosis.' },
    { step: 2, title: 'Connect pain to activities', description: 'Back pain is strongly activity-dependent. Log what you were doing before pain increased and what provided relief. This reveals mechanical vs. inflammatory patterns.' },
    { step: 3, title: 'Track position tolerance', description: 'How long can you sit, stand, walk, drive, or bend before pain worsens? Track in minutes. Changes over time show treatment effectiveness.' },
    { step: 4, title: 'Log PT exercises faithfully', description: 'Record which exercises you did, reps, and pain during/after. Your PT uses this to progress your program safely. Missing this data slows recovery.' },
    { step: 5, title: 'Summarize for appointments', description: 'Use the weekly summary page before spine visits. One page showing location, triggers, tolerance changes, and treatment response — everything your specialist needs.' }
  ],
  whyItMatters: 'Back pain is the #1 cause of disability worldwide, yet treatment often fails because it\'s not targeted. "My back hurts" tells a doctor almost nothing. But "L4-L5 pain increases to 7/10 after 30 minutes sitting, relieved by walking, with intermittent left leg tingling" — that points to a specific diagnosis and treatment. Research shows patients who keep detailed back pain diaries work more effectively with physical therapists and have significantly better outcomes.',
  trustSignals: {
    medicalNote: 'Includes spine region coding used by orthopedic surgeons and physiotherapists for back pain assessment.',
    privacyNote: 'Paper format keeps your health details completely private — no apps, no accounts.',
    legalNote: 'Activity-correlated back pain documentation is essential for workplace injury and disability claims.'
  },
  faqs: [
    { question: 'What back pain details matter most?', answer: 'Location (use spine codes), radiation pattern (does it travel down a leg or arm?), quality (sharp, dull, burning, aching), timing (constant vs. intermittent), and what makes it better or worse. The activity connection is the single most actionable piece of information.' },
    { question: 'How do I know if my pain is mechanical or inflammatory?', answer: 'Mechanical: worse with activity, better with rest, < 30 min morning stiffness. Inflammatory: worse with rest, better with movement, > 30 min morning stiffness, wakes you in the second half of the night. Your diary patterns will reveal which — and they require completely different treatments.' },
    { question: 'Should I track exercises and PT?', answer: 'Absolutely. Record which exercises, sets/reps, and pain during and after. This is critical data for your physical therapist — they can see what helps, what aggravates, and how to safely progress your program.' },
    { question: 'What about radiation and nerve symptoms?', answer: 'Track any tingling, numbness, weakness, or pain that shoots into your buttocks, legs, arms, or hands. Note which side and how far it travels. This indicates nerve involvement (sciatica, radiculopathy) and changes treatment decisions significantly.' },
    { question: 'Is this useful for workers\' compensation claims?', answer: 'Very. Document the connection between specific work tasks (lifting, prolonged sitting, repetitive bending) and pain. "Pain increased to 8/10 after 2 hours at workstation" directly supports a work-related claim.' },
    { question: 'How does sitting vs. standing time matter?', answer: 'Track time in each position and pain at transitions. Many disc issues worsen with sitting; stenosis worsens with standing/walking. Your position-tolerance pattern helps diagnose the underlying problem and design workplace accommodations.' },
    { question: 'What if my imaging looks normal but I\'m still in pain?', answer: 'This is extremely common. Your diary becomes even more important — it documents the functional reality that imaging misses. Patterns in your tracking (mechanical vs. inflammatory, position-dependent, activity-correlated) guide treatment even without imaging findings.' },
    { question: 'How long should I use this before my appointment?', answer: 'Minimum 1 week, ideally 2-4 weeks. A longer tracking period shows more reliable patterns. If you\'re seeing a new specialist, 2+ weeks of data makes a dramatically better first impression than "it\'s been hurting for months."' },
    { question: 'Can I track post-surgical recovery with this?', answer: 'Yes. Track the same metrics (pain, location, function, PT exercises) — the diary becomes a recovery timeline showing improvement over weeks and months. Surgeons love seeing objective progress data.' },
    { question: 'What\'s the difference between this and a general pain diary?', answer: 'Spine-specific location coding, radiation pattern tracking, position tolerance logging, PT exercise tracker, and the mechanical vs. inflammatory framework. A generic pain diary misses all of these — and they\'re exactly what spine specialists need.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive general pain tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'WorkSafeBC Pain Journal', description: 'For BC workplace back injuries', href: '/resources/worksafebc-pain-journal-template' },
    { title: 'Nerve Pain Symptom Log', description: 'For sciatica and radicular pain', href: '/resources/nerve-pain-symptom-log' },
    { title: 'How to Track Pain for Doctors', description: 'Present back pain data to specialists', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Documenting Pain for Disability', description: 'Back pain documentation for claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Daily Pain Tracker Printable', description: 'Quick daily format for back pain', href: '/resources/daily-pain-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Back Pain Diary', url: '/resources/chronic-back-pain-diary' }
  ]
};

export const ChronicBackPainDiaryPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={backPainStats} colorScheme="blue" />
    <SpineRegionGuide />
    <PainTypeComparison />
    <RedFlagChecklist />
    <PdfContentsPreview
      pages={backPainPdfPages}
      accentColor="blue"
      subtitle="Built for back pain specifically \u2014 not a generic diary with a spine icon."
    />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Track PT Progress Over Months, Not Just Days"
      body={"The printable PDF captures daily details beautifully. When you need to see 3-month trends, position tolerance changes over time, or medication effectiveness patterns \u2014 the digital version adds what paper can't: visualization and pattern analysis."}
      pdfUrl="/assets/chronic-back-pain-diary.pdf"
      gradientClasses="from-blue-600 to-indigo-600"
      tintClass="text-blue-100"
      buttonTextClass="text-blue-700"
      buttonHoverClass="hover:bg-blue-50"
    />
  </SEOPageLayout>
);

export default ChronicBackPainDiaryPage;

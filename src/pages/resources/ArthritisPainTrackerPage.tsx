/**
 * Arthritis Pain Tracker – SEO Landing Page (Enhanced)
 *
 * Target keyword: "arthritis pain tracker"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, AlertTriangle, CheckCircle,
  TrendingUp, Users, FileText, Clock, Thermometer,
  Sun, Droplets, Hand
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Arthritis type comparison */
const ArthritisTypeComparison: React.FC = () => {
  const types = [
    { name: 'Rheumatoid (RA)', pattern: 'Symmetrical, small joints first', stiffness: '> 1 hour morning stiffness', key: 'Autoimmune — immune system attacks joints', color: 'border-red-200 bg-red-50' },
    { name: 'Osteoarthritis (OA)', pattern: 'Asymmetrical, weight-bearing joints', stiffness: '< 30 min, worse with use', key: 'Mechanical — cartilage wear from use/injury', color: 'border-amber-200 bg-amber-50' },
    { name: 'Psoriatic (PsA)', pattern: 'Asymmetrical, fingers/toes (dactylitis)', stiffness: 'Variable, with skin symptoms', key: 'Autoimmune — linked to psoriasis', color: 'border-purple-200 bg-purple-50' },
    { name: 'Gout', pattern: 'Sudden, single joint (often big toe)', stiffness: 'Acute episodes, fine between', key: 'Crystal deposits — uric acid buildup', color: 'border-blue-200 bg-blue-50' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Your Diary Patterns Help Identify Arthritis Type</h3>
      <p className="text-sm text-slate-500 mb-6">Different types respond to different treatments. Your tracking data reveals which type you may have.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((t) => (
          <div key={t.name} className={`rounded-xl border p-5 ${t.color}`}>
            <h4 className="font-bold text-slate-800 mb-2">{t.name}</h4>
            <dl className="space-y-1.5 text-sm">
              <div><dt className="inline font-medium text-slate-600">Pattern: </dt><dd className="inline text-slate-600">{t.pattern}</dd></div>
              <div><dt className="inline font-medium text-slate-600">Stiffness: </dt><dd className="inline text-slate-600">{t.stiffness}</dd></div>
              <div><dt className="inline font-medium text-slate-600">Cause: </dt><dd className="inline text-slate-600">{t.key}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Morning stiffness guide — what it reveals */
const MorningStiffnessGuide: React.FC = () => (
  <div className="my-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-amber-100">
    <div className="flex items-center gap-3 mb-4">
      <Sun className="w-6 h-6 text-amber-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-slate-800">Morning Stiffness: The Diagnostic Clue Your Diary Captures</h3>
    </div>
    <p className="text-sm text-slate-600 mb-4">Rheumatologists ask about morning stiffness in every visit. How long it lasts is a key diagnostic and treatment indicator.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white/70 rounded-xl p-4 border border-amber-100 text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">&lt; 30 min</div>
        <div className="text-xs text-slate-600">Suggests osteoarthritis</div>
        <div className="text-xs text-slate-400 mt-1">Mechanical wear, not inflammation</div>
      </div>
      <div className="bg-white/70 rounded-xl p-4 border border-amber-100 text-center">
        <div className="text-2xl font-bold text-amber-600 mb-1">30–60 min</div>
        <div className="text-xs text-slate-600">Borderline — track consistently</div>
        <div className="text-xs text-slate-400 mt-1">Your diary trend is the tiebreaker</div>
      </div>
      <div className="bg-white/70 rounded-xl p-4 border border-amber-100 text-center">
        <div className="text-2xl font-bold text-red-600 mb-1">&gt; 60 min</div>
        <div className="text-xs text-slate-600">Suggests inflammatory arthritis</div>
        <div className="text-xs text-slate-400 mt-1">RA, PsA, or ankylosing spondylitis</div>
      </div>
    </div>
  </div>
);

/** Joint tracking visual */
const JointTrackingGrid: React.FC = () => {
  const jointGroups = [
    { area: 'Hands & Wrists', joints: ['Fingers (MCP)', 'Fingers (PIP/DIP)', 'Thumbs', 'Wrists'], icon: Hand },
    { area: 'Upper Body', joints: ['Shoulders', 'Elbows', 'Neck (cervical)'], icon: Activity },
    { area: 'Lower Body', joints: ['Hips', 'Knees', 'Ankles', 'Feet/Toes'], icon: TrendingUp },
    { area: 'Spine', joints: ['Lower back', 'SI joints', 'Mid-back'], icon: Thermometer },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Joint-by-Joint Tracking</h3>
      <p className="text-sm text-slate-500 mb-6">The template tracks pain, swelling, and warmth per joint group. Symmetry patterns help distinguish RA from OA.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {jointGroups.map((g) => (
          <div key={g.area} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <g.icon className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <h4 className="font-semibold text-slate-800">{g.area}</h4>
            </div>
            <ul className="space-y-1.5">
              {g.joints.map((j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  {j}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/** PDF contents data */
const arthritisPdfPages: PdfPage[] = [
  { page: 1, title: 'Joint Profile & History', desc: 'Diagnosis, affected joints, current meds, rheumatologist info, and baseline stiffness' },
  { page: 2, title: 'Daily Joint Pain & Stiffness', desc: 'Morning stiffness duration, overall pain, joints affected, swelling, warmth markers' },
  { page: 3, title: 'Joint-by-Joint Detail', desc: 'Rate individual joints: hands, wrists, elbows, shoulders, hips, knees, ankles, feet' },
  { page: 4, title: 'Functional Impact Log', desc: 'Grip strength, stairs, dressing, jar-opening, walking, writing — real daily function' },
  { page: 5, title: 'Medication & Treatment', desc: 'DMARDs, biologics, NSAIDs, topicals — effectiveness, side effects, and labs due' },
  { page: 6, title: 'Weekly Summary & Rheum Prep', desc: 'One-page overview for rheumatology appointments with flare count and stiffness trends' },
];

/** Stats data */
const arthritisStats: StatItem[] = [
  { value: '54M+', label: 'Americans with arthritis', icon: Users },
  { value: '100+', label: 'Types of arthritis exist', icon: Activity },
  { value: '6', label: 'Page joint-specific template', icon: FileText },
  { value: '#1', label: 'Cause of work disability', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'arthritis-pain-tracker',
  title: 'Arthritis Pain Tracker (Free)',
  metaTitle: 'Arthritis Pain Tracker — Free 6-Page Joint Pain Diary | Pain Tracker Pro',
  metaDescription: 'Download a free arthritis pain tracker for RA, OA, PsA, and gout. Track morning stiffness, joint-by-joint pain, swelling, functional impact, and treatment response.',
  keywords: [
    'arthritis pain tracker', 'joint pain diary', 'rheumatoid arthritis tracker',
    'osteoarthritis pain log', 'RA pain diary', 'joint stiffness tracker',
    'arthritis flare log', 'morning stiffness diary', 'arthritis symptom journal',
    'psoriatic arthritis tracker', 'gout pain diary', 'joint swelling tracker',
    'arthritis disability documentation', 'rheumatology appointment preparation'
  ],
  badge: 'Free Download',
  headline: 'Arthritis Pain Tracker',
  subheadline: 'Track joint pain, morning stiffness, swelling, and function — by joint, by day, in the format rheumatologists actually use. For RA, OA, PsA, and gout.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/arthritis-pain-tracker.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/arthritis-pain-tracker.pdf', downloadFileName: 'arthritis-pain-tracker.pdf' },
  whatIsThis: 'An arthritis pain tracker designed for joint-specific conditions: rheumatoid arthritis, osteoarthritis, psoriatic arthritis, and gout. Unlike generic pain diaries, this template tracks morning stiffness duration (the key diagnostic indicator), individual joint pain and swelling, symmetry patterns (critical for distinguishing RA from OA), functional grip/mobility measures, and treatment response including DMARDs and biologics. It gives your rheumatologist the specific data they use to assess disease activity and adjust treatment.',
  whoShouldUse: [
    'Anyone diagnosed with or suspected of having rheumatoid arthritis, osteoarthritis, or psoriatic arthritis',
    'People tracking morning stiffness and joint symptoms for rheumatology appointments',
    'Patients on DMARDs or biologics who need to track treatment response',
    'Those documenting arthritis for disability or insurance claims',
    'People with gout tracking episode frequency, severity, and triggers',
    'Workers with job-related joint pain needing documentation',
    'Patients preparing for first rheumatology consultation',
    'Anyone tracking joint deterioration or improvement over time'
  ],
  howToUse: [
    { step: 1, title: 'Time your morning stiffness', description: 'Start when you wake up — how many minutes until your joints feel "loosened up"? This single metric is the most important arthritis indicator. Track it daily.' },
    { step: 2, title: 'Rate affected joints individually', description: 'Use the joint-by-joint grid to rate each area 0-10. Note swelling (S) and warmth (W). Symmetry patterns (both hands vs. one knee) help distinguish arthritis types.' },
    { step: 3, title: 'Track functional changes', description: 'Can you open a jar? Button a shirt? Climb stairs? These real-world measures matter more to treatment decisions than pain numbers alone.' },
    { step: 4, title: 'Log medication response', description: 'Track effectiveness of each medication over days and weeks. DMARDs and biologics take time — your diary shows whether they\'re working.' },
    { step: 5, title: 'Summarize for rheumatology', description: 'Use the weekly summary before appointments. Stiffness trends, flare count, worst joints, and function changes — all on one page.' }
  ],
  whyItMatters: 'Arthritis is the #1 cause of work disability and affects 54 million Americans, yet treatment depends heavily on accurate tracking. Rheumatologists assess disease activity using morning stiffness duration, joint counts, and functional measures — the exact data this diary captures. Research shows patients who track joint symptoms systematically have better-adjusted treatment plans, fewer disease flares, and earlier detection of worsening symptoms.',
  trustSignals: {
    medicalNote: 'Tracks morning stiffness, joint counts, and swelling — metrics used by rheumatologists to assess disease activity (DAS28 and similar scores).',
    privacyNote: 'Paper format — no apps, no accounts, no cloud. Your joint health data stays private.',
    legalNote: 'Comprehensive joint-specific documentation supports arthritis disability claims with measurable functional evidence.'
  },
  faqs: [
    { question: 'What arthritis symptoms should I track?', answer: 'Morning stiffness duration (minutes), pain per joint (0-10), swelling, warmth, redness, and functional impact (grip strength, walking, stairs). The stiffness duration is the single most diagnostic metric — time it every morning.' },
    { question: 'How do I know if it\'s RA vs OA?', answer: 'Your diary patterns will reveal it: RA typically shows symmetrical joint involvement, >60 min morning stiffness, and warmth/swelling. OA typically affects weight-bearing joints asymmetrically, with <30 min stiffness and pain that worsens through the day. Show your patterns to your rheumatologist.' },
    { question: 'Should I track individual joints or overall pain?', answer: 'Both. Overall pain gives the daily picture; individual joint tracking reveals which joints are worsening, responding to treatment, or newly involved. Rheumatologists use "joint counts" (tender + swollen) to measure disease activity.' },
    { question: 'How does morning stiffness relate to my diagnosis?', answer: '>60 min strongly suggests inflammatory arthritis (RA, PsA). <30 min suggests mechanical (OA). This is why the template has you time it — the duration, tracked consistently, is some of the most valuable data in your diary.' },
    { question: 'Is this useful for tracking treatment response?', answer: 'Essential for it. DMARDs and biologics take weeks to months to work. Your diary shows objective trends: stiffness decreasing, fewer joints affected, better function over time. This data drives treatment continuation or switching decisions.' },
    { question: 'Can I use this for gout?', answer: 'Yes. Track episode dates, affected joints (classically the big toe), severity, duration, and triggers (diet, alcohol, dehydration). Between episodes, note any baseline joint symptoms. Episode frequency determines whether prophylactic treatment is needed.' },
    { question: 'How do I track swelling and warmth?', answer: 'Mark each joint as S (swollen), W (warm), or SW (both). Compare both sides — a hot, swollen right knee with a normal left knee is very different from both being affected. Use the comparison consistently.' },
    { question: 'What functional tests should I note?', answer: 'Grip strength (can you squeeze?), buttoning/zipping clothes, opening jars, climbing stairs, walking distance, writing, and standing from a seated position. These map to standardized arthritis function scores.' },
    { question: 'Will this help with disability claims?', answer: 'Yes. Disability evaluators look for documented functional limitations, consistent tracking, treatment compliance, and measurable joint involvement. This template captures all four, structured in a way that demonstrates the persistent nature of your condition.' },
    { question: 'How is this different from a general pain diary?', answer: 'Joint-by-joint tracking, morning stiffness timing, swelling/warmth markers, symmetry documentation, functional grip and mobility measures, and DMARD/biologic medication tracking. A general diary captures none of these arthritis-specific metrics.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive general pain tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Daily Functioning Log', description: 'Track disability-relevant functional limitations', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'How to Track Pain for Doctors', description: 'Present data effectively to rheumatologists', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Documenting Pain for Disability', description: 'Arthritis documentation for claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Fibromyalgia Pain Diary', description: 'For concurrent fibro + arthritis', href: '/resources/fibromyalgia-pain-diary' },
    { title: 'Monthly Pain Tracker', description: 'See arthritis patterns over longer periods', href: '/resources/monthly-pain-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Arthritis Pain Tracker', url: '/resources/arthritis-pain-tracker' }
  ]
};

export const ArthritisPainTrackerPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={arthritisStats} colorScheme="amber" />
    <ArthritisTypeComparison />
    <MorningStiffnessGuide />
    <JointTrackingGrid />
    <PdfContentsPreview pages={arthritisPdfPages} accentColor="amber" />
    <BottomCTACallout
      icon={Droplets}
      heading="Hands Too Stiff to Write? Start Digital."
      body="Arthritis in the hands can make paper tracking painful. The digital version works with minimal tapping, tracks morning stiffness with a timer, and builds the trend charts your rheumatologist wants to see. Use whichever format your joints allow today."
      pdfUrl="/assets/arthritis-pain-tracker.pdf"
      gradientClasses="from-amber-600 to-orange-600"
      tintClass="text-amber-100"
      buttonTextClass="text-amber-700"
      buttonHoverClass="hover:bg-amber-50"
    />
  </SEOPageLayout>
);

export default ArthritisPainTrackerPage;

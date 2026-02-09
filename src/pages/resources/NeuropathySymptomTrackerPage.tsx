/**
 * Neuropathy Symptom Tracker – SEO Landing Page (Enhanced)
 *
 * Target keyword: "neuropathy symptom tracker"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, CheckCircle, TrendingUp, Users,
  FileText, Footprints, Brain, Zap, ShieldAlert,
  MonitorSmartphone, ArrowDownCircle
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Neuropathy type comparison */
const NeuropathyTypeComparison: React.FC = () => {
  const types = [
    { type: 'Diabetic', pattern: 'Length-dependent (feet → legs → hands)', onset: 'Gradual over months/years', key: 'A1C + glucose tracking critical', color: 'bg-amber-50 border-amber-200' },
    { type: 'Small Fiber', pattern: 'Burning pain in feet + autonomic symptoms', onset: 'Often sudden onset', key: 'Skin punch biopsy for diagnosis', color: 'bg-red-50 border-red-200' },
    { type: 'Inflammatory (GBS/CIDP)', pattern: 'Proximal + distal, ascending weakness', onset: 'Days to weeks (GBS) or months (CIDP)', key: 'Strength tracking essential', color: 'bg-purple-50 border-purple-200' },
    { type: 'Chemotherapy-Induced', pattern: 'Hands + feet simultaneously', onset: 'During/after treatment cycles', key: 'Cycle timing + dose tracking', color: 'bg-teal-50 border-teal-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Common Neuropathy Types: Different Tracking, Different Priorities</h3>
      <p className="text-sm text-slate-500 mb-6">Your neuropathy type determines what to track. This template covers all patterns — focus on what matches yours.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((t) => (
          <div key={t.type} className={`rounded-xl border p-5 ${t.color}`}>
            <h4 className="font-bold text-slate-800 mb-2">{t.type} Neuropathy</h4>
            <dl className="space-y-2 text-sm">
              <div><dt className="font-medium text-slate-600 inline">Pattern: </dt><dd className="text-slate-600 inline">{t.pattern}</dd></div>
              <div><dt className="font-medium text-slate-600 inline">Onset: </dt><dd className="text-slate-600 inline">{t.onset}</dd></div>
              <div className="pt-1 border-t border-slate-200"><dt className="font-medium text-slate-700 inline">Key tracking: </dt><dd className="text-slate-700 inline font-medium">{t.key}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Progression tracking */
const ProgressionTracker: React.FC = () => {
  const stages = [
    { stage: 'Early', area: 'Toes + ball of foot', symptoms: 'Tingling, pins-and-needles, occasional numbness', action: 'Start tracking NOW — early documentation is powerful', icon: Footprints, color: 'text-green-600' },
    { stage: 'Moderate', area: 'Feet + ankles', symptoms: 'Burning pain, numbness spreading, balance issues', action: 'Track falls, balance problems, shoe changes', icon: ArrowDownCircle, color: 'text-amber-600' },
    { stage: 'Advanced', area: 'Feet + lower legs + hands', symptoms: 'Weakness, muscle wasting, foot drop risk', action: 'Track strength, grip, walking distance daily', icon: Activity, color: 'text-orange-600' },
    { stage: 'Severe', area: 'Multiple limbs + autonomic', symptoms: 'Standing intolerance, GI issues, bladder changes', action: 'Track autonomic symptoms + functional capacity', icon: ShieldAlert, color: 'text-red-600' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-teal-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Neuropathy Progression: What Changes Over Time</h3>
      <p className="text-sm text-slate-500 mb-6">Peripheral neuropathy typically progresses from distal to proximal (toes → feet → legs → hands). Tracking progression is critical for treatment timing.</p>
      <div className="space-y-4">
        {stages.map((s, i) => (
          <div key={s.stage} className="flex gap-4 items-start">
            <div className="flex flex-col items-center">
              <s.icon className={`w-6 h-6 ${s.color}`} aria-hidden="true" />
              {i < stages.length - 1 && <div className="w-px h-full bg-slate-200 mt-2" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-800">{s.stage}</h4>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">{s.area}</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">{s.symptoms}</p>
              <p className="text-xs font-medium text-teal-700">→ {s.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Key symptom domains */
const SymptomDomains: React.FC = () => {
  const domains = [
    { letter: 'S', name: 'Sensory', items: ['Numbness', 'Tingling (paresthesia)', 'Burning pain', 'Pins-and-needles', 'Electric shocks'], color: 'bg-cyan-100 text-cyan-700' },
    { letter: 'M', name: 'Motor', items: ['Weakness', 'Muscle wasting', 'Foot drop', 'Grip strength loss', 'Cramping'], color: 'bg-blue-100 text-blue-700' },
    { letter: 'A', name: 'Autonomic', items: ['Sweating changes', 'Blood pressure swings', 'GI dysfunction', 'Bladder issues', 'Heart rate changes'], color: 'bg-purple-100 text-purple-700' },
    { letter: 'B', name: 'Balance & Gait', items: ['Unsteadiness', 'Falls', 'Cannot feel ground', 'Need assistive device', 'Dark = worse'], color: 'bg-amber-100 text-amber-700' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 4 Domains of Neuropathy: Track Them All</h3>
      <p className="text-sm text-slate-500 mb-6">Neuropathy affects sensory, motor, autonomic, and balance systems. Most trackers cover sensory only — missing 75% of the picture.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {domains.map((d) => (
          <div key={d.letter} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${d.color}`}>{d.letter}</span>
              <h4 className="font-semibold text-slate-800">{d.name}</h4>
            </div>
            <ul className="space-y-1.5">
              {d.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" aria-hidden="true" />
                  {item}
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
const neuropathyPdfPages: PdfPage[] = [
  { page: 1, title: 'Neuropathy Profile & Baseline', desc: 'Diagnosis, type, cause, affected areas, current medications, nerve study results, baseline function levels' },
  { page: 2, title: 'Daily Sensory Symptom Log', desc: 'Numbness, tingling, burning, pins-and-needles, electric shocks — by body area with 0-10 severity scales' },
  { page: 3, title: 'Motor & Strength Tracking', desc: 'Grip strength, foot drop, weakness, cramping, muscle wasting observations, functional tests' },
  { page: 4, title: 'Balance, Falls & Gait Log', desc: 'Daily balance assessment, near-falls, actual falls, walking distance, assistive device use, terrain difficulty' },
  { page: 5, title: 'Autonomic & Systemic Symptoms', desc: 'Blood pressure, heart rate, sweating, GI symptoms, bladder function, temperature regulation' },
  { page: 6, title: 'Progression Map & Specialist Summary', desc: 'Weekly body area mapping, symptom trajectory, treatment response chart for neurologist review' },
];

/** Stats data */
const neuropathyStats: StatItem[] = [
  { value: '20M+', label: 'Americans with peripheral neuropathy', icon: Users },
  { value: '50%', label: 'Of diabetics develop neuropathy', icon: TrendingUp },
  { value: '100+', label: 'Known causes of neuropathy', icon: Brain },
  { value: '6', label: 'Pages in the tracker template', icon: FileText },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'neuropathy-symptom-tracker',
  title: 'Neuropathy Symptom Tracker (Free)',
  metaTitle: 'Neuropathy Symptom Tracker — Free Peripheral Neuropathy Tracker PDF | Pain Tracker Pro',
  metaDescription: 'Download a free neuropathy symptom tracker covering sensory, motor, autonomic, and balance symptoms. Track progression, falls, and treatment response for neurologist visits.',
  keywords: [
    'neuropathy symptom tracker', 'peripheral neuropathy tracker', 'diabetic neuropathy log',
    'neuropathy progression tracker', 'nerve damage symptom diary', 'small fiber neuropathy tracker',
    'neuropathy balance log', 'chemotherapy neuropathy tracker', 'neuropathy pain diary',
    'neuropathy falls tracker', 'numbness tingling tracker', 'autonomic neuropathy diary',
    'neuropathy treatment tracker', 'neuropathy disability documentation'
  ],
  badge: 'Free Download',
  headline: 'Neuropathy Symptom Tracker',
  subheadline: 'Track all four domains of peripheral neuropathy — sensory, motor, autonomic, and balance — with progression mapping, fall logging, and treatment response tracking.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/neuropathy-symptom-tracker.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/neuropathy-symptom-tracker.pdf', downloadFileName: 'neuropathy-symptom-tracker.pdf' },
  whatIsThis: 'A peripheral neuropathy symptom tracker designed to capture what standard pain diaries miss. Neuropathy isn\'t just numbness and tingling — it\'s weakness, balance problems, falls, autonomic dysfunction, and progressive loss of function. This 6-page tracker covers all four domains of neuropathy (sensory, motor, autonomic, balance), tracks progression over time by body area, logs falls and near-falls, and provides summaries formatted for neurologists and primary care providers managing neuropathy. Whether your neuropathy is diabetic, chemotherapy-induced, inflammatory, or idiopathic — this tracker captures the full picture.',
  whoShouldUse: [
    'Anyone diagnosed with peripheral neuropathy (any type)',
    'People with diabetes tracking for early neuropathy signs',
    'Chemotherapy patients monitoring treatment-induced neuropathy',
    'People with numbness, tingling, or burning in hands/feet awaiting diagnosis',
    'Patients with balance problems or recurrent falls',
    'Those documenting neuropathy progression for disability claims',
    'Patients preparing for nerve conduction studies or neurologist appointments',
    'People with small fiber neuropathy tracking autonomic symptoms'
  ],
  howToUse: [
    { step: 1, title: 'Map your affected areas first', description: 'On the body area map, mark where numbness, tingling, burning, or weakness occurs. This becomes your baseline — you\'ll update it weekly to track whether symptoms are progressing or stable.' },
    { step: 2, title: 'Track sensory symptoms daily', description: 'Rate numbness, tingling, burning, pins-and-needles, and electric shocks by area and severity. Note what makes symptoms worse (standing, temperature, time of day). The pattern tells your neurologist the neuropathy type.' },
    { step: 3, title: 'Log every fall and near-fall', description: 'Balance problems are critical — falls cause injuries. Record when, where, what you were doing, whether you fell or caught yourself, and any injuries. This data often determines whether assistive devices or PT are prescribed.' },
    { step: 4, title: 'Track motor and autonomic symptoms separately', description: 'Weakness, grip loss, foot drop, sweating changes, blood pressure swings, GI issues — these indicate different nerve fiber involvement and guide treatment decisions.' },
    { step: 5, title: 'Review progression weekly', description: 'Compare this week\'s body area map to last week\'s. Is numbness spreading? Is weakness progressing? Stable neuropathy and progressive neuropathy require very different treatment approaches.' }
  ],
  whyItMatters: 'Peripheral neuropathy affects more than 20 million Americans, yet most patients track only "numbness and tingling" — missing motor, autonomic, and balance symptoms that determine treatment and prognosis. Neurologists need to see whether neuropathy is stable, improving, or progressing — and which nerve fiber types are affected. A comprehensive tracker that captures all four domains provides the data that changes clinical decisions: adjusting medications, adding physical therapy, prescribing assistive devices, or escalating workup for treatable causes.',
  trustSignals: {
    medicalNote: 'Covers all four neuropathy domains recognized in neurological assessment: sensory, motor, autonomic, and balance/gait evaluation.',
    privacyNote: 'Paper format — your neuropathy data stays completely private. No digital trail, no data mining.',
    legalNote: 'Systematic neuropathy documentation supports disability claims by demonstrating functional limitations that standard nerve tests alone cannot capture.'
  },
  faqs: [
    { question: 'How is this different from the Nerve Pain Symptom Log?', answer: 'The Nerve Pain Symptom Log is broader — covering all neuropathic pain conditions (trigeminal neuralgia, radiculopathy, post-surgical nerve pain). This Neuropathy Symptom Tracker is specifically for peripheral neuropathy, with progression mapping, balance/fall tracking, and autonomic symptom monitoring that peripheral neuropathy requires.' },
    { question: 'What\'s the most important thing to track?', answer: 'Progression. Neuropathy that\'s slowly worsening needs different treatment than stable neuropathy. Track which areas are affected each week and whether symptoms are spreading, stable, or improving. This trajectory information is the most valuable data for your neurologist.' },
    { question: 'Should I track falls?', answer: 'Yes — every fall AND every near-fall. Neuropathy-related balance problems are a leading cause of injury in older adults. Fall frequency, timing, and circumstances help determine whether physical therapy, assistive devices, or home modifications are needed. This data is also critical for disability documentation.' },
    { question: 'I have diabetic neuropathy. What should I focus on?', answer: 'Track foot symptoms plus your glucose/A1C levels alongside neuropathy symptoms. Diabetic neuropathy progression correlates with glucose control. Also track foot inspections — numbness means you may not feel injuries. The template includes a diabetic neuropathy section.' },
    { question: 'My EMG/NCS was "normal" but I have symptoms. Why track?', answer: 'Small fiber neuropathy doesn\'t show on EMG/NCS (nerve conduction studies). These tests only detect large fiber damage. A systematic symptom diary helps demonstrate the pattern of small fiber neuropathy (burning pain, autonomic symptoms) that guides your neurologist toward skin punch biopsy or other small fiber testing.' },
    { question: 'Can I use this for chemotherapy-induced neuropathy?', answer: 'Absolutely. CIPN (chemotherapy-induced peripheral neuropathy) needs specific tracking: onset timing relative to treatment cycles, dose-dependent progression, and whether symptoms persist after treatment ends. The template includes treatment-cycle correlation sections.' },
    { question: 'What autonomic symptoms should I track?', answer: 'Blood pressure changes when standing (orthostatic hypotension), abnormal sweating, GI symptoms (gastroparesis, constipation), bladder dysfunction, and heart rate changes. These indicate small fiber and autonomic nerve involvement, which affects treatment choices.' },
    { question: 'How often should I update the body area map?', answer: 'Weekly. Mark where you feel numbness, tingling, burning, and weakness each week. Comparing maps over weeks and months reveals progression patterns that guide your neurologist\'s treatment decisions and prognosis assessment.' },
    { question: 'Is this useful for disability applications?', answer: 'Very. Neuropathy disability claims often fail because standard tests don\'t fully capture functional limitations. Your diary documenting falls, balance issues, inability to feel controls or surfaces, grip loss, and standing intolerance provides the functional evidence that nerve tests alone cannot.' },
    { question: 'My neuropathy cause is unknown (idiopathic). Should I still track?', answer: 'Especially so. Detailed tracking may reveal patterns that suggest a treatable cause (vitamin deficiency, autoimmune, medication side effect). And regardless of cause, tracking progression and treatment response guides management. About 30% of neuropathy is idiopathic — your diary helps ensure nothing treatable is being missed.' }
  ],
  relatedLinks: [
    { title: 'Nerve Pain Symptom Log', description: 'Broader neuropathic pain tracking', href: '/resources/nerve-pain-symptom-log' },
    { title: 'CRPS Pain Diary Template', description: 'Complex regional pain syndrome', href: '/resources/crps-pain-diary-template' },
    { title: 'Documenting Pain for Disability', description: 'Neuropathy disability documentation', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Daily Functioning Log', description: 'Track functional limitations', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'Pain Diary for Specialist', description: 'Prepare for neurologist visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Fibromyalgia Pain Diary', description: 'May overlap — fibromyalgia + neuropathy', href: '/resources/fibromyalgia-pain-diary' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Neuropathy Symptom Tracker', url: '/resources/neuropathy-symptom-tracker' }
  ]
};

export const NeuropathySymptomTrackerPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={neuropathyStats} colorScheme="teal" />
    <NeuropathyTypeComparison />
    <SymptomDomains />
    <ProgressionTracker />
    <PdfContentsPreview pages={neuropathyPdfPages} accentColor="teal" />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Numb Fingers Making Writing Difficult? The Digital Version Doesn't Require Fine Motor Control."
      body="Neuropathy affects grip and fine motor skills. The paper template is ideal when hands cooperate. The digital version works with larger touch targets and doesn't require a pen grip. Switch between formats \u2014 your tracking is what matters."
      pdfUrl="/assets/neuropathy-symptom-tracker.pdf"
      gradientClasses="from-teal-600 to-cyan-600"
      tintClass="text-teal-100"
      buttonTextClass="text-teal-700"
      buttonHoverClass="hover:bg-teal-50"
    />
  </SEOPageLayout>
);

export default NeuropathySymptomTrackerPage;

/**
 * Nerve Pain Symptom Log – SEO Landing Page (Enhanced)
 *
 * Target keyword: "nerve pain symptom log"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, AlertTriangle, Zap, CheckCircle,
  TrendingUp, Users, FileText, Clock, Flame,
  CircleDot, Waves, MonitorSmartphone
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Nerve pain quality descriptors */
const NervePainQualities: React.FC = () => {
  const qualities = [
    { code: 'B', label: 'Burning', desc: 'Constant hot, searing sensation along nerve paths', icon: Flame, color: 'border-red-200 bg-red-50 text-red-700' },
    { code: 'T', label: 'Tingling', desc: '"Pins and needles" — paresthesia in hands, feet, or limbs', icon: Zap, color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { code: 'N', label: 'Numbness', desc: 'Reduced or absent sensation, often distal (starts in fingers/toes)', icon: CircleDot, color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { code: 'S', label: 'Shooting / Electric', desc: 'Sudden jolts or shocks along a nerve — lancinating pain', icon: Waves, color: 'border-purple-200 bg-purple-50 text-purple-700' },
    { code: 'A', label: 'Allodynia', desc: 'Pain from normally painless touch — clothing, bedsheets, light pressure', icon: AlertTriangle, color: 'border-pink-200 bg-pink-50 text-pink-700' },
    { code: 'W', label: 'Weakness', desc: 'Motor nerve involvement — difficulty gripping, foot drop, stumbling', icon: Activity, color: 'border-teal-200 bg-teal-50 text-teal-700' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Nerve Pain Types: Use These Codes in Your Diary</h3>
      <p className="text-sm text-slate-500 mb-6">Nerve pain has distinct qualities. "It hurts" isn't enough — neurologists need to know what kind. Use these codes for quick daily tracking.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualities.map((q) => (
          <div key={q.code} className={`rounded-xl border p-5 ${q.color}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-black">{q.code}</span>
              <q.icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{q.label}</h4>
            <p className="text-sm text-slate-600">{q.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Progression pattern — distal to proximal */
const ProgressionPattern: React.FC = () => (
  <div className="my-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-indigo-100">
    <h3 className="text-xl font-bold text-slate-800 mb-2">Why Tracking Progression Matters</h3>
    <p className="text-sm text-slate-600 mb-6">Neuropathy typically progresses in a "stocking-glove" pattern — starting in toes/fingers and creeping upward. Your diary captures this progression, which is critical for treatment urgency.</p>
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {[
        { stage: 'Early', area: 'Toes & fingertips', desc: 'Intermittent tingling/numbness', severity: 'Mild' },
        { stage: 'Progressing', area: 'Feet & hands', desc: 'Persistent symptoms, burning begins', severity: 'Moderate' },
        { stage: 'Advanced', area: 'Lower legs & forearms', desc: 'Weakness, balance issues, constant pain', severity: 'Severe' },
        { stage: 'Late', area: 'Above knees/elbows', desc: 'Motor involvement, fall risk, autonomic', severity: 'Critical' },
      ].map((s, i) => (
        <React.Fragment key={s.stage}>
          {i > 0 && <ArrowRight className="w-5 h-5 text-indigo-300 hidden sm:block flex-shrink-0" aria-hidden="true" />}
          <div className="flex-1 bg-white/70 rounded-xl p-4 border border-indigo-100 text-center w-full">
            <div className="text-xs font-bold text-indigo-600 mb-1">{s.stage}</div>
            <div className="font-semibold text-slate-800 text-sm">{s.area}</div>
            <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
            <div className={`text-xs font-medium mt-2 ${s.severity === 'Critical' ? 'text-red-600' : s.severity === 'Severe' ? 'text-amber-600' : s.severity === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{s.severity}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

/** Common causes */
const NeuropathyCauses: React.FC = () => {
  const causes = [
    { category: 'Metabolic', examples: ['Diabetes (most common)', 'B12/folate deficiency', 'Thyroid disorders', 'Kidney disease'] },
    { category: 'Inflammatory', examples: ['Guillain-Barré syndrome', 'CIDP', 'Vasculitis', 'Lupus/autoimmune'] },
    { category: 'Structural', examples: ['Carpal tunnel', 'Herniated disc', 'Spinal stenosis', 'Nerve entrapment'] },
    { category: 'Toxic/Medication', examples: ['Chemotherapy-induced', 'Alcohol-related', 'Statin medications', 'Heavy metal exposure'] },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Nerve Pain Causes: Your Diary Helps Narrow the Diagnosis</h3>
      <p className="text-sm text-slate-500 mb-6">Nerve pain has 100+ causes. The pattern, location, and progression in your diary help neurologists identify yours.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {causes.map((c) => (
          <div key={c.category} className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="font-semibold text-indigo-700 mb-3">{c.category}</h4>
            <ul className="space-y-1.5">
              {c.examples.map((e) => (
                <li key={e} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" aria-hidden="true" />
                  {e}
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
const nervePdfPages: PdfPage[] = [
  { page: 1, title: 'Nerve Pain Profile', desc: 'Diagnosis, cause (if known), affected nerves/areas, current meds, neurologist info' },
  { page: 2, title: 'Daily Symptom Log', desc: 'Pain type codes (B/T/N/S/A/W), location, severity, duration, and triggers' },
  { page: 3, title: 'Sensation Change Map', desc: 'Track numbness, tingling, and weakness by body area — monitor progression over time' },
  { page: 4, title: 'Medication & Treatment', desc: 'Gabapentin, pregabalin, duloxetine, topicals — effectiveness, timing, side effects' },
  { page: 5, title: 'Functional & Safety Impact', desc: 'Balance, fall risk, driving ability, fine motor tasks, and sleep disruption tracking' },
  { page: 6, title: 'Weekly Summary & Neuro Prep', desc: 'One-page overview for neurologist visits with progression notes and medication review' },
];

/** Stats data */
const nerveStats: StatItem[] = [
  { value: '20M+', label: 'Americans with neuropathy', icon: Users },
  { value: '100+', label: 'Known causes of nerve pain', icon: Activity },
  { value: '6', label: 'Pain quality codes tracked', icon: Zap },
  { value: '50%', label: 'Of diabetics develop neuropathy', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'nerve-pain-symptom-log',
  title: 'Nerve Pain Symptom Log (Free)',
  metaTitle: 'Nerve Pain Symptom Log — Free 6-Page Neuropathy Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free nerve pain symptom log for neuropathy, sciatica, and neurological pain. Track burning, tingling, numbness, shooting pain, progression, and treatment response.',
  keywords: [
    'nerve pain symptom log', 'neuropathy tracker', 'nerve pain diary',
    'tingling numbness tracker', 'burning pain log', 'sciatica symptom diary',
    'peripheral neuropathy journal', 'nerve pain medication tracker',
    'neurological pain log', 'diabetic neuropathy diary', 'nerve damage tracker',
    'shooting pain log', 'allodynia diary', 'neurology appointment preparation'
  ],
  badge: 'Free Download',
  headline: 'Nerve Pain Symptom Log',
  subheadline: 'Track burning, tingling, numbness, and shooting pain with specific quality codes. Monitor progression patterns, medication response, and functional impact for your neurologist.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/nerve-pain-symptom-log.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/nerve-pain-symptom-log.pdf', downloadFileName: 'nerve-pain-symptom-log.pdf' },
  whatIsThis: 'A nerve pain symptom log designed for neuropathic conditions: peripheral neuropathy, sciatica, carpal tunnel, CIDP, diabetic neuropathy, and post-surgical nerve pain. It captures what generic pain diaries miss — the specific quality of nerve pain (burning vs. tingling vs. shooting), precise location, progression pattern (which areas are newly involved), and functional impact including balance, grip, and fall risk. Your neurologist gets the data they need to identify the cause, assess progression, and adjust medication.',
  whoShouldUse: [
    'Anyone with peripheral neuropathy (diabetic, idiopathic, autoimmune, or chemotherapy-induced)',
    'People experiencing unexplained tingling, numbness, or burning sensations',
    'Sciatica or radiculopathy patients tracking nerve-specific symptoms',
    'Patients on gabapentin, pregabalin, or duloxetine tracking medication effectiveness',
    'Those documenting nerve damage for disability or injury claims',
    'Patients with carpal tunnel, ulnar neuropathy, or other nerve entrapments',
    'People monitoring chemotherapy-induced peripheral neuropathy (CIPN)',
    'Anyone preparing for neurological testing (EMG/NCS) or neurology consultations'
  ],
  howToUse: [
    { step: 1, title: 'Use pain quality codes', description: 'Mark each entry with B (burning), T (tingling), N (numbness), S (shooting), A (allodynia), or W (weakness). Multiple codes per entry are normal — nerve pain is rarely just one thing.' },
    { step: 2, title: 'Track location precisely', description: 'Note exactly where: "left foot, toes 1-3" not "feet." Nerve pain follows specific anatomical paths — precise location helps identify which nerve is involved.' },
    { step: 3, title: 'Monitor progression', description: 'Mark which body areas are affected each week. Is numbness spreading upward? Are new areas involved? Progression rate determines treatment urgency.' },
    { step: 4, title: 'Log medication timing and response', description: 'Nerve pain meds work differently than regular painkillers. Track time of dose, onset of relief, duration, and side effects. This guides dosing adjustments.' },
    { step: 5, title: 'Note functional and safety impact', description: 'Can you feel the gas pedal? Do you stumble? Can you button a shirt? These safety-relevant details drive treatment decisions and work/driving restrictions.' }
  ],
  whyItMatters: 'Nerve pain has 100+ causes, and treatment depends entirely on the underlying condition. Your neurologist uses the pattern (which areas, what quality, how fast it\'s spreading) to narrow the diagnosis from hundreds of possibilities. Research shows that patients who track neuropathic symptoms with specific quality descriptors have more accurate diagnoses and faster treatment optimization. The progression pattern alone — tracked consistently — can distinguish a treatable vitamin deficiency from a progressive neurological disease.',
  trustSignals: {
    medicalNote: 'Uses LANSS (Leeds Assessment of Neuropathic Symptoms and Signs) pain quality descriptors recognized by neurologists worldwide.',
    privacyNote: 'Paper format — your neurological data stays completely private.',
    legalNote: 'Detailed nerve symptom documentation supports neuropathy disability claims with progression evidence.'
  },
  faqs: [
    { question: 'What makes nerve pain different from other pain?', answer: 'Nerve pain (neuropathic pain) has distinctive qualities: burning, tingling, electric shocks, numbness, and pain from normally painless touch (allodynia). It responds to different medications than inflammatory pain — which is why describing the quality, not just intensity, is critical.' },
    { question: 'How do I track pain that comes and goes randomly?', answer: 'Note the time, duration, and quality of each episode. Patterns emerge: Is it worse at night? After activity? In certain positions? What seems random often has triggers. The template includes timing columns specifically for this.' },
    { question: 'What if I have numbness, not pain?', answer: 'Track it the same way — numbness IS a nerve symptom and often more concerning than pain because it indicates nerve damage rather than irritation. Map which areas are numb, whether it\'s spreading, and whether it affects function (grip, walking, balance).' },
    { question: 'Is this useful for sciatica?', answer: 'Yes. Sciatica is nerve pain. Track the shooting/burning pattern down the leg, which positions trigger it, and whether you have numbness or weakness in the foot/toes. Your diary pattern (position-dependent vs. constant) guides treatment (PT vs. injection vs. surgery).' },
    { question: 'How do I know if my neuropathy is progressing?', answer: 'Use the progression tracking page weekly. Mark which areas are affected. If numbness started in toes and now reaches ankles, or if hands are newly involved — that\'s progression and your neurologist needs to know immediately.' },
    { question: 'Should I track medications differently for nerve pain?', answer: 'Yes. Gabapentin/pregabalin take weeks to reach therapeutic levels and must be titrated slowly. Track the dose, time, relief onset (it may be gradual over weeks), and side effects (dizziness, drowsiness). This guides your doctor\'s dosing decisions.' },
    { question: 'What should I bring to a neurology appointment?', answer: 'Your symptom log showing: pain types and locations, progression pattern, medication response, and functional impact. If possible, track at least 2 weeks before your visit. The weekly summary page is designed for exactly this — one page the neurologist can review in 30 seconds.' },
    { question: 'Is this useful for chemotherapy-induced neuropathy?', answer: 'Essential. CIPN can be dose-limiting for chemotherapy. Track numbness/tingling in hands and feet, grip changes, and balance issues. Oncologists use this data to decide whether to reduce chemo doses or switch agents. Your diary could influence treatment decisions.' },
    { question: 'What about balance and fall risk?', answer: 'Track these explicitly. Peripheral neuropathy in the feet causes balance issues and falls — a major safety concern. Note any stumbling, difficulty on uneven surfaces, feeling unsteady, or actual falls. This may affect work and driving clearance.' },
    { question: 'How does this differ from the neuropathy symptom tracker?', answer: 'This template covers all nerve pain conditions broadly (sciatica, entrapments, plexopathy), while the neuropathy tracker focuses specifically on peripheral neuropathy progression tracking. Use whichever matches your diagnosis, or both if you\'re pre-diagnosis.' }
  ],
  relatedLinks: [
    { title: 'Neuropathy Symptom Tracker', description: 'Specialized peripheral neuropathy progression', href: '/resources/neuropathy-symptom-tracker' },
    { title: 'Chronic Back Pain Diary', description: 'For sciatica and radicular back pain', href: '/resources/chronic-back-pain-diary' },
    { title: 'CRPS Pain Diary', description: 'For Complex Regional Pain Syndrome nerve pain', href: '/resources/crps-pain-diary-template' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive general pain tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Documenting Pain for Disability', description: 'Nerve damage documentation for claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'How to Track Pain for Doctors', description: 'Present nerve pain data to neurologists', href: '/resources/how-to-track-pain-for-doctors' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Nerve Pain Symptom Log', url: '/resources/nerve-pain-symptom-log' }
  ]
};

export const NervePainSymptomLogPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={nerveStats} colorScheme="indigo" />
    <NervePainQualities />
    <ProgressionPattern />
    <NeuropathyCauses />
    <PdfContentsPreview pages={nervePdfPages} accentColor="indigo" />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Numbness Makes Handwriting Difficult?"
      body="If nerve damage in your hands makes writing uncomfortable, the digital version offers larger touch targets, simple tap-to-rate input, and automated progression tracking. Use paper when you can, digital when you need to."
      pdfUrl="/assets/nerve-pain-symptom-log.pdf"
      gradientClasses="from-indigo-600 to-purple-600"
      tintClass="text-indigo-100"
      buttonTextClass="text-indigo-700"
      buttonHoverClass="hover:bg-indigo-50"
    />
  </SEOPageLayout>
);

export default NervePainSymptomLogPage;

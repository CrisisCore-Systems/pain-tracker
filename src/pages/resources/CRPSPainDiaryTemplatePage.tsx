/**
 * CRPS Pain Diary Template – SEO Landing Page (Enhanced)
 *
 * Target keyword: "crps pain diary template"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, AlertTriangle, CheckCircle,
  TrendingUp, Users, FileText, Flame, Thermometer,
  Eye, Zap, Hand, MonitorSmartphone
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Budapest Criteria visualization */
const BudapestCriteria: React.FC = () => {
  const categories = [
    { num: 1, label: 'Sensory', symptoms: ['Allodynia (pain from light touch)', 'Hyperalgesia (increased pain response)'], color: 'border-red-200 bg-red-50' },
    { num: 2, label: 'Vasomotor', symptoms: ['Temperature asymmetry', 'Skin color changes (red, blue, mottled)'], color: 'border-blue-200 bg-blue-50' },
    { num: 3, label: 'Sudomotor / Edema', symptoms: ['Swelling', 'Sweating changes (more or less than normal)'], color: 'border-amber-200 bg-amber-50' },
    { num: 4, label: 'Motor / Trophic', symptoms: ['Decreased range of motion', 'Weakness, tremor, dystonia', 'Hair/nail/skin changes'], color: 'border-purple-200 bg-purple-50' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-red-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Budapest Criteria: What Your Diary Must Capture</h3>
      <p className="text-sm text-slate-500 mb-6">CRPS diagnosis requires symptoms in 3+ of these 4 categories and signs in 2+. Your diary documents exactly this.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((c) => (
          <div key={c.num} className={`rounded-xl border p-5 ${c.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-700">{c.num}</span>
              <h4 className="font-semibold text-slate-800">{c.label}</h4>
            </div>
            <ul className="space-y-1.5">
              {c.symptoms.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/** CRPS symptom tracking guide */
const CRPSSymptomMap: React.FC = () => {
  const symptoms = [
    { icon: Flame, label: 'Burning Pain', desc: 'Constant burning, often described as "on fire" — disproportionate to inciting injury', color: 'text-red-600 bg-red-50 border-red-200' },
    { icon: Zap, label: 'Allodynia', desc: 'Pain from light touch, clothing, bedsheets, air movement across skin', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { icon: Thermometer, label: 'Temperature Changes', desc: 'Affected limb noticeably warmer or cooler than the other side', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: Eye, label: 'Color Changes', desc: 'Skin turns red, blue, purple, or mottled — may change throughout the day', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { icon: Activity, label: 'Swelling & Sweating', desc: 'Edema in affected limb, abnormal sweating (increased or decreased)', color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { icon: Hand, label: 'Motor Changes', desc: 'Weakness, tremor, decreased range of motion, dystonia — hand/foot curling', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">CRPS Symptoms to Track Daily</h3>
      <p className="text-sm text-slate-500 mb-6">CRPS is complex — the name says it. Track all symptom categories daily to document the full picture.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symptoms.map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            <s.icon className="w-6 h-6 mb-3" aria-hidden="true" />
            <h4 className="font-semibold text-slate-800 mb-1">{s.label}</h4>
            <p className="text-sm text-slate-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Side comparison guide */
const LimbComparisonGuide: React.FC = () => (
  <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
    <h3 className="text-xl font-bold text-slate-800 mb-2">Side-by-Side Comparison: The CRPS Diagnostic Key</h3>
    <p className="text-sm text-slate-500 mb-6">CRPS is diagnosed partly by comparing the affected limb with the unaffected side. The template includes daily comparison tracking.</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <h4 className="text-sm font-bold text-red-700 mb-3">Affected Side</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Color: ___ (red/blue/mottled/pale)</li>
          <li>• Temperature: ___ (warm/cool/hot)</li>
          <li>• Swelling: ___ (none/mild/moderate/severe)</li>
          <li>• Hair/nail changes: ___</li>
          <li>• Range of motion: ___ %</li>
        </ul>
      </div>
      <div className="rounded-xl bg-green-50 border border-green-200 p-4">
        <h4 className="text-sm font-bold text-green-700 mb-3">Unaffected Side</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Color: normal</li>
          <li>• Temperature: normal</li>
          <li>• Swelling: none</li>
          <li>• Hair/nail: normal</li>
          <li>• Range of motion: ___% (baseline)</li>
        </ul>
      </div>
    </div>
    <p className="text-xs text-slate-400 mt-4">Tip: Take photos of both sides for visual documentation. The template reminds you to photograph changes.</p>
  </div>
);

/** PDF contents data */
const crpsPdfPages: PdfPage[] = [
  { page: 1, title: 'CRPS Profile & History', desc: 'Inciting event, diagnosis date, affected limb(s), Budapest criteria checklist, providers' },
  { page: 2, title: 'Daily CRPS Symptom Log', desc: 'Pain, burning, allodynia, swelling, color changes, temperature, sweating — all tracked daily' },
  { page: 3, title: 'Motor & Functional Changes', desc: 'Weakness, tremor, stiffness, range of motion, dystonia, grip, walking ability' },
  { page: 4, title: 'Affected Limb Comparison', desc: 'Side-by-side daily comparison: color, temperature, swelling, skin/hair/nail changes, ROM' },
  { page: 5, title: 'Treatment & Desensitization', desc: 'Medications, nerve blocks, mirror therapy, PT, desensitization exercises — response tracking' },
  { page: 6, title: 'Weekly Summary & Specialist Prep', desc: 'One-page overview for pain specialist or neurologist with Budapest criteria mapping' },
];

/** Stats data */
const crpsStats: StatItem[] = [
  { value: '200K', label: 'Americans with CRPS', icon: Users },
  { value: '4', label: 'Budapest criteria categories', icon: Activity },
  { value: '46/50', label: 'McGill Pain Scale (highest)', icon: TrendingUp },
  { value: '6', label: 'Pages of CRPS-specific tracking', icon: FileText },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'crps-pain-diary-template',
  title: 'CRPS Pain Diary Template (Free)',
  metaTitle: 'CRPS Pain Diary Template — Free Complex Regional Pain Syndrome Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free CRPS pain diary tracking burning pain, allodynia, color/temperature changes, swelling, motor symptoms, and limb comparison. Aligned with Budapest diagnostic criteria.',
  keywords: [
    'crps pain diary', 'complex regional pain syndrome tracker', 'CRPS symptom log',
    'RSD pain diary', 'crps burning pain tracker', 'Budapest criteria diary',
    'crps allodynia tracker', 'complex regional pain diary template',
    'crps color changes log', 'crps temperature tracking', 'crps motor symptoms',
    'crps disability documentation', 'reflex sympathetic dystrophy diary',
    'crps limb comparison tracker'
  ],
  badge: 'Free Download',
  headline: 'CRPS Pain Diary Template',
  subheadline: 'Track complex regional pain syndrome across all Budapest criteria: burning pain, allodynia, color and temperature changes, swelling, and motor symptoms — with daily limb comparison.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/crps-pain-diary.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/crps-pain-diary.pdf', downloadFileName: 'crps-pain-diary.pdf' },
  whatIsThis: 'A CRPS pain diary template built for the most complex pain condition in medicine. CRPS (formerly RSD) involves burning pain, sensory changes, autonomic dysfunction, and motor impairment — all of which fluctuate throughout the day. This 6-page template tracks all four Budapest diagnostic criteria categories, includes daily affected-vs-unaffected limb comparison, and formats data for pain specialists and neurologists who treat CRPS. Standard pain diaries capture maybe 20% of what matters for CRPS. This captures all of it.',
  whoShouldUse: [
    'Anyone diagnosed with CRPS Type I (formerly RSD) or Type II (causalgia)',
    'People with unexplained burning pain, color changes, or swelling in a limb after injury',
    'Patients undergoing CRPS treatment (nerve blocks, ketamine, mirror therapy, PT)',
    'Those documenting CRPS for disability, insurance, or workers\' compensation claims',
    'Patients preparing for pain specialist, neurologist, or IME appointments',
    'People tracking whether CRPS is spreading to other limbs',
    'Clinical trial participants needing detailed symptom documentation',
    'Anyone whose CRPS has been dismissed or questioned — the diary is proof'
  ],
  howToUse: [
    { step: 1, title: 'Track all four Budapest categories daily', description: 'Sensory (burning, allodynia), vasomotor (color, temperature), sudomotor/edema (swelling, sweating), motor/trophic (weakness, tremor, nail/hair changes). Missing any category weakens documentation.' },
    { step: 2, title: 'Compare affected vs. unaffected side', description: 'Daily limb comparison is the cornerstone of CRPS evidence. Note color, temperature, swelling, and range of motion for both sides. The asymmetry IS the diagnosis.' },
    { step: 3, title: 'Rate and describe pain quality', description: 'CRPS pain is distinctive: burning, searing, "on fire" sensation plus allodynia (pain from light touch). Note what touches trigger pain — this guides desensitization therapy.' },
    { step: 4, title: 'Log treatments and response', description: 'Record nerve blocks, medications, mirror therapy, PT sessions, desensitization exercises. Note pain before and after each treatment. This guides your specialist\'s treatment ladder.' },
    { step: 5, title: 'Take photos alongside diary entries', description: 'CRPS causes visible changes. Photograph color differences, swelling, and skin changes alongside your diary entries. Visual + written evidence is the gold standard.' }
  ],
  whyItMatters: 'CRPS scores 46 out of 50 on the McGill Pain Scale — higher than childbirth or amputation. Yet it remains one of the most misunderstood and underdiagnosed conditions. Many patients wait years for diagnosis, and claims are frequently challenged. A detailed diary that maps directly to Budapest diagnostic criteria provides the systematic evidence that specialists need to confirm diagnosis, justify treatment, and support disability claims. Your diary is not just tracking — it\'s building your medical and legal case.',
  trustSignals: {
    medicalNote: 'Directly maps to the Budapest Diagnostic Criteria for CRPS, used by pain specialists worldwide for diagnosis and treatment assessment.',
    privacyNote: 'Paper format — your CRPS data stays completely private. No digital trail, no data mining.',
    legalNote: 'Budapest-criteria-aligned documentation with limb comparison provides the strongest evidence for CRPS disability and injury claims.'
  },
  faqs: [
    { question: 'What makes CRPS tracking different from other pain conditions?', answer: 'CRPS involves four distinct symptom categories (sensory, vasomotor, sudomotor/edema, motor/trophic) that must be tracked simultaneously. Plus, you need affected-vs-unaffected limb comparison — which no standard pain diary includes. The complexity of CRPS demands a CRPS-specific tool.' },
    { question: 'What are the Budapest criteria?', answer: 'The Budapest Criteria are the international diagnostic standard for CRPS. They require: continuing pain disproportionate to inciting event, symptoms in 3+ of 4 categories, signs in 2+ categories, and no other diagnosis that better explains the findings. This diary tracks all four categories daily.' },
    { question: 'How important is the limb comparison?', answer: 'Critical. CRPS is fundamentally about asymmetry — the affected limb differs visually and functionally from the unaffected side. Color, temperature, swelling, and range of motion differences are diagnostic. Track both sides daily.' },
    { question: 'Should I photograph my symptoms?', answer: 'Absolutely. CRPS causes visible changes (color, swelling, skin texture) that photographs capture better than words. Take consistent photos alongside diary entries — same lighting, same angle. This visual evidence is powerful for specialists and evaluators.' },
    { question: 'What if my CRPS is spreading?', answer: 'Track any new symptoms in previously unaffected areas immediately. CRPS can spread to other limbs — this progression is critical information for your specialist. Note the date, location, and symptoms of any spread. The diary can expand to track multiple limbs.' },
    { question: 'Is this useful for disability claims?', answer: 'Essential. CRPS disability claims are frequently challenged because the condition is "invisible" on standard tests (X-rays, MRIs). Your diary provides the daily, systematic documentation that bridges the gap between your experience and what evaluators can see. Budapest-criteria-aligned documentation is the strongest evidence available.' },
    { question: 'How do I track allodynia?', answer: 'Note what triggers pain from normally painless stimuli: clothing fabric, bedsheets, water temperature, wind, light touch. Rate severity and note which areas are affected. This guides desensitization therapy and medication choices (gabapentin, pregabalin often help allodynia).' },
    { question: 'What about mirror therapy and desensitization?', answer: 'Track these specifically: duration, which exercises, pain before and after, and any improvement over sessions. Mirror therapy is one of the most evidence-based CRPS treatments — your diary shows whether it\'s working over weeks.' },
    { question: 'My specialist wants to see "objective" evidence. Does a diary count?', answer: 'Yes. The Budapest criteria explicitly include patient-reported symptoms alongside clinical signs. Your daily diary with limb comparisons IS objective evidence — it\'s systematic, consistent, and verifiable against clinical findings. Many pain specialists consider a detailed CRPS diary essential for management.' },
    { question: 'How long should I track before a specialist appointment?', answer: 'Minimum 2 weeks, ideally 4+. CRPS symptoms fluctuate significantly — a single appointment snapshot misses the full picture. Your diary showing the range of symptoms over weeks provides the context your specialist needs to assess disease activity and treatment response.' }
  ],
  relatedLinks: [
    { title: 'Nerve Pain Symptom Log', description: 'For neuropathic pain conditions', href: '/resources/nerve-pain-symptom-log' },
    { title: 'Neuropathy Symptom Tracker', description: 'Peripheral neuropathy progression', href: '/resources/neuropathy-symptom-tracker' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive general pain tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Documenting Pain for Disability', description: 'CRPS documentation for claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Diary for Specialist', description: 'Prepare for pain specialist visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Daily Functioning Log', description: 'Track CRPS functional impact', href: '/resources/daily-functioning-log-for-disability' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'CRPS Pain Diary Template', url: '/resources/crps-pain-diary-template' }
  ]
};

export const CRPSPainDiaryTemplatePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={crpsStats} colorScheme="red" />
    <CRPSSymptomMap />
    <BudapestCriteria />
    <LimbComparisonGuide />
    <PdfContentsPreview pages={crpsPdfPages} accentColor="red" />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Allodynia Making Touch Painful? Use Whichever Format Works Today."
      body="CRPS flares can make holding a pen excruciating. Start with paper on good days. On bad days, the digital version works with minimal touch \u2014 larger buttons, simpler input. Your data matters more than the format."
      pdfUrl="/assets/crps-pain-diary.pdf"
      gradientClasses="from-red-600 to-rose-600"
      tintClass="text-red-100"
      buttonTextClass="text-red-700"
      buttonHoverClass="hover:bg-red-50"
    />
  </SEOPageLayout>
);

export default CRPSPainDiaryTemplatePage;

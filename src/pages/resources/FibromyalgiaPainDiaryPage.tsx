/**
 * Fibromyalgia Pain Diary – SEO Landing Page (Enhanced)
 *
 * Target keyword: "fibromyalgia pain diary"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  Activity, Brain, Moon, Thermometer, CloudRain, Heart,
  AlertTriangle, CheckCircle, XCircle, ArrowRight, Zap,
  TrendingUp, Users, FileText, Clock
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Multi-dimensional fibro symptom wheel showing the 6 core domains */
const FibroSymptomDomains: React.FC = () => {
  const domains = [
    { icon: Zap, label: 'Widespread Pain', desc: 'Pain in multiple body areas simultaneously, often shifting day-to-day', color: 'text-red-600 bg-red-50 border-red-200' },
    { icon: Activity, label: 'Crushing Fatigue', desc: 'Exhaustion that sleep doesn\'t fix — the hallmark "fibro fatigue"', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { icon: Brain, label: 'Fibro Fog', desc: 'Difficulty concentrating, word-finding problems, working memory gaps', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { icon: Moon, label: 'Sleep Disruption', desc: 'Non-restorative sleep, frequent waking, morning stiffness lasting hours', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { icon: Thermometer, label: 'Sensory Sensitivity', desc: 'Light, sound, temperature, and touch sensitivity (allodynia)', color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { icon: Heart, label: 'Mood & Emotional', desc: 'Anxiety, depression, emotional overwhelm — neurological, not weakness', color: 'text-pink-600 bg-pink-50 border-pink-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 6 Domains of Fibromyalgia</h3>
      <p className="text-sm text-slate-500 mb-6">Standard pain diaries capture one domain. This template tracks all six — because fibromyalgia is never just pain.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((d) => (
          <div key={d.label} className={`rounded-xl border p-5 ${d.color}`}>
            <d.icon className="w-6 h-6 mb-3" aria-hidden="true" />
            <h4 className="font-semibold text-slate-800 mb-1">{d.label}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** ACR diagnostic criteria visualization */
const DiagnosticCriteria: React.FC = () => {
  const criteria = [
    { label: 'Widespread Pain Index (WPI)', value: '≥ 7', desc: 'Pain in 7+ of 19 body regions over the past week' },
    { label: 'Symptom Severity Scale (SSS)', value: '≥ 5', desc: 'Fatigue + cognitive symptoms + waking unrefreshed + somatic symptoms' },
    { label: 'Symptom Duration', value: '≥ 3 months', desc: 'Symptoms present at a similar level for at least three months' },
    { label: 'No Other Explanation', value: 'Exclusion', desc: 'Symptoms not better explained by another diagnosis' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">ACR Fibromyalgia Diagnostic Criteria (2016)</h3>
      <p className="text-sm text-slate-500 mb-6">Your diary data directly maps to these criteria — giving your doctor the evidence they need for diagnosis.</p>
      <div className="space-y-4">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-start gap-4 bg-white/70 rounded-xl p-4 border border-purple-100">
            <div className="flex-shrink-0 w-20 text-center">
              <span className="text-lg font-bold text-purple-700">{c.value}</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{c.label}</h4>
              <p className="text-sm text-slate-600">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** PDF contents data */
const fibroPdfPages: PdfPage[] = [
  { page: 1, title: 'Symptom Profile Setup', desc: 'Personal info, diagnosis history, current medications, and baseline symptom levels' },
  { page: 2, title: 'Daily Fibro Symptom Log', desc: 'Multi-domain tracking: pain, fatigue, fog, sleep, stiffness, mood — all in one view' },
  { page: 3, title: 'Pain Location Map', desc: 'Track which body regions are affected each day to document widespread pain patterns' },
  { page: 4, title: 'Flare Trigger Analysis', desc: 'Identify and connect triggers: weather, stress, activity, sleep, hormonal cycles' },
  { page: 5, title: 'Treatment Response Log', desc: 'Medications, supplements, therapies — track what helps and what doesn\'t work' },
  { page: 6, title: 'Weekly Summary & Doctor Prep', desc: 'Aggregate your week into a single-page overview for rheumatology appointments' },
];

/** Stats data */
const fibroStats: StatItem[] = [
  { value: '4M+', label: 'Americans with fibro', icon: Users },
  { value: '5 yrs', label: 'Average time to diagnosis', icon: Clock },
  { value: '6', label: 'Symptom domains tracked', icon: Activity },
  { value: '80%', label: 'Of patients are women', icon: TrendingUp },
];

/** Common flare triggers */
const FlareTriggerGrid: React.FC = () => {
  const categories = [
    { icon: CloudRain, title: 'Environmental', triggers: ['Weather changes', 'Barometric pressure drops', 'Cold/damp conditions', 'Bright lights', 'Loud environments'] },
    { icon: Activity, title: 'Physical', triggers: ['Overexertion', 'Under-activity', 'Repetitive motions', 'Poor sleep', 'Standing too long'] },
    { icon: Brain, title: 'Cognitive/Emotional', triggers: ['Stress', 'Emotional upset', 'Overstimulation', 'Mental exhaustion', 'Anxiety episodes'] },
    { icon: Thermometer, title: 'Medical/Other', triggers: ['Infections/illness', 'Hormonal changes', 'Medication changes', 'Surgery/procedures', 'Dietary triggers'] },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Common Fibro Flare Triggers</h3>
      <p className="text-sm text-slate-500 mb-6">The template includes a trigger checklist. Here's what to watch for — your pattern will be unique.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => (
          <div key={cat.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <cat.icon className="w-5 h-5 text-purple-600" aria-hidden="true" />
              <h4 className="font-semibold text-slate-800">{cat.title}</h4>
            </div>
            <ul className="space-y-1.5">
              {cat.triggers.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-purple-400 flex-shrink-0" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'fibromyalgia-pain-diary',
  title: 'Fibromyalgia Pain Diary (Free)',
  metaTitle: 'Fibromyalgia Pain Diary — Free 6-Page Fibro Symptom Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free fibromyalgia pain diary that tracks all 6 symptom domains: widespread pain, fatigue, fibro fog, sleep, sensitivity, and mood. Designed for ACR criteria and rheumatology appointments.',
  keywords: [
    'fibromyalgia pain diary', 'fibro symptom tracker', 'fibromyalgia journal',
    'fibro pain log', 'fibromyalgia tracking sheet', 'fibro flare diary',
    'fibromyalgia symptom diary', 'fibro fatigue tracker', 'fibro fog tracker',
    'fibromyalgia diagnosis diary', 'ACR criteria tracking', 'fibro trigger log',
    'widespread pain tracker', 'fibromyalgia disability documentation'
  ],
  badge: 'Free Download',
  headline: 'Fibromyalgia Pain Diary',
  subheadline: 'Not another generic pain diary with "fibromyalgia" on top. This tracks all 6 symptom domains — pain, fatigue, fog, sleep, sensitivity, and mood — because fibro is never just one thing.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/fibromyalgia-pain-diary.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/fibromyalgia-pain-diary.pdf', downloadFileName: 'fibromyalgia-pain-diary.pdf' },
  whatIsThis: 'A fibromyalgia pain diary built for how fibro actually works. Standard pain diaries track one dimension — pain intensity. But fibromyalgia is a multi-system condition: widespread pain, crushing fatigue, cognitive dysfunction, sleep disruption, sensory sensitivity, and mood changes all interact. This 6-page template captures every domain, maps to ACR diagnostic criteria, and gives your rheumatologist the specific data they need to evaluate your condition and adjust treatment.',
  whoShouldUse: [
    'Anyone diagnosed with or suspected of having fibromyalgia',
    'People tracking symptoms to support fibromyalgia diagnosis (ACR criteria mapping)',
    'Fibro patients identifying personal flare triggers and patterns',
    'Those communicating symptom patterns to rheumatologists or pain specialists',
    'People documenting fibromyalgia for disability or insurance claims',
    'Patients evaluating treatment effectiveness across all symptom domains',
    'Caregivers helping someone manage a complex fibromyalgia picture',
    'People who\'ve tried generic pain diaries and found them useless for fibro'
  ],
  howToUse: [
    { step: 1, title: 'Set your baseline', description: 'Before tracking daily, fill in page 1 with your diagnosis history, current medications, and typical symptom levels. This gives context to everything that follows.' },
    { step: 2, title: 'Track all 6 domains daily', description: 'Rate pain, fatigue, cognitive function, sleep quality, sensitivity, and mood each day. It takes 2-3 minutes. Partial data is fine — track what you can.' },
    { step: 3, title: 'Map pain location', description: 'Use the body-region checklist to mark which areas hurt today. Fibro pain moves — the pattern of widespread, shifting pain is diagnostic evidence.' },
    { step: 4, title: 'Flag potential triggers', description: 'When symptoms spike, check the trigger list on page 4. After a few weeks, you\'ll see your personal patterns emerge — and some may be avoidable.' },
    { step: 5, title: 'Summarize for appointments', description: 'Use the weekly summary page before rheumatology visits. Your doctor sees a one-page overview instead of flipping through daily entries.' }
  ],
  whyItMatters: 'Fibromyalgia takes an average of 5 years to diagnose — partly because patients can\'t articulate the full picture in a 15-minute appointment. Research shows that fibromyalgia patients using condition-specific tracking tools identify more triggers, have more productive clinical conversations, and report greater sense of control over their condition. The ACR diagnostic criteria rely on exactly the kind of multi-domain data this diary captures: widespread pain index, symptom severity, duration, and functional impact.',
  trustSignals: {
    medicalNote: 'Tracks all domains referenced in the 2016 ACR fibromyalgia diagnostic criteria, including Widespread Pain Index and Symptom Severity Scale.',
    privacyNote: 'Paper format — your fibromyalgia data stays completely private. No app accounts, no cloud uploads.',
    legalNote: 'Multi-domain symptom documentation strengthens fibromyalgia disability claims by demonstrating total functional impact.'
  },
  faqs: [
    { question: 'What symptoms should I track for fibromyalgia?', answer: 'Track the six core domains: widespread pain (location + intensity), fatigue level, cognitive function (fibro fog), sleep quality and duration, sensory sensitivity, and mood. Don\'t try to track everything — these six capture the clinical picture your doctor needs.' },
    { question: 'How is this different from a regular pain diary?', answer: 'A regular pain diary tracks one dimension: pain intensity. This template tracks six domains simultaneously, maps to ACR diagnostic criteria, includes a body-region pain location tracker, and has a trigger analysis section. It\'s designed for how fibromyalgia actually behaves.' },
    { question: 'How do I track pain that\'s everywhere?', answer: 'Use the body-region checklist to mark affected areas (don\'t rate each one separately). Note overall intensity plus the worst area. "Widespread pain 6/10, worst in shoulders and hips" is more useful than trying to rate 20 locations.' },
    { question: 'Will this help with getting a fibromyalgia diagnosis?', answer: 'Yes. The ACR criteria assess the Widespread Pain Index (pain in 7+ of 19 regions) and Symptom Severity Scale (fatigue + fog + waking unrefreshed). This diary captures exactly that data over time — which is far more compelling than a single appointment snapshot.' },
    { question: 'Should I track good days too?', answer: 'Absolutely. Good days are diagnostic gold — they show your baseline, make your flare data credible, and help identify what might have gone right. A diary with only bad days looks cherry-picked to evaluators.' },
    { question: 'What\'s the best time of day to fill this in?', answer: 'Evening works best for most fibro patients — you can capture the full day. But also note morning stiffness and morning fatigue levels, which are characteristic fibro symptoms. The template has space for both.' },
    { question: 'How do I identify my flare triggers?', answer: 'Track consistently for 3-4 weeks, then look for patterns. Common triggers include weather changes, overexertion, poor sleep, stress, and hormonal shifts. The trigger analysis page helps you spot correlations you might miss otherwise.' },
    { question: 'Is this useful for fibromyalgia disability claims?', answer: 'Very. Disability evaluators need multi-domain evidence: not just "pain" but fatigue, cognitive limitations, sleep disruption, and functional impact. This template documents exactly what they look for — consistently, over time.' },
    { question: 'How long should I track before seeing my doctor?', answer: 'Minimum 2 weeks, ideally 4. The ACR criteria require 3+ months of symptoms — so the longer your tracking history, the stronger your evidence. Start now even if your appointment is months away.' },
    { question: 'Can I use this alongside the digital Pain Tracker app?', answer: 'Yes. Many users do both: the PDF for initial tracking or when screen time worsens symptoms, and the digital version for long-term pattern analysis, trend visualization, and encrypted backup. They complement each other.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'General multi-symptom tracking template', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive pain-focused tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Documenting Pain for Disability', description: 'Using symptom data for fibro disability claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'How to Track Pain for Doctors', description: 'Present fibro data effectively to specialists', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'CRPS Pain Diary', description: 'Another complex pain condition template', href: '/resources/crps-pain-diary-template' },
    { title: 'Chronic Pain Diary Template', description: 'Baseline and flare tracking for any chronic condition', href: '/resources/chronic-pain-diary-template' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Fibromyalgia Pain Diary', url: '/resources/fibromyalgia-pain-diary' }
  ]
};

export const FibromyalgiaPainDiaryPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={fibroStats} colorScheme="purple" />
    <FibroSymptomDomains />
    <DiagnosticCriteria />
    <FlareTriggerGrid />
    <PdfContentsPreview
      pages={fibroPdfPages}
      accentColor="purple"
      subtitle={'Not a generic pain diary with "fibromyalgia" printed on top. Every section is designed for how fibro actually works.'}
    />
    <BottomCTACallout
      icon={FileText}
      heading="Screen Time Making Fibro Worse?"
      body="Many fibro patients find screens aggravate symptoms. Start with the printable PDF \u2014 it works without a screen, without WiFi, without thinking. When you're ready, the digital version adds trend analysis and pattern detection that paper can't do."
      pdfUrl="/assets/fibromyalgia-pain-diary.pdf"
      gradientClasses="from-purple-600 to-indigo-600"
      tintClass="text-purple-100"
      buttonTextClass="text-purple-700"
      buttonHoverClass="hover:bg-purple-50"
    />
  </SEOPageLayout>
);

export default FibromyalgiaPainDiaryPage;

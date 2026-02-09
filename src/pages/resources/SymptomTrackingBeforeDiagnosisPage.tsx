/**
 * Symptom Tracking Before Diagnosis – SEO Landing Page (Enhanced)
 *
 * Target keyword: "symptom tracking before diagnosis"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Clock, Search,
  FileText, TrendingUp, AlertTriangle, Activity,
  MonitorSmartphone, Users, Brain, Thermometer
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Why pre-diagnosis tracking matters */
const PreDiagnosisValue: React.FC = () => {
  const values = [
    { icon: Search, benefit: 'Faster Diagnosis', desc: 'Patterns in your tracking can reveal the condition before tests do. "Morning stiffness >30 minutes" points straight to inflammatory arthritis.', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { icon: Clock, benefit: 'Saves Specialist Time', desc: 'You arrive with weeks of data instead of vague recall. The specialist can start analyzing instead of starting from scratch.', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
    { icon: AlertTriangle, benefit: 'Catches Red Flags', desc: 'Tracking reveals progressive symptoms, new patterns, and changes that warrant urgent attention — before the next scheduled appointment.', color: 'bg-red-50 border-red-200 text-red-600' },
    { icon: FileText, benefit: 'Creates a Medical Record', desc: 'When you have something no one has diagnosed yet, YOU are the primary recorder. This data becomes part of your medical history.', color: 'bg-purple-50 border-purple-200 text-purple-600' },
  ];
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {values.map((v) => (
        <div key={v.benefit} className={`rounded-xl border p-5 ${v.color.split(' ').slice(0, 2).join(' ')}`}>
          <v.icon className={`w-6 h-6 mb-3 ${v.color.split(' ')[2]}`} aria-hidden="true" />
          <h4 className="font-bold text-slate-800 mb-1">{v.benefit}</h4>
          <p className="text-sm text-slate-600">{v.desc}</p>
        </div>
      ))}
    </div>
  );
};

/** What to track when you don't know what's wrong */
const TrackingWhenUncertain: React.FC = () => {
  const categories = [
    { label: 'Primary Symptom(s)', items: ['Location, intensity (0-10), quality', 'When it started and how it\'s changed', 'Constant vs intermittent', 'What makes it better or worse', 'Timing: morning/evening/night, after activity/rest'], priority: 'Start here' },
    { label: 'Associated Symptoms', items: ['Fatigue, weakness, stiffness', 'Numbness, tingling, burning', 'Swelling, redness, warmth', 'Nausea, dizziness', 'Anything that started around the same time'], priority: 'Day 2-3' },
    { label: 'Daily Function Impact', items: ['What you could do today', 'What you couldn\'t do or had to modify', 'Energy levels throughout the day', 'Exercise/physical activity tolerance', 'Social/work impact'], priority: 'Day 3-4' },
    { label: 'Potential Triggers', items: ['Weather and temperature', 'Foods eaten', 'Sleep quality night before', 'Physical activities', 'Stress and emotional events'], priority: 'Week 2+' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-sky-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What to Track When You Don't Know What's Wrong</h3>
      <p className="text-sm text-slate-500 mb-6">Start broad, then narrow. Track the first category immediately. Add others as you settle into a routine.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((c) => (
          <div key={c.label} className="rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800">{c.label}</h4>
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">{c.priority}</span>
            </div>
            <ul className="space-y-1.5">
              {c.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
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

/** Pattern recognition guide */
const PatternRecognition: React.FC = () => {
  const patterns = [
    { pattern: 'Morning stiffness > 30 minutes', suggests: 'Inflammatory condition (RA, AS, lupus)', trackThis: 'Exact duration of morning stiffness daily', color: 'bg-amber-100' },
    { pattern: 'Symptoms worse with activity, better with rest', suggests: 'Mechanical / structural issue', trackThis: 'Which activities worsen symptoms, how long to recover', color: 'bg-blue-100' },
    { pattern: 'Burning / tingling in specific pattern', suggests: 'Nerve involvement (neuropathy, radiculopathy)', trackThis: 'Exact location, whether it\'s spreading, quality descriptors', color: 'bg-purple-100' },
    { pattern: 'Symptoms cycle with menstrual period', suggests: 'Endometriosis, hormonal component', trackThis: 'Cycle day + symptom severity for 2-3 full cycles', color: 'bg-rose-100' },
    { pattern: 'Widespread pain + fatigue + sleep issues', suggests: 'Fibromyalgia or systemic condition', trackThis: 'All symptom types together, not just pain', color: 'bg-indigo-100' },
    { pattern: 'Sudden onset after illness or injury', suggests: 'Post-infectious, CRPS, trauma-related', trackThis: 'Timeline from triggering event, all new symptoms since', color: 'bg-red-100' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Patterns in Your Data That Guide Diagnosis</h3>
      <p className="text-sm text-slate-500 mb-6">Your tracking may reveal patterns that point toward specific conditions. Here are the most diagnostically useful ones.</p>
      <div className="space-y-3">
        {patterns.map((p) => (
          <div key={p.pattern} className={`rounded-xl p-4 ${p.color}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="font-semibold text-slate-800 text-sm md:w-1/3">{p.pattern}</span>
              <span className="text-sm text-slate-600 md:w-1/3">→ {p.suggests}</span>
              <span className="text-xs text-slate-500 md:w-1/3 flex items-center gap-1">
                <Activity className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                Track: {p.trackThis}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Doctor-ready summary template */
const DoctorSummary: React.FC = () => (
  <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
    <h3 className="text-xl font-bold text-slate-800 mb-2">Your Pre-Diagnosis Summary for the Doctor</h3>
    <p className="text-sm text-slate-500 mb-4">Bring this filled out. It tells your doctor everything they need to start investigating.</p>
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm space-y-3">
      <div><span className="font-bold text-slate-800">Symptoms started:</span> <span className="text-slate-600">[date] — [what happened / how it began]</span></div>
      <div><span className="font-bold text-slate-800">Primary symptoms:</span> <span className="text-slate-600">[list main symptoms with severity]</span></div>
      <div><span className="font-bold text-slate-800">How they've changed:</span> <span className="text-slate-600">[getting worse / stable / new symptoms added]</span></div>
      <div><span className="font-bold text-slate-800">Pattern noticed:</span> <span className="text-slate-600">[worse in morning / after activity / with weather / cyclical]</span></div>
      <div><span className="font-bold text-slate-800">Impact on daily life:</span> <span className="text-slate-600">[what you can't do that you used to do]</span></div>
      <div><span className="font-bold text-slate-800">What helps:</span> <span className="text-slate-600">[rest? heat? medication? nothing?]</span></div>
      <div><span className="font-bold text-slate-800">Tests already done:</span> <span className="text-slate-600">[blood work, imaging, etc.]</span></div>
      <div><span className="font-bold text-slate-800">Family history:</span> <span className="text-slate-600">[relevant conditions in family]</span></div>
    </div>
  </div>
);

const diagnosisStats: StatItem[] = [
  { value: '4.5 yr', label: 'Average time to chronic pain diagnosis', icon: Clock },
  { value: '3+', label: 'Doctors seen before diagnosis (average)', icon: Users },
  { value: '6', label: 'Diagnostic patterns your tracking reveals', icon: TrendingUp },
  { value: '72%', label: 'Of patients wish they\'d tracked earlier', icon: Brain },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'symptom-tracking-before-diagnosis',
  title: 'Symptom Tracking Before Diagnosis',
  metaTitle: 'Symptom Tracking Before Diagnosis — What to Track When You Don\'t Know What\'s Wrong | Pain Tracker Pro',
  metaDescription: 'Learn what to track when your pain hasn\'t been diagnosed yet. Pattern recognition guide, pre-diagnosis tracking categories, and doctor-ready summary template.',
  keywords: [
    'symptom tracking before diagnosis', 'pre-diagnosis symptom tracking',
    'track symptoms for doctor', 'undiagnosed pain tracking',
    'symptom journal before diagnosis', 'what to track before diagnosis',
    'chronic pain not diagnosed yet', 'symptom diary for diagnosis',
    'tracking pain for diagnosis', 'symptom patterns for diagnosis',
    'pre-diagnosis pain diary', 'undiagnosed symptoms tracker',
    'mystery symptoms tracker', 'what to tell doctor about symptoms'
  ],
  badge: 'Guide',
  headline: 'Symptom Tracking Before Diagnosis',
  subheadline: 'You know something is wrong, but no one has told you what yet. Track broadly, track consistently, and bring patterns to your doctor that point toward answers — because the average chronic pain diagnosis takes 4.5 years, and your tracking can shorten that.',
  primaryCTA: { text: 'Download Pre-Diagnosis Tracker', href: '/assets/pre-diagnosis-symptom-tracker.pdf', download: true },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/pre-diagnosis-symptom-tracker.pdf', downloadFileName: 'pre-diagnosis-symptom-tracker.pdf' },
  whatIsThis: 'A symptom tracking guide for people who haven\'t been diagnosed yet — the hardest and most important time to track. When you don\'t know what\'s wrong, you don\'t know what matters. This guide helps you track broadly across multiple categories, recognize diagnostically meaningful patterns in your data, and present findings to doctors in a format that accelerates investigation. It covers what to track when you\'re uncertain, how the patterns in your data suggest specific conditions, and how to prepare a pre-diagnosis summary your doctor can act on.',
  whoShouldUse: [
    'Anyone experiencing chronic symptoms that haven\'t been diagnosed',
    'People who\'ve been told "we can\'t find anything wrong" but know something is',
    'Patients waiting for specialist referrals who want to arrive with useful data',
    'People seeing multiple doctors for the same unresolved symptoms',
    'Anyone whose symptoms are vague, widespread, or confusing',
    'People who\'ve been dismissed or not taken seriously and need evidence',
    'Patients in the early stages of a complex condition (autoimmune, neurological)',
    'Anyone who wants to be their own best health advocate'
  ],
  howToUse: [
    { step: 1, title: 'Start tracking immediately — even if you feel silly', description: 'You don\'t need a diagnosis to start. Track your primary symptoms daily: what, where, when, how bad, how long. This IS your medical record until you have a diagnosis.' },
    { step: 2, title: 'Track broadly at first, then narrow', description: 'In week 1, cast a wide net: all symptoms, functional impact, sleep, mood, triggers. By week 2-3, you\'ll naturally notice which categories are most relevant. Focus there.' },
    { step: 3, title: 'Look for patterns in the data', description: 'After 2+ weeks, review your tracking. Is there a time pattern (mornings worse)? An activity pattern (worse after exercise)? A cyclical pattern? These patterns are diagnostically powerful.' },
    { step: 4, title: 'Compare your patterns to the guide', description: 'The pattern recognition section shows which symptom patterns point toward specific conditions. This isn\'t self-diagnosis — it\'s being an informed patient who can ask the right questions.' },
    { step: 5, title: 'Bring the pre-diagnosis summary to your doctor', description: 'Fill out the doctor-ready summary template: when it started, what\'s changed, patterns you\'ve noticed, impact on your life, and what helps. This transforms a confused appointment into a focused investigation.' }
  ],
  whyItMatters: 'The average chronic pain patient sees 3+ doctors over 4.5 years before receiving a diagnosis. That\'s years of suffering, wasted appointments, and repeated "start from scratch" conversations with new providers. Organized symptom tracking with pattern recognition cuts through this cycle. When you arrive with weeks of structured data showing specific patterns, doctors can skip the "tell me everything from the beginning" conversation and go straight to targeted investigation. Your tracking doesn\'t diagnose you — it gives your doctor the clues to diagnose you faster.',
  trustSignals: {
    medicalNote: 'Pattern recognition guide aligned with clinical assessment frameworks for common chronic pain conditions. Pattern suggestions are starting points for clinical investigation, not diagnoses.',
    privacyNote: 'Your symptom data stays completely private on your device until you choose to share it with a healthcare provider.',
    legalNote: 'Pre-diagnosis tracking creates a documented symptom timeline that supports future disability claims, referrals, and medical-legal documentation.'
  },
  faqs: [
    { question: 'Isn\'t it bad to self-diagnose?', answer: 'This isn\'t self-diagnosis — it\'s self-documentation. You\'re tracking symptoms and recognizing patterns, then bringing that data to qualified healthcare providers. There\'s a huge difference between "I think I have X" and "I\'ve noticed my symptoms have this pattern — what could that mean?"' },
    { question: 'How long should I track before seeing a doctor?', answer: '2 weeks minimum provides useful patterns. But if symptoms are severe, new, or worsening rapidly — see a doctor immediately and track alongside. Never delay care to gather more data.' },
    { question: 'What if my doctor dismisses my tracking?', answer: 'That tells you something about the provider. If multiple doctors have dismissed your documented symptoms, consider a specialist referral or second opinion. Your systematic documentation is evidence — if a provider won\'t engage with evidence, they may not be the right provider.' },
    { question: 'Should I track things that seem unrelated to my main symptom?', answer: 'Yes, especially early on. Many conditions have unexpected associated symptoms. Fatigue with joint pain: could be autoimmune. GI symptoms with skin changes: could be systemic. Track everything for the first 2-3 weeks, then narrow.' },
    { question: 'My symptoms come and go — does that make tracking harder?', answer: 'It makes tracking MORE valuable, not harder. Intermittent symptoms are harder for doctors to observe in a 15-minute appointment. Your diary captures what the office visit misses: the timing, the triggers, and the pattern of return.' },
    { question: 'What if nothing shows up on tests?', answer: 'Keep tracking. Many conditions (fibromyalgia, small fiber neuropathy, early autoimmune) have normal standard blood work and imaging. Your symptom diary IS the diagnostic tool when tests are normal. It helps identify which specialized tests to order.' },
    { question: 'I\'ve been dismissed as "just anxious" — will tracking help?', answer: 'Absolutely. Structured, systematic tracking demonstrates that your symptoms are consistent, patterned, and functionally limiting — regardless of any psychological component. Anxiety doesn\'t produce morning stiffness patterns or medication response data. Your diary separates the psychological dismissal from the physical evidence.' },
    { question: 'How do I handle tracking when symptoms are overwhelming?', answer: 'On bad days, do the 1-minute version: pain level (0-10), main symptom, and one word for functional impact ("housebound," "modified," "okay"). Even that captures data. Tracking shouldn\'t add to your suffering — it should feel like taking control.' },
    { question: 'Should I share my tracking online for help?', answer: 'Be cautious — online communities can provide support but also incorrect diagnoses and anxiety. Share your tracking with your healthcare provider first. Community support is valuable for coping; professional evaluation is necessary for diagnosis.' },
    { question: 'When should I stop tracking and accept that there\'s no diagnosis?', answer: 'Never accept "no diagnosis" as a permanent state — accept "no diagnosis yet." Many conditions take years to manifest enough for diagnosis. Continue tracking (even briefly) because: 1) your data accumulates, 2) future testing may reveal what current testing missed, and 3) new doctors benefit from your documented history.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Structured daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'What to Include in Pain Journal', description: 'Complete content guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Pain Diary for Specialist', description: 'Prepare for specialist visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'How to Track Pain for Doctors', description: 'Doctor communication guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Symptom Tracker Printable', description: 'Track all symptom types', href: '/resources/symptom-tracker-printable' },
    { title: 'Fibromyalgia Pain Diary', description: 'If symptoms suggest fibromyalgia', href: '/resources/fibromyalgia-pain-diary' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Symptom Tracking Before Diagnosis', url: '/resources/symptom-tracking-before-diagnosis' }
  ]
};

export const SymptomTrackingBeforeDiagnosisPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={diagnosisStats} colorScheme="sky" />
    <PreDiagnosisValue />
    <TrackingWhenUncertain />
    <PatternRecognition />
    <DoctorSummary />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="You Know Something the Tests Haven't Caught Yet. Document It."
      body="Your symptoms are real. Your tracking creates the evidence that closes the gap between your experience and a diagnosis. Start today — every day of data gets you closer to answers."
      pdfUrl="/assets/pre-diagnosis-symptom-tracker.pdf"
      gradientClasses="from-sky-600 to-blue-600"
      tintClass="text-sky-100"
      buttonTextClass="text-sky-700"
      buttonHoverClass="hover:bg-sky-50"
      primaryLabel="Download Tracker"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default SymptomTrackingBeforeDiagnosisPage;

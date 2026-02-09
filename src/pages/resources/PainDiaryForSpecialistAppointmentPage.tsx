/**
 * Pain Diary for Specialist Appointment – SEO Landing Page (Enhanced)
 *
 * Target keyword: "pain diary for specialist appointment"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  ArrowRight, Activity, CheckCircle, Clock, Stethoscope,
  FileText, TrendingUp, AlertTriangle, ClipboardList,
  MonitorSmartphone, Users, Brain, Zap
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Specialist types and what they need */
const SpecialistNeeds: React.FC = () => {
  const specialists = [
    { title: 'Pain Specialist', focus: 'Medication response, pain patterns, treatment history', needs: ['Pain before/after each medication', 'Duration of relief from each treatment', 'Procedures and their effectiveness', 'What you\'ve already tried'], color: 'bg-red-50 border-red-200', icon: Zap },
    { title: 'Rheumatologist', focus: 'Inflammation markers, joint patterns, morning stiffness', needs: ['Morning stiffness duration daily', 'Which joints affected and when', 'Fatigue levels alongside pain', 'Flare triggers and patterns'], color: 'bg-blue-50 border-blue-200', icon: Activity },
    { title: 'Neurologist', focus: 'Pain quality, distribution, progression, neurological symptoms', needs: ['Burning/tingling/numbness locations', 'Whether symptoms are spreading', 'Weakness or balance changes', 'Quality descriptors (burning vs aching)'], color: 'bg-purple-50 border-purple-200', icon: Brain },
    { title: 'Orthopedic Surgeon', focus: 'Positional triggers, mechanical patterns, functional limitation', needs: ['Which positions worsen pain', 'Range of motion changes', 'What physical activities you can\'t do', 'Response to PT / conservative treatment'], color: 'bg-amber-50 border-amber-200', icon: Stethoscope },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">4 Common Specialists — 4 Different Data Needs</h3>
      <p className="text-sm text-slate-500 mb-6">Your diary should be tailored to WHO you're seeing. Each specialist weighs different data.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specialists.map((s) => (
          <div key={s.title} className={`rounded-xl border p-5 ${s.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <s.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800">{s.title}</h4>
            </div>
            <p className="text-sm text-slate-500 mb-2">{s.focus}</p>
            <ul className="space-y-1.5">
              {s.needs.map((n) => (
                <li key={n} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Pre-appointment checklist */
const PreAppointmentChecklist: React.FC = () => {
  const sections = [
    { phase: '1 Week Before', tasks: ['Start or intensify daily tracking (minimum 7 days)', 'Note your top 3 questions for the specialist', 'Gather list of all medications (current + past)', 'Collect previous imaging/test results'] },
    { phase: '1 Day Before', tasks: ['Review diary entries — highlight significant patterns', 'Write a 1-paragraph pain summary', 'Prepare treatment history (what worked, what didn\'t)', 'Set appointment goal: "I need help with ___"'] },
    { phase: 'Day Of Appointment', tasks: ['Bring diary, medication list, imaging, and summary', 'Arrive early to fill out specialist forms', 'Lead with your summary and diary data', 'Ask: "What should I track before our next visit?"'] },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-indigo-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Pre-Appointment Preparation Timeline</h3>
      <p className="text-sm text-slate-500 mb-6">Specialists get ONE chance to assess you in a 30-minute window. Make every minute count.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.phase} className="rounded-xl bg-white border border-slate-200 p-5">
            <h4 className="text-sm font-bold text-indigo-700 mb-3">{s.phase}</h4>
            <ul className="space-y-2">
              {s.tasks.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
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

/** First appointment one-page summary template */
const OnePageSummary: React.FC = () => (
  <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
    <h3 className="text-xl font-bold text-slate-800 mb-2">The One-Page Specialist Summary: What to Hand Over</h3>
    <p className="text-sm text-slate-500 mb-4">Specialists see many referrals. Handing them a one-page summary shows you're organized and saves precious appointment time.</p>
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm space-y-3">
      <div>
        <span className="font-bold text-slate-800">Pain History:</span>
        <span className="text-slate-600"> Pain started [date/event]. Current pattern: [X]/10 baseline, spikes to [Y] on [frequency]. Worst in [time of day]. Primary location: [where]. Type: [descriptors].</span>
      </div>
      <div>
        <span className="font-bold text-slate-800">Treatment History:</span>
        <span className="text-slate-600"> Tried [medication 1] — helped [amount] but [side effect]. Tried [medication 2] — no improvement after [weeks]. Currently taking [current meds]. PT: [sessions, response].</span>
      </div>
      <div>
        <span className="font-bold text-slate-800">Functional Impact:</span>
        <span className="text-slate-600"> Cannot [specific activities]. Modified [other activities]. Work status: [working/reduced/off]. Average active hours: [X] per day.</span>
      </div>
      <div>
        <span className="font-bold text-slate-800">Recent Diary Summary:</span>
        <span className="text-slate-600"> Past 2 weeks: pain range [low]–[high], average [X]. [Y] flare days. Best day: [what happened]. Worst day: [what happened]. Key trigger: [identified].</span>
      </div>
      <div>
        <span className="font-bold text-slate-800">My Questions:</span>
        <span className="text-slate-600"> 1. [Most important question] 2. [Second question] 3. [Third question]</span>
      </div>
    </div>
    <p className="text-xs text-slate-400 mt-3">Keep this to ONE page. Specialists can read it in 60 seconds and start the conversation informed.</p>
  </div>
);

const specialistStats: StatItem[] = [
  { value: '3-6 mo', label: 'Average wait for specialist', icon: Clock },
  { value: '30 min', label: 'Typical first appointment', icon: Stethoscope },
  { value: '4', label: 'Specialist types covered', icon: Users },
  { value: '7 days', label: 'Minimum tracking beforehand', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'pain-diary-for-specialist-appointment',
  title: 'Pain Diary for Specialist Appointment',
  metaTitle: 'Pain Diary for Specialist Appointment — What to Track & Bring | Pain Tracker Pro',
  metaDescription: 'Prepare for your specialist appointment with the right pain diary data. What pain specialists, rheumatologists, neurologists, and surgeons need. Free one-page summary template.',
  keywords: [
    'pain diary for specialist appointment', 'pain diary for specialist',
    'pain journal specialist visit', 'pain tracking for referral',
    'what to bring to pain specialist', 'prepare for pain specialist',
    'pain diary for rheumatologist', 'pain diary for neurologist',
    'specialist appointment preparation', 'pain history for specialist',
    'pain specialist first appointment', 'specialist referral preparation',
    'pain diary for orthopedic', 'pain tracking before specialist'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Specialist Appointment',
  subheadline: 'You waited months for this appointment. Different specialists need different data. Here\'s exactly what to track and bring — tailored to whether you\'re seeing a pain specialist, rheumatologist, neurologist, or surgeon — so you make the most of your 30 minutes.',
  primaryCTA: { text: 'Download Specialist Prep Template', href: '/assets/specialist-appointment-diary.pdf', download: true },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/specialist-appointment-diary.pdf', downloadFileName: 'specialist-appointment-diary.pdf' },
  whatIsThis: 'A specialist appointment preparation guide that matches your pain diary to the specialist you\'re seeing. Pain specialists, rheumatologists, neurologists, and orthopedic surgeons all evaluate differently — they need different data from your diary. This guide tells you exactly what to track for each specialist type, provides a pre-appointment preparation timeline, and includes a one-page summary template that specialists can review in 60 seconds. You waited months for this appointment. Arrive prepared.',
  whoShouldUse: [
    'Anyone with a specialist appointment coming up in the next 1-4 weeks',
    'Patients referred to a pain specialist for the first time',
    'People seeing a rheumatologist for joint pain, stiffness, or suspected arthritis',
    'Patients referred to a neurologist for nerve pain, neuropathy, or headaches',
    'People seeing an orthopedic specialist for surgical evaluation',
    'Anyone who\'s been waiting months for a specialist and wants to maximize the visit',
    'Patients whose previous specialist visit felt rushed or unproductive',
    'Primary care physicians guiding patients on specialist preparation'
  ],
  howToUse: [
    { step: 1, title: 'Identify your specialist type', description: 'Check which specialist you\'re seeing (pain management, rheumatology, neurology, orthopedics). Each section of this guide tells you exactly what that specialist prioritizes in pain diary data.' },
    { step: 2, title: 'Start tracking at least 7 days before', description: '7 days minimum, 14 days ideal. Focus on what YOUR specialist needs: medication response for pain management, morning stiffness for rheumatology, pain quality for neurology, positional triggers for orthopedics.' },
    { step: 3, title: 'Prepare your one-page summary the day before', description: 'Use the template: pain history (when it started, current pattern), treatment history (what\'s been tried), functional impact, recent diary summary, and your top 3 questions. One page only.' },
    { step: 4, title: 'Bring everything organized', description: 'Diary entries, one-page summary, medication list, previous imaging/test results. Put the one-page summary on top. Lead with it when the appointment starts.' },
    { step: 5, title: 'Ask the specialist what to track next', description: 'Before leaving: "What specific things should I track before our next visit?" This tells your specialist what data will help their decision-making and shows engagement.' }
  ],
  whyItMatters: 'The average specialist referral wait in Canada is 3-6 months. In the US, pain specialist waits average 4-6 weeks. You get ONE first appointment — usually 30 minutes. Half the patients arrive with vague descriptions: "it just hurts." The ones with organized data get better assessments, faster diagnoses, and more targeted treatment plans. Preparation is the difference between a productive visit and a wasted opportunity.',
  trustSignals: {
    medicalNote: 'Specialist-specific preparation aligned with clinical assessment frameworks used by pain specialists, rheumatologists, neurologists, and orthopedic surgeons.',
    privacyNote: 'Your diary data stays on your device. You choose what to share with your specialist.',
    legalNote: 'Structured specialist documentation supports referral justification, prior authorizations, and treatment history records.'
  },
  faqs: [
    { question: 'How far in advance should I start tracking?', answer: 'Minimum 7 days. Ideal is 14+ days. This provides enough data for patterns to emerge. If your appointment is tomorrow, start now — even 24 hours of structured tracking is better than arriving with nothing.' },
    { question: 'Should I bring my actual diary or just a summary?', answer: 'Both. Hand the one-page summary to the specialist (they\'ll read it in 60 seconds). Have the full diary available if they want to look at specific days or patterns. The summary is for efficiency; the diary is for depth.' },
    { question: 'What if I\'m seeing a specialist not listed here?', answer: 'Use the general preparation timeline and one-page summary template. Focus on: pain patterns, treatment history, and functional impact. Then add details relevant to their specialty (e.g., for a gastroenterologist: food triggers and GI symptoms alongside pain).' },
    { question: 'My specialist appointment is for a second opinion — anything different?', answer: 'Yes: emphasize treatment history MORE. Document everything that\'s been tried, how long, and results. The second-opinion specialist needs to understand what hasn\'t worked to suggest alternatives. Your diary showing "tried X for 8 weeks, pain unchanged" is powerful.' },
    { question: 'What if the specialist doesn\'t look at my diary?', answer: 'Share the one-page summary regardless — it takes 60 seconds to read. If they dismiss it, that\'s information about the provider. Most specialists value organized patients because it makes their assessment faster and more accurate.' },
    { question: 'Should I stop medications before the appointment?', answer: 'NEVER stop medications without your prescribing doctor\'s approval. But DO track medication response carefully in the week before — pain before dose, after dose, duration of relief. This data is essential for the specialist.' },
    { question: 'What about imaging and test results?', answer: 'Bring everything: MRI reports, X-rays, nerve conduction results, blood work. If possible, bring the actual images (many radiology departments provide CDs or patient portals). Don\'t assume the specialist has received your records — they often haven\'t.' },
    { question: 'How do I describe pain quality for a neurologist?', answer: 'Use specific descriptors: burning, tingling, electric, shooting, numbness, pins-and-needles. Note distribution pattern (both feet? one hand? down the leg?). These descriptors are diagnostic — they tell the neurologist which nerve fibers are involved.' },
    { question: 'What questions should I prepare?', answer: 'Top 3, written down. Examples: "What is causing my pain?" "What treatment options do I have?" "What should I expect long-term?" Having written questions ensures you don\'t leave thinking "I forgot to ask about..."' },
    { question: 'My appointment is a Consultative Examination for disability — anything different?', answer: 'Yes — bring MORE documentation. The CE examiner writes a report that influences your claim. Your diary, functional limitation log, and treatment history provide data points the examiner can reference. Be thorough, be honest, and be specific.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain for Doctors', description: 'General doctor communication guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'How Doctors Use Pain Diaries', description: 'Clinical perspective', href: '/resources/how-doctors-use-pain-diaries' },
    { title: 'What to Include in Pain Journal', description: 'Complete content guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Pain Diary Template PDF', description: 'Start tracking today', href: '/resources/pain-diary-template-pdf' },
    { title: 'Symptom Tracking Before Diagnosis', description: 'Pre-diagnosis documentation', href: '/resources/symptom-tracking-before-diagnosis' },
    { title: 'Monthly Pain Tracker Printable', description: 'Long-term patterns for referrals', href: '/resources/monthly-pain-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Specialist', url: '/resources/pain-diary-for-specialist-appointment' }
  ]
};

export const PainDiaryForSpecialistAppointmentPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={specialistStats} colorScheme="indigo" />
    <SpecialistNeeds />
    <PreAppointmentChecklist />
    <OnePageSummary />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="You Waited Months for This. Arrive Ready."
      body="Download the specialist preparation template, start tracking today, and walk into your appointment with organized data that gets results."
      pdfUrl="/assets/specialist-appointment-diary.pdf"
      gradientClasses="from-indigo-600 to-purple-600"
      tintClass="text-indigo-100"
      buttonTextClass="text-indigo-700"
      buttonHoverClass="hover:bg-indigo-50"
      primaryLabel="Download Prep Template"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default PainDiaryForSpecialistAppointmentPage;

/**
 * How to Track Pain for Doctors – SEO Landing Page (Enhanced)
 *
 * Target keyword: "how to track pain for doctors"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  ArrowRight, Stethoscope, CheckCircle, Clock, MessageSquare,
  FileText, AlertTriangle, TrendingUp, ClipboardList,
  MonitorSmartphone, XCircle, Target
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** What doctors actually need vs what patients typically share */
const DoctorVsPatient: React.FC = () => {
  const rows = [
    { patient: '"It hurts all the time"', doctor: 'Pain rating pattern: 5-6 baseline, spikes to 8 on 3 of 7 days', why: 'Patterns guide treatment decisions' },
    { patient: '"The medication doesn\'t work"', doctor: 'Pain before dose: 7. One hour after: 5. Duration: 3 hours. Then returns to 7.', why: 'Partial response ≠ failure. Dose may need adjustment.' },
    { patient: '"I can\'t do anything"', doctor: 'Mon: walked 10 min. Tue: couldn\'t stand to cook. Wed: drove to store but left early.', why: 'Specific limitations guide referrals and documentation' },
    { patient: '"Sleep is terrible"', doctor: 'Woke 3x from pain. Got 4 total hours. Took 45 min to fall asleep.', why: 'Sleep data impacts medication choices directly' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-sky-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What Doctors Need vs. What Patients Typically Say</h3>
      <p className="text-sm text-slate-500 mb-6">Your doctor has 15 minutes. These translations turn vague descriptions into actionable clinical information.</p>
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <span className="text-xs font-bold text-red-500 block mb-1">Patient says</span>
                <p className="text-sm text-slate-700 italic">{r.patient}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-600 block mb-1">Doctor needs</span>
                <p className="text-sm text-slate-700">{r.doctor}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">→ {r.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** The 7 things to track */
const SevenThingsToTrack: React.FC = () => {
  const items = [
    { num: 1, label: 'Pain Level (0-10)', desc: 'Rate at consistent times: morning, afternoon, evening. Patterns matter more than individual numbers.', icon: Target },
    { num: 2, label: 'Pain Location & Type', desc: 'Where exactly? Burning, aching, stabbing, throbbing? Does it radiate? This narrows the differential diagnosis.', icon: Stethoscope },
    { num: 3, label: 'Triggers & Aggravators', desc: 'What makes it worse? Sitting, standing, weather, stress, specific movements? Triggers guide treatment planning.', icon: AlertTriangle },
    { num: 4, label: 'Medication Response', desc: 'What did you take, when, and did it help? Pain before dose vs. after. Duration of relief. Side effects.', icon: ClipboardList },
    { num: 5, label: 'Sleep Quality', desc: 'Hours slept, times woken, time to fall asleep, how you felt on waking. Sleep is clinical gold.', icon: Clock },
    { num: 6, label: 'Functional Impact', desc: 'What could you do? What couldn\'t you? How far could you walk? How long could you sit? Be specific.', icon: TrendingUp },
    { num: 7, label: 'Mood & Mental Health', desc: 'Pain affects mood; mood affects pain. Brief daily note. This guides whether adjunct treatments are needed.', icon: MessageSquare },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 7 Things Your Doctor Actually Needs from Your Tracking</h3>
      <p className="text-sm text-slate-500 mb-6">Track these consistently and your 15-minute appointment becomes 10x more productive.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 6).map((item) => (
          <div key={item.num} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-700">{item.num}</span>
              <item.icon className="w-5 h-5 text-sky-600" aria-hidden="true" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{item.label}</h4>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
        <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sm font-bold text-sky-700">7</span>
            {React.createElement(items[6].icon, { className: 'w-5 h-5 text-sky-600', 'aria-hidden': 'true' })}
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">{items[6].label}</h4>
          <p className="text-sm text-slate-600">{items[6].desc}</p>
        </div>
      </div>
    </div>
  );
};

/** Appointment prep checklist */
const AppointmentPrep: React.FC = () => {
  const before = [
    'Review last 2 weeks of tracking data',
    'Highlight your top 3 concerns / questions',
    'Note any medication changes or side effects',
    'Write down your "what I need from this visit" goal',
    'Bring a printed summary or phone with data ready',
  ];
  const during = [
    'Share your tracking summary first (saves time)',
    'Ask about patterns you\'ve noticed',
    'Confirm what to track next',
    'Ask: "Is there anything else I should be tracking?"',
    'Write down any changes to your plan',
  ];
  return (
    <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Appointment Prep: Before & During</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-bold text-sky-700 mb-3">BEFORE (5 minutes)</h4>
          <ul className="space-y-2">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 mb-3">DURING (use your 15 minutes wisely)</h4>
          <ul className="space-y-2">
            {during.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const trackingStats: StatItem[] = [
  { value: '15 min', label: 'Average appointment length', icon: Clock },
  { value: '7', label: 'Key data points doctors need', icon: ClipboardList },
  { value: '40%', label: 'Of pain info lost without records', icon: AlertTriangle },
  { value: '2 min', label: 'Daily tracking investment', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'how-to-track-pain-for-doctors',
  title: 'How to Track Pain for Doctors',
  metaTitle: 'How to Track Pain for Doctors — What Your Doctor Actually Needs | Pain Tracker Pro',
  metaDescription: 'Learn exactly what to track and how to present pain data to your doctor in 15-minute appointments. 7 key data points, appointment prep checklist, and free tracking templates.',
  keywords: [
    'how to track pain for doctors', 'pain tracking for doctor appointment',
    'what to tell doctor about pain', 'pain diary for doctor',
    'how to describe pain to doctor', 'pain tracking methods',
    'doctor visit pain preparation', 'chronic pain doctor communication',
    'pain level tracking for appointment', 'how to report pain to doctor',
    'pain journal for medical appointments', 'patient pain tracking',
    'clinical pain assessment preparation', 'pain data for physician'
  ],
  badge: 'Guide',
  headline: 'How to Track Pain for Doctors',
  subheadline: 'Your doctor has 15 minutes and needs specific, actionable data — not "it hurts all the time." Here\'s exactly what to track, how to present it, and why it changes the quality of care you receive.',
  primaryCTA: { text: 'Download Free Pain Tracker', href: '/resources/pain-diary-template-pdf' },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/how-to-track-pain-for-doctors.pdf', downloadFileName: 'how-to-track-pain-for-doctors.pdf' },
  whatIsThis: 'A practical guide to tracking pain in ways that actually help your doctor help you. Most chronic pain patients know they should track pain, but don\'t know WHAT to track or HOW to present it. The result: wasted appointment time, vague conversations, and treatment decisions made with incomplete information. This guide covers the 7 data points doctors need most, shows you how to translate your experience into clinical language, and includes a pre-appointment preparation checklist.',
  whoShouldUse: [
    'Anyone with chronic pain seeing a doctor regularly',
    'Patients who feel their pain isn\'t being heard or taken seriously',
    'People starting with a new doctor or specialist',
    'Anyone whose treatment doesn\'t seem to be working (documentation helps adjust)',
    'Patients preparing for a referral to a pain specialist',
    'People who struggle to describe their pain clearly during appointments',
    'Anyone who leaves appointments thinking "I forgot to mention..."',
    'Patients whose doctors have said "can you track this and come back?"'
  ],
  howToUse: [
    { step: 1, title: 'Choose your tracking method', description: 'Paper template, digital app, or both. The best method is the one you\'ll actually use daily. Consistency matters more than format. Even a simple notebook works if you track the right 7 things.' },
    { step: 2, title: 'Track the 7 key data points daily', description: 'Pain level (at consistent times), location + type, triggers, medication response, sleep quality, functional impact, mood. These 7 items take 2-3 minutes and provide everything your doctor needs.' },
    { step: 3, title: 'Prepare for appointments (5 minutes)', description: 'Review the last 2 weeks, highlight patterns, identify your top 3 concerns, and write your "what I need from this visit" goal. Preparation transforms appointments from vague conversations into productive decisions.' },
    { step: 4, title: 'Lead with your data during the appointment', description: 'Open with: "I\'ve been tracking daily. My pain averages 6, spikes to 8 twice a week, especially after sitting. The medication helps for about 3 hours." This gives your doctor more in 30 seconds than 10 minutes of description.' },
    { step: 5, title: 'Ask what to track next', description: 'Before leaving: "Is there anything specific you\'d like me to track before our next visit?" This gives your doctor exactly what they need for the next decision point and shows engagement.' }
  ],
  whyItMatters: 'Chronic pain appointments are 15 minutes of high-stakes communication. Without structured data, patients describe pain in vague terms, doctors struggle to identify patterns, and treatment decisions are made with incomplete information. Research shows patients who bring structured pain records to appointments report higher satisfaction, better communication, and more treatment adjustments — because the doctor has the data to act on.',
  trustSignals: {
    medicalNote: 'Covers the clinical data points recommended by pain management guidelines for patient-reported outcomes in chronic pain assessment.',
    privacyNote: 'All tracking data stays on your device. Share only what you choose to share with your healthcare provider.',
    legalNote: 'Structured pain records support disability applications, referrals, and treatment authorization requests.'
  },
  faqs: [
    { question: 'What\'s the most important thing to track?', answer: 'Medication response. Doctors can adjust every other treatment based on examination — but they can\'t observe how medication works at home. "Pain before dose: 7. After 1 hour: 5. Wears off in 3 hours." This single data point has more clinical value than a week of pain ratings.' },
    { question: 'Should I rate pain on a 0-10 scale?', answer: 'Yes, but WITH context. "7/10" means nothing alone. "7/10 — couldn\'t stand long enough to cook, had to lie down by 2pm" is useful. The number is a shorthand; the functional detail is what drives decisions.' },
    { question: 'What if my pain changes throughout the day?', answer: 'Track at consistent times: morning (upon waking), afternoon, and evening. Note the highest and lowest. This reveals patterns — morning stiffness suggests inflammatory conditions, evening escalation suggests activity-related pain. Both guide different treatments.' },
    { question: 'How far back should I track before an appointment?', answer: 'Minimum 1-2 weeks. Ideal is from the last appointment to this one. Even 3-5 days of good tracking is better than arriving with nothing. Start now.' },
    { question: 'My doctor doesn\'t look at my diary — should I bother?', answer: 'Yes. Even if your doctor doesn\'t read every entry, YOU arrive prepared. You can say "In the last 2 weeks, I averaged pain 6, with 3 days above 8, triggered by..." That verbal summary from structured data is powerful. If your doctor still seems disinterested, consider whether they\'re the right fit.' },
    { question: 'Should I track on paper or digitally?', answer: 'Whichever you\'ll actually do daily. Paper is always available (no battery issues); digital offers reminders and summaries. Many patients use digital daily and print/summarize before appointments. Both work.' },
    { question: 'How do I describe pain quality?', answer: 'Use specific descriptors: burning, aching, stabbing, throbbing, shooting, tingling, crushing, sharp. Then add behavior: constant vs. intermittent, worsening vs. stable, radiating vs. localized. These descriptors help doctors narrow diagnosis.' },
    { question: 'What about tracking sleep?', answer: 'Sleep data is clinical gold for pain management. Track: hours in bed, estimated hours asleep, number of wake-ups, pain-related wake-ups, and how you felt on waking (refreshed or exhausted). Sleep quality directly influences pain treatment choices.' },
    { question: 'I feel like I\'m complaining too much — should I tone it down?', answer: 'Absolutely not. Your doctor needs accurate data to make good decisions. Downplaying symptoms leads to under-treatment. Honest tracking — including good AND bad days — is not complaining. It\'s providing the data your healthcare team needs.' },
    { question: 'Can tracking actually change my treatment?', answer: 'Yes. Tracked patterns reveal things neither you nor your doctor noticed. "I\'m worse on rainy days" might be inflammation. "Pain spikes every Tuesday after physical therapy" might mean the program needs adjustment. "Medication only lasts 3 hours" might warrant dosing changes. Data drives decisions.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'How Doctors Use Pain Diaries', description: 'Understanding the clinical perspective', href: '/resources/how-doctors-use-pain-diaries' },
    { title: 'Pain Diary for Specialist', description: 'Specialist appointment preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'What to Include in Pain Journal', description: 'Complete journal content guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Daily Pain Tracker Printable', description: 'Simple daily format', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Symptom Tracker Printable', description: 'Track symptoms beyond pain', href: '/resources/symptom-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Track Pain for Doctors', url: '/resources/how-to-track-pain-for-doctors' }
  ]
};

export const HowToTrackPainForDoctorsPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={trackingStats} colorScheme="sky" />
    <DoctorVsPatient />
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 7 Things Your Doctor Actually Needs from Your Tracking</h3>
      <p className="text-sm text-slate-500 mb-6">Track these consistently and your 15-minute appointment becomes 10x more productive.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { num: 1, label: 'Pain Level (0-10)', desc: 'Rate at consistent times: morning, afternoon, evening. Patterns matter more than individual numbers.', Icon: Target },
          { num: 2, label: 'Pain Location & Type', desc: 'Where exactly? Burning, aching, stabbing, throbbing? Does it radiate? This narrows differential diagnosis.', Icon: Stethoscope },
          { num: 3, label: 'Triggers & Aggravators', desc: 'What makes it worse? Sitting, standing, weather, stress, specific movements? Triggers guide treatment planning.', Icon: AlertTriangle },
          { num: 4, label: 'Medication Response', desc: 'What did you take, when, and did it help? Pain before dose vs. after. Duration of relief. Side effects.', Icon: ClipboardList },
          { num: 5, label: 'Sleep Quality', desc: 'Hours slept, times woken, time to fall asleep, how you felt on waking. Sleep is clinical gold.', Icon: Clock },
          { num: 6, label: 'Functional Impact', desc: 'What could you do? What couldn\'t you? How far could you walk? How long could you sit? Be specific.', Icon: TrendingUp },
          { num: 7, label: 'Mood & Mental Health', desc: 'Pain affects mood; mood affects pain. Brief daily note. Guides whether adjunct treatments are needed.', Icon: MessageSquare },
        ].map((item) => (
          <div key={item.num} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-700">{item.num}</span>
              <item.Icon className="w-5 h-5 text-sky-600" aria-hidden="true" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{item.label}</h4>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
    <AppointmentPrep />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Your Next Appointment Could Be Different."
      body="Start tracking today. By your next appointment, you'll have 2 weeks of structured data that transforms vague conversations into productive clinical decisions."
      pdfUrl="/resources/pain-diary-template-pdf"
      download={false}
      gradientClasses="from-sky-600 to-blue-600"
      tintClass="text-sky-100"
      buttonTextClass="text-sky-700"
      buttonHoverClass="hover:bg-sky-50"
      primaryLabel="Get Free Templates"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default HowToTrackPainForDoctorsPage;

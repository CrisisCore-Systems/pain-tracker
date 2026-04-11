/**
 * Pain Diary for Doctor Visits – SEO Landing Page
 *
 * Target keyword: "pain diary template for doctor visits"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  Stethoscope, FileText, CheckCircle, Clock,
  TrendingUp, MessageSquare, CalendarDays, ArrowRight,
} from 'lucide-react';
import {
  SEOPageLayout,
  type SEOPageContent,
  StatsBanner,
  BottomCTACallout,
} from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Appointment Summary Builder ──────────────────────────────────────────── */

const AppointmentSummaryGuide: React.FC = () => {
  const sections = [
    {
      title: 'Pain Overview (lead with this)',
      color: 'bg-blue-50 border-blue-200',
      badge: 'Open With',
      badgeColor: 'bg-blue-100 text-blue-700',
      items: [
        'Average pain level this month (e.g., 5.2/10)',
        'Highest pain day and what triggered it',
        'Lowest pain day and what contributed',
        'How this compares to last month',
        'Primary pain location(s)',
      ],
    },
    {
      title: 'Medication & Treatment',
      color: 'bg-emerald-50 border-emerald-200',
      badge: 'Discuss Next',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      items: [
        'Which medications helped, and by how much',
        'Side effects noticed',
        'Anything you stopped taking and why',
        'Treatments tried (physio, ice, rest, etc.)',
        'What time of day medications work best / wear off',
      ],
    },
    {
      title: 'Functional Impact',
      color: 'bg-amber-50 border-amber-200',
      badge: 'Show Evidence',
      badgeColor: 'bg-amber-100 text-amber-700',
      items: [
        'Activities you can no longer do',
        'Activities you modified (how, why)',
        'Work or school missed',
        'Help needed from others',
        'Sleep disruptions caused by pain',
      ],
    },
    {
      title: 'Questions for Your Doctor',
      color: 'bg-purple-50 border-purple-200',
      badge: 'Come Prepared',
      badgeColor: 'bg-purple-100 text-purple-700',
      items: [
        'Write these in advance — memory fails under pressure',
        'Prioritize: ask the most important question first',
        '"Should we adjust [medication]?"',
        '"What does this pattern suggest?"',
        '"Is this normal for my condition?"',
      ],
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Your Doctor Visit Summary Template</h3>
      <p className="text-sm text-slate-500 mb-6">
        Four sections, five minutes to fill in from your diary. Bring this to every appointment.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className={`rounded-xl border p-5 ${s.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm">{s.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>
            <ul className="space-y-1.5">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
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

/* ── Doctor Communication Timeline ───────────────────────────────────────── */

const AppointmentTimeline: React.FC = () => {
  const steps = [
    {
      timing: '2 weeks before',
      icon: CalendarDays,
      color: 'border-slate-300 bg-slate-50',
      title: 'Track consistently',
      desc: 'Two weeks of daily entries provides enough data for your doctor to spot patterns. Pain level, meds, and functional impact — at minimum.',
    },
    {
      timing: '2 days before',
      icon: FileText,
      color: 'border-blue-300 bg-blue-50',
      title: 'Review and summarize',
      desc: 'Spend 5 minutes reading through your diary. Note the averages, outlier days, and anything that stands out. Fill in the summary template.',
    },
    {
      timing: 'Night before',
      icon: MessageSquare,
      color: 'border-purple-300 bg-purple-50',
      title: 'Write your questions',
      desc: 'With your summary in front of you, write 2–3 specific questions for your doctor. "Is this pattern normal?" is better than trying to remember in the office.',
    },
    {
      timing: 'During the appointment',
      icon: Stethoscope,
      color: 'border-emerald-300 bg-emerald-50',
      title: 'Lead with your summary',
      desc: 'Hand your doctor the one-page summary or read the key numbers: average pain, worst days, medication response, and top functional impacts.',
    },
    {
      timing: 'After',
      icon: ArrowRight,
      color: 'border-amber-300 bg-amber-50',
      title: 'Note what was discussed',
      desc: 'Write down any changes recommended, new medications, follow-up tests, or referrals. Add to your diary so the context isn\'t lost.',
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The Doctor Visit Preparation Timeline</h3>
      <p className="text-sm text-slate-500 mb-6">How to turn two weeks of diary entries into a productive appointment.</p>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.timing} className={`flex gap-4 rounded-xl border p-4 ${step.color}`}>
            <div className="flex-shrink-0 mt-0.5">
              <step.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{step.timing}</span>
                <span className="font-bold text-slate-800 text-sm">{step.title}</span>
              </div>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const appointmentStats: StatItem[] = [
  { value: '15 min', label: 'Average appointment length', icon: Clock },
  { value: '2 wk', label: 'Ideal diary data window before visit', icon: CalendarDays },
  { value: '4', label: 'Summary sections your doctor needs', icon: FileText },
  { value: '3×', label: 'Better outcomes with structured tracking', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'pain-diary-for-doctor-visits',
  title: 'Pain Diary for Doctor Visits',
  metaTitle: 'Pain Diary Template for Doctor Visits: What to Track, How to Summarize, and What to Bring',
  metaDescription: 'A printable pain diary template built for doctor appointments. Track what matters in the two weeks before your visit, then condense it into a one-page summary your GP or specialist can actually use.',
  keywords: [
    'pain diary for doctor visits', 'pain diary template for doctor',
    'pain journal for doctor appointment', 'pain tracker for gp visit',
    'what to bring to pain appointment', 'pain diary appointment summary',
    'how to track pain for doctor', 'pain log for doctor visit',
    'chronic pain appointment tracker', 'pain diary for specialist',
    'pain summary for appointment', 'doctor appointment pain journal',
    'pain tracking for medical appointment', 'pain record for gp',
  ],
  badge: 'Appointment Prep',
  headline: 'Pain Diary Template for Doctor Visits',
  subheadline: 'Most pain appointments are 15 minutes. If you arrive with two weeks of unorganized entries, nothing useful gets discussed. This diary template is designed to produce one thing: a one-page summary your doctor can read in 60 seconds and respond to.',
  primaryCTA: { text: 'Download the PDF template', href: '/assets/pain-diary-for-doctor-visits.pdf', download: true },
  secondaryCTA: { text: 'Use the app instead', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/pain-diary-for-doctor-visits.pdf', downloadFileName: 'pain-diary-for-doctor-visits.pdf' },
  whatIsThis: 'A two-part printable: a daily tracking page to fill in during the two weeks before your appointment, and a one-page appointment summary to complete the night before. The daily page captures pain levels, medications, sleep, and functional impact in under 3 minutes. The summary page condenses that data into the four things your doctor actually needs: pain overview, medication response, functional impact, and your questions. Designed for GP visits, specialist appointments, and follow-up consultations.',
  whoShouldUse: [
    'Anyone with a pain management appointment coming up',
    'Patients who feel their doctor doesn\'t fully understand how much they\'re struggling',
    'People who forget what they wanted to say once they\'re in the exam room',
    'Anyone whose doctor has asked them to "keep track" before the next visit',
    'Patients starting a new medication and tracking whether it\'s working',
    'People preparing for a specialist referral with supporting documentation',
    'Anyone who wants to make their limited appointment time more effective',
    'Patients who feel dismissed and want data to support their experience',
  ],
  howToUse: [
    { step: 1, title: 'Start tracking 2 weeks before your appointment', description: 'Use the daily tracking page each day. Minimum: pain level (0-10), medications taken, and one note about what you could or couldn\'t do. 2–3 minutes per day.' },
    { step: 2, title: 'Mark your worst and best days', description: 'Circle or flag the days that stand out. Your doctor needs to know your range, not just your average.' },
    { step: 3, title: 'Complete the summary the night before', description: 'With your diary in front of you, fill in the one-page summary template. Calculate your average pain, list medication observations, note the functional impacts you want to discuss, and write your top questions.' },
    { step: 4, title: 'Lead with the summary in your appointment', description: 'Hand it to your doctor or tell them: "I tracked for 2 weeks. My average pain was X/10. Here\'s what helped and here\'s what I couldn\'t do." This grounds the conversation immediately.' },
    { step: 5, title: 'Record what was discussed', description: 'After the appointment, note any medication changes, referrals, or tests. Keep this with your diary so you can track whether the recommendations worked.' },
  ],
  whyItMatters: 'Doctors make clinical decisions based on what they hear in an appointment. If you can\'t communicate your pain clearly because you\'re in a stressful environment or you simply can\'t remember last Tuesday\'s worst moment, your doctor works from an incomplete picture. Structured diary data turns your subjective experience into objective evidence: not "I\'ve been in a lot of pain" but "my average was 6.2/10, I missed work 3 days, and my medication wore off within 4 hours." That is actionable information.',
  trustSignals: {
    medicalNote: 'Template structure reflects the data points most commonly requested in pain clinic intake assessments: NRS scores, medication response, and ADL impact.',
    privacyNote: 'This is a printable template — no data is collected from you. What you write stays with you.',
    legalNote: 'Structured appointment records can support treatment authorization requests, specialist referrals, and documentation for disability or WorkSafeBC claims.',
  },
  faqs: [
    { question: 'My appointment is tomorrow. Is it too late to start?', answer: 'Not entirely. Even one day of structured tracking is better than nothing. Complete what you can for today and fill in the appointment summary with what you remember from recent weeks. Note that your recall data is approximate — that\'s still more structured than starting from scratch.' },
    { question: 'Will my doctor actually use what I bring?', answer: 'Most will, especially if you lead with a concise summary rather than a stack of pages. Summarize verbally first: "I tracked for 2 weeks — my average pain was [X], and the biggest issue was [Y]." Then offer the sheet if they want details. Don\'t hand over raw diary pages without a summary.' },
    { question: 'What if I see multiple doctors?', answer: 'Keep one ongoing diary and create a fresh summary for each specialist with relevant context. Your GP summary focuses on overall management; your rheumatologist summary might focus on joint-specific symptoms; your neurologist summary might focus on pain character and nerve symptoms.' },
    { question: 'How much detail do I need in daily entries?', answer: 'For appointment preparation, you need: pain level (0-10), medications taken and when, and one sentence about functional impact. Sleep quality is also useful. That\'s a 2-minute entry. More detail is better; less detail is still valuable.' },
    { question: 'Should I track symptoms other than pain?', answer: 'Yes, if they\'re relevant to your appointment. Fatigue, nausea, brain fog, dizziness — whatever you\'re experiencing and want to discuss. Keep the appointment summary focused on what you most need addressed this visit.' },
    { question: 'How do I track medication effectiveness?', answer: 'Record the medication name, dose, and time taken. Then note pain level 30–60 minutes later (or whenever it typically kicks in) and when it wears off. "Ibuprofen 400mg at 10am — pain dropped from 7 to 4 by 11am, wore off by 2pm" is a complete medication response note.' },
    { question: 'My pain changes throughout the day. How do I record one number?', answer: 'Track at consistent times: morning (before medication), afternoon, and evening. Note the range: "Morning: 7, afternoon: 4 (after meds), evening: 6." Your doctor needs to know both your baseline and your treated level.' },
    { question: 'What if I feel embarrassed showing this to my doctor?', answer: 'Structured data reduces the vulnerability of talking about pain. You\'re not making a complaint — you\'re presenting evidence. The diary makes the conversation clinical rather than personal, which usually makes it easier.' },
  ],
  relatedLinks: [
    { title: 'What to Include in a Pain Journal', description: 'Full guide to pain journal content', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'How to Track Pain for Doctors', description: 'Doctor-specific tracking guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Specialist-focused diary', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'How Doctors Use Pain Diaries', description: 'What clinicians look for', href: '/resources/how-doctors-use-pain-diaries' },
    { title: 'Pain Diary Template PDF', description: 'Full diary template', href: '/resources/pain-diary-template-pdf' },
    { title: 'Weekly Pain Log PDF', description: 'Week-at-a-glance summary', href: '/resources/weekly-pain-log-pdf' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Doctor Visits', url: '/resources/pain-diary-for-doctor-visits' },
  ],
};

export const PainDiaryForDoctorVisitsPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={appointmentStats} colorScheme="blue" />
    <AppointmentSummaryGuide />
    <AppointmentTimeline />
    <BottomCTACallout
      icon={Stethoscope}
      heading="Your Next Appointment Can Be Different."
      body="Fifteen minutes with your doctor becomes much more useful when you arrive with two weeks of structured data and a one-page summary. Download the template and start tracking today."
      pdfUrl="/assets/pain-diary-for-doctor-visits.pdf"
      gradientClasses="from-blue-600 to-cyan-600"
      tintClass="text-blue-100"
      buttonTextClass="text-blue-700"
      buttonHoverClass="hover:bg-blue-50"
      primaryLabel="Download Template"
      secondaryLabel="Try Digital Tracking"
    />
  </SEOPageLayout>
);

export default PainDiaryForDoctorVisitsPage;

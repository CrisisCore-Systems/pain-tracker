/**
 * 7-Day Pain Diary Template – SEO Landing Page (Enhanced)
 *
 * Target keyword: "7 day pain diary template"
 * Tier 1 – Immediate Survival Traffic
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Clock, Calendar,
  TrendingUp, FileText, Target, Stethoscope,
  ClipboardList, Zap, Sun, Moon
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout, PdfContentsPreview } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** 7-day at-a-glance preview */
const WeekAtAGlance: React.FC = () => {
  const days = [
    { day: 'Mon', pain: 5, note: 'Morning stiffness, ↓ by afternoon', color: 'bg-amber-300' },
    { day: 'Tue', pain: 4, note: 'Better after walk, slept well', color: 'bg-yellow-300' },
    { day: 'Wed', pain: 6, note: 'Weather change, increased ache', color: 'bg-orange-300' },
    { day: 'Thu', pain: 7, note: 'Flare — couldn\'t finish work', color: 'bg-orange-400' },
    { day: 'Fri', pain: 5, note: 'Recovery day, rested, meds helped', color: 'bg-amber-300' },
    { day: 'Sat', pain: 3, note: 'Best day this week', color: 'bg-green-300' },
    { day: 'Sun', pain: 4, note: 'Stable, light activity okay', color: 'bg-yellow-300' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 md:p-8 border border-teal-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What a Completed Week Looks Like</h3>
      <p className="text-sm text-slate-500 mb-6">This is what 7 days of tracking produces — a clear snapshot your doctor can read in 60 seconds.</p>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d) => (
          <div key={d.day} className="text-center">
            <div className="text-xs font-bold text-slate-600 mb-1">{d.day}</div>
            <div className={`${d.color} rounded-lg py-3 mb-1`}>
              <span className="text-lg font-bold text-slate-800">{d.pain}</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight hidden sm:block">{d.note}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-white rounded-lg border border-teal-200 text-sm text-slate-600">
        <span className="font-semibold text-teal-700">Week summary:</span> Average 4.9/10 • 1 flare day (Thu) • Trigger: weather change • Best: Saturday after rest day • Treatment response: meds helped recovery
      </div>
    </div>
  );
};

/** Why 7 days is the perfect tracking window */
const WhySevenDays: React.FC = () => {
  const reasons = [
    { icon: Stethoscope, title: 'Pre-Appointment Data', desc: 'Most specialist appointments are booked 1-4 weeks out. Start tracking now — arrive with a completed diary that covers one full cycle of your life.', color: 'text-teal-600' },
    { icon: Target, title: 'Low Commitment Trial', desc: 'Not sure if tracking will help? Seven days is enough to see patterns without burning out. If it\'s useful, keep going. If not, you\'ve only invested a week.', color: 'text-cyan-600' },
    { icon: Clock, title: 'Captures a Full Cycle', desc: 'One week includes workdays, weekends, activity variation, and sleep differences. It\'s the minimum window that shows your pain in context.', color: 'text-blue-600' },
    { icon: TrendingUp, title: 'Medication Trial Evidence', desc: 'Starting a new medication? A 7-day diary with baseline (days 1-2) and treatment (days 3-7) gives concrete before/after data your doctor can evaluate.', color: 'text-indigo-600' },
  ];
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {reasons.map((r) => (
        <div key={r.title} className="rounded-xl border border-slate-200 bg-white p-5">
          <r.icon className={`w-6 h-6 mb-3 ${r.color}`} aria-hidden="true" />
          <h4 className="font-bold text-slate-800 mb-1">{r.title}</h4>
          <p className="text-sm text-slate-600">{r.desc}</p>
        </div>
      ))}
    </div>
  );
};

/** Daily tracking guide — what to capture each day */
const DailyTrackingGuide: React.FC = () => {
  const timeSlots = [
    { time: 'Morning', icon: Sun, items: ['Pain level upon waking (0-10)', 'Stiffness duration', 'Sleep quality last night (1-5)', 'Medications taken'], color: 'bg-amber-50 border-amber-200' },
    { time: 'Midday', icon: Clock, items: ['Current pain level', 'Activities completed or skipped', 'Energy level', 'Any new symptoms'], color: 'bg-sky-50 border-sky-200' },
    { time: 'Evening', icon: Moon, items: ['Pain level now', 'Best/worst moment today', 'Total medications for the day', 'One sentence: how today went'], color: 'bg-indigo-50 border-indigo-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What to Track Each Day (Takes 3 Minutes)</h3>
      <p className="text-sm text-slate-500 mb-6">Three brief check-ins capture how your pain changes throughout the day — one of the most diagnostically useful patterns.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeSlots.map((t) => (
          <div key={t.time} className={`rounded-xl border p-5 ${t.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <t.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800">{t.time}</h4>
            </div>
            <ul className="space-y-1.5">
              {t.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
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

const sevenDayPdfPages: PdfPage[] = [
  { page: 1, title: 'Daily Tracking Pages (Days 1-3)', desc: 'Morning/midday/evening entries, pain levels, medications, symptoms' },
  { page: 2, title: 'Daily Tracking Pages (Days 4-7)', desc: 'Same structured format covering the rest of the week' },
  { page: 3, title: 'Symptom & Trigger Log', desc: 'Daily symptom checklist with potential trigger identification' },
  { page: 4, title: 'Medication & Treatment Log', desc: 'What you took, dosage, timing, and effectiveness rating' },
  { page: 5, title: 'Week Summary', desc: 'Average pain, best/worst days, patterns noticed, treatment observations' },
  { page: 6, title: 'Doctor Appointment Prep', desc: 'One-page summary with key findings and questions for your provider' },
];

const sevenDayStats: StatItem[] = [
  { value: '7 days', label: 'One complete tracking cycle', icon: Calendar },
  { value: '3 min', label: 'Daily time commitment', icon: Clock },
  { value: '6 pg', label: 'Professional diary template', icon: FileText },
  { value: '21', label: 'Data points per week', icon: ClipboardList },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: '7-day-pain-diary-template',
  title: '7-Day Pain Diary Template (Free)',
  metaTitle: '7-Day Pain Diary Template — Free One-Week Pain Tracker for Doctor Appointments | Pain Tracker Pro',
  metaDescription: 'Download a free 7-day pain diary template. One-week format with morning/midday/evening tracking, medication logs, and a doctor-ready weekly summary.',
  keywords: [
    '7 day pain diary template', 'week pain diary',
    'seven day pain tracker', 'one week pain log',
    '7 day symptom diary', 'weekly pain diary template',
    'pain tracking one week', 'pain diary for doctor',
    'short term pain diary', 'weekly pain tracker printable',
    'pain log for appointment', 'one week pain tracker',
    'pain diary before doctor visit', 'seven day symptom log'
  ],
  badge: 'Free Download',
  headline: '7-Day Pain Diary Template',
  subheadline: 'One week is enough to see patterns, prepare for a doctor appointment, or test whether tracking works for you. This 6-page diary captures morning, midday, and evening pain levels plus medications, triggers, and a doctor-ready weekly summary — all in about 3 minutes per day.',
  primaryCTA: { text: 'Download Free PDF', href: '/assets/7-day-pain-diary.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/7-day-pain-diary.pdf', downloadFileName: '7-day-pain-diary.pdf' },
  whatIsThis: 'A 6-page, 7-day pain diary designed to capture one complete week of pain data with three daily check-ins (morning, midday, evening). It includes symptom and trigger tracking, medication/treatment logs, a weekly summary that identifies patterns, and a doctor appointment prep page that turns your week of data into a concise clinical summary. It\'s the ideal format for pre-appointment tracking, medication trials, or anyone who wants to try pain tracking without a long-term commitment.',
  whoShouldUse: [
    'Anyone with a doctor appointment coming up in the next 1-4 weeks',
    'People starting a new medication or treatment who want before/after data',
    'First-time pain trackers who want to try it for a week before committing',
    'Patients who\'ve been told "keep a pain diary" and need a structured format',
    'People tracking pain for a specific event (e.g., post-surgery recovery week)',
    'Anyone who needs a quick, structured snapshot of their pain pattern',
    'Students or professionals managing pain around a demanding schedule',
    'People who find long-term tracking overwhelming but can do one week'
  ],
  howToUse: [
    { step: 1, title: 'Pick your start day (Monday is best)', description: 'Starting on Monday captures both workdays and weekends, giving the most complete picture of how your pain varies across different parts of your week.' },
    { step: 2, title: 'Morning check-in: pain level + stiffness + sleep', description: 'Within 30 minutes of waking, rate your pain (0-10), note morning stiffness duration, and rate last night\'s sleep. This takes 60 seconds.' },
    { step: 3, title: 'Midday check-in: activity impact + energy', description: 'Around lunch, rate current pain, note what you\'ve done or couldn\'t do, and check your energy level. This reveals the activity-pain relationship.' },
    { step: 4, title: 'Evening check-in: summary + meds + one sentence', description: 'Before bed, rate your pain, log all medications taken today, note the best/worst moment, and write one sentence about how today went.' },
    { step: 5, title: 'Day 7: Complete the weekly summary + appointment prep', description: 'After 7 days, fill out the weekly summary page: average pain, patterns noticed, treatment observations. Then complete the appointment prep page to bring to your doctor.' }
  ],
  whyItMatters: 'Doctors get 10-15 minutes with you. When you arrive with "I\'ve been in pain" versus "Here\'s my 7-day diary showing average 5.2/10 pain with morning peaks of 7, improving to 3 by afternoon, with 2 days where I couldn\'t complete work" — you get a completely different quality of care. Seven days is the minimum meaningful tracking window: it captures workday vs weekend patterns, shows how your pain changes through the day, and reveals whether treatments are working. Most importantly, it replaces "I think maybe my pain is…" with documented evidence.',
  trustSignals: {
    medicalNote: 'Template uses the NRS (0-10) pain rating standard and captures data points physicians need for clinical assessment: temporal patterns, functional impact, and treatment response.',
    privacyNote: 'Your pain data stays completely private on your device until you choose to share it with a healthcare provider.',
    legalNote: 'Even a single week of structured pain documentation provides supporting evidence for referrals, treatment authorizations, and work accommodation requests.'
  },
  faqs: [
    { question: 'Is one week really enough to show meaningful patterns?', answer: 'Yes — for specific patterns like morning vs evening pain, weekday vs weekend variation, and treatment response. For longer-term patterns (monthly cycles, seasonal changes), you\'ll need our chronic pain diary template. But one week is a powerful start.' },
    { question: 'Can I start mid-week?', answer: 'Yes, but try to capture both workdays and days off. A Monday-Sunday week gives the most complete picture. If you start Thursday, consider extending to the following Wednesday.' },
    { question: 'What if I forget a check-in?', answer: 'Fill it in from memory as soon as possible — same-day recall is usually reliable. If you miss a full day, note it as "missed" and continue. Six days of data is still far better than none.' },
    { question: 'Three times a day seems like a lot. Can I do once a day?', answer: 'You can, but you\'ll miss the daily variation pattern (morning stiffness? afternoon crashes?), which is one of the most diagnostically useful things about this format. Even just a quick number rating at each time slot helps.' },
    { question: 'Should I track on good days too?', answer: 'Especially on good days! Your doctor needs to see the range. A week showing 3-7/10 variation tells a different story than constant 6/10. Good days are evidence that certain conditions or activities help.' },
    { question: 'My doctor didn\'t ask for a pain diary. Should I bring one anyway?', answer: 'Absolutely. Most doctors appreciate patients who come prepared with data. Start with: "I tracked my pain for a week — here\'s what I found." Then share the summary page. It elevates the conversation immediately.' },
    { question: 'What if my week isn\'t "typical"?', answer: 'Note it in the summary ("this was a particularly bad/good/stressful week because [reason]"). An atypical week still has useful data. And you can always do another week later for comparison.' },
    { question: 'Can I use this for a child\'s pain?', answer: 'Yes — parents can fill in the tracking for younger children. For teens, the format is straightforward enough to use independently. Adjust the functional impact items to be age-appropriate.' },
    { question: 'Where in the template should I note medications?', answer: 'The medication/treatment log page tracks all medications, dosages, timing, and effectiveness for each day of the week. There\'s also space in the daily tracking for quick medication notes.' },
    { question: 'Does this template work for multiple pain locations?', answer: 'Yes. In each daily entry, note your primary pain location and level. If you have multiple pain sites, track the top 2-3 and note which one the rating refers to. The symptom log has space for multiple locations.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking format', href: '/resources/pain-diary-template-pdf' },
    { title: 'Chronic Pain Diary', description: 'For long-term tracking beyond 7 days', href: '/resources/chronic-pain-diary-template' },
    { title: 'Pain Diary for Specialist', description: 'Specialist appointment preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'How to Track Pain for Doctors', description: 'Communication guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Weekly Pain Log PDF', description: 'Premium weekly tracking format', href: '/resources/weekly-pain-log-pdf' },
    { title: 'Printable Pain Log Sheet', description: 'Simple daily tracking format', href: '/resources/printable-pain-log-sheet' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: '7-Day Pain Diary Template', url: '/resources/7-day-pain-diary-template' }
  ]
};

export const SevenDayPainDiaryTemplatePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={sevenDayStats} colorScheme="teal" />
    <WhySevenDays />
    <WeekAtAGlance />
    <DailyTrackingGuide />
    <PdfContentsPreview pages={sevenDayPdfPages} accentColor="teal" variant="badge" heading="Inside Your 6-Page 7-Day Diary" />
    <BottomCTACallout
      icon={Zap}
      heading="One Week. Three Minutes a Day. Real Evidence for Your Doctor."
      body="You don't need months of data to make a difference in your next appointment. Seven days of structured tracking produces more useful information than years of 'I've been in pain for a while.'"
      pdfUrl="/assets/7-day-pain-diary.pdf"
      gradientClasses="from-teal-600 to-cyan-600"
      tintClass="text-teal-100"
      buttonTextClass="text-teal-700"
      buttonHoverClass="hover:bg-teal-50"
      primaryLabel="Download 7-Day Diary"
      secondaryLabel="Try Digital Tracking"
    />
  </SEOPageLayout>
);

export default SevenDayPainDiaryTemplatePage;

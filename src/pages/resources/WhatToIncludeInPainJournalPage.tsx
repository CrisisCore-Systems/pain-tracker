/**
 * What to Include in a Pain Journal – SEO Landing Page (Enhanced)
 *
 * Target keyword: "what to include in pain journal"
 * Tier 2 – Medical / Appointment Preparation
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Clock, TrendingUp,
  FileText, Activity, Pill, Brain, CloudRain,
  MonitorSmartphone, Utensils, Moon
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Complete journal content map */
const JournalContentMap: React.FC = () => {
  const categories = [
    { icon: Activity, label: 'Pain Details', items: ['Level (0-10) at 3+ times daily', 'Location (mark body areas)', 'Type (burning, aching, stabbing, throbbing)', 'Duration (constant vs episodes)', 'Radiation (does it spread?)'], priority: 'Essential', color: 'bg-red-50 border-red-200' },
    { icon: Pill, label: 'Medications & Treatment', items: ['What you took + exact time', 'Dose and form (tablet, cream, injection)', 'Pain before and after (with times)', 'Side effects experienced', 'Missed doses + reason'], priority: 'Essential', color: 'bg-blue-50 border-blue-200' },
    { icon: TrendingUp, label: 'Functional Impact', items: ['Activities attempted', 'Activities completed vs abandoned', 'Modifications needed (sat instead of stood)', 'Help received from others', 'Work/school missed'], priority: 'Essential', color: 'bg-emerald-50 border-emerald-200' },
    { icon: Moon, label: 'Sleep Quality', items: ['Bedtime + wake time', 'Time to fall asleep', 'Night wakings (how many, pain-related?)', 'Total hours slept', 'Morning fatigue level'], priority: 'Important', color: 'bg-indigo-50 border-indigo-200' },
    { icon: Brain, label: 'Mood & Mental Health', items: ['Overall mood (1-5 scale)', 'Anxiety level', 'Frustration / hopelessness', 'Social isolation', 'Coping strategies used'], priority: 'Important', color: 'bg-purple-50 border-purple-200' },
    { icon: CloudRain, label: 'Triggers & Environment', items: ['Weather / barometric pressure', 'Physical activities before pain changed', 'Stress events', 'Body position (sitting, standing, lying)', 'Foods or drinks'], priority: 'Helpful', color: 'bg-amber-50 border-amber-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The Complete Pain Journal Content Guide</h3>
      <p className="text-sm text-slate-500 mb-6">6 categories, prioritized. Track the top 3 always. Add the others when you can.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <c.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
                <h4 className="font-bold text-slate-800 text-sm">{c.label}</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.priority === 'Essential' ? 'bg-red-100 text-red-700' : c.priority === 'Important' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{c.priority}</span>
            </div>
            <ul className="space-y-1.5">
              {c.items.map((item) => (
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

/** Time vs detail trade-off */
const TimeCommitmentGuide: React.FC = () => {
  const levels = [
    { time: '1 minute', what: 'Quick check: pain level, medication, sleep hours', when: 'Bad days when even thinking hurts', quality: 'bg-slate-100 border-slate-200', bar: 'w-1/5' },
    { time: '2-3 minutes', what: 'Standard: pain + location + meds + activities + sleep', when: 'Most days — the sweet spot for consistency', quality: 'bg-emerald-100 border-emerald-200', bar: 'w-3/5' },
    { time: '5 minutes', what: 'Detailed: everything above + triggers + mood + notes', when: 'Good days, pre-appointment days, flare documentation', quality: 'bg-blue-100 border-blue-200', bar: 'w-4/5' },
    { time: '10+ minutes', what: 'Comprehensive: full journal entry with narrative', when: 'Weekly summaries, significant changes, setbacks', quality: 'bg-purple-100 border-purple-200', bar: 'w-full' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 text-white">
      <h3 className="text-lg font-bold mb-2">The Time-Detail Trade-Off: Match Your Entry to Your Day</h3>
      <p className="text-sm text-slate-300 mb-6">You don't need to write War and Peace every day. Here's how much time each journaling level takes.</p>
      <div className="space-y-4">
        {levels.map((l) => (
          <div key={l.time} className="bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-300" aria-hidden="true" />
                <span className="font-bold text-white text-sm">{l.time}</span>
              </div>
              <span className="text-xs text-slate-400">{l.when}</span>
            </div>
            <p className="text-sm text-slate-200 mb-2">{l.what}</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className={`bg-emerald-400 rounded-full h-2 ${l.bar}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Sample journal entry */
const SampleEntry: React.FC = () => (
  <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
    <h3 className="text-xl font-bold text-slate-800 mb-2">Sample Journal Entry (The 3-Minute Version)</h3>
    <p className="text-sm text-slate-500 mb-4">This is what a "good enough" daily entry looks like. Not perfect, not complete, but clinically useful.</p>
    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 font-mono text-sm text-slate-700">
      <p className="font-bold text-slate-800 mb-2">Tuesday, March 11</p>
      <p><strong>Pain:</strong> Morning: 7/10 (lower back, aching). Afternoon: 5/10 after ibuprofen. Evening: 6/10.</p>
      <p><strong>Meds:</strong> Ibuprofen 400mg at 10am. Helped 2 points for ~3 hours.</p>
      <p><strong>Sleep:</strong> 5 hours, woke 2x from pain. Took 30 min to fall asleep.</p>
      <p><strong>Activity:</strong> Walked 10 min (okay). Tried loading dishwasher — had to stop, back spasm. Sat rest of day.</p>
      <p><strong>Mood:</strong> Frustrated — cancelled lunch with friend.</p>
    </div>
    <p className="text-xs text-slate-400 mt-3">Total time: ~3 minutes. Contains: pain levels (3 times), medication response, sleep data, functional limitations, and mood. Everything a doctor needs.</p>
  </div>
);

const journalStats: StatItem[] = [
  { value: '6', label: 'Content categories to track', icon: FileText },
  { value: '3', label: 'Essential categories (minimum)', icon: CheckCircle },
  { value: '2-3 min', label: 'Time for a good daily entry', icon: Clock },
  { value: '30+', label: 'Specific data points covered', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'what-to-include-in-pain-journal',
  title: 'What to Include in a Pain Journal',
  metaTitle: 'What to Include in a Pain Journal — Complete Content Guide | Pain Tracker Pro',
  metaDescription: 'Complete guide to what to include in a pain journal: 6 content categories, time-detail trade-offs, sample entries, and printable templates. Track the right things the right way.',
  keywords: [
    'what to include in pain journal', 'pain journal content guide',
    'pain diary what to write', 'pain journal template content',
    'how to keep a pain journal', 'pain journal categories',
    'pain tracking what to record', 'pain diary essentials',
    'pain journal tips', 'chronic pain journal guide',
    'pain journal for beginners', 'pain journal checklist',
    'what to write in pain diary', 'pain journal best practices'
  ],
  badge: 'Guide',
  headline: 'What to Include in a Pain Journal',
  subheadline: 'You don\'t need to track everything. You need to track the RIGHT things. Here\'s exactly what to include, organized by priority, with time estimates and sample entries — so your journal is clinically useful without being overwhelming.',
  primaryCTA: { text: 'Get Free Journal Templates', href: '/resources/pain-diary-template-pdf' },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/pain-journal-checklist.pdf', downloadFileName: 'pain-journal-checklist.pdf' },
  whatIsThis: 'A complete guide to what belongs in a pain journal — and what doesn\'t. Most people either track too little (just pain numbers) or try to track everything (and quit after 3 days). This guide organizes pain journal content into 6 prioritized categories: 3 essential ones you should always track, and 3 additional ones for when you have time. It includes sample entries at different time commitments (1 minute, 3 minutes, 5 minutes) so you can match your journaling to your day.',
  whoShouldUse: [
    'Anyone starting a pain journal for the first time',
    'People who\'ve tried journaling before but found it overwhelming or quit',
    'Patients told by their doctor to "start tracking your pain"',
    'People who want to make their existing journal more useful for appointments',
    'Anyone unsure whether they\'re tracking the right things',
    'Students or new patients learning about chronic pain self-management',
    'Healthcare providers recommending pain journals to patients',
    'People who want a quick reference guide for daily journaling'
  ],
  howToUse: [
    { step: 1, title: 'Start with the 3 essential categories only', description: 'Pain details, medications/treatment, and functional impact. These three provide 80% of the clinical value. Don\'t try to track everything on day one — that\'s how people quit.' },
    { step: 2, title: 'Match your entry length to your day', description: 'Bad day? 1-minute quick check is enough. Normal day? 2-3 minute standard entry. Good day with energy? Add details. The guide shows what to include at each time level.' },
    { step: 3, title: 'Add sleep and mood when you can', description: 'Once tracking the essentials feels natural (usually week 2-3), add sleep quality and mood. These two categories reveal patterns that drive treatment decisions for many chronic pain conditions.' },
    { step: 4, title: 'Track triggers during flares', description: 'When pain spikes, note what happened before: weather, activity, stress, food, position. You don\'t need to track triggers every day — just when something notable changes. Over time, patterns emerge.' },
    { step: 5, title: 'Use the checklist before appointments', description: 'Download the printable checklist PDF. Before each appointment, review 2 weeks of entries and mark which categories you have good data for. This tells you (and your doctor) where the gaps are.' }
  ],
  whyItMatters: 'The difference between a useful pain journal and a abandoned one is knowing what to include. Over-tracking leads to burnout (tracking 20 things daily is unsustainable). Under-tracking leads to useless data ("pain: bad" doesn\'t help anyone). This guide hits the sweet spot: enough data to be clinically useful, structured enough to be quick, and flexible enough to adapt to your worst days.',
  trustSignals: {
    medicalNote: 'Content categories align with collaborative pain assessment tools recommended in clinical pain management guidelines.',
    privacyNote: 'This is a content guide — no data collection involved. Any tracking you do stays on your device.',
    legalNote: 'A well-structured pain journal supports disability claims, treatment authorization, and medical-legal documentation.'
  },
  faqs: [
    { question: 'What\'s the absolute minimum I should track?', answer: 'If you can only track one thing: pain level at the same time daily. If two things: add medication response. If three: add what you could/couldn\'t do. These three data points, tracked consistently, provide more clinical value than sporadic detailed entries.' },
    { question: 'Should I use paper or digital?', answer: 'Whichever you\'ll actually use daily. Paper is always available and requires no learning curve. Digital offers reminders, summaries, and graphs. Many people do best with digital tracking daily and printing summaries for appointments.' },
    { question: 'How detailed should each entry be?', answer: 'Match detail to your day: 1 minute on bad days (just numbers), 2-3 minutes normally (our recommended sweet spot), 5+ minutes when you have energy. Consistency beats detail — brief daily entries are more useful than detailed weekly ones.' },
    { question: 'Should I rate pain at set times or whenever it changes?', answer: 'Set times: morning, afternoon, evening. This creates comparable data points. ALSO note when pain spikes or drops significantly between times. The combination gives the best picture.' },
    { question: 'What if I miss a day?', answer: 'Skip it. Don\'t backfill — invented data hurts more than gaps. If you miss frequently, simplify your entries (1-minute quick checks). A gap with a note "too much pain to write" is honest and valid.' },
    { question: 'Is it useful to track food?', answer: 'For some conditions, yes: migraines, fibromyalgia, and IBS-related pain have dietary triggers. For most chronic pain, food tracking is lower priority. Start with the 3 essentials and add food only if you suspect dietary triggers.' },
    { question: 'How do I track "functional impact" simply?', answer: 'Each evening, answer: "What did I do today? What couldn\'t I do?" Even one sentence: "Made breakfast, couldn\'t vacuum, sat most of afternoon" captures functional impact. Specific activities > vague descriptions.' },
    { question: 'Should I track my good days too?', answer: 'Absolutely. Good days are data too. They show your range (which is diagnostically useful), prove honesty (which supports credibility), and help identify what HELPS (which guides treatment). Only tracking bad days skews the picture.' },
    { question: 'What about tracking weather?', answer: 'Note weather when pain changes significantly — you don\'t need to log it daily. "Pain worse — raining and cold" over 10 entries reveals a weather pattern. Our digital version correlates weather data automatically.' },
    { question: 'How long until my journal is useful?', answer: '1-2 weeks shows medication response patterns. 4 weeks reveals weekly cycles and trigger patterns. 3+ months shows seasonal patterns and long-term treatment effectiveness. Start now — every week of data adds value.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Pre-structured daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'How to Track Pain for Doctors', description: 'What specifically your doctor needs', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Symptom Tracker Printable', description: 'Track symptoms beyond just pain', href: '/resources/symptom-tracker-printable' },
    { title: 'Weekly Pain Log PDF', description: 'See weekly patterns', href: '/resources/weekly-pain-log-pdf' },
    { title: 'Pain Diary for Specialist', description: 'Specialist appointment preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'How Doctors Use Pain Diaries', description: 'Clinical perspective on your data', href: '/resources/how-doctors-use-pain-diaries' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'What to Include in Pain Journal', url: '/resources/what-to-include-in-pain-journal' }
  ]
};

export const WhatToIncludeInPainJournalPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={journalStats} colorScheme="amber" />
    <JournalContentMap />
    <TimeCommitmentGuide />
    <SampleEntry />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Now You Know What to Track — All That's Missing Is Starting."
      body="Download the checklist PDF for a quick reference, print a journal template, or start digital tracking. Two to three minutes a day is all it takes."
      pdfUrl="/assets/pain-journal-checklist.pdf"
      gradientClasses="from-amber-600 to-orange-600"
      tintClass="text-amber-100"
      buttonTextClass="text-amber-700"
      buttonHoverClass="hover:bg-amber-50"
      primaryLabel="Download Checklist"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default WhatToIncludeInPainJournalPage;

/**
 * Pain Journal Examples – SEO Landing Page
 *
 * Target keyword: "pain journal examples"
 * Tier 2 – Journaling / Learning Intent
 */

import React from 'react';
import {
  FileText, MessageSquare, CheckCircle, TrendingUp,
  Clock, Activity, Brain, Pill,
} from 'lucide-react';
import {
  SEOPageLayout,
  type SEOPageContent,
  StatsBanner,
  BottomCTACallout,
} from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Sample Entries at Different Levels ────────────────────────────────────── */

const SampleEntries: React.FC = () => {
  const entries = [
    {
      label: 'Minimal Entry (1 min)',
      badge: 'For worst days',
      badgeBg: 'bg-slate-100 text-slate-600',
      bg: 'bg-slate-50 border-slate-200',
      text: [
        'Date: Thursday, March 13',
        'Pain: 8/10',
        'Meds: Naproxen 500mg — 9am',
        'Energy: very low',
      ],
      note: 'Total time: under 1 minute. Useful data: pain severity, medication taken. Not glamorous, but this entry has clinical value when part of a trend.',
    },
    {
      label: 'Standard Entry (3 min)',
      badge: 'Recommended daily format',
      badgeBg: 'bg-blue-100 text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      text: [
        'Date: Thursday, March 13',
        'Morning pain: 6/10 (lower back, aching). After ibuprofen: 4/10 by 11am, wore off by 3pm.',
        'Evening pain: 7/10. Tried heat — maybe helped 1 point.',
        'Sleep last night: 5 hrs, woke twice from pain.',
        'Today: Made breakfast (okay). Couldn\'t do grocery run — back spasm after 10 min standing. Sat most of the day. Missed remote work call.',
        'Mood: Frustrated.',
      ],
      note: 'Time: ~3 minutes. Contains: pain levels at two times, medication response, sleep quality, specific functional impacts, and mood. Complete enough for meaningful clinical review.',
    },
    {
      label: 'Detailed Flare Entry (7 min)',
      badge: 'For significant days',
      badgeBg: 'bg-red-100 text-red-700',
      bg: 'bg-red-50 border-red-200',
      text: [
        'Date: Sunday, March 17 — FLARE DAY',
        'Flare started: woke at 4am at 9/10 pain, lower back radiating to left hip and thigh.',
        'Before the flare: Walked ~2km Saturday. Slept 4 hrs Friday night. Weather dropped 8°C overnight.',
        'Medications: Naproxen 500mg at 4:30am — reduced to 7/10 by 6am. Second dose at 1pm — minimal effect. Used heating pad continuously.',
        'Function: Did not get out of bed until 11am. Needed help getting dressed. Could not prepare own food. Called in sick Monday.',
        'Sleep: Tried to rest all day. Total maybe 3 hrs broken.',
        'Evening: Still 7/10 at 9pm. Notes: this flare matches the pattern from February — preceded by a longer walk and poor sleep. Weather drop may also be a trigger.',
      ],
      note: 'Time: 5–7 minutes. This level of detail is worth it on a significant day. Captures: flare onset, potential triggers, full medication timeline, precise functional losses, and a self-identified pattern. Gold standard for clinical documentation.',
    },
    {
      label: 'Good Day Entry (2 min)',
      badge: 'Don\'t skip these',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      text: [
        'Date: Tuesday, March 19',
        'Pain: 3/10 most of the day. Brief spike to 5/10 after stairs — settled within 30 min.',
        'Meds: None today.',
        'Function: Cooked dinner, walked to store (20 min), worked full 6-hr day. Felt almost normal.',
        'Sleep last night: 7 hrs — best in 2 weeks.',
        'Note: good sleep = good day pattern holding.',
      ],
      note: 'Time: ~2 minutes. Good day entries are essential — they establish your range, prove credibility, and reveal what helps. Skipping good days makes your diary look like it only contains bad ones, which distorts the clinical picture.',
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Four Real Pain Journal Entry Examples</h3>
      <p className="text-sm text-slate-500 mb-6">
        Different days warrant different entries. These are real-format examples — use them as direct templates.
      </p>
      <div className="space-y-6">
        {entries.map((e) => (
          <div key={e.label} className={`rounded-xl border p-5 ${e.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm">{e.label}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.badgeBg}`}>{e.badge}</span>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-white font-mono text-sm text-slate-700 mb-3 space-y-1">
              {e.text.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="text-xs text-slate-500 italic">{e.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Common Mistakes Panel ────────────────────────────────────────────────── */

const CommonMistakes: React.FC = () => {
  const mistakes = [
    {
      mistake: 'Only tracking pain numbers',
      why: 'Numbers without context are incomplete. "Pain: 7" tells your doctor very little. "Pain: 7, couldn\'t dress myself, took 45 min to get out of bed" tells them everything.',
      fix: 'Add one line of functional impact to every entry.',
    },
    {
      mistake: 'Skipping good days',
      why: 'If you only write on bad days, your diary looks like every day is bad. Your doctor needs to see your range, not just your ceiling.',
      fix: 'Write even a 30-second note on good days: pain level, one activity you managed, no meds.',
    },
    {
      mistake: 'Backfilling entries',
      why: 'Memory of pain is unreliable, especially memory of the specific details that matter (timing, medication response, triggers). Reconstructed entries lower the credibility of your record.',
      fix: 'If you miss a day, leave it blank. Write a brief note in the next entry: "no entry yesterday — pain too high to write."',
    },
    {
      mistake: 'Vague functional language',
      why: '"Rested all day" could mean a scheduled rest day or being unable to move. "Couldn\'t stand for more than 5 minutes" is clinical evidence; "had a rough day" is not.',
      fix: 'Name specific activities attempted, modified, or abandoned. Specificity is what turns a diary into evidence.',
    },
    {
      mistake: 'Treating medication as a secondary note',
      why: 'Medication response — how much it helped, for how long, at what dose — is often the most clinically relevant data in your diary. It guides every prescribing decision.',
      fix: 'For every medication taken, record: name, dose, time, pain before, pain after (with time), and how long the effect lasted.',
    },
  ];

  return (
    <div className="my-10 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 text-white">
      <h3 className="text-lg font-bold mb-2">5 Pain Journal Mistakes and How to Fix Them</h3>
      <p className="text-sm text-slate-300 mb-6">Most journals fail for the same predictable reasons. Here\'s what to avoid.</p>
      <div className="space-y-5">
        {mistakes.map((m) => (
          <div key={m.mistake} className="bg-white/10 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold text-white text-sm mb-1">{m.mistake}</h4>
            <p className="text-sm text-slate-300 mb-2">{m.why}</p>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-emerald-200">{m.fix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const exampleStats: StatItem[] = [
  { value: '4', label: 'Example entry formats (1 for each day type)', icon: MessageSquare },
  { value: '1–7 min', label: 'Entry time range depending on day', icon: Clock },
  { value: '5', label: 'Most common pain journal mistakes covered', icon: FileText },
  { value: '2 wk', label: 'Before meaningful patterns emerge', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'pain-journal-examples',
  title: 'Pain Journal Examples',
  metaTitle: 'Pain Journal Examples: Real Entries for Worst Days, Standard Days, Flares, and Good Days',
  metaDescription: 'See real pain journal entry examples for every kind of day — 1-minute minimal entries for bad days, 3-minute standard entries, detailed flare documentation, and good-day records. Copy the format directly.',
  keywords: [
    'pain journal examples', 'pain diary examples',
    'what to write in pain journal', 'pain journal entry examples',
    'pain diary entry examples', 'example pain diary entries',
    'how to write in pain journal', 'pain journal writing examples',
    'pain diary writing guide', 'sample pain journal entries',
    'pain log examples', 'chronic pain journal examples',
    'pain diary what to write', 'pain tracking examples',
  ],
  badge: 'Examples',
  headline: 'Pain Journal Examples: Real Entries for Every Kind of Day',
  subheadline: 'Seeing what a good pain journal entry actually looks like is more useful than reading five pages of advice about it. Here are four real-format examples — from a 1-minute minimal entry to a full flare documentation — with notes on what makes each one clinically useful.',
  primaryCTA: { text: 'Download a blank template', href: '/resources/pain-diary-template-pdf' },
  secondaryCTA: { text: 'Start tracking now', href: '/start' },
  utilityBlock: { type: 'tool-embed' },
  whatIsThis: 'Four complete pain journal entry examples in real-world format: a minimal 1-minute entry for difficult days (pain level, medication, energy), a standard 3-minute entry covering pain, medication response, sleep, and functional impact, a detailed 7-minute flare documentation with triggers and treatment timeline, and a good-day entry showing what low-pain days should look like. Each example includes a note explaining what makes it clinically useful and how to adapt it for your own condition.',
  whoShouldUse: [
    'Anyone starting a pain journal who isn\'t sure what to write',
    'People who tried journaling before but felt their entries were too vague to be useful',
    'Patients who want to improve their pain diary before an upcoming appointment',
    'Anyone whose doctor asked them to track pain but didn\'t say how',
    'People comparing their current entries against a clear standard',
    'Anyone who learns better from examples than from instructions',
    'Healthcare providers looking for patient-education examples to share',
  ],
  howToUse: [
    { step: 1, title: 'Read the standard entry first', description: 'The 3-minute standard entry is the format you\'ll use most days. Read it, notice the structure: time-stamped pain levels, brief medication response, one sleep note, and one functional note. That\'s the core.' },
    { step: 2, title: 'Copy the structure, not the words', description: 'Your entry doesn\'t need to read like someone else\'s. Use the same categories but fill in your specific medications, your specific functional limitations, your pain locations. The structure is what makes it useful, not the phrasing.' },
    { step: 3, title: 'Use the minimal entry when you need to', description: 'On your worst days, the minimal entry is your lifeline. One number, one medication note, one word. The habit of writing something — anything — is more valuable than the perfect entry you\'ll write when you feel better (but won\'t, because you\'ll have forgotten the details).' },
    { step: 4, title: 'Upgrade to the flare entry when it matters', description: 'Save the detailed flare entry for days when something significant happens — a spike above your normal, a new symptom, a medication failure. The extra 5 minutes of detail on those days is disproportionately valuable.' },
    { step: 5, title: 'Review the common mistakes', description: 'After a week of entries, check your journal against the five common mistakes. Are you skipping good days? Are your functional notes specific enough? Are you recording medication response, not just medication taken?' },
  ],
  whyItMatters: 'Most people who start a pain journal are not told what a useful entry actually looks like. They write vague descriptions — "pain was bad today" or "took my pills" — that don\'t provide the structured data a doctor can act on. Seeing concrete examples closes that gap. The difference between "had a bad pain day" and "pain peaked at 8/10, ibuprofen reduced it to 5/10 for 3 hours, then returned to 7/10; couldn\'t complete grocery trip" is the difference between an appointment that accomplishes nothing and one that changes your treatment.',
  trustSignals: {
    medicalNote: 'Entry formats reflect pain assessment data elements recommended in clinical pain documentation guidelines, including NRS, medication response, and ADL impact.',
    privacyNote: 'These are examples only — no data collection involved. Your actual entries are yours, stored only on your device.',
    legalNote: 'Specific, detailed pain journal entries documenting functional losses and medication response provide substantially stronger evidence in disability and insurance claims than vague or inconsistent records.',
  },
  faqs: [
    { question: 'Do my entries need to look like these examples?', answer: 'No — use the structure, not the exact format. The key elements are: time-stamped pain scores, specific medications with response notes, sleep quality, and at least one concrete functional observation. How you write them is up to you.' },
    { question: 'My pain is very different from these examples. Do the same principles apply?', answer: 'Yes. The structure is condition-agnostic. Whether you have fibromyalgia, chronic back pain, migraine, endometriosis, or neuropathy, the same data points matter: intensity, timing, medication response, sleep, and functional impact.' },
    { question: 'What if I can\'t rate my pain on a number scale?', answer: 'Use descriptive anchors: "this is my worst day" (10), "I can function but it\'s hard" (5), "barely noticeable" (1–2). You can also use a verbal scale: mild, moderate, severe, unbearable. Consistency matters more than the specific scale.' },
    { question: 'How specific do functional notes need to be?', answer: '"Couldn\'t stand for more than 5 minutes" is better than "couldn\'t stand." "Had to sit down halfway through making breakfast" is better than "hard to cook." Specificity is the difference between anecdote and evidence. Name activities, duration, and what forced you to stop.' },
    { question: 'Is it okay to use shorthand or abbreviations?', answer: 'Completely fine. "IB 400mg @ 9am → 7/10 to 4/10 by 10am, wore off @ 1pm" communicates everything. Speed matters. If shorthand means you actually write daily, use shorthand.' },
    { question: 'Should every entry have all the sections shown in the examples?', answer: 'No — the detailed entry is the maximum, not the standard. The minimal entry (pain level, medication, energy) is the floor. Most days you\'ll be somewhere in between. The goal is a consistent habit, not a comprehensive report every day.' },
    { question: 'What if I have nothing to say on a good day?', answer: 'Write exactly that: "Pain: 2/10. No medications. Went for a walk, cooked dinner, felt okay." The good days are data too — they show your range and reveal what conditions help your pain.' },
    { question: 'How do I know if my entries are good enough?', answer: 'Ask: "If I showed this to my doctor, could they tell me something useful back?" If your entry gives them enough to respond to — adjusting medication, ordering a test, referring you — it\'s good enough.' },
  ],
  relatedLinks: [
    { title: 'What to Include in a Pain Journal', description: 'Full guide to pain journal content', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Pain Diary Template PDF', description: 'Structured blank template to fill in', href: '/resources/pain-diary-template-pdf' },
    { title: 'How to Track Pain for Doctors', description: 'Clinician-facing tracking guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Symptom Journal Template', description: 'Broader symptom tracking', href: '/resources/symptom-journal-template' },
    { title: 'Pain Diary for Doctor Visits', description: 'Appointment-focused diary', href: '/resources/pain-diary-for-doctor-visits' },
    { title: '7-Day Pain Diary Template', description: 'Start with one week', href: '/resources/7-day-pain-diary-template' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Journal Examples', url: '/resources/pain-journal-examples' },
  ],
};

export const PainJournalExamplesPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={exampleStats} colorScheme="amber" />
    <SampleEntries />
    <CommonMistakes />
    <BottomCTACallout
      icon={MessageSquare}
      heading="Now You Know What Good Looks Like — Start Writing."
      body="Download a blank template, open the app, or just grab a notebook. The format doesn't matter. Starting does."
      pdfUrl="/assets/pain-journal-checklist.pdf"
      gradientClasses="from-amber-600 to-orange-600"
      tintClass="text-amber-100"
      buttonTextClass="text-amber-700"
      buttonHoverClass="hover:bg-amber-50"
      primaryLabel="Get Blank Template"
      secondaryLabel="Start Digitally"
    />
  </SEOPageLayout>
);

export default PainJournalExamplesPage;

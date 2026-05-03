import React from 'react';
import { Link } from 'react-router-dom';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

type ResourcePageConfig = {
  content: SEOPageContent;
  opening: string;
  ctaHref: string;
  ctaText: string;
};

function ResourcePageTemplate({ content, opening, ctaHref, ctaText }: Readonly<ResourcePageConfig>) {
  return (
    <SEOPageLayout content={content}>
      <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-left">
        <p className="text-sm leading-relaxed text-slate-700">{opening}</p>
        <Link
          to={ctaHref}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        >
          {ctaText}
        </Link>
      </section>
    </SEOPageLayout>
  );
}

const weeklyPainTrackerPrintableContent: SEOPageContent = {
  slug: 'weekly-pain-tracker-printable',
  title: 'Weekly Pain Tracker Printable',
  metaTitle: 'Weekly Pain Tracker Printable: Free Symptom and Flare-Up Log',
  metaDescription:
    'Download a free weekly pain tracker printable to record pain levels, symptoms, triggers, medication, sleep, and flare-ups before appointments.',
  keywords: [
    'weekly pain tracker printable',
    'weekly pain log',
    'pain tracker for doctor appointment',
    'flare up log printable',
    'weekly symptom tracker'
  ],
  badge: 'Printable',
  headline: 'Weekly Pain Tracker Printable',
  subheadline: 'Track seven days of symptoms, flare-ups, medication, sleep, and daily function in one clear format.',
  primaryCTA: { text: 'Download the weekly tracker', href: '/resources/weekly-pain-tracker-printable' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/weekly-pain-log-pdf', downloadFileName: 'weekly-pain-tracker-printable' },
  whatIsThis:
    'A weekly pain tracker printable for people who need one-page weekly visibility before appointments, treatment reviews, or personal pattern checks.',
  whoShouldUse: [
    'People preparing for doctor visits',
    'Anyone tracking recurring weekly flare patterns',
    'People who prefer print-first workflows'
  ],
  howToUse: [
    { step: 1, title: 'Record pain at fixed times', description: 'Use morning, afternoon, and evening checks for comparable data.' },
    { step: 2, title: 'Track triggers and medication', description: 'Log what changed before and after pain shifts.' },
    { step: 3, title: 'Summarize before appointments', description: 'Bring one clean weekly summary instead of memory-only recall.' }
  ],
  whyItMatters:
    'Weekly logs show trend direction and recurring trigger timing better than isolated daily notes.',
  trustSignals: {
    medicalNote: 'Structured weekly tracking improves appointment clarity.',
    privacyNote: 'You can start on paper and stay in control of sharing.',
    legalNote: 'Weekly records support continuity in documentation workflows.'
  },
  faqs: [
    { question: 'What should a weekly tracker include?', answer: 'Pain level, location, symptoms, triggers, medication response, sleep, and functional impact.' },
    { question: 'Is this useful for appointments?', answer: 'Yes. Weekly summaries are easier for clinicians to scan quickly.' },
    { question: 'Can I move from printable to app later?', answer: 'Yes. The same data categories map cleanly into the app workflow.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Track day-level detail', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Monthly Pain Tracker Printable', description: 'Track 30-day trends', href: '/resources/monthly-pain-tracker-printable' },
    { title: 'How to Track Pain for a Doctor', description: 'Prepare better visit notes', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Free Private Pain Tracker App', description: 'Switch to local-first digital tracking', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Weekly Pain Tracker Printable', url: '/resources/weekly-pain-tracker-printable' }
  ]
};

const medicationAndPainLogContent: SEOPageContent = {
  slug: 'medication-and-pain-log',
  title: 'Medication and Pain Log',
  metaTitle: 'Medication and Pain Log: Free Printable for Dose, Timing, and Relief Tracking',
  metaDescription:
    'Use a free medication and pain log to track dose timing, pain before and after medication, side effects, and relief duration.',
  keywords: ['medication and pain log', 'pain medication tracker', 'dose timing pain log', 'medication relief log'],
  badge: 'Printable',
  headline: 'Medication and Pain Log',
  subheadline: 'Record dose timing and relief response so treatment conversations are based on evidence, not guesswork.',
  primaryCTA: { text: 'Download medication and pain log', href: '/resources/medication-and-pain-log' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/medication-and-pain-log', downloadFileName: 'medication-and-pain-log' },
  whatIsThis: 'A simple medication and pain log focused on treatment timing, symptom response, side effects, and dose impact over time.',
  whoShouldUse: ['People testing medication adjustments', 'Patients preparing medication reviews', 'Caregivers documenting response patterns'],
  howToUse: [
    { step: 1, title: 'Record medication details', description: 'Capture dose, time, and format every time.' },
    { step: 2, title: 'Track before/after pain', description: 'Log pain level immediately before and at set intervals after dose.' },
    { step: 3, title: 'Document side effects', description: 'Track nausea, fatigue, dizziness, and symptom tradeoffs.' }
  ],
  whyItMatters: 'Medication logs reveal what helps, what fails, and what causes side effects under real-life conditions.',
  trustSignals: {
    medicalNote: 'Dose-response timelines support safer medication discussions.',
    privacyNote: 'You control if and when logs are shared.',
    legalNote: 'Medication adherence records can support structured documentation.'
  },
  faqs: [
    { question: 'What is most important to track?', answer: 'Dose, time, pain before/after, relief duration, and side effects.' },
    { question: 'Can this help doctor conversations?', answer: 'Yes. It makes medication response patterns explicit.' },
    { question: 'Should I track missed doses?', answer: 'Yes. Missed doses and reasons can explain symptom spikes.' }
  ],
  relatedLinks: [
    { title: 'Pain Scale Chart Printable', description: 'Use consistent pain ratings', href: '/resources/pain-scale-chart-printable' },
    { title: 'Flare-Up Tracker Printable', description: 'Track episodes and triggers', href: '/resources/flare-up-tracker-printable' },
    { title: 'How to Include Medication in a Journal', description: 'Structured tracking guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Free Private Pain Tracker App', description: 'Track medication digitally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Medication and Pain Log', url: '/resources/medication-and-pain-log' }
  ]
};

const flareUpTrackerPrintableContent: SEOPageContent = {
  slug: 'flare-up-tracker-printable',
  title: 'Flare-Up Tracker Printable',
  metaTitle: 'Flare-Up Tracker Printable: Free Pain Episode Log and Trigger Worksheet',
  metaDescription:
    'Track pain flare-ups with a free printable log for start time, severity, triggers, response actions, and recovery timing.',
  keywords: ['flare-up tracker printable', 'pain flare log', 'flare tracker', 'pain episode tracker'],
  badge: 'Printable',
  headline: 'Flare-Up Tracker Printable',
  subheadline: 'Log flare start, peak intensity, triggers, what helped, and recovery time in a structured format.',
  primaryCTA: { text: 'Download flare-up tracker', href: '/resources/flare-up-tracker-printable' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/flare-up-tracker-printable', downloadFileName: 'flare-up-tracker-printable' },
  whatIsThis: 'A focused printable worksheet for documenting acute flare episodes and identifying recurrent trigger patterns.',
  whoShouldUse: ['People with episodic pain spikes', 'Patients with unpredictable trigger profiles', 'Anyone preparing specialist appointments'],
  howToUse: [
    { step: 1, title: 'Capture flare timeline', description: 'Record start, peak, and recovery windows.' },
    { step: 2, title: 'Track possible triggers', description: 'Note weather, sleep, activity, stress, and position changes.' },
    { step: 3, title: 'Log response actions', description: 'Document medication, rest, movement, and relief outcomes.' }
  ],
  whyItMatters: 'Flare-level logs reveal trigger chains and response effectiveness more clearly than general daily summaries.',
  trustSignals: {
    medicalNote: 'Flare timelines help clinicians assess episode burden and response.',
    privacyNote: 'Use printable logs without account dependency.',
    legalNote: 'Episode records can strengthen continuity in workplace/disability documentation.'
  },
  faqs: [
    { question: 'Should I track every flare?', answer: 'Track every moderate or severe flare and any unusual episode.' },
    { question: 'What if trigger is unclear?', answer: 'Mark unknown; repeated unknowns still show episode frequency.' },
    { question: 'Can I combine this with daily logs?', answer: 'Yes. Use daily logs for baseline and flare logs for spikes.' }
  ],
  relatedLinks: [
    { title: 'Weekly Pain Tracker Printable', description: 'Map weekly flare distribution', href: '/resources/weekly-pain-tracker-printable' },
    { title: 'Medication and Pain Log', description: 'Track response to flare interventions', href: '/resources/medication-and-pain-log' },
    { title: 'Pain and Trigger Tracking Guide', description: 'Learn what to record', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Free Private Pain Tracker App', description: 'Track flares digitally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Flare-Up Tracker Printable', url: '/resources/flare-up-tracker-printable' }
  ]
};

const doctorVisitPainSummaryTemplateContent: SEOPageContent = {
  slug: 'doctor-visit-pain-summary-template',
  title: 'Doctor Visit Pain Summary Template',
  metaTitle: 'Doctor Visit Pain Summary Template: Free One-Page Appointment Sheet',
  metaDescription:
    'Use a one-page doctor visit pain summary template to present symptom trends, triggers, medication response, and key questions quickly.',
  keywords: ['doctor visit pain summary template', 'pain summary for appointment', 'doctor appointment pain log'],
  badge: 'Appointment',
  headline: 'Doctor Visit Pain Summary Template',
  subheadline: 'Condense your tracking into one appointment-ready page clinicians can read in under two minutes.',
  primaryCTA: { text: 'Download doctor summary template', href: '/resources/doctor-visit-pain-summary-template' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/doctor-visit-pain-summary-template', downloadFileName: 'doctor-visit-pain-summary-template' },
  whatIsThis: 'A one-page doctor visit summary template that translates daily tracking into concise appointment signals.',
  whoShouldUse: ['Patients with short appointment windows', 'People juggling multiple symptom categories', 'Anyone needing clearer clinician communication'],
  howToUse: [
    { step: 1, title: 'Summarize 1-2 week trends', description: 'Include pain range, common triggers, and dominant limitations.' },
    { step: 2, title: 'Highlight medication response', description: 'Show what helped, what failed, and side effects.' },
    { step: 3, title: 'List top questions', description: 'Bring 3 key decisions/questions for the appointment.' }
  ],
  whyItMatters: 'Short appointment windows reward concise summaries, not long unstructured notes.',
  trustSignals: {
    medicalNote: 'Structured summaries reduce missed details during clinician review.',
    privacyNote: 'You choose what gets included and shared.',
    legalNote: 'Consistent summary snapshots support longitudinal documentation.'
  },
  faqs: [
    { question: 'How many days should I summarize?', answer: 'Usually 7-14 days provides a useful pattern window.' },
    { question: 'Should I bring full logs too?', answer: 'Yes. Bring summary first and full logs as backup detail.' },
    { question: 'Can this work for specialist visits?', answer: 'Yes. It is useful for GP and specialist contexts.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain for Doctors', description: 'Complete appointment prep guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Pain Diary for Doctor Visits', description: 'Doctor-focused tracking format', href: '/resources/pain-diary-for-doctor-visits' },
    { title: 'Weekly Pain Tracker Printable', description: 'Generate summary inputs', href: '/resources/weekly-pain-tracker-printable' },
    { title: 'Free Private Pain Tracker App', description: 'Generate summaries from digital logs', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Doctor Visit Pain Summary Template', url: '/resources/doctor-visit-pain-summary-template' }
  ]
};

const bodyPainChartTemplateContent: SEOPageContent = {
  slug: 'body-pain-chart-template',
  title: 'Body Pain Chart Template',
  metaTitle: 'Body Pain Chart Template: Free Printable Body Location Tracker',
  metaDescription:
    'Use a free printable body pain chart template to mark pain location, spread, intensity zones, and symptom changes over time.',
  keywords: ['body pain chart template', 'pain location chart', 'body map pain tracker', 'pain body diagram printable'],
  badge: 'Printable',
  headline: 'Body Pain Chart Template',
  subheadline: 'Map where pain starts, where it spreads, and how location changes over days, weeks, and flares.',
  primaryCTA: { text: 'Download body pain chart', href: '/resources/body-pain-chart-template' },
  secondaryCTA: { text: 'Use the body map in app', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/body-pain-chart-template', downloadFileName: 'body-pain-chart-template' },
  whatIsThis: 'A printable body pain chart for marking location patterns and spread trajectories for clinician review.',
  whoShouldUse: ['People with migrating pain', 'Patients tracking radiating nerve pain', 'Anyone needing location-specific logs'],
  howToUse: [
    { step: 1, title: 'Mark primary pain zones', description: 'Use consistent markings for intensity and symptom type.' },
    { step: 2, title: 'Track spread patterns', description: 'Note where pain radiates and when.' },
    { step: 3, title: 'Pair with symptom notes', description: 'Link body map markings with trigger and activity context.' }
  ],
  whyItMatters: 'Location maps reveal spatial patterns that pure numeric logs can miss.',
  trustSignals: {
    medicalNote: 'Body location mapping supports differential assessment discussions.',
    privacyNote: 'Printable format stays under your control.',
    legalNote: 'Location consistency can strengthen longitudinal record quality.'
  },
  faqs: [
    { question: 'Can I mark multiple pain types?', answer: 'Yes. Use separate symbols or colors for each pain type.' },
    { question: 'How often should I update it?', answer: 'Daily during active periods and during notable changes.' },
    { question: 'Can I use digital body mapping?', answer: 'Yes. The app supports interactive body mapping too.' }
  ],
  relatedLinks: [
    { title: 'Pain Scale Chart Printable', description: 'Standardize severity ratings', href: '/resources/pain-scale-chart-printable' },
    { title: 'Nerve Pain Symptom Log', description: 'Track radiating symptoms', href: '/resources/nerve-pain-symptom-log' },
    { title: 'Flare-Up Tracker Printable', description: 'Track episode context', href: '/resources/flare-up-tracker-printable' },
    { title: 'Free Private Pain Tracker App', description: 'Use digital body map tools', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Body Pain Chart Template', url: '/resources/body-pain-chart-template' }
  ]
};

const chronicPainJournalTemplateContent: SEOPageContent = {
  slug: 'chronic-pain-journal-template',
  title: 'Chronic Pain Journal Template',
  metaTitle: 'Chronic Pain Journal Template: Free Daily Tracking Worksheet',
  metaDescription:
    'Download a chronic pain journal template for daily pain levels, symptom patterns, triggers, medication, sleep, and functional impact notes.',
  keywords: ['chronic pain journal template', 'chronic pain tracker printable', 'daily chronic pain log'],
  badge: 'Template',
  headline: 'Chronic Pain Journal Template',
  subheadline: 'Use a repeatable daily template that is fast enough for difficult days and structured enough for pattern review.',
  primaryCTA: { text: 'Download chronic pain journal template', href: '/resources/chronic-pain-journal-template' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/chronic-pain-journal-template', downloadFileName: 'chronic-pain-journal-template' },
  whatIsThis: 'A daily chronic pain journal template designed for consistency over long-term tracking windows.',
  whoShouldUse: ['People with persistent pain conditions', 'Patients monitoring treatment changes', 'Anyone documenting multi-factor symptom patterns'],
  howToUse: [
    { step: 1, title: 'Log baseline daily', description: 'Record pain, symptoms, and function even on moderate days.' },
    { step: 2, title: 'Add flare detail when needed', description: 'Expand entries on spike days without changing core format.' },
    { step: 3, title: 'Review weekly trend direction', description: 'Look for progression, relief, and trigger recurrence.' }
  ],
  whyItMatters: 'Long-term consistency turns daily notes into clinically useful trend evidence.',
  trustSignals: {
    medicalNote: 'Longitudinal journals improve treatment adjustment clarity.',
    privacyNote: 'Works as printable or local-first digital workflow.',
    legalNote: 'Consistent long-term records support documentation rigor.'
  },
  faqs: [
    { question: 'How long should I keep a journal?', answer: 'At least 4 weeks for trends, longer for chronic pattern review.' },
    { question: 'Do I need long notes every day?', answer: 'No. Brief consistent entries are more useful than occasional essays.' },
    { question: 'Can this work with specialist care?', answer: 'Yes. Specialists often benefit from structured long-term logs.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Quick daily format', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Monthly Pain Tracker Printable', description: '30-day trend summary', href: '/resources/monthly-pain-tracker-printable' },
    { title: 'Pain Journal Examples', description: 'See sample entries', href: '/resources/pain-journal-examples' },
    { title: 'Free Private Pain Tracker App', description: 'Move from paper to digital', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Journal Template', url: '/resources/chronic-pain-journal-template' }
  ]
};

const howToStartPainJournalContent: SEOPageContent = {
  slug: 'how-to-start-a-pain-journal',
  title: 'How to Start a Pain Journal',
  metaTitle: 'How to Start a Pain Journal: Simple Daily Method That Sticks',
  metaDescription:
    'Learn how to start a pain journal with a simple daily method for pain levels, triggers, medication, sleep, and function tracking.',
  keywords: ['how to start a pain journal', 'start pain diary', 'begin pain tracker', 'pain journal routine'],
  badge: 'Guide',
  headline: 'How to Start a Pain Journal',
  subheadline: 'Start with a low-friction routine you can keep on hard days, not a perfect system you abandon in week two.',
  primaryCTA: { text: 'Start with a free template', href: '/resources/chronic-pain-journal-template' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/how-to-start-a-pain-journal', downloadFileName: 'how-to-start-a-pain-journal' },
  whatIsThis: 'A practical guide for starting a pain journal with minimal daily burden and maximum consistency.',
  whoShouldUse: ['First-time pain journal users', 'People who quit previous tracking attempts', 'Patients preparing for appointments'],
  howToUse: [
    { step: 1, title: 'Pick 3 required data points', description: 'Pain level, location, and one functional limitation.' },
    { step: 2, title: 'Use fixed check-in times', description: 'Set times reduce decision fatigue and improve consistency.' },
    { step: 3, title: 'Expand only when needed', description: 'Add trigger and medication detail during notable changes.' }
  ],
  whyItMatters: 'Simple routines survive low-energy days and generate better long-term data.',
  trustSignals: {
    medicalNote: 'Consistent daily logs improve appointment signal quality.',
    privacyNote: 'Start on paper or local-first digital without account pressure.',
    legalNote: 'Routine logs create clearer chronology over time.'
  },
  faqs: [
    { question: 'How much should I write daily?', answer: 'Aim for 1-3 minutes on most days.' },
    { question: 'What if I miss days?', answer: 'Resume immediately; consistency over perfection.' },
    { question: 'Paper or digital first?', answer: 'Start where friction is lowest, then transition as needed.' }
  ],
  relatedLinks: [
    { title: 'What to Include in a Pain Journal', description: 'Detailed content checklist', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Pain Journal Examples', description: 'Copy practical entry formats', href: '/resources/pain-journal-examples' },
    { title: 'Daily Pain Tracker Printable', description: 'Fast daily format', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Free Private Pain Tracker App', description: 'Track digitally with low friction', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Start a Pain Journal', url: '/resources/how-to-start-a-pain-journal' }
  ]
};

const howToDescribePainContent: SEOPageContent = {
  slug: 'how-to-describe-pain',
  title: 'How to Describe Pain',
  metaTitle: 'How to Describe Pain Clearly for Doctors: Words, Scale, Location, and Pattern',
  metaDescription:
    'Learn how to describe pain clearly using location, quality words, severity scale, timing, triggers, and functional impact.',
  keywords: ['how to describe pain', 'pain description words', 'pain scale explanation', 'describe pain for doctor'],
  badge: 'Guide',
  headline: 'How to Describe Pain Clearly for Doctors',
  subheadline: 'Use consistent language for pain quality, location, severity, timing, and functional impact so visits are more productive.',
  primaryCTA: { text: 'Use the pain description checklist', href: '/resources/how-to-describe-pain' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/how-to-describe-pain', downloadFileName: 'how-to-describe-pain' },
  whatIsThis: 'A practical guide to describing pain in terms clinicians can use for assessment and follow-up decisions.',
  whoShouldUse: ['Patients unsure how to describe symptoms', 'People preparing first specialist visit', 'Anyone needing more consistent symptom language'],
  howToUse: [
    { step: 1, title: 'Describe quality', description: 'Use terms like burning, stabbing, throbbing, pressure, or aching.' },
    { step: 2, title: 'Describe location and spread', description: 'Mark where pain starts and where it radiates.' },
    { step: 3, title: 'Describe impact', description: 'State what pain prevented or limited in daily function.' }
  ],
  whyItMatters: 'Clear symptom language improves assessment speed and reduces ambiguity in care conversations.',
  trustSignals: {
    medicalNote: 'Specific descriptors improve clinical interpretation accuracy.',
    privacyNote: 'Use this language framework in private logs first.',
    legalNote: 'Consistent wording supports record coherence over time.'
  },
  faqs: [
    { question: 'Is a pain score alone enough?', answer: 'No. Pair score with quality, location, timing, and function.' },
    { question: 'Should I track pain words daily?', answer: 'Track on notable changes and flare episodes.' },
    { question: 'Can I use body maps too?', answer: 'Yes. Body maps improve location clarity.' }
  ],
  relatedLinks: [
    { title: 'Pain Scale Chart Printable', description: 'Use consistent severity ratings', href: '/resources/pain-scale-chart-printable' },
    { title: 'Body Pain Chart Template', description: 'Map location and spread', href: '/resources/body-pain-chart-template' },
    { title: 'How to Track Pain for Doctors', description: 'Prepare appointment-ready notes', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Free Private Pain Tracker App', description: 'Track descriptors in-app', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Describe Pain', url: '/resources/how-to-describe-pain' }
  ]
};

const howToTrackPainTriggersContent: SEOPageContent = {
  slug: 'how-to-track-pain-triggers',
  title: 'How to Track Pain Triggers',
  metaTitle: 'How to Track Pain Triggers: Practical Method for Sleep, Stress, Weather, and Activity',
  metaDescription:
    'Learn how to track pain triggers with a practical method covering sleep, stress, weather, movement, medication timing, and flare patterns.',
  keywords: ['how to track pain triggers', 'pain trigger tracker', 'flare trigger log', 'pain pattern tracking'],
  badge: 'Guide',
  headline: 'How to Track Pain Triggers',
  subheadline: 'Use a repeatable trigger log to connect pain shifts with sleep, stress, weather, activity, and medication timing.',
  primaryCTA: { text: 'Use the trigger tracking template', href: '/resources/how-to-track-pain-triggers' },
  secondaryCTA: { text: 'Use the app free', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/how-to-track-pain-triggers', downloadFileName: 'how-to-track-pain-triggers' },
  whatIsThis: 'A practical framework for identifying likely trigger patterns using daily and flare-level observations.',
  whoShouldUse: ['People with unpredictable pain spikes', 'Patients testing lifestyle/medication changes', 'Anyone preparing specialist pattern discussions'],
  howToUse: [
    { step: 1, title: 'Track trigger categories', description: 'Sleep, stress, weather, movement, position, and medication timing.' },
    { step: 2, title: 'Log pain response windows', description: 'Capture onset delay and symptom intensity after trigger exposures.' },
    { step: 3, title: 'Review recurring combinations', description: 'Look for trigger bundles that repeat before flares.' }
  ],
  whyItMatters: 'Trigger tracking helps convert uncertainty into actionable prevention and planning patterns.',
  trustSignals: {
    medicalNote: 'Trigger-pattern logs can guide treatment adjustments and pacing plans.',
    privacyNote: 'Trigger data stays private until you choose to share.',
    legalNote: 'Pattern logs improve chronology and context in records.'
  },
  faqs: [
    { question: 'How long before trigger patterns appear?', answer: 'Usually 2-4 weeks for initial useful signal.' },
    { question: 'Should I track every possible trigger?', answer: 'Start with likely categories and expand only if needed.' },
    { question: 'Can weather be tracked automatically?', answer: 'In app workflows, weather correlation can be automated.' }
  ],
  relatedLinks: [
    { title: 'Flare-Up Tracker Printable', description: 'Track episode-level trigger context', href: '/resources/flare-up-tracker-printable' },
    { title: 'Symptom Tracker Printable', description: 'Track broader symptom patterns', href: '/resources/symptom-tracker-printable' },
    { title: 'How to Start a Pain Journal', description: 'Build your baseline routine', href: '/resources/how-to-start-a-pain-journal' },
    { title: 'Free Private Pain Tracker App', description: 'Track triggers in-app', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Track Pain Triggers', url: '/resources/how-to-track-pain-triggers' }
  ]
};

export const WeeklyPainTrackerPrintablePage: React.FC = () => (
  <ResourcePageTemplate
    content={weeklyPainTrackerPrintableContent}
    opening="Use this weekly pain tracker to record pain levels, symptoms, triggers, medication, sleep, and flare-ups across seven days. It is built for doctor appointments, personal records, and chronic pain pattern tracking."
    ctaHref="/resources/weekly-pain-log-pdf"
    ctaText="Download the free weekly pain tracker printable"
  />
);

export const MedicationAndPainLogPage: React.FC = () => (
  <ResourcePageTemplate
    content={medicationAndPainLogContent}
    opening="A useful medication and pain log records dose time, pain level before and after, side effects, and how long relief lasted. This turns treatment conversations into concrete evidence."
    ctaHref="/resources/medication-and-pain-log"
    ctaText="Download the free medication and pain log"
  />
);

export const FlareUpTrackerPrintablePage: React.FC = () => (
  <ResourcePageTemplate
    content={flareUpTrackerPrintableContent}
    opening="Track flare-ups by capturing start time, severity, likely triggers, what helped, and recovery duration. Flare-specific logs reveal patterns daily summaries can miss."
    ctaHref="/resources/flare-up-tracker-printable"
    ctaText="Download the free flare-up tracker"
  />
);

export const DoctorVisitPainSummaryTemplatePage: React.FC = () => (
  <ResourcePageTemplate
    content={doctorVisitPainSummaryTemplateContent}
    opening="A doctor visit pain summary should show trends, top limitations, trigger patterns, medication response, and your key questions on one page."
    ctaHref="/resources/doctor-visit-pain-summary-template"
    ctaText="Download the free doctor summary template"
  />
);

export const BodyPainChartTemplatePage: React.FC = () => (
  <ResourcePageTemplate
    content={bodyPainChartTemplateContent}
    opening="A body pain chart helps you track where pain starts, where it spreads, and how location changes over time. Pair it with symptom notes for a clearer clinical picture."
    ctaHref="/resources/body-pain-chart-template"
    ctaText="Download the free body pain chart template"
  />
);

export const ChronicPainJournalTemplatePage: React.FC = () => (
  <ResourcePageTemplate
    content={chronicPainJournalTemplateContent}
    opening="A chronic pain journal works best when it is brief, consistent, and structured. Record baseline pain, triggers, treatment response, and daily function in the same format each day."
    ctaHref="/resources/chronic-pain-journal-template"
    ctaText="Download the free chronic pain journal template"
  />
);

export const HowToStartPainJournalPage: React.FC = () => (
  <ResourcePageTemplate
    content={howToStartPainJournalContent}
    opening="Start your pain journal with three required fields: pain level, location, and one functional limitation. Keep entries short enough to survive hard days."
    ctaHref="/resources/chronic-pain-journal-template"
    ctaText="Start with the free journal template"
  />
);

export const HowToDescribePainPage: React.FC = () => (
  <ResourcePageTemplate
    content={howToDescribePainContent}
    opening="Describe pain using five anchors: quality words, location, severity scale, timing pattern, and function impact. This makes clinical conversations faster and clearer."
    ctaHref="/resources/how-to-describe-pain"
    ctaText="Use the pain description checklist"
  />
);

export const HowToTrackPainTriggersPage: React.FC = () => (
  <ResourcePageTemplate
    content={howToTrackPainTriggersContent}
    opening="Track pain triggers by linking symptom changes to sleep, stress, weather, movement, and medication timing. Focus on repeatable categories, not perfect detail."
    ctaHref="/resources/how-to-track-pain-triggers"
    ctaText="Use the trigger tracking template"
  />
);

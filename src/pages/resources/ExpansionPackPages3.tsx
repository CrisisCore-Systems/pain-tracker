import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ClipboardList, Download, FileText } from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const painDiaryStarterPackResources = [
  {
    title: 'Daily Pain Tracker Template',
    href: '/resources/daily-pain-tracker-printable',
    description: 'Use this when you need the lowest-friction daily page for pain level, location, triggers, and medication response.',
    bestFor: 'Best for: starting today with one simple sheet',
    icon: FileText,
  },
  {
    title: 'Weekly Pain Tracker Printable',
    href: '/resources/weekly-pain-tracker-printable',
    description: 'Use a one-week view to prepare for short appointments or compare a medication or pacing change.',
    bestFor: 'Best for: doctor visits and short pattern reviews',
    icon: ClipboardList,
  },
  {
    title: 'Monthly Pain Tracker Printable',
    href: '/resources/monthly-pain-tracker-printable',
    description: 'Track flare timing, sleep disruption, and longer treatment patterns over a full month.',
    bestFor: 'Best for: long-range trends and recurring flares',
    icon: Calendar,
  },
  {
    title: 'Doctor Visit Pain Summary Template',
    href: '/resources/doctor-visit-pain-summary-template',
    description: 'Bring a short appointment-ready summary when you need the important pattern visible fast.',
    bestFor: 'Best for: primary care and specialist appointments',
    icon: FileText,
  },
  {
    title: 'Medication and Pain Log',
    href: '/resources/medication-and-pain-log',
    description: 'Track dose timing, relief window, side effects, and whether the same medication keeps helping.',
    bestFor: 'Best for: medication changes and treatment response',
    icon: ClipboardList,
  },
  {
    title: 'Functional Capacity Log',
    href: '/resources/functional-capacity-log',
    description: 'Document what pain changed about walking, sitting, lifting, concentration, chores, and work.',
    bestFor: 'Best for: disability, injury, and function-focused documentation',
    icon: FileText,
  },
] as const;

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

// ─── 1. Pain Tracking for Arthritis ──────────────────────────────────────────

const painTrackingForArthritisContent: SEOPageContent = {
  slug: 'pain-tracking-for-arthritis',
  title: 'Pain Tracking for Arthritis',
  metaTitle: 'Pain Tracking for Arthritis: What to Record for RA, OA, and PsA',
  metaDescription:
    'Learn how to track arthritis pain and joint symptoms effectively — morning stiffness, swelling, range of motion, flares, and medication response — for rheumatology appointments.',
  keywords: [
    'pain tracking for arthritis',
    'arthritis pain diary',
    'rheumatoid arthritis symptom log',
    'joint pain tracker',
    'arthritis flare log'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Arthritis',
  subheadline: 'Record morning stiffness, joint-by-joint pain, swelling, heat, function, and flare patterns so rheumatology visits are driven by trends instead of memory.',
  primaryCTA: { text: 'Start tracking arthritis symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the arthritis pain tracker', href: '/resources/arthritis-pain-tracker' },
  whatIsThis:
    'A tracking approach designed for inflammatory and degenerative arthritis that connects daily symptoms to clinical decision-making. It focuses on morning stiffness duration, which joints are involved, whether swelling or heat is present, how function changes through the day, and whether treatment is actually improving your week-to-week baseline. That makes it useful for rheumatoid arthritis, osteoarthritis, psoriatic arthritis, gout, and mixed-pattern joint pain where the trend matters more than any single bad day.',
  whoShouldUse: [
    'People with RA, OA, PsA, gout, or other arthritis types',
    'Anyone preparing for rheumatology appointments',
    'People monitoring treatment response to DMARDs or biologics',
    'Anyone documenting functional limits for work accommodations or disability reviews'
  ],
  howToUse: [
    { step: 1, title: 'Record morning stiffness duration daily', description: 'Time stiffness in minutes, not just whether it happened. This is one of the cleanest ways to distinguish inflammatory arthritis from mechanical wear and to show whether treatment is calming the disease or not.' },
    { step: 2, title: 'Log each affected joint separately', description: 'Track which joints hurt, which are swollen, and which feel hot. Joint counts and symmetry patterns matter. Both hands and wrists tell a different story than one knee flaring after weight-bearing.' },
    { step: 3, title: 'Note function alongside pain', description: 'Record what pain changed in real life: opening jars, getting dressed, climbing stairs, typing, writing, carrying groceries, or standing from a chair. Function is often what pushes treatment changes and disability documentation forward.' },
    { step: 4, title: 'Track medication response over weeks', description: 'DMARDs, biologics, NSAIDs, injections, braces, and pacing strategies should be logged against stiffness, swelling, and function. Arthritis treatment works on trends, so your records need to show the trend.' }
  ],
  whyItMatters:
    'Arthritis disease activity fluctuates, and treatment changes are usually based on patterns across weeks rather than what happened the morning of an appointment. Consistent tracking shows whether the disease is spreading, calming, staying localized, or causing deeper functional loss. It also helps support accommodation or disability paperwork when joint pain is being underestimated because imaging or lab work does not reflect how limited you are day to day.',
  trustSignals: {
    medicalNote: 'DAS28 and other rheumatology disease activity scores draw on exactly the data this tracking approach captures.',
    privacyNote: 'Your symptom records stay on your device unless you export them.',
    legalNote: 'Joint function documentation supports disability and workplace accommodation reviews.'
  },
  faqs: [
    { question: 'What should I track for rheumatoid arthritis?', answer: 'Track morning stiffness in minutes, affected joints, swelling, warmth, fatigue, medication timing, and functional loss. Rheumatologists need the pattern across multiple joints, not just a pain score from one body area.' },
    { question: 'How is OA tracking different from RA tracking?', answer: 'OA tracking usually emphasizes weight-bearing, mechanical triggers, and end-of-day worsening. RA tracking needs more attention to morning stiffness, swelling, symmetry, fatigue, and whether inflammation is changing over time.' },
    { question: 'Should I track flares separately?', answer: 'Yes. Log flare start, suspected trigger, peak severity, duration, and what changed afterward. Flare records help show whether treatment is containing the disease or whether you are cycling into repeat loss of function.' }
  ],
  relatedLinks: [
    { title: 'Arthritis Pain Tracker Printable', description: '6-page joint-by-joint tracking template', href: '/resources/arthritis-pain-tracker' },
    { title: 'Flare-Up Tracker Printable', description: 'Log flare episodes, triggers, and recovery', href: '/resources/flare-up-tracker-printable' },
    { title: 'Daily Functioning Log for Disability', description: 'Document arthritis-related function loss for claims or accommodations', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for rheumatology visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Track joints, stiffness, and flares locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Arthritis', url: '/resources/pain-tracking-for-arthritis' }
  ]
};

export function PainTrackingForArthritisPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForArthritisContent}
      opening="Arthritis tracking is joint-specific work, not a generic pain score exercise. Morning stiffness duration, swelling, symmetry, and functional loss are the signals rheumatologists and disability reviewers actually use to judge disease activity. This guide explains what to record so your notes support treatment decisions instead of becoming another vague summary."
      ctaHref="/start"
      ctaText="Start tracking arthritis symptoms free"
    />
  );
}

// ─── 2. Pain Tracking for Migraines ──────────────────────────────────────────

const painTrackingForMigrainesContent: SEOPageContent = {
  slug: 'pain-tracking-for-migraines',
  title: 'Pain Tracking for Migraines',
  metaTitle: 'Pain Tracking for Migraines: How to Log Attacks, Triggers, and Treatment Response',
  metaDescription:
    'Learn how to track migraines effectively — attack onset, phases, severity, duration, triggers, and medication response — to find patterns and prepare for neurology appointments.',
  keywords: [
    'pain tracking for migraines',
    'migraine diary',
    'migraine symptom log',
    'headache tracker',
    'migraine trigger tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Migraines',
  subheadline: 'Log each migraine from prodrome to postdrome so attack timing, trigger stacking, aura patterns, medication response, and disability impact are visible to you and your neurologist.',
  primaryCTA: { text: 'Start tracking migraines', href: '/start' },
  secondaryCTA: { text: 'Download the migraine pain diary', href: '/resources/migraine-pain-diary-printable' },
  whatIsThis:
    'A tracking approach for migraines that treats each attack as a timeline rather than a single pain event. It covers prodrome, aura, headache, and postdrome, along with likely trigger stacking, medication timing, time-to-relief, and how the episode affected work, school, childcare, driving, or recovery the next day. That makes it useful for finding patterns on your own and for helping a neurologist classify migraine type, overuse risk, and treatment response more accurately.',
  whoShouldUse: [
    'People with episodic or chronic migraine',
    'Anyone trying to identify migraine triggers',
    'People preparing for neurology or headache specialist appointments',
    'Anyone documenting migraine frequency and disability impact for work accommodations or benefit claims'
  ],
  howToUse: [
    { step: 1, title: 'Log attack start time and first warning signs', description: 'Prodrome symptoms such as neck stiffness, mood shifts, yawning, or food cravings often arrive before pain. Logging them early helps you separate real triggers from warning signs that only look like triggers in hindsight.' },
    { step: 2, title: 'Record the whole symptom picture', description: 'Track location, peak severity, aura type, nausea, light sensitivity, sound sensitivity, smell sensitivity, and the parts of the day you lost. This gives specialists the detail needed to distinguish migraine from other headache patterns.' },
    { step: 3, title: 'Track medication timing and response', description: 'Note what you took, when you took it, how fast relief started, whether symptoms rebounded, and whether you had to repeat the dose. This is often the deciding factor in whether treatment is adjusted.' },
    { step: 4, title: 'Review frequency month by month', description: 'Monthly counts matter. They help distinguish episodic from chronic migraine, reveal medication-overuse patterns, and create the documentation often required before higher-cost treatments or accommodations are approved.' }
  ],
  whyItMatters:
    'Neurologists and headache specialists rely on attack diaries because memory consistently underestimates migraine frequency, duration, and disability. A structured log shows whether you are dealing with chronic migraine, aura-related patterns, menstrual correlation, rebound headaches, or ineffective timing of acute medication. It also helps create a clearer record when migraines affect work reliability, school attendance, or disability documentation.',
  trustSignals: {
    medicalNote: 'Headache specialist guidelines recommend prospective migraine diaries over retrospective recall for accurate diagnosis and treatment planning.',
    privacyNote: 'Your migraine log stays on your device — no uploads, no sharing by default.',
    legalNote: 'Documented migraine frequency and disability impact supports workplace accommodation and disability applications.'
  },
  faqs: [
    { question: 'What should I track for each migraine attack?', answer: 'Record onset time, phase durations, severity at onset and peak, aura type, associated symptoms, medication timing, time-to-relief, and what the attack stopped you from doing. The disability impact is part of the clinical picture.' },
    { question: 'How do I identify migraine triggers?', answer: 'Track likely triggers in the 24 to 48 hours before each attack, not just the same hour. Sleep disruption, hormones, stress, dehydration, skipped meals, weather, and sensory overload often work in combination rather than alone.' },
    { question: 'How many migraines per month indicate chronic migraine?', answer: 'Fifteen or more headache days per month for three months, with at least eight showing migraine features, meets the chronic migraine threshold. Reliable monthly tracking is what makes that classification defensible.' }
  ],
  relatedLinks: [
    { title: 'Migraine Pain Diary Printable', description: '6-page migraine tracker covering all four phases', href: '/resources/migraine-pain-diary-printable' },
    { title: 'How to Track Pain Triggers', description: 'Systematic trigger identification method', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for neurology appointments', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Monthly Pain Tracker Printable', description: 'See attack frequency and disability patterns month by month', href: '/resources/monthly-pain-tracker-printable' },
    { title: 'Free Private Pain Tracker App', description: 'Track migraine attacks with timestamps locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Migraines', url: '/resources/pain-tracking-for-migraines' }
  ]
};

export function PainTrackingForMigrainesPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForMigrainesContent}
      opening="Migraine tracking is attack-level work, but the real value comes from pattern-level review. When you log onset, phases, medication timing, trigger stacking, and next-day fallout consistently, the trend becomes clearer than memory ever can. This guide shows what to capture so neurology visits and accommodation discussions start from real evidence."
      ctaHref="/start"
      ctaText="Start tracking migraines free"
    />
  );
}

// ─── 3. Weather and Pain Tracker ─────────────────────────────────────────────

const weatherAndPainTrackerContent: SEOPageContent = {
  slug: 'weather-and-pain-tracker',
  title: 'Weather and Pain Tracker',
  metaTitle: 'Weather and Pain Tracker: Track How Weather Affects Your Chronic Pain',
  metaDescription:
    'Discover how to track the connection between weather and chronic pain — barometric pressure, temperature, humidity, and precipitation — to identify your personal weather triggers.',
  keywords: [
    'weather and pain tracker',
    'weather pain diary',
    'barometric pressure pain',
    'weather chronic pain correlation',
    'pain weather sensitivity log'
  ],
  badge: 'Guide',
  headline: 'Weather and Pain Tracker',
  subheadline: 'Record daily pain alongside weather data — pressure, temperature, and humidity — to find out whether and how weather affects your symptoms.',
  primaryCTA: { text: 'Start tracking weather and pain', href: '/start' },
  secondaryCTA: { text: 'View the pain tracker app', href: '/start' },
  whatIsThis:
    'A tracking approach for identifying correlations between weather conditions — particularly barometric pressure changes — and chronic pain levels.',
  whoShouldUse: [
    'Anyone who suspects weather triggers their pain or flares',
    'People with arthritis, fibromyalgia, or migraine who notice weather sensitivity',
    'Anyone whose pain seems unpredictable despite consistent habits'
  ],
  howToUse: [
    { step: 1, title: 'Record pain level at the same time each day', description: 'Consistency is essential for correlation. Same time, same rating method, every day.' },
    { step: 2, title: 'Note daily weather conditions or use automatic weather data', description: 'Temperature, cloud cover, precipitation, and especially pressure changes (rising or falling) are the most pain-relevant variables.' },
    { step: 3, title: 'Review 4-6 week periods for correlation patterns', description: 'Weather-pain relationships are statistical — they show up across many data points, not single events.' }
  ],
  whyItMatters:
    'Many people report weather-related pain without being able to prove it to themselves or their care team. Tracked data either confirms the connection — allowing better preparation — or rules it out and redirects attention to actual triggers.',
  trustSignals: {
    medicalNote: 'Research on barometric pressure and joint/migraine pain shows modest but real correlations in many patients, particularly with rapid pressure drops.',
    privacyNote: 'Weather correlation data stays local on your device. The app uses Open-Meteo (no API key required) for automatic weather logging.',
    legalNote: 'Weather-correlated pain patterns can be part of a broader chronic pain documentation record.'
  },
  faqs: [
    { question: 'Does weather actually cause pain?', answer: 'Evidence is mixed but suggestive — especially for barometric pressure drops and joint pain. The effect is real for many people but highly individual. Tracking is the only way to know if it applies to you.' },
    { question: 'What weather variable matters most?', answer: 'Barometric pressure change (especially drops before storms) is the most commonly reported weather trigger. Temperature extremes and humidity changes are secondary.' },
    { question: 'How long do I need to track to find a pattern?', answer: 'At least 4-6 weeks for preliminary patterns; 3+ months for more reliable correlation data.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain Triggers', description: 'Systematic approach for all trigger types', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Pain Tracking for Arthritis', description: 'Arthritis-specific tracking including weather', href: '/resources/pain-tracking-for-arthritis' },
    { title: 'Pain Tracking for Migraines', description: 'Migraine trigger tracking including weather', href: '/resources/pain-tracking-for-migraines' },
    { title: 'Free Private Pain Tracker App', description: 'Automatic weather correlation tracking built in', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Weather and Pain Tracker', url: '/resources/weather-and-pain-tracker' }
  ]
};

export function WeatherAndPainTrackerPage() {
  return (
    <ResourcePageTemplate
      content={weatherAndPainTrackerContent}
      opening="Many people with chronic pain suspect weather affects them but cannot prove it. A weather and pain tracker makes the question answerable — correlating your daily pain ratings against barometric pressure, temperature, and precipitation over weeks to find your personal pattern. PainTracker.ca includes automatic local weather logging built in."
      ctaHref="/start"
      ctaText="Start tracking weather and pain free"
    />
  );
}

// ─── 4. Exercise and Pain Log ─────────────────────────────────────────────────

const exerciseAndPainLogContent: SEOPageContent = {
  slug: 'exercise-and-pain-log',
  title: 'Exercise and Pain Log',
  metaTitle: 'Exercise and Pain Log: Track Activity and Pain Together to Find What Helps',
  metaDescription:
    'Use a free exercise and pain log to track movement, activity type, duration, and next-day pain levels — to find what physical activity helps versus worsens your chronic pain.',
  keywords: [
    'exercise and pain log',
    'activity pain diary',
    'movement pain tracker',
    'exercise chronic pain tracking',
    'physical activity pain log'
  ],
  badge: 'Template',
  headline: 'Exercise and Pain Log',
  subheadline: 'Record what physical activity you did, how long, and the pain that followed — to build evidence about what movement helps versus what causes flares.',
  primaryCTA: { text: 'Track activity and pain with the app', href: '/start' },
  secondaryCTA: { text: 'Get the weekly pain tracker printable', href: '/resources/weekly-pain-tracker-printable' },
  whatIsThis:
    'A log for tracking the relationship between physical activity and pain — what movement you did, intensity, duration, and how pain responded in the hours and days following.',
  whoShouldUse: [
    'People in physiotherapy or rehabilitation programs',
    'Anyone managing chronic pain while trying to stay active',
    'People whose pain seems to respond unpredictably to exercise'
  ],
  howToUse: [
    { step: 1, title: 'Log activity type, duration, and perceived exertion', description: 'What you did, how long, and how hard. Keep it simple enough to fill out every time.' },
    { step: 2, title: 'Rate pain before activity and at 2, 24, and 48 hours after', description: 'Some pain responses are delayed. Same-day pain only misses post-exertional responses that appear the next day.' },
    { step: 3, title: 'Note rest days and their pain outcome too', description: 'Complete rest sometimes worsens chronic pain. Logging non-activity days reveals whether movement or rest is better for your baseline.' }
  ],
  whyItMatters:
    'For many chronic pain conditions, the right amount and type of movement helps — but finding that zone requires data. An exercise and pain log replaces guessing with evidence your physiotherapist can use.',
  trustSignals: {
    medicalNote: 'Physiotherapists and pain specialists use activity-pain diaries to identify safe movement ranges and guide graded activity programs.',
    privacyNote: 'Your activity log stays local on your device.',
    legalNote: 'Activity-pain documentation supports functional capacity assessments for disability and WorkSafeBC reviews.'
  },
  faqs: [
    { question: 'What if exercise always makes my pain worse?', answer: 'Log it anyway. Knowing the delay and magnitude of the response helps distinguish normal post-exercise soreness from pathological flare — and gives your physiotherapist data to modify the program.' },
    { question: 'What types of activity should I log?', answer: 'Everything: walking, stretching, prescribed exercises, household physical tasks, errands. Pain does not distinguish between therapeutic exercise and vacuuming.' },
    { question: 'How is this different from a fitness tracker?', answer: 'Fitness trackers measure activity output. An exercise and pain log measures the pain consequence — which is what matters for chronic pain management.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain Triggers', description: 'Systematic trigger identification including activity', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Flare-Up Tracker Printable', description: 'Log flares including activity-triggered ones', href: '/resources/flare-up-tracker-printable' },
    { title: 'Functional Capacity Log', description: 'Track daily functional limits alongside activity', href: '/resources/functional-capacity-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track activity and pain together locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Exercise and Pain Log', url: '/resources/exercise-and-pain-log' }
  ]
};

export function ExerciseAndPainLogPage() {
  return (
    <ResourcePageTemplate
      content={exerciseAndPainLogContent}
      opening="Chronic pain and exercise have a complicated relationship. The right movement often helps; too much causes flares. An exercise and pain log tracks what you did, and how pain responded over the next 48 hours — giving you and your physiotherapist actual data about where your safe zone is."
      ctaHref="/start"
      ctaText="Track activity and pain free"
    />
  );
}

// ─── 5. Free Pain Tracker App ─────────────────────────────────────────────────

const freePainTrackerAppContent: SEOPageContent = {
  slug: 'free-pain-tracker-app',
  title: 'Free Pain Tracker App',
  metaTitle: 'Free Pain Tracker App: No Account, No Cloud, Private Pain Tracking',
  metaDescription:
    'PainTracker.ca is a free pain tracker app that works without an account or cloud storage. Track pain, symptoms, medications, and triggers privately on your device.',
  keywords: [
    'free pain tracker app',
    'free chronic pain app',
    'pain tracking app no account',
    'private pain tracker',
    'offline pain tracker app free'
  ],
  badge: 'App',
  headline: 'Free Pain Tracker App',
  subheadline: 'Track pain, symptoms, medications, and triggers in a free app that stores everything on your device — no account, no cloud, no subscription required.',
  primaryCTA: { text: 'Start using the free app', href: '/start' },
  secondaryCTA: { text: 'Learn about offline tracking', href: '/offline-pain-tracker-app' },
  whatIsThis:
    'PainTracker.ca: a free, private, offline-capable pain tracking app for chronic pain management, clinical documentation, and disability workflows.',
  whoShouldUse: [
    'Anyone managing chronic pain who wants a free, private digital tool',
    'People who do not want to create accounts or share health data',
    'Anyone looking for a pain tracker that works offline'
  ],
  howToUse: [
    { step: 1, title: 'Open the app — no account needed', description: 'PainTracker.ca runs in your browser. No sign-up, no email, no cloud account required to start tracking.' },
    { step: 2, title: 'Log pain, symptoms, medications, and notes', description: 'Structured daily entries with pain scale, location, symptoms, mood, sleep, medications, and free-text notes.' },
    { step: 3, title: 'Export to PDF, CSV, or JSON any time', description: 'Generate clinical summaries, disability-ready exports, or data backups entirely from your device.' }
  ],
  whyItMatters:
    'Most "free" pain apps monetize your health data. PainTracker.ca is built on the opposite principle: your data stays on your device, and the core app is free without requiring account creation.',
  trustSignals: {
    medicalNote: 'Structured daily tracking supports better clinical documentation than memory-based reporting.',
    privacyNote: 'All data is stored locally. No data is uploaded to servers. No account is required.',
    legalNote: 'Timestamped digital records from PainTracker.ca are suitable for insurance, disability, and WorkSafeBC documentation.'
  },
  faqs: [
    { question: 'Is PainTracker.ca really free?', answer: 'Yes. The core app — daily entries, all tracking features, and exports — is free with no account required. Optional premium features exist for advanced clinical workflows.' },
    { question: 'Where is my data stored?', answer: 'On your device, in your browser\'s local storage. Nothing is uploaded to servers unless you explicitly choose to export and share.' },
    { question: 'Does it work without internet?', answer: 'Yes. After the first load, PainTracker.ca works offline as a Progressive Web App (PWA). You can install it to your home screen for full offline access.' }
  ],
  relatedLinks: [
    { title: 'Offline Pain Tracker App', description: 'How offline-first tracking works', href: '/offline-pain-tracker-app' },
    { title: 'Free Daily Pain Tracker Printable', description: 'Print-first option if you prefer paper', href: '/resources/daily-pain-tracker-printable' },
    { title: 'How to Start a Pain Journal', description: 'Getting started with consistent tracking', href: '/resources/how-to-start-a-pain-journal' },
    { title: 'WorkSafeBC Pain Journal Template', description: 'Workplace injury documentation guide', href: '/resources/worksafebc-pain-journal-template' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Free Pain Tracker App', url: '/resources/free-pain-tracker-app' }
  ]
};

export function FreePainTrackerAppPage() {
  return (
    <ResourcePageTemplate
      content={freePainTrackerAppContent}
      opening="PainTracker.ca is a free pain tracker app that does not require an account or cloud storage. Everything you log stays on your device — pain levels, symptoms, medications, triggers, mood, and notes — and you can export clean summaries any time. No sign-up. No data harvesting. Works offline."
      ctaHref="/start"
      ctaText="Open the free pain tracker app"
    />
  );
}

// ─── 6. Best Pain Tracking App ────────────────────────────────────────────────

const bestPainTrackingAppContent: SEOPageContent = {
  slug: 'best-pain-tracking-app',
  title: 'Best Pain Tracking App',
  metaTitle: 'Best Pain Tracking App for Chronic Pain: What to Look For in 2026',
  metaDescription:
    'What makes the best pain tracking app for chronic pain? Key features to look for — offline access, data ownership, clinical exports, and privacy — and how PainTracker.ca compares.',
  keywords: [
    'best pain tracking app',
    'best chronic pain app',
    'pain tracker app review',
    'pain diary app',
    'top pain tracking apps'
  ],
  badge: 'Guide',
  headline: 'Best Pain Tracking App for Chronic Pain',
  subheadline: 'What features actually matter for long-term chronic pain tracking — and what most apps get wrong about data ownership, offline access, and clinical usefulness.',
  primaryCTA: { text: 'Try PainTracker.ca free', href: '/start' },
  secondaryCTA: { text: 'See how offline tracking works', href: '/offline-pain-tracker-app' },
  whatIsThis:
    'A guide to evaluating pain tracking apps for chronic pain management — covering the features that matter for clinical usefulness, privacy, and long-term reliability.',
  whoShouldUse: [
    'Anyone comparing pain tracking apps before committing to one',
    'People who have tried other apps and found them inadequate for clinical use',
    'Anyone concerned about health data privacy in apps'
  ],
  howToUse: [
    { step: 1, title: 'Evaluate data ownership first', description: 'Where is your pain data stored? Who owns it? Can you delete it? Apps that store data in their cloud own your health history — with all the breach and access risk that entails.' },
    { step: 2, title: 'Check offline capability', description: 'A pain app that requires internet access to log entries fails at the worst times — low battery, travel, rural areas, or when you need to track most urgently.' },
    { step: 3, title: 'Test clinical export quality', description: 'Can you produce a clean, dated summary suitable for a doctor, insurance adjuster, or disability reviewer? This is where most apps fall short.' }
  ],
  whyItMatters:
    'Most pain tracking apps are optimized for engagement and data collection, not clinical usefulness or user privacy. The best app for chronic pain is the one you will actually use long-term — and that produces documentation you can trust.',
  trustSignals: {
    medicalNote: 'Clinical-grade pain documentation requires consistency, structure, and exportability — not just a place to log numbers.',
    privacyNote: 'PainTracker.ca stores all data locally with no account requirement. Your health data does not leave your device.',
    legalNote: 'Consistent, exportable records from a structured app are stronger evidence than informal notes or memory-based statements.'
  },
  faqs: [
    { question: 'What features make a pain tracking app clinically useful?', answer: 'Structured daily entry (pain scale, location, symptoms, medication, notes), consistent timestamping, offline capability, and clean export to PDF, CSV, or JSON.' },
    { question: 'Are free pain apps safe to use?', answer: 'It depends on how they monetize. Apps that offer free tracking but require accounts often monetize through data. PainTracker.ca is free, requires no account, and stores nothing on servers.' },
    { question: 'Should I use an app or paper for pain tracking?', answer: 'Apps provide timestamping, search, pattern analysis, and cleaner exports. Paper is better when digital access is unreliable. Using both — app primary, printable backup — is the most resilient approach.' }
  ],
  relatedLinks: [
    { title: 'Free Pain Tracker App', description: 'No account, no cloud, works offline', href: '/resources/free-pain-tracker-app' },
    { title: 'Offline Pain Tracker App', description: 'How PainTracker.ca works without internet', href: '/offline-pain-tracker-app' },
    { title: 'How to Track Pain for Doctors', description: 'What clinical documentation requires', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Daily Pain Tracker Printable', description: 'Paper-first backup option', href: '/resources/daily-pain-tracker-printable' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Best Pain Tracking App', url: '/resources/best-pain-tracking-app' }
  ]
};

export function BestPainTrackingAppPage() {
  return (
    <ResourcePageTemplate
      content={bestPainTrackingAppContent}
      opening="Most pain tracking apps are optimized for app store ratings and data collection, not for clinical usefulness or your privacy. This guide covers what actually matters when choosing an app for long-term chronic pain tracking — and why data ownership and offline access matter more than feature lists."
      ctaHref="/start"
      ctaText="Try PainTracker.ca free — no account needed"
    />
  );
}

// ─── 7. Pain Tracker for iPhone ───────────────────────────────────────────────

const painTrackerForIphoneContent: SEOPageContent = {
  slug: 'pain-tracker-for-iphone',
  title: 'Pain Tracker for iPhone',
  metaTitle: 'Pain Tracker for iPhone: Free App That Works Offline Without an Account',
  metaDescription:
    'PainTracker.ca works as a free pain tracker on iPhone — install it to your home screen for offline access, daily tracking, and clean exports without an Apple account or App Store download.',
  keywords: [
    'pain tracker for iPhone',
    'iOS pain tracking app',
    'iPhone pain diary',
    'pain tracker app iPhone',
    'install pain tracker iPhone'
  ],
  badge: 'App',
  headline: 'Pain Tracker for iPhone',
  subheadline: 'Install PainTracker.ca to your iPhone home screen for offline pain tracking — no App Store download, no account, no cloud storage.',
  primaryCTA: { text: 'Open PainTracker.ca on your iPhone', href: '/start' },
  secondaryCTA: { text: 'Learn about offline access', href: '/offline-pain-tracker-app' },
  whatIsThis:
    'PainTracker.ca as a Progressive Web App (PWA) on iPhone: install directly from Safari to your home screen for full offline pain tracking without App Store or account requirements.',
  whoShouldUse: [
    'iPhone users looking for a free pain tracking app',
    'Anyone who prefers not to download another App Store app',
    'People who want health data stored locally on their iPhone, not in the cloud'
  ],
  howToUse: [
    { step: 1, title: 'Open PainTracker.ca in Safari on your iPhone', description: 'The app is a Progressive Web App — it runs in Safari and can be added to your home screen like a native app.' },
    { step: 2, title: 'Tap the Share icon and select "Add to Home Screen"', description: 'This installs PainTracker.ca as an app icon on your iPhone. Launch it like any other app — it opens full-screen without the browser UI.' },
    { step: 3, title: 'Track pain offline any time', description: 'After installation, the app works completely offline. All data stays on your iPhone. No Apple ID, no iCloud, no account of any kind.' }
  ],
  whyItMatters:
    'Many pain tracking apps in the App Store require accounts, store data in the cloud, or charge subscriptions. PainTracker.ca runs entirely in Safari, installs to your home screen in seconds, and keeps your health data on your device.',
  trustSignals: {
    medicalNote: 'The same tracking features — daily pain entries, symptom logs, clinical exports — are available on iPhone as on any other device.',
    privacyNote: 'Data is stored in your iPhone\'s local browser storage. Nothing is uploaded to servers.',
    legalNote: 'Timestamped iPhone records from PainTracker.ca are suitable for medical, insurance, and disability documentation.'
  },
  faqs: [
    { question: 'Do I need to download anything from the App Store?', answer: 'No. PainTracker.ca is a web app. Open it in Safari and add it to your home screen. No App Store download required.' },
    { question: 'Does it work on iPhone without Wi-Fi?', answer: 'Yes. After the first load, PainTracker.ca works fully offline. You can log pain entries anywhere, anytime, with no internet connection.' },
    { question: 'Where is my data stored on iPhone?', answer: 'In your iPhone\'s local browser storage (IndexedDB). It does not sync to iCloud or any external server. If you clear Safari data, back up using the app\'s export function first.' }
  ],
  relatedLinks: [
    { title: 'Offline Pain Tracker App', description: 'How offline-first tracking works', href: '/offline-pain-tracker-app' },
    { title: 'Free Pain Tracker App', description: 'No account required — free core features', href: '/resources/free-pain-tracker-app' },
    { title: 'Best Pain Tracking App', description: 'How to evaluate pain tracking apps', href: '/resources/best-pain-tracking-app' },
    { title: 'How to Start a Pain Journal', description: 'Getting started with daily tracking', href: '/resources/how-to-start-a-pain-journal' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracker for iPhone', url: '/resources/pain-tracker-for-iphone' }
  ]
};

export function PainTrackerForIphonePage() {
  return (
    <ResourcePageTemplate
      content={painTrackerForIphoneContent}
      opening="PainTracker.ca works on iPhone without any App Store download or account. Open it in Safari, add it to your home screen, and it behaves like a native app — full offline access, daily pain tracking, and clean exports — all stored locally on your iPhone."
      ctaHref="/start"
      ctaText="Open PainTracker.ca on your iPhone"
    />
  );
}

// ─── 8. Pain Journal for Kids and Teens ──────────────────────────────────────

const painJournalForKidsAndTeensContent: SEOPageContent = {
  slug: 'pain-journal-for-kids-and-teens',
  title: 'Pain Journal for Kids and Teens',
  metaTitle: 'Pain Journal for Kids and Teens: Free Simple Tracking for Young People',
  metaDescription:
    'A free pain journal guide for children and teenagers — simple daily tracking of pain location, severity, triggers, and school impact to support paediatric appointments and school accommodations.',
  keywords: [
    'pain journal for kids',
    'pain tracker for children',
    'teen pain diary',
    'paediatric pain log',
    'pain tracking for teenagers'
  ],
  badge: 'Guide',
  headline: 'Pain Journal for Kids and Teens',
  subheadline: 'Simple daily pain tracking adapted for children and teenagers — pain location, severity, impact on school and activities, and patterns over time.',
  primaryCTA: { text: 'Get the daily pain tracker printable', href: '/resources/daily-pain-tracker-printable' },
  secondaryCTA: { text: 'Use the free app', href: '/start' },
  whatIsThis:
    'A guide to pain journaling adapted for children and teenagers — simpler language, school-impact tracking, and parent-friendly documentation for paediatric specialist appointments.',
  whoShouldUse: [
    'Parents tracking pain for a child or teenager',
    'Teenagers learning to self-report chronic pain',
    'Families preparing for paediatric rheumatology, neurology, or pain clinic appointments'
  ],
  howToUse: [
    { step: 1, title: 'Use simpler language and a faces pain scale', description: 'For younger children, a faces scale (Wong-Baker or similar) is more reliable than the numeric 0-10. For teens, numeric works well.' },
    { step: 2, title: 'Track school and activity impact alongside pain level', description: 'Missed school days, classes skipped, activities avoided, and sleep disruption are the most important functional data points for paediatric assessments.' },
    { step: 3, title: 'Involve the child in the tracking process', description: 'Self-reported pain by the child is diagnostically more useful than parent proxy-reporting. Even young children can learn to rate pain with support.' }
  ],
  whyItMatters:
    'Paediatric pain is often underdiagnosed and undertreated. Consistent documentation — school impact, activity limits, and pain patterns — helps paediatric specialists understand the full picture and advocate for appropriate care.',
  trustSignals: {
    medicalNote: 'Paediatric pain specialists use functional impact measures — school attendance, activity, sleep — as primary outcome measures alongside pain scores.',
    privacyNote: 'Your child\'s records stay on your device. Nothing is shared without your choice to export.',
    legalNote: 'Documented school impact and functional limits support educational accommodations and disability documentation for minors.'
  },
  faqs: [
    { question: 'What pain scale works best for children?', answer: 'The faces pain scale (Wong-Baker FACES) for ages 3-7; numeric 0-10 for children 8 and older who understand the concept. Teens can use the numeric scale reliably.' },
    { question: 'What should a child\'s pain journal include?', answer: 'Pain location (body diagram), severity (age-appropriate scale), what activity was interrupted, whether school was affected, and what helped or made it worse.' },
    { question: 'Should a parent fill in the journal or the child?', answer: 'Ideally both: the child rates their own pain, the parent adds contextual notes about function and school impact. Specialist appointments benefit from hearing directly from the child.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Simple daily format adaptable for all ages', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Symptom Tracker Printable', description: 'Track symptoms across body systems', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for paediatric specialist visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Digital tracking for teens and families', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Journal for Kids and Teens', url: '/resources/pain-journal-for-kids-and-teens' }
  ]
};

export function PainJournalForKidsAndTeensPage() {
  return (
    <ResourcePageTemplate
      content={painJournalForKidsAndTeensContent}
      opening="Tracking pain in children and teenagers requires a slightly different approach — simpler scales, school-impact focus, and involving the child in their own reporting. This guide explains how to build a pain journal that works for paediatric specialist appointments and supports educational accommodations."
      ctaHref="/resources/daily-pain-tracker-printable"
      ctaText="Download the daily pain tracker printable"
    />
  );
}

// ─── 9. Pain Diary Template Free Download ─────────────────────────────────────

const painDiaryTemplateFreeDownloadContent: SEOPageContent = {
  slug: 'pain-diary-template-free-download',
  title: 'Pain Diary Template Free Download Starter Pack',
  metaTitle: 'Pain Diary Template Free Download Starter Pack: Daily, Weekly, and Monthly Formats',
  metaDescription:
    'Open the free pain diary starter pack with daily, weekly, monthly, medication, function, and doctor-visit templates. Printable pain tracker PDFs for private tracking, appointments, and documentation.',
  keywords: [
    'pain diary template free download',
    'free pain diary template',
    'pain diary PDF download',
    'pain tracker template free',
    'printable pain diary free',
    'pain diary starter pack'
  ],
  badge: 'Printable',
  headline: 'Pain Diary Starter Pack — Free Download',
  subheadline: 'Start with a printable bundle of daily, weekly, monthly, medication, function, and appointment templates so you can track pain on paper before moving to the app.',
  primaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  secondaryCTA: { text: 'Track digitally instead', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/pain-diary-template-pdf', downloadFileName: 'pain-diary-starter-pack' },
  whatIsThis:
    'A printable starter pack that groups the most useful paper-first pain diary templates in one place: daily entries, weekly and monthly reviews, medication response notes, doctor-visit summaries, and function-impact logging. It is built for people who need a practical starting point, not another giant directory to sort through while tired or in pain.',
  whoShouldUse: [
    'Anyone who prefers print-first pain tracking',
    'People preparing templates for family members or patients',
    'Anyone who wants a backup to digital tracking',
    'People preparing for appointments, claim paperwork, or function reviews'
  ],
  howToUse: [
    { step: 1, title: 'Choose one sheet for the problem you have right now', description: 'Start with the daily tracker, the weekly review, or the doctor-visit summary instead of printing everything at once. The starter pack is meant to reduce choice overload.' },
    { step: 2, title: 'Keep the pages where symptoms actually interrupt you', description: 'Put the printable near your bed, desk, or medication area so you can record details while they are still accurate.' },
    { step: 3, title: 'Use the specialty sheets when the pattern needs more proof', description: 'Add the medication log or function log when treatment response, daily limits, or documentation quality starts to matter more than a simple pain score.' },
    { step: 4, title: 'Move to the app only when you want faster entry and exports', description: 'Paper is a valid long-term format. Switch to the app when timestamps, local analytics, or export workflows become worth it to you.' }
  ],
  whyItMatters:
    'Paper templates remain the lowest-friction way to start tracking: no account, no battery, no setup ritual, and no need to explain an app before a doctor looks at your notes. A starter pack matters because different situations need different sheets. The page is built to help you choose the smallest useful format now, then expand only if your documentation needs become more complex later.',
  trustSignals: {
    medicalNote: 'Structured paper pain diaries are commonly used in clinical appointments because they make symptom trends easier to review quickly.',
    privacyNote: 'These printable templates are paper-first and local-first. You choose what to print, keep, scan, or share.',
    legalNote: 'Consistent, dated symptom and function notes can support disability, injury, or accommodation documentation, but the template itself does not guarantee any claim outcome.'
  },
  faqs: [
    { question: 'What is included in the free pain diary starter pack?', answer: 'The starter pack points you to the core printable formats most people need first: daily, weekly, and monthly pain trackers plus appointment, medication, and function logs.' },
    { question: 'What is the best free pain diary template?', answer: 'The best format depends on your goal. Daily sheets capture symptom detail, weekly sheets help with short appointment prep, monthly sheets show longer patterns, and the specialty logs support medication or function-focused documentation.' },
    { question: 'Can I use a printed pain diary for a disability claim?', answer: 'A printed pain diary can support disability or injury documentation when it is dated, consistent, and tied to function. The stronger record is usually the one that shows the pattern over time, not just a single bad day.' },
    { question: 'Should I use digital or printable tracking?', answer: 'Printable tracking is often the easiest starting point because it works immediately and can be handed to a clinician. Digital tracking becomes useful when you want timestamps, local summaries, and export workflows. Many people use both.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Most detailed daily format', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Weekly Pain Tracker Printable', description: 'Seven-day appointment prep format', href: '/resources/weekly-pain-tracker-printable' },
    { title: 'Monthly Pain Tracker Printable', description: '30-day trend visibility', href: '/resources/monthly-pain-tracker-printable' },
    { title: 'Medication and Pain Log', description: 'Track dose timing, relief, and side effects', href: '/resources/medication-and-pain-log' },
    { title: 'Doctor Visit Pain Summary Template', description: 'A concise sheet for short appointments', href: '/resources/doctor-visit-pain-summary-template' },
    { title: 'Free Private Pain Tracker App', description: 'Digital alternative — no account needed', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary Template Free Download', url: '/resources/pain-diary-template-free-download' }
  ]
};

export function PainDiaryTemplateFreeDownloadPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryTemplateFreeDownloadContent}
      opening="The starter pack is built for the first decision, not the final one. Pick the one printable that matches your situation now, keep it near you, and add the specialty sheets only when you need stronger appointment or documentation detail."
      ctaHref="/resources/daily-pain-tracker-printable"
      ctaText="Download the daily pain diary template free"
    >
      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-6 text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Choose from the six starter-pack templates</h2>
            <p className="mt-3 text-slate-300">
              Each sheet solves a different documentation problem. Start with one. Add the others only
              if they help you explain a pattern more clearly.
            </p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
          >
            Browse the full resource hub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {painDiaryStarterPackResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <article key={resource.href} className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-900/80 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Link
                    to={resource.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                  >
                    <Download className="h-4 w-4" />
                    Open
                  </Link>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">{resource.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{resource.description}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-sky-300">
                  {resource.bestFor}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h3 className="text-lg font-semibold text-white">If you want the lowest-friction option</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Start with the daily tracker and the doctor-visit summary. That pair covers most first
              appointments without forcing you into a full diary system.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">If paper starts feeling too slow later</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Move to the offline app when you want faster entries, local pattern review, and export
              workflows while keeping the same tracking categories you started on paper.
            </p>
            <Link
              to="/start"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Try the free private pain tracker app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </ResourcePageTemplate>
  );
}

// ─── 10. Chronic Pain Self-Care Log ───────────────────────────────────────────

const chronicPainSelfCareLogContent: SEOPageContent = {
  slug: 'chronic-pain-self-care-log',
  title: 'Chronic Pain Self-Care Log',
  metaTitle: 'Chronic Pain Self-Care Log: Track Rest, Pacing, and Recovery Strategies',
  metaDescription:
    'Use a free chronic pain self-care log to track rest periods, pacing strategies, heat and cold use, breathing, and other non-medication interventions that support pain management.',
  keywords: [
    'chronic pain self-care log',
    'pain management self-care tracker',
    'pacing log chronic pain',
    'chronic pain recovery log',
    'pain coping strategies log'
  ],
  badge: 'Template',
  headline: 'Chronic Pain Self-Care Log',
  subheadline: 'Track the non-medication strategies that help manage your pain — rest, pacing, heat and cold, movement, and other self-care interventions — to find what consistently helps.',
  primaryCTA: { text: 'Track self-care with the app', href: '/start' },
  secondaryCTA: { text: 'Get the pain relief log', href: '/resources/pain-relief-log' },
  whatIsThis:
    'A daily log for recording non-medication pain management strategies — pacing, rest, heat or cold therapy, breathing techniques, movement, and other self-care — alongside pain outcomes.',
  whoShouldUse: [
    'People managing chronic pain with non-medication strategies',
    'Anyone in a pain management or rehabilitation program',
    'People learning pacing and self-management techniques'
  ],
  howToUse: [
    { step: 1, title: 'List the self-care strategies you use', description: 'Heat, cold, rest periods, breathing, gentle movement, mindfulness, pacing — identify your toolkit first.' },
    { step: 2, title: 'Log which strategies you used and when', description: 'Note the intervention, the timing, and your pain level before and after.' },
    { step: 3, title: 'Review monthly for patterns', description: 'Which strategies produce the most consistent pain reduction? Which do you use only reactively vs. preventatively?' }
  ],
  whyItMatters:
    'Non-medication strategies are often the most sustainable part of chronic pain management. A self-care log makes their contribution visible — both to you and to your care team — and helps identify what is actually working versus what feels useful in the moment.',
  trustSignals: {
    medicalNote: 'Pain management programs routinely use self-care activity logs to track coping strategy use and correlate it with pain and function outcomes.',
    privacyNote: 'Your self-care log stays on your device.',
    legalNote: 'Documented self-care and pain management efforts support disability reviews and treatment justification.'
  },
  faqs: [
    { question: 'What self-care strategies are worth tracking?', answer: 'Heat or cold therapy, rest periods (scheduled vs. collapse rest), pacing (activity-rest cycling), breathing exercises, gentle movement or stretching, mindfulness, and social support all have evidence for chronic pain management.' },
    { question: 'What is pacing and why should I log it?', answer: 'Pacing is breaking activity into smaller chunks with planned rest. For conditions like ME/CFS and fibromyalgia, unmanaged activity causes crashes. Logging pacing attempts and outcomes is how you find your personal activity envelope.' },
    { question: 'Is self-care logging different from a pain diary?', answer: 'A pain diary records what you experience. A self-care log records what you do in response. Both together give the complete picture of how you manage your pain day to day.' }
  ],
  relatedLinks: [
    { title: 'Pain Relief Log', description: 'Track what relieves pain including non-medication strategies', href: '/resources/pain-relief-log' },
    { title: 'Chronic Fatigue Symptom Log', description: 'Track pacing and energy for fatigue conditions', href: '/resources/chronic-fatigue-symptom-log' },
    { title: 'How to Track Pain Triggers', description: 'Identify what causes flares to prevent them', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Free Private Pain Tracker App', description: 'Log self-care alongside pain locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Self-Care Log', url: '/resources/chronic-pain-self-care-log' }
  ]
};

export function ChronicPainSelfCareLogPage() {
  return (
    <ResourcePageTemplate
      content={chronicPainSelfCareLogContent}
      opening="Non-medication strategies — pacing, rest, heat and cold, movement, breathing — are often the most sustainable part of chronic pain management. A self-care log tracks which strategies you used and how pain responded, making their contribution visible over time."
      ctaHref="/start"
      ctaText="Track self-care and pain free"
    />
  );
}

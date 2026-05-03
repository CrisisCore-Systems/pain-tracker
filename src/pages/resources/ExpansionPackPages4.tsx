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

// ─── 1. Pain Tracking for Back Pain ──────────────────────────────────────────

const painTrackingForBackPainContent: SEOPageContent = {
  slug: 'pain-tracking-for-back-pain',
  title: 'Pain Tracking for Back Pain',
  metaTitle: 'Pain Tracking for Back Pain: What to Record for Lower and Upper Back Pain',
  metaDescription:
    'Learn how to track back pain effectively — location, severity, posture triggers, activity impact, and treatment response — to get better care for chronic lower and upper back pain.',
  keywords: [
    'pain tracking for back pain',
    'back pain diary',
    'lower back pain log',
    'chronic back pain tracker',
    'back pain journal'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Back Pain',
  subheadline: 'Record pain location, posture triggers, functional limits, and treatment response — the data your physiotherapist, GP, or spine specialist needs.',
  primaryCTA: { text: 'Start tracking back pain', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A tracking approach for lower, middle, and upper back pain — covering the positional, activity-related, and neurological data points that help clinicians classify and treat back pain effectively.',
  whoShouldUse: [
    'People with chronic lower or upper back pain',
    'Anyone in physiotherapy or rehabilitation for back pain',
    'People preparing for orthopaedic, physiatry, or spine clinic appointments'
  ],
  howToUse: [
    { step: 1, title: 'Map pain location and radiation pattern', description: 'Is it left, right, or central? Does it radiate into the hip, buttock, or leg? Radiation patterns distinguish mechanical back pain from disc or nerve involvement.' },
    { step: 2, title: 'Log positions and activities that worsen or relieve pain', description: 'Sitting, standing, lying, walking — and how long each is tolerable before pain worsens — gives clinicians functional capacity data.' },
    { step: 3, title: 'Record any neurological symptoms', description: 'Numbness, tingling, weakness, or bladder changes alongside back pain are red flags that need separate logging and urgent reporting.' }
  ],
  whyItMatters:
    'Back pain is the most common chronic pain condition, yet it is among the most under-documented. Consistent pain diaries help distinguish mechanical pain from disc, nerve, or systemic causes — and support treatment adjustment over time.',
  trustSignals: {
    medicalNote: 'Physiotherapists and physiatrists use activity-pain diaries and functional reports directly in treatment planning for chronic back pain.',
    privacyNote: 'Your back pain records stay on your device.',
    legalNote: 'Back pain documentation supports WorkSafeBC claims, disability reviews, and ergonomic accommodation requests.'
  },
  faqs: [
    { question: 'What should I track for lower back pain?', answer: 'Pain location and radiation, severity (0-10), what triggered or worsened it, how long you could perform each posture before pain increased, what relieved it, and any neurological symptoms.' },
    { question: 'When should back pain be treated as urgent?', answer: 'New numbness, tingling, or weakness in the legs, or any loss of bladder/bowel control alongside back pain requires immediate medical attention — do not wait to track it.' },
    { question: 'How does tracking help with physiotherapy?', answer: 'Physiotherapists adjust programs based on what activities worsen vs. improve your pain. A log removes guesswork and allows data-driven progressive loading.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Detailed daily format for back pain entries', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Pain Log for Physical Therapy', description: 'Track progress during rehabilitation', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Exercise and Pain Log', description: 'Track which movements help vs. hurt', href: '/resources/exercise-and-pain-log' },
    { title: 'Free Private Pain Tracker App', description: 'Digital back pain tracking with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Back Pain', url: '/resources/pain-tracking-for-back-pain' }
  ]
};

export function PainTrackingForBackPainPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForBackPainContent}
      opening="Back pain tracking is position-specific and function-focused. The most useful data for spine clinicians and physiotherapists is how long each posture is tolerable, where the pain radiates, and what aggravates or relieves it — not just a daily pain number. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking back pain free"
    />
  );
}

// ─── 2. Pain Tracking for Nerve Pain ─────────────────────────────────────────

const painTrackingForNervePainContent: SEOPageContent = {
  slug: 'pain-tracking-for-nerve-pain',
  title: 'Pain Tracking for Nerve Pain',
  metaTitle: 'Pain Tracking for Nerve Pain: How to Log Neuropathic Symptoms and Triggers',
  metaDescription:
    'Learn how to track neuropathic pain — burning, shooting, numbness, and tingling — alongside triggers, medication response, and functional impact for neurology and pain clinic appointments.',
  keywords: [
    'pain tracking for nerve pain',
    'neuropathic pain diary',
    'nerve pain log',
    'neuropathy symptom tracker',
    'burning pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Nerve Pain',
  subheadline: 'Log the distinctive features of neuropathic pain — burning, shooting, electric, and tingling sensations — alongside triggers and medication response.',
  primaryCTA: { text: 'Start tracking nerve pain', href: '/start' },
  secondaryCTA: { text: 'Download the symptom tracker', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A tracking approach for neuropathic pain conditions including diabetic neuropathy, postherpetic neuralgia, CRPS, chemotherapy-induced neuropathy, and idiopathic nerve pain.',
  whoShouldUse: [
    'People with neuropathic pain from any cause',
    'Anyone managing diabetic neuropathy or postherpetic neuralgia',
    'People in neurology or pain clinic follow-up for nerve pain conditions'
  ],
  howToUse: [
    { step: 1, title: 'Describe the quality of pain precisely', description: 'Neuropathic pain has a distinctive vocabulary: burning, shooting, electric shock, stabbing, crawling, tingling, numbness, allodynia (pain from gentle touch). Use these terms consistently.' },
    { step: 2, title: 'Map distribution — which nerve territory is involved', description: 'Stocking-and-glove for peripheral neuropathy, dermatomal for postherpetic neuralgia, regional for CRPS. Body maps clarify distribution over time.' },
    { step: 3, title: 'Track allodynia and hyperalgesia separately', description: 'Pain triggered by light touch (allodynia) and exaggerated pain from mild stimuli (hyperalgesia) are neuropathic-specific phenomena worth tracking as distinct symptoms.' }
  ],
  whyItMatters:
    'Neuropathic pain responds poorly to standard analgesics and requires medication classes (anticonvulsants, SNRIs, tricyclics) that take weeks to titrate. Tracking symptom response to medication adjustments is essential for optimizing treatment.',
  trustSignals: {
    medicalNote: 'Neuropathic pain screening tools like the DN4 and NPSI draw on the qualitative descriptors that precise tracking captures.',
    privacyNote: 'Your nerve pain records stay on your device.',
    legalNote: 'Documented neuropathic pain with medication logs supports disability and insurance claims for complex pain conditions.'
  },
  faqs: [
    { question: 'How is tracking nerve pain different from other pain types?', answer: 'Neuropathic pain tracking emphasizes qualitative descriptors (burning, shooting, tingling), distribution (which body areas), allodynia/hyperalgesia, and medication response — more than just severity.' },
    { question: 'What medications are used for nerve pain and how do I track them?', answer: 'Gabapentin, pregabalin, duloxetine, amitriptyline, and topical lidocaine are common. Track dose changes, time to effect, side effects, and sleep impact alongside pain scores.' },
    { question: 'Should I track night-time nerve pain separately?', answer: 'Yes. Many neuropathic pain conditions worsen at night and disrupt sleep. Tracking night-time symptom severity and sleep impact separately reveals this pattern for clinicians.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Track neuropathic symptoms across body systems', href: '/resources/symptom-tracker-printable' },
    { title: 'Chronic Pain Medication Log', description: 'Track nerve pain medication titration', href: '/resources/chronic-pain-medication-log' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for neurology appointments', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Track neuropathic pain with body map locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Nerve Pain', url: '/resources/pain-tracking-for-nerve-pain' }
  ]
};

export function PainTrackingForNervePainPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForNervePainContent}
      opening="Neuropathic pain has a distinctive vocabulary — burning, shooting, electric, tingling, allodynia — and tracking it requires capturing that quality precisely, not just a number. This guide explains what to record for nerve pain conditions and why the qualitative details matter for diagnosis and treatment."
      ctaHref="/start"
      ctaText="Start tracking nerve pain free"
    />
  );
}

// ─── 3. Pain Tracker for Android ─────────────────────────────────────────────

const painTrackerForAndroidContent: SEOPageContent = {
  slug: 'pain-tracker-for-android',
  title: 'Pain Tracker for Android',
  metaTitle: 'Pain Tracker for Android: Free App That Works Offline Without an Account',
  metaDescription:
    'PainTracker.ca works as a free pain tracker on Android — add it to your home screen from Chrome for offline access, daily tracking, and clean exports without a Google account or Play Store download.',
  keywords: [
    'pain tracker for android',
    'android pain tracking app',
    'pain diary app android',
    'install pain tracker android',
    'pain tracker chrome android'
  ],
  badge: 'App',
  headline: 'Pain Tracker for Android',
  subheadline: 'Install PainTracker.ca to your Android home screen for offline pain tracking — no Play Store download, no account, no cloud storage.',
  primaryCTA: { text: 'Open PainTracker.ca on your Android', href: '/start' },
  secondaryCTA: { text: 'Learn about offline access', href: '/offline-pain-tracker-app' },
  whatIsThis:
    'PainTracker.ca as a Progressive Web App (PWA) on Android: install directly from Chrome to your home screen for full offline pain tracking without Play Store or account requirements.',
  whoShouldUse: [
    'Android users looking for a free pain tracking app',
    'Anyone who prefers not to install another Play Store app',
    'People who want health data stored locally on their phone, not in Google cloud'
  ],
  howToUse: [
    { step: 1, title: 'Open PainTracker.ca in Chrome on your Android phone', description: 'Chrome on Android supports PWA installation. The app is optimized for mobile use on any screen size.' },
    { step: 2, title: 'Tap the three-dot menu and select "Add to Home screen"', description: 'Chrome will prompt you or you can find this in the menu. The app installs as a standalone icon — no browser UI when you open it.' },
    { step: 3, title: 'Track pain offline any time', description: 'After installation, the app works completely offline. All data stays on your Android device. No Google account, no Play Store, no sync.' }
  ],
  whyItMatters:
    'Many Android pain apps require Google accounts, store data in the cloud, or come bundled with subscriptions. PainTracker.ca runs entirely in Chrome, installs in seconds, and keeps your health data on your device.',
  trustSignals: {
    medicalNote: 'The same tracking features — daily pain entries, symptom logs, clinical exports — are available on Android as on any other device.',
    privacyNote: 'Data is stored in your Android phone\'s local browser storage. Nothing is uploaded to servers.',
    legalNote: 'Timestamped Android records from PainTracker.ca are suitable for medical, insurance, and disability documentation.'
  },
  faqs: [
    { question: 'Do I need to install anything from the Play Store?', answer: 'No. PainTracker.ca is a web app. Open it in Chrome on Android and add it to your home screen. No Play Store download required.' },
    { question: 'Does it work on Android without Wi-Fi?', answer: 'Yes. After the first load, PainTracker.ca works fully offline. You can log pain entries anywhere, anytime, without an internet connection.' },
    { question: 'Where is my data stored on Android?', answer: 'In your Android phone\'s local browser storage (IndexedDB). It does not sync to Google Drive or any external server. Back up regularly using the app\'s export function.' }
  ],
  relatedLinks: [
    { title: 'Offline Pain Tracker App', description: 'How offline-first tracking works on any device', href: '/offline-pain-tracker-app' },
    { title: 'Pain Tracker for iPhone', description: 'iOS installation guide', href: '/resources/pain-tracker-for-iphone' },
    { title: 'Free Pain Tracker App', description: 'No account required — free core features', href: '/resources/free-pain-tracker-app' },
    { title: 'Best Pain Tracking App', description: 'How to evaluate pain tracking apps', href: '/resources/best-pain-tracking-app' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracker for Android', url: '/resources/pain-tracker-for-android' }
  ]
};

export function PainTrackerForAndroidPage() {
  return (
    <ResourcePageTemplate
      content={painTrackerForAndroidContent}
      opening="PainTracker.ca works on Android without any Play Store download or account. Open it in Chrome, add it to your home screen, and it behaves like a native app — full offline access, daily pain tracking, and clean exports — all stored locally on your Android device."
      ctaHref="/start"
      ctaText="Open PainTracker.ca on your Android"
    />
  );
}

// ─── 4. Pain Diary for Workers' Compensation ─────────────────────────────────

const painDiaryForWorkersCompensationContent: SEOPageContent = {
  slug: 'pain-diary-for-workers-compensation',
  title: "Pain Diary for Workers' Compensation",
  metaTitle: "Pain Diary for Workers' Compensation: How to Document a Workplace Injury Claim",
  metaDescription:
    "Learn how to keep a pain diary for a workers' compensation claim — daily pain records, functional limits, and work impact documentation that supports WSBC, WSIB, and other board reviews.",
  keywords: [
    "pain diary for workers' compensation",
    'workplace injury pain log',
    'WSBC pain documentation',
    'workers comp pain diary',
    'work injury pain tracking'
  ],
  badge: 'Guide',
  headline: "Pain Diary for Workers' Compensation",
  subheadline: "Document daily pain, functional limits, and work impact consistently — the records a compensation board adjudicator or appeal panel will rely on.",
  primaryCTA: { text: 'Start your workers\' compensation pain diary', href: '/start' },
  secondaryCTA: { text: 'Get the WorkSafeBC pain journal template', href: '/resources/worksafebc-pain-journal-template' },
  whatIsThis:
    "A documentation approach for workers' compensation pain diaries — structured for WSBC, WSIB, WCB, and other provincial and federal compensation board claims.",
  whoShouldUse: [
    "Anyone with an active workers' compensation claim involving pain",
    'People appealing a compensation board decision involving pain and function',
    'Workers documenting the functional impact of a workplace injury'
  ],
  howToUse: [
    { step: 1, title: 'Log pain daily — not only on bad days', description: 'Compensation reviewers look for consistent, dated records. Gaps in a diary raise questions. Even low-pain days deserve a brief entry.' },
    { step: 2, title: 'Document functional limits and work tasks affected', description: 'What can you no longer do, for how long, and what pain results? Specificity — "cannot sit longer than 20 minutes without pain rising to 7/10" — is more useful than general statements.' },
    { step: 3, title: 'Record how the injury affects daily life outside work', description: 'Personal care, household tasks, sleep, recreation, and family responsibilities affected by the injury build the full functional picture.' }
  ],
  whyItMatters:
    "Workers' compensation decisions turn on functional capacity evidence. A consistent, detailed pain diary is among the strongest personal evidence a claimant can produce. Without it, claims rest on clinical records that may underrepresent day-to-day impact.",
  trustSignals: {
    medicalNote: 'Compensation board adjudicators are trained to evaluate the consistency and detail of claimant-reported functional records.',
    privacyNote: 'Your diary records stay on your device unless you choose to export and share them.',
    legalNote: 'PainTracker.ca exports are timestamped and formatted for clinical and legal documentation. Consult your advocate or legal representative for claim-specific guidance.'
  },
  faqs: [
    { question: "What should a workers' compensation pain diary include?", answer: 'Date, time, pain location and severity (0-10), what activity caused or worsened pain, how long the pain lasted, what it prevented you from doing, medications taken, and any treatment received.' },
    { question: 'How far back should I start my diary?', answer: 'Start now if you have not already. Document the date of injury and initial symptoms from memory as a starting entry, then continue daily from today forward.' },
    { question: 'Can my pain diary be used as evidence in an appeal?', answer: 'Yes. A consistent, detailed, timestamped pain diary is a recognized form of claimant evidence in compensation board appeals. Work with your advocate or legal representative on how to present it.' }
  ],
  relatedLinks: [
    { title: 'WorkSafeBC Pain Journal Template', description: 'BC-specific workplace injury documentation', href: '/resources/worksafebc-pain-journal-template' },
    { title: 'Pain Diary for Disability Application', description: 'Disability claim documentation approach', href: '/resources/pain-diary-for-disability-application' },
    { title: 'Pain Diary for Insurance Claims', description: 'Insurance claim pain documentation', href: '/resources/pain-diary-for-insurance-claims' },
    { title: 'Free Private Pain Tracker App', description: 'Timestamped digital diary with export', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: "Pain Diary for Workers' Compensation", url: '/resources/pain-diary-for-workers-compensation' }
  ]
};

export function PainDiaryForWorkersCompensationPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForWorkersCompensationContent}
      opening="Workers' compensation claims involving chronic pain live or die on functional evidence. A pain diary that documents daily pain levels, specific functional limits, and work tasks affected — consistently, from the date of injury — is among the most important things you can do for your claim."
      ctaHref="/start"
      ctaText="Start your workers' compensation pain diary"
    />
  );
}

// ─── 5. Pain Diary for Rheumatologist ────────────────────────────────────────

const painDiaryForRheumatologistContent: SEOPageContent = {
  slug: 'pain-diary-for-rheumatologist',
  title: 'Pain Diary for Rheumatologist',
  metaTitle: 'Pain Diary for Rheumatologist: What to Track Before Your Appointment',
  metaDescription:
    'Learn what to record in a pain diary for a rheumatologist — morning stiffness, joint involvement, fatigue, flares, and medication response — to get the most from your appointment.',
  keywords: [
    'pain diary for rheumatologist',
    'rheumatology appointment pain log',
    'rheumatoid arthritis pain diary',
    'inflammatory arthritis tracking',
    'pain tracking for rheumatology'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Rheumatologist',
  subheadline: 'Track morning stiffness, joint counts, fatigue, and medication response between appointments — so your rheumatologist can make better treatment decisions.',
  primaryCTA: { text: 'Start your rheumatology pain diary', href: '/start' },
  secondaryCTA: { text: 'Download the doctor visit pain summary', href: '/resources/doctor-visit-pain-summary-template' },
  whatIsThis:
    'A targeted pain diary approach for rheumatology patients — covering the clinical measurements rheumatologists use for disease activity scoring and treatment adjustment.',
  whoShouldUse: [
    'People with inflammatory arthritis (RA, PsA, AS, reactive arthritis)',
    'Patients on DMARDs, biologics, or JAK inhibitors',
    'Anyone preparing for their first or follow-up rheumatology appointment'
  ],
  howToUse: [
    { step: 1, title: 'Record morning stiffness duration every day', description: 'The number of minutes until stiffness improves each morning is a clinical measure in RA disease activity scores. Record it daily, not just on bad days.' },
    { step: 2, title: 'Note which joints are painful or swollen', description: 'Rheumatologists use joint counts. Record each affected joint and its severity. Over time, patterns reveal which joints are most persistently involved.' },
    { step: 3, title: 'Track fatigue alongside pain', description: 'Inflammatory disease fatigue is a distinct symptom. Rate it separately (0-10) — it is a primary outcome measure in modern rheumatology research and treatment planning.' }
  ],
  whyItMatters:
    'Rheumatology appointments are often short. Arriving with 4-8 weeks of documented morning stiffness, joint counts, fatigue scores, and medication observations lets your rheumatologist spend consultation time on decisions rather than history-gathering.',
  trustSignals: {
    medicalNote: 'The DAS28 and CDAI disease activity scores used in RA management draw directly on the joint count and symptom data that this tracking approach captures.',
    privacyNote: 'Your rheumatology diary stays on your device.',
    legalNote: 'Documented disease activity patterns support disability and workplace accommodation reviews for inflammatory arthritis.'
  },
  faqs: [
    { question: 'What does a rheumatologist need from a pain diary?', answer: 'Morning stiffness duration, which joints are affected and how severely, fatigue score, functional limits, and how your medications are working (or not) — over the period since your last appointment.' },
    { question: 'How long before an appointment should I start tracking?', answer: 'Ideally 4-8 weeks minimum. If you have an appointment in 2 weeks, start now — even a short record is better than none.' },
    { question: 'Does tracking help with biologic approvals?', answer: 'Yes. Demonstrated inadequate response to previous medications, documented by consistent pain and function records, is required for most biologic approvals in Canada and other jurisdictions.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracking for Arthritis', description: 'Comprehensive arthritis tracking guide', href: '/resources/pain-tracking-for-arthritis' },
    { title: 'Doctor Visit Pain Summary Template', description: 'Pre-appointment summary format', href: '/resources/doctor-visit-pain-summary-template' },
    { title: 'Flare-Up Tracker Printable', description: 'Log flare episodes for your rheumatologist', href: '/resources/flare-up-tracker-printable' },
    { title: 'Free Private Pain Tracker App', description: 'Digital diary with rheumatology-ready exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Rheumatologist', url: '/resources/pain-diary-for-rheumatologist' }
  ]
};

export function PainDiaryForRheumatologistPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForRheumatologistContent}
      opening="Rheumatology appointments are short and disease activity is measured in weeks. Arriving with 4-8 weeks of daily morning stiffness, joint involvement, fatigue, and medication data lets your rheumatologist use the appointment for decisions — not history-taking. This guide explains exactly what to track and why."
      ctaHref="/start"
      ctaText="Start your rheumatology pain diary"
    />
  );
}

// ─── 6. Pain Log for Physical Therapy ────────────────────────────────────────

const painLogForPhysicalTherapyContent: SEOPageContent = {
  slug: 'pain-log-for-physical-therapy',
  title: 'Pain Log for Physical Therapy',
  metaTitle: 'Pain Log for Physical Therapy: Track Progress and Response During Rehab',
  metaDescription:
    'Use a free pain log for physical therapy to track exercise response, functional progress, and pain during rehabilitation — so your physiotherapist can adjust your program with data.',
  keywords: [
    'pain log for physical therapy',
    'physiotherapy pain diary',
    'pain tracking during rehab',
    'PT pain log',
    'physiotherapy progress tracker'
  ],
  badge: 'Template',
  headline: 'Pain Log for Physical Therapy',
  subheadline: 'Track prescribed exercises, pain response, and functional milestones between physiotherapy appointments — data your PT needs to progress your program.',
  primaryCTA: { text: 'Track physio progress with the app', href: '/start' },
  secondaryCTA: { text: 'Get the exercise and pain log', href: '/resources/exercise-and-pain-log' },
  whatIsThis:
    'A log designed for people in physiotherapy or occupational therapy rehabilitation — tracking prescribed exercises, pain response, functional limits, and week-over-week progress.',
  whoShouldUse: [
    'Anyone in physiotherapy for musculoskeletal or chronic pain conditions',
    'People in post-surgical rehabilitation',
    'Anyone doing home exercise programs prescribed by a physiotherapist'
  ],
  howToUse: [
    { step: 1, title: 'Log each prescribed exercise with reps, sets, and pain response', description: 'Did pain increase, stay the same, or improve? What was the level during vs. after? Physiotherapists adjust programs based on this exact data.' },
    { step: 2, title: 'Note pain and stiffness before and after each session', description: 'Pre- and post-session pain ratings reveal whether the session helped or set you back — the most important question in progressive rehabilitation.' },
    { step: 3, title: 'Track functional milestones between appointments', description: 'Can you walk further? Sit longer? Reach overhead? Functional gains between appointments tell your physiotherapist the program is working.' }
  ],
  whyItMatters:
    'Physiotherapy is a data-driven process. Physiotherapists can only progress your program safely if they know how your pain responded to the last session and whether function is improving. A between-session log removes the guesswork.',
  trustSignals: {
    medicalNote: 'Physiotherapists use outcome measures and patient-reported exercise responses to make evidence-based decisions about program progression.',
    privacyNote: 'Your rehabilitation log stays on your device.',
    legalNote: 'Documented physiotherapy participation and progress supports insurance, WSBC, and disability documentation.'
  },
  faqs: [
    { question: 'What should I log after each physio session?', answer: 'Exercises completed (with reps/sets), pain during each exercise (0-10), pain level immediately after the session, and pain level the following morning.' },
    { question: 'What if I cannot complete the prescribed exercises because of pain?', answer: 'Log that too — what you attempted, what pain level stopped you, and what you modified. This is exactly the data your physiotherapist needs to adjust the program.' },
    { question: 'How do I track progress over weeks?', answer: 'Track the same functional tests weekly: how far you can walk, how long you can sit, what you can lift. Consistent functional measures reveal progress more reliably than pain scores alone.' }
  ],
  relatedLinks: [
    { title: 'Exercise and Pain Log', description: 'Track activity and pain response together', href: '/resources/exercise-and-pain-log' },
    { title: 'Functional Capacity Log', description: 'Track daily functional limits during rehab', href: '/resources/functional-capacity-log' },
    { title: 'Pain Tracking for Back Pain', description: 'Back pain-specific rehabilitation tracking', href: '/resources/pain-tracking-for-back-pain' },
    { title: 'Free Private Pain Tracker App', description: 'Digital rehab tracking with exports for your PT', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Log for Physical Therapy', url: '/resources/pain-log-for-physical-therapy' }
  ]
};

export function PainLogForPhysicalTherapyPage() {
  return (
    <ResourcePageTemplate
      content={painLogForPhysicalTherapyContent}
      opening="Physiotherapy progress depends on data your physiotherapist does not have access to between appointments — how you responded to each exercise, whether pain improved or worsened, and what functional milestones you reached. A between-session pain log gives your PT what they need to advance your program safely."
      ctaHref="/start"
      ctaText="Track physio progress free"
    />
  );
}

// ─── 7. Chronic Pain Medication Log ──────────────────────────────────────────

const chronicPainMedicationLogContent: SEOPageContent = {
  slug: 'chronic-pain-medication-log',
  title: 'Chronic Pain Medication Log',
  metaTitle: 'Chronic Pain Medication Log: Track Medications, Doses, and Effectiveness',
  metaDescription:
    'Use a free chronic pain medication log to track medications, doses, timing, side effects, and pain relief effectiveness — for safe management and better prescriber conversations.',
  keywords: [
    'chronic pain medication log',
    'pain medication tracker',
    'medication diary chronic pain',
    'pain medication effectiveness log',
    'prescription pain medication log'
  ],
  badge: 'Template',
  headline: 'Chronic Pain Medication Log',
  subheadline: 'Track medications, doses, timing, and relief effectiveness — the record your prescriber needs to optimize your pain medication safely.',
  primaryCTA: { text: 'Track medications with the app', href: '/start' },
  secondaryCTA: { text: 'Get the medication and pain log printable', href: '/resources/medication-and-pain-log' },
  whatIsThis:
    'A structured medication log for chronic pain — tracking all pain medications including scheduled, as-needed, and supplemental, alongside their effectiveness and side effects.',
  whoShouldUse: [
    'People managing multiple pain medications',
    'Anyone titrating a new pain medication and monitoring response',
    'People whose prescriber has asked them to track medication effectiveness'
  ],
  howToUse: [
    { step: 1, title: 'Log every medication with exact dose and time', description: 'Scheduled medications, as-needed doses, and any supplemental medications (OTC, topical, supplements). Timing accuracy matters for identifying patterns.' },
    { step: 2, title: 'Rate pain before and 1-2 hours after each dose', description: 'This is the core effectiveness measure. How much does pain change, and for how long? Time-to-effect and duration-of-relief are what prescribers need for dose adjustments.' },
    { step: 3, title: 'Note side effects separately', description: 'Nausea, sedation, dizziness, constipation, cognitive changes — logged by medication and dose — allows prescribers to balance efficacy against tolerability.' }
  ],
  whyItMatters:
    'Prescribers adjusting pain medications need effectiveness and tolerability data across days and weeks — not a single appointment-day report. A consistent medication log provides the evidence base for informed prescribing decisions.',
  trustSignals: {
    medicalNote: 'Medication response tracking is a standard recommendation in chronic pain management guidelines for optimizing analgesic regimens.',
    privacyNote: 'Your medication log stays on your device. Medication data is Class A — highly sensitive — and is never uploaded.',
    legalNote: 'A consistent medication log supports insurance prior authorization, disability documentation, and prescriber continuity across transitions.'
  },
  faqs: [
    { question: 'Should I log over-the-counter medications too?', answer: 'Yes. OTC analgesics (ibuprofen, acetaminophen, naproxen), topicals, and supplements all affect pain management and can interact with prescription medications. Log everything.' },
    { question: 'What if I forget to take a medication at the usual time?', answer: 'Log the missed or delayed dose too. Gaps and timing variations help prescribers understand why pain control is inconsistent.' },
    { question: 'How do I track PRN (as-needed) medications?', answer: 'Log the time you took it, what triggered the decision (pain level), and how well it worked. Frequency of PRN use is a key signal for prescribers about scheduled medication adequacy.' }
  ],
  relatedLinks: [
    { title: 'Medication and Pain Log Printable', description: 'Printable medication and pain tracking template', href: '/resources/medication-and-pain-log' },
    { title: 'Daily Pain Tracker Printable', description: 'Daily format including medication section', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Doctor Visit Pain Summary Template', description: 'Summarize medication log for appointments', href: '/resources/doctor-visit-pain-summary-template' },
    { title: 'Free Private Pain Tracker App', description: 'Digital medication log with structured entries', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Medication Log', url: '/resources/chronic-pain-medication-log' }
  ]
};

export function ChronicPainMedicationLogPage() {
  return (
    <ResourcePageTemplate
      content={chronicPainMedicationLogContent}
      opening="Optimizing chronic pain medication requires data across weeks, not impressions from a single appointment. A medication log that records dose timing, pain before and after each dose, effectiveness duration, and side effects gives your prescriber the information they need to make adjustments safely."
      ctaHref="/start"
      ctaText="Track medications and pain free"
    />
  );
}

// ─── 8. Daily Symptom Tracker ─────────────────────────────────────────────────

const dailySymptomTrackerContent: SEOPageContent = {
  slug: 'daily-symptom-tracker',
  title: 'Daily Symptom Tracker',
  metaTitle: 'Daily Symptom Tracker: Free Template for Chronic Illness and Pain Management',
  metaDescription:
    'Use a free daily symptom tracker to log pain, fatigue, sleep, mood, brain fog, and other chronic illness symptoms — for better clinical appointments and personal pattern awareness.',
  keywords: [
    'daily symptom tracker',
    'symptom tracking daily',
    'chronic illness symptom log',
    'daily health tracker',
    'symptom diary free'
  ],
  badge: 'Template',
  headline: 'Daily Symptom Tracker',
  subheadline: 'Log pain, fatigue, sleep, mood, brain fog, and other symptoms every day — to build the pattern data your care team needs and you deserve.',
  primaryCTA: { text: 'Start daily symptom tracking', href: '/start' },
  secondaryCTA: { text: 'Download the symptom tracker printable', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A free daily symptom tracking approach for people managing chronic pain, chronic illness, or multi-system conditions — covering all symptom domains, not just pain.',
  whoShouldUse: [
    'People with chronic pain, fibromyalgia, ME/CFS, autoimmune conditions, or other chronic illness',
    'Anyone tracking multiple symptoms across different body systems',
    'People building evidence for undiagnosed or complex conditions'
  ],
  howToUse: [
    { step: 1, title: 'Track all symptoms at the same time each day', description: 'Consistency of timing matters for pattern detection. An evening check-in that covers pain, fatigue, sleep, cognitive symptoms, and mood takes under 3 minutes.' },
    { step: 2, title: 'Rate each symptom on its own scale', description: 'Pain on 0-10, fatigue on 0-10, brain fog on 0-10, sleep quality on 0-10. Separate ratings reveal which symptoms correlate and which are independent.' },
    { step: 3, title: 'Add a brief contextual note', description: 'One sentence about what was notable — high stress, unusual activity, missed medication, travel — gives context to score spikes that numbers alone cannot explain.' }
  ],
  whyItMatters:
    'Many chronic conditions produce multiple interacting symptoms. Tracking only pain misses the full picture. Daily tracking across symptom domains reveals which symptoms cluster, what triggers multi-system flares, and whether any treatment is helping all dimensions.',
  trustSignals: {
    medicalNote: 'Multi-domain symptom tracking is a clinical recommendation for complex chronic conditions where single-symptom assessment misses disease burden.',
    privacyNote: 'All symptom records stay on your device.',
    legalNote: 'Comprehensive daily symptom logs covering all affected domains produce stronger disability and insurance documentation than pain scores alone.'
  },
  faqs: [
    { question: 'What symptoms should I track daily?', answer: 'Pain (location and severity), fatigue, sleep quality and hours, cognitive symptoms (brain fog, memory, concentration), mood (anxiety, depression, irritability), and any condition-specific symptoms you have been asked to monitor.' },
    { question: 'Is daily tracking realistic for someone with chronic illness?', answer: 'Yes, if the format is minimal. A structured app entry covering 6-8 domains takes under 3 minutes. The key is consistency over completeness — a simple entry every day beats a detailed entry twice a week.' },
    { question: 'How long until symptom patterns become visible?', answer: 'Preliminary patterns emerge at 2-4 weeks. Reliable correlation and trigger data requires 6-12 weeks of consistent daily tracking.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Printable multi-domain symptom tracking template', href: '/resources/symptom-tracker-printable' },
    { title: 'Chronic Fatigue Symptom Log', description: 'Fatigue-specific tracking for ME/CFS', href: '/resources/chronic-fatigue-symptom-log' },
    { title: 'How to Track Pain Triggers', description: 'Systematic trigger identification', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Free Private Pain Tracker App', description: 'Multi-domain daily symptom tracking app', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Daily Symptom Tracker', url: '/resources/daily-symptom-tracker' }
  ]
};

export function DailySymptomTrackerPage() {
  return (
    <ResourcePageTemplate
      content={dailySymptomTrackerContent}
      opening="Chronic conditions rarely produce just pain. Fatigue, sleep disruption, brain fog, and mood changes travel with it. A daily symptom tracker captures all of these — taking under 3 minutes — to build the multi-domain picture your care team needs and that you deserve to see."
      ctaHref="/start"
      ctaText="Start daily symptom tracking free"
    />
  );
}

// ─── 9. Pain Tracking App for Seniors ────────────────────────────────────────

const painTrackingAppForSeniorsContent: SEOPageContent = {
  slug: 'pain-tracking-app-for-seniors',
  title: 'Pain Tracking App for Seniors',
  metaTitle: 'Pain Tracking App for Seniors: Simple, Free, and Offline-Capable',
  metaDescription:
    'PainTracker.ca is a simple, free pain tracking app for seniors — large text, high contrast, no account required, and offline-capable for tracking pain and medications at home.',
  keywords: [
    'pain tracking app for seniors',
    'pain diary app older adults',
    'simple pain tracker seniors',
    'easy pain tracking app',
    'pain app for elderly'
  ],
  badge: 'App',
  headline: 'Pain Tracking App for Seniors',
  subheadline: 'A simple, free, offline-capable pain tracker for older adults — no account, no subscription, no confusing cloud setup.',
  primaryCTA: { text: 'Open the free pain tracker', href: '/start' },
  secondaryCTA: { text: 'Get the printable version instead', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'PainTracker.ca as a pain management tool for older adults and seniors — simple entry, offline access, high-contrast interface, and print-ready exports for doctor appointments.',
  whoShouldUse: [
    'Seniors managing chronic pain conditions',
    'Family members or caregivers setting up tracking for an older adult',
    'Older adults preparing for GP, specialist, or geriatric appointments'
  ],
  howToUse: [
    { step: 1, title: 'Open PainTracker.ca on any tablet or computer — no download needed', description: 'The app runs in any modern browser. No App Store, no account, no passwords to remember. Open the browser, go to paintracker.ca, and start.' },
    { step: 2, title: 'Log pain once daily — takes under 2 minutes', description: 'Rate pain (0-10), choose location on the body diagram, add a brief note if desired. Simple structured entry that does not require typing for most fields.' },
    { step: 3, title: 'Print a summary before each doctor appointment', description: 'One-tap export produces a clean PDF summary of recent pain records, medications, and symptoms to hand to your doctor.' }
  ],
  whyItMatters:
    'Pain is significantly underreported in older adults, contributing to undertreated chronic pain. A simple daily log that produces a print-ready summary for appointments is one of the most practical tools for improving pain management in older age.',
  trustSignals: {
    medicalNote: 'Systematic review evidence shows that structured pain diaries improve pain assessment and treatment in older adults compared to recall-based reporting.',
    privacyNote: 'No personal information is required. No account, no cloud, no data sharing without your explicit choice.',
    legalNote: 'Printed pain records from PainTracker.ca are accepted documentation for GP referrals, disability assessments, and care planning reviews.'
  },
  faqs: [
    { question: 'Is PainTracker.ca easy for seniors to use?', answer: 'The interface is designed for simplicity — large touch targets, clear labels, minimal steps. If you can browse the web, you can use PainTracker.ca. A family member can help set it up as a home screen shortcut.' },
    { question: 'What if an older adult does not want to use a computer?', answer: 'The printable daily pain tracker is a full paper alternative. Download and print a month of pages. It covers the same tracking fields as the app.' },
    { question: 'Can a caregiver fill in the tracker on behalf of a senior?', answer: 'Yes. For cognitively impaired older adults, a caregiver or family member can fill in daily entries based on observed behaviour and pain signs. Proxy reporting is noted and accepted in clinical documentation.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Paper alternative for non-digital users', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Medication and Pain Log', description: 'Track medications alongside pain', href: '/resources/medication-and-pain-log' },
    { title: 'Doctor Visit Pain Summary Template', description: 'Pre-appointment summary for GP visits', href: '/resources/doctor-visit-pain-summary-template' },
    { title: 'Free Private Pain Tracker App', description: 'No account — open and start tracking today', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking App for Seniors', url: '/resources/pain-tracking-app-for-seniors' }
  ]
};

export function PainTrackingAppForSeniorsPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingAppForSeniorsContent}
      opening="Pain tracking for older adults needs to be simple, reliable, and not dependent on cloud accounts or app store downloads. PainTracker.ca runs in any browser, requires no account, works offline, and produces a print-ready summary for doctor appointments. If a print-first option is preferred, the daily pain tracker printable covers the same fields on paper."
      ctaHref="/start"
      ctaText="Open the free pain tracker — no account needed"
    />
  );
}

// ─── 10. Pain Diary for Personal Injury Claim ────────────────────────────────

const painDiaryForPersonalInjuryClaimContent: SEOPageContent = {
  slug: 'pain-diary-for-personal-injury-claim',
  title: 'Pain Diary for Personal Injury Claim',
  metaTitle: 'Pain Diary for Personal Injury Claim: How to Document Pain and Function for Legal Proceedings',
  metaDescription:
    'Learn how to keep a pain diary for a personal injury claim — daily pain records, functional limits, and life impact documentation that supports legal proceedings and insurance negotiations.',
  keywords: [
    'pain diary for personal injury claim',
    'personal injury pain log',
    'pain documentation for lawsuit',
    'ICBC pain diary',
    'MVA pain journal'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Personal Injury Claim',
  subheadline: 'Document daily pain, functional impact, and life disruption consistently — the records that support legal proceedings and insurance negotiations.',
  primaryCTA: { text: 'Start your personal injury pain diary', href: '/start' },
  secondaryCTA: { text: 'Get the pain diary for insurance claims', href: '/resources/pain-diary-for-insurance-claims' },
  whatIsThis:
    'A documentation approach for personal injury pain diaries — structured for motor vehicle accident (ICBC), slip-and-fall, and other personal injury legal and insurance processes.',
  whoShouldUse: [
    'People with active personal injury claims involving chronic pain',
    'Anyone negotiating with ICBC, insurance companies, or through legal counsel',
    'People documenting pain and functional impact from an injury for potential litigation'
  ],
  howToUse: [
    { step: 1, title: 'Start documenting from the date of injury — or today', description: 'The earlier you begin, the stronger your record. Document initial symptoms and their progression. If some time has passed, begin now and note the date you started tracking.' },
    { step: 2, title: 'Describe functional impact in concrete, specific terms', description: '"I cannot drive for more than 20 minutes without pain reaching 8/10" is more useful than "driving is painful." Specificity is what legal and insurance processes require.' },
    { step: 3, title: 'Document how the injury affects work, family, and daily life', description: 'Lost work days, activities abandoned, help needed from others, relationships affected — the full life impact of the injury is part of a personal injury claim.' }
  ],
  whyItMatters:
    'Personal injury claims involving chronic pain depend heavily on documented evidence of functional impact. A consistent daily diary, maintained from near the time of injury, is among the most compelling evidence a claimant can produce.',
  trustSignals: {
    medicalNote: 'Personal injury lawyers and insurance adjusters treat consistent daily pain diaries as primary evidence of injury-related functional impairment.',
    privacyNote: 'Your diary stays on your device. Share exports only when advised by your legal representative.',
    legalNote: 'Consult your lawyer about how your diary records may be used in discovery, mediation, or trial. Keep entries factual, specific, and contemporaneous.'
  },
  faqs: [
    { question: 'What should a personal injury pain diary include?', answer: 'Date, pain location and severity (0-10), specific activities limited or prevented, work impact (hours lost, tasks avoided), personal care impact, sleep disruption, medications taken, and medical appointments attended.' },
    { question: 'Will my pain diary be seen by the other side in litigation?', answer: 'Potentially yes — through discovery. Keep entries factual and contemporaneous. Avoid exaggeration or speculation. Consistent, honest records are the most credible.' },
    { question: 'What is an ICBC pain diary?', answer: 'In BC, ICBC (Insurance Corporation of British Columbia) handles motor vehicle accident claims. A pain diary maintained after an MVA is a key piece of evidence for demonstrating the ongoing impact of the accident.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary for Insurance Claims', description: 'Insurance claim documentation approach', href: '/resources/pain-diary-for-insurance-claims' },
    { title: "Pain Diary for Workers' Compensation", description: "Workers' comp documentation guide", href: '/resources/pain-diary-for-workers-compensation' },
    { title: 'Functional Capacity Log', description: 'Track daily functional limits for legal documentation', href: '/resources/functional-capacity-log' },
    { title: 'Free Private Pain Tracker App', description: 'Timestamped daily diary with legal-ready exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Personal Injury Claim', url: '/resources/pain-diary-for-personal-injury-claim' }
  ]
};

export function PainDiaryForPersonalInjuryClaimPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForPersonalInjuryClaimContent}
      opening="Personal injury claims involving chronic pain depend on evidence of functional impact — what you could no longer do, how your daily life changed, and how long the effects persisted. A consistent daily pain diary started near the date of injury is among the strongest forms of that evidence. This guide explains what to record and how."
      ctaHref="/start"
      ctaText="Start your personal injury pain diary"
    />
  );
}

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

// ─── 1. Pain Tracking for Fibromyalgia ───────────────────────────────────────

const painTrackingForFibromyalgiaContent: SEOPageContent = {
  slug: 'pain-tracking-for-fibromyalgia',
  title: 'Pain Tracking for Fibromyalgia',
  metaTitle: 'Pain Tracking for Fibromyalgia: What to Record and Why It Helps',
  metaDescription:
    'Learn how to track fibromyalgia pain effectively: widespread pain, fatigue, fibro fog, sleep quality, flares, and treatment response — all in one place.',
  keywords: [
    'pain tracking for fibromyalgia',
    'fibromyalgia pain diary',
    'fibromyalgia symptom log',
    'fibro fog tracking',
    'fibromyalgia flare log'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Fibromyalgia',
  subheadline: 'Record widespread pain, fatigue, fibro fog, sleep, and flares to find patterns your treatment team can act on.',
  primaryCTA: { text: 'Start tracking fibromyalgia symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the fibromyalgia pain diary', href: '/resources/fibromyalgia-pain-diary' },
  whatIsThis:
    'A tracking approach designed for fibromyalgia\'s multi-domain symptom profile: widespread pain, fatigue, sleep disturbance, cognitive changes, and sensitivity flares.',
  whoShouldUse: [
    'People newly diagnosed with fibromyalgia',
    'Anyone preparing for rheumatology follow-ups',
    'People tracking treatment response over months'
  ],
  howToUse: [
    { step: 1, title: 'Track all six symptom domains daily', description: 'Pain, fatigue, sleep, fog, mood, and sensitivity — because fibromyalgia is multi-system.' },
    { step: 2, title: 'Note flare duration and triggers', description: 'Overexertion, sleep disruption, and stress are the most common flare triggers to track.' },
    { step: 3, title: 'Bring 4-week summaries to appointments', description: 'Rheumatologists use trend data, not point-in-time snapshots, to adjust treatment plans.' }
  ],
  whyItMatters:
    'Fibromyalgia symptoms fluctuate widely. Consistent tracking over weeks reveals baselines, flare cycles, and what actually improves or worsens your function.',
  trustSignals: {
    medicalNote: 'Fibromyalgia diagnosis and treatment use longitudinal symptom patterns, not single visits.',
    privacyNote: 'Your symptom data stays on your device unless you choose to export.',
    legalNote: 'Documented flare patterns support disability and insurance reviews.'
  },
  faqs: [
    { question: 'What should I track for fibromyalgia?', answer: 'Widespread pain (locations and intensity), fatigue level, sleep hours and quality, cognitive fog severity, mood, activity done, and any flare triggers.' },
    { question: 'How often should I log?', answer: 'Once daily at the same time captures the best baseline. Brief entries work — you can always add detail later.' },
    { question: 'Will tracking actually help?', answer: 'Yes. Patients who bring consistent logs to appointments receive faster treatment adjustments than those relying on recall.' }
  ],
  relatedLinks: [
    { title: 'Fibromyalgia Pain Diary Printable', description: '6-page fibro-specific symptom tracker', href: '/resources/fibromyalgia-pain-diary' },
    { title: 'Symptom Tracker Printable', description: 'Track 40+ symptoms alongside pain', href: '/resources/symptom-tracker-printable' },
    { title: 'How to Describe Pain to Doctors', description: 'Translate your experience into clinical language', href: '/resources/how-to-describe-pain' },
    { title: 'Free Private Pain Tracker App', description: 'Start tracking all symptoms locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Fibromyalgia', url: '/resources/pain-tracking-for-fibromyalgia' }
  ]
};

export function PainTrackingForFibromyalgiaPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForFibromyalgiaContent}
      opening="Fibromyalgia tracking requires more than a pain scale. This guide walks through the six symptom domains that matter most — pain, fatigue, sleep, fog, mood, and sensitivity — and explains how to use that data in appointments."
      ctaHref="/start"
      ctaText="Start tracking fibromyalgia symptoms free"
    />
  );
}

// ─── 2. How to Use a Pain Scale ───────────────────────────────────────────────

const howToUsePainScaleContent: SEOPageContent = {
  slug: 'how-to-use-pain-scale',
  title: 'How to Use a Pain Scale',
  metaTitle: 'How to Use a Pain Scale Correctly: NRS, VAS, and Functional Impact',
  metaDescription:
    'Learn how to use a pain scale accurately — the 0-10 NRS, VAS, and faces scale — including what each number means and how to report pain consistently to your doctor.',
  keywords: [
    'how to use a pain scale',
    'pain scale 0 to 10',
    'numeric rating scale pain',
    'pain score for doctor',
    'pain scale numbers meaning'
  ],
  badge: 'Guide',
  headline: 'How to Use a Pain Scale Correctly',
  subheadline: 'Understand what 0 to 10 actually means, why consistency matters, and how to give your doctor a number they can act on.',
  primaryCTA: { text: 'Get the pain scale reference chart', href: '/resources/pain-scale-chart-printable' },
  secondaryCTA: { text: 'Track pain with the app', href: '/start' },
  whatIsThis:
    'A practical guide to using the Numeric Rating Scale (NRS) — the standard 0-10 pain scoring tool — and understanding how to apply it consistently across days and appointments.',
  whoShouldUse: [
    'Anyone new to structured pain tracking',
    'People unsure how to assign a pain number',
    'Anyone who finds their pain scores feel inconsistent visit to visit'
  ],
  howToUse: [
    { step: 1, title: 'Anchor 0 and 10 for yourself', description: '0 = no pain at all. 10 = the worst pain you can imagine, unbearable. Anchoring these makes the middle consistent.' },
    { step: 2, title: 'Rate current pain, average pain, and worst pain', description: 'Doctors often need all three: right now, your typical day, and your worst recent moment.' },
    { step: 3, title: 'Include functional impact alongside the number', description: '"6/10 — cannot sit for more than 10 minutes" gives more clinical information than a number alone.' }
  ],
  whyItMatters:
    'Inconsistent pain scoring makes it hard for clinicians to see whether treatment is working. Calibrated, consistent numbers turn your pain into usable data.',
  trustSignals: {
    medicalNote: 'The 0-10 Numeric Rating Scale is the clinical standard used across hospitals, clinics, and disability assessments.',
    privacyNote: 'Pain scores recorded in the app stay local to your device.',
    legalNote: 'Consistent scale use strengthens the credibility of documented pain records in claims.'
  },
  faqs: [
    { question: 'What does a 7 on the pain scale mean?', answer: 'Roughly: severe pain that makes normal activity very difficult. You can still function but it takes significant effort and dominates your attention.' },
    { question: 'Should I rate average or current pain?', answer: 'Both when possible. Current pain captures the moment; average pain is more representative for treatment decisions.' },
    { question: 'Is the faces pain scale the same as NRS?', answer: 'Similar but different. The faces scale uses expressions rather than numbers and is designed for children or people who find numbers harder to use.' }
  ],
  relatedLinks: [
    { title: 'Pain Scale Chart Printable', description: 'Free 0-10 NRS visual reference', href: '/resources/pain-scale-chart-printable' },
    { title: 'How to Describe Pain to Doctors', description: 'Words and patterns beyond the number', href: '/resources/how-to-describe-pain' },
    { title: 'How to Track Pain for Doctors', description: 'What your doctor actually needs from you', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Free Private Pain Tracker App', description: 'Log pain scores locally every day', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Use a Pain Scale', url: '/resources/how-to-use-pain-scale' }
  ]
};

export function HowToUsePainScalePage() {
  return (
    <ResourcePageTemplate
      content={howToUsePainScaleContent}
      opening="The pain scale is more useful than most people think — but only if used consistently. This guide explains how to anchor your personal 0 and 10, when to rate average vs. current pain, and why adding a single line of functional impact makes your number much more useful to your care team."
      ctaHref="/resources/pain-scale-chart-printable"
      ctaText="Get the pain scale chart"
    />
  );
}

// ─── 3. Pain Diary for Insurance Claims ──────────────────────────────────────

const painDiaryForInsuranceClaimsContent: SEOPageContent = {
  slug: 'pain-diary-for-insurance-claims',
  title: 'Pain Diary for Insurance Claims',
  metaTitle: 'Pain Diary for Insurance Claims: What to Document and Why It Matters',
  metaDescription:
    'Learn how to keep a pain diary that supports insurance claims — what adjusters look for, what to record daily, and how to organize evidence that survives review.',
  keywords: [
    'pain diary for insurance claims',
    'pain documentation for insurance',
    'insurance pain log',
    'chronic pain insurance claim',
    'pain diary for disability claim'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Insurance Claims',
  subheadline: 'Document chronic pain in a format that holds up to adjuster review — daily entries, functional limits, and a consistent record that speaks for itself.',
  primaryCTA: { text: 'Start documenting with the app', href: '/start' },
  secondaryCTA: { text: 'See the disability documentation guide', href: '/resources/documenting-pain-for-disability-claim' },
  whatIsThis:
    'A structured approach to maintaining a pain diary specifically for insurance claim purposes — capturing what adjusters and reviewers look for: consistency, functional impact, and corroboration.',
  whoShouldUse: [
    'Anyone with an active insurance or disability claim',
    'People managing long-term disability (LTD) cases',
    'Anyone whose claim has been disputed or is under review'
  ],
  howToUse: [
    { step: 1, title: 'Record functional limits, not just pain scores', description: 'What you could not do today because of pain — standing, carrying, driving, concentrating — is what reviewers need.' },
    { step: 2, title: 'Log consistently, not selectively', description: 'Daily entries over weeks are more credible than detailed notes only on bad days. Include good days too.' },
    { step: 3, title: 'Export clean summaries for your file', description: 'A monthly export showing trends, averages, and functional patterns is stronger evidence than raw handwritten notes.' }
  ],
  whyItMatters:
    'Insurance adjusters look for functional impact across time — not just one bad day. A consistent diary that shows how pain limits your daily life every week is far stronger than memory-based statements.',
  trustSignals: {
    medicalNote: 'Clinicians use consistent pain records to corroborate functional limitations in insurance assessments.',
    privacyNote: 'Your diary stays on your device. You control what gets exported and shared.',
    legalNote: 'Pain documentation created contemporaneously carries more evidentiary weight than retrospective accounts.'
  },
  faqs: [
    { question: 'What do insurance adjusters look for in a pain diary?', answer: 'Consistency over time, functional limitations tied to pain levels, medication use, and whether your documented limits match your medical records.' },
    { question: 'Should I record good days?', answer: 'Yes. A diary that only records bad days looks selective. Recording variable pain across all days is more credible.' },
    { question: 'Can I use a digital diary for an insurance claim?', answer: 'Yes. Timestamped digital records are generally accepted. Use an app that creates consistent, dated entries.' }
  ],
  relatedLinks: [
    { title: 'Documenting Pain for Disability Claims', description: 'Complete evidence guide', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Journal for Disability Benefits', description: 'Benefits-ready template', href: '/resources/pain-journal-for-disability-benefits' },
    { title: 'Daily Functioning Log for Disability', description: 'Track functional limitations evaluators need', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'Free Private Pain Tracker App', description: 'Build a consistent timestamped record', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Insurance Claims', url: '/resources/pain-diary-for-insurance-claims' }
  ]
};

export function PainDiaryForInsuranceClaimsPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForInsuranceClaimsContent}
      opening="Insurance claims live or die on documentation. A pain diary built for this purpose records not just how you feel but what you could not do — and does it consistently enough to survive adjuster review. This guide explains what to include and how to structure your record."
      ctaHref="/start"
      ctaText="Start your insurance-ready pain diary"
    />
  );
}

// ─── 4. Printable Symptom Checklist ──────────────────────────────────────────

const printableSymptomChecklistContent: SEOPageContent = {
  slug: 'printable-symptom-checklist',
  title: 'Printable Symptom Checklist',
  metaTitle: 'Printable Symptom Checklist: Free 40+ Symptom Log for Doctor Visits',
  metaDescription:
    'Download a free printable symptom checklist covering 40+ symptoms — pain, fatigue, sleep, mood, GI, and cognitive — to prepare for appointments and track changes.',
  keywords: [
    'printable symptom checklist',
    'symptom checklist for doctor',
    'symptom tracking printable',
    'chronic illness symptom list',
    'symptom log printable'
  ],
  badge: 'Printable',
  headline: 'Printable Symptom Checklist',
  subheadline: 'Check off 40+ symptoms, rate severity, and note changes — one page that summarizes what your body has been doing since your last appointment.',
  primaryCTA: { text: 'Download the symptom tracker printable', href: '/resources/symptom-tracker-printable' },
  secondaryCTA: { text: 'Track symptoms with the app', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/symptom-tracker-printable', downloadFileName: 'printable-symptom-checklist' },
  whatIsThis:
    'A printable symptom checklist covering the most common physical, cognitive, sleep, mood, and pain symptoms for people managing chronic illness.',
  whoShouldUse: [
    'Anyone managing multiple symptoms across body systems',
    'People preparing for new specialist appointments',
    'Anyone who forgets symptoms during appointments'
  ],
  howToUse: [
    { step: 1, title: 'Check each symptom you experienced this period', description: 'Use the past 2-4 weeks before an appointment for the most useful snapshot.' },
    { step: 2, title: 'Rate severity for your most significant symptoms', description: 'Mild / moderate / severe ratings help clinicians prioritize.' },
    { step: 3, title: 'Bring the completed list to your appointment', description: 'Hand it to your doctor at the start of the visit so they can reference it while you talk.' }
  ],
  whyItMatters:
    'Symptom recall under appointment pressure is unreliable. A pre-filled checklist ensures nothing important gets left out of the conversation.',
  trustSignals: {
    medicalNote: 'Symptom checklists improve appointment efficiency by reducing recall errors.',
    privacyNote: 'Print and keep control of your own copy. No data leaves your device.',
    legalNote: 'Comprehensive symptom documentation supports disability and insurance reviews.'
  },
  faqs: [
    { question: 'What symptoms should be on the checklist?', answer: 'Pain (location, type, severity), fatigue, sleep quality, mood, brain fog, GI symptoms, headaches, sensory changes, and functional limits are the most clinically useful.' },
    { question: 'How often should I fill it out?', answer: 'Weekly tracking is ideal. Even monthly before appointments is better than nothing.' },
    { question: 'Can I adapt the checklist for a specific condition?', answer: 'Yes. The symptom tracker printable includes condition-specific categories. Use the digital app to track only what applies to you.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Full 40+ symptom daily log', href: '/resources/symptom-tracker-printable' },
    { title: 'Symptom Journal Template', description: 'Structured journal with categories', href: '/resources/symptom-journal-template' },
    { title: 'How to Track Pain for Doctors', description: 'What your doctor needs from your records', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Free Private Pain Tracker App', description: 'Digital symptom tracking, local-only', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Printable Symptom Checklist', url: '/resources/printable-symptom-checklist' }
  ]
};

export function PrintableSymptomChecklistPage() {
  return (
    <ResourcePageTemplate
      content={printableSymptomChecklistContent}
      opening="Most people forget symptoms the moment they walk into an appointment. A pre-filled symptom checklist solves that. This page links to a free printable covering 40+ symptoms across pain, fatigue, sleep, mood, and cognitive categories."
      ctaHref="/resources/symptom-tracker-printable"
      ctaText="Download the symptom tracker printable"
    />
  );
}

// ─── 5. Pain Relief Log ───────────────────────────────────────────────────────

const painReliefLogContent: SEOPageContent = {
  slug: 'pain-relief-log',
  title: 'Pain Relief Log',
  metaTitle: 'Pain Relief Log: Free Printable for Tracking What Actually Helps',
  metaDescription:
    'Track what relieves your pain — medications, heat, rest, movement, and other interventions — with a free pain relief log that shows what actually works over time.',
  keywords: [
    'pain relief log',
    'pain management log',
    'track pain relief',
    'what helps pain log',
    'pain intervention tracker'
  ],
  badge: 'Printable',
  headline: 'Pain Relief Log',
  subheadline: 'Record what you tried, what worked, and how long relief lasted — so you and your care team can see what actually helps.',
  primaryCTA: { text: 'Start tracking relief with the app', href: '/start' },
  secondaryCTA: { text: 'Get the medication and pain log', href: '/resources/medication-and-pain-log' },
  utilityBlock: { type: 'download', downloadUrl: '/resources/medication-and-pain-log', downloadFileName: 'pain-relief-log' },
  whatIsThis:
    'A focused log for recording pain relief interventions — medication, heat or cold, movement, rest, pacing — and their effectiveness over time.',
  whoShouldUse: [
    'Anyone managing chronic pain with multiple interventions',
    'People trialing new medications or treatments',
    'Anyone building an evidence base for treatment decisions'
  ],
  howToUse: [
    { step: 1, title: 'Log pain level before each intervention', description: 'A baseline score before treatment makes the relief measurable.' },
    { step: 2, title: 'Record the intervention, dose, and timing', description: 'What you took or did, when, and how much.' },
    { step: 3, title: 'Score pain 30, 60, and 120 minutes later', description: 'Tracking duration and degree of relief identifies what actually helps versus what only masks pain briefly.' }
  ],
  whyItMatters:
    'Without a relief log, patterns are invisible. You might be convinced one thing helps when the data shows something else is the consistent predictor.',
  trustSignals: {
    medicalNote: 'Treatment response tracking is used by pain specialists to adjust medication timing and type.',
    privacyNote: 'Relief logs stay on your device. You share only what you choose.',
    legalNote: 'Documented medication use and response supports insurance and disability reviews.'
  },
  faqs: [
    { question: 'What should I track in a pain relief log?', answer: 'Pain before, the intervention (type, dose, time), pain at 30/60/120 minutes, and any side effects or functional change.' },
    { question: 'Can I track non-medication relief?', answer: 'Yes — heat, cold, movement, rest, pacing, position changes, and breathing techniques are all worth logging if you use them.' },
    { question: 'How is this different from a medication log?', answer: 'A relief log focuses on outcome (did it help?) while a medication log focuses on adherence (did I take it?). Both have value.' }
  ],
  relatedLinks: [
    { title: 'Medication and Pain Log', description: 'Free printable for dose, timing, and relief tracking', href: '/resources/medication-and-pain-log' },
    { title: 'Flare-Up Tracker Printable', description: 'Log flare onset, triggers, and recovery', href: '/resources/flare-up-tracker-printable' },
    { title: 'How to Track Pain Triggers', description: 'Find what causes pain, not just what relieves it', href: '/resources/how-to-track-pain-triggers' },
    { title: 'Free Private Pain Tracker App', description: 'Track relief and triggers digitally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Relief Log', url: '/resources/pain-relief-log' }
  ]
};

export function PainReliefLogPage() {
  return (
    <ResourcePageTemplate
      content={painReliefLogContent}
      opening="Knowing what relieves your pain is as important as knowing what causes it. A pain relief log tracks what you tried, when, and whether it worked — over enough time to tell signal from coincidence."
      ctaHref="/start"
      ctaText="Start tracking relief with the app"
    />
  );
}

// ─── 6. Pain Tracking Before Surgery ─────────────────────────────────────────

const painTrackingBeforeSurgeryContent: SEOPageContent = {
  slug: 'pain-tracking-before-surgery',
  title: 'Pain Tracking Before Surgery',
  metaTitle: 'Pain Tracking Before Surgery: What to Document and How It Helps',
  metaDescription:
    'Learn what to track before surgery — baseline pain levels, functional limits, medication use, and symptom patterns — to help your surgical team and support recovery comparison.',
  keywords: [
    'pain tracking before surgery',
    'pre-surgery pain documentation',
    'baseline pain before surgery',
    'pain diary before operation',
    'surgical outcome tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking Before Surgery',
  subheadline: 'Establish a documented baseline before surgery so your recovery has a real comparison point — and your surgical team has your full pain history.',
  primaryCTA: { text: 'Start pre-surgery tracking', href: '/start' },
  secondaryCTA: { text: 'Get the symptom tracker printable', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A guide to establishing documented pre-surgical baselines — pain levels, functional capacity, medication use, and symptom patterns — that support informed surgical decisions and meaningful recovery comparisons.',
  whoShouldUse: [
    'Anyone preparing for elective or urgent surgery',
    'People on surgical waitlists building a documentation record',
    'Anyone whose surgery outcome will be compared to pre-op function'
  ],
  howToUse: [
    { step: 1, title: 'Start tracking at least 2-4 weeks before surgery', description: 'The longer the baseline period, the more useful it is for surgical teams and insurance reviewers.' },
    { step: 2, title: 'Record daily pain, function, and medication', description: 'Pain intensity, what you cannot do, and what you take to manage it — these are the three critical baselines.' },
    { step: 3, title: 'Share a summary with your surgical team', description: 'A clean pre-op summary helps anesthesiologists, surgeons, and rehabilitation teams plan and benchmark.' }
  ],
  whyItMatters:
    'Without pre-surgical documentation, recovery comparisons are based on memory. A tracked baseline lets you and your team make objective judgments about improvement — or lack of it.',
  trustSignals: {
    medicalNote: 'Pre-operative functional assessment is standard in elective surgery planning and outcome measurement.',
    privacyNote: 'Your records stay local. Share only what you choose with your care team.',
    legalNote: 'Pre-surgical documentation supports disability and insurance claims tied to surgical outcomes.'
  },
  faqs: [
    { question: 'How far before surgery should I start tracking?', answer: 'At least 2-4 weeks. If you are on a long waitlist, tracking monthly is worth doing from the date of surgical booking.' },
    { question: 'What baseline data matters most?', answer: 'Pain severity (average and worst), what you cannot do because of pain, current medications and doses, and any recent flare patterns.' },
    { question: 'Should I continue tracking after surgery?', answer: 'Yes. Post-surgical tracking against your pre-op baseline is the most useful data you can have for recovery and any complications.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Document full baseline before surgery', href: '/resources/symptom-tracker-printable' },
    { title: 'Functional Capacity Log', description: 'Track what you can and cannot do', href: '/resources/functional-capacity-log' },
    { title: 'Medication and Pain Log', description: 'Record pre-op medication baseline', href: '/resources/medication-and-pain-log' },
    { title: 'Free Private Pain Tracker App', description: 'Build a consistent pre-op record', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking Before Surgery', url: '/resources/pain-tracking-before-surgery' }
  ]
};

export function PainTrackingBeforeSurgeryPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingBeforeSurgeryContent}
      opening="The window before surgery is when your pain baseline matters most. This guide explains what to document in the weeks before an operation — pain levels, functional limits, and medication use — to give both your surgical team and your recovery comparison something solid to work from."
      ctaHref="/start"
      ctaText="Start pre-surgery tracking free"
    />
  );
}

// ─── 7. Chronic Fatigue Symptom Log ──────────────────────────────────────────

const chronicFatigueSymptomLogContent: SEOPageContent = {
  slug: 'chronic-fatigue-symptom-log',
  title: 'Chronic Fatigue Symptom Log',
  metaTitle: 'Chronic Fatigue Symptom Log: Free ME/CFS and Fatigue Tracking Template',
  metaDescription:
    'Download a free chronic fatigue symptom log to track energy, post-exertional malaise, sleep, cognitive function, pain, and daily activity — essential for ME/CFS and chronic fatigue management.',
  keywords: [
    'chronic fatigue symptom log',
    'ME/CFS symptom tracker',
    'fatigue symptom diary',
    'chronic fatigue syndrome log',
    'post-exertional malaise tracker'
  ],
  badge: 'Template',
  headline: 'Chronic Fatigue Symptom Log',
  subheadline: 'Track energy levels, PEM crashes, sleep, cognitive fog, pain, and daily capacity — the six core domains for ME/CFS and chronic fatigue management.',
  primaryCTA: { text: 'Start tracking fatigue symptoms', href: '/start' },
  secondaryCTA: { text: 'Get the symptom tracker printable', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A symptom log designed for ME/CFS, post-viral fatigue, and chronic fatigue conditions — focusing on energy envelope tracking, post-exertional malaise (PEM), sleep, and cognitive function.',
  whoShouldUse: [
    'People diagnosed with ME/CFS or chronic fatigue syndrome',
    'People experiencing post-COVID fatigue',
    'Anyone managing severe chronic fatigue alongside pain'
  ],
  howToUse: [
    { step: 1, title: 'Rate energy at morning, midday, and evening', description: 'Fatigue fluctuates through the day. Three-point daily tracking reveals your energy envelope.' },
    { step: 2, title: 'Log all activity and rest periods', description: 'PEM often appears 24-72 hours after exertion. Connecting activity to crashes requires detailed logs.' },
    { step: 3, title: 'Track cognitive symptoms separately', description: 'Brain fog, memory problems, and word-finding difficulties deserve their own severity rating — they affect function as much as physical symptoms.' }
  ],
  whyItMatters:
    'Chronic fatigue conditions require pacing. You cannot pace effectively without knowing your baseline, your envelope, and what triggers crashes. Consistent logging makes the invisible visible.',
  trustSignals: {
    medicalNote: 'ME/CFS specialists use activity and symptom logs to identify PEM patterns and guide pacing strategies.',
    privacyNote: 'Your fatigue log stays on your device. No data is transmitted.',
    legalNote: 'Documented fatigue severity and functional limits support disability applications for ME/CFS.'
  },
  faqs: [
    { question: 'What is post-exertional malaise and how do I track it?', answer: 'PEM is a worsening of symptoms after physical or mental exertion, typically delayed 12-72 hours. Track energy and symptoms for 2-3 days after any activity increase.' },
    { question: 'How is fatigue different from tiredness?', answer: 'Fatigue in ME/CFS is not resolved by rest. It is a system-wide functional impairment. Rate it separately from sleepiness and track whether it responds to rest at all.' },
    { question: 'Can I use this log for post-COVID fatigue?', answer: 'Yes. The same tracking framework applies — energy, PEM, cognitive symptoms, sleep, and activity tolerance.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Track 40+ symptoms including fatigue domains', href: '/resources/symptom-tracker-printable' },
    { title: 'Symptom Journal Template', description: 'Structured daily journal with cognitive categories', href: '/resources/symptom-journal-template' },
    { title: 'Pain Tracking for Fibromyalgia', description: 'Multi-domain tracking for overlap conditions', href: '/resources/pain-tracking-for-fibromyalgia' },
    { title: 'Free Private Pain Tracker App', description: 'Digital fatigue and symptom tracking', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Fatigue Symptom Log', url: '/resources/chronic-fatigue-symptom-log' }
  ]
};

export function ChronicFatigueSymptomLogPage() {
  return (
    <ResourcePageTemplate
      content={chronicFatigueSymptomLogContent}
      opening="Chronic fatigue is not about being tired. It is about knowing your energy envelope — and what crashes it. This log covers the core tracking domains for ME/CFS: morning, midday, and evening energy; activity; rest; PEM delay; cognitive symptoms; and sleep."
      ctaHref="/start"
      ctaText="Start tracking fatigue symptoms free"
    />
  );
}

// ─── 8. Functional Capacity Log ──────────────────────────────────────────────

const functionalCapacityLogContent: SEOPageContent = {
  slug: 'functional-capacity-log',
  title: 'Functional Capacity Log',
  metaTitle: 'Functional Capacity Log: Free Printable for Daily Limitations and Activities',
  metaDescription:
    'Track what you can and cannot do each day with a free functional capacity log — self-care, household tasks, work, social activity, and physical tolerance for disability and medical review.',
  keywords: [
    'functional capacity log',
    'daily functional limitations log',
    'functional capacity tracker',
    'ADL tracking for disability',
    'activity of daily living log'
  ],
  badge: 'Template',
  headline: 'Functional Capacity Log',
  subheadline: 'Record what you can and cannot do each day — self-care, household, work tasks, social, and physical activity — in the format disability and medical reviewers use.',
  primaryCTA: { text: 'Start your functional capacity log', href: '/start' },
  secondaryCTA: { text: 'See the disability functioning log', href: '/resources/daily-functioning-log-for-disability' },
  whatIsThis:
    'A daily functional capacity log tracking activities of daily living (ADLs), instrumental ADLs, work capacity, and physical tolerance — in a format aligned with disability and occupational health assessments.',
  whoShouldUse: [
    'Anyone documenting functional limits for disability claims',
    'People undergoing occupational health or functional capacity evaluations',
    'Anyone managing chronic pain that affects their ability to work or perform daily tasks'
  ],
  howToUse: [
    { step: 1, title: 'Log what you attempted, completed, and could not do', description: 'Three-category tracking (attempted, partial, could not do) is more useful than a binary yes/no.' },
    { step: 2, title: 'Note duration and recovery time for each task', description: 'How long you can stand, walk, sit, or lift matters. How long you need to rest after it matters equally.' },
    { step: 3, title: 'Record on bad days as well as good days', description: 'Variability is part of your functional profile. A log that only shows bad days misrepresents your actual capacity range.' }
  ],
  whyItMatters:
    'Disability assessments focus on what you can do consistently, not just at your worst. A functional capacity log documents your actual daily range — including inconsistency — which is often the most important evidence.',
  trustSignals: {
    medicalNote: 'Occupational therapists and disability evaluators use ADL tracking to assess functional capacity under standard criteria.',
    privacyNote: 'Your log stays local. You control what gets exported for any review.',
    legalNote: 'Functional capacity documentation is central evidence in disability, WorkSafeBC, and LTD claim reviews.'
  },
  faqs: [
    { question: 'What is a functional capacity evaluation (FCE)?', answer: 'A formal assessment by an occupational therapist of what physical activities you can perform. Your daily log provides the self-reported baseline that contextualizes FCE results.' },
    { question: 'What categories should a functional log cover?', answer: 'Self-care (bathing, dressing, preparing food), household tasks, work-related tasks, social activity, and physical tolerances (sitting, standing, walking, carrying).' },
    { question: 'How is this different from a pain diary?', answer: 'A pain diary records what you feel. A functional capacity log records what you do or cannot do. Both are needed for disability documentation.' }
  ],
  relatedLinks: [
    { title: 'Daily Functioning Log for Disability', description: 'Disability-specific ADL tracking template', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'Documenting Pain for Disability Claims', description: 'Complete evidence guide', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Diary for Insurance Claims', description: 'What adjusters look for in documentation', href: '/resources/pain-diary-for-insurance-claims' },
    { title: 'Free Private Pain Tracker App', description: 'Track function and pain together locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Functional Capacity Log', url: '/resources/functional-capacity-log' }
  ]
};

export function FunctionalCapacityLogPage() {
  return (
    <ResourcePageTemplate
      content={functionalCapacityLogContent}
      opening="Disability assessments measure function, not pain. This log tracks what you actually do or cannot do each day — self-care, household tasks, work activity, and physical tolerance — in the format reviewers and occupational therapists use."
      ctaHref="/start"
      ctaText="Start your functional capacity log free"
    />
  );
}

// ─── 9. Pain Diary for Disability Application ─────────────────────────────────

const painDiaryForDisabilityApplicationContent: SEOPageContent = {
  slug: 'pain-diary-for-disability-application',
  title: 'Pain Diary for Disability Application',
  metaTitle: 'Pain Diary for Disability Application: What to Track, How to Format, and Why It Matters',
  metaDescription:
    'Learn how to keep a pain diary for a disability application — what evaluators look for, what to document daily, and how to create a record that supports your claim.',
  keywords: [
    'pain diary for disability application',
    'pain documentation disability',
    'disability pain log',
    'chronic pain disability diary',
    'pain records for CPP disability'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Disability Application',
  subheadline: 'Document chronic pain in the format disability evaluators use — consistent daily records, functional limits, and a clear picture of how pain affects your ability to work.',
  primaryCTA: { text: 'Start your disability pain diary', href: '/start' },
  secondaryCTA: { text: 'See the complete disability documentation guide', href: '/resources/documenting-pain-for-disability-claim' },
  whatIsThis:
    'A guide to building a pain diary specifically for disability applications — covering what evaluators look for, what to document, and how to organize months of records into a coherent evidence package.',
  whoShouldUse: [
    'Anyone applying for CPP-D, SSDI, LTD, WorkSafeBC, or similar disability benefits',
    'People whose disability application has been denied and who need stronger documentation',
    'Anyone starting a pain diary to build a future disability case'
  ],
  howToUse: [
    { step: 1, title: 'Track daily pain level, function, and medication', description: 'The three non-negotiables: how bad the pain is, what you could not do because of it, and what you took to manage it.' },
    { step: 2, title: 'Document good and bad days honestly', description: 'Applications that only show suffering look incomplete. Show your full range — including how unpredictable your capacity is.' },
    { step: 3, title: 'Export monthly summaries for your file', description: 'A 3-6 month diary summary showing consistent functional limitation is far stronger evidence than a current-state report alone.' }
  ],
  whyItMatters:
    'Disability evaluators must see that your limitations are consistent, chronic, and not just on your worst days. A contemporaneous diary — built over months — is the most credible evidence type available outside of clinical records.',
  trustSignals: {
    medicalNote: 'Treating physicians use pain diaries to corroborate functional limitation reports in disability applications.',
    privacyNote: 'Your diary stays on your device. Export only what supports your claim, on your terms.',
    legalNote: 'Contemporaneous records created over time carry more legal and administrative weight than retrospective accounts.'
  },
  faqs: [
    { question: 'How long should I keep a pain diary before applying?', answer: 'At least 3 months of consistent records significantly strengthens a disability application. Six months is better. Start now even if your application is not imminent.' },
    { question: 'What if I did not start a diary before applying?', answer: 'Start immediately. Even documentation from the point of application forward demonstrates current functional status and trend.' },
    { question: 'Should I include good days?', answer: 'Yes. A diary that only records suffering looks selective. Variability is a feature of chronic pain, and showing it honestly is more credible.' }
  ],
  relatedLinks: [
    { title: 'Documenting Pain for Disability Claims', description: 'Complete evidence guide with what adjusters look for', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Journal for Disability Benefits', description: 'Benefits-ready tracking template', href: '/resources/pain-journal-for-disability-benefits' },
    { title: 'Functional Capacity Log', description: 'Track daily functional limitations', href: '/resources/functional-capacity-log' },
    { title: 'Free Private Pain Tracker App', description: 'Build a consistent, timestamped disability record', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Disability Application', url: '/resources/pain-diary-for-disability-application' }
  ]
};

export function PainDiaryForDisabilityApplicationPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForDisabilityApplicationContent}
      opening="Disability evaluators look for one thing: consistent evidence of functional limitation over time. A pain diary built specifically for this purpose gives you that evidence — daily records of pain, function, and medication, organized into the format that matters for CPP-D, LTD, WorkSafeBC, and similar applications."
      ctaHref="/start"
      ctaText="Start your disability pain diary free"
    />
  );
}

// ─── 10. Sleep and Pain Tracker ───────────────────────────────────────────────

const sleepAndPainTrackerContent: SEOPageContent = {
  slug: 'sleep-and-pain-tracker',
  title: 'Sleep and Pain Tracker',
  metaTitle: 'Sleep and Pain Tracker: Free Template for Tracking How Sleep Affects Pain',
  metaDescription:
    'Track the connection between sleep and pain with a free sleep and pain tracker. Record sleep hours, quality, wake-ups, and next-day pain to find patterns that affect your recovery.',
  keywords: [
    'sleep and pain tracker',
    'sleep pain diary',
    'track sleep and pain together',
    'sleep quality pain correlation',
    'sleep deprivation pain log'
  ],
  badge: 'Template',
  headline: 'Sleep and Pain Tracker',
  subheadline: 'Record sleep hours, quality, wake-ups, and next-day pain levels to uncover how your sleep and pain interact.',
  primaryCTA: { text: 'Track sleep and pain with the app', href: '/start' },
  secondaryCTA: { text: 'Get the weekly pain tracker printable', href: '/resources/weekly-pain-tracker-printable' },
  whatIsThis:
    'A combined sleep and pain tracking template for finding correlations between sleep patterns and pain levels — a relationship that affects most people with chronic pain.',
  whoShouldUse: [
    'People whose pain disrupts sleep or sleep disrupts pain',
    'Anyone whose clinician has asked them to track sleep alongside pain',
    'People managing fibromyalgia, chronic fatigue, or migraine where sleep is a primary trigger'
  ],
  howToUse: [
    { step: 1, title: 'Record sleep at the same time each morning', description: 'Hours slept, number of wake-ups, and a subjective quality rating (1-5) give three separate sleep signals.' },
    { step: 2, title: 'Rate pain upon waking before you move', description: 'Morning pain before activity reveals baseline — it is less affected by daytime triggers than afternoon or evening readings.' },
    { step: 3, title: 'Review weekly to find correlations', description: 'Look for patterns: does a bad sleep night predict worse pain the next day? Does waking pain predict afternoon function?' }
  ],
  whyItMatters:
    'Poor sleep worsens pain sensitivity. Chronic pain disrupts sleep. Tracking both at the same time reveals which direction the cycle runs for you — and what interventions might break it.',
  trustSignals: {
    medicalNote: 'Sleep disruption is both a symptom and a driver of chronic pain. Sleep-pain correlation data is used in pain management plans.',
    privacyNote: 'Your sleep and pain records stay on your device — no uploads, no sharing by default.',
    legalNote: 'Sleep disruption documentation supports disability applications where pain-related insomnia affects function.'
  },
  faqs: [
    { question: 'Does sleep really affect pain that much?', answer: 'Yes. Research consistently shows that poor sleep increases pain sensitivity the following day. The relationship runs both directions — pain disrupts sleep, and disrupted sleep amplifies pain.' },
    { question: 'What sleep data should I track?', answer: 'Hours asleep, estimated number of wake-ups, overall quality (1-5), and how rested you feel in the morning. Waking pain level before you get up is the most useful pain correlation point.' },
    { question: 'What if I cannot sleep because of pain?', answer: 'Log the pain-sleep disruption directly. Note if pain woke you, what you tried, and how long you were awake. This is important clinical data.' }
  ],
  relatedLinks: [
    { title: 'Weekly Pain Tracker Printable', description: 'Seven days of pain with sleep columns', href: '/resources/weekly-pain-tracker-printable' },
    { title: 'Symptom Tracker Printable', description: 'Track sleep quality alongside 40+ symptoms', href: '/resources/symptom-tracker-printable' },
    { title: 'Chronic Fatigue Symptom Log', description: 'Track energy, PEM, and sleep for fatigue conditions', href: '/resources/chronic-fatigue-symptom-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track sleep and pain together digitally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Sleep and Pain Tracker', url: '/resources/sleep-and-pain-tracker' }
  ]
};

export function SleepAndPainTrackerPage() {
  return (
    <ResourcePageTemplate
      content={sleepAndPainTrackerContent}
      opening="Sleep and chronic pain run in a cycle — poor sleep worsens pain, and pain disrupts sleep. Tracking them together is the only way to see which direction the cycle runs for you, and whether any intervention actually breaks it."
      ctaHref="/start"
      ctaText="Track sleep and pain free with the app"
    />
  );
}

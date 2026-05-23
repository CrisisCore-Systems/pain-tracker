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

// ─── 1. Pain Tracking for CRPS ───────────────────────────────────────────────

const painTrackingForCrpsContent: SEOPageContent = {
  slug: 'pain-tracking-for-crps',
  title: 'Pain Tracking for CRPS',
  metaTitle: 'Pain Tracking for CRPS: How to Log Complex Regional Pain Syndrome Symptoms',
  metaDescription:
    'Learn how to track CRPS pain effectively — allodynia, skin changes, temperature asymmetry, motor dysfunction, and treatment response — to support pain clinic and specialist appointments and disability documentation.',
  keywords: [
    'pain tracking for CRPS',
    'complex regional pain syndrome diary',
    'CRPS symptom log',
    'CRPS pain journal',
    'RSD pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for CRPS',
  subheadline: 'Document allodynia, temperature and color asymmetry, swelling, motor changes, and disability impact so CRPS records reflect the full syndrome instead of just pain intensity.',
  primaryCTA: { text: 'Start tracking CRPS symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the CRPS pain diary', href: '/resources/crps-pain-diary-template' },
  whatIsThis:
    'A tracking approach for Complex Regional Pain Syndrome that follows the same multi-domain logic specialists use when they think in Budapest-criteria terms. It captures disproportionate pain, allodynia, temperature and color asymmetry, sweating or swelling changes, motor dysfunction, and trophic change progression, while also preserving the day-to-day evidence often needed when CRPS is challenged by insurers, employers, or non-specialist clinicians.',
  whoShouldUse: [
    'People diagnosed with CRPS Type I or Type II',
    'Anyone tracking CRPS symptoms for pain clinic or specialist appointments',
    'People building evidence for CRPS-related disability or insurance claims',
    'Anyone whose CRPS symptoms fluctuate enough that a single appointment snapshot misses the real pattern'
  ],
  howToUse: [
    { step: 1, title: 'Track sensory symptoms separately from baseline pain', description: 'Log allodynia, hyperalgesia, burning pain, and touch intolerance as distinct symptoms. CRPS is not just high pain. The type of pain and what triggers it is part of the evidence.' },
    { step: 2, title: 'Document autonomic asymmetry with each entry', description: 'Compare color, temperature, swelling, and sweating changes to the unaffected side. Timestamped asymmetry is often what turns a vague report into convincing clinical documentation.' },
    { step: 3, title: 'Note motor and trophic changes over time', description: 'Track weakness, tremor, stiffness, dystonia, reduced range of motion, skin texture, nail change, or hair change. These shifts often develop over weeks and matter for severity, staging, and disability evidence.' },
    { step: 4, title: 'Pair each treatment with the after-effect', description: 'Record what happened after PT, desensitization, mirror therapy, medication, nerve blocks, pacing, or rest. Specialists need to see whether function improved, flared, or plateaued after each intervention.' }
  ],
  whyItMatters:
    'CRPS is one of the most frequently doubted pain diagnoses, especially when imaging is limited or symptoms fluctuate between visits. Detailed documentation across sensory, autonomic, motor, and trophic domains makes the condition harder to dismiss and more actionable to treat. It also creates a stronger record when work capacity, benefit eligibility, or long-term disability support depends on proving that the syndrome affects far more than pain score alone.',
  trustSignals: {
    medicalNote: 'The Budapest Criteria for CRPS diagnosis require documented signs and symptoms across four categories: sensory, vasomotor, sudomotor/oedema, and motor/trophic — all of which detailed tracking captures.',
    privacyNote: 'Your CRPS records stay on your device.',
    legalNote: 'CRPS documentation supports disability claims, WorkSafeBC appeals, and legal proceedings — conditions where objective evidence is often disputed.'
  },
  faqs: [
    { question: 'What should I track for CRPS?', answer: 'Track pain severity, allodynia, skin color and temperature changes, swelling, sweating, tremor, weakness, range of motion, and trophic changes. CRPS needs multi-domain tracking because the syndrome is broader than pain alone.' },
    { question: 'How do I document skin temperature changes?', answer: 'Compare the affected and unaffected side at roughly the same time each day and describe the difference clearly. If you have a thermometer, log the difference, but consistent descriptive comparison is still useful.' },
    { question: 'How does CRPS tracking support an insurance claim?', answer: 'CRPS is frequently questioned because symptoms can fluctuate and standard imaging may not explain the severity. A daily log showing persistent sensory, autonomic, and motor disruption makes the condition harder to dismiss.' }
  ],
  relatedLinks: [
    { title: 'CRPS Pain Diary Template', description: 'Printable CRPS-specific diary aligned with Budapest-style symptom tracking', href: '/resources/crps-pain-diary-template' },
    { title: 'Symptom Tracker Printable', description: 'Multi-domain symptom tracking for CRPS', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Tracking for Nerve Pain', description: 'Track neuropathic pain components of CRPS', href: '/resources/pain-tracking-for-nerve-pain' },
    { title: 'Daily Functioning Log for Disability', description: 'Document CRPS function loss for claims and accommodations', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'Pain Diary for Long-Term Disability', description: 'Document CRPS for LTD insurance', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Free Private Pain Tracker App', description: 'Track CRPS symptoms locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for CRPS', url: '/resources/pain-tracking-for-crps' }
  ]
};

export function PainTrackingForCrpsPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForCrpsContent}
      opening="CRPS is one of the most disputed chronic pain conditions, and a useful record has to show more than pain severity. Sensory change, autonomic asymmetry, swelling, motor disruption, and daily function all matter. This guide explains what to track so the record reflects the syndrome instead of a single symptom."
      ctaHref="/start"
      ctaText="Start tracking CRPS symptoms free"
    />
  );
}

// ─── 2. Pain Tracking for Sciatica ───────────────────────────────────────────

const painTrackingForSciaticaContent: SEOPageContent = {
  slug: 'pain-tracking-for-sciatica',
  title: 'Pain Tracking for Sciatica',
  metaTitle: 'Pain Tracking for Sciatica: What to Log for Nerve Pain Down the Leg',
  metaDescription:
    'Learn how to track sciatica pain effectively — leg radiation pattern, neurological symptoms, posture and activity triggers, and treatment response — to support GP, physiotherapy, and specialist appointments.',
  keywords: [
    'pain tracking for sciatica',
    'sciatica pain diary',
    'sciatica log',
    'sciatic nerve pain tracker',
    'leg pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Sciatica',
  subheadline: 'Document radiation pattern, neurological symptoms, posture triggers, and treatment response — the data your physiotherapist, GP, or spine specialist needs for sciatica.',
  primaryCTA: { text: 'Start tracking sciatica', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A tracking approach for sciatic nerve pain — capturing the radiation pattern down the leg, associated neurological symptoms, posture and activity triggers, and treatment response that help clinicians classify the underlying cause and guide management.',
  whoShouldUse: [
    'People experiencing sciatica or suspected disc-related leg pain',
    'Anyone in physiotherapy or awaiting specialist review for sciatica',
    'People tracking whether sciatica is improving, stable, or worsening over time'
  ],
  howToUse: [
    { step: 1, title: 'Map exactly where the pain travels', description: 'Describe or draw the radiation pattern: where does pain start, and how far does it travel? Buttock only, to the knee, to the calf, to the foot? The distribution pattern maps to specific nerve roots and disc levels.' },
    { step: 2, title: 'Track neurological symptoms separately', description: 'Log numbness, tingling, weakness, or foot drop alongside pain severity. New or worsening neurological symptoms — especially leg weakness or bladder/bowel changes — require urgent attention.' },
    { step: 3, title: 'Record positions that worsen or relieve symptoms', description: 'Sitting, standing, walking, lying — and for how long each is tolerable before pain or neurological symptoms worsen. Positional patterns help distinguish disc from other causes and guide physiotherapy loading.' }
  ],
  whyItMatters:
    'Sciatica resolves in most cases, but the timeline varies widely and worsening neurological symptoms can indicate cauda equina compression requiring urgent intervention. Consistent tracking distinguishes improvement from deterioration and provides the data clinicians need to decide on conservative vs. surgical management.',
  trustSignals: {
    medicalNote: 'Physiotherapists and spine surgeons use radiation pattern, neurological symptom progression, and functional capacity data to guide sciatica management decisions.',
    privacyNote: 'Your sciatica records stay on your device.',
    legalNote: 'Sciatica documentation supports WorkSafeBC claims, physiotherapy funding, and disability documentation for prolonged recovery.'
  },
  faqs: [
    { question: 'What are red flag symptoms I should urgently report?', answer: 'New leg weakness, saddle numbness (inner thighs and groin), or any loss of bladder or bowel control alongside back and leg pain are cauda equina warning signs requiring same-day emergency care.' },
    { question: 'How long does sciatica typically last?', answer: 'Most acute sciatica improves within 4-12 weeks. Documenting week-by-week progress helps confirm improvement or identify stagnation — the latter warrants reassessment.' },
    { question: 'Should I track sciatica during physiotherapy?', answer: 'Yes. Logging pain before and after exercises and noting which positions aggravate vs. relieve symptoms helps your physiotherapist calibrate your program and distinguish helpful from harmful loading.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracking for Back Pain', description: 'Track the spinal origin of sciatica', href: '/resources/pain-tracking-for-back-pain' },
    { title: 'Pain Tracking for Nerve Pain', description: 'Neuropathic components of sciatic pain', href: '/resources/pain-tracking-for-nerve-pain' },
    { title: 'Pain Log for Physical Therapy', description: 'Track physiotherapy progress for sciatica', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Free Private Pain Tracker App', description: 'Track sciatica progression locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Sciatica', url: '/resources/pain-tracking-for-sciatica' }
  ]
};

export function PainTrackingForSciaticaPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForSciaticaContent}
      opening="Sciatica can improve on its own — or it can progress. The difference matters, and tracking it consistently reveals whether you are recovering or deteriorating. This guide explains what to record for sciatic nerve pain: radiation pattern, neurological symptoms, positional triggers, and the red flags that need urgent attention."
      ctaHref="/start"
      ctaText="Start tracking sciatica free"
    />
  );
}

// ─── 3. Pain Tracking After Surgery ──────────────────────────────────────────

const painTrackingAfterSurgeryContent: SEOPageContent = {
  slug: 'pain-tracking-after-surgery',
  title: 'Pain Tracking After Surgery',
  metaTitle: 'Pain Tracking After Surgery: How to Log Post-Surgical Pain and Recovery Progress',
  metaDescription:
    'Learn how to track pain after surgery — post-operative pain severity, medication timing, wound status, functional milestones, and recovery progress — to support follow-up appointments and identify complications early.',
  keywords: [
    'pain tracking after surgery',
    'post-surgical pain diary',
    'recovery pain log',
    'post-operative pain journal',
    'surgical recovery tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking After Surgery',
  subheadline: 'Document post-operative pain severity, medication timing, wound status, and functional milestones — the recovery data your surgeon and care team need at follow-up.',
  primaryCTA: { text: 'Start tracking surgical recovery', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A post-operative pain tracking approach covering pain severity at rest and with movement, analgesic timing and effectiveness, wound status observations, functional milestones, and any concerning symptoms — designed for the recovery period after any surgical procedure.',
  whoShouldUse: [
    'Anyone recovering from surgery at home',
    'People wanting to track progress toward functional milestones after surgery',
    'Anyone whose post-operative pain is prolonged or whose recovery is slower than expected'
  ],
  howToUse: [
    { step: 1, title: 'Record pain at rest and with movement separately', description: 'Post-surgical pain at rest and pain with activity often follow different trajectories. Log both: pain lying still and pain during movement (standing, walking, exercising). Divergence between the two can indicate complications.' },
    { step: 2, title: 'Track analgesic timing, dose, and relief duration', description: 'Log when you take prescribed pain medications, the dose, how long before they take effect, and how long relief lasts. This data helps your care team adjust medications and identify inadequate post-operative pain control.' },
    { step: 3, title: 'Note wound status and any warning signs', description: 'Briefly note wound appearance: healing normally, or any increasing redness, warmth, swelling, or discharge. New or worsening pain after an initial improvement period warrants urgent contact with your surgical team.' }
  ],
  whyItMatters:
    'Post-operative pain that is poorly controlled slows recovery, increases complication risk, and raises the risk of transitioning to chronic pain. Consistent tracking enables timely medication adjustment and early identification of complications — both of which are better addressed early.',
  trustSignals: {
    medicalNote: 'Post-operative pain management guidelines recommend regular pain assessment and analgesic adjustment based on patient-reported outcomes.',
    privacyNote: 'Your surgical recovery records stay on your device.',
    legalNote: 'Post-operative pain documentation supports workers compensation claims, insurance reimbursements, and disability applications related to surgical outcomes.'
  },
  faqs: [
    { question: 'What should I track after surgery?', answer: 'Pain at rest and with movement (0-10), medications taken (dose, timing, effect), wound observations, functional milestones (first walk, stairs, driving), sleep quality, and any new or worsening symptoms.' },
    { question: 'When should I call my surgeon about post-operative pain?', answer: 'Contact your surgical team for: pain that suddenly worsens after initial improvement, pain accompanied by fever, increasing redness/warmth/swelling around the wound, or any new neurological symptoms.' },
    { question: 'Can post-surgical pain become chronic?', answer: 'Yes. Persistent post-surgical pain (beyond 3 months) affects 10-50% of patients depending on the surgery. Early identification and treatment of inadequate pain control reduces chronification risk.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Daily format for post-surgical recovery', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Chronic Pain Medication Log', description: 'Track post-operative analgesic use', href: '/resources/chronic-pain-medication-log' },
    { title: 'Pain Log for Physical Therapy', description: 'Track rehabilitation after surgery', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Free Private Pain Tracker App', description: 'Track surgical recovery locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking After Surgery', url: '/resources/pain-tracking-after-surgery' }
  ]
};

export function PainTrackingAfterSurgeryPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingAfterSurgeryContent}
      opening="Post-surgical pain that is poorly controlled slows recovery and raises the risk of chronic pain developing. Consistent tracking helps your care team adjust medications in time and identifies complications early — both outcomes are significantly better when caught quickly. This guide explains what to log during surgical recovery and why."
      ctaHref="/start"
      ctaText="Start tracking surgical recovery free"
    />
  );
}

// ─── 4. Pain Diary for GP Appointment ────────────────────────────────────────

const painDiaryForGpAppointmentContent: SEOPageContent = {
  slug: 'pain-diary-for-gp-appointment',
  title: 'Pain Diary for GP Appointment',
  metaTitle: 'Pain Diary for GP Appointment: What to Track and Bring to Your Family Doctor',
  metaDescription:
    'Learn what to track in a pain diary for your GP or family doctor appointment — pain severity, functional limits, medication response, and trigger patterns — to make every 15-minute appointment count.',
  keywords: [
    'pain diary for GP appointment',
    'pain diary for doctor appointment',
    'pain journal for family doctor',
    'what to bring to GP for pain',
    'pain tracking for family doctor'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for GP Appointment',
  subheadline: 'Prepare for your GP with documented pain data — severity trends, functional limits, medication response, and the specific questions that make 15-minute appointments productive.',
  primaryCTA: { text: 'Start tracking for your GP', href: '/start' },
  secondaryCTA: { text: 'Learn how doctors use pain diaries', href: '/resources/how-doctors-use-pain-diaries' },
  whatIsThis:
    'A focused pain diary approach for family doctor (GP) appointments — covering the data your GP needs to assess chronic pain, adjust medications, make referrals, and document your condition for ongoing care.',
  whoShouldUse: [
    'Anyone with chronic pain seeing a GP or family doctor',
    'People whose pain condition is managed primarily in primary care',
    'Anyone wanting to make short GP appointments more effective'
  ],
  howToUse: [
    { step: 1, title: 'Track pain severity at consistent times over 1-2 weeks before your appointment', description: 'A morning, midday, and evening pain score for 1-2 weeks provides a trend that is far more useful than a verbal summary. GPs respond to data — bring numbers.' },
    { step: 2, title: 'Document functional limits in specific terms', description: 'Not "pain is bad" — but "I cannot sit for more than 20 minutes," "I missed 3 days of work," "I have not been able to drive." Functional specifics trigger referrals and treatment changes that vague descriptions do not.' },
    { step: 3, title: 'Prepare one clear question or request', description: 'GP appointments are short. Identify the one most important thing you need from this visit — a referral, a medication change, a sick note — and state it early in the appointment.' }
  ],
  whyItMatters:
    'GPs see many patients in short appointment slots. Arriving with documented pain data — not just symptoms described from memory — shifts the conversation from catching up to acting. A pain diary makes chronic pain visible in the same way vital signs make other conditions visible.',
  trustSignals: {
    medicalNote: 'GPs use pain trends, functional impact, and medication response to guide referrals, medication changes, and sick documentation.',
    privacyNote: 'Your GP visit preparation stays on your device.',
    legalNote: 'GP visit records support disability documentation, insurance claims, and specialist referrals that depend on primary care documentation.'
  },
  faqs: [
    { question: 'How do I present my pain diary to my GP?', answer: 'Lead with your trend: "Here are my pain scores over the past two weeks — they average 6/10 and have not improved with the current medication." Then state your main concern or request. Keep it brief and specific.' },
    { question: 'What if my GP dismisses my pain diary?', answer: 'Leave a copy in the chart notes ("I would like this documented") and ask directly: "Based on this record, what do you recommend changing?" Documentation in the chart is protective even if the conversation is frustrating.' },
    { question: 'How far back should my pain diary go for a GP visit?', answer: '1-4 weeks is usually sufficient for a GP review. For a new GP or a review of a long-standing condition, 2-3 months of consistent data is stronger.' }
  ],
  relatedLinks: [
    { title: 'How to Track Pain for Doctors', description: 'What GPs and specialists need from pain data', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'How Doctors Use Pain Diaries', description: 'The clinical perspective on pain documentation', href: '/resources/how-doctors-use-pain-diaries' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Specialist-level pain diary preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Track and export pain data for GP visits', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for GP Appointment', url: '/resources/pain-diary-for-gp-appointment' }
  ]
};

export function PainDiaryForGpAppointmentPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForGpAppointmentContent}
      opening="GP appointments are short — and chronic pain described from memory rarely gets the attention it deserves. A documented pain diary shifts the conversation from subjective catch-up to data-driven review. This guide explains what to track before your GP visit, how to present it, and what to ask for."
      ctaHref="/start"
      ctaText="Start tracking for your GP free"
    />
  );
}

// ─── 5. Pain Tracking for Headaches ──────────────────────────────────────────

const painTrackingForHeadachesContent: SEOPageContent = {
  slug: 'pain-tracking-for-headaches',
  title: 'Pain Tracking for Headaches',
  metaTitle: 'Pain Tracking for Headaches: How to Log Tension, Cluster, and Chronic Daily Headaches',
  metaDescription:
    'Learn how to track headaches effectively — headache frequency, duration, severity, type, triggers, and medication response — to identify patterns, reduce overuse, and prepare for neurology appointments.',
  keywords: [
    'pain tracking for headaches',
    'headache diary',
    'tension headache log',
    'cluster headache tracker',
    'chronic daily headache diary'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Headaches',
  subheadline: 'Document headache frequency, duration, type, triggers, and medication response — the pattern data that distinguishes headache types and guides effective treatment.',
  primaryCTA: { text: 'Start tracking headaches', href: '/start' },
  secondaryCTA: { text: 'See the migraine diary', href: '/resources/pain-tracking-for-migraines' },
  whatIsThis:
    'A tracking approach for non-migraine headaches — tension-type headaches, cluster headaches, chronic daily headache, and medication-overuse headache — capturing frequency, duration, location, severity, and triggers that help neurologists and GPs classify and treat headache disorders.',
  whoShouldUse: [
    'People with frequent tension headaches or chronic daily headaches',
    'Anyone tracking cluster headache cycles for neurology review',
    'People concerned about medication-overuse headache (rebound headache)'
  ],
  howToUse: [
    { step: 1, title: 'Record headache days per month', description: 'Headache frequency — specifically headache days per month — is the primary metric for classification and treatment thresholds. Tracking this consistently distinguishes episodic from chronic headache and establishes treatment candidacy.' },
    { step: 2, title: 'Log pain medication use carefully', description: 'Medication-overuse headache (MOH) affects millions — caused by taking analgesics or triptans too frequently. Log every dose of pain medication: type, amount, and headache day. More than 10-15 days/month of analgesic use is a MOH threshold.' },
    { step: 3, title: 'Track headache location, quality, and associated features', description: 'Location (bilateral vs. unilateral), quality (pressing/tightening vs. throbbing), and associated features (nausea, light/sound sensitivity, tearing, nasal congestion) help distinguish headache types — each has different management.' }
  ],
  whyItMatters:
    'Headache disorders are among the most common and most undertreated neurological conditions. Many people take analgesics reactively without tracking frequency — missing medication-overuse headache developing, which paradoxically worsens headache frequency over time. Consistent tracking reveals this pattern and guides intervention.',
  trustSignals: {
    medicalNote: 'Neurologists and headache specialists use headache diaries as a primary tool for diagnosis and preventive treatment decisions.',
    privacyNote: 'Your headache records stay on your device.',
    legalNote: 'Documented chronic headache frequency and functional impact supports disability applications and occupational accommodation requests.'
  },
  faqs: [
    { question: 'What is the difference between a headache diary and a migraine diary?', answer: 'A migraine diary focuses on migraine-specific features: aura, phases, severe throbbing, nausea, light/sound sensitivity. A headache diary captures all headache types and is better for distinguishing tension, cluster, and mixed headache patterns.' },
    { question: 'How many headache days per month is considered chronic?', answer: '15 or more headache days per month for 3 or more months is the threshold for chronic daily headache. Tracking headache days per month is the most important single metric for classification.' },
    { question: 'What is medication-overuse headache and how does tracking help?', answer: 'MOH occurs when analgesics or triptans are taken on 10-15+ days per month. Tracking reveals this pattern before it is entrenched. Reducing analgesic frequency (with medical support) typically improves baseline headache within weeks to months.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracking for Migraines', description: 'Migraine-specific tracking with aura and phases', href: '/resources/pain-tracking-for-migraines' },
    { title: 'Migraine Pain Diary Printable', description: 'Printable migraine diary template', href: '/resources/migraine-pain-diary-printable' },
    { title: 'Chronic Pain Medication Log', description: 'Track analgesic use to identify overuse', href: '/resources/chronic-pain-medication-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track headache frequency and triggers locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Headaches', url: '/resources/pain-tracking-for-headaches' }
  ]
};

export function PainTrackingForHeadachesPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForHeadachesContent}
      opening="Many people with frequent headaches take analgesics reactively without tracking frequency — and unknowingly develop medication-overuse headache that worsens over time. Consistent headache tracking reveals this pattern and provides the frequency data that neurologists need for preventive treatment decisions. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking headaches free"
    />
  );
}

// ─── 6. Pain Tracking for Hip Pain ───────────────────────────────────────────

const painTrackingForHipPainContent: SEOPageContent = {
  slug: 'pain-tracking-for-hip-pain',
  title: 'Pain Tracking for Hip Pain',
  metaTitle: 'Pain Tracking for Hip Pain: What to Log for Hip OA, Bursitis, and Labral Tears',
  metaDescription:
    'Learn how to track hip pain effectively — pain location, weight-bearing limits, gait changes, activity triggers, and treatment response — to support orthopaedic, physiotherapy, and surgical assessment appointments.',
  keywords: [
    'pain tracking for hip pain',
    'hip pain diary',
    'hip osteoarthritis tracker',
    'hip pain log',
    'hip bursitis tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Hip Pain',
  subheadline: 'Document hip pain location, weight-bearing tolerance, gait limitations, and activity triggers — the functional data orthopaedic surgeons and physiotherapists need.',
  primaryCTA: { text: 'Start tracking hip pain', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A tracking approach for hip pain — including osteoarthritis, trochanteric bursitis, labral tears, and post-hip replacement pain — capturing the positional, activity-related, and functional data that helps orthopaedic surgeons, physiatrists, and physiotherapists assess and manage hip conditions.',
  whoShouldUse: [
    'People with hip osteoarthritis or degenerative hip joint disease',
    'Anyone with hip bursitis, labral tears, or FAI awaiting specialist review',
    'People tracking hip pain after hip replacement surgery'
  ],
  howToUse: [
    { step: 1, title: 'Identify and log the primary pain location', description: 'Hip pain location is diagnostically significant: groin pain is typically intra-articular (OA, labral, FAI); lateral hip pain suggests trochanteric bursitis or greater trochanteric pain syndrome; buttock pain may be referred from the spine. Log precisely where it hurts.' },
    { step: 2, title: 'Record weight-bearing tolerance and walking distance', description: 'Log how far you can walk before pain forces a stop, whether stairs are tolerable, and whether you use a walking aid. Walking tolerance is the primary functional metric for hip OA severity and surgical candidacy decisions.' },
    { step: 3, title: 'Track positions and activities that worsen or relieve pain', description: 'Hip OA and labral tears have characteristic patterns: pain worse with hip rotation, prolonged sitting, and getting in/out of chairs. Bursitis pain worsens with lying on the affected side and stair climbing. Logging position-specific pain helps with diagnosis and management.' }
  ],
  whyItMatters:
    'Hip pain severity assessed from a single appointment is an unreliable snapshot. Walking tolerance, functional decline over months, and treatment response documented over time provide the longitudinal evidence orthopaedic surgeons use to assess surgical timing and physiotherapists use to adjust rehabilitation.',
  trustSignals: {
    medicalNote: 'Orthopaedic assessments for hip replacement candidacy depend on patient-reported functional limits, pain severity, and quality of life impact — all of which consistent tracking captures.',
    privacyNote: 'Your hip pain records stay on your device.',
    legalNote: 'Hip pain documentation supports workplace accommodation requests, disability applications, and WorkSafeBC claims for activity-related hip conditions.'
  },
  faqs: [
    { question: 'What should I track for hip pain?', answer: 'Pain location (groin, lateral, buttock), severity (0-10), walking distance before pain forces a stop, positions that worsen or relieve pain, weight-bearing tolerance, and any night pain (which suggests intra-articular pathology).' },
    { question: 'How does tracking help with hip replacement decisions?', answer: 'Orthopaedic surgeons assess surgical candidacy partly on functional impact — specifically whether conservative management has failed and whether quality of life is sufficiently impaired. Documented walking limits and functional decline over 6-12 months supports this assessment.' },
    { question: 'What does night hip pain mean?', answer: 'Hip pain that wakes you from sleep, especially with groin location, often indicates intra-articular pathology (osteoarthritis, labral tear). It is worth logging separately as it is a quality-of-life indicator and a marker of severity.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracking for Back Pain', description: 'Distinguish hip from spine-referred pain', href: '/resources/pain-tracking-for-back-pain' },
    { title: 'Pain Tracking for Arthritis', description: 'Track OA across multiple joints', href: '/resources/pain-tracking-for-arthritis' },
    { title: 'Pain Log for Physical Therapy', description: 'Track physiotherapy for hip rehabilitation', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Free Private Pain Tracker App', description: 'Track hip pain locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Hip Pain', url: '/resources/pain-tracking-for-hip-pain' }
  ]
};

export function PainTrackingForHipPainPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForHipPainContent}
      opening="Hip pain assessment from a single appointment is a snapshot. Walking tolerance, functional decline, and treatment response documented over weeks and months provide the evidence orthopaedic surgeons need for surgical timing decisions and physiotherapists need for rehabilitation. This guide explains what to track for hip pain and why the location and functional specifics matter."
      ctaHref="/start"
      ctaText="Start tracking hip pain free"
    />
  );
}

// ─── 7. Pain Tracking for Shoulder Pain ──────────────────────────────────────

const painTrackingForShoulderPainContent: SEOPageContent = {
  slug: 'pain-tracking-for-shoulder-pain',
  title: 'Pain Tracking for Shoulder Pain',
  metaTitle: 'Pain Tracking for Shoulder Pain: What to Log for Rotator Cuff, Impingement, and Frozen Shoulder',
  metaDescription:
    'Learn how to track shoulder pain effectively — movement restrictions, overhead tolerance, night pain, activity triggers, and treatment response — to support physiotherapy, orthopaedic, and surgical appointments.',
  keywords: [
    'pain tracking for shoulder pain',
    'shoulder pain diary',
    'rotator cuff pain log',
    'shoulder impingement tracker',
    'frozen shoulder diary'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Shoulder Pain',
  subheadline: 'Document movement restrictions, overhead tolerance, night pain, and activity triggers — the functional data physiotherapists and orthopaedic surgeons need for shoulder conditions.',
  primaryCTA: { text: 'Start tracking shoulder pain', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A tracking approach for shoulder pain — including rotator cuff tendinopathy and tears, shoulder impingement, frozen shoulder (adhesive capsulitis), acromioclavicular joint pain, and post-shoulder surgery recovery — capturing range of motion, functional limits, and pain patterns that clinicians use to assess severity and treatment response.',
  whoShouldUse: [
    'People with shoulder pain from any cause awaiting or in treatment',
    'Anyone in physiotherapy for shoulder rehabilitation',
    'People tracking whether conservative shoulder treatment is working before considering surgery'
  ],
  howToUse: [
    { step: 1, title: 'Track functional movement restrictions daily', description: 'Log which movements cause pain: reaching overhead, behind the back, across the body, lifting. Shoulder conditions have characteristic painful arc and movement restriction patterns that help physiotherapists and surgeons classify the diagnosis.' },
    { step: 2, title: 'Record night pain and sleeping position', description: 'Night pain that wakes you from sleep — especially when lying on the affected shoulder — is a significant indicator of rotator cuff or intra-articular pathology. Log whether night pain is present, how frequently it wakes you, and whether any sleeping position helps.' },
    { step: 3, title: 'Note work and activity demands on the shoulder', description: 'Log occupational demands: overhead lifting, repetitive reaching, computer posture. Shoulder pain treatment plans are calibrated to functional demands — your physiotherapist needs to know what your shoulder is required to do.' }
  ],
  whyItMatters:
    'Shoulder conditions range from self-limiting (most impingement) to requiring surgical repair (full-thickness rotator cuff tears, frozen shoulder beyond conservative management). Tracking functional decline vs. improvement over weeks provides the longitudinal evidence needed for treatment decisions.',
  trustSignals: {
    medicalNote: 'Physiotherapists and orthopaedic surgeons use range of motion assessment, functional task limitations, and night pain presence as key diagnostic and treatment-planning indicators.',
    privacyNote: 'Your shoulder pain records stay on your device.',
    legalNote: 'Shoulder pain documentation supports WorkSafeBC occupational injury claims, physiotherapy funding, and disability applications.'
  },
  faqs: [
    { question: 'What should I track for shoulder pain?', answer: 'Painful movements (overhead, reaching behind, across body), severity (0-10), night pain frequency, functional limits (dressing, driving, lifting), any weakness or clicking, and response to physiotherapy or medication.' },
    { question: 'How is frozen shoulder different from other shoulder conditions?', answer: 'Frozen shoulder (adhesive capsulitis) causes stiffness — lost range of motion — alongside pain, and follows a characteristic progression: freezing, frozen, thawing phases over 1-3 years. Tracking range of motion alongside pain severity helps document which phase you are in.' },
    { question: 'Does tracking help decide between physio and surgery?', answer: 'Yes. A documented failure to improve despite consistent physiotherapy over 3-6 months is a key criterion for surgical referral for rotator cuff tears and other conditions. Tracking provides this evidence.' }
  ],
  relatedLinks: [
    { title: 'Pain Log for Physical Therapy', description: 'Track shoulder physiotherapy progress', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Exercise and Pain Log', description: 'Track which shoulder movements help vs. hurt', href: '/resources/exercise-and-pain-log' },
    { title: 'Pain Tracking After Surgery', description: 'Post-surgical recovery tracking', href: '/resources/pain-tracking-after-surgery' },
    { title: 'Free Private Pain Tracker App', description: 'Track shoulder pain locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Shoulder Pain', url: '/resources/pain-tracking-for-shoulder-pain' }
  ]
};

export function PainTrackingForShoulderPainPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForShoulderPainContent}
      opening="Shoulder conditions range from self-limiting to requiring surgical repair — and the difference often becomes clear only over time. Tracking functional movement restrictions, night pain, and physiotherapy response provides the longitudinal evidence that helps clinicians decide whether conservative management is working or surgical referral is warranted. This guide explains what to record."
      ctaHref="/start"
      ctaText="Start tracking shoulder pain free"
    />
  );
}

// ─── 8. Chronic Pain Flare Tracker ───────────────────────────────────────────

const chronicPainFlareTrackerContent: SEOPageContent = {
  slug: 'chronic-pain-flare-tracker',
  title: 'Chronic Pain Flare Tracker',
  metaTitle: 'Chronic Pain Flare Tracker: How to Log Flares, Triggers, and Recovery Time',
  metaDescription:
    'Use a chronic pain flare tracker to document flare onset, severity, duration, triggers, and recovery time — to identify your flare patterns, manage them proactively, and prepare for clinical appointments.',
  keywords: [
    'chronic pain flare tracker',
    'pain flare diary',
    'flare tracking chronic pain',
    'chronic pain flare log',
    'pain flare pattern tracker'
  ],
  badge: 'Tool',
  headline: 'Chronic Pain Flare Tracker',
  subheadline: 'Log flare onset, peak severity, duration, suspected triggers, and recovery time — to understand your personal flare pattern and act before they escalate.',
  primaryCTA: { text: 'Start tracking flares', href: '/start' },
  secondaryCTA: { text: 'Download the chronic pain diary', href: '/resources/chronic-pain-diary-template' },
  whatIsThis:
    'A flare tracking approach for chronic pain conditions — capturing the onset pattern, peak severity, duration, suspected triggers, interventions used, and recovery time for each flare episode, to build a personal flare map that supports clinical care and self-management.',
  whoShouldUse: [
    'Anyone with a chronic pain condition that includes unpredictable flares',
    'People trying to identify their personal flare triggers to avoid or manage them',
    'Anyone preparing for appointments where flare frequency is relevant to treatment decisions'
  ],
  howToUse: [
    { step: 1, title: 'Log each flare as a distinct episode', description: 'When a flare begins, mark the start time and initial severity. At peak and resolution, note peak severity, what you did, and how long the flare lasted. Each flare entry builds your personal pattern library.' },
    { step: 2, title: 'Record suspected triggers without judgment', description: 'Log what happened in the 12-48 hours before the flare: physical activity, stress, sleep quality, weather changes, food, infection, or no obvious trigger. Not every flare has an identifiable cause — but patterns emerge over time.' },
    { step: 3, title: 'Track what helped and what did not', description: 'Log every intervention during a flare: medication, rest, heat/cold, movement, distraction. Note its effect (0-10 change). Over time, this builds a personal intervention effectiveness record that supports informed self-management.' }
  ],
  whyItMatters:
    'Flares are the most disruptive feature of chronic pain for many people — and yet they are often experienced as entirely random. Systematic tracking reveals that many flares have partial triggers, show temporal patterns (day of week, weather, activity), and respond differently to different interventions. That knowledge enables proactive management.',
  trustSignals: {
    medicalNote: 'Rheumatologists, pain specialists, and physiotherapists use flare frequency and trigger documentation to adjust treatment plans and identify modifiable factors.',
    privacyNote: 'Your flare records stay on your device.',
    legalNote: 'Documented flare frequency, duration, and functional impact supports disability reviews, insurance audits, and accommodation requests.'
  },
  faqs: [
    { question: 'What counts as a flare?', answer: 'A flare is any significant temporary worsening above your personal baseline pain level. Define your own threshold — e.g., any day with pain 3+ points above your average — and track consistently using that definition.' },
    { question: 'How many flares per month is significant?', answer: 'That depends on your condition. What matters is your personal pattern over time: are flares increasing, decreasing, or stable? Are they clustering around specific triggers? Consistent tracking answers these questions.' },
    { question: 'How do I use flare tracking to advocate at medical appointments?', answer: 'Bring your flare frequency (flares per month), average duration, peak severity, and any identified trigger patterns. "I had 8 flares last month averaging 3 days each" is more actionable for a clinician than "I have been having a lot of bad days."' }
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Comprehensive long-term pain diary with flare tracking', href: '/resources/chronic-pain-diary-template' },
    { title: 'Weather and Pain Tracker', description: 'Identify weather-related flare triggers', href: '/resources/weather-and-pain-tracker' },
    { title: 'Chronic Pain Self-Care Log', description: 'Track self-care interventions during flares', href: '/resources/chronic-pain-self-care-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track flares locally with pattern insights', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Flare Tracker', url: '/resources/chronic-pain-flare-tracker' }
  ]
};

export function ChronicPainFlareTrackerPage() {
  return (
    <ResourcePageTemplate
      content={chronicPainFlareTrackerContent}
      opening="Flares feel random — but systematic tracking reveals that many follow partial patterns: temporal clusters, identifiable triggers, and differential responses to interventions. Building a personal flare map over months transforms unpredictable crises into manageable patterns. This guide explains how to track flares effectively and use that data for proactive management."
      ctaHref="/start"
      ctaText="Start tracking flares free"
    />
  );
}

// ─── 9. Pain Diary Template for Insurance ────────────────────────────────────

const painDiaryTemplateForInsuranceContent: SEOPageContent = {
  slug: 'pain-diary-template-for-insurance',
  title: 'Pain Diary Template for Insurance',
  metaTitle: 'Pain Diary Template for Insurance Claims: How to Document Chronic Pain for Insurers',
  metaDescription:
    'Learn how to keep a pain diary for insurance claims — daily functional limits, treatment compliance, medication effects, and consistent documentation that satisfies insurer requirements for chronic pain claims.',
  keywords: [
    'pain diary template for insurance',
    'pain diary for insurance claim',
    'insurance pain documentation',
    'chronic pain insurance diary',
    'pain journal for insurance'
  ],
  badge: 'Template',
  headline: 'Pain Diary Template for Insurance Claims',
  subheadline: 'Document functional limits, treatment compliance, and consistent pain patterns — the evidence insurance adjusters require for chronic pain-based claims.',
  primaryCTA: { text: 'Start your insurance pain diary', href: '/start' },
  secondaryCTA: { text: 'Download the chronic pain diary template', href: '/resources/chronic-pain-diary-template' },
  whatIsThis:
    'A pain diary approach designed for insurance documentation — covering the functional capacity, treatment history, and day-to-day consistency that insurers assess when evaluating chronic pain claims for LTD, auto injury, workers compensation, and personal injury purposes.',
  whoShouldUse: [
    'Anyone making an insurance claim involving chronic pain',
    'People whose insurance claim is under review or has been denied',
    'People working with a lawyer or disability representative on a pain-based claim'
  ],
  howToUse: [
    { step: 1, title: 'Document functional capacity with specifics', description: 'Insurance adjusters assess what you can and cannot do. Record specifically: sitting tolerance, standing tolerance, walking distance, lifting capacity, and which daily activities you completed or could not complete that day.' },
    { step: 2, title: 'Track all treatments and appointments', description: 'Log every medical appointment, physiotherapy session, medication taken, and any new treatment tried. Treatment compliance is assessed by insurers — gaps can be used against you. Document every effort.' },
    { step: 3, title: 'Record consistently — including better days', description: 'Document every day, including days when pain is lower than usual. A diary that only records bad days is less credible. Insurers compare diary entries with medical records and social media — honest, complete documentation is most defensible.' }
  ],
  whyItMatters:
    'Insurance companies assess chronic pain claims against a standard of functional incapacity — what you cannot do, not just how much pain you have. A detailed functional diary that aligns with your medical records and treatment history is the most effective documentation tool available for pain-based insurance claims.',
  trustSignals: {
    medicalNote: 'Insurance claims for chronic pain are assessed against patient-reported functional capacity corroborated by medical evidence.',
    privacyNote: 'Your insurance documentation stays on your device until you choose to share it with your legal representative or insurer.',
    legalNote: 'Pain diary entries can be submitted as supporting evidence in insurance claims and appeals with your representative\'s guidance.'
  },
  faqs: [
    { question: 'What format should my insurance pain diary be in?', answer: 'Consistent daily entries with date, pain severity (0-10), specific functional limits, activities attempted and completed or not, medications taken, and appointments attended. PainTracker.ca exports to CSV and PDF formats suitable for submission.' },
    { question: 'Can my pain diary be used against me?', answer: 'A diary that includes normal or better days — accurately recorded — is more credible and harder to challenge than one that only records worst days. Honest, complete documentation is your strongest protection.' },
    { question: 'How long should I keep an insurance pain diary?', answer: 'Throughout the claim. Insurance reviews and audits can occur months or years after initial submission. Continuous documentation demonstrates ongoing disability and treatment compliance.' }
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Printable template for insurance documentation', href: '/resources/chronic-pain-diary-template' },
    { title: 'Pain Diary for Long-Term Disability', description: 'LTD-specific documentation approach', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Pain Diary for Workers Compensation', description: 'WorkSafeBC and WCB documentation', href: '/resources/pain-diary-for-workers-compensation' },
    { title: 'Free Private Pain Tracker App', description: 'Track and export pain data for insurance', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary Template for Insurance', url: '/resources/pain-diary-template-for-insurance' }
  ]
};

export function PainDiaryTemplateForInsurancePage() {
  return (
    <ResourcePageTemplate
      content={painDiaryTemplateForInsuranceContent}
      opening="Insurance companies assess chronic pain claims against what you cannot do — not just how much you hurt. A functional pain diary that aligns with your medical records and treatment history is the most effective documentation tool available for pain-based claims. This guide explains what insurers look for and how to document it consistently."
      ctaHref="/start"
      ctaText="Start your insurance pain diary free"
    />
  );
}

// ─── 10. Pain Tracker for Desktop ────────────────────────────────────────────

const painTrackerForDesktopContent: SEOPageContent = {
  slug: 'pain-tracker-for-desktop',
  title: 'Pain Tracker for Desktop',
  metaTitle: 'Pain Tracker for Desktop: Free Online Pain Tracking App — No Download Required',
  metaDescription:
    'PainTracker.ca works on desktop as a free, browser-based pain tracking app. No download, no account required — open it in any browser on Windows, Mac, or Linux and track pain privately offline.',
  keywords: [
    'pain tracker for desktop',
    'pain tracking app for computer',
    'desktop pain diary',
    'online pain tracker',
    'pain journal for PC'
  ],
  badge: 'App',
  headline: 'Pain Tracker for Desktop',
  subheadline: 'Open PainTracker.ca in any desktop browser — Chrome, Firefox, Edge, or Safari — and track pain privately with no download, no account, and no cost.',
  primaryCTA: { text: 'Open PainTracker on desktop', href: '/start' },
  secondaryCTA: { text: 'See all features', href: '/resources/free-pain-tracker-app' },
  whatIsThis:
    'PainTracker.ca is a free, browser-based pain tracking app that works on Windows, Mac, and Linux desktops. No software download, no account, no subscription. Open the app in your browser, track pain entries, and export data for appointments — all stored locally on your computer.',
  whoShouldUse: [
    'Anyone who prefers tracking pain on a full-size screen with a keyboard',
    'People who manage health records primarily on a desktop or laptop computer',
    'Anyone wanting a free pain tracker that works offline on a computer'
  ],
  howToUse: [
    { step: 1, title: 'Open PainTracker.ca in your browser', description: 'Go to www.paintracker.ca in Chrome, Firefox, Edge, or Safari on Windows, Mac, or Linux. The app works fully in the browser — no download or installation required.' },
    { step: 2, title: 'Optionally install as a desktop app', description: 'In Chrome or Edge, click the install icon in the address bar to install PainTracker as a desktop Progressive Web App (PWA). It then opens like a native app and works offline — your data stays on your computer.' },
    { step: 3, title: 'Use keyboard shortcuts for faster entry', description: 'On desktop, PainTracker.ca supports keyboard navigation throughout. Use Tab to move between fields and Enter to save entries — faster than tapping on mobile for detailed pain journal entries.' }
  ],
  whyItMatters:
    'Many people with chronic pain spend significant time at a computer — for work, for managing medical appointments, or for writing detailed pain notes. A desktop-accessible pain tracker removes friction for people who prefer typing to tapping and need a full-screen interface for complex entries.',
  trustSignals: {
    medicalNote: 'PainTracker.ca produces clinical-grade exports — CSV, PDF, and JSON — suitable for sharing with doctors and specialists from any desktop browser.',
    privacyNote: 'All pain data stays on your computer — no accounts, no cloud storage, no data sharing.',
    legalNote: 'Desktop-tracked pain entries can be exported for WorkSafeBC, ICBC, disability, and insurance documentation.'
  },
  faqs: [
    { question: 'Does PainTracker.ca work on Windows and Mac?', answer: 'Yes. PainTracker.ca is a Progressive Web App (PWA) that works in any modern desktop browser — Chrome, Firefox, Edge, and Safari — on Windows, Mac, and Linux.' },
    { question: 'Does it work offline on desktop?', answer: 'Yes. Once loaded, PainTracker.ca works offline. If you install it as a desktop PWA, it works completely offline without an internet connection.' },
    { question: 'Can I sync data between my desktop and phone?', answer: 'Not automatically — PainTracker.ca is intentionally local-only for privacy. You can export your data as CSV or JSON from one device and import it on another.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracker for iPhone', description: 'Track pain on iPhone from Safari', href: '/resources/pain-tracker-for-iphone' },
    { title: 'Pain Tracker for Android', description: 'Track pain on Android devices', href: '/resources/pain-tracker-for-android' },
    { title: 'Pain Tracker for iPad', description: 'Track pain on iPad from Safari', href: '/resources/pain-tracker-for-ipad' },
    { title: 'Free Pain Tracker App', description: 'Full overview of PainTracker features', href: '/resources/free-pain-tracker-app' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracker for Desktop', url: '/resources/pain-tracker-for-desktop' }
  ]
};

export function PainTrackerForDesktopPage() {
  return (
    <ResourcePageTemplate
      content={painTrackerForDesktopContent}
      opening="PainTracker.ca works in any desktop browser on Windows, Mac, or Linux — no download, no account, no cost. Open the site, optionally install it as a desktop app, and track pain privately with your data stored locally on your computer. This page explains how to use PainTracker on desktop and what to expect."
      ctaHref="/start"
      ctaText="Open PainTracker on desktop"
    />
  );
}

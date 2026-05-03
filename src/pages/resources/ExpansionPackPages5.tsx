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

// ─── 1. Pain Tracking for Lupus ───────────────────────────────────────────────

const painTrackingForLupusContent: SEOPageContent = {
  slug: 'pain-tracking-for-lupus',
  title: 'Pain Tracking for Lupus',
  metaTitle: 'Pain Tracking for Lupus: How to Log SLE Pain, Flares, and Organ Symptoms',
  metaDescription:
    'Learn how to track lupus pain effectively — joint pain, flare patterns, organ involvement, fatigue, and medication response — to support rheumatology appointments and disability documentation.',
  keywords: [
    'pain tracking for lupus',
    'lupus pain diary',
    'SLE symptom tracker',
    'lupus flare log',
    'autoimmune pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Lupus',
  subheadline: 'Document flares, joint involvement, organ symptoms, fatigue, and medication response — the multi-system data your rheumatologist needs.',
  primaryCTA: { text: 'Start tracking lupus symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the symptom tracker', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A tracking approach designed for systemic lupus erythematosus (SLE) and other lupus variants — capturing the multi-system flare pattern, pain type, organ involvement, and medication timing that rheumatologists use to assess disease activity.',
  whoShouldUse: [
    'People diagnosed with SLE or lupus variants',
    'Anyone tracking lupus flares and symptom patterns',
    'People preparing for rheumatology appointments or disability reviews'
  ],
  howToUse: [
    { step: 1, title: 'Track flare onset, duration, and severity', description: 'Log when a flare begins, which joints or organs are affected, how long it lasts, and peak severity. Flare frequency and duration are key disease activity indicators.' },
    { step: 2, title: 'Record multi-system symptoms together', description: 'Lupus affects multiple systems simultaneously. Note joint pain alongside skin rashes, oral ulcers, fatigue, serositis, or kidney symptoms in the same entry for a complete picture.' },
    { step: 3, title: 'Log sun and UV exposure as a trigger', description: 'Photosensitivity is a major lupus trigger. Tracking outdoor time, UV exposure, and next-day flare onset helps confirm and document this common pattern.' }
  ],
  whyItMatters:
    'Lupus is a waxing-and-waning disease whose activity is difficult to assess without longitudinal data. Detailed flare logs help rheumatologists adjust immunosuppressive therapy, assess organ involvement risk, and support disability documentation for LTD or SSDI claims.',
  trustSignals: {
    medicalNote: 'Rheumatologists use SLEDAI and BILAG disease activity scores — both draw on symptom domains that detailed tracking captures.',
    privacyNote: 'Your lupus records stay on your device.',
    legalNote: 'Lupus flare documentation supports long-term disability claims, SSDI applications, and accommodation requests.'
  },
  faqs: [
    { question: 'What symptoms should I track for lupus?', answer: 'Joint pain (location, symmetry, morning stiffness), skin rashes, oral ulcers, fatigue, serositis (chest pain, pleurisy), hair loss, photosensitivity reactions, and any fever or organ symptoms.' },
    { question: 'How do I track lupus fatigue separately from pain?', answer: 'Use a 0-10 fatigue score alongside your pain score. Lupus fatigue is often disproportionate to pain levels and is itself a key disease activity indicator for rheumatologists.' },
    { question: 'How does tracking support a disability claim for lupus?', answer: 'Documented flare frequency, duration, severity, and functional impact provides the longitudinal evidence that disability adjudicators and treating physicians need to support LTD or SSDI applications.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Track multi-system lupus symptoms daily', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Diary for Long-Term Disability', description: 'Document lupus for LTD insurance claims', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Chronic Pain Self-Care Log', description: 'Track rest and self-care during flares', href: '/resources/chronic-pain-self-care-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track lupus flares locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Lupus', url: '/resources/pain-tracking-for-lupus' }
  ]
};

export function PainTrackingForLupusPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForLupusContent}
      opening="Lupus is a multi-system disease whose activity fluctuates unpredictably. Tracking flares — including which systems are involved, how long they last, and what triggers them — gives rheumatologists the longitudinal data they need to adjust immunosuppressive therapy and assess organ involvement risk. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking lupus symptoms free"
    />
  );
}

// ─── 2. Pain Tracking for Endometriosis ──────────────────────────────────────

const painTrackingForEndometriosisContent: SEOPageContent = {
  slug: 'pain-tracking-for-endometriosis',
  title: 'Pain Tracking for Endometriosis',
  metaTitle: 'Pain Tracking for Endometriosis: How to Log Pelvic Pain, Cycle Correlation, and Functional Impact',
  metaDescription:
    'Learn how to track endometriosis pain effectively — pelvic pain cycles, dysmenorrhea severity, bowel and bladder symptoms, and functional limits — to support diagnosis, surgical decisions, and disability documentation.',
  keywords: [
    'pain tracking for endometriosis',
    'endometriosis pain diary',
    'pelvic pain log',
    'endo symptom tracker',
    'period pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Endometriosis',
  subheadline: 'Document pelvic pain cycles, dysmenorrhea severity, bowel and bladder symptoms, and functional impact — the pattern data your gynaecologist needs.',
  primaryCTA: { text: 'Start tracking endometriosis pain', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A tracking approach for endometriosis — capturing the cyclical pelvic pain pattern, associated bowel and bladder symptoms, dyspareunia, fatigue, and functional disruption that helps gynaecologists, pain specialists, and surgeons assess disease burden.',
  whoShouldUse: [
    'People diagnosed with or suspected of endometriosis',
    'Anyone tracking cyclical pelvic pain for gynaecology appointments',
    'People pursuing diagnosis, surgical evaluation, or disability documentation for endometriosis'
  ],
  howToUse: [
    { step: 1, title: 'Track pain relative to the menstrual cycle', description: 'Log pain severity relative to cycle day. Endometriosis typically worsens in the days before and during menstruation — this cyclical pattern is diagnostically significant.' },
    { step: 2, title: 'Record associated symptoms by organ system', description: 'Note bowel symptoms (pain with defecation, diarrhea, bloating), bladder symptoms (pain with urination), dyspareunia, and shoulder/diaphragm pain — each points to different implant locations.' },
    { step: 3, title: 'Document functional and occupational impact', description: 'Record missed work days, canceled activities, days unable to leave bed, and pain medication required. Functional impact documentation is essential for surgical candidacy and disability claims.' }
  ],
  whyItMatters:
    'Endometriosis is diagnosed an average of 7-10 years after symptom onset, partly because symptom severity is routinely underestimated without documentation. Consistent tracking supports earlier referral, surgical planning, and evidence for accommodation and disability claims.',
  trustSignals: {
    medicalNote: 'Gynaecologists and endometriosis surgeons assess symptom burden using patient-reported data — cyclical pain patterns, associated symptoms, and functional disruption.',
    privacyNote: 'Your endometriosis records stay on your device.',
    legalNote: 'Documented endometriosis pain and functional impact supports long-term disability claims and workplace accommodation requests.'
  },
  faqs: [
    { question: 'What should I track for endometriosis?', answer: 'Daily pain severity (0-10), cycle day, pelvic pain location, bowel and bladder symptoms, dyspareunia, fatigue, medications used, and functional impact (missed work/activities).' },
    { question: 'How does tracking help get an endometriosis diagnosis faster?', answer: 'A documented cyclical pelvic pain pattern with associated symptoms provides objective evidence for referral to a specialist and speeds surgical evaluation — the only definitive diagnostic path.' },
    { question: 'Should I track pain on non-menstrual days?', answer: 'Yes. Endometriosis can cause pain throughout the cycle, not only during menstruation. Tracking non-menstrual pain helps identify deep infiltrating endometriosis and other cycle-independent patterns.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Daily format for cyclical pelvic pain', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Chronic Pain Self-Care Log', description: 'Track rest and self-care during flares', href: '/resources/chronic-pain-self-care-log' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for gynaecology appointments', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Track pelvic pain cycles locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Endometriosis', url: '/resources/pain-tracking-for-endometriosis' }
  ]
};

export function PainTrackingForEndometriosisPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForEndometriosisContent}
      opening="Endometriosis takes an average of 7-10 years to diagnose — partly because pain severity is routinely dismissed without documentation. Tracking the cyclical pelvic pain pattern, associated bowel and bladder symptoms, and functional disruption provides the evidence your gynaecologist needs to accelerate referral and surgical evaluation. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking endometriosis pain free"
    />
  );
}

// ─── 3. Pain Tracker for iPad ─────────────────────────────────────────────────

const painTrackerForIpadContent: SEOPageContent = {
  slug: 'pain-tracker-for-ipad',
  title: 'Pain Tracker for iPad',
  metaTitle: 'Pain Tracker for iPad: Free Offline App — No Download Required',
  metaDescription:
    'PainTracker.ca works on iPad as a free, offline-capable pain tracking app. No App Store download required — install it as a PWA from Safari in seconds and track pain privately.',
  keywords: [
    'pain tracker for iPad',
    'iPad pain tracking app',
    'chronic pain app iPad',
    'pain diary iPad',
    'pain journal iPad app'
  ],
  badge: 'App',
  headline: 'Pain Tracker for iPad',
  subheadline: 'Install PainTracker.ca on your iPad from Safari — no App Store, no account, no cost. Track pain privately and offline.',
  primaryCTA: { text: 'Open PainTracker on iPad', href: '/start' },
  secondaryCTA: { text: 'See how it works', href: '/resources/free-pain-tracker-app' },
  whatIsThis:
    'PainTracker.ca is a free, offline-capable pain tracking app that works on iPad via Safari. Install it as a Progressive Web App (PWA) from your browser in seconds — no App Store download, no account, no subscription. Your data stays on your iPad.',
  whoShouldUse: [
    'iPad users who want a free pain tracking app',
    'Anyone who prefers a larger screen for daily pain journaling',
    'People who want offline-capable pain tracking without an App Store subscription'
  ],
  howToUse: [
    { step: 1, title: 'Open Safari and go to PainTracker.ca', description: 'On your iPad, open Safari and navigate to www.paintracker.ca. The app is designed for touch and works fully in the browser.' },
    { step: 2, title: 'Install to your Home Screen (optional)', description: 'Tap the Share button in Safari, then "Add to Home Screen." This installs PainTracker as a PWA — it opens like a native app and works offline.' },
    { step: 3, title: 'Start tracking your pain', description: 'Log pain entries, symptoms, medications, and notes. All data is stored locally on your iPad — nothing is sent to a server.' }
  ],
  whyItMatters:
    'iPads are widely used for health management, particularly by people with limited fine-motor control who benefit from a larger touch surface. PainTracker.ca\'s touch-optimized interface and offline capability make it well-suited for iPad pain tracking.',
  trustSignals: {
    medicalNote: 'PainTracker.ca produces clinical-grade exports suitable for doctor and specialist appointments.',
    privacyNote: 'All pain data stays on your iPad — no accounts, no cloud storage, no data sharing.',
    legalNote: 'iPad-tracked pain entries can be exported for WorkSafeBC, ICBC, or disability documentation.'
  },
  faqs: [
    { question: 'Does PainTracker.ca work on iPad?', answer: 'Yes. PainTracker.ca is a Progressive Web App (PWA) that works on all iPads via Safari. Open the site, optionally add it to your Home Screen, and it works offline.' },
    { question: 'Do I need to download anything from the App Store?', answer: 'No. PainTracker.ca installs directly from Safari — no App Store, no Apple ID required, no subscription. Tap Share → Add to Home Screen to install.' },
    { question: 'Does my pain data sync across my iPhone and iPad?', answer: 'Not automatically — PainTracker.ca is intentionally local-only for privacy. You can export your data as CSV or JSON and import it on another device if needed.' }
  ],
  relatedLinks: [
    { title: 'Pain Tracker for iPhone', description: 'Install PainTracker on iPhone from Safari', href: '/resources/pain-tracker-for-iphone' },
    { title: 'Pain Tracker for Android', description: 'Install PainTracker on Android devices', href: '/resources/pain-tracker-for-android' },
    { title: 'Free Pain Tracker App', description: 'Overview of all PainTracker features', href: '/resources/free-pain-tracker-app' },
    { title: 'Start Tracking Pain', description: 'Open PainTracker.ca now', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracker for iPad', url: '/resources/pain-tracker-for-ipad' }
  ]
};

export function PainTrackerForIpadPage() {
  return (
    <ResourcePageTemplate
      content={painTrackerForIpadContent}
      opening="PainTracker.ca works on iPad via Safari as a free, offline-capable Progressive Web App. No App Store download, no account, no subscription — open the site, optionally install it to your Home Screen, and track pain privately. Your data stays on your iPad."
      ctaHref="/start"
      ctaText="Open PainTracker on iPad"
    />
  );
}

// ─── 4. Pain Diary for Social Security Disability ────────────────────────────

const painDiaryForSocialSecurityDisabilityContent: SEOPageContent = {
  slug: 'pain-diary-for-social-security-disability',
  title: 'Pain Diary for Social Security Disability',
  metaTitle: 'Pain Diary for Social Security Disability: How to Document Pain for SSDI and SSI Claims',
  metaDescription:
    'Learn how to keep a pain diary for Social Security Disability — daily functional limits, pain severity, medication effects, and activity restrictions that support SSDI and SSI applications and appeals.',
  keywords: [
    'pain diary for social security disability',
    'SSDI pain documentation',
    'pain journal for disability claim',
    'SSI pain diary',
    'disability pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Social Security Disability',
  subheadline: 'Document daily functional limits, pain severity, and activity restrictions — the evidence SSDI and SSI adjudicators need to assess chronic pain claims.',
  primaryCTA: { text: 'Start tracking for disability', href: '/start' },
  secondaryCTA: { text: 'Download the chronic pain diary', href: '/resources/chronic-pain-diary-template' },
  whatIsThis:
    'A pain diary approach designed for Social Security Disability Insurance (SSDI) and Supplemental Security Income (SSI) applications — focused on documenting functional capacity, medication side effects, and consistency of limitation across days.',
  whoShouldUse: [
    'People applying for SSDI or SSI with a chronic pain condition',
    'Anyone whose SSDI or SSI claim is under review or appeal',
    'People building evidence for a disability attorney or representative'
  ],
  howToUse: [
    { step: 1, title: 'Document functional limits with specifics', description: 'The SSA assesses Residual Functional Capacity (RFC). Record specifically: how long you can sit, stand, or walk; how much you can lift; and what activities you cannot complete on a given day.' },
    { step: 2, title: 'Track medication side effects alongside pain', description: 'SSDI adjudicators consider medication side effects as part of functional limitation. Log drowsiness, concentration problems, nausea, and other effects that limit work capacity.' },
    { step: 3, title: 'Record bad days and good days consistently', description: 'Consistency of documentation — including both bad and better days — is more credible than only logging worst days. SSA reviewers look for consistent longitudinal evidence across months.' }
  ],
  whyItMatters:
    'Pain is an invisible condition that SSDI adjudicators cannot observe directly. A consistent, detailed pain diary — especially one that aligns with medical records — provides the functional evidence needed to support a disability determination based on chronic pain.',
  trustSignals: {
    medicalNote: 'Social Security disability determinations for pain-based conditions depend heavily on patient-reported functional limitations corroborated by medical evidence.',
    privacyNote: 'Your disability documentation stays on your device until you choose to share it.',
    legalNote: 'Pain diary entries can be submitted as supporting evidence in SSDI/SSI applications and appeals with your representative\'s guidance.'
  },
  faqs: [
    { question: 'What does SSA look for in a pain diary?', answer: 'The SSA assesses functional capacity — what you can and cannot do. Your diary should document daily functional limits, medication side effects, and how pain affects basic activities like sitting, standing, walking, and concentration.' },
    { question: 'How long should I keep a pain diary for SSDI?', answer: 'At least 3-6 months of consistent documentation significantly strengthens a claim. Longer records demonstrating persistent limitation are more persuasive than a brief log.' },
    { question: 'Can a pain diary help with an SSDI appeal?', answer: 'Yes. At the appeal stage, a well-documented functional history corroborating your medical records can be submitted as additional evidence and significantly strengthen your case.' }
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Long-form diary template for disability documentation', href: '/resources/chronic-pain-diary-template' },
    { title: 'Pain Diary for Long-Term Disability', description: 'LTD insurance documentation approach', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Pain Diary for Personal Injury Claim', description: 'Legal documentation for pain claims', href: '/resources/pain-diary-for-personal-injury-claim' },
    { title: 'Free Private Pain Tracker App', description: 'Track functional limits locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Social Security Disability', url: '/resources/pain-diary-for-social-security-disability' }
  ]
};

export function PainDiaryForSocialSecurityDisabilityPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForSocialSecurityDisabilityContent}
      opening="Pain is invisible to SSDI adjudicators — and a consistent, detailed pain diary is one of the strongest tools for building a functional capacity record that corroborates your medical evidence. This guide explains what Social Security looks for in pain documentation and how to record it effectively."
      ctaHref="/start"
      ctaText="Start tracking for disability free"
    />
  );
}

// ─── 5. Pain Diary for Long-Term Disability ───────────────────────────────────

const painDiaryForLongTermDisabilityContent: SEOPageContent = {
  slug: 'pain-diary-for-long-term-disability',
  title: 'Pain Diary for Long-Term Disability',
  metaTitle: 'Pain Diary for Long-Term Disability Insurance: How to Document Chronic Pain for LTD Claims',
  metaDescription:
    'Learn how to keep a pain diary for a long-term disability insurance claim — daily functional limits, occupational restrictions, medication effects, and consistent documentation that supports LTD applications and appeals.',
  keywords: [
    'pain diary for long-term disability',
    'LTD pain documentation',
    'long term disability pain journal',
    'disability insurance pain diary',
    'chronic pain LTD claim'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Long-Term Disability',
  subheadline: 'Document daily occupational limits, functional capacity, and consistent pain pattern — the evidence LTD insurers and adjudicators require for chronic pain claims.',
  primaryCTA: { text: 'Start tracking for LTD', href: '/start' },
  secondaryCTA: { text: 'Download the chronic pain diary', href: '/resources/chronic-pain-diary-template' },
  whatIsThis:
    'A documentation approach for long-term disability (LTD) insurance claims based on chronic pain — capturing occupational functional capacity, medication side effects, treatment compliance, and day-to-day variability in a format that aligns with how LTD adjudicators assess claims.',
  whoShouldUse: [
    'People applying for LTD insurance benefits due to chronic pain',
    'Anyone whose LTD claim is under review, audit, or appeal',
    'People working with a disability lawyer or advocate on an LTD claim'
  ],
  howToUse: [
    { step: 1, title: 'Document occupational functional limits specifically', description: 'LTD policies typically require that you cannot perform the duties of your own occupation (own-occ) or any occupation (any-occ). Record specifically what work tasks you cannot do and why.' },
    { step: 2, title: 'Track treatment compliance and response', description: 'LTD insurers look for compliance with recommended treatment. Log every appointment, medication, physical therapy session, and their effects — both positive and negative.' },
    { step: 3, title: 'Record daily capacity fluctuations honestly', description: 'LTD adjusters sometimes conduct surveillance on claimants during apparent good days. Consistently documenting both high-pain days and better days creates a credible, accurate functional picture.' }
  ],
  whyItMatters:
    'LTD insurers regularly dispute chronic pain claims because pain cannot be objectively measured. A detailed, consistent diary — cross-referenced with medical records and treatment history — provides the functional evidence that makes pain claims defensible.',
  trustSignals: {
    medicalNote: 'LTD insurers require medical evidence of functional limitation. Pain diaries corroborate and extend what clinical records capture between appointments.',
    privacyNote: 'Your LTD documentation stays on your device until you choose to share it with your doctor or lawyer.',
    legalNote: 'Pain diary entries can support LTD applications, audit responses, and appeal submissions with legal representation.'
  },
  faqs: [
    { question: 'What do LTD insurers look for in a pain diary?', answer: 'Functional limits specific to work tasks, treatment compliance, medication side effects, and consistency of documentation over time. Diaries that align with medical records are most persuasive.' },
    { question: 'How long should I keep a pain diary for an LTD claim?', answer: 'Throughout the claim. LTD claims can span years, and ongoing documentation provides evidence of continued disability and treatment compliance during audits and periodic reviews.' },
    { question: 'What if I have good days and bad days?', answer: 'Document both honestly. Credibility requires acknowledging variability. The pattern of functional limits across both better and worse days provides a realistic picture of sustainable work capacity.' }
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Long-form template for LTD documentation', href: '/resources/chronic-pain-diary-template' },
    { title: 'Pain Diary for Social Security Disability', description: 'SSDI and SSI documentation approach', href: '/resources/pain-diary-for-social-security-disability' },
    { title: 'Pain Diary for Workers Compensation', description: 'WorkSafeBC and WCB documentation', href: '/resources/pain-diary-for-workers-compensation' },
    { title: 'Free Private Pain Tracker App', description: 'Track functional limits locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Long-Term Disability', url: '/resources/pain-diary-for-long-term-disability' }
  ]
};

export function PainDiaryForLongTermDisabilityPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForLongTermDisabilityContent}
      opening="LTD insurers dispute chronic pain claims because pain is invisible — but a consistent functional diary corroborated by your medical records makes pain claims defensible. This guide explains what long-term disability adjudicators look for and how to document it effectively throughout your claim."
      ctaHref="/start"
      ctaText="Start tracking for LTD free"
    />
  );
}

// ─── 6. Pain Tracking for Cancer Pain ────────────────────────────────────────

const painTrackingForCancerPainContent: SEOPageContent = {
  slug: 'pain-tracking-for-cancer-pain',
  title: 'Pain Tracking for Cancer Pain',
  metaTitle: 'Pain Tracking for Cancer Pain: How to Log Oncology Pain and Treatment Response',
  metaDescription:
    'Learn how to track cancer pain effectively — baseline and breakthrough pain, opioid and adjuvant medication response, treatment side effects, and functional impact — to support palliative care and oncology appointments.',
  keywords: [
    'pain tracking for cancer pain',
    'cancer pain diary',
    'oncology pain log',
    'cancer pain journal',
    'breakthrough pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Cancer Pain',
  subheadline: 'Document baseline and breakthrough pain, opioid response, and functional impact — the data your oncologist and palliative care team use to optimize pain management.',
  primaryCTA: { text: 'Start tracking cancer pain', href: '/start' },
  secondaryCTA: { text: 'Download the daily pain tracker', href: '/resources/daily-pain-tracker-printable' },
  whatIsThis:
    'A pain tracking approach for cancer-related pain — covering baseline pain control, breakthrough pain episodes, opioid and non-opioid medication response, treatment side effects, and functional capacity for oncology and palliative care settings.',
  whoShouldUse: [
    'People managing cancer pain during active treatment',
    'Anyone in palliative care or pain clinic follow-up for cancer-related pain',
    'Caregivers tracking pain on behalf of someone receiving cancer treatment'
  ],
  howToUse: [
    { step: 1, title: 'Distinguish baseline from breakthrough pain', description: 'Log average baseline pain (the ongoing level) separately from breakthrough pain episodes (sudden severe spikes). Different interventions address each, so distinguishing them is clinically important.' },
    { step: 2, title: 'Record opioid timing, dose, and relief duration', description: 'Log when opioid medications are taken, at what dose, and how long relief lasts before pain returns. This data drives opioid dosing adjustments and scheduled versus breakthrough prescribing decisions.' },
    { step: 3, title: 'Track side effects and functional capacity', description: 'Log constipation, nausea, sedation, and cognitive effects alongside pain scores. Functional capacity — what activities remain possible — is as important as pain intensity for palliative care planning.' }
  ],
  whyItMatters:
    'Cancer pain is undertreated globally, often because pain severity is not communicated consistently between appointments. Detailed tracking of baseline pain, breakthrough episodes, and medication response enables rapid titration adjustments that significantly improve quality of life.',
  trustSignals: {
    medicalNote: 'Palliative care and oncology teams use patient-reported pain ratings and medication response logs directly to adjust opioid and adjuvant therapy.',
    privacyNote: 'Your cancer pain records stay on your device.',
    legalNote: 'Cancer pain documentation can support disability applications and treatment cost claims.'
  },
  faqs: [
    { question: 'What should I track for cancer pain?', answer: 'Baseline pain severity (0-10), breakthrough pain episodes (timing, severity, trigger, duration), all pain medications (dose, timing, relief duration), side effects, and functional capacity (activities possible vs. not).' },
    { question: 'What is breakthrough pain and how do I log it?', answer: 'Breakthrough pain is a sudden severe pain spike above baseline. Log each episode: when it occurred, pain score at onset, what you took, how long before relief, and what the trigger appeared to be.' },
    { question: 'Can someone else track pain on my behalf?', answer: 'Yes. PainTracker.ca can be used by a caregiver on behalf of a patient — enter entries using the patient\'s described pain levels and symptoms for appointment documentation.' }
  ],
  relatedLinks: [
    { title: 'Daily Pain Tracker Printable', description: 'Daily format for cancer pain tracking', href: '/resources/daily-pain-tracker-printable' },
    { title: 'Chronic Pain Medication Log', description: 'Track opioid and adjuvant medications', href: '/resources/chronic-pain-medication-log' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for oncology appointments', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Free Private Pain Tracker App', description: 'Track cancer pain locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Cancer Pain', url: '/resources/pain-tracking-for-cancer-pain' }
  ]
};

export function PainTrackingForCancerPainPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForCancerPainContent}
      opening="Cancer pain is frequently undertreated — not because medications don't exist, but because pain severity and medication response are not communicated consistently between appointments. Tracking baseline pain, breakthrough episodes, and opioid response enables the rapid titration adjustments that make a measurable difference in quality of life. This guide explains what to record."
      ctaHref="/start"
      ctaText="Start tracking cancer pain free"
    />
  );
}

// ─── 7. Pain Tracking for Ehlers-Danlos ──────────────────────────────────────

const painTrackingForEhlersDanlosContent: SEOPageContent = {
  slug: 'pain-tracking-for-ehlers-danlos',
  title: 'Pain Tracking for Ehlers-Danlos Syndrome',
  metaTitle: 'Pain Tracking for Ehlers-Danlos Syndrome: How to Log Hypermobility, Subluxations, and Chronic Pain',
  metaDescription:
    'Learn how to track Ehlers-Danlos syndrome pain — joint hypermobility, subluxations, POTS episodes, dysautonomia, fatigue, and multi-system symptoms — for connective tissue specialists and disability documentation.',
  keywords: [
    'pain tracking for Ehlers-Danlos',
    'EDS pain diary',
    'hypermobility pain log',
    'hEDS symptom tracker',
    'connective tissue disorder tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Ehlers-Danlos Syndrome',
  subheadline: 'Document subluxations, hypermobility-related pain, POTS episodes, fatigue, and multi-system symptoms — the connective tissue data your specialists need.',
  primaryCTA: { text: 'Start tracking EDS symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the symptom tracker', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A tracking approach for Ehlers-Danlos syndrome (EDS) — particularly hypermobile EDS (hEDS) — capturing joint instability, subluxation and dislocation events, dysautonomia symptoms, fatigue, and the multi-system nature of connective tissue disorders.',
  whoShouldUse: [
    'People diagnosed with EDS or hypermobility spectrum disorder (HSD)',
    'Anyone tracking joint instability and subluxation patterns for specialist appointments',
    'People building evidence for EDS-related disability or accommodation claims'
  ],
  howToUse: [
    { step: 1, title: 'Log subluxations and dislocations by joint', description: 'Record which joint subluxed or dislocated, what activity preceded it, severity, and recovery time. Frequency and joint distribution over time demonstrates instability pattern to specialists.' },
    { step: 2, title: 'Track dysautonomia symptoms alongside pain', description: 'Many EDS patients have POTS or other dysautonomia. Log dizziness, pre-syncope, heart rate spikes on standing, and heat intolerance alongside joint and pain symptoms.' },
    { step: 3, title: 'Record post-exertional malaise and recovery time', description: 'EDS fatigue and post-exertional malaise can be disproportionate to activity. Logging activity level, next-day crash severity, and recovery time helps quantify functional limits.' }
  ],
  whyItMatters:
    'EDS is frequently undiagnosed or misdiagnosed for years. Detailed documentation of the multi-system symptom constellation — joints, autonomic system, fatigue, skin — helps connective tissue specialists confirm diagnosis, rule out complications, and plan management.',
  trustSignals: {
    medicalNote: 'EDS specialists and geneticists use symptom documentation to assess Beighton score patterns and multi-system involvement over time.',
    privacyNote: 'Your EDS records stay on your device.',
    legalNote: 'EDS functional documentation supports disability applications and accommodation requests for hypermobility-related work limitations.'
  },
  faqs: [
    { question: 'What should I track for EDS?', answer: 'Subluxations and dislocations (joint, trigger, severity), joint pain, fatigue, POTS or dysautonomia symptoms, skin symptoms, GI symptoms, and any post-exertional malaise or recovery time.' },
    { question: 'How do I track subluxations vs. full dislocations?', answer: 'Log both separately. A subluxation (partial) resolves without intervention; a dislocation (complete) may require manual reduction. Distinguishing them helps specialists assess instability severity.' },
    { question: 'How does EDS tracking support a disability claim?', answer: 'A documented pattern of frequent subluxations, post-exertional malaise, and functional limits across multiple body systems provides evidence for LTD or SSDI claims based on EDS.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Track EDS multi-system symptoms', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Diary for Long-Term Disability', description: 'Document EDS for LTD insurance', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Chronic Pain Self-Care Log', description: 'Track pacing and self-care for EDS', href: '/resources/chronic-pain-self-care-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track EDS symptoms locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Ehlers-Danlos', url: '/resources/pain-tracking-for-ehlers-danlos' }
  ]
};

export function PainTrackingForEhlersDanlosPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForEhlersDanlosContent}
      opening="EDS is a multi-system connective tissue condition that is frequently misdiagnosed for years. Tracking subluxations, dysautonomia symptoms, post-exertional malaise, and the full symptom constellation helps specialists confirm diagnosis, assess severity, and plan management. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking EDS symptoms free"
    />
  );
}

// ─── 8. Pain Diary for Physiotherapist ───────────────────────────────────────

const painDiaryForPhysiotherapistContent: SEOPageContent = {
  slug: 'pain-diary-for-physiotherapist',
  title: 'Pain Diary for Physiotherapist',
  metaTitle: 'Pain Diary for Physiotherapist: What to Track Between PT Sessions',
  metaDescription:
    'Learn what to track in a pain diary for physiotherapy — exercise response, pain levels before and after sessions, home exercise compliance, and functional progress — to make every PT appointment more effective.',
  keywords: [
    'pain diary for physiotherapist',
    'pain tracking for physiotherapy',
    'PT pain log',
    'physiotherapy pain journal',
    'exercise response pain tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Diary for Physiotherapist',
  subheadline: 'Track exercise response, home program compliance, and pain patterns between sessions — the data your physiotherapist uses to progress or modify your treatment plan.',
  primaryCTA: { text: 'Start tracking for physio', href: '/start' },
  secondaryCTA: { text: 'See the pain log for physical therapy', href: '/resources/pain-log-for-physical-therapy' },
  whatIsThis:
    'A pain diary approach designed for physiotherapy patients — focused on exercise response, home exercise compliance, pain levels before and after sessions, and functional progress between appointments.',
  whoShouldUse: [
    'Anyone in physiotherapy for acute or chronic pain',
    'People doing home exercise programs between PT sessions',
    'Anyone wanting to make PT appointments more efficient with documented progress data'
  ],
  howToUse: [
    { step: 1, title: 'Log pain before and after each exercise', description: 'Rate pain immediately before starting each exercise and 24 hours after. A 2-point or greater increase that persists 24h suggests a load that is too high for the current stage of rehab.' },
    { step: 2, title: 'Record home exercise compliance and barriers', description: 'Log which exercises you completed, any you skipped, and why. Physiotherapists adjust programs based on what is realistically achievable, not just what is prescribed.' },
    { step: 3, title: 'Track functional milestones between sessions', description: 'Note activities you could or could not do between sessions — stairs, walking distance, sleep position, lifting. Functional progress confirms that pain scores alone do not capture rehabilitation gains.' }
  ],
  whyItMatters:
    'Physiotherapy appointments are typically 30-60 minutes, often weeks apart. What happens between sessions — exercise response, compliance, functional changes — is invisible to your physiotherapist without documentation. A brief daily log makes every appointment a data-driven review rather than a subjective catch-up.',
  trustSignals: {
    medicalNote: 'Physiotherapists use patient-reported outcome measures and exercise response logs to apply evidence-based load management principles.',
    privacyNote: 'Your physiotherapy records stay on your device.',
    legalNote: 'PT progress documentation supports WorkSafeBC rehabilitation claims and return-to-work assessments.'
  },
  faqs: [
    { question: 'What should I track between physio sessions?', answer: 'Pain before and after each exercise (at the time and 24h later), which home exercises you completed, any activities you were able to do that you previously could not, and any new or worsened symptoms.' },
    { question: 'How do I know if an exercise is too much?', answer: 'A useful guideline: pain that increases by more than 2 points (0-10) during or after exercise and does not return to baseline within 24 hours suggests the load may need adjusting. Log this and tell your physiotherapist.' },
    { question: 'Should I bring my pain diary to physio appointments?', answer: 'Yes, or share an export. A log showing exercise response and compliance is far more useful for session planning than a verbal summary of how you have been feeling.' }
  ],
  relatedLinks: [
    { title: 'Pain Log for Physical Therapy', description: 'Structured format for physical therapy tracking', href: '/resources/pain-log-for-physical-therapy' },
    { title: 'Exercise and Pain Log', description: 'Track which movements help vs. hurt', href: '/resources/exercise-and-pain-log' },
    { title: 'Pain Diary for Workers Compensation', description: 'Track PT during WorkSafeBC rehabilitation', href: '/resources/pain-diary-for-workers-compensation' },
    { title: 'Free Private Pain Tracker App', description: 'Track physio progress locally', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Physiotherapist', url: '/resources/pain-diary-for-physiotherapist' }
  ]
};

export function PainDiaryForPhysiotherapistPage() {
  return (
    <ResourcePageTemplate
      content={painDiaryForPhysiotherapistContent}
      opening="Physiotherapy appointments are brief windows — what happens between them is invisible to your physiotherapist without documentation. Tracking exercise response, home program compliance, and functional changes turns every session into a data-driven review rather than a subjective catch-up. This guide explains what to record between physio appointments and why."
      ctaHref="/start"
      ctaText="Start tracking for physio free"
    />
  );
}

// ─── 9. Pain Management Journal ──────────────────────────────────────────────

const painManagementJournalContent: SEOPageContent = {
  slug: 'pain-management-journal',
  title: 'Pain Management Journal',
  metaTitle: 'Pain Management Journal: How to Keep a Daily Log That Improves Your Treatment',
  metaDescription:
    'Learn how to keep a pain management journal — daily pain entries, treatment response, functional limits, and emotional impact — to improve clinical care, support disability documentation, and understand your own patterns.',
  keywords: [
    'pain management journal',
    'chronic pain journal',
    'pain management diary',
    'daily pain log',
    'pain management tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Management Journal',
  subheadline: 'A structured daily journal for chronic pain — tracking severity, triggers, treatment response, functional limits, and emotional impact to improve care and build a clinical record.',
  primaryCTA: { text: 'Start your pain management journal', href: '/start' },
  secondaryCTA: { text: 'Download the chronic pain diary template', href: '/resources/chronic-pain-diary-template' },
  whatIsThis:
    'A pain management journal is a structured daily record of your pain experience — covering severity, location, triggers, treatment response, functional capacity, and emotional impact. It serves both as a clinical tool for medical appointments and as a personal tool for understanding your own patterns.',
  whoShouldUse: [
    'Anyone managing chronic pain with one or more healthcare providers',
    'People preparing for pain clinic, specialist, or GP appointments',
    'Anyone pursuing disability documentation or self-understanding of their pain patterns'
  ],
  howToUse: [
    { step: 1, title: 'Record pain severity at consistent times each day', description: 'Log pain at the same times daily — morning, midday, and evening. Consistency matters more than perfection. Even a 30-second daily entry creates a trend line that a single appointment cannot.' },
    { step: 2, title: 'Note what you did and how pain responded', description: 'Briefly log your main activities and how pain responded — better, worse, unchanged. Over time, this reveals which activities are within your tolerance and which reliably trigger flares.' },
    { step: 3, title: 'Track medication timing and effect', description: 'Note when you take pain medication, the dose, and how long before it took effect — and how long relief lasted. This data drives medication adjustment conversations with your prescriber.' }
  ],
  whyItMatters:
    'Pain is invisible to every clinician who sees you. A pain management journal transforms invisible experience into documented evidence — enabling data-driven treatment decisions, supporting disability applications, and giving you the self-knowledge to advocate effectively.',
  trustSignals: {
    medicalNote: 'Pain specialists, rheumatologists, and GPs use longitudinal patient pain logs to assess treatment response and make medication or therapy adjustments.',
    privacyNote: 'Your pain management journal stays on your device.',
    legalNote: 'A consistent pain management journal supports disability claims, insurance reviews, and legal documentation of functional impact.'
  },
  faqs: [
    { question: 'What should a pain management journal include?', answer: 'Daily pain severity (0-10), pain location, key activities, triggers, medications taken (dose and timing), medication effect, sleep quality, mood, and any functional limits that day.' },
    { question: 'How long do I need to keep a pain journal before it is useful?', answer: 'Even two weeks of consistent entries reveal patterns. One to three months of documentation is sufficient for most clinical and disability purposes. Longer records provide stronger evidence for insurance and legal claims.' },
    { question: 'Is a digital pain journal better than paper?', answer: 'Digital journals like PainTracker.ca make it easier to export data for appointments and disability applications, and harder to lose entries. Paper is fine if it is more sustainable for you — consistency matters most.' }
  ],
  relatedLinks: [
    { title: 'Chronic Pain Diary Template', description: 'Printable long-form pain diary template', href: '/resources/chronic-pain-diary-template' },
    { title: 'Daily Pain Tracker Printable', description: 'Simple daily format for pain logging', href: '/resources/daily-pain-tracker-printable' },
    { title: 'How to Track Pain for Doctors', description: 'What clinicians need from your pain records', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Free Private Pain Tracker App', description: 'Digital pain management journal with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Management Journal', url: '/resources/pain-management-journal' }
  ]
};

export function PainManagementJournalPage() {
  return (
    <ResourcePageTemplate
      content={painManagementJournalContent}
      opening="Pain is invisible to every clinician who sees you — a consistent pain management journal transforms that invisible experience into documented evidence. This guide explains what to include in a daily pain journal, how to structure entries for clinical usefulness, and why consistent tracking matters for both care and documentation."
      ctaHref="/start"
      ctaText="Start your pain management journal free"
    />
  );
}

// ─── 10. Pain Tracking for MS ─────────────────────────────────────────────────

const painTrackingForMsContent: SEOPageContent = {
  slug: 'pain-tracking-for-ms',
  title: 'Pain Tracking for Multiple Sclerosis',
  metaTitle: 'Pain Tracking for Multiple Sclerosis: How to Log MS Pain, Spasticity, and Neuropathic Symptoms',
  metaDescription:
    'Learn how to track MS pain effectively — neuropathic pain, spasticity, Lhermitte\'s sign, fatigue, and relapse patterns — to support neurology appointments and disability documentation.',
  keywords: [
    'pain tracking for MS',
    'multiple sclerosis pain diary',
    'MS symptom tracker',
    'MS pain journal',
    'MS fatigue tracking'
  ],
  badge: 'Guide',
  headline: 'Pain Tracking for Multiple Sclerosis',
  subheadline: 'Document neuropathic pain, spasticity, fatigue, and relapse patterns — the MS-specific data your neurologist uses to assess disease activity and adjust treatment.',
  primaryCTA: { text: 'Start tracking MS symptoms', href: '/start' },
  secondaryCTA: { text: 'Download the symptom tracker', href: '/resources/symptom-tracker-printable' },
  whatIsThis:
    'A tracking approach for multiple sclerosis pain — covering the neuropathic, musculoskeletal, and spasticity-related pain types common in MS, alongside fatigue, heat sensitivity, Lhermitte\'s sign, and relapse patterns that neurologists use to monitor disease activity.',
  whoShouldUse: [
    'People diagnosed with MS (relapsing-remitting, progressive, or other types)',
    'Anyone tracking MS symptoms for neurology appointments or disease-modifying therapy reviews',
    'People building evidence for MS-related disability or accommodation claims'
  ],
  howToUse: [
    { step: 1, title: 'Distinguish neuropathic pain from spasticity pain', description: 'MS produces multiple pain types: central neuropathic pain (burning, electric), spasticity pain (muscle tightness, cramping), and musculoskeletal pain from altered gait. Tracking them separately helps neurologists target the right treatment for each.' },
    { step: 2, title: 'Log Lhermitte\'s sign and heat-triggered symptoms', description: 'Lhermitte\'s sign (electric shock sensation on neck flexion) is MS-specific. Also log Uhthoff\'s phenomenon — temporary symptom worsening with heat or exertion. These are diagnostically significant relapses vs. pseudoexacerbations.' },
    { step: 3, title: 'Track fatigue and cognitive symptoms alongside pain', description: 'MS fatigue and cognitive fog ("cog fog") are among the most disabling MS symptoms. Log daily fatigue severity, concentration, word-finding, and memory alongside pain — neurologists assess MS severity across all these domains.' }
  ],
  whyItMatters:
    'MS produces fluctuating, multi-domain symptoms that are difficult to recall accurately at quarterly neurology appointments. Longitudinal symptom tracking identifies relapse patterns, captures pseudoexacerbations, and provides data for disease-modifying therapy decisions.',
  trustSignals: {
    medicalNote: 'Neurologists use patient-reported outcome measures (PROMS) and symptom logs alongside MRI to assess MS disease activity and therapy response.',
    privacyNote: 'Your MS records stay on your device.',
    legalNote: 'MS symptom documentation supports LTD insurance claims, SSDI applications, and workplace accommodation requests.'
  },
  faqs: [
    { question: 'What should I track for MS pain?', answer: 'Pain type (neuropathic, spasticity, musculoskeletal), location, severity (0-10), fatigue, cognitive symptoms, Lhermitte\'s sign, heat sensitivity, any new or worsening symptoms, and medication response.' },
    { question: 'How do I know if I am having a relapse vs. a pseudoexacerbation?', answer: 'A true relapse involves new or worsening neurological symptoms lasting more than 24 hours without fever or infection. A pseudoexacerbation is temporary worsening triggered by heat, infection, or fatigue. Tracking temperature, illness, and exertion helps distinguish them.' },
    { question: 'How does MS tracking support disability claims?', answer: 'MS disability claims require evidence of functional limitation. Documented fatigue severity, cognitive symptoms, and pain levels alongside treatment records provide the longitudinal functional picture that LTD and SSDI adjudicators assess.' }
  ],
  relatedLinks: [
    { title: 'Symptom Tracker Printable', description: 'Track MS multi-system symptoms', href: '/resources/symptom-tracker-printable' },
    { title: 'Pain Diary for Long-Term Disability', description: 'Document MS for LTD insurance', href: '/resources/pain-diary-for-long-term-disability' },
    { title: 'Chronic Pain Self-Care Log', description: 'Track pacing and rest for MS', href: '/resources/chronic-pain-self-care-log' },
    { title: 'Free Private Pain Tracker App', description: 'Track MS symptoms locally with exports', href: '/start' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Tracking for Multiple Sclerosis', url: '/resources/pain-tracking-for-ms' }
  ]
};

export function PainTrackingForMsPage() {
  return (
    <ResourcePageTemplate
      content={painTrackingForMsContent}
      opening="MS produces fluctuating, multi-domain symptoms that are difficult to recall accurately at quarterly neurology appointments. Tracking neuropathic pain, spasticity, fatigue, Lhermitte's sign, and cognitive symptoms between appointments gives your neurologist the longitudinal data needed for disease-modifying therapy decisions. This guide explains what to record and why."
      ctaHref="/start"
      ctaText="Start tracking MS symptoms free"
    />
  );
}

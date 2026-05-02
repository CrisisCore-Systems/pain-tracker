const SITE_URL = 'https://www.paintracker.ca';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const SOFTWARE_OFFERS = [
  {
    '@type': 'Offer',
    name: 'Free',
    price: '0',
    priceCurrency: 'CAD',
    availability: 'https://schema.org/InStock',
  },
  {
    '@type': 'Offer',
    name: 'Basic',
    price: '9.99',
    priceCurrency: 'CAD',
    availability: 'https://schema.org/InStock',
  },
  {
    '@type': 'Offer',
    name: 'Pro',
    price: '24.99',
    priceCurrency: 'CAD',
    availability: 'https://schema.org/InStock',
  },
];

const PRICING_FAQS = [
  {
    question: 'Is there a free plan?',
    answer:
      'Yes. Pain Tracker includes a free plan so you can start tracking privately before deciding whether you need paid features.',
  },
  {
    question: 'What does Basic cost?',
    answer: 'The Basic plan is CAD $9.99 per month.',
  },
  {
    question: 'What does Pro cost?',
    answer: 'The Pro plan is CAD $24.99 per month.',
  },
];

function stripSiteSuffix(title) {
  return title
    .replace(/\s+\|\s+Pain Tracker$/u, '')
    .replace(/\s+\|\s+PainTracker\.ca$/u, '');
}

function makeBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

function makeFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function makeOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CrisisCore Systems',
    alternateName: 'Pain Tracker',
    brand: {
      '@type': 'Brand',
      name: 'Pain Tracker',
    },
    url: SITE_URL,
    logo: `${SITE_URL}/logos/pain-tracker-logo.svg`,
    description:
      'Private offline-first pain tracking application for daily symptom logging, clinician-friendly records, and local-first privacy controls.',
    sameAs: [
      'https://github.com/CrisisCore-Systems/pain-tracker',
      'https://blog.paintracker.ca/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@paintracker.ca',
      availableLanguage: ['English', 'French'],
      url: `${SITE_URL}/privacy`,
    },
  };
}

function makeWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pain Tracker',
    alternateName: 'PainTracker.ca',
    url: SITE_URL,
    description: 'Track pain privately. No account. Works offline. Bring better records to appointments.',
    inLanguage: 'en-CA',
    publisher: {
      '@type': 'Organization',
      name: 'CrisisCore Systems',
      url: SITE_URL,
    },
  };
}

function makeSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pain Tracker',
    url: `${SITE_URL}/start`,
    description: 'Track pain privately. No account. Works offline. Bring better records to appointments.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser, iOS, Android',
    offers: SOFTWARE_OFFERS,
    featureList: [
      'Offline-first pain tracking',
      'Local-only by default',
      'Clinician-friendly exports',
      'Pain and symptom logging',
      'Trigger and flare tracking',
      'Medication tracking',
      'Trauma-informed design',
    ],
    screenshot: `${SITE_URL}/main-dashboard.png`,
    brand: {
      '@type': 'Brand',
      name: 'Pain Tracker',
    },
    creator: {
      '@type': 'Organization',
      name: 'CrisisCore Systems',
      url: SITE_URL,
    },
    provider: {
      '@type': 'Organization',
      name: 'CrisisCore Systems',
      url: SITE_URL,
    },
  };
}

function defaultBreadcrumbItems(route) {
  if (route.path === '/') {
    return [{ name: 'Home', url: '/' }];
  }

  if (route.path.startsWith('/resources/')) {
    return [
      { name: 'Home', url: '/' },
      { name: 'Resources', url: '/resources' },
      { name: route.breadcrumbName ?? stripSiteSuffix(route.title), url: route.path },
    ];
  }

  return [
    { name: 'Home', url: '/' },
    { name: route.breadcrumbName ?? stripSiteSuffix(route.title), url: route.path },
  ];
}

function withStructuredData(route) {
  const structuredData = [];

  if (route.path === '/') {
    structuredData.push(
      makeOrganizationSchema(),
      makeWebsiteSchema(),
      makeSoftwareApplicationSchema()
    );
  } else {
    structuredData.push(makeBreadcrumbSchema(defaultBreadcrumbItems(route)));

    if (route.path === '/pricing') {
      structuredData.push(makeSoftwareApplicationSchema(), makeFaqSchema(PRICING_FAQS));
    }
  }

  return {
    ...route,
    structuredData,
  };
}

const resource = (slug, title, description) => ({
  path: `/resources/${slug}`,
  title,
  description,
  canonicalUrl: `${SITE_URL}/resources/${slug}`,
  ogImage: DEFAULT_OG_IMAGE,
  breadcrumbName: stripSiteSuffix(title),
  prerenderHeading: stripSiteSuffix(title),
});

export const publicRouteMetadata = [
  {
    path: '/',
    title: 'PainTracker.ca - Free Private Pain Tracker App That Works Offline',
    description: 'Track pain, flares, medications, triggers, and daily function privately. PainTracker.ca works offline, needs no account, stores records on your device, and supports appointment-ready exports.',
    canonicalUrl: `${SITE_URL}/`,
    ogImage: DEFAULT_OG_IMAGE,
    prerenderHeading: 'Track Chronic Pain Privately, Even Offline',
  },
  {
    path: '/pricing',
    title: 'Pain Tracker Pricing — Free, Basic $9.99, Pro $24.99 | PainTracker.ca',
    description: 'Compare Free, Basic, Pro, and Enterprise plans for private, offline-capable pain tracking, clinician-friendly reports, and structured documentation workflows.',
    canonicalUrl: `${SITE_URL}/pricing`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Pricing',
  },
  {
    path: '/download',
    title: 'Download PainTracker Free | Private Pain Tracker App for Offline Use',
    description: 'Download PainTracker free, install it for offline use, or run it in your browser. No account required. Records stay on your device until you choose to export them.',
    canonicalUrl: `${SITE_URL}/download`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Download',
    prerenderHeading: 'Download PainTracker Free',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Pain Tracker — Local-First, Zero-Cloud Architecture',
    description: 'Read how Pain Tracker keeps health data local by default, avoids cloud storage of pain records, and gives you control over exports and sharing.',
    canonicalUrl: `${SITE_URL}/privacy`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Privacy Policy',
  },
  {
    path: '/privacy-architecture',
    title: 'Privacy Architecture | PainTracker.ca',
    description: 'See how PainTracker.ca approaches local-first storage, user-controlled exports, backup responsibility, and privacy tradeoffs without cloud-default data collection.',
    canonicalUrl: `${SITE_URL}/privacy-architecture`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Privacy Architecture',
    prerenderHeading: 'Privacy Architecture',
  },
  {
    path: '/pain-tracker-app',
    title: 'PainTracker.ca App | Private Offline Pain Journal for Daily Records',
    description: 'PainTracker.ca is a private offline pain journal for daily symptom logging, trigger tracking, flare patterns, and clinician-friendly exports when you choose.',
    canonicalUrl: `${SITE_URL}/pain-tracker-app`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/pain-tracking-app',
    title: 'Private Offline Pain Tracking App | PainTracker.ca',
    description: 'Looking for a pain tracking app? PainTracker.ca lets you track pain privately, works offline, requires no account, and helps you bring better records to appointments.',
    canonicalUrl: `${SITE_URL}/pain-tracking-app`,
    ogImage: DEFAULT_OG_IMAGE,
    prerenderHeading: 'Private Offline Pain Tracking App',
  },
  {
    path: '/pain-management-tracker',
    title: 'Pain Management Tracker for Symptoms, Treatments, and Daily Function | Pain Tracker',
    description: 'Use Pain Tracker as a pain management tracker for symptoms, medications, flare triggers, and daily function. Works offline and keeps routine records private.',
    canonicalUrl: `${SITE_URL}/pain-management-tracker`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/pain-locator-app',
    title: 'Pain Locator App for Tracking Where Pain Shows Up and Spreads | Pain Tracker',
    description: 'Need a pain locator app? Pain Tracker helps you record where pain is, how it changes, and what else was happening when it flared, without requiring an account.',
    canonicalUrl: `${SITE_URL}/pain-locator-app`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    title: 'How to Share Pain Records with a Doctor Without Giving an App Your Data | Pain Tracker',
    description: 'Use Pain Tracker to keep pain records private by default, then export or print a structured record for a doctor, disability workflow, or WorkSafeBC documentation when you choose.',
    canonicalUrl: `${SITE_URL}/share-pain-records-with-doctor-without-giving-an-app-your-data`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/pain-diary-template',
    title: 'Free Pain Diary Template and Printable Pain Log | Pain Tracker',
    description: 'Download a free pain diary template and printable pain log, then compare paper tracking with Pain Tracker for daily symptom logging and clinician-friendly records.',
    canonicalUrl: `${SITE_URL}/pain-diary-template`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/pain-tracking-apps-comparison',
    title: 'Best Pain Tracking Apps in 2026: Privacy, Offline Use, and Doctor Visits | PainTracker',
    description: 'Compare the best pain tracking apps for privacy, offline use, doctor visit readiness, exports, and daily usability. See which tools work without accounts and which keep records local.',
    canonicalUrl: `${SITE_URL}/pain-tracking-apps-comparison`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/privacy-offline-first-pain-tracker',
    title: 'Private Offline-First Pain Tracker with Trauma-Informed Design | Pain Tracker',
    description: 'Learn how Pain Tracker approaches local-first use, privacy, offline pain tracking, and trauma-informed design for daily symptom logging and clinician-friendly records.',
    canonicalUrl: `${SITE_URL}/privacy-offline-first-pain-tracker`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/tracking-data-policy',
    title: 'Tracking & Data Policy — Pain Tracker',
    description: 'See what Pain Tracker stores locally, what it does not collect by default, and how optional analytics and exports are handled.',
    canonicalUrl: `${SITE_URL}/tracking-data-policy`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/whitepaper',
    title: 'Pain Tracker Whitepaper (PDF)',
    description: 'Download the Pain Tracker whitepaper covering local-first architecture, privacy boundaries, and the product threat model.',
    canonicalUrl: `${SITE_URL}/whitepaper`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/overton-framework',
    title: 'The Overton Framework — Protective Computing (Canon)',
    description: 'Read the Overton Framework canon page, including the Protective Computing discipline overview, DOI, and canonical citation.',
    canonicalUrl: `${SITE_URL}/overton-framework`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/cnet-download',
    title: 'CNET Download Link | Pain Tracker',
    description: 'Official, stable reference page for the current CNET download location for Pain Tracker.',
    canonicalUrl: `${SITE_URL}/cnet-download`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/demo',
    title: 'Pain Tracker Product Demo and Screenshot Showcase | Pain Tracker',
    description: 'Browse Pain Tracker demonstration views and screenshot-ready previews of the export workflow, body map, and subscription screens.',
    canonicalUrl: `${SITE_URL}/demo`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/submit-story',
    title: 'Share Your Pain Tracker Story | Pain Tracker',
    description: 'Submit a testimonial or story about using Pain Tracker, with optional anonymization and explicit publication consent.',
    canonicalUrl: `${SITE_URL}/submit-story`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/resources',
    title: 'Free Pain Tracking Printables, Guides, and Appointment Prep | PainTracker.ca',
    description: 'Free downloadable pain diary templates, printable pain logs, symptom trackers, and guides for appointments, disability documentation, and WorkSafeBC workflows.',
    canonicalUrl: `${SITE_URL}/resources`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Resources',
  },
  resource('pain-diary-template-pdf', 'Pain Diary Template PDF — Free Clinician-Designed Printable | PainTracker.ca', 'Download a free, clinician-designed pain diary template PDF. Tracks pain intensity, location, medications, triggers, sleep, and mood - ready for doctor appointments, WorkSafeBC claims, and disability documentation.'),
  resource('daily-pain-tracker-printable', 'Free Daily Pain Tracker Printable PDF | PainTracker.ca', 'Download the free PainTracker.ca daily pain tracker printable PDF to record pain levels, medications, flare ups, triggers, daily limits, mood, and notes for doctor visits.'),
  resource('weekly-pain-log-pdf', 'Weekly Pain Log PDF — Free 7-Day Pain Tracker Template | PainTracker.ca', 'Download a free weekly pain log PDF. 8-section 7-day spread tracks daily pain, sleep, medications, activity, mood, triggers, and weekly patterns - ideal for appointments and disability claims.'),
  resource('monthly-pain-tracker-printable', 'Monthly Pain Tracker Printable — Free 30-Day Template | PainTracker.ca', 'Download a free monthly pain tracker printable. 8-section 30-day template tracks daily pain calendar, sleep, medications, functional impact, triggers, mood, and monthly summary - ideal for treatment reviews and disability claims.'),
  resource('pain-scale-chart-printable', 'Pain Scale Chart Printable — Free 0-10 NRS Visual Reference | PainTracker.ca', 'Download a free printable pain scale chart. Visual 0-10 Numeric Rating Scale with descriptors, faces, colors, and functional impact - the clinical standard for consistent pain reporting.'),
  resource('symptom-tracker-printable', 'Symptom Tracker Printable — Free Comprehensive Daily Symptom Log | PainTracker.ca', 'Download a free symptom tracker printable. Track fatigue, sleep quality, mood, brain fog, energy, and more alongside pain - the complete picture your doctor needs for chronic illness management.'),
  resource('migraine-pain-diary-printable', 'Migraine Pain Diary Printable - Free Headache Tracker Template (2026) | PainTracker.ca', 'Download our free 6-page migraine diary PDF. Track all 4 migraine phases, auras, 30+ common triggers, medications, and monthly patterns. Recommended by the American Headache Society tracking framework.'),
  resource('printable-pain-log-sheet', 'Printable Pain Log Sheet — Free Simple Daily Pain Tracker You Can Print Right Now | PainTracker.ca', 'Download a free printable pain log sheet with daily pain ratings, symptom tracking, medication log, and notes section. Print and start tracking in under a minute.'),
  resource('chronic-pain-diary-template', 'Chronic Pain Diary Template — Free Long-Term Pain Tracker for Flares, Baseline & Trends | PainTracker.ca', 'Download a free 6-page chronic pain diary template with baseline/flare tracking, trigger identification, treatment logs, and monthly trend reviews for long-term pain management.'),
  resource('7-day-pain-diary-template', '7-Day Pain Diary Template — Free One-Week Pain Tracker for Doctor Appointments | PainTracker.ca', 'Download a free 7-day pain diary template. One-week format with morning, midday, and evening tracking, medication logs, and a doctor-ready weekly summary.'),
  resource('how-to-track-pain-for-doctors', 'How to Track Pain for Doctors — What Your Doctor Actually Needs | PainTracker.ca', 'Learn exactly what to track and how to present pain data to your doctor in 15-minute appointments. 7 key data points, appointment prep checklist, and free tracking templates.'),
  resource('what-to-include-in-pain-journal', 'Pain Journal Checklist for Doctor Visits | PainTracker.ca', 'Use the PainTracker.ca pain journal checklist to learn what to include in a pain journal so your notes are useful at doctor visits. Track pain levels, medications, triggers, sleep, and daily function with a simple checklist.'),
  resource('how-doctors-use-pain-diaries', 'How Doctors Use Pain Diaries — The Clinical Perspective | PainTracker.ca', 'Understand how doctors actually use pain diary data to make treatment decisions. 6 clinical uses, decision timeline, and how to make your tracking clinically useful.'),
  resource('pain-diary-for-specialist-appointment', 'Pain Diary for Specialist Appointment — What to Track & Bring | PainTracker.ca', 'Prepare for your specialist appointment with the right pain diary data. What pain specialists, rheumatologists, neurologists, and surgeons need. Free one-page summary template.'),
  resource('symptom-tracking-before-diagnosis', 'Symptom Tracking Before Diagnosis — What to Track When You Don\'t Know What\'s Wrong | PainTracker.ca', 'Learn what to track when your pain has not been diagnosed yet. Pattern recognition guide, pre-diagnosis tracking categories, and doctor-ready summary template.'),
  resource('documenting-pain-for-disability-claim', 'Documenting Pain for Disability Claim — Complete Evidence Guide | PainTracker.ca', 'Learn exactly how to document chronic pain for disability claims. What adjusters look for, 6 mistakes that get claims denied, evidence pyramid, and free templates to build your case.'),
  resource('worksafebc-pain-journal-template', 'WorkSafeBC Pain Journal Template | PainTracker.ca', 'Download the free PainTracker.ca WorkSafeBC pain journal template for BC workplace injury documentation. Track work-related pain, functional capacity, treatment compliance, and return-to-work notes for appointments and claim-related discussions.'),
  resource('pain-journal-for-disability-benefits', 'Pain Journal for Disability Benefits — Free Benefits-Ready Template | PainTracker.ca', 'Download a free pain journal template designed specifically for disability benefits applications. Covers SSDI, LTD, WorkSafeBC. Includes functional limitation tracking and evidence-ready formatting.'),
  resource('daily-functioning-log-for-disability', 'Daily Functioning Log for Disability | PainTracker.ca', 'Download the free PainTracker.ca daily functioning log designed for disability claims. Track self-care, household, work, social, and physical activities with capacity ratings evaluators use.'),
  resource('fibromyalgia-pain-diary', 'Fibromyalgia Pain Diary — Free 6-Page Fibro Symptom Tracker | PainTracker.ca', 'Download a free fibromyalgia pain diary that tracks all 6 symptom domains: widespread pain, fatigue, fibro fog, sleep, sensitivity, and mood. Designed for ACR criteria and rheumatology appointments.'),
  resource('chronic-back-pain-diary', 'Chronic Back Pain Diary — Free 6-Page Back Pain Tracker | PainTracker.ca', 'Download a free chronic back pain diary designed for spine-specific tracking. Document pain location, radiation patterns, activity triggers, posture, and PT exercises for better treatment outcomes.'),
  resource('arthritis-pain-tracker', 'Arthritis Pain Tracker — Free 6-Page Joint Pain Diary | PainTracker.ca', 'Download a free arthritis pain tracker for RA, OA, PsA, and gout. Track morning stiffness, joint-by-joint pain, swelling, functional impact, and treatment response.'),
  resource('nerve-pain-symptom-log', 'Nerve Pain Symptom Log — Free 6-Page Neuropathy Tracker | PainTracker.ca', 'Download a free nerve pain symptom log for neuropathy, sciatica, and neurological pain. Track burning, tingling, numbness, shooting pain, progression, and treatment response.'),
  resource('endometriosis-pain-log', 'Endometriosis Pain Log — Free 6-Page Endo Symptom Tracker | PainTracker.ca', 'Download a free endometriosis pain log that tracks pelvic pain, cycle phases, GI symptoms, fatigue, and treatment response. Designed to shorten the 7-year diagnostic wait.'),
  resource('crps-pain-diary-template', 'CRPS Pain Diary Template — Free Complex Regional Pain Syndrome Tracker | PainTracker.ca', 'Download a free CRPS pain diary tracking burning pain, allodynia, color and temperature changes, swelling, motor symptoms, and limb comparison. Aligned with Budapest diagnostic criteria.'),
  resource('neuropathy-symptom-tracker', 'Neuropathy Symptom Tracker — Free Peripheral Neuropathy Tracker PDF | PainTracker.ca', 'Download a free neuropathy symptom tracker covering sensory, motor, autonomic, and balance symptoms. Track progression, falls, and treatment response for neurologist visits.'),
  resource('pain-diary-for-doctor-visits', 'Pain Diary Template for Doctor Visits: What to Track, How to Summarize, and What to Bring', 'A printable pain diary template built for doctor appointments. Track what matters in the two weeks before your visit, then condense it into a one-page summary your GP or specialist can actually use.'),
  resource('symptom-journal-template', 'Symptom Journal Template: Track 40+ Symptoms, Triggers, Meds, and Functional Impact (Free Download)', 'Free printable symptom journal template covering physical symptoms, cognitive changes, sleep, medications, functional impact, and triggers. 3-minute daily entries, 6 categories, pattern-ready format.'),
  resource('chronic-pain-log-printable', 'Chronic Pain Log Printable: Free Daily, Flare, and Monthly Tracking Sheets', 'Download a free printable chronic pain log with four formats: daily entry sheet, flare episode record, weekly summary, and monthly trend log. Works for all chronic pain conditions.'),
  resource('pain-journal-examples', 'Pain Journal Examples: Real Entries for Worst Days, Standard Days, Flares, and Good Days', 'See real pain journal entry examples for every kind of day - 1-minute minimal entries for bad days, 3-minute standard entries, detailed flare documentation, and good-day records. Copy the format directly.'),
].map(withStructuredData);

export const privateRouteMetadata = [
  {
    path: '/start',
    title: 'Unlock Pain Tracker | PainTracker.ca',
    description: 'Unlock or set up your local Pain Tracker vault to access your private records on this device.',
    canonicalUrl: `${SITE_URL}/start`,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  {
    path: '/subscription',
    title: 'Manage Subscription | PainTracker.ca',
    description: 'Manage your Pain Tracker subscription from the protected account area.',
    canonicalUrl: `${SITE_URL}/subscription`,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  {
    path: '/app',
    title: 'Pain Tracker App | PainTracker.ca',
    description: 'Open the protected Pain Tracker application for your private records and exports.',
    canonicalUrl: `${SITE_URL}/app`,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  {
    path: '/app/checkin',
    title: 'Pain Tracker Daily Check-In | PainTracker.ca',
    description: 'Open your protected daily check-in inside Pain Tracker.',
    canonicalUrl: `${SITE_URL}/app/checkin`,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
  {
    path: '/clinic/login',
    title: 'Clinic Login | PainTracker.ca',
    description: 'Clinic portal sign-in for Pain Tracker.',
    canonicalUrl: `${SITE_URL}/clinic/login`,
    ogImage: DEFAULT_OG_IMAGE,
    noindex: true,
  },
];

export const publicTopLevelPrerenderSlugs = publicRouteMetadata
  .map((route) => route.path)
  .filter((path) => path !== '/' && !path.startsWith('/resources/'))
  .map((path) => path.slice(1));

export const publicResourcePrerenderSlugs = publicRouteMetadata
  .map((route) => route.path)
  .filter((path) => path.startsWith('/resources/'))
  .map((path) => path.replace('/resources/', ''));

export const publicRouteMetadataByPath = new Map(
  publicRouteMetadata.map((route) => [route.path, route])
);

export const privateRouteMetadataByPath = new Map(
  privateRouteMetadata.map((route) => [route.path, route])
);

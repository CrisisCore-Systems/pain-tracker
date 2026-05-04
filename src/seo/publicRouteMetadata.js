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

const RESOURCES_HUB_FAQS = [
  {
    question: 'What is a pain tracker template?',
    answer:
      'A pain tracker template is a structured page you can print or reuse to record pain level, location, triggers, medication response, and daily limits. It helps you build consistent records instead of trying to remember details later during a flare, doctor appointment, or disability review.',
  },
  {
    question: 'Is the pain journal printable free?',
    answer:
      'Yes. The printable pain journal templates and tracker sheets in this resource hub are free to download and use. You can start with paper, keep your own copies, and move to the private offline app later if you want faster tracking and cleaner exports.',
  },
  {
    question: 'What should I write in a pain journal?',
    answer:
      'Write down pain intensity, where the pain is, what seems to trigger it, how sleep and activity affected it, what medication or self-care you tried, and what changed in your ability to function. Short daily notes are usually more useful than long entries written only during severe flares.',
  },
  {
    question: 'Can I use a pain tracker for doctor appointments?',
    answer:
      'Yes. A pain tracker can help you bring organized notes to doctor appointments, especially when visits are short. Patterns across days or weeks often make appointments more productive because you can show pain severity, flare timing, treatment response, and how symptoms affect daily function.',
  },
  {
    question: 'Can I use a pain journal for disability or WorkSafeBC documentation?',
    answer:
      'Yes. A pain journal can support disability or WorkSafeBC documentation when it records pain consistently and ties symptoms to functional impact. Daily notes about limits, missed tasks, medication effects, and flare recovery are often more useful than general summaries written weeks later.',
  },
  {
    question: 'Is PainTracker private?',
    answer:
      'PainTracker is built around local-first privacy. You can start with printables or use the app without an account, and your records stay under your control until you choose to export them. The product is designed to reduce unnecessary exposure rather than pushing you into cloud-first tracking.',
  },
  {
    question: 'Does PainTracker work offline?',
    answer:
      'Yes. PainTracker is designed to keep working offline so you can keep tracking even when internet access is unreliable or you do not want to depend on a connection. That matters when pain is high, appointments are close, or you need records available on your own device.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. You can use PainTracker resources and the core tracking experience without creating an account. That makes it easier to start quickly, reduces friction on hard days, and keeps the basic tracking workflow focused on your records instead of sign-up, passwords, or cloud dependence.',
  },
  {
    question: 'Should I use the app or a printable template?',
    answer:
      'Start with the format that makes tracking easiest today. Printable templates work well when you want something simple and visible. The app becomes useful when you want private offline records, faster daily entries, and cleaner summaries or exports without changing the habit you already built on paper.',
  },
];

const RESOURCES_PRERENDER_BODY = `
<main id="initial-loader" aria-label="PainTracker resources" style="padding: 2rem 1.5rem 4rem; max-width: 68rem; margin: 0 auto; color: #f1f5f9;">
  <p style="margin: 0 0 1rem; color: #7dd3fc; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">Free printables and private tracking</p>
  <h1 class="initial-route-heading" style="max-width: 18ch; margin-bottom: 1.25rem;">Free Pain Tracker Templates, Printable Pain Journals, and Private Tracking Guides</h1>
  <p style="max-width: 56rem; line-height: 1.7; color: #cbd5e1;">PainTracker resources help you document chronic pain clearly, privately, and consistently. Download free printable pain tracker templates, build a daily pain journal, prepare better notes for doctor appointments, or use the private offline app when paper stops being enough.</p>
  <p style="max-width: 56rem; line-height: 1.7; color: #e2e8f0; font-weight: 600;">Start with a printable. Keep control of your records. Move into private digital tracking when you are ready.</p>
  <section style="margin-top: 2rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Printable Pain Tracker Templates</h2>
    <p style="line-height: 1.7; color: #cbd5e1;">Begin with the strongest printable intent pages: <a href="/resources/monthly-pain-tracker-printable" style="color: #7dd3fc;">Monthly Pain Tracker Printable</a>, <a href="/resources/daily-pain-tracker-printable" style="color: #7dd3fc;">Daily Pain Tracker Template</a>, <a href="/resources/weekly-pain-tracker-printable" style="color: #7dd3fc;">Weekly Pain Journal Template</a>, and <a href="/resources/doctor-visit-pain-summary-template" style="color: #7dd3fc;">Pain Journal Template for Doctor Visits</a>. For broader download intent, the hub also connects to <a href="/resources/pain-diary-template-free-download" style="color: #7dd3fc;">daily, weekly, and monthly pain diary downloads</a> and condition-specific printables.</p>
  </section>
  <section style="margin-top: 2rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">What to Track in a Pain Journal</h2>
    <p style="line-height: 1.7; color: #cbd5e1;">Track pain level, pain location, triggers, sleep, medication response, mood, flare patterns, functional impact, and notes for appointments. The full guide on <a href="/resources/what-to-include-in-pain-journal" style="color: #7dd3fc;">what to include in a pain journal</a> connects the template pages to real doctor-visit and disability-documentation use, while <a href="/resources/how-to-start-a-pain-journal" style="color: #7dd3fc;">how to start a pain journal</a> helps when the habit still feels too heavy.</p>
  </section>
  <section style="margin-top: 2rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Condition Specific Pain Logs</h2>
    <p style="line-height: 1.7; color: #cbd5e1;">Use focused templates like <a href="/resources/endometriosis-pain-log" style="color: #7dd3fc;">Endometriosis Pain Log</a>, <a href="/resources/migraine-pain-diary-printable" style="color: #7dd3fc;">Migraine Pain Diary</a>, <a href="/resources/fibromyalgia-pain-diary" style="color: #7dd3fc;">Fibromyalgia Pain Tracker</a>, <a href="/resources/chronic-back-pain-diary" style="color: #7dd3fc;">Back Pain Tracker</a>, <a href="/resources/arthritis-pain-tracker" style="color: #7dd3fc;">Arthritis Pain Journal</a>, and <a href="/resources/crps-pain-diary-template" style="color: #7dd3fc;">CRPS Pain Diary</a>. Their companion guides explain the reasoning layer too: <a href="/resources/pain-tracking-for-migraines" style="color: #7dd3fc;">migraine tracking</a>, <a href="/resources/pain-tracking-for-back-pain" style="color: #7dd3fc;">back pain tracking</a>, <a href="/resources/pain-tracking-for-arthritis" style="color: #7dd3fc;">arthritis tracking</a>, and <a href="/resources/pain-tracking-for-crps" style="color: #7dd3fc;">CRPS tracking</a>.</p>
  </section>
  <section style="margin-top: 2rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Doctor Visit and Disability Documentation</h2>
    <p style="line-height: 1.7; color: #cbd5e1;">Use the documentation lane for <a href="/resources/how-to-track-pain-for-doctors" style="color: #7dd3fc;">doctor appointments</a>, <a href="/resources/daily-functioning-log-for-disability" style="color: #7dd3fc;">Daily Functioning Log for Disability</a>, <a href="/resources/worksafebc-pain-journal-template" style="color: #7dd3fc;">WorkSafeBC Pain Journal Template</a>, <a href="/resources/functional-capacity-log" style="color: #7dd3fc;">Functional Impact Log</a>, and <a href="/resources/medication-and-pain-log" style="color: #7dd3fc;">Medication Response Tracker</a>. When claims or specialist reviews are involved, the strongest record usually pairs symptom tracking with function tracking rather than treating them as separate stories.</p>
  </section>
  <section style="margin-top: 2rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Private Offline App Guides</h2>
    <p style="line-height: 1.7; color: #cbd5e1;">When paper stops being enough, move into the product lane through <a href="/resources/free-pain-tracker-app" style="color: #7dd3fc;">How to use PainTracker offline</a>, <a href="/privacy-architecture" style="color: #7dd3fc;">how private local tracking works</a>, <a href="/privacy" style="color: #7dd3fc;">why no account matters</a>, <a href="/pain-tracker-app" style="color: #7dd3fc;">how to export pain records</a>, and <a href="/download" style="color: #7dd3fc;">how to install the app</a>. The intended flow is printable to habit to doctor usefulness to private app.</p>
  </section>
  <section style="margin-top: 2.25rem;">
    <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Frequently asked questions</h2>
    <div style="display: grid; gap: 1rem;">
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">What is a pain tracker template?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">A pain tracker template is a structured page you can print or reuse to record pain level, location, triggers, medication response, and daily limits. It helps you build consistent records instead of trying to remember details later during a flare, doctor appointment, or disability review.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Is the pain journal printable free?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Yes. The printable pain journal templates and tracker sheets in this resource hub are free to download and use. You can start with paper, keep your own copies, and move to the private offline app later if you want faster tracking and cleaner exports.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">What should I write in a pain journal?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Write down pain intensity, where the pain is, what seems to trigger it, how sleep and activity affected it, what medication or self-care you tried, and what changed in your ability to function. Short daily notes are usually more useful than long entries written only during severe flares.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Can I use a pain tracker for doctor appointments?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Yes. A pain tracker can help you bring organized notes to doctor appointments, especially when visits are short. Patterns across days or weeks often make appointments more productive because you can show pain severity, flare timing, treatment response, and how symptoms affect daily function.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Can I use a pain journal for disability or WorkSafeBC documentation?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Yes. A pain journal can support disability or WorkSafeBC documentation when it records pain consistently and ties symptoms to functional impact. Daily notes about limits, missed tasks, medication effects, and flare recovery are often more useful than general summaries written weeks later.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Is PainTracker private?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">PainTracker is built around local-first privacy. You can start with printables or use the app without an account, and your records stay under your control until you choose to export them. The product is designed to reduce unnecessary exposure rather than pushing you into cloud-first tracking.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Does PainTracker work offline?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Yes. PainTracker is designed to keep working offline so you can keep tracking even when internet access is unreliable or you do not want to depend on a connection. That matters when pain is high, appointments are close, or you need records available on your own device.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Do I need an account?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">No. You can use PainTracker resources and the core tracking experience without creating an account. That makes it easier to start quickly, reduces friction on hard days, and keeps the basic tracking workflow focused on your records instead of sign-up, passwords, or cloud dependence.</p>
      </div>
      <div>
        <h3 style="font-size: 1rem; margin-bottom: 0.35rem; color: #f8fafc;">Should I use the app or a printable template?</h3>
        <p style="line-height: 1.7; color: #cbd5e1;">Start with the format that makes tracking easiest today. Printable templates work well when you want something simple and visible. The app becomes useful when you want private offline records, faster daily entries, and cleaner summaries or exports without changing the habit you already built on paper.</p>
      </div>
    </div>
  </section>
</main>`;

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
      structuredData.push(makeSoftwareApplicationSchema());
    }

    const faqItems = route.faqItems ?? (route.path === '/pricing' ? PRICING_FAQS : null);
    if (faqItems?.length) {
      structuredData.push(makeFaqSchema(faqItems));
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
    title: 'PainTracker.ca | Free Private Pain Tracker App That Works Offline',
    description: 'PainTracker.ca helps you log pain, symptoms, medications, triggers, and daily function without creating an account. Private, offline capable, and built for user controlled export.',
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
    title: 'Download PainTracker Free | Private Offline Pain Tracker',
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
    title: 'Private Offline Pain Tracking App for Chronic Pain and Flares',
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
    title: 'Pain Diary Template: Daily, Weekly, and Monthly Printable Logs (Free)',
    description: 'Download free pain diary templates for daily, weekly, and monthly tracking. Includes pain level, location, triggers, medication, sleep, and function notes.',
    canonicalUrl: `${SITE_URL}/pain-diary-template`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/pain-tracking-apps-comparison',
    title: 'Best Pain Tracking Apps in 2026: Private, Free, Offline, and Printable Options',
    description: 'Compare the best pain tracking apps for privacy, offline use, printable logs, chronic pain journaling, and doctor-ready symptom reports.',
    canonicalUrl: `${SITE_URL}/pain-tracking-apps-comparison`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  {
    path: '/offline-pain-tracker-app',
    title: 'Offline Pain Tracker App: Private Daily Logging Without Account Lock-In',
    description: 'Use an offline pain tracker app for private daily symptom logging, flare tracking, medication notes, and doctor-ready summaries without account lock-in.',
    canonicalUrl: `${SITE_URL}/offline-pain-tracker-app`,
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
    title: 'Free Pain Tracker Templates & Pain Journal Printables | PainTracker.ca',
    description: 'Download free pain tracker templates, printable pain journals, condition-specific pain logs, and private tracking guides for chronic pain, doctor visits, disability documentation, and daily symptom tracking.',
    canonicalUrl: `${SITE_URL}/resources`,
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbName: 'Resources',
    prerenderHeading: 'Free Pain Tracker Templates, Printable Pain Journals, and Private Tracking Guides',
    faqItems: RESOURCES_HUB_FAQS,
    prerenderBodyHtml: RESOURCES_PRERENDER_BODY,
  },
  resource('pain-diary-template-pdf', 'Free Daily Pain Tracker Printable PDF', 'Download a free daily pain tracker printable PDF for pain intensity, location, symptoms, medications, triggers, and daily function notes.'),
  resource('daily-pain-tracker-printable', 'Free Daily Pain Tracker Printable PDF | PainTracker.ca', 'Download the free PainTracker.ca daily pain tracker printable PDF to record pain levels, medications, flare ups, triggers, daily limits, mood, and notes for doctor visits.'),
  resource('weekly-pain-tracker-printable', 'Weekly Pain Tracker Printable: Free Symptom and Flare-Up Log', 'Download a free weekly pain tracker printable to record pain levels, symptoms, triggers, medication, sleep, and flare-ups before appointments.'),
  resource('weekly-pain-log-pdf', 'Weekly Pain Log PDF — Free 7-Day Pain Tracker Template | PainTracker.ca', 'Download a free weekly pain log PDF. 8-section 7-day spread tracks daily pain, sleep, medications, activity, mood, triggers, and weekly patterns - ideal for appointments and disability claims.'),
  resource('monthly-pain-tracker-printable', 'Monthly Pain Tracker Printable — Free 30-Day Template | PainTracker.ca', 'Download a free monthly pain tracker printable. 8-section 30-day template tracks daily pain calendar, sleep, medications, functional impact, triggers, mood, and monthly summary - ideal for treatment reviews and disability claims.'),
  resource('flare-up-tracker-printable', 'Flare-Up Tracker Printable: Free Pain Episode Log and Trigger Worksheet', 'Track pain flare-ups with a free printable log for start time, severity, triggers, response actions, and recovery timing.'),
  resource('medication-and-pain-log', 'Medication and Pain Log: Free Printable for Dose, Timing, and Relief Tracking', 'Use a free medication and pain log to track dose timing, pain before and after medication, side effects, and relief duration.'),
  resource('doctor-visit-pain-summary-template', 'Doctor Visit Pain Summary Template: Free One-Page Appointment Sheet', 'Use a one-page doctor visit pain summary template to present symptom trends, triggers, medication response, and key questions quickly.'),
  resource('body-pain-chart-template', 'Body Pain Chart Template: Free Printable Body Location Tracker', 'Use a free printable body pain chart template to mark pain location, spread, intensity zones, and symptom changes over time.'),
  resource('chronic-pain-journal-template', 'Chronic Pain Journal Template: Free Daily Tracking Worksheet', 'Download a chronic pain journal template for daily pain levels, symptom patterns, triggers, medication, sleep, and functional impact notes.'),
  resource('how-to-start-a-pain-journal', 'How to Start a Pain Journal: Simple Daily Method That Sticks', 'Learn how to start a pain journal with a simple daily method for pain levels, triggers, medication, sleep, and function tracking.'),
  resource('how-to-describe-pain', 'How to Describe Pain Clearly for Doctors: Words, Scale, Location, and Pattern', 'Learn how to describe pain clearly using location, quality words, severity scale, timing, triggers, and functional impact.'),
  resource('how-to-track-pain-triggers', 'How to Track Pain Triggers: Practical Method for Sleep, Stress, Weather, and Activity', 'Learn how to track pain triggers with a practical method covering sleep, stress, weather, movement, medication timing, and flare patterns.'),
  resource('pain-tracking-for-fibromyalgia', 'Pain Tracking for Fibromyalgia: What to Record and Why It Helps', 'Learn how to track fibromyalgia pain effectively: widespread pain, fatigue, fibro fog, sleep quality, flares, and treatment response — all in one place.'),
  resource('how-to-use-pain-scale', 'How to Use a Pain Scale Correctly: NRS, VAS, and Functional Impact', 'Learn how to use a pain scale accurately — the 0-10 NRS, VAS, and faces scale — including what each number means and how to report pain consistently to your doctor.'),
  resource('pain-diary-for-insurance-claims', 'Pain Diary for Insurance Claims: What to Document and Why It Matters', 'Learn how to keep a pain diary that supports insurance claims — what adjusters look for, what to record daily, and how to organize evidence that survives review.'),
  resource('printable-symptom-checklist', 'Printable Symptom Checklist: Free 40+ Symptom Log for Doctor Visits', 'Download a free printable symptom checklist covering 40+ symptoms — pain, fatigue, sleep, mood, GI, and cognitive — to prepare for appointments and track changes.'),
  resource('pain-relief-log', 'Pain Relief Log: Free Printable for Tracking What Actually Helps', 'Track what relieves your pain — medications, heat, rest, movement, and other interventions — with a free pain relief log that shows what actually works over time.'),
  resource('pain-tracking-before-surgery', 'Pain Tracking Before Surgery: What to Document and How It Helps', 'Learn what to track before surgery — baseline pain levels, functional limits, medication use, and symptom patterns — to help your surgical team and support recovery comparison.'),
  resource('chronic-fatigue-symptom-log', 'Chronic Fatigue Symptom Log: Free ME/CFS and Fatigue Tracking Template', 'Download a free chronic fatigue symptom log to track energy, post-exertional malaise, sleep, cognitive function, pain, and daily activity — essential for ME/CFS and chronic fatigue management.'),
  resource('functional-capacity-log', 'Functional Capacity Log: Free Printable for Daily Limitations and Activities', 'Track what you can and cannot do each day with a free functional capacity log — self-care, household tasks, work, social activity, and physical tolerance for disability and medical review.'),
  resource('pain-diary-for-disability-application', 'Pain Diary for Disability Application: What to Track, How to Format, and Why It Matters', 'Learn how to keep a pain diary for a disability application — what evaluators look for, what to document daily, and how to create a record that supports your claim.'),
  resource('sleep-and-pain-tracker', 'Sleep and Pain Tracker: Free Template for Tracking How Sleep Affects Pain', 'Track the connection between sleep and pain with a free sleep and pain tracker. Record sleep hours, quality, wake-ups, and next-day pain to find patterns that affect your recovery.'),
  resource('pain-tracking-for-arthritis', 'Pain Tracking for Arthritis: What to Record for RA, OA, and PsA', 'Learn how to track arthritis pain and joint symptoms effectively — morning stiffness, swelling, range of motion, flares, and medication response — for rheumatology appointments.'),
  resource('pain-tracking-for-migraines', 'Pain Tracking for Migraines: How to Log Attacks, Triggers, and Treatment Response', 'Learn how to track migraines effectively — attack onset, phases, severity, duration, triggers, and medication response — to find patterns and prepare for neurology appointments.'),
  resource('weather-and-pain-tracker', 'Weather and Pain Tracker: Track How Weather Affects Your Chronic Pain', 'Discover how to track the connection between weather and chronic pain — barometric pressure, temperature, humidity, and precipitation — to identify your personal weather triggers.'),
  resource('exercise-and-pain-log', 'Exercise and Pain Log: Track Activity and Pain Together to Find What Helps', 'Use a free exercise and pain log to track movement, activity type, duration, and next-day pain levels — to find what physical activity helps versus worsens your chronic pain.'),
  resource('free-pain-tracker-app', 'Free Pain Tracker App: No Account, No Cloud, Private Pain Tracking', 'PainTracker.ca is a free pain tracker app that works without an account or cloud storage. Track pain, symptoms, medications, and triggers privately on your device.'),
  resource('best-pain-tracking-app', 'Best Pain Tracking App for Chronic Pain: What to Look For in 2026', 'What makes the best pain tracking app for chronic pain? Key features to look for — offline access, data ownership, clinical exports, and privacy — and how PainTracker.ca compares.'),
  resource('pain-tracker-for-iphone', 'Pain Tracker for iPhone: Free App That Works Offline Without an Account', 'PainTracker.ca works as a free pain tracker on iPhone — install it to your home screen for offline access, daily tracking, and clean exports without an Apple account or App Store download.'),
  resource('pain-journal-for-kids-and-teens', 'Pain Journal for Kids and Teens: Free Simple Tracking for Young People', 'A free pain journal guide for children and teenagers — simple daily tracking of pain location, severity, triggers, and school impact to support paediatric appointments and school accommodations.'),
  resource('pain-diary-template-free-download', 'Pain Diary Template Free Download: Daily, Weekly, and Monthly Formats', 'Download free pain diary templates in daily, weekly, and monthly formats. Printable PDF pain trackers for doctor visits, disability claims, and personal chronic pain management.'),
  resource('chronic-pain-self-care-log', 'Chronic Pain Self-Care Log: Track Rest, Pacing, and Recovery Strategies', 'Use a free chronic pain self-care log to track rest periods, pacing strategies, heat and cold use, breathing, and other non-medication interventions that support pain management.'),
  resource('pain-tracking-for-back-pain', 'Pain Tracking for Back Pain: What to Record for Lower and Upper Back Pain', 'Learn how to track back pain effectively — location, severity, posture triggers, activity impact, and treatment response — to get better care for chronic lower and upper back pain.'),
  resource('pain-tracking-for-nerve-pain', 'Pain Tracking for Nerve Pain: How to Log Neuropathic Symptoms and Triggers', 'Learn how to track neuropathic pain — burning, shooting, numbness, and tingling — alongside triggers, medication response, and functional impact for neurology and pain clinic appointments.'),
  resource('pain-tracker-for-android', 'Pain Tracker for Android: Free App That Works Offline Without an Account', 'PainTracker.ca works as a free pain tracker on Android — add it to your home screen from Chrome for offline access, daily tracking, and clean exports without a Google account or Play Store download.'),
  resource('pain-diary-for-workers-compensation', "Pain Diary for Workers' Compensation: How to Document a Workplace Injury Claim", "Learn how to keep a pain diary for a workers' compensation claim — daily pain records, functional limits, and work impact documentation that supports WSBC, WSIB, and other board reviews."),
  resource('pain-diary-for-rheumatologist', 'Pain Diary for Rheumatologist: What to Track Before Your Appointment', 'Learn what to record in a pain diary for a rheumatologist — morning stiffness, joint involvement, fatigue, flares, and medication response — to get the most from your appointment.'),
  resource('pain-log-for-physical-therapy', 'Pain Log for Physical Therapy: Track Progress and Response During Rehab', 'Use a free pain log for physical therapy to track exercise response, functional progress, and pain during rehabilitation — so your physiotherapist can adjust your program with data.'),
  resource('chronic-pain-medication-log', 'Chronic Pain Medication Log: Track Medications, Doses, and Effectiveness', 'Use a free chronic pain medication log to track medications, doses, timing, side effects, and pain relief effectiveness — for safe management and better prescriber conversations.'),
  resource('daily-symptom-tracker', 'Daily Symptom Tracker: Free Template for Chronic Illness and Pain Management', 'Use a free daily symptom tracker to log pain, fatigue, sleep, mood, brain fog, and other chronic illness symptoms — for better clinical appointments and personal pattern awareness.'),
  resource('pain-tracking-app-for-seniors', 'Pain Tracking App for Seniors: Simple, Free, and Offline-Capable', 'PainTracker.ca is a simple, free pain tracking app for seniors — large text, high contrast, no account required, and offline-capable for tracking pain and medications at home.'),
  resource('pain-diary-for-personal-injury-claim', 'Pain Diary for Personal Injury Claim: How to Document Pain and Function for Legal Proceedings', 'Learn how to keep a pain diary for a personal injury claim — daily pain records, functional limits, and life impact documentation that supports legal proceedings and insurance negotiations.'),
  resource('pain-tracking-for-lupus', 'Pain Tracking for Lupus: How to Log SLE Pain, Flares, and Organ Symptoms', 'Learn how to track lupus pain effectively — joint pain, flare patterns, organ involvement, fatigue, and medication response — to support rheumatology appointments and disability documentation.'),
  resource('pain-tracking-for-endometriosis', 'Pain Tracking for Endometriosis: How to Log Pelvic Pain, Cycle Correlation, and Functional Impact', 'Learn how to track endometriosis pain effectively — pelvic pain cycles, dysmenorrhea severity, bowel and bladder symptoms, and functional limits — to support diagnosis, surgical decisions, and disability documentation.'),
  resource('pain-tracker-for-ipad', 'Pain Tracker for iPad: Free Offline App — No Download Required', 'PainTracker.ca works on iPad as a free, offline-capable pain tracking app. No App Store download required — install it as a PWA from Safari in seconds and track pain privately.'),
  resource('pain-diary-for-social-security-disability', 'Pain Diary for Social Security Disability: How to Document Pain for SSDI and SSI Claims', 'Learn how to keep a pain diary for Social Security Disability — daily functional limits, pain severity, medication effects, and activity restrictions that support SSDI and SSI applications and appeals.'),
  resource('pain-diary-for-long-term-disability', 'Pain Diary for Long-Term Disability Insurance: How to Document Chronic Pain for LTD Claims', 'Learn how to keep a pain diary for a long-term disability insurance claim — daily functional limits, occupational restrictions, medication effects, and consistent documentation that supports LTD applications and appeals.'),
  resource('pain-tracking-for-cancer-pain', 'Pain Tracking for Cancer Pain: How to Log Oncology Pain and Treatment Response', 'Learn how to track cancer pain effectively — baseline and breakthrough pain, opioid and adjuvant medication response, treatment side effects, and functional impact — to support palliative care and oncology appointments.'),
  resource('pain-tracking-for-ehlers-danlos', 'Pain Tracking for Ehlers-Danlos Syndrome: How to Log Hypermobility, Subluxations, and Chronic Pain', 'Learn how to track Ehlers-Danlos syndrome pain — joint hypermobility, subluxations, POTS episodes, dysautonomia, fatigue, and multi-system symptoms — for connective tissue specialists and disability documentation.'),
  resource('pain-diary-for-physiotherapist', 'Pain Diary for Physiotherapist: What to Track Between PT Sessions', 'Learn what to track in a pain diary for physiotherapy — exercise response, pain levels before and after sessions, home exercise compliance, and functional progress — to make every PT appointment more effective.'),
  resource('pain-management-journal', 'Pain Management Journal: How to Keep a Daily Log That Improves Your Treatment', 'Learn how to keep a pain management journal — daily pain entries, treatment response, functional limits, and emotional impact — to improve clinical care, support disability documentation, and understand your own patterns.'),
  resource('pain-tracking-for-ms', 'Pain Tracking for Multiple Sclerosis: How to Log MS Pain, Spasticity, and Neuropathic Symptoms', 'Learn how to track MS pain effectively — neuropathic pain, spasticity, Lhermitte\'s sign, fatigue, and relapse patterns — to support neurology appointments and disability documentation.'),
  resource('pain-tracking-for-crps', 'Pain Tracking for CRPS: How to Log Complex Regional Pain Syndrome Symptoms', 'Learn how to track CRPS pain effectively — allodynia, skin changes, temperature asymmetry, motor dysfunction, and treatment response — to support pain clinic and specialist appointments and disability documentation.'),
  resource('pain-tracking-for-sciatica', 'Pain Tracking for Sciatica: What to Log for Nerve Pain Down the Leg', 'Learn how to track sciatica pain effectively — leg radiation pattern, neurological symptoms, posture and activity triggers, and treatment response — to support GP, physiotherapy, and specialist appointments.'),
  resource('pain-tracking-after-surgery', 'Pain Tracking After Surgery: How to Log Post-Surgical Pain and Recovery Progress', 'Learn how to track pain after surgery — post-operative pain severity, medication timing, wound status, functional milestones, and recovery progress — to support follow-up appointments and identify complications early.'),
  resource('pain-diary-for-gp-appointment', 'Pain Diary for GP Appointment: What to Track and Bring to Your Family Doctor', 'Learn what to track in a pain diary for your GP or family doctor appointment — pain severity, functional limits, medication response, and trigger patterns — to make every 15-minute appointment count.'),
  resource('pain-tracking-for-headaches', 'Pain Tracking for Headaches: How to Log Tension, Cluster, and Chronic Daily Headaches', 'Learn how to track headaches effectively — headache frequency, duration, severity, type, triggers, and medication response — to identify patterns, reduce overuse, and prepare for neurology appointments.'),
  resource('pain-tracking-for-hip-pain', 'Pain Tracking for Hip Pain: What to Log for Hip OA, Bursitis, and Labral Tears', 'Learn how to track hip pain effectively — pain location, weight-bearing limits, gait changes, activity triggers, and treatment response — to support orthopaedic, physiotherapy, and surgical assessment appointments.'),
  resource('pain-tracking-for-shoulder-pain', 'Pain Tracking for Shoulder Pain: What to Log for Rotator Cuff, Impingement, and Frozen Shoulder', 'Learn how to track shoulder pain effectively — movement restrictions, overhead tolerance, night pain, activity triggers, and treatment response — to support physiotherapy, orthopaedic, and surgical appointments.'),
  resource('chronic-pain-flare-tracker', 'Chronic Pain Flare Tracker: How to Log Flares, Triggers, and Recovery Time', 'Use a chronic pain flare tracker to document flare onset, severity, duration, triggers, and recovery time — to identify your flare patterns, manage them proactively, and prepare for clinical appointments.'),
  resource('pain-diary-template-for-insurance', 'Pain Diary Template for Insurance Claims: How to Document Chronic Pain for Insurers', 'Learn how to keep a pain diary for insurance claims — daily functional limits, treatment compliance, medication effects, and consistent documentation that satisfies insurer requirements for chronic pain claims.'),
  resource('pain-tracker-for-desktop', 'Pain Tracker for Desktop: Free Online Pain Tracking App — No Download Required', 'PainTracker.ca works on desktop as a free, browser-based pain tracking app. No download, no account required — open it in any browser on Windows, Mac, or Linux and track pain privately offline.'),
  resource('pain-scale-chart-printable', 'Pain Scale Chart Printable — Free 0-10 NRS Visual Reference | PainTracker.ca', 'Download a free printable pain scale chart. Visual 0-10 Numeric Rating Scale with descriptors, faces, colors, and functional impact - the clinical standard for consistent pain reporting.'),
  resource('symptom-tracker-printable', 'Symptom Tracker Printable — Free Comprehensive Daily Symptom Log | PainTracker.ca', 'Download a free symptom tracker printable. Track fatigue, sleep quality, mood, brain fog, energy, and more alongside pain - the complete picture your doctor needs for chronic illness management.'),
  resource('migraine-pain-diary-printable', 'Migraine Pain Diary Printable - Free Headache Tracker Template (2026) | PainTracker.ca', 'Download our free 6-page migraine diary PDF. Track all 4 migraine phases, auras, 30+ common triggers, medications, and monthly patterns. Recommended by the American Headache Society tracking framework.'),
  resource('printable-pain-log-sheet', 'Printable Pain Log Sheet — Free Simple Daily Pain Tracker You Can Print Right Now | PainTracker.ca', 'Download a free printable pain log sheet with daily pain ratings, symptom tracking, medication log, and notes section. Print and start tracking in under a minute.'),
  resource('chronic-pain-diary-template', 'Chronic Pain Diary Template — Free Long-Term Pain Tracker for Flares, Baseline & Trends | PainTracker.ca', 'Download a free 6-page chronic pain diary template with baseline/flare tracking, trigger identification, treatment logs, and monthly trend reviews for long-term pain management.'),
  resource('7-day-pain-diary-template', '7-Day Pain Diary Template — Free One-Week Pain Tracker for Doctor Appointments | PainTracker.ca', 'Download a free 7-day pain diary template. One-week format with morning, midday, and evening tracking, medication logs, and a doctor-ready weekly summary.'),
  resource('how-to-track-pain-for-doctors', 'How to Track Pain for Doctors — What Your Doctor Actually Needs | PainTracker.ca', 'Learn exactly what to track and how to present pain data to your doctor in 15-minute appointments. 7 key data points, appointment prep checklist, and free tracking templates.'),
  resource('what-to-include-in-pain-journal', 'What to Include in a Pain Journal: 12 Things to Track + Free Template', 'Learn what to record in a pain journal, including pain level, location, triggers, medication, sleep, mood, function, and notes for appointments.'),
  resource('how-doctors-use-pain-diaries', 'How Doctors Use Pain Diaries — The Clinical Perspective | PainTracker.ca', 'Understand how doctors actually use pain diary data to make treatment decisions. 6 clinical uses, decision timeline, and how to make your tracking clinically useful.'),
  resource('pain-diary-for-specialist-appointment', 'Pain Diary for Specialist Appointment — What to Track & Bring | PainTracker.ca', 'Prepare for your specialist appointment with the right pain diary data. What pain specialists, rheumatologists, neurologists, and surgeons need. Free one-page summary template.'),
  resource('symptom-tracking-before-diagnosis', 'Symptom Tracking Before Diagnosis — What to Track When You Don\'t Know What\'s Wrong | PainTracker.ca', 'Learn what to track when your pain has not been diagnosed yet. Pattern recognition guide, pre-diagnosis tracking categories, and doctor-ready summary template.'),
  resource('documenting-pain-for-disability-claim', 'Documenting Pain for Disability Claim — Complete Evidence Guide | PainTracker.ca', 'Learn exactly how to document chronic pain for disability claims. What adjusters look for, 6 mistakes that get claims denied, evidence pyramid, and free templates to build your case.'),
  resource('worksafebc-pain-journal-template', 'WorkSafeBC Pain Journal Template for Workplace Injury Notes', 'For workplace injury documentation: keep structured notes about pain, functional limits, medication changes, triggers, and recovery patterns for appointment and claim-related review.'),
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

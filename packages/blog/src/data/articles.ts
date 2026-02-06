/**
 * SEO article data for all 30 content pages.
 *
 * Each entry drives a statically-generated page via
 * `packages/blog/src/app/[slug]/page.tsx`.
 *
 * Schema rules:
 *   - Pillar & supporting articles → Article (+ FAQPage where noted)
 *   - Use-case / utility pages     → WebPage + FAQPage
 *   - Trust / transparency pages   → WebPage
 *   - Getting started              → HowTo + FAQPage
 */

// ── Types ─────────────────────────────────────────────────────────────

export type SchemaType = 'Article' | 'FAQPage' | 'WebPage' | 'HowTo';

export interface ArticleSection {
  h2: string;
  paragraphs: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  cluster: string;
  isPillar: boolean;
  schemaTypes: SchemaType[];
  sections: ArticleSection[];
  faqs?: FAQ[];
  howToSteps?: HowToStep[];
}

// ── Pillar Pages (4) ─────────────────────────────────────────────────

const pillarArticles: ArticleData[] = [
  {
    slug: 'offline-pain-diary',
    title: 'Offline Pain Diary: Track Symptoms Without Cloud Storage',
    description:
      'Track pain symptoms privately with an offline pain diary that never stores your health data in the cloud. Secure, local, and clinician-ready.',
    h1: 'Offline Pain Diary: Private Symptom Tracking Without the Cloud',
    cluster: 'pillar',
    isPillar: true,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'Why offline pain tracking matters',
        paragraphs: [
          'Most pain tracking apps send your health data to remote servers, creating privacy risks that many people with chronic pain simply cannot afford. An offline pain diary keeps every entry on your device, under your control, with no third-party access.',
          'For people navigating insurance claims, workplace injury recovery, or sensitive medical situations, local-only storage eliminates the risk of data breaches, employer access, or unwanted profiling based on health conditions.',
        ],
      },
      {
        h2: 'Benefits of local-only health data',
        paragraphs: [
          'When your pain diary lives entirely on your device, you gain several concrete advantages: no account creation, no password to remember for yet another service, no terms-of-service changes that quietly grant access to your data, and zero dependency on an internet connection.',
          'Local-only data also means faster performance. Entries save instantly to IndexedDB without waiting for network round-trips. You can log symptoms in a waiting room, during a flare, or anywhere signal is unreliable.',
        ],
      },
      {
        h2: 'How offline diaries help clinicians',
        paragraphs: [
          'Clinicians rely on consistent, structured symptom records to make informed decisions. An offline pain diary that exports clean PDF or CSV reports gives your doctor exactly what they need—without requiring them to log into another portal.',
          'PainTracker generates clinical-grade exports formatted for physiotherapists, specialists, and WorkSafeBC claim reviewers. The data you share is the data you choose to share, nothing more.',
        ],
      },
      {
        h2: 'Getting started with PainTracker',
        paragraphs: [
          'PainTracker is a Progressive Web App that installs directly from your browser. There is no app store, no account, and no cloud sync. Open the app, record your first entry, and your data is encrypted on-device immediately.',
          'When you are ready to share with a clinician, export a report in PDF, CSV, or JSON format. The export process is entirely user-initiated—nothing leaves your device until you say so.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does an offline pain diary work without Wi-Fi?',
        answer:
          'Yes. PainTracker is a Progressive Web App that works fully offline once installed. All data is stored locally in your browser using IndexedDB.',
      },
      {
        question: 'Can I share my offline diary with my doctor?',
        answer:
          'Absolutely. PainTracker lets you export your entries as PDF, CSV, or JSON files that you can email, print, or hand to your clinician directly.',
      },
      {
        question: 'Is my data encrypted in an offline pain diary?',
        answer:
          'Yes. PainTracker encrypts all health data at rest using keys derived locally on your device. No one—including the developers—can read your entries.',
      },
    ],
  },
  {
    slug: 'private-pain-tracker',
    title: 'Private Pain Tracker: A Health Diary That Stays on Your Device',
    description:
      'Discover a private pain tracker designed for local-only storage, encryption, and full control of your health data—no cloud required.',
    h1: 'Private Pain Tracking Without Surveillance',
    cluster: 'pillar',
    isPillar: true,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'The risks of cloud health apps',
        paragraphs: [
          'Cloud-based health apps often monetise your data through advertising, research partnerships, or aggregated analytics. Even when companies promise privacy, their terms of service frequently reserve the right to share de-identified data—which can be re-identified with surprising ease.',
          'Data breaches affecting health apps have exposed millions of records. If your pain diary is stored on someone else\'s server, you inherit their security posture and their breach risk.',
        ],
      },
      {
        h2: 'How local encryption protects you',
        paragraphs: [
          'PainTracker encrypts every entry on your device before it touches storage. The encryption keys are derived from a passphrase you choose and never leave the browser. Even if someone accessed your device\'s raw storage, the data would be unreadable without your passphrase.',
          'This approach is called "zero-knowledge" design: the application itself cannot decrypt your data. There is no master key, no recovery backdoor, and no server-side copy.',
        ],
      },
      {
        h2: 'When privacy matters most',
        paragraphs: [
          'Privacy is especially critical when you are documenting symptoms for a workplace injury claim, navigating a custody dispute that involves medical evidence, or managing a stigmatised condition. In these scenarios, who can access your health records is not a hypothetical concern—it has real consequences.',
          'A private pain tracker removes the entire category of risk that comes from third-party data custody. You are the only custodian.',
        ],
      },
      {
        h2: 'Start tracking pain securely',
        paragraphs: [
          'Install PainTracker from your browser, set a passphrase, and begin logging. Your data is encrypted from the very first entry. No sign-up, no email address, no phone number.',
          'When you need to share records, export them on your terms. PainTracker supports PDF for clinicians, CSV for spreadsheet analysis, and JSON for interoperability.',
        ],
      },
    ],
  },
  {
    slug: 'pain-log-for-doctors',
    title: 'Pain Log for Doctors and Insurance: What Actually Works',
    description:
      'Learn how to create a pain log doctors and insurance providers accept, including structure, detail level, and export formats.',
    h1: 'Creating a Pain Log Clinicians Can Use',
    cluster: 'pillar',
    isPillar: true,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'What doctors look for in pain journals',
        paragraphs: [
          'Clinicians need consistency, specificity, and time-stamped entries. A pain log that records intensity on a numeric scale, location on the body, associated symptoms, and functional impact gives your doctor the data they need to adjust treatment.',
          'Vague entries like "felt bad today" are far less useful than "right shoulder pain 7/10 at 9 AM, reduced range of motion, unable to lift arm above head." Structure matters.',
        ],
      },
      {
        h2: 'Structuring symptom entries clearly',
        paragraphs: [
          'Every entry should capture at minimum: date and time, pain intensity (0–10), location, quality (sharp, dull, burning, throbbing), duration, and any triggers or relieving factors. Adding medication and mood context strengthens the clinical picture.',
          'PainTracker provides structured fields for all of these elements, so you don\'t have to remember what to record each time. The app prompts you through each dimension.',
        ],
      },
      {
        h2: 'Exporting logs for appointments or claims',
        paragraphs: [
          'A pain log is only useful if your clinician or claims adjuster can actually read it. PainTracker exports to PDF with clear formatting, date ranges, and summary statistics. CSV exports let specialists import your data into their own tools.',
          'For WorkSafeBC claims, PainTracker includes templates that align with the expected documentation format, reducing the risk of missing fields or incomplete submissions.',
        ],
      },
      {
        h2: 'Using PainTracker for documentation',
        paragraphs: [
          'PainTracker combines structured entry fields, automatic timestamps, and clinical-grade exports into a workflow designed for real clinical use. Every entry is locally encrypted, so your documentation stays private until you choose to share it.',
          'The app also tracks trends over time—average pain levels, worst days, common triggers—giving clinicians a longitudinal view they rarely get from paper diaries.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What format should a pain log for doctors be in?',
        answer:
          'PDF is the most universally accepted format for clinicians. PainTracker generates structured PDF reports with date ranges, intensity charts, and summary statistics.',
      },
      {
        question: 'Can a pain log help with insurance claims?',
        answer:
          'Yes. Consistent, time-stamped symptom records with structured data are exactly what claims reviewers look for. PainTracker includes WorkSafeBC-specific export templates.',
      },
      {
        question: 'How detailed should a pain log be for a doctor?',
        answer:
          'Include intensity (0–10), location, quality, duration, triggers, medications, and functional impact. PainTracker structures every entry to capture these automatically.',
      },
    ],
  },
  {
    slug: 'track-chronic-pain-symptoms',
    title: 'How to Track Chronic Pain Symptoms Effectively',
    description:
      'A practical guide to tracking chronic pain symptoms, flare-ups, and triggers over time to improve communication with clinicians.',
    h1: 'Tracking Chronic Pain in a Meaningful Way',
    cluster: 'pillar',
    isPillar: true,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Why symptom patterns matter',
        paragraphs: [
          'Chronic pain is rarely constant. It fluctuates with activity, weather, stress, sleep, and medication timing. Tracking these patterns over weeks and months reveals correlations that are invisible in a single appointment.',
          'Clinicians who can see your pain patterns over time are better equipped to adjust treatment plans, identify triggers, and measure whether interventions are actually working.',
        ],
      },
      {
        h2: 'Recording flare-ups and triggers',
        paragraphs: [
          'A flare-up entry should capture not just the pain intensity but also what preceded it: physical activity, emotional stress, weather changes, poor sleep, or missed medication. Over time, these contextual details reveal your personal trigger profile.',
          'PainTracker lets you tag entries with custom labels and notes, making it easy to mark flare events and correlate them with environmental or behavioural factors.',
        ],
      },
      {
        h2: 'Long-term insights from pain diaries',
        paragraphs: [
          'After a few weeks of consistent tracking, your data tells a story. You can identify your worst days of the week, the times of day pain peaks, and which medications provide the most relief. PainTracker\'s analytics dashboard surfaces these insights automatically.',
          'Long-term data is also powerful evidence in clinical and legal contexts. A three-month pain diary carries far more weight than a single-visit self-report.',
        ],
      },
      {
        h2: 'Tools that simplify tracking',
        paragraphs: [
          'The best pain tracking tool is the one you actually use. PainTracker is designed for low-friction daily logging: open the app, slide the intensity scale, tap relevant body areas, and save. The entire flow takes under a minute.',
          'Because PainTracker works offline and encrypts everything locally, you can log symptoms anywhere—during a commute, in a waiting room, or right when you wake up—without worrying about connectivity or privacy.',
        ],
      },
    ],
  },
];

// ── Privacy / Offline Cluster (5) ────────────────────────────────────

const privacyCluster: ArticleData[] = [
  {
    slug: 'cloud-vs-local-pain-tracking',
    title: 'Cloud vs Local Pain Tracking: Privacy Comparison',
    description:
      'Compare cloud-based and local-only pain tracking to understand which approach better protects sensitive health data.',
    h1: 'Cloud vs Local Pain Tracking',
    cluster: 'privacy',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'How cloud health apps store data',
        paragraphs: [
          'Cloud-based pain apps upload your entries to remote servers, often managed by third-party infrastructure providers. Your data passes through multiple systems—load balancers, application servers, databases—each adding a potential point of failure or exposure.',
          'Many cloud apps also retain data after you delete your account. "Deletion" often means flagging a record as inactive, not removing it from backups or analytics pipelines.',
        ],
      },
      {
        h2: 'Privacy risks explained',
        paragraphs: [
          'Cloud storage introduces risks that local-only apps simply do not have: server breaches, subpoena exposure, employee access, and cross-border data transfer issues. For health data, these risks carry real consequences—from insurance discrimination to employer scrutiny.',
          'Even with encryption in transit and at rest on the server, the cloud provider typically holds the decryption keys. "Encrypted at rest" on a server you don\'t control is not the same as encrypted on your own device.',
        ],
      },
      {
        h2: 'Advantages of offline tracking',
        paragraphs: [
          'Local-only tracking eliminates every network-related risk. Your data exists in exactly one place: your device. There is no server to breach, no API to exploit, and no third party to trust with your health records.',
          'Offline tracking also means zero latency. Entries save instantly. The app loads instantly. There is no loading spinner waiting for a server response while you are in pain.',
        ],
      },
      {
        h2: 'Choosing the safest option',
        paragraphs: [
          'If your pain data could affect an insurance claim, employment situation, or legal proceeding, local-only tracking is the safer choice. You retain full custody of your records and share them only when you choose to.',
          'PainTracker was built for exactly this use case: clinical-grade documentation with zero cloud dependency.',
        ],
      },
    ],
  },
  {
    slug: 'why-offline-health-apps-matter',
    title: 'Why Offline Health Apps Matter More Than Ever',
    description:
      'Explore why offline-first health apps are increasingly important for privacy, reliability, and patient autonomy in digital health.',
    h1: 'Why Offline Health Apps Matter',
    cluster: 'privacy',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'The growing privacy crisis in digital health',
        paragraphs: [
          'Health app data is now one of the most sought-after categories for data brokers. From period trackers to mental health apps, repeated scandals have shown that "private" health data is routinely shared, sold, or subpoenaed.',
          'Regulatory frameworks like HIPAA in the US or PIPEDA in Canada often do not cover consumer health apps at all, leaving users with few legal protections when their data is mishandled.',
        ],
      },
      {
        h2: 'Reliability when you need it most',
        paragraphs: [
          'Cloud apps fail when you need them most: during outages, in rural areas with poor connectivity, or when a company shuts down its servers. An offline-first app works regardless of network conditions because it was designed to work without a network.',
          'For chronic pain patients who need to log symptoms consistently—not just when they happen to have signal—offline reliability is a functional requirement, not a nice-to-have.',
        ],
      },
      {
        h2: 'Patient autonomy and data ownership',
        paragraphs: [
          'When your health data lives on someone else\'s server, you are a tenant, not an owner. You access your own data through their interface, on their terms, subject to their continued existence as a business.',
          'Offline-first apps invert this relationship. Your data is yours in the most literal sense: it exists on your hardware, in a format you can export and move freely.',
        ],
      },
      {
        h2: 'The future of health technology',
        paragraphs: [
          'The trend toward local-first health tech is accelerating as both patients and regulators recognise the limits of cloud-dependent health apps. Tools that respect data ownership and work without connectivity are not niche—they are the foundation of trustworthy health technology.',
          'PainTracker represents this approach: a fully functional health tool that never requires you to trust a remote server with your most sensitive data.',
        ],
      },
    ],
  },
  {
    slug: 'can-doctors-trust-offline-diaries',
    title: 'Can Doctors Trust Offline Symptom Diaries?',
    description:
      'Understand why clinicians can rely on well-structured offline symptom diaries, and what makes a digital pain log clinically credible.',
    h1: 'Can Doctors Trust Offline Symptom Diaries?',
    cluster: 'privacy',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'What makes a symptom diary clinically credible',
        paragraphs: [
          'Clinicians assess symptom diaries based on consistency, structure, and plausibility—not based on whether the data passed through a cloud server. A well-structured offline diary with timestamps, numeric scales, and contextual notes is exactly as credible as a cloud-based one.',
          'In fact, patient-reported outcome measures (PROMs) are a cornerstone of evidence-based medicine. What matters is the quality and consistency of the data, not the delivery mechanism.',
        ],
      },
      {
        h2: 'Timestamps and data integrity',
        paragraphs: [
          'PainTracker automatically timestamps every entry using your device clock. Entries cannot be back-dated or altered without the audit trail reflecting the change. This gives clinicians confidence that the diary reflects real-time symptom reporting.',
          'Exported reports include date ranges, entry counts, and summary statistics that help clinicians quickly assess whether the diary has been maintained consistently.',
        ],
      },
      {
        h2: 'Structured formats clinicians recognise',
        paragraphs: [
          'PainTracker exports follow clinical documentation conventions: numeric pain scales (0–10), body location mapping, medication logs, and functional impact assessments. These are the same data points clinicians collect during appointments.',
          'PDF exports are formatted for easy reading during a consultation, with charts and summaries that integrate naturally into a clinical workflow.',
        ],
      },
      {
        h2: 'Privacy as a clinical advantage',
        paragraphs: [
          'When patients know their diary is private, they report more honestly. This is a well-documented phenomenon in clinical research: perceived surveillance reduces disclosure accuracy. An offline diary removes the surveillance concern entirely.',
          'Better data quality leads to better clinical decisions. Privacy and clinical utility are not in tension—they reinforce each other.',
        ],
      },
    ],
  },
  {
    slug: 'encrypted-health-data-safety',
    title: 'Is Encrypted Health Data Safer on Your Device?',
    description:
      'Learn why local device encryption often provides stronger protection for health data than server-side encryption in cloud apps.',
    h1: 'Is Encrypted Health Data Safer on Your Device?',
    cluster: 'privacy',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Server encryption vs device encryption',
        paragraphs: [
          'When a cloud app claims "encryption at rest," it typically means the hosting provider encrypts the database. But the app server—and the company operating it—can still read your data in plaintext. The encryption protects against stolen hard drives, not against the company itself.',
          'Device-level encryption with user-held keys is fundamentally different. When PainTracker encrypts your data, only your passphrase can decrypt it. The app developers cannot read your entries, and neither can anyone who accesses your device without the passphrase.',
        ],
      },
      {
        h2: 'Threat models for health data',
        paragraphs: [
          'The relevant threats to health data include: data breaches at cloud providers, legal subpoenas, insider access by company employees, and acquisitions that change data handling policies. Local encryption with user-held keys neutralises all four.',
          'The remaining threats—device theft, malware, and physical coercion—exist regardless of where data is stored. PainTracker mitigates device theft through passphrase-based encryption and session locking.',
        ],
      },
      {
        h2: 'What zero-knowledge design means',
        paragraphs: [
          'Zero-knowledge design means the application operator cannot access user data, by design. There is no master key, no admin panel that shows entries, and no technical mechanism to bypass the user\'s passphrase.',
          'This is not a policy promise—it is an architectural guarantee. Even if compelled by a court order, the developers cannot produce data they do not have.',
        ],
      },
      {
        h2: 'Practical implications for patients',
        paragraphs: [
          'For patients, device encryption means you can track symptoms honestly without worrying about who might eventually access your records. Your pain diary is as private as your own thoughts—unless you decide to share it.',
          'This level of protection is especially important for people documenting symptoms related to workplace injuries, contested disability claims, or conditions that carry social stigma.',
        ],
      },
    ],
  },
  {
    slug: 'zero-cloud-medical-privacy',
    title: 'How Zero-Cloud Apps Protect Medical Privacy',
    description:
      'Discover how zero-cloud health applications protect medical privacy by eliminating server-side data storage entirely.',
    h1: 'How Zero-Cloud Apps Protect Medical Privacy',
    cluster: 'privacy',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'What zero-cloud means in practice',
        paragraphs: [
          'A zero-cloud app never sends your data to a remote server. It does not require an account, does not sync across devices via a company\'s servers, and does not depend on any external service to function. Every byte of your data stays on your device.',
          'This is different from apps that merely "work offline" but still sync to the cloud when connectivity is available. Zero-cloud means no cloud, period.',
        ],
      },
      {
        h2: 'Eliminating the data supply chain',
        paragraphs: [
          'Cloud apps create a data supply chain: your device → their servers → their database → their backups → potentially their partners. Each link in this chain is a potential leak point. Zero-cloud apps eliminate the entire chain.',
          'With no server-side data, there is nothing to breach, nothing to subpoena, and nothing to sell. The attack surface for your health data is reduced to a single device that you physically control.',
        ],
      },
      {
        h2: 'Regulatory alignment',
        paragraphs: [
          'Zero-cloud apps align naturally with data minimisation principles found in GDPR, PIPEDA, and emerging health data regulations. When no personal data is collected server-side, compliance becomes dramatically simpler.',
          'For organisations deploying health tools for employees or patients, zero-cloud architecture can eliminate entire categories of regulatory risk.',
        ],
      },
      {
        h2: 'PainTracker\'s zero-cloud approach',
        paragraphs: [
          'PainTracker was built from the ground up as a zero-cloud application. There is no backend server, no user database, and no analytics pipeline. The only network requests are for the initial app download and optional weather data for correlation features.',
          'Your health data never leaves your device unless you explicitly export it—and exports go to files on your device, not to a remote service.',
        ],
      },
    ],
  },
];

// ── Clinical Documentation Cluster (5) ───────────────────────────────

const clinicalCluster: ArticleData[] = [
  {
    slug: 'pain-diary-template',
    title: 'Pain Diary Template for Medical Appointments',
    description:
      'Use this simple pain diary template to prepare for medical appointments and clearly communicate symptoms to clinicians.',
    h1: 'Pain Diary Template for Doctor Visits',
    cluster: 'clinical',
    isPillar: false,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'What information to record',
        paragraphs: [
          'An effective pain diary template captures six core elements: date and time, pain intensity (0–10 scale), body location, pain quality (sharp, dull, burning, aching), duration, and functional impact (what you could or couldn\'t do).',
          'Additional fields that strengthen your records include medications taken, sleep quality the previous night, physical activity, weather conditions, and emotional state. PainTracker includes fields for all of these.',
        ],
      },
      {
        h2: 'Daily vs episodic symptom tracking',
        paragraphs: [
          'Daily tracking provides the most complete picture but can feel burdensome during severe episodes. Episodic tracking—logging only during flares or notable changes—is less comprehensive but more sustainable for many patients.',
          'The best approach is often a hybrid: a brief daily check-in (intensity, location, medications) supplemented by detailed entries during significant flares or changes.',
        ],
      },
      {
        h2: 'Sharing logs with clinicians',
        paragraphs: [
          'Before your appointment, export your diary as a PDF covering the period since your last visit. A structured report with charts and summaries is far more useful to your doctor than a stack of handwritten notes.',
          'PainTracker\'s export includes trend visualisations and summary statistics that help clinicians identify patterns at a glance, making better use of limited appointment time.',
        ],
      },
      {
        h2: 'Exporting from PainTracker',
        paragraphs: [
          'PainTracker generates professional PDF reports, machine-readable CSV files, and structured JSON exports. Choose the format that matches your clinician\'s workflow—PDF for most appointments, CSV for specialists who want to run their own analysis.',
          'All exports are generated locally on your device. Your data is never sent through a server to produce a report.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the best pain diary template?',
        answer:
          'The best template captures intensity (0–10), location, quality, duration, triggers, medications, and functional impact in a structured format. PainTracker provides all of these fields built in.',
      },
      {
        question: 'How often should I fill in my pain diary?',
        answer:
          'Daily entries provide the best clinical picture. Even a brief daily check-in (1–2 minutes) is more valuable than detailed but sporadic logging.',
      },
      {
        question: 'Can I print my pain diary for my doctor?',
        answer:
          'Yes. PainTracker exports pain diaries as formatted PDF reports that you can print or email directly to your clinician.',
      },
    ],
  },
  {
    slug: 'what-doctors-look-for-symptom-journals',
    title: 'What Doctors Look for in Symptom Journals',
    description:
      'Understand exactly what clinicians want to see in a patient symptom journal to make the most of your medical appointments.',
    h1: 'What Doctors Look for in Symptom Journals',
    cluster: 'clinical',
    isPillar: false,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'Consistency over perfection',
        paragraphs: [
          'Doctors value consistent daily entries far more than perfectly detailed but sporadic records. A simple intensity score logged every day tells a clearer story than paragraphs written only on bad days.',
          'The goal is to show trends over time, not to produce a literary account of each day. Consistency is what transforms a diary from anecdotal evidence into actionable clinical data.',
        ],
      },
      {
        h2: 'Numeric scales and structured data',
        paragraphs: [
          'Clinicians are trained to interpret numeric pain scales (NRS 0–10) and validated assessment tools. Entries that use structured scales are immediately useful; free-text descriptions require interpretation that may not align with clinical frameworks.',
          'PainTracker uses the standard 0–10 numeric rating scale by default, ensuring your entries speak the same language your clinician uses.',
        ],
      },
      {
        h2: 'Functional impact documentation',
        paragraphs: [
          'Beyond pain intensity, doctors want to know what you could and couldn\'t do. "Pain 7/10, unable to prepare meals or walk more than 5 minutes" is far more clinically useful than "bad pain day."',
          'Functional impact is especially important for insurance claims and disability assessments, where the question is not just "how much does it hurt" but "what can you actually do."',
        ],
      },
      {
        h2: 'Medication and treatment response',
        paragraphs: [
          'Every entry should note medications taken and their effect on symptoms. Did the pain decrease after medication? How long did relief last? This data helps clinicians evaluate treatment efficacy and adjust dosing or timing.',
          'PainTracker tracks medication alongside pain entries, making it easy to correlate treatment with outcomes over time.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should I write in a symptom journal?',
        answer:
          'Record date/time, pain intensity (0–10), location, quality (sharp/dull/burning), what you could or couldn\'t do, medications taken, and any triggers you noticed.',
      },
      {
        question: 'Do doctors actually read patient diaries?',
        answer:
          'Yes—when the diary is structured and concise. Doctors value brief, consistent records with numeric scales over long narrative entries.',
      },
    ],
  },
  {
    slug: 'export-pain-logs-pdf',
    title: 'Export Pain Logs to PDF for Clinics',
    description:
      'Learn how to export structured pain logs as professional PDF reports for clinics, specialists, and claims reviewers.',
    h1: 'Export Pain Logs to PDF for Clinics',
    cluster: 'clinical',
    isPillar: false,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'Why PDF is the clinical standard',
        paragraphs: [
          'PDF documents are universally readable, printable, and tamper-evident. Every clinic, hospital, and insurance office can open a PDF. It is the de facto format for sharing medical documentation between patients and providers.',
          'Unlike screenshots or plain text, a PDF export preserves formatting, charts, and structure in a professional document that reflects well on your record-keeping.',
        ],
      },
      {
        h2: 'What a clinical pain report includes',
        paragraphs: [
          'PainTracker\'s PDF exports include a date-range summary, daily intensity chart, average pain by time of day, most frequent symptoms, medication log, and any free-text notes. The report is structured to match what clinicians expect from patient-reported outcome documentation.',
          'Summary statistics at the top of the report give clinicians a quick overview, while detailed entry-by-entry data follows for deeper review.',
        ],
      },
      {
        h2: 'Generating your report',
        paragraphs: [
          'In PainTracker, navigate to the export section, select your date range, choose PDF format, and tap export. The report is generated entirely on your device—no data is sent to a server. The PDF file saves to your downloads folder.',
          'You can generate multiple reports for different date ranges or different providers. Each export is independent and self-contained.',
        ],
      },
      {
        h2: 'Sharing with your care team',
        paragraphs: [
          'Email the PDF to your clinician before your appointment, print it and bring it along, or share it via a secure file-sharing method your clinic provides. The choice is yours—PainTracker never sends reports automatically.',
          'For WorkSafeBC claims, use the dedicated WCB export template that includes fields specific to workplace injury documentation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I export my pain log as a PDF?',
        answer:
          'Yes. PainTracker generates professional PDF reports with charts, summaries, and detailed entries. The export is generated locally on your device.',
      },
      {
        question: 'Is the PDF export free?',
        answer:
          'Yes. All PainTracker features, including PDF export, are completely free. There are no premium tiers or paid features.',
      },
    ],
  },
  {
    slug: 'pain-tracking-insurance-evidence',
    title: 'Using Pain Tracking for Insurance Evidence',
    description:
      'Learn how structured pain tracking creates credible evidence for insurance claims, disability applications, and workplace injury documentation.',
    h1: 'Using Pain Tracking for Insurance Evidence',
    cluster: 'clinical',
    isPillar: false,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'What claims reviewers look for',
        paragraphs: [
          'Insurance claims reviewers evaluate credibility based on consistency, specificity, and corroboration with medical records. A structured pain diary with daily entries, numeric scales, and functional impact documentation provides exactly this kind of evidence.',
          'Sporadic entries, exaggerated descriptions, or records that only appear right before a review raise red flags. Consistent, moderate, and honest documentation is far more persuasive.',
        ],
      },
      {
        h2: 'Building a credible record',
        paragraphs: [
          'Start tracking as soon as possible after the onset of symptoms or injury. Consistency is more important than detail—a brief daily entry is more credible than a retrospective summary written weeks later.',
          'Include both good days and bad days. A diary that shows variation is more believable than one that reports constant maximum pain. Real pain fluctuates, and your records should reflect that.',
        ],
      },
      {
        h2: 'WorkSafeBC and workplace injury claims',
        paragraphs: [
          'PainTracker includes export templates specifically formatted for WorkSafeBC claims. These templates align with the documentation requirements for workplace injury reporting, including structured fields for mechanism of injury, functional limitations, and treatment timeline.',
          'Using a purpose-built tool demonstrates that you are taking your documentation seriously, which carries weight with claims adjudicators.',
        ],
      },
      {
        h2: 'Protecting your privacy during claims',
        paragraphs: [
          'When submitting evidence for a claim, you control exactly which entries and date ranges to include. PainTracker\'s export feature lets you select specific time periods rather than handing over your entire diary.',
          'Because your data is stored locally and encrypted, there is no risk of a claims reviewer or insurer accessing more data than you intentionally share.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can a pain diary be used as evidence for insurance?',
        answer:
          'Yes. Consistent, structured pain diaries are accepted as supporting evidence by insurance companies, WorkSafeBC, and disability assessors when they corroborate medical records.',
      },
      {
        question: 'How long should I track pain for a claim?',
        answer:
          'Start tracking immediately after onset and continue throughout the claims process. At least 30 days of consistent entries strengthens your documentation significantly.',
      },
    ],
  },
  {
    slug: 'how-detailed-pain-diary',
    title: 'How Detailed Should a Pain Diary Be?',
    description:
      'Find the right balance of detail in your pain diary—enough for clinicians and claims reviewers, without creating unsustainable tracking burden.',
    h1: 'How Detailed Should a Pain Diary Be?',
    cluster: 'clinical',
    isPillar: false,
    schemaTypes: ['Article', 'FAQPage'],
    sections: [
      {
        h2: 'The minimum effective detail level',
        paragraphs: [
          'At minimum, every entry needs: date, time, intensity (0–10), and body location. These four data points let clinicians identify trends and compare across visits. You can log this in under 30 seconds.',
          'If you only have energy for the minimum, that is still valuable. A sparse but consistent diary is infinitely more useful than a detailed one you stop maintaining after a week.',
        ],
      },
      {
        h2: 'Adding clinical value with context',
        paragraphs: [
          'Beyond the minimum, the most clinically valuable additions are: pain quality (sharp, dull, burning), functional impact, medications taken and their effect, and triggers or activities that preceded the pain.',
          'These contextual fields turn a pain score into a clinical narrative. They help your doctor understand not just how much it hurts, but why and how it affects your life.',
        ],
      },
      {
        h2: 'Avoiding tracking burnout',
        paragraphs: [
          'Tracking fatigue is a real risk, especially for people in chronic pain who already have limited energy. The goal is sustainability, not exhaustiveness. A one-minute daily entry maintained for months is worth more than a ten-minute entry abandoned after a week.',
          'PainTracker is designed for low-friction logging. The interface prioritises quick structured inputs (sliders, toggles, taps) over typing, reducing the effort required for each entry.',
        ],
      },
      {
        h2: 'Adjusting detail over time',
        paragraphs: [
          'You can increase detail during periods of clinical interest—before a specialist appointment, during a medication change, or while building evidence for a claim—and reduce it during stable periods.',
          'PainTracker supports this approach naturally. Required fields capture the minimum, while optional fields are available when you want to add more context.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long should a pain diary entry be?',
        answer:
          'A useful entry takes 30–60 seconds: intensity, location, and any notable triggers or medications. You can add more detail when it matters clinically.',
      },
      {
        question: 'Is it OK to skip days in a pain diary?',
        answer:
          'It is better to log briefly every day than to skip days and fill in details later. Consistent short entries are more credible and useful than sporadic detailed ones.',
      },
    ],
  },
];

// ── Chronic Condition Cluster (4) ────────────────────────────────────

const chronicCluster: ArticleData[] = [
  {
    slug: 'pain-tracking-fibromyalgia',
    title: 'Pain Tracking for Fibromyalgia Patients',
    description:
      'Learn how structured pain tracking can help fibromyalgia patients identify patterns, triggers, and treatment responses.',
    h1: 'Pain Tracking for Fibromyalgia',
    cluster: 'chronic',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Common symptom patterns',
        paragraphs: [
          'Fibromyalgia presents with widespread pain that fluctuates unpredictably. Common patterns include morning stiffness, fatigue that worsens through the day, and pain that migrates between body regions. Tracking these patterns helps you and your rheumatologist distinguish fibromyalgia-specific symptoms from overlapping conditions.',
          'Many patients find that their pain correlates with sleep quality, weather changes, or stress levels—correlations that only become visible with consistent tracking over weeks.',
        ],
      },
      {
        h2: 'Recording flare cycles',
        paragraphs: [
          'Fibromyalgia flares can last hours to weeks. Recording the onset, peak, and resolution of each flare—along with potential triggers—creates a flare profile that helps predict and manage future episodes.',
          'PainTracker\'s timeline view lets you see flare cycles visually, making it easier to identify patterns and communicate them to your care team.',
        ],
      },
      {
        h2: 'Communicating with specialists',
        paragraphs: [
          'Rheumatologists and pain specialists make better decisions when they can see longitudinal data. A three-month pain diary showing intensity patterns, medication responses, and functional impact gives your specialist a clinical picture they cannot get from a single appointment.',
          'PainTracker\'s PDF exports include trend charts and summary statistics that integrate naturally into a specialist consultation.',
        ],
      },
      {
        h2: 'Helpful tracking tools',
        paragraphs: [
          'The ideal tracking tool for fibromyalgia is low-effort (because fatigue is a core symptom), consistent, and capable of capturing multiple symptom dimensions. PainTracker\'s quick-entry interface is designed for exactly this: structured logging in under a minute, even on your worst days.',
          'Because PainTracker works offline and encrypts locally, you can track symptoms at any time without worrying about connectivity or privacy.',
        ],
      },
    ],
  },
  {
    slug: 'migraine-symptom-diary',
    title: 'Migraine Symptom Diary Guide',
    description:
      'A comprehensive guide to maintaining a migraine symptom diary for tracking attacks, identifying triggers, and improving treatment outcomes.',
    h1: 'Migraine Symptom Diary Guide',
    cluster: 'chronic',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Tracking migraine attacks effectively',
        paragraphs: [
          'A migraine diary should capture more than just headache intensity. Record aura symptoms, prodrome signs (mood changes, food cravings, neck stiffness), attack duration, associated symptoms (nausea, light sensitivity, visual disturbances), and what finally resolved the episode.',
          'This level of detail helps your neurologist distinguish migraine subtypes, evaluate medication efficacy, and identify patterns in attack frequency.',
        ],
      },
      {
        h2: 'Identifying triggers over time',
        paragraphs: [
          'Migraine triggers are highly individual and often cumulative—a single trigger may not cause an attack, but three together might. Common triggers include sleep changes, hormonal shifts, weather, dietary factors, and stress. Tracking these alongside attacks reveals your personal trigger profile.',
          'PainTracker\'s tagging system lets you log potential triggers with each entry and view correlations in the analytics dashboard.',
        ],
      },
      {
        h2: 'Medication response logging',
        paragraphs: [
          'For each attack, record which medication you took, when you took it relative to onset, and how effective it was. This data is crucial for your neurologist when evaluating whether to continue, adjust, or change your treatment plan.',
          'Track both acute medications (triptans, NSAIDs) and preventive treatments. Note if you are approaching medication overuse thresholds, which can contribute to rebound headaches.',
        ],
      },
      {
        h2: 'Sharing with your neurologist',
        paragraphs: [
          'Export your migraine diary before each neurology appointment. A structured report showing attack frequency, intensity trends, medication usage, and identified triggers gives your neurologist the data they need to optimise your care.',
          'PainTracker\'s clinical-grade PDF exports present this data in a format neurologists can review quickly during your appointment.',
        ],
      },
    ],
  },
  {
    slug: 'tracking-flare-ups-chronic-illness',
    title: 'Tracking Flare-Ups in Chronic Illness',
    description:
      'Learn how to document and track flare-ups in chronic illness to identify patterns, improve treatment, and support clinical conversations.',
    h1: 'Tracking Flare-Ups in Chronic Illness',
    cluster: 'chronic',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'What defines a flare-up',
        paragraphs: [
          'A flare-up is a temporary worsening of symptoms beyond your baseline. For tracking purposes, define what "flare" means for your condition: Is it a pain increase of 3+ points? Inability to perform daily activities? A combination of symptoms that signals escalation?',
          'Having a personal definition helps you track flares consistently and communicate clearly with clinicians about the frequency and severity of your episodes.',
        ],
      },
      {
        h2: 'Documenting the full flare cycle',
        paragraphs: [
          'Record the onset (when symptoms began worsening), the peak (worst point), interventions taken, and resolution (when you returned to baseline). This full-cycle documentation reveals patterns in flare duration and response to treatment.',
          'PainTracker\'s continuous tracking makes it easy to capture the full arc of a flare, not just the worst moment.',
        ],
      },
      {
        h2: 'Pattern recognition over time',
        paragraphs: [
          'After tracking several flare cycles, patterns often emerge: flares may cluster around certain activities, times of month, stress events, or weather changes. These patterns are invisible without consistent data collection.',
          'PainTracker\'s analytics surface these correlations automatically, helping you and your care team develop evidence-based flare prevention strategies.',
        ],
      },
      {
        h2: 'Using flare data in clinical conversations',
        paragraphs: [
          'Quantified flare data transforms clinical conversations. Instead of "I\'ve been flaring a lot," you can say "I\'ve had four flares in the past month, averaging 6 days each, with a mean peak intensity of 8/10." This precision leads to better clinical decisions.',
          'Export your flare history before appointments to give your care team the data they need to evaluate treatment effectiveness.',
        ],
      },
    ],
  },
  {
    slug: 'identifying-pain-triggers',
    title: 'Identifying Pain Triggers Over Time',
    description:
      'Discover how systematic pain tracking reveals hidden triggers, helping you and your care team develop effective management strategies.',
    h1: 'Identifying Pain Triggers Over Time',
    cluster: 'chronic',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Why triggers are hard to identify',
        paragraphs: [
          'Pain triggers are often delayed, cumulative, and context-dependent. A meal might trigger a migraine 12 hours later. Poor sleep two nights in a row might cause a fibromyalgia flare, but one bad night might not. Without tracking, these connections remain invisible.',
          'Memory is unreliable for this kind of pattern recognition. We tend to remember dramatic events and forget subtle contributing factors. Systematic tracking compensates for these cognitive biases.',
        ],
      },
      {
        h2: 'What to track alongside pain',
        paragraphs: [
          'Beyond pain itself, log: sleep quality and duration, physical activity, weather conditions, stress levels, diet, medication timing, and menstrual cycle phase (if relevant). These contextual factors are the candidate triggers your data will eventually reveal.',
          'PainTracker supports custom tags and notes for logging contextual factors alongside each pain entry.',
        ],
      },
      {
        h2: 'Correlation analysis basics',
        paragraphs: [
          'After 30 or more entries, start looking for correlations. Does pain tend to increase the day after poor sleep? After certain foods? During weather changes? PainTracker\'s analytics dashboard can surface these correlations automatically.',
          'Remember that correlation is not causation. A pattern in your data is a hypothesis worth testing with your clinician, not a confirmed diagnosis.',
        ],
      },
      {
        h2: 'Acting on trigger data',
        paragraphs: [
          'Once you identify a potential trigger, discuss it with your care team. They can help you design a management strategy: avoiding the trigger when possible, pre-treating when avoidance is not an option, or adjusting your treatment plan to account for predictable flares.',
          'Trigger identification is one of the highest-value outcomes of consistent pain tracking. It transforms reactive symptom management into proactive prevention.',
        ],
      },
    ],
  },
];

// ── Comparison Cluster (2) ───────────────────────────────────────────

const comparisonCluster: ArticleData[] = [
  {
    slug: 'paper-vs-app-pain-diary',
    title: 'Paper vs App Pain Diaries: Pros and Cons',
    description:
      'Compare paper and digital pain diaries to determine which method provides clearer insights and better clinical usefulness.',
    h1: 'Paper vs App Pain Tracking',
    cluster: 'comparison',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Benefits of handwritten logs',
        paragraphs: [
          'Paper diaries are accessible without technology, have zero learning curve, and can be customised freely. For some patients, the physical act of writing helps with processing and mindfulness around pain experiences.',
          'Paper also avoids any concern about digital privacy—there is no app to worry about, no data to encrypt, and no terms of service to accept.',
        ],
      },
      {
        h2: 'Advantages of digital tracking',
        paragraphs: [
          'Digital pain trackers offer structured data entry (eliminating inconsistency), automatic timestamps, trend analysis, and professional export formats. They also make it easy to review months of data at a glance, which is impractical with paper.',
          'Perhaps most importantly, digital trackers like PainTracker can generate clinical-grade reports that clinicians can review efficiently during appointments.',
        ],
      },
      {
        h2: 'Privacy considerations',
        paragraphs: [
          'Paper diaries are private by default—but they can be lost, damaged, or read by anyone who finds them. Digital diaries on cloud platforms carry server-side privacy risks. Offline-first apps like PainTracker combine the privacy of paper with the analytical power of digital.',
          'The ideal solution depends on your threat model: who might access your records, and what are the consequences?',
        ],
      },
      {
        h2: 'Choosing the right method',
        paragraphs: [
          'If you need to share structured data with clinicians or insurance, digital tracking with clinical exports is significantly more useful. If you value simplicity above all else and will not need to share electronically, paper works.',
          'Many patients find a hybrid approach effective: a digital tracker for daily logging and clinical exports, supplemented by a paper journal for reflective or emotional processing.',
        ],
      },
    ],
  },
  {
    slug: 'best-pain-tracking-apps',
    title: 'Best Pain Tracking Apps: What to Look For',
    description:
      'A guide to evaluating pain tracking apps based on privacy, clinical usefulness, accessibility, and long-term data ownership.',
    h1: 'What to Look for in a Pain Tracking App',
    cluster: 'comparison',
    isPillar: false,
    schemaTypes: ['Article'],
    sections: [
      {
        h2: 'Privacy and data ownership',
        paragraphs: [
          'The most important question to ask about any health app is: where does my data go? Apps that require cloud accounts store your health data on their servers. Look for apps that offer local-only storage with user-controlled encryption.',
          'Check the privacy policy for language about data sharing, analytics, and third-party access. If the policy is vague or reserves broad rights, your data is likely being monetised.',
        ],
      },
      {
        h2: 'Clinical export quality',
        paragraphs: [
          'A pain tracker is only as useful as the reports it produces. Look for apps that export structured PDF reports with numeric pain scales, trend charts, and summary statistics—not just raw data dumps or screenshots.',
          'Bonus points for apps that offer condition-specific or payer-specific templates, such as WorkSafeBC claim formats.',
        ],
      },
      {
        h2: 'Accessibility and ease of use',
        paragraphs: [
          'People in pain have limited energy for complex interfaces. The best pain tracking apps offer quick-entry modes, accessible design (keyboard navigation, screen reader support, sufficient contrast), and low-friction daily logging.',
          'Look for WCAG 2.2 AA compliance as a baseline indicator that the app takes accessibility seriously.',
        ],
      },
      {
        h2: 'Long-term reliability',
        paragraphs: [
          'Cloud-dependent apps disappear when the company shuts down. Your three years of pain data vanishes with them. Offline-first, open-source apps ensure your data remains accessible regardless of the developer\'s business trajectory.',
          'PainTracker is open source, local-first, and designed for long-term data ownership. Your records belong to you.',
        ],
      },
    ],
  },
];

// ── Transparency / Trust Pages (5) ───────────────────────────────────

const transparencyPages: ArticleData[] = [
  {
    slug: 'security-architecture',
    title: 'Security Architecture of PainTracker',
    description:
      'Explore how PainTracker protects sensitive health data using local storage, encryption, and offline-first design.',
    h1: 'Security Architecture Overview',
    cluster: 'transparency',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Local-only data model',
        paragraphs: [
          'PainTracker stores all data in your browser\'s IndexedDB, a local database that never communicates with external servers. There is no backend database, no user accounts, and no server-side data processing.',
          'This architecture means there is no central target for attackers. A breach of PainTracker\'s servers is impossible because there are no servers storing user data.',
        ],
      },
      {
        h2: 'Encryption approach',
        paragraphs: [
          'All health data is encrypted at rest using the Web Crypto API with keys derived from your passphrase. The encryption uses industry-standard algorithms and runs entirely in the browser. Keys never leave your device.',
          'The design is zero-knowledge: neither the application code nor the developers can access your encrypted data without your passphrase.',
        ],
      },
      {
        h2: 'Threat considerations',
        paragraphs: [
          'PainTracker actively defends against lost or stolen devices (at-rest encryption), XSS attacks (Content Security Policy), malicious browser extensions (minimised plaintext exposure), and shoulder-surfing (panic mode, session locking).',
          'PainTracker does not claim to protect against compromised operating systems, root-level malware, or physical coercion beyond in-app safety controls. Honest threat modelling means being clear about limitations.',
        ],
      },
      {
        h2: 'Responsible disclosure',
        paragraphs: [
          'If you discover a security vulnerability in PainTracker, we welcome responsible disclosure. Report issues through our GitHub security advisory process. We take every report seriously and will work with you to resolve vulnerabilities promptly.',
          'Security-critical code changes always require human review before merging. This includes any changes to encryption, key handling, storage, or export functionality.',
        ],
      },
    ],
  },
  {
    slug: 'local-only-encryption-explained',
    title: 'Local-Only Encryption Explained',
    description:
      'A plain-language explanation of how PainTracker encrypts health data locally, what it protects against, and what it does not.',
    h1: 'How Local-Only Encryption Works',
    cluster: 'transparency',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'What encryption means for your data',
        paragraphs: [
          'Encryption transforms your pain entries into unreadable ciphertext that can only be decoded with your passphrase. Without the passphrase, the data is meaningless—even if someone accesses your device\'s storage directly.',
          'PainTracker uses the Web Crypto API, a browser-native encryption toolkit, to perform all cryptographic operations. No external libraries or services are involved.',
        ],
      },
      {
        h2: 'Key derivation from your passphrase',
        paragraphs: [
          'When you set a passphrase, PainTracker derives an encryption key using a standard key derivation function. This process is intentionally slow (computationally expensive) to resist brute-force guessing attacks.',
          'The derived key is used to encrypt and decrypt your data. It exists only in memory during your active session and is discarded when you lock the app or close the browser.',
        ],
      },
      {
        h2: 'What encryption protects against',
        paragraphs: [
          'Local encryption protects your data if your device is lost or stolen, if someone borrows your computer, or if your browser\'s storage files are accessed directly. It also protects against browser extensions that attempt to read IndexedDB contents.',
          'Encryption does not protect against someone who knows your passphrase, malware with keylogging capability, or screen capture tools. These threats require operating-system-level protections beyond any web application\'s control.',
        ],
      },
      {
        h2: 'No recovery backdoor',
        paragraphs: [
          'There is no "forgot password" option because there is no server to reset against. If you lose your passphrase, your data cannot be recovered. This is a deliberate security decision: a recovery mechanism would be a vulnerability.',
          'We recommend choosing a strong passphrase you will remember, or storing it in a trusted password manager.',
        ],
      },
    ],
  },
  {
    slug: 'health-data-threat-model',
    title: 'Health Data Threat Model',
    description:
      'Understand the specific threats PainTracker defends against, and the threats that are outside the scope of any web application.',
    h1: 'Health Data Threat Model',
    cluster: 'transparency',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Threats we actively defend against',
        paragraphs: [
          'PainTracker is designed to protect your data against: lost or stolen devices (at-rest encryption with user-held keys), cross-site scripting (Content Security Policy and safe coding practices), malicious browser extensions (minimal plaintext exposure during sessions), and shoulder-surfing or coercive access (panic mode and session locking).',
          'Each of these defences has been tested and reviewed as part of our security architecture. They represent concrete, measurable protections.',
        ],
      },
      {
        h2: 'Threats outside our scope',
        paragraphs: [
          'No web application can protect against a compromised operating system, root-level malware, hardware keyloggers, or physical coercion beyond in-app safety features. These threats require device-level and physical-security measures that are outside any browser-based application\'s control.',
          'We believe honest threat modelling is more valuable than marketing claims of total security. You deserve to know exactly what PainTracker protects and what it does not.',
        ],
      },
      {
        h2: 'Risk reduction, not risk elimination',
        paragraphs: [
          'Security is about reducing risk to acceptable levels, not eliminating it entirely. PainTracker\'s architecture eliminates the most common and impactful threat vectors for health data: server-side breaches, third-party data access, and network-level interception.',
          'The remaining risks are those that affect all applications on your device and are best addressed through device hygiene: strong device passwords, up-to-date operating systems, and careful app installation practices.',
        ],
      },
      {
        h2: 'Continuous improvement',
        paragraphs: [
          'Our threat model is not static. As new attack techniques emerge, we evaluate whether they apply to PainTracker\'s architecture and update our defences accordingly.',
          'All security-related code changes undergo mandatory human review. We run automated security scans as part of our build pipeline and publish our security architecture documentation openly.',
        ],
      },
    ],
  },
  {
    slug: 'accessibility-in-pain-tracking',
    title: 'Accessibility in Pain Tracking',
    description:
      'Learn how PainTracker prioritises accessibility for users with disabilities, chronic fatigue, and limited mobility through WCAG 2.2 AA design.',
    h1: 'Accessibility in Pain Tracking',
    cluster: 'transparency',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Why accessibility matters for pain apps',
        paragraphs: [
          'People who track chronic pain often have conditions that affect mobility, vision, cognition, or energy levels. A pain tracking app that is not accessible excludes the very people it is supposed to help.',
          'Accessibility is not an add-on feature—it is a fundamental design constraint that shapes every interaction in PainTracker.',
        ],
      },
      {
        h2: 'WCAG 2.2 AA compliance',
        paragraphs: [
          'PainTracker targets WCAG 2.2 AA compliance across all components. This means sufficient colour contrast, keyboard-navigable interfaces, screen reader compatibility, visible focus indicators, and touch targets sized for users with limited dexterity.',
          'We test with real assistive technologies, not just automated scanners. Automated tools catch about 30% of accessibility issues; the rest require manual testing with actual screen readers and keyboard-only navigation.',
        ],
      },
      {
        h2: 'Trauma-informed design',
        paragraphs: [
          'PainTracker uses trauma-informed design principles: non-judgemental language, user-controlled pacing, no surprise modals or alerts, and a "panic mode" that instantly hides the application. These features recognise that many pain patients exist in contexts where psychological safety matters.',
          'Gentle language, clear error messages, and the absence of gamification or guilt-based reminders are deliberate design choices, not oversights.',
        ],
      },
      {
        h2: 'Low-energy interaction design',
        paragraphs: [
          'Every interaction in PainTracker is designed for minimum effort. Structured inputs (sliders, toggles, tap targets) replace typing wherever possible. A complete daily entry can be logged in under 60 seconds.',
          'For users with severe fatigue or limited mobility, even this can be too much on bad days—and that is OK. PainTracker does not penalise missed entries or send guilt-inducing reminders.',
        ],
      },
    ],
  },
  {
    slug: 'why-paintracker-is-open-source',
    title: 'Why PainTracker Is Open Source',
    description:
      'Understand why PainTracker is open source and how transparency in health technology builds trust, accountability, and community.',
    h1: 'Why PainTracker Is Open Source',
    cluster: 'transparency',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Trust through transparency',
        paragraphs: [
          'When a health app claims to be private, you should be able to verify that claim. Open source means anyone can read PainTracker\'s code, audit the encryption implementation, and confirm that no data is being sent to external servers.',
          'This is fundamentally different from closed-source apps that ask you to trust a privacy policy. With open source, the code is the policy.',
        ],
      },
      {
        h2: 'Community accountability',
        paragraphs: [
          'Open source creates accountability that private companies often lack. Security researchers can report vulnerabilities, developers can contribute improvements, and users can fork the project if they disagree with any direction.',
          'PainTracker\'s development history is public on GitHub. Every change, every decision, and every discussion is visible and auditable.',
        ],
      },
      {
        h2: 'Long-term data safety',
        paragraphs: [
          'Closed-source health apps disappear when companies fail. Your data may become inaccessible when the app stops being maintained. Open-source apps can be maintained by the community indefinitely, and the code for reading your data format remains available forever.',
          'This is especially important for health data that may need to be accessed years or decades after it was recorded.',
        ],
      },
      {
        h2: 'Contributing to PainTracker',
        paragraphs: [
          'PainTracker welcomes contributions from developers, designers, accessibility experts, and clinicians. Whether you want to fix a bug, improve the UI, add a feature, or review the security architecture, the codebase is open on GitHub.',
          'We follow a contribution model that prioritises security review for any changes touching encryption, storage, or export functionality.',
        ],
      },
    ],
  },
];

// ── Real-World Utility Pages (5) ─────────────────────────────────────

const utilityPages: ArticleData[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started With PainTracker',
    description:
      'Step-by-step guide to installing PainTracker, recording symptoms, and exporting logs for clinicians or claims.',
    h1: 'How to Start Tracking Pain Privately',
    cluster: 'utility',
    isPillar: false,
    schemaTypes: ['HowTo', 'FAQPage'],
    sections: [
      {
        h2: 'Install the app',
        paragraphs: [
          'Open PainTracker in your browser at paintracker.ca/app. On mobile, tap "Add to Home Screen" when prompted (or use your browser\'s install option). On desktop, click the install icon in the address bar. PainTracker is a Progressive Web App—no app store needed.',
          'Once installed, PainTracker works fully offline. You can close your browser, disconnect from the internet, and the app will still function perfectly.',
        ],
      },
      {
        h2: 'Record your first entry',
        paragraphs: [
          'Tap "New Entry" and fill in the structured fields: pain intensity (slide to your current level), body location (tap on the body map), pain quality, and any notes or tags. The entire process takes under a minute.',
          'Set a passphrase when prompted to encrypt your data. Choose something memorable—there is no recovery option if you forget it.',
        ],
      },
      {
        h2: 'Export a pain report',
        paragraphs: [
          'Navigate to the export section, select your date range, choose your format (PDF for clinicians, CSV for data analysis, JSON for interoperability), and tap export. The report is generated on your device and saved to your downloads.',
          'For WorkSafeBC claims, select the WCB template option to generate a report formatted for workplace injury documentation.',
        ],
      },
      {
        h2: 'Share with clinicians',
        paragraphs: [
          'Email the exported PDF to your clinician before your appointment, print it and bring it along, or share via your clinic\'s secure messaging system. You control what you share and when.',
          'PainTracker never sends reports automatically. Every export is initiated by you, and the file goes directly to your device.',
        ],
      },
    ],
    howToSteps: [
      {
        name: 'Install PainTracker',
        text: 'Open paintracker.ca/app in your browser and install as a Progressive Web App using your browser\'s "Add to Home Screen" or install button.',
      },
      {
        name: 'Set your passphrase',
        text: 'Create a memorable passphrase to encrypt your data. This passphrase protects all your entries—there is no recovery option, so choose carefully.',
      },
      {
        name: 'Record your first entry',
        text: 'Tap "New Entry", set your pain intensity, select the body location, choose pain quality, and add any relevant notes or tags. Save the entry.',
      },
      {
        name: 'Track consistently',
        text: 'Log at least one entry per day. Even a quick 30-second check-in (intensity + location) builds valuable longitudinal data over time.',
      },
      {
        name: 'Export for your clinician',
        text: 'Before appointments, export a PDF report covering the period since your last visit. Email it to your doctor or print it to bring along.',
      },
    ],
    faqs: [
      {
        question: 'Is PainTracker free?',
        answer:
          'Yes. PainTracker is completely free and open source. There are no premium tiers, no ads, and no in-app purchases.',
      },
      {
        question: 'Do I need to create an account?',
        answer:
          'No. PainTracker requires no account, no email address, and no personal information. Just open the app and start tracking.',
      },
      {
        question: 'What if I lose my passphrase?',
        answer:
          'Unfortunately, your data cannot be recovered without your passphrase. This is a deliberate security feature—there is no backdoor. Store your passphrase in a trusted password manager.',
      },
    ],
  },
  {
    slug: 'paintracker-worksafebc-claims',
    title: 'Using PainTracker for WorkSafeBC Claims',
    description:
      'Learn how PainTracker helps document workplace injuries for WorkSafeBC claims with structured exports and consistent evidence.',
    h1: 'Using PainTracker for WorkSafeBC Claims',
    cluster: 'utility',
    isPillar: false,
    schemaTypes: ['WebPage', 'FAQPage'],
    sections: [
      {
        h2: 'Why documentation matters for WCB claims',
        paragraphs: [
          'WorkSafeBC claims succeed or fail based on documentation quality. Consistent, contemporaneous symptom records strengthen your claim by showing a clear pattern of injury-related symptoms over time.',
          'A structured pain diary demonstrates that your symptoms are real, persistent, and consistent with the claimed injury—exactly what claims adjudicators evaluate.',
        ],
      },
      {
        h2: 'Setting up tracking for your claim',
        paragraphs: [
          'Start tracking as soon as possible after the workplace injury. Log daily entries including pain intensity, location, functional limitations, medications, and any activities that worsen or improve symptoms.',
          'Be thorough but honest. Include good days as well as bad days. Variation in your records actually increases credibility—claims reviewers know that real injuries fluctuate.',
        ],
      },
      {
        h2: 'Exporting WCB-formatted reports',
        paragraphs: [
          'PainTracker includes export templates specifically designed for WorkSafeBC documentation. These reports include the structured fields that claims reviewers expect, along with trend charts and summary statistics.',
          'Export your diary in PDF format for submission with your claim paperwork. The report is generated locally—your data never passes through a third-party server.',
        ],
      },
      {
        h2: 'Privacy during the claims process',
        paragraphs: [
          'During a WCB claim, you may worry about who can access your health records. With PainTracker, you control exactly which entries and date ranges to export. You are never sharing your entire diary—only the specific data you choose.',
          'Because data is encrypted locally, there is no risk of your employer, insurer, or anyone else accessing your pain records without your explicit consent.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does PainTracker work for WorkSafeBC claims?',
        answer:
          'Yes. PainTracker includes WCB-specific export templates and generates structured documentation that aligns with WorkSafeBC claim requirements.',
      },
      {
        question: 'Can WorkSafeBC access my PainTracker data?',
        answer:
          'No. PainTracker stores data locally and encrypted on your device. No one can access it without your passphrase. You share only what you choose to export.',
      },
    ],
  },
  {
    slug: 'preparing-physiotherapy-pain-logs',
    title: 'Preparing for Physiotherapy With Pain Logs',
    description:
      'Use structured pain logs to improve physiotherapy outcomes by giving your physiotherapist clear data on symptoms, progress, and response to treatment.',
    h1: 'Preparing for Physiotherapy With Pain Logs',
    cluster: 'utility',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'What physiotherapists need from you',
        paragraphs: [
          'Physiotherapists make treatment decisions based on how you respond to exercises and manual therapy between sessions. A pain log that captures intensity before and after exercises, range of motion changes, and daily symptom patterns gives your physiotherapist the data to adjust your program effectively.',
          'Without this data, treatment adjustments are based on your recall during the appointment—which is often inaccurate, especially when pain interferes with memory.',
        ],
      },
      {
        h2: 'Tracking exercise response',
        paragraphs: [
          'Log your pain level before and after each prescribed exercise session. Note which exercises increased pain, which provided relief, and how long any changes lasted. This creates a treatment response record that guides progressive loading decisions.',
          'PainTracker\'s tagging system lets you label entries with specific exercises or activities, making it easy to correlate movements with symptoms.',
        ],
      },
      {
        h2: 'Measuring progress objectively',
        paragraphs: [
          'Recovery from injury is rarely linear. A pain log shows the overall trend—even when individual days feel like setbacks. Sharing a trend chart with your physiotherapist helps both of you see progress that might be invisible session-to-session.',
          'Objective progress data also motivates you during difficult phases of rehabilitation.',
        ],
      },
      {
        h2: 'Exporting for your physiotherapist',
        paragraphs: [
          'Export a PDF summary before each physiotherapy appointment covering the interval since your last session. Include intensity trends, exercise response notes, and any new symptoms. This maximises the value of your session time.',
          'PainTracker\'s exports present data in a clinical format that physiotherapists can review quickly and integrate into their own notes.',
        ],
      },
    ],
  },
  {
    slug: 'tracking-recovery-after-injury',
    title: 'Tracking Recovery After Injury',
    description:
      'Document your recovery journey after injury with structured symptom tracking that shows progress, setbacks, and treatment response.',
    h1: 'Tracking Recovery After Injury',
    cluster: 'utility',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Why recovery tracking matters',
        paragraphs: [
          'Injury recovery is a long process with many variables. Tracking symptoms daily creates an objective record of your trajectory that helps you, your clinician, and (if relevant) your claims adjudicator understand how you are progressing.',
          'Without tracking, recovery feels subjective. With data, you can see measurable improvement even when individual days feel discouraging.',
        ],
      },
      {
        h2: 'What to track during recovery',
        paragraphs: [
          'Record daily pain intensity, functional capabilities (what you can and cannot do), medication usage, sleep quality, and activity levels. Track both the injured area and any compensatory pain that develops as you adapt your movement patterns.',
          'PainTracker\'s structured fields make it easy to capture all these dimensions without having to design your own tracking system.',
        ],
      },
      {
        h2: 'Identifying setbacks early',
        paragraphs: [
          'A rising pain trend over several days can signal a setback before it becomes a major problem. Consistent tracking surfaces these trends early, allowing you to adjust activity levels or contact your clinician before symptoms escalate.',
          'PainTracker\'s analytics highlight trend changes automatically, helping you catch early warning signs.',
        ],
      },
      {
        h2: 'Documenting recovery for claims',
        paragraphs: [
          'If your injury is related to a workplace incident or accident claim, your recovery documentation becomes evidence. A detailed, consistent pain diary shows the timeline from injury through recovery, supporting your claim with objective data.',
          'Export your recovery timeline as a PDF report for submission with claim paperwork or for sharing with legal counsel.',
        ],
      },
    ],
  },
  {
    slug: 'sharing-symptom-data-safely',
    title: 'Sharing Symptom Data With Clinicians Safely',
    description:
      'Learn how to share pain and symptom data with clinicians securely while maintaining control over your private health information.',
    h1: 'Sharing Symptom Data With Clinicians Safely',
    cluster: 'utility',
    isPillar: false,
    schemaTypes: ['WebPage'],
    sections: [
      {
        h2: 'Control what you share',
        paragraphs: [
          'PainTracker gives you complete control over what data you share. Export specific date ranges, choose which fields to include, and select the format that matches your clinician\'s workflow. You never have to share your entire diary.',
          'This selective sharing is especially important when your diary contains entries relevant to multiple care providers or sensitive entries you prefer to keep private.',
        ],
      },
      {
        h2: 'Secure sharing methods',
        paragraphs: [
          'Export your data as a file (PDF, CSV, or JSON) and share it through a secure channel: your clinic\'s patient portal, encrypted email, or by handing a printed copy directly to your clinician.',
          'Avoid sharing health data via unencrypted email or social media. PainTracker generates files locally, giving you the opportunity to choose a secure sharing method before any data leaves your device.',
        ],
      },
      {
        h2: 'Understanding what clinicians see',
        paragraphs: [
          'The PDF export is what most clinicians will see: a structured report with date ranges, intensity trends, summary statistics, and detailed entries. Preview your export before sharing to ensure it contains exactly what you want your clinician to receive.',
          'CSV exports provide raw data for clinicians who want to import your records into their own analysis tools or electronic health record systems.',
        ],
      },
      {
        h2: 'Your data remains yours',
        paragraphs: [
          'Sharing a PainTracker export gives your clinician a copy of your data—it does not grant ongoing access. There is no shared account, no live sync, and no portal where your clinician can view your diary in real time.',
          'If you want to share updated data, generate a new export. This approach ensures you always know exactly what information your care providers have received.',
        ],
      },
    ],
  },
];

// ── Combined export ──────────────────────────────────────────────────

export const articles: ArticleData[] = [
  ...pillarArticles,
  ...privacyCluster,
  ...clinicalCluster,
  ...chronicCluster,
  ...comparisonCluster,
  ...transparencyPages,
  ...utilityPages,
];

/**
 * Lookup helper — returns undefined when slug is unknown.
 */
export function getArticleBySlug(slug: string): ArticleData | undefined {
  return articles.find((a) => a.slug === slug);
}

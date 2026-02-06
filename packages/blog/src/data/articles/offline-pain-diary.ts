import type { ArticleData } from './types';

const article: ArticleData = {
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
        'Most pain tracking apps send your health data to remote servers, creating privacy risks that many people with chronic pain simply cannot afford. An offline pain diary keeps every entry on your device, under your control, with no third-party access. This is not a niche concern—health data breaches have exposed hundreds of millions of records in the past decade, and pain diaries often contain deeply personal information about functional limitations, medication use, and emotional state.',
        'For people navigating insurance claims, workplace injury recovery, or sensitive medical situations, local-only storage eliminates the risk of data breaches, employer access, or unwanted profiling based on health conditions. When your symptom records could affect your livelihood, your custody arrangement, or your disability benefits, the stakes of data custody are not hypothetical—they are immediate and consequential.',
        'An offline approach also means you are not dependent on any company staying in business. Cloud-based apps disappear when their parent company runs out of funding. An offline diary stored on your device remains accessible regardless of what happens to the developer.',
      ],
    },
    {
      h2: 'Benefits of local-only health data',
      paragraphs: [
        'When your pain diary lives entirely on your device, you gain several concrete advantages: no account creation, no password to remember for yet another service, no terms-of-service changes that quietly grant access to your data, and zero dependency on an internet connection. There is no onboarding friction—open the app, start tracking, and your data exists only where you put it.',
        'Local-only data also means faster performance. Entries save instantly to IndexedDB without waiting for network round-trips. You can log symptoms in a waiting room, during a flare, or anywhere signal is unreliable. This reliability matters because pain does not wait for good Wi-Fi, and the most valuable entries are often the ones captured in the moment, not reconstructed later from memory.',
        'There is also a psychological benefit. Many patients report tracking more honestly when they know no one else can see their entries. The absence of surveillance—real or perceived—leads to more accurate self-reporting, which in turn produces better clinical data.',
      ],
    },
    {
      h2: 'How offline diaries support clinical care',
      paragraphs: [
        'Clinicians rely on consistent, structured symptom records to make informed decisions. An offline pain diary that exports clean PDF or CSV reports gives your doctor exactly what they need—without requiring them to log into another portal or navigate an unfamiliar interface. The export is a self-contained document they can print, annotate, and file alongside their own notes.',
        'PainTracker generates clinical-grade exports formatted for physiotherapists, specialists, and WorkSafeBC claim reviewers. The data you share is the data you choose to share, nothing more. You select the date range, the format, and the level of detail. This selective sharing respects both your privacy and your clinician\'s time.',
        'Longitudinal pain data—entries captured consistently over weeks or months—provides a clinical picture that no single appointment can replicate. Doctors can see whether your pain is improving, stable, or worsening; which medications correlate with better days; and whether certain activities or times of day reliably trigger flares.',
      ],
    },
    {
      h2: 'Privacy architecture of an offline diary',
      paragraphs: [
        'PainTracker\'s offline architecture is not a limitation—it is a deliberate security decision. All data is stored in your browser\'s IndexedDB, encrypted at rest using keys derived from a passphrase you choose. The encryption keys never leave your device. Even the developers cannot read your entries.',
        'This zero-knowledge design means there is no server to breach, no database to leak, and no admin panel that displays user data. The attack surface is reduced to a single device that you physically control. Compare this to cloud apps where your data passes through load balancers, application servers, databases, backup systems, and potentially analytics pipelines—each a potential point of exposure.',
      ],
    },
    {
      h2: 'Getting started with PainTracker',
      paragraphs: [
        'PainTracker is a Progressive Web App that installs directly from your browser. There is no app store, no account, and no cloud sync. Open the app at paintracker.ca/app, tap "Add to Home Screen" on mobile, and your data is encrypted on-device from the very first entry.',
        'The entry interface is designed for low-friction daily logging. Slide to set your pain intensity, tap body areas on the visual map, select pain quality descriptors, and add optional notes or tags. The entire flow takes under sixty seconds, even on your worst days. Structured inputs (sliders, toggles, taps) replace typing wherever possible to reduce effort.',
        'When you are ready to share with a clinician, export a report in PDF, CSV, or JSON format. The export process is entirely user-initiated—nothing leaves your device until you say so. For WorkSafeBC claims, a dedicated template aligns with the expected documentation format.',
      ],
    },
    {
      h2: 'Who benefits from offline tracking',
      paragraphs: [
        'Offline pain diaries serve anyone who values privacy, but they are especially valuable for specific populations. Workers documenting injuries for compensation claims need records that cannot be accessed or challenged by employers. Patients in contested custody situations need health documentation that remains under their exclusive control. People managing stigmatised conditions—chronic pain, mental health challenges, substance use disorders—benefit from knowing their records are truly private.',
        'Rural patients with unreliable internet connectivity also benefit from offline-first design. A pain diary that requires a server connection is useless in areas with spotty coverage, which disproportionately affects the same populations that often have limited access to specialist care and therefore need better self-documentation.',
      ],
    },
    {
      h2: 'Long-term data ownership',
      paragraphs: [
        'Your pain data may remain relevant for years or even decades. Chronic conditions do not resolve on app-update timelines. An offline diary stored in an open format (exportable as JSON, CSV, or PDF) ensures you can always access your historical data, regardless of whether the original app is still maintained.',
        'PainTracker is open source, which provides an additional layer of long-term safety. Even if the project stops active development, the code remains available for anyone to run, fork, or maintain. Your data format is documented, and the export tools remain functional. This is what genuine data ownership looks like: not a marketing promise, but a structural guarantee.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Does an offline pain diary work without Wi-Fi?',
      answer:
        'Yes. PainTracker is a Progressive Web App that works fully offline once installed. All data is stored locally in your browser using IndexedDB. You only need an internet connection for the initial installation.',
    },
    {
      question: 'Can I share my offline diary with my doctor?',
      answer:
        'Absolutely. PainTracker lets you export your entries as PDF, CSV, or JSON files that you can email, print, or hand to your clinician directly. You choose which date ranges and data to include.',
    },
    {
      question: 'Is my data encrypted in an offline pain diary?',
      answer:
        'Yes. PainTracker encrypts all health data at rest using keys derived locally on your device from your passphrase. No one—including the developers—can read your entries without your passphrase.',
    },
    {
      question: 'What happens to my data if I clear my browser?',
      answer:
        'Clearing browser data will remove your pain diary entries. Export your data regularly as a backup. PainTracker supports JSON export for complete data backup and restoration.',
    },
    {
      question: 'Can I use an offline pain diary on multiple devices?',
      answer:
        'Each device maintains its own local diary. You can export data from one device and keep copies for your records, but there is no automatic sync—by design, to protect your privacy.',
    },
  ],
};

export default article;

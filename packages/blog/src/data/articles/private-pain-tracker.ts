import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'private-pain-tracker',
  title: 'Private Pain Tracker: Symptom Logging Without Surveillance',
  description:
    'A private pain tracker that keeps your health data on your device. No accounts, no cloud, no third parties, just encrypted, local symptom tracking you actually control.',
  h1: 'Private Pain Tracker: No Accounts, No Cloud, No One Watching',
  cluster: 'pillar',
  isPillar: true,
  schemaTypes: ['Article', 'FAQPage'],
  sections: [
    {
      h2: 'Privacy is architecture, not a settings menu',
      paragraphs: [
        'Most apps that call themselves private have a privacy settings menu. That is not privacy, that is a checkbox. A truly private pain tracker never had the data to begin with. It stores nothing on external servers, collects no analytics, and contains no third-party SDKs that phone home. The privacy is structural. There is no company database to breach, no admin panel where your entries are visible, no cloud backup sitting somewhere you cannot see or control.',
        'A lot of apps claim privacy while quietly collecting crash reports, usage metrics, and behavioral analytics that contain identifiable health information. They call it aggregate data. They call it anonymized. They are often wrong on both counts. Pain Tracker achieves privacy through not collecting. The server delivers static files. That is its entire job. Your health data is not involved in that transaction at any point.',
        'This matters because your pain diary is not abstract. It contains information about your medications, your functional limitations, your worst days and what you could not do on them. That information can affect employment. Insurance. Custody. Legal proceedings. If it leaks, it does not leak in a vacuum. It leaks into situations you did not choose and did not ask for.',
      ],
    },
    {
      h2: 'Encryption that protects your entries',
      paragraphs: [
        'Pain Tracker encrypts everything before it is written to storage. Your passphrase generates a cryptographic key through a derivation function. That key exists in memory during your session and nowhere else. The encryption runs in your browser using the Web Crypto API, a standard library maintained by browser vendors and reviewed by security researchers worldwide. Not something we invented.',
        'There is no password recovery. No "forgot passphrase" email. Because there is no server that holds a copy of your key. This is the trade-off: you are responsible for remembering your passphrase. In exchange, nobody, not the developers, not a court order, not a data breach, can access your entries without it.',
        'The implementation is open source. Anyone can read it. Security researchers, developers, people who simply want to verify the claim. The encryption is not trustworthy because we say so. It is trustworthy because the code is there.',
      ],
    },
    {
      h2: 'What you are actually agreeing to with cloud apps',
      paragraphs: [
        'Cloud-based pain trackers store your data on someone else\'s infrastructure. Even if they encrypt it in transit, the data typically exists in readable form on the server, accessible to employees, subject to law enforcement requests, and vulnerable to the next breach. Multiple major health apps have been found sharing data with advertisers and analytics companies despite privacy policies that suggested otherwise. Policies are aspirational. Code does what code does.',
        'The fundamental problem is alignment. Companies with cloud infrastructure need revenue to pay for servers. Health data is genuinely valuable to advertisers, insurers, and employers. Even well-intentioned companies face pressure to monetize, and companies that get acquired inherit new priorities without your consent. A business model built on cloud infrastructure will always be tempted by the data living there.',
        'A local-only tracker removes the category of risk. No server to breach. No employee with database access. No business model that depends on your records. The incentive is simple: the app exists to serve you. That is it.',
      ],
    },
    {
      h2: 'Privacy that does something when it matters',
      paragraphs: [
        'Beyond encryption, real privacy means features that address actual threats. Pain Tracker includes a panic mode, a rapid overlay that replaces the app interface to reduce visible app state during distress or unwanted observation. It is one layer of a set of controls that give you options in situations where options matter.',
        'Selective export lets you share a specific date range without handing over your entire history. A month for your physiotherapist. Six weeks for your prescriber. The WorkSafeBC period for your claim. Each recipient gets what is relevant. Nothing more. That is the difference between sharing data and surrendering it.',
        'No push notifications. No email receipts. No calendar integrations that expose health information through shared accounts. These are not missing features. They are deliberate omissions. Every notification is a potential visibility event. Pain Tracker does not generate them.',
      ],
    },
    {
      h2: 'Who most needs privacy, and who access usually excludes',
      paragraphs: [
        'People with disabilities are disproportionately affected by health data exposure, facing discrimination in employment, housing, and insurance when their records circulate into the wrong places. A private pain tracker that is also inaccessible has failed the people who need its protection most. Privacy and accessibility are not competing values. They are the same commitment pointing in different directions.',
        'Pain Tracker targets WCAG 2.2 AA compliance: keyboard navigation, screen reader support, contrast ratios that hold up in sunlight, touch targets sized for motor impairment. The trauma-informed design philosophy means non-shaming language, reduced cognitive load, and user control over the tracking experience, because people tracking chronic pain are often doing so at reduced capacity, in pain, under difficult circumstances. The interface should not make that worse.',
      ],
    },
    {
      h2: 'Open source as a privacy guarantee',
      paragraphs: [
        'Privacy claims are only as trustworthy as their verifiability. Pain Tracker is fully open source. Anyone can read the code, verify that no data is transmitted, and confirm that the encryption implementation is what we say it is. This is not a gesture. It is accountability. The community can identify vulnerabilities, report them publicly, and hold the project to its stated principles in a way that closed-source apps can never be held.',
        'Open source also means no permanent dependency on the current maintainers. If this project changes direction, the code can be forked, the data format is documented, and the export tools keep working. You are not placing trust in a company\'s promises. You are relying on code that exists and can be read by anyone with the interest to look.',
      ],
    },
    {
      h2: 'Building a private health record over time',
      paragraphs: [
        'Months or years of consistent tracking reveal what no single appointment can, seasonal patterns, medication trends over time, activity-pain relationships, the arc of a recovery or a slow decline. This longitudinal data is both clinically powerful and deeply personal. It is the clearest record that exists of what your life has been like while you were managing this.',
        'Because Pain Tracker stores locally and exports in standard formats, your history is not locked into anyone\'s ecosystem. Export anytime. Keep copies on your own terms. Share with new providers as your care team changes. Privacy and portability are served by the same architecture. Neither requires a compromise.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Does Pain Tracker collect any personal data?',
      answer:
        'No. No server-side database, no user accounts, no analytics collecting personal information. Your health data stays on your device. That is the complete answer.',
    },
    {
      question: 'Can my employer access my pain tracking data?',
      answer:
        'No. Your data is encrypted on your device and never transmitted to any server. There is nothing for anyone to request access to, not employers, not insurers, not us.',
    },
    {
      question: 'What happens if Pain Tracker shuts down?',
      answer:
        'Your data stays on your device. Pain Tracker is open source, the code stays public and forkable regardless of what happens to the project. Export your data regularly as an additional layer of protection.',
    },
    {
      question: 'Does Pain Tracker make healthcare compliance claims?',
      answer:
        'Pain Tracker implements privacy-aligned security controls: encryption at rest, local-only data storage, no server-side processing. It is a local tool, not a compliance-certified platform. Those are different things, and we say so directly.',
    },
  ],
};

export default article;

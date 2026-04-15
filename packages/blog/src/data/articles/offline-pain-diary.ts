import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'offline-pain-diary',
  title: 'Offline Pain Diary: Track Symptoms Without Sending Your Data to Anyone',
  description:
    'An offline pain diary keeps every entry on your device, encrypted, under your control. No accounts, no servers, no one reading your records but you.',
  h1: 'Offline Pain Diary: Your Symptoms, Your Device, Nobody Else\'s Business',
  cluster: 'pillar',
  isPillar: true,
  schemaTypes: ['Article', 'FAQPage'],
  sections: [
    {
      h2: 'Why the cloud is the wrong place for your pain history',
      paragraphs: [
        'Your pain history is not neutral data. It is evidence in a case that may not have been filed yet but could be. A disability claim. An insurance dispute. A workplace injury your employer wants to minimize. Apps that send your records to their servers are betting you will not think about that. An offline pain diary breaks that bet. Every entry stays on your device. No server. No breach. No sale.',
        'If you are navigating a WorkSafeBC claim, the insurer on the other side is already motivated to access your records. If there is a custody dispute anywhere in your life, health history becomes leverage. The pain you track honestly, the bad days, the days you fell apart: all of it can be used against you in ways you did not anticipate. Local-only storage is the only architecture that actually closes that door. There is nothing to subpoena. Nothing to breach. One device. Yours.',
        'There is also the simpler reason. Cloud companies shut down. They get acquired. They pivot. They sell user data in bankruptcy. An app that lives on a server can disappear in an afternoon and take your eighteen months of records with it. Something on your device stays as long as your device does.',
      ],
    },
    {
      h2: 'What you actually get when you cut the cloud out',
      paragraphs: [
        'No account. No password to forget. No terms of service that quietly change overnight to grant access to your entries. No onboarding ritual. Open the app, start tracking. Your data exists exactly where you put it and nowhere else.',
        'Speed follows from that simplicity. Entries save instantly, not after a spinner, not pending a network response, not contingent on signal. You log symptoms in a waiting room, during a flare, in the middle of the night when the pain is bad enough to wake you. The app does not need to ask a server\'s permission. The most useful entries are captured in the moment, not reconstructed from memory three days later when the doctor asks how you have been.',
        'People also report tracking more honestly when no one else can see. Not performing symptoms for an audience. Not softening the bad days out of embarrassment. Real data. Which is the only kind that actually helps.',
      ],
    },
    {
      h2: 'What your doctor gets from structured local data',
      paragraphs: [
        'Clinicians need consistent records, not feelings. An offline pain diary that exports clean PDF or CSV reports gives them exactly what they need, without requiring them to log into another portal, learn another interface, or trust that a tech company formatted the output for clinical use. The export is a document. They can print it, annotate it, file it. It looks like documentation because it is.',
        'Pain Tracker generates exports structured for physiotherapists, specialists, and WorkSafeBC reviewers. The data you share is the data you choose to share. You pick the date range, the format, the level of detail. Nothing happens without your deliberate action.',
        'A month of consistent daily entries tells a doctor something no fifteen-minute appointment can replicate. They see whether your pain is improving, holding steady, or worsening. They see which medications correlate with better days. They see which activities or times of day reliably push things higher. That is a clinical picture. That is what drives actual treatment decisions.',
      ],
    },
    {
      h2: 'The structure behind the privacy',
      paragraphs: [
        'Pain Tracker stores everything in your browser\'s IndexedDB, encrypted with keys derived from your passphrase. Not stored on a server. Not transmitted anywhere. The developers cannot read your entries. This is not a privacy feature toggle, it is the architecture itself.',
        'There is no server to breach, no database to leak, no admin panel where someone can look at your records. The attack surface is one device, the one you hold. Compare that to cloud apps where your data moves through load balancers, application servers, databases, backup pipelines, and probably analytics systems. Every one of those is a potential exposure point. Local storage eliminates the category of risk, not just one instance of it.',
      ],
    },
    {
      h2: 'Getting started with Pain Tracker',
      paragraphs: [
        'Pain Tracker is a Progressive Web App. No app store. No account. Install it from your browser at paintracker.ca/app, tap "Add to Home Screen" on mobile, and your entries are encrypted on-device from the first one. The whole setup takes under a minute.',
        'The entry interface is built for the days when you have very little left to give. Slide to set intensity, tap the body map, pick descriptors, add a note if you have capacity. Under sixty seconds even during a flare. Structured inputs instead of typing, the words do not have to come from you. When you are ready to share with a clinician, the export is user-initiated. Nothing leaves your device until you decide.',
        'For WorkSafeBC claims, there is a dedicated export template that aligns with what reviewers expect. You control the date range, the format, the level of detail. No surprises.',
      ],
    },
    {
      h2: 'Who this is actually built for',
      paragraphs: [
        'Workers documenting injuries for compensation claims. People in contested custody situations. Patients managing stigmatized conditions who have learned, through hard experience, that their records can circulate in ways they never consented to. Rural patients where connectivity is unreliable. People who have watched an app shut down and taken their data with it. Every one of these situations is more common than mainstream health tech acknowledges.',
        'An offline-first architecture is not a workaround for rural coverage problems. It is a structural commitment to the people most likely to be harmed by cloud-dependent infrastructure. The same populations who often have least access to specialist care are also most exposed when their health data lands in the wrong hands.',
      ],
    },
    {
      h2: 'Long-term data ownership',
      paragraphs: [
        'Your pain data may be relevant for years. Chronic conditions do not resolve on app-update timelines. A diary stored in an open format, exportable as JSON, CSV, or PDF, remains yours regardless of what happens to the software that created it.',
        'Pain Tracker is open source. If the project stops active development, the code stays public and forkable. Your data format is documented. The export tools keep working. This is what real data ownership looks like. Not a marketing promise. A structural guarantee.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Does an offline pain diary work without Wi-Fi?',
      answer:
        'Yes. Pain Tracker is a Progressive Web App that works fully offline once installed. Entry logging, trend analysis, and export all run locally. You only need internet once, for the initial install.',
    },
    {
      question: 'Can I share my offline diary with my doctor?',
      answer:
        'Yes. Export your entries as PDF, CSV, or JSON. Email it, print it, show it on your phone. You choose what date ranges and data to include. Nothing leaves your device until you make that decision.',
    },
    {
      question: 'Is my data encrypted in an offline pain diary?',
      answer:
        'Yes. Pain Tracker encrypts everything at rest using keys derived from your passphrase on your device. Nobody, including the developers, can read your entries without your passphrase.',
    },
    {
      question: 'What happens to my data if I clear my browser?',
      answer:
        'Clearing browser data deletes your entries. Export your data regularly. Pain Tracker supports JSON export for complete backup and restore.',
    },
    {
      question: 'Can I use an offline pain diary on multiple devices?',
      answer:
        'Each device has its own local diary. You can export from one and keep a copy wherever makes sense. No automatic sync, by design. Sync requires a server. We do not have one.',
    },
  ],
};

export default article;

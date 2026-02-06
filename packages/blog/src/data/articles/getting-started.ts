import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'getting-started',
  title: 'Getting Started with PainTracker: Your First Week of Symptom Tracking',
  description:
    'Set up PainTracker in minutes and start tracking pain symptoms privately. Follow this step-by-step guide to install, configure, and build your first week of data.',
  h1: 'Getting Started with PainTracker: From Install to First Export',
  cluster: 'utility',
  isPillar: false,
  schemaTypes: ['HowTo', 'FAQPage'],
  sections: [
    {
      h2: 'Install PainTracker in under a minute',
      paragraphs: [
        'PainTracker is a Progressive Web App that installs directly from your browser—no app store required, no account needed. Visit paintracker.ca/app in Chrome, Safari, Edge, or Firefox on any device. On mobile, tap the browser\'s "Add to Home Screen" option. On desktop, click the install icon in the address bar. The app downloads to your device and works offline immediately.',
        'There is no registration, no email verification, and no terms-of-service agreement for your data. You set a passphrase that encrypts your entries, and you are ready to start tracking. The entire setup takes under sixty seconds.',
      ],
    },
    {
      h2: 'Set your passphrase',
      paragraphs: [
        'Your passphrase encrypts all health data stored on your device. Choose something memorable but not easily guessable—at least four random words or twelve characters. This passphrase is never sent anywhere and cannot be recovered if lost. Write it down and store it securely if you are concerned about forgetting it.',
        'The passphrase is your only key. Without it, your data is permanently inaccessible—by design. This zero-knowledge approach means no one can access your records without your explicit authorisation.',
      ],
    },
    {
      h2: 'Log your first pain entry',
      paragraphs: [
        'The entry interface is designed for speed and simplicity. Slide to set your pain intensity on the 0–10 scale. Tap the body map to mark pain locations. Select quality descriptors that match your experience—aching, burning, stabbing, throbbing, or others. Add optional notes if you want to capture context.',
        'Your first entry establishes your baseline. Do not overthink it—record what you feel right now. Consistency matters more than precision. The structured inputs ensure that every entry is comparable to every other entry, building a dataset that reveals patterns over time.',
      ],
    },
    {
      h2: 'Build your first week of data',
      paragraphs: [
        'Commit to logging one entry per day for your first week. Anchor it to an existing routine—after morning medication, before bed, or at a consistent break time. The goal is to establish the habit. After seven days, you will have enough data to see your first patterns in the analytics view.',
        'On high-pain days, the minimal entry path—a single slider adjustment—takes seconds. On better days, add medication details, functional impact notes, and tags. Both levels of detail are valuable: the key is that you logged something every day.',
      ],
    },
    {
      h2: 'Explore your analytics',
      paragraphs: [
        'After several entries, visit the analytics view to see your data visualised. Trend charts show pain intensity over time. Time-of-day breakdowns reveal whether mornings or evenings are worse. Body map heatmaps show your most common pain locations. All analysis happens locally on your device—nothing is sent to any server.',
        'These early analytics are just the beginning. As your dataset grows over weeks and months, patterns become clearer: seasonal variations, medication correlations, trigger relationships, and recovery trajectories all emerge from consistent tracking.',
      ],
    },
    {
      h2: 'Export your first report',
      paragraphs: [
        'After your first week, try exporting a report. Choose PDF for a clinical-ready document, CSV for raw data, or JSON for a complete backup. The export process runs entirely in your browser—nothing leaves your device until you choose to share the file.',
        'Bring a printed report to your next medical appointment. Even a week of structured data gives your clinician more to work with than verbal recall. As your tracking history grows, your exports will become increasingly valuable clinical documents.',
      ],
    },
  ],
  howToSteps: [
    { name: 'Install the app', text: 'Visit paintracker.ca/app and use "Add to Home Screen" on mobile or the install icon on desktop.' },
    { name: 'Set your passphrase', text: 'Choose a strong, memorable passphrase that encrypts all your health data locally.' },
    { name: 'Log your first entry', text: 'Use the slider for intensity, tap the body map for location, and select pain quality descriptors.' },
    { name: 'Track daily for one week', text: 'Log at least one entry per day at a consistent time to establish your tracking habit and baseline data.' },
    { name: 'Review analytics and export', text: 'View your trends in the analytics dashboard, then export a PDF report for your next appointment.' },
  ],
  faqs: [
    {
      question: 'Do I need to create an account to use PainTracker?',
      answer:
        'No. PainTracker requires no account, email, or personal information. You set a passphrase to encrypt your data, and that is the only setup required.',
    },
    {
      question: 'What devices does PainTracker work on?',
      answer:
        'PainTracker works on any device with a modern web browser: iPhones, Android phones, iPads, tablets, laptops, and desktop computers. It installs as a Progressive Web App from your browser.',
    },
    {
      question: 'Can I use PainTracker without an internet connection?',
      answer:
        'Yes. After the initial installation, PainTracker works entirely offline. All features—entry logging, analytics, exports—function without any internet connection.',
    },
    {
      question: 'What if I forget my passphrase?',
      answer:
        'Your passphrase cannot be recovered because it is never stored or transmitted. If you forget it, your encrypted data is permanently inaccessible. Write it down and store it securely.',
    },
  ],
};

export default article;

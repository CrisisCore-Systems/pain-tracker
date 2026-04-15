import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'security-architecture',
  title: 'Pain Tracker Security Architecture: How We Protect Your Health Data',
  description:
    'Multi-layer security architecture for local health data: client-side encryption, zero-knowledge design, Content Security Policy, and defence-in-depth. What it does and why.',
  h1: 'Pain Tracker Security Architecture: Defence in Depth for Health Data',
  cluster: 'transparency',
  isPillar: false,
  schemaTypes: ['WebPage'],
  sections: [
    {
      h2: 'One principle, everything else follows from it',
      paragraphs: [
        'Pain Tracker\'s security architecture is built on one principle: your health data should never exist anywhere you do not control. No server-side data storage. No remote databases. No cloud backups. No analytics pipelines that touch health information. Every security decision flows from this, and every feature is evaluated against it before implementation.',
        'The architecture follows a defence-in-depth model: multiple independent layers of protection so that no single failure compromises your data. Client-side encryption, Content Security Policy, secure storage isolation, session management, and minimal attack surface work together. No single layer is the whole story.',
      ],
    },
    {
      h2: 'Client-side encryption',
      paragraphs: [
        'All health data is encrypted in your browser before being written to storage. Pain Tracker uses the Web Crypto API, a standardised browser cryptographic library, with keys derived from your passphrase through a key derivation function. The encryption key exists only in memory during your active session and is never persisted to storage.',
        'This means that even if someone extracts the raw IndexedDB data from your device, they see only encrypted blobs. Without your passphrase, the data is computationally infeasible to decrypt. The encryption implementation is open source, auditable, and uses standard algorithms rather than custom cryptographic code.',
      ],
    },
    {
      h2: 'Zero-knowledge architecture',
      paragraphs: [
        'Zero-knowledge means the application operator has no ability to read your data, not in principle, not in practice. Pain Tracker\'s server serves static application files: HTML, CSS, JavaScript. It has no database, no API endpoints that accept health data, and no mechanism to receive information from your browser beyond standard requests for application code.',
        'There are no user accounts, no authentication tokens, and no session identifiers that link server requests to individual users. The server cannot distinguish between different users, let alone access their encrypted health data. This is a structural guarantee, not a policy promise.',
      ],
    },
    {
      h2: 'Content Security Policy and XSS prevention',
      paragraphs: [
        'Pain Tracker implements a strict Content Security Policy that restricts which scripts can execute, which resources can be loaded, and which connections can be made. This mitigates cross-site scripting attacks, a common web vulnerability that could theoretically be used to extract data from the browser.',
        'The CSP configuration blocks inline scripts, restricts resource loading to known origins, and prevents the application from making unexpected network connections. Combined with secure coding practices and regular dependency auditing, this creates a hardened client-side environment that resists common web attack vectors.',
      ],
    },
    {
      h2: 'Honest limitations',
      paragraphs: [
        'Pain Tracker defends against realistic threats: lost or stolen devices through at-rest encryption, XSS attacks through CSP and secure coding, malicious browser extensions through limited plaintext exposure, and shoulder-surfing through panic mode and minimal visible data.',
        'We do not claim to protect against compromised operating systems, root-level malware, hardware keyloggers, or physical coercion beyond in-app safety controls. No application-level security can defeat an adversary who controls the OS. Honest threat modelling means being direct about what we protect against and what falls outside the scope of what we can do.',
      ],
    },
  ],
};

export default article;

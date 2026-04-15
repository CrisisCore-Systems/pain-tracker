import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'health-data-threat-model',
  title: 'Health Data Threat Model: What Risks Does Your Pain Diary Actually Face?',
  description:
    'A plain-language threat model for your health data. Who wants it, how they might get it, what Pain Tracker does about it, and where the limits are.',
  h1: 'Health Data Threat Model: Understanding the Real Risks',
  cluster: 'transparency',
  isPillar: false,
  schemaTypes: ['WebPage'],
  sections: [
    {
      h2: 'Why this matters to you specifically',
      paragraphs: [
        'A threat model names who might want access to your data, how they might get it, and what protections are in place. For health data, especially chronic pain records that may affect employment, insurance, and legal matters, understanding threats is not paranoia. It is practical risk management. Different people face different threats, and security measures should match actual risks rather than generic reassurances.',
        'Pain Tracker\'s security architecture is designed around a specific threat model. Being transparent about what it protects against, and what it does not, helps you make informed decisions about whether this approach matches your needs.',
      ],
    },
    {
      h2: 'Threat: data breaches and server compromise',
      paragraphs: [
        'Health data breaches are frequent and permanent. Once exposed, health information cannot be changed like a credit card number. Your medical history is compromised and stays that way. Cloud-based health apps store data on servers that are attractive targets, and even well-funded healthcare organisations suffer breaches regularly.',
        'Pain Tracker\'s defence: there is no server-side health data to breach. The server delivers static application code and has no database, no user data, and no API endpoints that receive health information. The attack surface for health data is zero at the server level.',
      ],
    },
    {
      h2: 'Threat: employer or insurer access',
      paragraphs: [
        'Workers documenting injuries for compensation claims face a specific threat: employers or their insurers may seek access to health records to dispute claims. With cloud-based apps, a legal request to the app company could potentially expose your entire tracking history, including entries unrelated to the workplace injury.',
        'Pain Tracker\'s defence: there is no company database to subpoena. Your data exists only on your device, encrypted with your passphrase. No legal process can compel the developers to hand over data they do not possess. You control what is shared through selective exports.',
      ],
    },
    {
      h2: 'Threat: device loss or theft',
      paragraphs: [
        'If your phone or computer is lost or stolen, someone gaining physical access to your device could potentially access your browser storage. This is a real threat that requires application-level protection beyond device lock screens.',
        'Pain Tracker\'s defence: all health data is encrypted at rest using your passphrase-derived key. Even with full physical access to the device and its storage, an attacker cannot read your pain entries without your passphrase. The encryption uses standard algorithms that resist brute-force attacks.',
      ],
    },
    {
      h2: 'Threat: coercive situations and unwanted observation',
      paragraphs: [
        'Some patients track pain in situations where others, a controlling partner, an intrusive employer, a monitoring family member, observe their digital activity. The visible presence of a pain tracking app can be problematic in coercive domestic situations.',
        'Pain Tracker\'s current defence is narrower than full deniability: panic mode allows quick dismissal of the current interface and replaces it with a low-stimulus overlay that reduces visible app state. The app runs as a Progressive Web App that can be named anything on the home screen. There are no push notifications that reveal pain tracking activity, no email receipts, and no calendar integrations that could expose health information through shared accounts.',
      ],
    },
    {
      h2: 'Threats we do not fully address',
      paragraphs: [
        'Honest security requires naming limitations. Pain Tracker cannot protect against a compromised operating system or malware with root access. These threats operate below the application layer and can intercept any data the browser processes. We cannot protect against physical coercion where someone forces you to reveal your passphrase. We cannot prevent a compromised browser from intercepting data before encryption.',
        'If you face these specific threats, additional measures beyond any single application are necessary: full-disk encryption, dedicated secure devices, and operational security practices. Pain Tracker provides strong protection within the browser application layer and is honest about threats that require system-level defences.',
      ],
    },
  ],
};

export default article;

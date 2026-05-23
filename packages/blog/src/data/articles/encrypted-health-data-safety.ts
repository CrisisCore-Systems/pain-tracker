import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'encrypted-health-data-safety',
  title: 'Encrypted Health Data: What Encryption Actually Does for Your Records',
  description:
    'Encryption protects your health data, but only if it is done right. Here is what client-side encryption means in practice, what it protects against, and what to look for in a health app.',
  h1: 'Encrypted Health Data: How Encryption Protects Your Records',
  cluster: 'privacy',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'What encryption actually does',
      paragraphs: [
        'Encryption transforms readable data into an unreadable scramble that can only be reversed with the correct key. For health data, pain entries, medication logs, functional assessments, this means that even if someone accesses the storage location, they cannot read your records without authorization. The protection applies whether the storage is a cloud server or a local device. The question is not whether something is encrypted. The question is who holds the key.',
        'Not all encryption is equal. Encryption in transit, standard HTTPS, protects data moving between your device and a server. It says nothing about what happens once the data arrives. Encryption at rest protects stored data against unauthorized access to the storage medium. True end-to-end encryption means only you hold the decryption key. The service provider cannot read your data even if compelled to do so. These are different things, and apps often conflate them.',
      ],
    },
    {
      h2: 'How Pain Tracker encrypts your data',
      paragraphs: [
        'Pain Tracker uses client-side encryption with keys derived from your passphrase through a key derivation function. The encryption happens in your browser using the Web Crypto API, a browser-native cryptographic library maintained by browser vendors and audited by the security research community, before any data is written to IndexedDB. Your passphrase is never stored anywhere. The derived key is held only in memory during your active session.',
        'This means there is no "forgot password" recovery. No server holds a backup of your key. This is a deliberate trade-off: you must remember your passphrase, and in exchange, nobody, not the developers, not your employer, not a court order, not a breach, can ever access your data without it.',
        'The implementation is open source, auditable, and uses standard algorithms. Security professionals can inspect the code to verify that the encryption is implemented correctly and that no data leaks in plaintext. The protection does not rely on obscurity.',
      ],
    },
    {
      h2: 'Common encryption claims worth scrutinizing',
      paragraphs: [
        'Many health apps advertise encryption without specifying what kind. "Your data is encrypted" might mean HTTPS in transit only, leaving data stored in plaintext on the server. It might mean server-side encryption where the company holds the key, which protects against external attackers but not against the company itself, its employees, or a government request.',
        'When evaluating encryption claims, ask: who holds the keys? Can the company read your data? What happens to your data if you delete your account? Is the encryption implementation open source? If the answer to "who holds the keys" is "the company," your data is protected against outsiders but not against the service itself.',
      ],
    },
    {
      h2: 'What encryption protects, and what it does not',
      paragraphs: [
        'Client-side encryption protects against: unauthorized access to your stored data if your device is lost, stolen, or accessed without your passphrase; extraction of readable health data from browser storage; forensic recovery of health records from your device\'s storage medium.',
        'It does not protect against: someone who knows your passphrase, malware or keyloggers that capture your passphrase as you type it, a compromised operating system that can read application memory. These are system-level threats that no application can fully defeat. Honest security documentation acknowledges these limits rather than pretending they do not exist.',
      ],
    },
    {
      h2: 'Encryption and regulatory frameworks',
      paragraphs: [
        'Health privacy regulations like PIPEDA in Canada recognize encryption as a key technical safeguard. But regulatory compliance is a minimum bar, not a guarantee of privacy. An app can be technically compliant while still collecting more data than necessary or sharing it in ways that users did not anticipate.',
        'Pain Tracker goes beyond compliance frameworks by eliminating server-side data collection entirely. Encryption is one layer of a defence-in-depth approach that includes local-only storage, zero-knowledge architecture, open-source transparency, and user-controlled sharing. The goal is not to be compliant. The goal is to actually protect your data.',
      ],
    },
    {
      h2: 'Protecting your encrypted data long-term',
      paragraphs: [
        'Encryption protects your data today. Long-term protection also requires your own habits. Choose a strong, unique passphrase for your pain diary, not a reused password, not a word someone who knows you could guess. Export and back up your data regularly. Encrypted local storage is protected against breaches, not against device failure.',
        'Pain Tracker\'s JSON export preserves the complete data structure for full backups. PDF and CSV exports produce human-readable files for sharing with clinicians. They are not encrypted by default, they are designed to be read. Know which export format to use for which purpose: JSON for backup, PDF for your doctor, CSV for analysis.',
      ],
    },
  ],
};

export default article;

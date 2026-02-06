import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'encrypted-health-data-safety',
  title: 'Encrypted Health Data: How Encryption Keeps Your Records Safe',
  description:
    'Understand how encryption protects your health data at rest and in transit. Learn what to look for in a health app that claims to encrypt your records.',
  h1: 'Encrypted Health Data: How Encryption Protects Your Records',
  cluster: 'privacy',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'What encryption means for health data',
      paragraphs: [
        'Encryption transforms readable data into an unreadable format that can only be reversed with the correct key. For health data—pain entries, medication logs, functional assessments—encryption ensures that even if someone accesses the storage location, they cannot read your records without your authorisation. This protection applies whether the storage is a cloud server or a local device.',
        'Not all encryption is equal. Encryption "in transit" protects data as it moves between your device and a server—this is standard HTTPS and protects against eavesdropping. Encryption "at rest" protects stored data against unauthorized access to the storage medium. True end-to-end encryption means only you hold the decryption key, and the service provider cannot read your data even if compelled to do so.',
      ],
    },
    {
      h2: 'How PainTracker encrypts your data',
      paragraphs: [
        'PainTracker uses client-side encryption with keys derived from your passphrase through a key derivation function. The encryption happens in your browser using the Web Crypto API—a standardised, browser-native cryptographic library—before any data is written to IndexedDB. Your passphrase is never stored; the derived key is held only in memory during your session.',
        'This architecture means there is no "forgot password" recovery option—because there is no server that holds a backup of your key. This is a deliberate trade-off: you must remember your passphrase, but in exchange, no one can ever access your data without it. Not the developers, not your employer, not a court order, not a data breach.',
        'The implementation uses standard, auditable algorithms rather than custom cryptographic code. Security professionals can inspect the open-source code to verify that the encryption is implemented correctly and that no data leaks in plaintext.',
      ],
    },
    {
      h2: 'Common encryption misconceptions',
      paragraphs: [
        'Many health apps advertise encryption as a feature without specifying what kind. "Your data is encrypted" might mean HTTPS in transit only, leaving data stored in plaintext on the server. It might mean server-side encryption where the company holds the key. Neither of these provides meaningful protection against a data breach or an employee with database access.',
        'Another common misconception is that encryption makes data deletion unnecessary. Even encrypted data should be handled with care—encryption algorithms can eventually be broken, and key management practices vary. PainTracker combines encryption with local-only storage and user-controlled deletion to provide defence in depth.',
      ],
    },
    {
      h2: 'Evaluating encryption claims in health apps',
      paragraphs: [
        'When evaluating a health app\'s encryption claims, ask specific questions: Who holds the encryption keys? Can the company read your data? What happens to your data if you delete your account? Is the encryption implementation open source or auditable? If the answer to "who holds the keys" is "the company," then your data is protected against outsiders but not against the company itself.',
        'Look for apps that use client-side encryption with user-held keys, open-source implementations, and standard cryptographic libraries. Avoid apps that cannot clearly explain their encryption model—vagueness about security is itself a red flag.',
      ],
    },
    {
      h2: 'Encryption and regulatory compliance',
      paragraphs: [
        'Health privacy regulations like PIPEDA in Canada and HIPAA in the United States require appropriate safeguards for health data, and encryption is widely recognised as a key technical control. However, regulatory compliance is a minimum bar, not a guarantee of privacy. An app can be technically compliant while still collecting more data than necessary or sharing it in ways users do not expect.',
        'PainTracker goes beyond compliance frameworks by eliminating server-side data collection entirely. Encryption is one layer of a defence-in-depth approach that includes local-only storage, zero-knowledge architecture, open-source transparency, and user-controlled data sharing.',
      ],
    },
    {
      h2: 'Protecting your encrypted data long-term',
      paragraphs: [
        'Encryption protects your data today, but long-term security also requires good practices on your part. Choose a strong, unique passphrase for your pain diary. Export and back up your data regularly—encrypted local storage is protected against breaches but not against device failure. Store backups securely, and remember that exported files (PDF, CSV) are not encrypted by default.',
        'PainTracker\'s JSON export preserves the encrypted format for full backups, while PDF and CSV exports produce human-readable files intended for sharing with clinicians. Understand which export format to use for which purpose: JSON for backup, PDF for your doctor, CSV for analysis.',
      ],
    },
  ],
};

export default article;

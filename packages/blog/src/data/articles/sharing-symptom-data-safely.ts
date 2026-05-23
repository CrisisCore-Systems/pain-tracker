import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'sharing-symptom-data-safely',
  title: 'Sharing Symptom Data Safely: Control What You Share and With Whom',
  description:
    'Your tracking data does not have to be an all-or-nothing disclosure. Here is how to share pain records with doctors, insurers, and advocates on your terms.',
  h1: 'Sharing Symptom Data Safely: You Decide What Leaves Your Device',
  cluster: 'utility',
  isPillar: false,
  schemaTypes: ['WebPage', 'FAQPage'],
  sections: [
    {
      h2: 'Controlled disclosure, not an open file cabinet',
      paragraphs: [
        'Private health tracking creates an apparent contradiction: you need privacy to track honestly, but you need to share data to benefit from clinical care. The resolution is not choosing between privacy and sharing. It is controlling the sharing so that you decide what is shared, with whom, in what format, and for what purpose. Selective disclosure means different recipients get different views of your data.',
        'Your physiotherapist sees functional impact and exercise response data for the past month. Your prescriber sees medication-pain correlations over three months. Your insurance reviewer sees the WorkSafeBC-formatted timeline. None of them need or receive your complete unfiltered history. That is how it should work.',
      ],
    },
    {
      h2: 'Choosing what to share',
      paragraphs: [
        'Before exporting, consider what data is relevant to the recipient and purpose. For a medical appointment: pain intensity trends, medication logs, functional impacts, and patterns you have noticed. For an insurance claim: timeline evidence, functional documentation, and treatment compliance records. For a second opinion: a comprehensive summary over the entire relevant period.',
        'Exclude entries that are irrelevant to the purpose. Personal notes, emotional processing, entries from unrelated health conditions, and data outside the relevant date range do not need to be in every export. Pain Tracker\'s selective export controls let you choose date ranges and data fields for each export independently.',
      ],
    },
    {
      h2: 'What exported files are and are not',
      paragraphs: [
        'Exported files, PDF, CSV, and JSON, are not encrypted by default. They are designed to be human-readable and clinically useful. This means that once you export a file, anyone with access to that file can read its contents. Treat exported pain reports with the same care you would give any medical document.',
        'Do not email unencrypted exports over public Wi-Fi. Do not leave printed reports in shared spaces. Do not save exports to shared cloud drives unless you intend for others to access them. If you need to transmit data electronically, use a secure messaging platform or your clinic\'s patient portal.',
      ],
    },
    {
      h2: 'Sharing with different people for different purposes',
      paragraphs: [
        'For clinicians: print a PDF and bring it to your appointment, or share it through your clinic\'s secure patient portal. Doctors prefer PDF because it prints cleanly and can be added to your chart.',
        'For insurance and WorkSafeBC: use the WorkSafeBC export template, which formats data according to documentation expectations. Share through the claims representative or your advocating lawyer, keeping a copy for your own records.',
        'For personal support including family or advocates: share only what you are comfortable sharing. A summary PDF covering a specific period may be appropriate. You are never obligated to share your complete tracking history with anyone.',
      ],
    },
    {
      h2: 'Once you share, you cannot take it back',
      paragraphs: [
        'Once you share a file, you cannot revoke access. The recipient has a copy. This is why selective exports matter: share only what is appropriate for each situation, so that no single recipient receives more than they need for the purpose at hand.',
        'Keep your own records of what you shared, with whom, and when. That audit trail helps you manage your health data disclosures over time and ensures you know exactly what information each provider or insurer has received. Your master copy always remains on your device, under your exclusive control.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Can I share just part of my pain diary?',
      answer:
        'Yes. Pain Tracker\'s export controls let you select specific date ranges and data fields. You can create different exports for different recipients, sharing only what is relevant to each situation.',
    },
    {
      question: 'Are exported files encrypted?',
      answer:
        'No. Exported PDF, CSV, and JSON files are designed to be human-readable. Handle and transmit them as you would any medical document.',
    },
    {
      question: 'What is the safest way to send my pain report to a doctor?',
      answer:
        'Print the PDF and hand it to your doctor in person. If electronic sharing is needed, use your clinic\'s secure patient portal or an encrypted messaging platform.',
    },
  ],
};

export default article;

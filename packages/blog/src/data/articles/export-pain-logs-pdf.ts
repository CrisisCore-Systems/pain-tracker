import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'export-pain-logs-pdf',
  title: 'Export Pain Logs to PDF: Share Clinical Data on Your Terms',
  description:
    'Export your pain tracking data as PDF reports for doctors, physiotherapists, and claim-related discussions. User-controlled, private, and structured for review.',
  h1: 'Export Pain Logs to PDF: Structured Reports You Control',
  cluster: 'clinical',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'A log that cannot be shared is just a journal',
      paragraphs: [
        'A pain log that cannot be shared is a personal journal. Valuable for self-awareness, limited in clinical impact. The ability to export structured pain data as a professional PDF report transforms your diary into a communication tool between you and your healthcare providers, insurance reviewers, and legal advocates.',
        'PDF is a common document format in healthcare. It prints cleanly, displays consistently across devices, and can be brought into appointments or claim-related discussions. Unlike screenshots or proprietary app formats, a PDF export is a self-contained document that stands on its own.',
      ],
    },
    {
      h2: 'What a clinical PDF report includes',
      paragraphs: [
        'Pain Tracker\'s PDF export is designed for clinical contexts, not visual appeal. The report includes a summary section with date range, total entries, average pain intensity, peak pain levels, and most common pain locations. Trend charts show pain intensity over time, giving clinicians an immediate visual overview of the tracking period.',
        'Below the summary, the report includes a medication log showing what was taken and when, functional impact data documenting the real-world effects of pain on daily activities, and individual entry details for clinicians who want to examine specific days. The layout follows medical documentation conventions: summary first, details second, in a format that healthcare providers are trained to read.',
      ],
    },
    {
      h2: 'You decide what leaves your device',
      paragraphs: [
        'Every Pain Tracker export is user-initiated. Nothing leaves your device automatically, and you control exactly what is included. Select a date range, choose which data fields appear in the report, and generate the PDF locally. The export process runs entirely in your browser. No server processes your data at any point.',
        'This control matters because different providers need different data. Your physiotherapist needs functional impact details and body location maps. Your prescribing physician needs medication-response correlations. An insurance reviewer needs consistent intensity documentation and timeline evidence. Pain Tracker lets you tailor each export to its intended audience.',
      ],
    },
    {
      h2: 'Export formats beyond PDF',
      paragraphs: [
        'While PDF is the most common choice for clinical sharing, Pain Tracker also supports CSV and JSON exports. CSV provides raw tabular data that clinicians or researchers can analyse in spreadsheet software, apply their own statistical methods, or import into clinical databases. Each row represents one entry with standardised columns.',
        'JSON export captures the complete data structure and is intended for technical backup and data portability. If you ever need to move your data to another tool or maintain a machine-readable archive, JSON preserves the full fidelity of your records including structured fields that CSV flattens.',
      ],
    },
    {
      h2: 'WorkSafeBC-specific exports',
      paragraphs: [
        'Workers\' compensation claims in British Columbia often involve documentation showing the relationship between a workplace injury and ongoing symptoms. Pain Tracker includes a WorkSafeBC export template that structures your pain data into a timeline of symptoms, functional limitations, medication records, and treatment notes.',
        'The template emphasizes timeline details linking injury dates to symptom onset, pain levels and functional limitations, medication management records, and treatment compliance notes. This structured approach can help organize records for WorkSafeBC-related documentation without guaranteeing acceptance, approval, or outcome.',
      ],
    },
    {
      h2: 'Best practices for exporting and sharing',
      paragraphs: [
        'Export before your appointment so you can review the report yourself first. Check that the date range covers the relevant period and that the data tells the story you need your provider to understand. Print the report if your clinic works with paper records, or save it to your phone for electronic sharing.',
        'Exported PDF and CSV files are not encrypted. They are designed to be human-readable. Handle them with the same care you would give any medical document. Do not email them over unsecured channels if the content is sensitive, and delete copies from shared devices after use.',
      ],
    },
  ],
};

export default article;

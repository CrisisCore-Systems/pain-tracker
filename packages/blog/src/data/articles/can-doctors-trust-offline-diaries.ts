import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'can-doctors-trust-offline-diaries',
  title: 'Can Doctors Trust Offline Pain Diaries? Yes, Here Is Why',
  description:
    'Offline pain diaries produce clinically valid data. Here is what the research shows about digital symptom tracking, and why an offline diary may actually be more reliable than a paper one.',
  h1: 'Can Doctors Trust Offline Pain Diaries?',
  cluster: 'clinical',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'The skepticism and the answer',
      paragraphs: [
        'Healthcare providers sometimes question whether patient-generated symptom data is reliable enough to inform clinical decisions. This skepticism is understandable. Patient recall is demonstrably unreliable, and self-reported data can be shaped by mood, context, and expectation. But the question is not whether patient-reported data is perfect. The question is whether it is better than the alternative: verbal recall during a brief clinic appointment, under pressure, while trying to seem credible.',
        'Research consistently answers yes. Ecological momentary assessment, recording symptoms as they occur, in the patient\'s environment, produces more accurate data than retrospective questionnaires. A structured digital diary with timestamped daily entries is far closer to real-time assessment than anything a patient can reconstruct in a waiting room.',
      ],
    },
    {
      h2: 'What clinical research shows',
      paragraphs: [
        'Studies on electronic pain diaries have shown several advantages over paper diaries: higher compliance rates, elimination of backfilling, and more accurate pain intensity data when compared against physiological markers. Digital timestamps prevent the common paper diary problem of patients filling out an entire week\'s worth of entries before the appointment.',
        'The Numerical Rating Scale used in digital diaries like PainTracker is one of the most validated pain measurement tools in clinical research. Its reliability and sensitivity to change are well established across pain conditions. Applied consistently in a structured digital format, NRS data is clinically actionable.',
      ],
    },
    {
      h2: 'Does being offline affect clinical validity?',
      paragraphs: [
        'No. The offline nature of a pain diary has no bearing on the validity of the data it captures. Pain intensity, location, quality, and functional impact are identical whether stored locally or in the cloud. What matters for clinical validity is consistency of measurement, compliance with daily entry, and the structure of what is collected.',
        'Offline diaries may actually improve compliance for some patients. No login screen. No loading spinner. No connectivity requirement. An app that works instantly, every time, in any location is more likely to be used consistently, and consistency is the foundation of clinical validity.',
      ],
    },
    {
      h2: 'Structured data vs. free-text notes',
      paragraphs: [
        'Clinicians can interpret structured data, numerical scales, categorical selections, body maps, far more efficiently than free-text narratives. A pain log with consistent numerical intensity, standardised descriptors, and timestamped entries allows a clinician to assess trends at a glance, without parsing individual writing styles.',
        'PainTracker prioritizes structured inputs for this reason. Free-text notes are available for context, but the core data points use consistent scales and categories. The data is readable, trend-analysable, and clinically interpretable. That is a design decision made in service of the appointment.',
      ],
    },
    {
      h2: 'How export quality builds clinical trust',
      paragraphs: [
        'The format in which data is presented to clinicians significantly affects how it is received. A well-organized PDF with clear charts, summary statistics, and structured data tables conveys reliability. PainTracker\'s clinical export templates present patient-generated data in a format that aligns with clinical documentation standards, because if the output does not look like something a professional produced, it may not get the attention it deserves.',
        'The export includes: date range and entry count, average and peak pain intensity, pain location frequency, medication log, functional impact trends, and individual entries for detail review. Comprehensive but organized. That combination is what makes a clinician actually use the data rather than set it aside.',
      ],
    },
    {
      h2: 'What this means for patients and clinicians',
      paragraphs: [
        'For patients: track daily, use structured inputs, and export before appointments. Consistency and honesty matter more than completeness. A brief daily entry is more valuable than a detailed weekly one. For clinicians: treat structured digital pain diaries as you would any patient-reported outcome measure, a valuable clinical data source that complements, rather than replaces, your own assessment.',
        'A patient who arrives with four weeks of structured pain data gives their clinician a richer foundation for decision-making than one who offers only a verbal summary. The data does not make the diagnosis. It makes the conversation more honest.',
      ],
    },
  ],
};

export default article;

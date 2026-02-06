import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'can-doctors-trust-offline-diaries',
  title: 'Can Doctors Trust Offline Pain Diaries? Clinical Validity Explained',
  description:
    'Explore whether offline pain diaries produce clinically valid data. Learn what research says about patient-reported outcomes and digital symptom tracking.',
  h1: 'Can Doctors Trust Offline Pain Diaries?',
  cluster: 'clinical',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'The clinical validity question',
      paragraphs: [
        'Healthcare providers sometimes question whether patient-generated symptom data is reliable enough to inform clinical decisions. This scepticism is understandable—patient recall is demonstrably unreliable, and self-reported data can be influenced by mood, expectation, and context. However, the question is not whether patient-reported data is perfect, but whether it is better than the alternative: retrospective recall in a brief clinic appointment.',
        'Research consistently answers yes. Ecological momentary assessment—recording symptoms as they occur, in the patient\'s natural environment—produces more accurate data than retrospective questionnaires. A structured digital diary that captures entries daily, with timestamped data points and consistent scales, is far closer to ecological momentary assessment than any in-office recall.',
      ],
    },
    {
      h2: 'What clinical research shows',
      paragraphs: [
        'Studies on electronic pain diaries have demonstrated several advantages over paper diaries: higher compliance rates, elimination of backfilling (entering multiple days of data at once), and more accurate pain intensity data when compared to physiological markers. Digital timestamps prevent the common paper diary problem of patients filling out a week\'s worth of entries in the waiting room before an appointment.',
        'The Numerical Rating Scale (NRS) used in digital diaries like PainTracker is one of the most validated pain measurement tools in clinical research. Its reliability and sensitivity to change are well established across pain conditions. When applied consistently in a structured digital format, NRS data is clinically actionable.',
      ],
    },
    {
      h2: 'Offline vs online: does connectivity affect validity',
      paragraphs: [
        'The offline nature of a pain diary has no bearing on its clinical validity. The data captured—pain intensity, location, quality, functional impact—is identical regardless of whether it is stored locally or in the cloud. What matters for clinical validity is consistency of measurement, compliance with daily entry, and the structure of the data collected.',
        'Offline diaries may actually improve compliance for some patients. The absence of login screens, loading delays, and connectivity requirements reduces friction that can discourage daily logging. A pain diary that works instantly, every time, in any location, is more likely to be used consistently—and consistency is the foundation of clinical validity.',
      ],
    },
    {
      h2: 'Structured data vs free-text notes',
      paragraphs: [
        'Clinicians can interpret structured data—numerical scales, categorical selections, body maps—much more efficiently than free-text narratives. A pain log with consistent numerical intensity, standardised quality descriptors, and timestamped entries allows a clinician to assess trends at a glance, without reading through pages of narrative.',
        'PainTracker prioritises structured inputs for this reason. Free-text notes are available for context, but the core data points use consistent scales and categories. This design choice directly serves clinical utility: the data is machine-readable, trend-analysable, and clinically interpretable without requiring a doctor to parse individual writing styles.',
      ],
    },
    {
      h2: 'Building trust through export quality',
      paragraphs: [
        'The format in which data is presented to clinicians significantly affects how seriously it is taken. A well-organised PDF report with clear charts, summary statistics, and structured data tables conveys professionalism and reliability. PainTracker\'s clinical export templates are designed with this in mind—they present patient-generated data in a format that aligns with clinical documentation standards.',
        'The export includes: date range and entry count, average and peak pain intensity, pain location frequency, medication log, functional impact trends, and individual entries for detailed review. This comprehensive but organised presentation gives clinicians the confidence to incorporate the data into their clinical reasoning.',
      ],
    },
    {
      h2: 'Recommendations for patients and clinicians',
      paragraphs: [
        'For patients: track daily, use structured inputs, and export reports before appointments. Consistency and honesty matter more than completeness—a brief daily entry is more valuable than a detailed weekly one. For clinicians: treat structured digital pain diaries as you would any patient-reported outcome measure—a valuable clinical data source that complements, rather than replaces, your own assessment.',
        'The goal is not to replace clinical judgement with data, but to inform it. A patient who arrives with four weeks of structured pain data gives their clinician a richer foundation for decision-making than one who offers only a verbal summary of how things have been.',
      ],
    },
  ],
};

export default article;

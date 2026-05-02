import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'pain-log-for-doctors',
  title: 'Pain Log for Doctors: Structured Documentation That Actually Gets Used',
  description:
    'A structured pain log your doctor can actually read, trust, and act on. Export timestamped PDF and CSV reports with pain intensity, medications, and real functional data.',
  h1: 'Pain Log for Doctors: Documentation Your Clinician Will Actually Use',
  cluster: 'pillar',
  isPillar: true,
  schemaTypes: ['Article', 'FAQPage'],
  sections: [
    {
      h2: 'The fifteen-minute problem',
      paragraphs: [
        'You get fifteen minutes, sometimes less. Your doctor is looking at a screen, asking how things have been. And you are trying to compress weeks of pain into language that will not sound like complaining, will not sound like exaggeration, and will actually make something happen. You know as you leave that you forgot half of it. That you said "about the same" when it has not been the same at all.',
        'Structured pain logs fix this. Not by replacing what you say, but by putting something in your doctor\'s hands before you open your mouth. A graph of your pain intensity over six weeks. A medication log with timestamps. A list of what you could and could not do on the worst days. You walk in and hand it over. The appointment becomes about decisions instead of history-taking.',
        'Specialists, rheumatologists, neurologists, pain medicine physicians, often see patients infrequently and depend entirely on between-visit documentation to assess whether treatment is working. A clean exportable log is the bridge between your daily experience and their clinical reasoning.',
      ],
    },
    {
      h2: 'What clinicians look for in pain data',
      paragraphs: [
        'Doctors reviewing pain documentation are not reading for narrative. They are looking for patterns: intensity over time, the relationship between medication changes and symptom levels, functional impacts, and potential triggers. Generic apps that record only a number on a scale produce data too thin to be useful.',
        'Pain Tracker captures multi-dimensional data per entry: numerical intensity on a 0–10 scale, body location on a visual map, pain quality descriptors, timing, duration, medications taken, functional impact scores, and free-text notes for context. That is not completeness for its own sake. That is the data clinicians actually need to make decisions.',
        'Export format matters as much as the data itself. A PDF that a physiotherapist can print and annotate. A CSV that a researcher or data-minded clinician can open in a spreadsheet. A JSON file for clinical workflows that want structured import. Pain Tracker supports all three. The formatting is designed for clinical readability, not for a marketing screenshot.',
      ],
    },
    {
      h2: 'Creating structured exports',
      paragraphs: [
        'Pain Tracker\'s export system is designed around the actual needs of Canadian healthcare providers and insurance reviewers. PDF reports include summary statistics, trend charts, medication logs, and individual entry details in a clean professional layout. The format follows documentation conventions familiar to physiotherapists and occupational health professionals so the records are easier to review.',
        'CSV exports provide raw tabular data for clinicians who want to examine patterns themselves or integrate your data into their own tracking systems. Each row is one entry, with standardised column headers, consistent date-time formatting, and values that can be sorted, filtered, or graphed.',
        'Every export is user-initiated and user-controlled. You select the date range, choose which fields appear, decide the format. Nothing is automatic. This control is not just privacy, it ensures that the data you share with each provider is relevant to that context, not everything you have ever recorded.',
      ],
    },
    {
      h2: 'WorkSafeBC and insurance documentation',
      paragraphs: [
        'Workers\' compensation claims often depend heavily on documentation. A file without structured, consistent symptom records can be harder to review. Generic pain logs often lack the structure that makes WorkSafeBC-related documentation easier to follow.',
        'Pain Tracker includes a WorkSafeBC-specific export template. The report captures pain intensity trends, medication logs, functional limitation descriptions, and a timeline that maps symptom progression to injury dates. This structured approach can help organize records without requiring reviewers to interpret long free-text narratives, but it does not guarantee acceptance, approval, or outcome.',
        'Insurance documentation requires balance: thorough enough to support the claim, but selective enough that irrelevant personal information does not enter the file. Pain Tracker\'s export controls let you include clinically relevant data while excluding private notes or entries unrelated to the claim period.',
      ],
    },
    {
      h2: 'Bridging the communication gap',
      paragraphs: [
        'The hardest part of pain management is often just this: describing something that only you can feel to someone who has never felt it. Pain is subjective. It does not photograph. It does not produce a lab value. A structured log provides a shared vocabulary, numerical scales, body maps, quality descriptors, that both you and your doctor understand, even when the experience underneath those numbers is impossible to fully communicate.',
        'Over time, a log also reveals what you could not see in real time. That your worst days follow weather fronts. That the medication helps for four hours and not six. That flares follow predictable cycles. These observations give you language and evidence to bring into appointments, and they make the conversation more productive than starting from "so how have you been."',
      ],
    },
    {
      h2: 'Consistency is what makes data useful',
      paragraphs: [
        'Clinicians value consistency. A pain log that uses the same scales, the same body map, the same entry structure every day produces comparable data points. That comparability is what makes trends visible and treatment responses measurable. Entries that vary wildly in format and detail are hard to interpret and easy to dismiss.',
        'Pain Tracker\'s structured entry interface enforces consistency without adding burden. The same fields appear in the same order every day, with sensible defaults that speed up daily logging. The design goal is consistent tracking that is easy, not tracking that requires effort for the clinician\'s benefit.',
        'Consistency also matters legally. A log that uses standardised scales and automatic timestamps is harder to challenge than handwritten notes with varying formats. The structured, timestamped nature of digital entries provides a level of documentation rigour that paper diaries cannot match.',
      ],
    },
    {
      h2: 'Preparing for appointments',
      paragraphs: [
        'Export before the appointment. Bring the PDF, printed or on your phone. Hand it to your doctor at the start of the session with two sentences: what you tracked, and what the data shows. "I tracked six weeks. My average pain was a five. The medication change brought my morning levels down but the afternoons are still high." That shifts the appointment from history-taking to decision-making.',
        'Pain Tracker\'s summary view highlights key statistics for any date range: average and peak pain, most common locations, medication patterns, functional impact trends. That at-a-glance overview gives your clinician context in seconds, leaving the rest of the appointment for the conversation that actually matters.',
      ],
    },
  ],
  faqs: [
    {
      question: 'What format should I use when sharing my pain log with a doctor?',
      answer:
        'PDF is a familiar, easy-to-share format for clinical appointments. It prints cleanly and can be added to your medical file. CSV is useful if your provider wants to analyse the data. JSON is available for technical integration.',
    },
    {
      question: 'How far back should my pain log cover for a medical appointment?',
      answer:
        'Most clinicians find 4–8 weeks useful for a follow-up assessment. For treatment effectiveness reviews, include data from before and after the intervention. Pain Tracker lets you select any date range.',
    },
    {
      question: 'Will my doctor understand the Pain Tracker export format?',
      answer:
        'Yes. Pain Tracker exports use standard 0–10 pain scales, body location mapping, and clinical terminology that healthcare providers are trained to interpret. The PDF layout follows clinical documentation conventions.',
    },
    {
      question: 'Can I use my pain log as evidence for a disability claim?',
      answer:
        'Structured, timestamped pain logs can support disability and insurance claims by providing consistent documentation of symptoms over time. Pain Tracker includes WorkSafeBC-specific export templates designed for this purpose.',
    },
  ],
};

export default article;

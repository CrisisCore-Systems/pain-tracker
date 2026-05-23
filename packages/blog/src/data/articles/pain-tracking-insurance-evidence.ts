import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'pain-tracking-insurance-evidence',
  title: 'Pain Tracking as Insurance Evidence: Document Symptoms for Claims',
  description:
    'Structured pain tracking can help organize records for insurance and workers compensation claims. Here is what documentation reviewers often look for and how to prepare clearer records.',
  h1: 'Pain Tracking as Insurance Evidence: Building Credible Documentation',
  cluster: 'clinical',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'The system does not take your word for it',
      paragraphs: [
        'Insurance and workers\' compensation claims depend on documented evidence of ongoing symptoms and functional limitations. Verbal statements, however truthful, carry less weight than consistent, timestamped records created contemporaneously with the symptoms they describe. A structured pain diary provides exactly this kind of evidence: objective, dated, and demonstrably maintained over time.',
        'Claims reviewers process hundreds of files with limited time per case. Clear, structured documentation that presents pain levels, functional impacts, medication use, and treatment compliance in an organized format is easier to review than narrative descriptions or sporadic medical records. Clear records may help claim-related discussions move more efficiently, but they do not guarantee any outcome.',
      ],
    },
    {
      h2: 'What claims reviewers are actually evaluating',
      paragraphs: [
        'Insurance adjudicators often look for specific qualities in symptom documentation: consistency over time, correlation between the claimed injury and documented symptoms, evidence of treatment compliance, and documentation of functional limitations that relate to the claimed disability level. A gap in documentation can be interpreted as a gap in symptoms, even when it simply reflects a period when tracking was too hard.',
        'Pain Tracker\'s structured format addresses each of these needs. Daily entries with consistent timestamps demonstrate ongoing symptoms. Body location mapping confirms that pain locations align with the claimed injury. Medication logs show treatment compliance. Functional impact records document the real-world consequences of pain in concrete, measurable terms.',
      ],
    },
    {
      h2: 'What makes a pain record credible',
      paragraphs: [
        'Credibility in documentation comes from three qualities: consistency, contemporaneity, and specificity. Consistent entries using the same scales and format produce data that reviewers can verify for internal coherence. Contemporaneous recording, logging symptoms as they occur rather than reconstructing them later, produces more accurate and credible data. Specific, structured entries with numerical values and categorical selections are harder to dismiss than narrative descriptions.',
        'Start tracking as soon as possible after an injury or diagnosis. Even if a claim has not been filed yet, having documentation from the earliest days of your condition can help preserve the timeline reviewers examine later. Pain Tracker makes it easy to begin tracking immediately with zero account setup and no waiting period.',
      ],
    },
    {
      h2: 'Avoiding common documentation pitfalls',
      paragraphs: [
        'Do not exaggerate symptoms in your tracking. Inconsistencies between your pain log and clinical assessments undermine credibility. Record what you actually experience, good days and bad days both. A credible pain log shows variability, because real pain conditions are variable. A log that shows constant maximum pain every single day is less credible than one that shows realistic fluctuation.',
        'Do not include emotional venting or speculative medical diagnoses in your entries. Keep entries factual and structured: what you felt, where, how intensely, what you took, what you could and could not do. The free-text notes field is for brief factual context, not for arguing your case. Let the data speak for itself.',
      ],
    },
    {
      h2: 'WorkSafeBC claim documentation',
      paragraphs: [
        'British Columbia\'s WorkSafeBC system often involves documentation linking workplace injuries to ongoing symptoms and functional limitations. Pain Tracker\'s WorkSafeBC export template organizes your data into an injury-date timeline, symptom progression, treatment records, and functional impact notes.',
        'The export emphasizes the relationship between injury and symptoms, pain levels and their functional consequences, and participation in prescribed treatment. This structured approach can help organize WorkSafeBC-related documentation, but it does not guarantee acceptance, approval, or outcome.',
      ],
    },
    {
      h2: 'What you share is your choice',
      paragraphs: [
        'When using pain tracking data for insurance claims, be selective about what you share. Export only the date range and data fields relevant to your claim. Your complete pain history may contain entries unrelated to the claim that could be misinterpreted or used to challenge your credibility.',
        'Pain Tracker\'s selective export controls let you choose exactly which data to include in each report. This approach helps you share records that are relevant to the discussion without exposing your entire health history to an insurance company\'s file.',
      ],
    },
  ],
};

export default article;

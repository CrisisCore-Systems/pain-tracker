import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'paintracker-worksafebc-claims',
  title: 'PainTracker for WorkSafeBC Claims: Document Your Workplace Injury',
  description:
    'Use PainTracker to build structured evidence for WorkSafeBC claims. Export timeline data, functional impacts, and treatment records in formats reviewers expect.',
  h1: 'PainTracker for WorkSafeBC Claims: Building Your Evidence',
  cluster: 'utility',
  isPillar: false,
  schemaTypes: ['WebPage', 'FAQPage'],
  sections: [
    {
      h2: 'Why structured documentation matters for WorkSafeBC',
      paragraphs: [
        'WorkSafeBC claims depend on documented evidence linking a workplace injury to ongoing symptoms and functional limitations. Without structured, consistent documentation, claims reviewers have only sporadic medical records and verbal statements to work with. A structured pain diary that tracks daily symptoms from the date of injury provides the continuous timeline evidence that strengthens claims and accelerates processing.',
        'Claims that include structured symptom documentation alongside medical records are easier for adjudicators to evaluate. The documentation shows that symptoms are ongoing, that you are actively managing your condition, and that the functional limitations you report are consistent with your daily tracking data.',
      ],
    },
    {
      h2: 'What to track for a WorkSafeBC claim',
      paragraphs: [
        'For WorkSafeBC documentation, focus on: daily pain intensity at the injury site, functional limitations affecting your work capacity, medications taken and their effectiveness, treatments attended (physiotherapy, specialist appointments), and any changes in your condition over time. PainTracker\'s structured entry fields capture all of these through quick, consistent daily logging.',
        'Be factual and specific. Record what you can and cannot do, not how frustrated you are. Note specific work activities you were unable to perform, how long you could sit or stand, whether you could drive, and any modifications your employer provided. This concrete functional data is what WorkSafeBC reviewers examine most carefully.',
      ],
    },
    {
      h2: 'Start tracking immediately after injury',
      paragraphs: [
        'Begin tracking on the day of your injury or as soon as possible afterward. Early documentation establishes the baseline and creates a continuous record from injury through recovery. Gaps in documentation can be interpreted as gaps in symptoms—even when they simply reflect a period when you were too overwhelmed to track.',
        'PainTracker requires no setup time. Install the app, set your passphrase, and log your first entry in under two minutes. There is no account creation, no forms to fill out, and no waiting period. This zero-friction start is especially important in the aftermath of an injury when your capacity is reduced.',
      ],
    },
    {
      h2: 'Using PainTracker exports for your claim',
      paragraphs: [
        'PainTracker includes export templates designed for WorkSafeBC documentation requirements. The export organises your data into a timeline showing symptom progression from injury date, consistent documentation of pain levels and functional limitations, medication management records, and treatment compliance evidence.',
        'Share exports with your claim representative, your treating physician, and any specialists involved in your care. Each can add PainTracker\'s structured data to their own documentation, creating a consistent narrative across all the records associated with your claim.',
      ],
    },
    {
      h2: 'Privacy protection during claims',
      paragraphs: [
        'Workers\' compensation claims involve sharing health data with your employer\'s insurer—a context that requires careful privacy management. PainTracker\'s selective export controls let you include only data relevant to your workplace injury. Your complete tracking history, including entries unrelated to the claim, remains private on your device.',
        'Because PainTracker stores data locally with no cloud backup, there is no company database that an employer or insurer can subpoena for your complete records. You control exactly what information enters your claims file, sharing only what supports your claim through deliberate, user-initiated exports.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Will WorkSafeBC accept PainTracker reports as evidence?',
      answer:
        'PainTracker exports provide structured, timestamped documentation that supports your claim alongside medical records. The data format aligns with what WorkSafeBC reviewers expect to see in symptom documentation.',
    },
    {
      question: 'Can my employer access my PainTracker data?',
      answer:
        'No. Your data is encrypted on your personal device. There is no server or database to access. You control what is shared through selective exports.',
    },
    {
      question: 'How far back should I track for a WorkSafeBC claim?',
      answer:
        'Start tracking from the date of injury and continue throughout your claim and recovery. Continuous documentation from injury date forward provides the strongest evidence of ongoing symptoms and functional limitations.',
    },
  ],
};

export default article;

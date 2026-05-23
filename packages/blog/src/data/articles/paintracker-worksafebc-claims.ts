import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'paintracker-worksafebc-claims',
  title: 'Pain Tracker for WorkSafeBC Claims: Document Your Workplace Injury',
  description:
    'WorkSafeBC claims often involve detailed documentation. Here is what to track, when to start, and how to use structured pain data to organize records for claim-related discussions.',
  h1: 'Pain Tracker for WorkSafeBC Claims: Organizing Your Records',
  cluster: 'utility',
  isPillar: false,
  schemaTypes: ['WebPage', 'FAQPage'],
  sections: [
    {
      h2: 'The system does not move without documentation',
      paragraphs: [
        'WorkSafeBC claims often involve documentation linking a workplace injury to ongoing symptoms and functional limitations. Without structured, consistent records, claim-related discussions can rely on sporadic medical records and memory. A structured pain diary tracking daily symptoms from the date of injury can help preserve a clearer timeline for later review.',
        'Structured symptom documentation alongside medical records can make claim-related discussions easier to follow. The documentation shows symptoms are ongoing, that you are actively managing your condition, and that the functional limitations you report are consistent with what you have been tracking daily.',
      ],
    },
    {
      h2: 'What to track for a WorkSafeBC claim',
      paragraphs: [
        'For WorkSafeBC documentation, focus on: daily pain intensity at the injury site, functional limitations affecting your work capacity, medications taken and their effectiveness, treatments attended including physiotherapy and specialist appointments, and any changes in your condition over time. Pain Tracker\'s structured entry fields capture all of these through quick, consistent daily logging.',
        'Be factual and specific. Record what you can and cannot do, not how frustrated you are. Note specific work activities you were unable to perform, how long you could sit or stand, whether you could drive, and any modifications your employer provided. This concrete functional data is what WorkSafeBC reviewers examine most carefully.',
      ],
    },
    {
      h2: 'Start tracking immediately after the injury',
      paragraphs: [
        'Begin tracking on the day of your injury or as soon as possible afterward. Early documentation establishes the baseline and creates a continuous record from injury through recovery. Gaps in documentation can be interpreted as gaps in symptoms, even when they simply reflect a period when you were too overwhelmed to track.',
        'Pain Tracker requires no setup time. Install the app, set your passphrase, and log your first entry in under two minutes. No account creation. No forms. No waiting period. This zero-friction start matters in the aftermath of an injury when your capacity is already reduced.',
      ],
    },
    {
      h2: 'Using Pain Tracker exports for your claim',
      paragraphs: [
        'Pain Tracker includes export templates designed for WorkSafeBC-related documentation. The export organizes your data into a timeline showing symptom progression from injury date, pain levels and functional limitations, medication records, and treatment compliance notes.',
        'Share exports with your claim representative, your treating physician, and any specialists involved in your care when it makes sense for your situation. Pain Tracker\'s structured data can help keep records more consistent across appointments and claim-related discussions, but it does not guarantee acceptance, approval, or outcome.',
      ],
    },
    {
      h2: 'Your complete history stays private',
      paragraphs: [
        'Workers\' compensation claims involve sharing health data with your employer\'s insurer, a context that requires careful privacy management. Pain Tracker\'s selective export controls let you include only data relevant to your workplace injury. Your complete tracking history, including entries unrelated to the claim, remains private on your device.',
        'Because Pain Tracker stores data locally with no cloud backup, there is no company database that an employer or insurer can subpoena for your complete records. You control exactly what information enters your claims file, sharing only what supports your claim through deliberate, user-initiated exports.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Can Pain Tracker reports help with WorkSafeBC-related documentation?',
      answer:
        'Pain Tracker exports provide structured, timestamped documentation you can bring alongside medical records. They may help organize WorkSafeBC-related documentation, but they do not guarantee acceptance, approval, or outcome.',
    },
    {
      question: 'Can my employer access my Pain Tracker data?',
      answer:
        'No. Your data is encrypted on your personal device. There is no server or database to access. You control what is shared through selective exports.',
    },
    {
      question: 'How far back should I track for a WorkSafeBC claim?',
      answer:
        'Start tracking from the date of injury and continue throughout your claim and recovery. Continuous documentation from injury date forward can help preserve a clearer record of ongoing symptoms and functional limitations.',
    },
  ],
};

export default article;

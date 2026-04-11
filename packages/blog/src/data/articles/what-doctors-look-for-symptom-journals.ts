import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'what-doctors-look-for-symptom-journals',
  title: 'What Doctors Look For in Symptom Journals: A Clinical Perspective',
  description:
    'Doctors reviewing symptom journals are looking for patterns, not narratives. Here is exactly what makes a pain journal clinically useful, from someone who has had to prove their pain in a room.',
  h1: 'What Doctors Look For in Symptom Journals',
  cluster: 'clinical',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'What a symptom journal actually buys you in the room',
      paragraphs: [
        'Time is the scarcest resource in clinical medicine. A typical pain management appointment lasts fifteen to twenty minutes, and most of that time gets consumed by history-taking: what has changed since the last visit, how medications are working, what activities are affected. A well-structured symptom journal pre-answers those questions. The clinician spends less time reconstructing your history and more time discussing what to do about it.',
        'Beyond efficiency, symptom journals provide longitudinal data that clinic visits cannot capture. A doctor sees a snapshot. A journal shows the whole film. Trends in pain intensity, response to medication changes, and functional trajectory over weeks or months give clinicians the context they need to make confident treatment decisions. One number in one appointment tells them almost nothing.',
      ],
    },
    {
      h2: 'The data clinicians find most useful',
      paragraphs: [
        'Pain intensity trends are the first thing most clinicians examine. Is the patient getting better, staying the same, or getting worse? A graph or summary showing average daily pain over the past four to eight weeks answers that immediately. PainTracker\'s summary statistics and trend visualisations provide exactly this at-a-glance assessment.',
        'Medication-response correlation is the second most valuable dataset. Clinicians need to know whether a prescribed medication is actually helping, and structured tracking that shows pain levels before and after medication changes provides objective evidence that memory cannot reliably supply. Recording medication timing alongside symptom timing also reveals pharmacokinetic patterns, like afternoon pain increases as morning medication wears off.',
        'Functional impact documentation is what separates a clinically useful journal from a simple pain log. Recording what activities you could and could not do, how long you could sit or stand, whether you missed work, and how pain affected your sleep gives clinicians and insurance reviewers the functional picture they need to justify treatment decisions and support claims.',
      ],
    },
    {
      h2: 'Format and readability matter more than you think',
      paragraphs: [
        'Clinicians are trained to process structured information quickly. A PDF with a clear summary at the top, trend charts in the middle, and detailed entries below follows the medical documentation pattern that providers are accustomed to reading. Narrative-style journals or disorganised lists require more cognitive effort and are less likely to be fully reviewed during a pressured appointment.',
        'PainTracker\'s export templates follow this clinical structure by design. Summary statistics, visual trends, and structured entries are organised in a hierarchy that matches clinical reading patterns. The formatting is clean and professional, designed to be taken seriously in medical contexts.',
      ],
    },
    {
      h2: 'Common mistakes that undermine a symptom journal',
      paragraphs: [
        'The most common mistake is inconsistency. Entries that vary wildly in detail, frequency, and format are difficult to interpret. A journal with daily entries for a week, then a gap, then three exhaustive entries is harder to trust than one with simple daily entries throughout. Even minimal daily entries produce better trend data than sporadic detailed ones.',
        'Another common mistake is tracking only pain intensity without functional context. A string of 7, 6, 7, 8, 6 tells a clinician very little without knowing what those numbers meant in your life. Did a 6 mean you could work normally, or were you in bed? The number alone does not say.',
        'Over-reporting can also be a problem. A journal that records every sensation, thought, and event becomes unreadable for a busy clinician. Focus on clinically relevant data: intensity, location, quality, medications, function, and notable triggers. PainTracker\'s structured interface naturally prevents over-reporting by constraining entries to relevant fields.',
      ],
    },
    {
      h2: 'How to walk into an appointment with data and use it',
      paragraphs: [
        'Export your data for the relevant period, typically four to eight weeks for a follow-up appointment, or as long as possible for an initial consultation. Review the summary yourself before the appointment so you can highlight key points verbally while your doctor reads.',
        'Bring the report printed if possible, or have it ready as a PDF on your phone. Offer it at the start of the appointment with a brief verbal summary. Something like: "I tracked my pain for six weeks. My average is about a five, but it spikes on days after I sit for long periods. The medication change last month brought my morning pain down from seven to four." That combination of structured data and concise verbal context is exactly what clinicians need to shift the appointment into actually useful territory.',
      ],
    },
  ],
};

export default article;

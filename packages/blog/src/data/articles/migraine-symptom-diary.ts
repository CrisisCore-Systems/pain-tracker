import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'migraine-symptom-diary',
  title: 'Migraine Symptom Diary: Track Attacks, Triggers, and Treatment Response',
  description:
    'A migraine diary that captures attack frequency, triggers, aura symptoms, and medication effectiveness. The data your neurologist needs to actually adjust your treatment.',
  h1: 'Migraine Symptom Diary: Structured Tracking for Better Management',
  cluster: 'chronic',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'You cannot manage what you cannot see',
      paragraphs: [
        'Migraine management relies on pattern recognition. Attack frequency, duration, severity, associated symptoms, and treatment response are all data points that guide clinical decisions about preventive medications, acute treatments, and lifestyle changes. Without consistent tracking, both you and your neurologist are making decisions from incomplete and inaccurate recall. Memory during a migraine is not a reliable instrument.',
        'A migraine diary also provides evidence for diagnosis. The International Classification of Headache Disorders uses attack frequency, duration, and symptom characteristics to distinguish migraine subtypes and separate migraine from other headache disorders. Structured tracking data supports accurate diagnosis. Without it, you are describing something to a clinician who needs to measure it.',
      ],
    },
    {
      h2: 'What to track during and between attacks',
      paragraphs: [
        'For each attack: onset time, pain intensity at peak, pain location, associated symptoms including nausea, photophobia, phonophobia, aura, duration until resolution, and acute medications taken with their timing and effectiveness. Pain Tracker captures all of these through taps and selections rather than typing, because the last thing you can manage during an attack is forming sentences.',
        'Between attacks: sleep patterns, dietary factors, weather changes, hormonal timing, stress levels, and physical activity. Consistent tracking between attacks is where trigger patterns emerge. You cannot identify a trigger retrospectively if you only recorded the attack itself. A month of daily tracking typically reveals two or three triggers you can then test systematically.',
      ],
    },
    {
      h2: 'Watching your medication actually work or not work',
      paragraphs: [
        'Preventive migraine medications can take weeks or months to show full effect, and subtle changes in attack frequency or severity are nearly imperceptible without tracking data. A structured diary that records attacks alongside medication history provides the objective before-and-after comparison you and your prescriber need to assess whether a treatment is doing anything.',
        'Acute medication tracking is equally important. Recording what you took, when you took it relative to attack onset, and how effectively it relieved symptoms helps optimise your acute treatment strategy. Many people discover through tracking that they are consistently medicating too late for optimal effectiveness. That is a pattern easy to correct once you can see it.',
      ],
    },
    {
      h2: 'The prodrome and what comes before',
      paragraphs: [
        'Many migraineurs experience prodromal symptoms, mood changes, food cravings, neck stiffness, yawning, hours or days before an attack. Tracking these pre-attack symptoms alongside attacks can help you recognise warning signs earlier, potentially allowing pre-emptive treatment or at least preparation.',
        'Seasonal patterns, menstrual cycle correlations, and weather-related triggers also emerge from longitudinal tracking. Pain Tracker\'s local analytics can highlight these temporal patterns without sending your sensitive health data anywhere. An important consideration when tracking involves hormonal and mental health data alongside pain.',
      ],
    },
    {
      h2: 'Sharing migraine data with your neurologist',
      paragraphs: [
        'Neurologists managing migraine patients want concise, structured data: attack frequency per month, average severity, medication use patterns, and any changes in headache characteristics. Pain Tracker\'s PDF export provides this clinical summary with trend charts that show attack patterns over time.',
        'If you are being evaluated for chronic migraine, fifteen or more headache days per month, a detailed diary is not just helpful. It is diagnostically necessary. Three months of consistent tracking provides the evidence your neurologist needs to confirm diagnosis, justify treatment changes, or support referrals to headache specialty centres.',
      ],
    },
  ],
};

export default article;

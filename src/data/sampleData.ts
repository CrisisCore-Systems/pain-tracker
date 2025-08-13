/**
 * Sample data for demonstration and onboarding
 */

import type { PainEntry } from '../types';

export const samplePainEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    baselineData: {
      pain: 6,
      locations: ['Lower Back', 'Right Leg'],
      symptoms: ['Sharp pain', 'Stiffness', 'Numbness'],
    },
    functionalImpact: {
      limitedActivities: ['Walking', 'Sitting for long periods'],
      assistanceNeeded: ['Getting dressed'],
      mobilityAids: [],
    },
    medications: {
      current: ['Ibuprofen 400mg'],
      changes: 'Started taking ibuprofen twice daily',
      effectiveness: 'Moderate relief for 2-3 hours',
    },
    treatments: {
      recent: ['Physiotherapy'],
      effectiveness: 'Some improvement in flexibility',
      planned: ['Follow-up with specialist'],
    },
    qualityOfLife: {
      sleepQuality: 4,
      moodImpact: 5,
      socialImpact: ['Cancelled dinner with friends'],
    },
    workImpact: {
      missedWork: 1,
      modifiedDuties: ['Working from home'],
      workLimitations: ['Cannot lift heavy items'],
    },
    comparison: {
      worseningSince: 'Last week after moving boxes',
      newLimitations: ['Difficulty with stairs'],
    },
    notes: 'Pain started after helping friends move. Worse in the morning and when sitting too long.',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    baselineData: {
      pain: 4,
      locations: ['Lower Back'],
      symptoms: ['Dull ache', 'Stiffness'],
    },
    functionalImpact: {
      limitedActivities: ['Prolonged standing'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: ['Ibuprofen 400mg'],
      changes: 'Reduced to once daily',
      effectiveness: 'Good relief, lasts 4-5 hours',
    },
    treatments: {
      recent: ['Heat therapy', 'Gentle stretching'],
      effectiveness: 'Heat helps significantly',
      planned: ['Continue physiotherapy'],
    },
    qualityOfLife: {
      sleepQuality: 6,
      moodImpact: 7,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['Standing desk option'],
      workLimitations: ['Avoid lifting over 10kg'],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Improvement noticed. Heat pack in the morning really helps. Stretching exercises from physio are effective.',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    baselineData: {
      pain: 3,
      locations: ['Lower Back'],
      symptoms: ['Mild stiffness'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: ['Ibuprofen 400mg as needed'],
      changes: 'Only taking when pain increases',
      effectiveness: 'Good when needed',
    },
    treatments: {
      recent: ['Physiotherapy', 'Regular walking'],
      effectiveness: 'Significant improvement in mobility',
      planned: ['Gradually increase activity level'],
    },
    qualityOfLife: {
      sleepQuality: 8,
      moodImpact: 8,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: ['Still cautious with heavy lifting'],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Much better! Can walk for 30 minutes without discomfort. Sleep quality improved significantly.',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    baselineData: {
      pain: 2,
      locations: ['Lower Back'],
      symptoms: ['Occasional stiffness'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [],
      changes: 'Stopped regular medication',
      effectiveness: 'No longer needed for daily activities',
    },
    treatments: {
      recent: ['Physiotherapy', 'Regular exercise routine'],
      effectiveness: 'Excellent progress',
      planned: ['Maintain current exercise routine'],
    },
    qualityOfLife: {
      sleepQuality: 9,
      moodImpact: 9,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Feeling great! Back to normal activities. Continuing exercises to prevent future issues.',
  },
];

export const walkthroughSteps = [
  {
    target: '[data-walkthrough="pain-entry-form"]',
    title: 'Record Your Pain',
    content: 'Start by recording your current pain level, location, and symptoms. This form is designed to be quick and comprehensive.',
    placement: 'right' as const,
    action: 'Try entering a pain level using the slider'
  },
  {
    target: '[data-walkthrough="pain-chart"]',
    title: 'Visualize Your Progress',
    content: 'Your entries are automatically charted here, helping you spot patterns and track improvements over time.',
    placement: 'left' as const,
  },
  {
    target: '[data-walkthrough="wcb-report"]',
    title: 'Generate Reports',
    content: 'When needed, generate professional reports for healthcare providers or WorkSafe BC submissions.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-walkthrough="pain-history"]',
    title: 'Review Your History',
    content: 'Access detailed views of all your pain entries, with filtering and search capabilities.',
    placement: 'top' as const,
  }
];

export const helpSections = {
  painEntry: [
    {
      title: 'Pain Scale Guide',
      content: 'Use 0 for no pain, 1-3 for mild pain, 4-6 for moderate pain, and 7-10 for severe pain. Be consistent with your personal scale.',
      type: 'info' as const
    },
    {
      title: 'Location Accuracy',
      content: 'Be as specific as possible with pain location. This helps identify patterns and aids medical professionals.',
      type: 'tip' as const
    },
    {
      title: 'Symptom Tracking',
      content: 'Include all relevant symptoms, not just pain. Things like stiffness, numbness, or weakness are important.',
      type: 'tip' as const
    }
  ],
  medications: [
    {
      title: 'Medication Safety',
      content: 'Always follow prescribed dosages and consult healthcare providers before making changes.',
      type: 'warning' as const
    },
    {
      title: 'Track Effectiveness',
      content: 'Note how well medications work and for how long. This information is valuable for your doctor.',
      type: 'info' as const
    }
  ]
};
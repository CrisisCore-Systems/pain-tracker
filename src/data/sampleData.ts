/**
 * Sample data for demonstration and onboarding
 */

import type { PainEntry } from '../types';

export const samplePainEntries: PainEntry[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago - Initial severe episode
    baselineData: {
      pain: 9,
      locations: ['Lower Back', 'Right Leg', 'Right Hip'],
      symptoms: ['Sharp pain', 'Shooting pain', 'Numbness', 'Tingling', 'Muscle spasms'],
    },
    functionalImpact: {
      limitedActivities: ['Walking', 'Sitting', 'Standing', 'Bending', 'Lifting'],
      assistanceNeeded: ['Getting dressed', 'Preparing meals', 'Personal care'],
      mobilityAids: ['Cane'],
    },
    medications: {
      current: [{
        name: 'Naproxen',
        dosage: '500mg',
        frequency: 'Twice daily',
        effectiveness: 'Minimal relief, takes edge off'
      }, {
        name: 'Cyclobenzaprine',
        dosage: '10mg',
        frequency: 'At bedtime',
        effectiveness: 'Helps with muscle spasms but causes drowsiness'
      }],
      changes: 'Started muscle relaxant for spasms',
      effectiveness: 'Minimal relief, takes edge off',
    },
    treatments: {
      recent: [{
        type: 'Emergency room visit',
        provider: 'General Hospital',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'X-rays taken, muscle relaxant prescribed'
      }],
      effectiveness: 'X-rays taken, muscle relaxant prescribed',
      planned: ['MRI scheduled', 'Specialist referral pending'],
    },
    qualityOfLife: {
      sleepQuality: 2,
      moodImpact: 2,
      socialImpact: ['Cancelled all social activities', 'Unable to attend family gathering', 'Isolated at home'],
    },
    workImpact: {
      missedWork: 5,
      modifiedDuties: [],
      workLimitations: ['Complete work stoppage'],
    },
    comparison: {
      worseningSince: 'Sudden onset three weeks ago after lifting incident',
      newLimitations: ['Cannot drive', 'Cannot sit for more than 10 minutes', 'Need assistance with ADLs'],
    },
    notes: 'Severe pain episode began suddenly while lifting heavy box at work. Sharp shooting pain down right leg. Cannot find comfortable position. Sleep severely impacted.',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
    baselineData: {
      pain: 8,
      locations: ['Lower Back', 'Right Leg'],
      symptoms: ['Sharp pain', 'Numbness', 'Stiffness', 'Weakness in leg'],
    },
    functionalImpact: {
      limitedActivities: ['Walking more than 5 minutes', 'Sitting', 'Standing for long periods'],
      assistanceNeeded: ['Getting dressed', 'Bathing'],
      mobilityAids: ['Cane'],
    },
    medications: {
      current: [{
        name: 'Naproxen',
        dosage: '500mg',
        frequency: 'Twice daily',
        effectiveness: 'Slight improvement with inflammation'
      }, {
        name: 'Cyclobenzaprine',
        dosage: '10mg',
        frequency: 'At bedtime',
        effectiveness: 'Helps with sleep'
      }],
      changes: 'Continuing current regimen',
      effectiveness: 'Slight improvement with inflammation',
    },
    treatments: {
      recent: [{
        type: 'Family doctor follow-up',
        provider: 'Dr. Smith, Family Medicine',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'Monitoring progress, continuing meds'
      }],
      effectiveness: 'Monitoring progress, continuing meds',
      planned: ['MRI in 2 weeks', 'Physiotherapy referral'],
    },
    qualityOfLife: {
      sleepQuality: 3,
      moodImpact: 3,
      socialImpact: ['Still mostly homebound', 'Limited phone contact with friends'],
    },
    workImpact: {
      missedWork: 8,
      modifiedDuties: [],
      workLimitations: ['Still off work'],
    },
    comparison: {
      worseningSince: 'Slight improvement from initial episode',
      newLimitations: ['Still dependent on cane'],
    },
    notes: 'Slightly less severe than initial episode but still very limiting. Ice and heat provide temporary relief. Resting as much as possible.',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago - Starting to improve
    baselineData: {
      pain: 7,
      locations: ['Lower Back', 'Right Leg'],
      symptoms: ['Dull ache', 'Sharp pain with movement', 'Stiffness', 'Numbness'],
    },
    functionalImpact: {
      limitedActivities: ['Walking', 'Sitting for long periods', 'Bending'],
      assistanceNeeded: ['Some assistance with dressing'],
      mobilityAids: ['Cane for longer distances'],
    },
    medications: {
      current: [{
        name: 'Naproxen',
        dosage: '500mg',
        frequency: 'Twice daily',
        effectiveness: 'Noticeable reduction in inflammation'
      }, {
        name: 'Cyclobenzaprine',
        dosage: '5mg',
        frequency: 'At bedtime',
        effectiveness: 'Reduced dosage, still helps with sleep'
      }],
      changes: 'Reduced muscle relaxant dosage',
      effectiveness: 'Noticeable reduction in inflammation',
    },
    treatments: {
      recent: [{
        type: 'Initial physiotherapy assessment',
        provider: 'Active Recovery Physiotherapy',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'Assessment completed, treatment plan developed'
      }],
      effectiveness: 'Assessment completed, treatment plan developed',
      planned: ['Physiotherapy twice weekly', 'MRI next week'],
    },
    qualityOfLife: {
      sleepQuality: 4,
      moodImpact: 4,
      socialImpact: ['Short visit with close friend', 'Still avoiding most activities'],
    },
    workImpact: {
      missedWork: 11,
      modifiedDuties: [],
      workLimitations: ['Still off work, considering modified return'],
    },
    comparison: {
      worseningSince: 'Gradual improvement noted',
      newLimitations: [],
    },
    notes: 'Starting to see improvement. Physiotherapy assessment went well. Have hope that treatment will help. Still need to be very careful with movements.',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
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
      current: [{
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Twice daily',
        effectiveness: 'Moderate relief for 2-3 hours'
      }],
      changes: 'Started taking ibuprofen twice daily',
      effectiveness: 'Moderate relief for 2-3 hours',
    },
    treatments: {
      recent: [{
        type: 'Physiotherapy',
        provider: 'City Physiotherapy Clinic',
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'Some improvement in flexibility'
      }],
      effectiveness: 'Some improvement in flexibility',
      planned: ['Follow-up with specialist', 'Continue physiotherapy'],
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
    notes: 'Pain manageable with rest and medication. Worse in the morning and when sitting too long. Physiotherapy exercises helping.',
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    baselineData: {
      pain: 5,
      locations: ['Lower Back', 'Right Hip'],
      symptoms: ['Dull ache', 'Stiffness', 'Tightness'],
    },
    functionalImpact: {
      limitedActivities: ['Prolonged sitting', 'Heavy lifting'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [{
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Twice daily',
        effectiveness: 'Good relief for 3-4 hours'
      }, {
        name: 'Acetaminophen',
        dosage: '500mg',
        frequency: 'As needed for breakthrough pain',
        effectiveness: 'Helps with mild pain'
      }],
      changes: 'Added acetaminophen for breakthrough pain',
      effectiveness: 'Good relief for 3-4 hours',
    },
    treatments: {
      recent: [
        {
          type: 'Physiotherapy',
          provider: 'Active Recovery Physiotherapy',
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Learning proper posture and body mechanics'
        },
        {
          type: 'Massage therapy',
          provider: 'Wellness Massage Clinic',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Significant relief of muscle tension'
        }
      ],
      effectiveness: 'Learning proper posture and body mechanics',
      planned: ['Continue physiotherapy', 'Weekly massage'],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 6,
      socialImpact: ['Short coffee meeting with colleague'],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['Working from home', 'Flexible schedule'],
      workLimitations: ['No lifting over 5kg', 'Frequent position changes needed'],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Continuing to improve. Massage therapy provided excellent relief. Learning to pace activities and take frequent breaks.',
  },
  {
    id: 6,
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
      current: [{
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Once daily',
        effectiveness: 'Good relief, lasts 4-5 hours'
      }],
      changes: 'Reduced to once daily',
      effectiveness: 'Good relief, lasts 4-5 hours',
    },
    treatments: {
      recent: [
        {
          type: 'Heat therapy',
          provider: 'Self-administered',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Heat helps significantly'
        },
        {
          type: 'Gentle stretching',
          provider: 'Self-administered',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Good improvement in mobility'
        }
      ],
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
    id: 7,
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
      current: [{
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        effectiveness: 'Good when needed'
      }],
      changes: 'Only taking when pain increases',
      effectiveness: 'Good when needed',
    },
    treatments: {
      recent: [
        {
          type: 'Physiotherapy',
          provider: 'City Physiotherapy Clinic',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Significant improvement in mobility'
        },
        {
          type: 'Regular walking',
          provider: 'Self-administered',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Improved overall fitness'
        }
      ],
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
    id: 8,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday - Good progress
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
      recent: [
        {
          type: 'Physiotherapy',
          provider: 'City Physiotherapy Clinic',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Excellent progress'
        },
        {
          type: 'Regular exercise routine',
          provider: 'Self-administered',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Maintaining strength and flexibility'
        }
      ],
      effectiveness: 'Excellent progress',
      planned: ['Maintain current exercise routine', 'Discharge from physiotherapy pending'],
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
    notes: 'Feeling great! Back to normal activities. Continuing exercises to prevent future issues. Ready to return to full duties at work.',
  },
  // Additional diverse scenarios covering different pain patterns
  {
    id: 9,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago - Neck pain
    baselineData: {
      pain: 7,
      locations: ['Neck', 'Right Shoulder', 'Upper Back'],
      symptoms: ['Sharp pain with movement', 'Headaches', 'Stiffness', 'Muscle tension'],
    },
    functionalImpact: {
      limitedActivities: ['Driving', 'Computer work', 'Looking down', 'Turning head'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [{
        name: 'Naproxen',
        dosage: '220mg',
        frequency: 'Twice daily',
        effectiveness: 'Moderate relief of inflammation'
      }],
      changes: 'Started anti-inflammatory for neck pain',
      effectiveness: 'Moderate relief of inflammation',
    },
    treatments: {
      recent: [{
        type: 'Chiropractic adjustment',
        provider: 'Downtown Chiropractic',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        effectiveness: 'Some immediate relief but pain returns'
      }],
      effectiveness: 'Some immediate relief but pain returns',
      planned: ['Follow-up chiropractic care', 'Ergonomic assessment at work'],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 5,
      socialImpact: ['Avoiding driving to social events'],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['Ergonomic workstation setup', 'Frequent breaks from computer'],
      workLimitations: ['Limited computer time', 'Cannot attend in-person meetings requiring travel'],
    },
    comparison: {
      worseningSince: 'Started one month ago, possibly from poor posture at new desk',
      newLimitations: ['Difficulty with prolonged computer use'],
    },
    notes: 'Neck pain from desk work. Tension headaches frequent. Need better ergonomic setup. Chiropractic providing some relief.',
  },
  {
    id: 10,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago - Knee pain
    baselineData: {
      pain: 5,
      locations: ['Right Knee', 'Left Knee'],
      symptoms: ['Swelling', 'Dull ache', 'Stiffness', 'Clicking sound'],
    },
    functionalImpact: {
      limitedActivities: ['Stairs', 'Running', 'Squatting', 'Kneeling'],
      assistanceNeeded: [],
      mobilityAids: ['Knee brace for support'],
    },
    medications: {
      current: [{
        name: 'Ibuprofen',
        dosage: '600mg',
        frequency: 'Three times daily with food',
        effectiveness: 'Reduces swelling and pain'
      }],
      changes: 'Increased dosage for knee inflammation',
      effectiveness: 'Reduces swelling and pain',
    },
    treatments: {
      recent: [
        {
          type: 'Physiotherapy',
          provider: 'Sports Medicine Clinic',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Strengthening exercises prescribed'
        },
        {
          type: 'Ice therapy',
          provider: 'Self-administered',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          effectiveness: 'Helps with swelling after activity'
        }
      ],
      effectiveness: 'Strengthening exercises prescribed',
      planned: ['Continue physiotherapy', 'Possible injection if no improvement'],
    },
    qualityOfLife: {
      sleepQuality: 7,
      moodImpact: 6,
      socialImpact: ['Modified participation in recreational activities'],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['Seated work when possible'],
      workLimitations: ['Avoid prolonged standing', 'No ladder climbing'],
    },
    comparison: {
      worseningSince: 'Gradual onset over past 6 months',
      newLimitations: ['Cannot participate in running club'],
    },
    notes: 'Bilateral knee pain from overuse. Need to strengthen supporting muscles. Ice after activity helps. Considering cortisone injection if PT does not help.',
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
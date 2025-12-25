import type { PainEntry } from '../../src/types';

export const WCB_SAMPLE_ENTRIES: PainEntry[] = [
  {
    id: 'sample-001',
    timestamp: '2025-10-02T07:45:00.000Z',
    baselineData: {
      pain: 6,
      locations: ['Lower back', 'Left hip'],
      symptoms: ['stiffness', 'radiating pain'],
    },
    functionalImpact: {
      limitedActivities: ['lifting', 'prolonged sitting'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'NSAID (example)',
          dosage: 'as directed',
          frequency: 'as needed',
          effectiveness: 'partial relief',
        },
      ],
      changes: 'No medication changes this period (synthetic).',
      effectiveness: 'Partial relief reported (synthetic).',
    },
    treatments: {
      recent: [
        {
          type: 'physiotherapy',
          provider: 'Clinic (synthetic)',
          date: '2025-09-30',
          effectiveness: 'helpful',
        },
      ],
      effectiveness: 'Improving gradually (synthetic).',
      planned: ['home exercises', 'follow-up physiotherapy'],
    },
    qualityOfLife: {
      sleepQuality: 5,
      moodImpact: 4,
      socialImpact: ['reduced outings'],
    },
    workImpact: {
      missedWork: 1,
      modifiedDuties: ['no lifting > 10lb', 'shorter seated intervals'],
      workLimitations: ['lifting', 'prolonged sitting'],
    },
    comparison: {
      worseningSince: '2025-09-15',
      newLimitations: ['prolonged sitting'],
    },
    notes:
      'Synthetic entry. No real patient data. Example patterns only for demonstration.',
  },
  {
    id: 'sample-002',
    timestamp: '2025-10-09T17:20:00.000Z',
    baselineData: {
      pain: 5,
      locations: ['Lower back'],
      symptoms: ['stiffness'],
    },
    functionalImpact: {
      limitedActivities: ['lifting'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'NSAID (example)',
          dosage: 'as directed',
          frequency: 'as needed',
          effectiveness: 'partial relief',
        },
      ],
      changes: 'Reduced use compared to prior week (synthetic).',
      effectiveness: 'Partial relief reported (synthetic).',
    },
    treatments: {
      recent: [
        {
          type: 'physiotherapy',
          provider: 'Clinic (synthetic)',
          date: '2025-10-07',
          effectiveness: 'helpful',
        },
      ],
      effectiveness: 'Steady improvement (synthetic).',
      planned: ['continue home exercises'],
    },
    qualityOfLife: {
      sleepQuality: 6,
      moodImpact: 3,
      socialImpact: ['limited activities after work'],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['no lifting > 10lb'],
      workLimitations: ['lifting'],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes:
      'Synthetic entry. Demonstrates slight improvement with consistent treatment.',
  },
  {
    id: 'sample-003',
    timestamp: '2025-10-16T08:10:00.000Z',
    baselineData: {
      pain: 4,
      locations: ['Lower back'],
      symptoms: ['mild stiffness'],
    },
    functionalImpact: {
      limitedActivities: ['lifting'],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'NSAID (example)',
          dosage: 'as directed',
          frequency: 'rare',
          effectiveness: 'helpful',
        },
      ],
      changes: 'Less frequent use (synthetic).',
      effectiveness: 'Helpful when used (synthetic).',
    },
    treatments: {
      recent: [
        {
          type: 'physiotherapy',
          provider: 'Clinic (synthetic)',
          date: '2025-10-14',
          effectiveness: 'helpful',
        },
      ],
      effectiveness: 'Improving (synthetic).',
      planned: ['increase walking duration gradually'],
    },
    qualityOfLife: {
      sleepQuality: 7,
      moodImpact: 2,
      socialImpact: ['improved participation'],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: ['no lifting > 20lb'],
      workLimitations: ['lifting'],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes:
      'Synthetic entry. Example: lower pain, improved sleep and function over time.',
  },
];

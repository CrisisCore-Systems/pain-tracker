/**
 * Sample data for demonstration and onboarding
 * Comprehensive dataset spanning 60 days with diverse scenarios
 */

import type { PainEntry } from '../types';
import { comprehensiveSampleData } from './comprehensive-sample-data';

// Export the comprehensive dataset as the default sample data
export const samplePainEntries: PainEntry[] = comprehensiveSampleData;

export const walkthroughSteps = [
  {
    target: '[data-walkthrough="pain-entry-form"]',
    title: 'Record Your Pain',
    content:
      'Start by recording your current pain level, location, and symptoms. This form is designed to be quick and comprehensive.',
    placement: 'right' as const,
    action: 'Try entering a pain level using the slider',
  },
  {
    target: '[data-walkthrough="pain-chart"]',
    title: 'Visualize Your Progress',
    content:
      'Your entries are automatically charted here, helping you spot patterns and track improvements over time.',
    placement: 'left' as const,
  },
  {
    target: '[data-walkthrough="wcb-report"]',
    title: 'Generate Reports',
    content:
      'When needed, generate professional reports for healthcare providers or WorkSafe BC submissions.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-walkthrough="pain-history"]',
    title: 'Review Your History',
    content:
      'Access detailed views of all your pain entries, with filtering and search capabilities.',
    placement: 'top' as const,
  },
];

export const helpSections = {
  painEntry: [
    {
      title: 'Pain Scale Guide',
      content:
        'Use 0 for no pain, 1-3 for mild pain, 4-6 for moderate pain, and 7-10 for severe pain. Be consistent with your personal scale.',
      type: 'info' as const,
    },
    {
      title: 'Location Accuracy',
      content:
        'Be as specific as possible with pain location. This helps identify patterns and aids medical professionals.',
      type: 'tip' as const,
    },
    {
      title: 'Symptom Tracking',
      content:
        'Include all relevant symptoms, not just pain. Things like stiffness, numbness, or weakness are important.',
      type: 'tip' as const,
    },
  ],
  medications: [
    {
      title: 'Medication Safety',
      content:
        'Always follow prescribed dosages and consult healthcare providers before making changes.',
      type: 'warning' as const,
    },
    {
      title: 'Track Effectiveness',
      content:
        'Note how well medications work and for how long. This information is valuable for your doctor.',
      type: 'info' as const,
    },
  ],
};

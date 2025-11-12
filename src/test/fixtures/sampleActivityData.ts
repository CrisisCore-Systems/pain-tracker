/**
 * Comprehensive activity and functional test data
 * Covers diverse activity scenarios and functional impacts
 */

import type { Activity, ActivityLogEntry } from '../../../types';

/**
 * Sample activity entries covering various scenarios
 */
export const sampleActivities: Activity[] = [
  // Physical activities
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Walking',
    duration: 30,
    painLevel: 2,
    notes: 'Morning walk in the park, felt good',
  },
  {
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Physiotherapy exercises',
    duration: 20,
    painLevel: 3,
    notes: 'Core strengthening routine, slight discomfort but manageable',
  },
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Swimming',
    duration: 45,
    painLevel: 1,
    notes: 'Gentle swimming laps, no pain during activity',
  },
  {
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Stretching',
    duration: 15,
    painLevel: 2,
    notes: 'Morning yoga routine, improved flexibility',
  },
  {
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Cycling',
    duration: 25,
    painLevel: 3,
    notes: 'Stationary bike, some lower back stiffness after',
  },

  // Work-related activities
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Desk work',
    duration: 240,
    painLevel: 4,
    notes: 'Full work day, took breaks every hour, pain increased toward end of day',
  },
  {
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Standing meetings',
    duration: 90,
    painLevel: 3,
    notes: 'Back-to-back meetings, standing desk helped',
  },
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Computer work',
    duration: 180,
    painLevel: 3,
    notes: 'Focused work session with ergonomic setup',
  },

  // Daily living activities
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Household chores',
    duration: 60,
    painLevel: 4,
    notes: 'Vacuuming and laundry, pain increased with bending',
  },
  {
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Grocery shopping',
    duration: 45,
    painLevel: 3,
    notes: 'Used cart for support, manageable',
  },
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Cooking',
    duration: 30,
    painLevel: 2,
    notes: 'Prepared meal while taking sitting breaks',
  },
  {
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Gardening',
    duration: 60,
    painLevel: 5,
    notes: 'Weeding and planting, significant pain from bending, took ibuprofen after',
  },

  // Social activities
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Social visit',
    duration: 120,
    painLevel: 2,
    notes: 'Coffee with friends, sat in comfortable chairs',
  },
  {
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Family dinner',
    duration: 90,
    painLevel: 3,
    notes: 'Dinner at sister\'s house, needed to stand and move around periodically',
  },
  {
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Movie theater',
    duration: 150,
    painLevel: 5,
    notes: 'Prolonged sitting caused significant discomfort, brought cushion',
  },

  // Rest and recovery activities
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Rest',
    duration: 60,
    painLevel: 1,
    notes: 'Afternoon rest with heat pack, very helpful',
  },
  {
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Meditation',
    duration: 20,
    painLevel: 2,
    notes: 'Mindfulness meditation, helped with pain perception',
  },
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Ice therapy',
    duration: 15,
    painLevel: 4,
    notes: 'Applied ice after exercise, reduced inflammation',
  },

  // Activities with varying pain levels
  {
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Walking',
    duration: 10,
    painLevel: 8,
    notes: 'Short walk during severe flare-up, very difficult',
  },
  {
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Lifting',
    duration: 5,
    painLevel: 9,
    notes: 'Attempted to lift box at work - INCIDENT that triggered injury',
  },
  {
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Running',
    duration: 30,
    painLevel: 0,
    notes: 'Morning run before injury, no pain',
  },
];

/**
 * Activity log entries with more detailed tracking
 */
export const sampleActivityLogs: ActivityLogEntry[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Exercise',
    activityName: 'Physiotherapy exercises',
    duration: 20,
    intensity: 'Moderate',
    painBefore: 3,
    painAfter: 4,
    painDuring: 3,
    notes: 'Core strengthening routine. Slight increase in pain after but manageable.',
    completed: true,
    modifications: ['Reduced repetitions', 'Added rest periods'],
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Work',
    activityName: 'Desk work',
    duration: 240,
    intensity: 'Light',
    painBefore: 2,
    painAfter: 5,
    painDuring: 3,
    notes: 'Full work day. Pain increased significantly. Need to improve ergonomic setup.',
    completed: true,
    modifications: ['Frequent breaks', 'Standing desk', 'Ergonomic chair'],
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Daily Living',
    activityName: 'Household chores',
    duration: 45,
    intensity: 'Moderate',
    painBefore: 3,
    painAfter: 6,
    painDuring: 4,
    notes: 'Vacuuming triggered pain. Need to pace better and use proper body mechanics.',
    completed: true,
    modifications: ['Pacing', 'Sitting breaks', 'Partner assistance'],
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Recreation',
    activityName: 'Walking in park',
    duration: 30,
    intensity: 'Light',
    painBefore: 2,
    painAfter: 2,
    painDuring: 2,
    notes: 'Gentle walk felt good. No pain increase. Good for mental health too.',
    completed: true,
    modifications: ['Used walking poles', 'Level terrain only'],
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Treatment',
    activityName: 'Physiotherapy session',
    duration: 60,
    intensity: 'Moderate',
    painBefore: 4,
    painAfter: 3,
    painDuring: 5,
    notes: 'Manual therapy and exercises. Pain spiked during but decreased after. Beneficial overall.',
    completed: true,
    modifications: ['Therapist-guided', 'Progressive difficulty'],
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    activityType: 'Social',
    activityName: 'Dinner with friends',
    duration: 120,
    intensity: 'Light',
    painBefore: 3,
    painAfter: 4,
    painDuring: 3,
    notes: 'Enjoyable evening but prolonged sitting caused mild increase. Worth it for social connection.',
    completed: true,
    modifications: ['Supportive seating', 'Position changes', 'Left earlier than usual'],
  },
];

/**
 * Diverse activity scenarios for testing edge cases
 */
export const edgeCaseActivities: Activity[] = [
  // Zero pain activity
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Meditation',
    duration: 30,
    painLevel: 0,
    notes: 'Deep meditation, complete pain relief during practice',
  },
  // Maximum pain activity
  {
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Emergency room visit',
    duration: 180,
    painLevel: 10,
    notes: 'Acute pain crisis, unable to move without severe pain',
  },
  // Very short duration
  {
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Stretching',
    duration: 1,
    painLevel: 2,
    notes: 'Quick stretch break during work',
  },
  // Very long duration
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Bed rest',
    duration: 480,
    painLevel: 7,
    notes: 'Prolonged bed rest during severe flare-up',
  },
  // Multiple activities same day
  {
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Commuting',
    duration: 60,
    painLevel: 4,
    notes: 'Morning commute, sitting in car',
  },
];

/**
 * Helper to generate activity with defaults
 */
export function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    timestamp: new Date().toISOString(),
    type: 'Walking',
    duration: 30,
    painLevel: 3,
    notes: 'Test activity',
    ...overrides,
  };
}

/**
 * Generate activity pattern over time
 */
export function generateActivityPattern(
  startDate: Date,
  days: number,
  activityType: string = 'Walking'
): Activity[] {
  const activities: Activity[] = [];
  
  for (let i = 0; i < days; i++) {
    const timestamp = new Date(startDate.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000);
    
    activities.push({
      timestamp: timestamp.toISOString(),
      type: activityType,
      duration: 20 + Math.floor(Math.random() * 40), // 20-60 minutes
      painLevel: Math.max(1, Math.min(10, Math.floor(8 - (i / days) * 6))), // Decreasing pain
      notes: `${activityType} on day ${i + 1}`,
    });
  }
  
  return activities;
}

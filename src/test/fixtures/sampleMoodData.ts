/**
 * Comprehensive mood and empathy test data
 * Covers diverse emotional states, triggers, and coping strategies
 */

import type { MoodEntry } from '../../types/quantified-empathy';

// Counter for deterministic test IDs (exported for test reset)
let _moodEntryIdCounter = 10000;

/**
 * Reset the ID counter for test isolation
 */
export function resetMoodEntryIdCounter(): void {
  _moodEntryIdCounter = 10000;
}

/**
 * Sample mood entries covering wide range of emotional states
 */
export const sampleMoodEntries: MoodEntry[] = [
  // Week 1 - High stress period
  {
    id: 1,
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 3,
    energy: 2,
    anxiety: 8,
    stress: 9,
    hopefulness: 4,
    selfEfficacy: 3,
    emotionalClarity: 5,
    emotionalRegulation: 4,
    context: 'Severe pain flare-up, emergency room visit',
    triggers: ['acute pain', 'medical emergency', 'work absence'],
    copingStrategies: ['breathing exercises', 'pain medication'],
    socialSupport: 'moderate',
    notes: 'Overwhelmed by sudden pain onset. Anxious about work and recovery. Partner drove me to hospital. Feel scared and uncertain about what this means for my future.',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 4,
    energy: 2,
    anxiety: 7,
    stress: 8,
    hopefulness: 4,
    selfEfficacy: 4,
    emotionalClarity: 6,
    emotionalRegulation: 5,
    context: 'Day after ER visit, resting at home',
    triggers: ['pain', 'medication side effects', 'isolation'],
    copingStrategies: ['rest', 'ice/heat therapy', 'distraction with TV'],
    socialSupport: 'strong',
    notes: 'Feeling slightly better emotionally but still in significant pain. Family checking in regularly which helps. Grateful for support but feel guilty about needing help.',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 4,
    energy: 3,
    anxiety: 7,
    stress: 7,
    hopefulness: 5,
    selfEfficacy: 4,
    emotionalClarity: 6,
    emotionalRegulation: 5,
    context: 'Doctor follow-up appointment',
    triggers: ['medical uncertainty', 'pain persistence', 'work concerns'],
    copingStrategies: ['journaling', 'talking to partner', 'meditation app'],
    socialSupport: 'strong',
    notes: 'Doctor visit provided some reassurance. Have a treatment plan now which helps with anxiety. Still worried about timeline for recovery and impact on work.',
  },

  // Week 2 - Gradual improvement
  {
    id: 4,
    timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 5,
    energy: 4,
    anxiety: 6,
    stress: 6,
    hopefulness: 6,
    selfEfficacy: 5,
    emotionalClarity: 7,
    emotionalRegulation: 6,
    context: 'Starting to see some pain improvement',
    triggers: ['lingering pain', 'boredom from limited activity'],
    copingStrategies: ['gentle stretching', 'reading', 'connecting with friends online'],
    socialSupport: 'moderate',
    notes: 'Feeling more hopeful as pain decreases slightly. Starting to understand my limitations better. Learning to accept help without feeling guilty. Practiced mindfulness and noticed some relief.',
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 6,
    energy: 5,
    anxiety: 5,
    stress: 5,
    hopefulness: 7,
    selfEfficacy: 6,
    emotionalClarity: 7,
    emotionalRegulation: 7,
    context: 'First physiotherapy session',
    triggers: ['fear of making pain worse', 'new treatment uncertainty'],
    copingStrategies: ['trusting healthcare professionals', 'positive self-talk', 'gradual exposure'],
    socialSupport: 'strong',
    notes: "Physiotherapist was excellent and reassuring. Feel empowered knowing I can do something active for my recovery. Learned exercises that don't aggravate pain. Feeling more in control.",
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 6,
    energy: 5,
    anxiety: 5,
    stress: 5,
    hopefulness: 7,
    selfEfficacy: 6,
    emotionalClarity: 8,
    emotionalRegulation: 7,
    context: 'Consistent pain management, routine developing',
    triggers: ['minor pain flare after overdoing it'],
    copingStrategies: ['pacing activities', 'heat therapy', 'calling friend for support'],
    socialSupport: 'moderate',
    notes: "Learning my limits through experience. Had setback from doing too much but recovered quickly. Understanding that recovery isn't linear helps manage expectations. Friend listened and provided empathy.",
  },

  // Week 3 - Building resilience
  {
    id: 7,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 7,
    energy: 6,
    anxiety: 4,
    stress: 4,
    hopefulness: 8,
    selfEfficacy: 7,
    emotionalClarity: 8,
    emotionalRegulation: 8,
    context: 'Notable improvement in pain and function',
    triggers: ['weather change causing minor flare', 'work stress'],
    copingStrategies: ['exercise routine', 'social connection', 'gratitude practice'],
    socialSupport: 'strong',
    notes: 'Feeling much better physically and emotionally. Started gratitude journaling which shifts perspective. Reconnected with hobbies. Empathy for others struggling with chronic conditions has deepened.',
  },
  {
    id: 8,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 7,
    energy: 7,
    anxiety: 4,
    stress: 4,
    hopefulness: 8,
    selfEfficacy: 8,
    emotionalClarity: 8,
    emotionalRegulation: 8,
    context: 'Successful return to modified work',
    triggers: ['performance anxiety', 'fatigue from activity increase'],
    copingStrategies: ['pacing work tasks', 'regular breaks', 'boundary setting'],
    socialSupport: 'strong',
    notes: "Proud of returning to work. Colleagues supportive. Learning to communicate needs assertively. Feel strong sense of progress and capability. Understanding others' struggles more deeply now.",
  },
  {
    id: 9,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 7,
    anxiety: 3,
    stress: 3,
    hopefulness: 8,
    selfEfficacy: 8,
    emotionalClarity: 9,
    emotionalRegulation: 8,
    context: 'Feeling well-regulated and capable',
    triggers: ['minor work deadline pressure'],
    copingStrategies: ['time management', 'delegation', 'self-compassion', 'physical activity'],
    socialSupport: 'strong',
    notes: "Excellent emotional regulation today. Handled work pressure without significant stress. Recognized early signs of tension and took preventive action. Feeling connected and purposeful. Helped colleague understand their health challenge with deep empathy.",
  },

  // Week 4 - Sustained improvement
  {
    id: 10,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 8,
    anxiety: 3,
    stress: 3,
    hopefulness: 9,
    selfEfficacy: 9,
    emotionalClarity: 9,
    emotionalRegulation: 9,
    context: 'Sustained recovery, resuming normal activities',
    triggers: ['none significant'],
    copingStrategies: ['maintenance exercise', 'continued self-care', 'meaningful activities'],
    socialSupport: 'strong',
    notes: 'Feeling grateful for recovery progress. Maintaining healthy habits. Stronger sense of resilience. This experience has given me deeper understanding of suffering and compassion for others. Spiritual growth through acceptance and meaning-making.',
  },
  {
    id: 11,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 8,
    anxiety: 2,
    stress: 2,
    hopefulness: 9,
    selfEfficacy: 9,
    emotionalClarity: 9,
    emotionalRegulation: 9,
    context: 'Feeling fully recovered and stronger',
    triggers: ['minor concern about recurrence'],
    copingStrategies: ['preventive strategies', 'positive reframing', 'connection with others'],
    socialSupport: 'strong',
    notes: 'Reflected on entire journey. Feel more emotionally intelligent and resilient. Better at recognizing and managing emotions. Improved empathy and understanding of others. Grateful for support received and eager to pay it forward.',
  },
  {
    id: 12,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 9,
    energy: 8,
    anxiety: 2,
    stress: 2,
    hopefulness: 9,
    selfEfficacy: 9,
    emotionalClarity: 9,
    emotionalRegulation: 9,
    context: 'Celebrating recovery milestone',
    triggers: ['none'],
    copingStrategies: ['celebrating wins', 'connecting with loved ones', 'reflection'],
    socialSupport: 'strong',
    notes: 'Celebrating progress with family. Feel transformed by this experience. Deeper empathy, better emotional awareness, stronger coping skills. Ready to help others who are struggling. Feel hopeful about the future and grateful for the growth.',
  },

  // Additional entries covering diverse emotional scenarios
  {
    id: 13,
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 3,
    energy: 2,
    anxiety: 9,
    stress: 9,
    hopefulness: 3,
    selfEfficacy: 2,
    emotionalClarity: 4,
    emotionalRegulation: 3,
    context: 'Peak anxiety about diagnosis and future',
    triggers: ['medical uncertainty', 'fear of disability', 'financial worries'],
    copingStrategies: ['deep breathing', 'crisis helpline'],
    socialSupport: 'minimal',
    notes: 'Catastrophizing about worst-case scenarios. Felt alone and scared. Called crisis line which helped ground me. Need to reach out to support system more.',
  },
  {
    id: 14,
    timestamp: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 4,
    energy: 3,
    anxiety: 7,
    stress: 8,
    hopefulness: 5,
    selfEfficacy: 4,
    emotionalClarity: 6,
    emotionalRegulation: 5,
    context: 'Adjusting to limitations',
    triggers: ['loss of independence', 'role changes'],
    copingStrategies: ['acceptance work', 'reframing perspective', 'self-compassion'],
    socialSupport: 'moderate',
    notes: 'Struggling with accepting need for help. Trying to practice self-compassion. Reminder that asking for help is strength, not weakness. Perspective shift: this is temporary.',
  },
  {
    id: 15,
    timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 5,
    energy: 4,
    anxiety: 6,
    stress: 6,
    hopefulness: 6,
    selfEfficacy: 5,
    emotionalClarity: 7,
    emotionalRegulation: 6,
    context: 'Processing emotions about injury',
    triggers: ['grief over lifestyle changes', 'frustration with pace'],
    copingStrategies: ['therapy session', 'expressive writing', 'support group'],
    socialSupport: 'strong',
    notes: "Therapy helped me process grief over temporary loss of activities. Realized I'm mourning and that's okay. Writing helps express feelings. Support group connected me with others who understand.",
  },
  {
    id: 16,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 6,
    energy: 5,
    anxiety: 5,
    stress: 5,
    hopefulness: 7,
    selfEfficacy: 6,
    emotionalClarity: 7,
    emotionalRegulation: 7,
    context: 'Finding new meaning in recovery',
    triggers: ['setback from overexertion'],
    copingStrategies: ['mindfulness', 'creative expression', 'connecting with nature'],
    socialSupport: 'moderate',
    notes: "Setback was disappointing but handled it better emotionally. Used it as learning experience. Finding meaning through growth and helping others. Nature walks improve mood significantly.",
  },
];

/**
 * Extreme emotional scenarios for testing edge cases
 */
export const extremeMoodEntries: MoodEntry[] = [
  // Crisis-level emotional state
  {
    id: 100,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 1,
    energy: 1,
    anxiety: 10,
    stress: 10,
    hopefulness: 1,
    selfEfficacy: 1,
    emotionalClarity: 2,
    emotionalRegulation: 1,
    context: 'Acute crisis state',
    triggers: ['severe pain', 'loss of function', 'overwhelming fear'],
    copingStrategies: ['emergency services', 'crisis line'],
    socialSupport: 'minimal',
    notes: 'In crisis. Need immediate help. Cannot think clearly. Overwhelming panic and pain.',
  },
  // Peak positive emotional state
  {
    id: 101,
    timestamp: new Date().toISOString(),
    mood: 10,
    energy: 10,
    anxiety: 1,
    stress: 1,
    hopefulness: 10,
    selfEfficacy: 10,
    emotionalClarity: 10,
    emotionalRegulation: 10,
    context: 'Full recovery celebration',
    triggers: ['none'],
    copingStrategies: ['celebration', 'gratitude', 'reflection'],
    socialSupport: 'strong',
    notes: 'Complete recovery achieved. Feel incredible joy, deep gratitude, and profound empathy. This journey transformed me. Feel strong, capable, and compassionate. Ready to support others.',
  },
];

/**
 * Mood entries with rich empathy indicators for testing empathy algorithms
 */
export const empathyRichMoodEntries: MoodEntry[] = [
  {
    id: 200,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 7,
    energy: 6,
    anxiety: 4,
    stress: 4,
    hopefulness: 8,
    selfEfficacy: 7,
    emotionalClarity: 8,
    emotionalRegulation: 8,
    context: 'Deep connection with support group',
    triggers: ['shared vulnerability'],
    copingStrategies: ['peer support', 'active listening', 'validation'],
    socialSupport: 'strong',
    notes: "Attended support group today. Felt strong empathy and understanding for others struggling. Shared my story and felt heard. The emotional connection and mutual understanding was powerful. I can feel their pain and hope.",
  },
  {
    id: 201,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 7,
    anxiety: 3,
    stress: 3,
    hopefulness: 8,
    selfEfficacy: 8,
    emotionalClarity: 9,
    emotionalRegulation: 8,
    context: 'Helping others with compassion',
    triggers: ['witnessing others struggle'],
    copingStrategies: ['empathetic listening', 'offering support', 'perspective sharing'],
    socialSupport: 'strong',
    notes: 'Colleague confided about their health struggle. I listened deeply and understood their perspective from my own experience. Offered meaningful support without judgment. Feel grateful I can empathize and help others now.',
  },
  {
    id: 202,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 7,
    anxiety: 3,
    stress: 3,
    hopefulness: 9,
    selfEfficacy: 8,
    emotionalClarity: 9,
    emotionalRegulation: 9,
    context: 'Practicing compassion meditation',
    triggers: ['none'],
    copingStrategies: ['loving-kindness meditation', 'compassion practice', 'empathy cultivation'],
    socialSupport: 'strong',
    notes: 'Practiced loving-kindness meditation today. Felt deep compassion for myself and others. Understanding that we all struggle helps me feel connected. Empathy has become a core value through this experience.',
  },
  {
    id: 203,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    energy: 8,
    anxiety: 2,
    stress: 2,
    hopefulness: 9,
    selfEfficacy: 9,
    emotionalClarity: 9,
    emotionalRegulation: 9,
    context: 'Reflection on personal growth',
    triggers: ['none'],
    copingStrategies: ['journaling', 'meaning-making', 'gratitude'],
    socialSupport: 'strong',
    notes: "Reflected on this journey. I learned to understand and feel deeply for others. My empathy and emotional awareness have grown tremendously. I can now recognize others' pain and offer genuine understanding. This experience gave me profound insight into human suffering and resilience.",
  },
];

/**
 * Helper function to create mood entry with defaults
 * Uses deterministic IDs for reliable tests
 */
export function makeMoodEntry(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: overrides.id ?? _moodEntryIdCounter++,
    timestamp: new Date().toISOString(),
    mood: 5,
    energy: 5,
    anxiety: 5,
    stress: 5,
    hopefulness: 5,
    selfEfficacy: 5,
    emotionalClarity: 5,
    emotionalRegulation: 5,
    context: 'test entry',
    triggers: [],
    copingStrategies: ['mindfulness'],
    socialSupport: 'moderate',
    notes: 'Test mood entry',
    ...overrides,
  };
}

/**
 * Generate a series of mood entries showing progression
 */
export function generateMoodProgression(
  startDate: Date,
  days: number,
  startMood: number = 3,
  endMood: number = 8
): MoodEntry[] {
  const entries: MoodEntry[] = [];
  const moodStep = (endMood - startMood) / (days - 1);
  
  for (let i = 0; i < days; i++) {
    const timestamp = new Date(startDate.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const mood = Math.round(startMood + (moodStep * i));
    
    entries.push({
      id: 1000 + i,
      timestamp: timestamp.toISOString(),
      mood,
      energy: Math.max(1, Math.min(10, mood - 1)),
      anxiety: Math.max(1, Math.min(10, 11 - mood)),
      stress: Math.max(1, Math.min(10, 11 - mood)),
      hopefulness: mood,
      selfEfficacy: mood,
      emotionalClarity: Math.min(10, mood + 1),
      emotionalRegulation: Math.min(10, mood + 1),
      context: `Day ${i + 1} of recovery`,
      triggers: i < days / 2 ? ['pain', 'stress'] : [],
      copingStrategies: ['mindfulness', 'self-care'],
      socialSupport: i > days / 2 ? 'strong' : 'moderate',
      notes: `Mood progression entry ${i + 1}`,
    });
  }
  
  return entries;
}

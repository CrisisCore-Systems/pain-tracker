import type { MoodEntry, WisdomInsight, WisdomProfile } from '../../types/quantified-empathy';

// Heuristic wisdom extraction utilities extracted from EmpathyIntelligenceEngine

export function categorizeWisdom(
  insight: string
): 'practical' | 'emotional' | 'spiritual' | 'relational' | 'self-knowledge' {
  const lower = insight.toLowerCase();
  if (lower.includes('relationship') || lower.includes('people') || lower.includes('connect'))
    return 'relational';
  if (lower.includes('feel') || lower.includes('emotion') || lower.includes('heart'))
    return 'emotional';
  if (lower.includes('meaning') || lower.includes('purpose') || lower.includes('spiritual'))
    return 'spiritual';
  if (lower.includes('myself') || lower.includes('i am') || lower.includes('identity'))
    return 'self-knowledge';
  return 'practical';
}

export function assessApplicability(insight: string): number {
  const actionWords = ['can', 'will', 'should', 'need to', 'must', 'always', 'never'];
  const actionCount = actionWords.reduce(
    (count, w) => count + (insight.toLowerCase().includes(w) ? 1 : 0),
    0
  );
  return Math.min(100, actionCount * 20 + 40);
}

export function assessTransformativeLevel(insight: string): number {
  const intensityWords = ['life-changing', 'transformed', 'completely', 'totally', 'fundamental'];
  const intensityCount = intensityWords.reduce(
    (count, w) => count + (insight.toLowerCase().includes(w) ? 1 : 0),
    0
  );
  return Math.min(100, intensityCount * 30 + 30);
}

export function assessReinforcement(insight: string, moodEntries: MoodEntry[]): number {
  const keyWords = insight
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 4);
  let reinforcement = 0;
  for (const e of moodEntries) {
    const entryWords = e.notes.toLowerCase().split(' ');
    if (keyWords.some(k => entryWords.includes(k))) reinforcement++;
  }
  if (moodEntries.length === 0) return 0;
  return Math.min(100, (reinforcement / moodEntries.length) * 100);
}

export async function extractWisdomInsights(
  userId: string,
  _painEntries: unknown[],
  moodEntries: MoodEntry[]
): Promise<WisdomInsight[]> {
  const insights: WisdomInsight[] = [];
  const wisdomEntries = moodEntries.filter(e => {
    const n = e.notes.toLowerCase();
    return (
      n.includes('learned') ||
      n.includes('realized') ||
      n.includes('understand now') ||
      n.includes('wisdom') ||
      n.includes('insight')
    );
  });
  wisdomEntries.forEach((entry, idx) => {
    if (entry.notes.length > 30) {
      insights.push({
        id: `wisdom_${userId}_${idx}`,
        category: categorizeWisdom(entry.notes),
        insight: entry.notes,
        dateGained: entry.timestamp,
        contextualSource: entry.context,
        applicability: assessApplicability(entry.notes),
        transformativeLevel: assessTransformativeLevel(entry.notes),
        sharedWith: [],
        reinforcementLevel: assessReinforcement(entry.notes, moodEntries),
      });
    }
  });
  return insights.slice(0, 10);
}

// Aggregated wisdom metrics (simplified extraction subset)
export function buildWisdomProfile(
  userId: string,
  painEntries: unknown[],
  moodEntries: MoodEntry[]
): WisdomProfile {
  // Lightweight replication: for now only growth + application + sharing heuristics
  const insights: WisdomInsight[] = [];
  const profile: WisdomProfile = {
    insights,
    wisdomCategories: {
      practicalWisdom: calcPractical(moodEntries),
      emotionalWisdom: calcEmotional(moodEntries),
      spiritualWisdom: calcSpiritual(moodEntries),
      relationalWisdom: calcRelational(moodEntries),
      selfKnowledgeWisdom: calcSelfKnowledge(moodEntries),
    },
    wisdomGrowthRate: calcWisdomGrowth(moodEntries),
    wisdomApplication: calcWisdomApplication(moodEntries),
    wisdomSharing: calcWisdomSharing(moodEntries),
    integratedWisdom: calcIntegratedWisdom(moodEntries),
  };
  void userId;
  void painEntries; // reserved for future deeper integration
  return profile;
}

// Internal calculation helpers matching original heuristics
export function calcPractical(entries: MoodEntry[]): number {
  if (!entries.length) return 50;
  const clarity = entries.reduce((s, e) => s + e.emotionalClarity, 0) / entries.length;
  return Math.max(0, Math.min(100, clarity * 10));
}
export function calcEmotional(entries: MoodEntry[]): number {
  if (!entries.length) return 50;
  const reg = entries.reduce((s, e) => s + e.emotionalRegulation, 0) / entries.length;
  const hope = entries.reduce((s, e) => s + e.hopefulness, 0) / entries.length;
  return Math.max(0, Math.min(100, (reg + hope) * 5));
}
export function calcSpiritual(entries: MoodEntry[]): number {
  if (!entries.length) return 50;
  const words = [
    'meaning',
    'purpose',
    'transcend',
    'transcendent',
    'faith',
    'spiritual',
    'bigger than',
    'grateful',
  ];
  let hits = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (words.some(w => n.includes(w))) hits++;
  }
  const clarity = entries.reduce((s, e) => s + e.emotionalClarity, 0) / entries.length;
  const regulation = entries.reduce((s, e) => s + e.emotionalRegulation, 0) / entries.length;
  const base = (hits / entries.length) * 60;
  return Math.max(0, Math.min(100, base + (clarity + regulation) * 2));
}
export function calcRelational(entries: MoodEntry[]): number {
  if (!entries.length) return 50;
  const words = ['relationship', 'friend', 'family', 'support', 'listened', 'helped', 'connection'];
  let hits = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (words.some(w => n.includes(w))) hits++;
  }
  const support = (entries.filter(e => e.socialSupport !== 'none').length / entries.length) * 50;
  return Math.max(0, Math.min(100, (hits / entries.length) * 50 + support));
}
export function calcSelfKnowledge(entries: MoodEntry[]): number {
  if (!entries.length) return 50;
  const words = [
    'i feel',
    'i notice',
    'i realized',
    'i understand',
    'i learned',
    'aware',
    'noticing',
  ];
  let hits = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (words.some(w => n.includes(w))) hits++;
  }
  const clarity = entries.reduce((s, e) => s + e.emotionalClarity, 0) / entries.length;
  return Math.max(0, Math.min(100, (hits / entries.length) * 60 + clarity * 4));
}
export function calcWisdomGrowth(entries: MoodEntry[]): number {
  if (entries.length < 2) return 10;
  const mid = Math.floor(entries.length / 2);
  const terms = ['learned', 'realized', 'understand', 'insight', 'growth'];
  const density = (slice: MoodEntry[]) =>
    slice.filter(e => {
      const n = e.notes.toLowerCase();
      return terms.some(w => n.includes(w));
    }).length / Math.max(1, slice.length);
  const first = density(entries.slice(0, mid));
  const second = density(entries.slice(mid));
  const growth = (second - first) * 100;
  return Math.max(0, Math.min(100, 40 + growth));
}
export function calcWisdomApplication(entries: MoodEntry[]): number {
  if (!entries.length) return 40;
  const actions = ['applied', 'use', 'used', 'practice', 'practiced', 'implemented', 'shared'];
  let count = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (actions.some(w => n.includes(w))) count++;
  }
  const regulation = entries.reduce((s, e) => s + e.emotionalRegulation, 0) / entries.length;
  return Math.max(0, Math.min(100, (count / entries.length) * 70 + regulation * 3));
}
export function calcWisdomSharing(entries: MoodEntry[]): number {
  if (!entries.length) return 30;
  const shareWords = ['told', 'shared', 'explained', 'helped someone', 'wrote about'];
  let hits = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (shareWords.some(w => n.includes(w))) hits++;
  }
  return Math.max(0, Math.min(100, (hits / entries.length) * 100));
}
export function calcIntegratedWisdom(entries: MoodEntry[]): number {
  if (!entries.length) return 40;
  const insightWords = ['learned', 'realized', 'understand', 'insight'];
  const applyWords = ['applied', 'use', 'practice', 'implemented'];
  let integrated = 0;
  for (const e of entries) {
    const n = e.notes.toLowerCase();
    if (insightWords.some(w => n.includes(w)) && applyWords.some(w => n.includes(w))) integrated++;
  }
  // simplistic stability proxy: regulation average inverted variance not stored here, reuse regulation average
  const regulation = entries.reduce((s, e) => s + e.emotionalRegulation, 0) / entries.length;
  return Math.max(0, Math.min(100, (integrated / entries.length) * 60 + regulation * 0.4));
}

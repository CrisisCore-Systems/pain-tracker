import type { PainEntry } from '../../types';

export interface CheckinInsight {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function titleCase(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function summarizeTopLocation(entries: PainEntry[]): { location: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const loc of entry.baselineData.locations ?? []) {
      if (!loc) continue;
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;
  const [location, count] = sorted[0];
  return { location, count };
}

function noteMentionsDeskWork(note: string): boolean {
  const n = note.toLowerCase();
  return (
    n.includes('desk') ||
    n.includes('computer') ||
    n.includes('laptop') ||
    n.includes('typing') ||
    n.includes('sitting') ||
    n.includes('chair') ||
    n.includes('ergonomic')
  );
}

function lastNDays(entries: PainEntry[], days: number): PainEntry[] {
  const now = Date.now();
  const minTs = now - days * 24 * 60 * 60 * 1000;
  return entries.filter(e => {
    const ts = new Date(e.timestamp).getTime();
    return Number.isFinite(ts) && ts >= minTs;
  });
}

function averagePain(entries: PainEntry[]): number | null {
  if (!entries.length) return null;
  const sum = entries.reduce((acc, e) => acc + (e.baselineData?.pain ?? 0), 0);
  return sum / entries.length;
}

/**
 * Generates pain-focused, post-check-in insights.
 * Intentionally avoids logging or embedding raw note content.
 */
export function generateCheckinInsights(params: {
  newEntry: PainEntry;
  allEntries: PainEntry[];
}): CheckinInsight[] {
  const { newEntry, allEntries } = params;

  const insights: CheckinInsight[] = [];

  const recent = lastNDays(allEntries, 30);
  const recentExcludingNew = recent.filter(e => e.id !== newEntry.id);

  const newPain = newEntry.baselineData.pain;
  const newLocations = (newEntry.baselineData.locations ?? []).filter(Boolean);

  // 1) Pattern consistency by location
  if (newLocations.length) {
    const top = summarizeTopLocation(recentExcludingNew);
    const match = top && newLocations.includes(top.location);

    if (match && top) {
      insights.push({
        id: 'location-consistency',
        title: 'This matches a recent pattern',
        description: `${titleCase(top.location)} shows up often in your recent entries. Noting what was happening around flare-ups can help spot workable adjustments over time.`,
        confidence: clamp(Math.round((top.count / Math.max(1, recentExcludingNew.length)) * 100), 40, 90),
      });
    } else if (top) {
      insights.push({
        id: 'location-context',
        title: 'Location trend to watch',
        description: `${titleCase(top.location)} is one of your more common recent locations. If today's pain feels different, consider adding a quick note about activity, posture, sleep, or medication timing.`,
        confidence: clamp(Math.round((top.count / Math.max(1, recentExcludingNew.length)) * 100), 35, 85),
      });
    }
  }

  // 2) Pain level compared to recent baseline
  const last7 = lastNDays(allEntries, 7);
  const last7Avg = averagePain(last7);
  if (last7Avg !== null && Number.isFinite(newPain)) {
    const delta = newPain - last7Avg;
    if (Math.abs(delta) >= 1) {
      insights.push({
        id: 'pain-vs-recent',
        title: delta > 0 ? 'A higher-pain moment today' : 'A gentler moment today',
        description:
          delta > 0
            ? `Today is about ${delta.toFixed(1)} points higher than your recent 7-day average. If you can, jot a short context note (activity, stress, sleep, meds) so patterns are easier to trust later.`
            : `Today is about ${Math.abs(delta).toFixed(1)} points lower than your recent 7-day average. If anything helped (rest, pacing, stretching, heat/ice), it can be worth noting for future flares.`,
        confidence: clamp(Math.round((last7.length / 10) * 100), 35, 80),
      });
    }
  }

  // 3) Gentle, pain-relevant prompt based on note keywords
  const note = newEntry.notes ?? '';
  if (note && noteMentionsDeskWork(note)) {
    insights.push({
      id: 'desk-work',
      title: 'Desk-work signal',
      description:
        'You mentioned desk or sitting work. If it fits your day, small ergonomic tweaks (chair height, monitor position, micro-breaks) can be useful to test and track over time.',
      confidence: 55,
    });
  }

  // 4) Data-quality nudge (because analytics depend on it)
  insights.push({
    id: 'data-quality',
    title: 'Make patterns easier to trust',
    description:
      'If you want stronger trigger detection, consider tracking a few context factors consistently (activity level, meds taken and timing, sleep quality, stress). Even quick yes/no notes help.',
    confidence: 60,
  });

  // Keep this short and non-overwhelming
  return insights.slice(0, 4);
}

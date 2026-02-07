/**
 * Humanize Utility
 * 
 * Transforms raw pain tracking data into meaningful, empathetic language
 * that helps users understand their pain patterns in a supportive way.
 */

import type { PainEntry } from '../types';
import { pickVariant } from '@pain-tracker/utils';

// ============================================
// Pain Level Descriptions
// ============================================

export interface PainDescription {
  level: string;
  emoji: string;
  description: string;
  suggestion: string;
}

export function describePainLevel(pain: number): PainDescription {
  if (pain <= 0) {
    return {
      level: 'No pain',
      emoji: '✨',
      description: 'You reported no pain—what a relief!',
      suggestion: 'Take note of what made today different.',
    };
  }
  if (pain <= 2) {
    return {
      level: 'Minimal',
      emoji: '🌿',
      description: 'Very mild discomfort that barely affects your day',
      suggestion: 'A great day to gently build on positive habits.',
    };
  }
  if (pain <= 4) {
    return {
      level: 'Mild',
      emoji: '🌤️',
      description: 'Noticeable but manageable pain',
      suggestion: 'Gentle movement or stretching might help maintain this level.',
    };
  }
  if (pain <= 6) {
    return {
      level: 'Moderate',
      emoji: '🌥️',
      description: 'Pain that requires attention and may affect activities',
      suggestion: 'Consider pacing yourself and taking regular breaks.',
    };
  }
  if (pain <= 8) {
    return {
      level: 'Significant',
      emoji: '⛈️',
      description: 'Intense pain that significantly impacts daily life',
      suggestion: 'Focus on comfort measures and don\'t push through it.',
    };
  }
  return {
    level: 'Severe',
    emoji: '🌊',
    description: 'Very high pain that makes most activities difficult',
    suggestion: 'Rest and recovery are priority. Be gentle with yourself.',
  };
}

// ============================================
// Trend Descriptions
// ============================================

export interface TrendDescription {
  direction: 'improving' | 'stable' | 'worsening';
  headline: string;
  detail: string;
  encouragement: string;
  actionItem: string;
}

export function describeTrend(
  currentAvg: number,
  previousAvg: number,
  hasEnoughData: boolean
): TrendDescription {
  if (!hasEnoughData) {
    return {
      direction: 'stable',
      headline: 'Building your picture',
      detail: 'We need a bit more data to spot meaningful patterns.',
      encouragement: 'Each entry you add helps us understand your unique experience.',
      actionItem: 'Try to log how you feel at different times of day.',
    };
  }

  const change = currentAvg - previousAvg;

  if (change <= -0.5) {
    // Improving
    const magnitude = Math.abs(change);
    if (magnitude >= 2) {
      return {
        direction: 'improving',
        headline: 'Significant improvement! 🎉',
        detail: `Your pain has dropped noticeably—about ${magnitude.toFixed(1)} points lower than before.`,
        encouragement: 'Whatever you\'ve been doing is working. Keep it up!',
        actionItem: 'Consider noting what\'s been different lately.',
      };
    }
    return {
      direction: 'improving',
      headline: 'Things are looking up',
      detail: `Your pain has eased by about ${magnitude.toFixed(1)} points compared to last week.`,
      encouragement: 'Small improvements add up. You\'re on the right track.',
      actionItem: 'Reflect on what activities or rest patterns helped.',
    };
  }

  if (change >= 0.5) {
    // Worsening
    const magnitude = Math.abs(change);
    if (magnitude >= 2) {
      return {
        direction: 'worsening',
        headline: 'A tougher week',
        detail: `Pain levels have risen about ${magnitude.toFixed(1)} points. That's a meaningful shift.`,
        encouragement: 'This information helps you and your care team make adjustments.',
        actionItem: 'Try to identify any new triggers or changes in routine.',
      };
    }
    return {
      direction: 'worsening',
      headline: 'Slight uptick noticed',
      detail: `Pain has increased by about ${magnitude.toFixed(1)} points recently.`,
      encouragement: 'Fluctuations are normal. Let\'s watch if this continues.',
      actionItem: 'Consider whether anything changed in your activities or sleep.',
    };
  }

  // Stable
  return {
    direction: 'stable',
    headline: 'Holding steady',
    detail: 'Your pain levels have been consistent over the past two weeks.',
    encouragement: 'Stability can be a win—it means things aren\'t getting worse.',
    actionItem: 'Keep tracking to help identify what maintains this balance.',
  };
}

// ============================================
// Streak Messages
// ============================================

export function describeStreak(streak: number): {
  message: string;
  encouragement: string;
  milestone: string | null;
} {
  if (streak === 0) {
    return {
      message: 'Start your tracking journey today',
      encouragement: 'Even one entry helps build your pain story.',
      milestone: null,
    };
  }
  if (streak === 1) {
    return {
      message: 'You logged today—great start!',
      encouragement: 'Come back tomorrow to build momentum.',
      milestone: null,
    };
  }
  if (streak < 7) {
    return {
      message: `${streak} days in a row`,
      encouragement: `${7 - streak} more days until your first week milestone!`,
      milestone: null,
    };
  }
  if (streak === 7) {
    return {
      message: 'One full week! 🌟',
      encouragement: 'A week of data gives us real insights to work with.',
      milestone: '7-day streak achieved!',
    };
  }
  if (streak < 14) {
    return {
      message: `${streak} days strong`,
      encouragement: 'You\'re building valuable data for pattern recognition.',
      milestone: null,
    };
  }
  if (streak === 14) {
    return {
      message: 'Two weeks! 🏆',
      encouragement: 'With 14 days of data, we can spot weekly patterns.',
      milestone: '14-day streak achieved!',
    };
  }
  if (streak < 30) {
    return {
      message: `${streak}-day streak!`,
      encouragement: `Only ${30 - streak} days to hit your monthly milestone.`,
      milestone: null,
    };
  }
  if (streak === 30) {
    return {
      message: 'One month! 🎖️',
      encouragement: 'A month of tracking reveals powerful patterns.',
      milestone: '30-day streak achieved!',
    };
  }
  return {
    message: `${streak} days—incredible dedication!`,
    encouragement: 'Your commitment is creating a rich picture of your health journey.',
    milestone: streak % 30 === 0 ? `${streak / 30}-month milestone!` : null,
  };
}

// ============================================
// Entry Count Context
// ============================================

export function describeEntryCount(
  total: number,
  thisWeek: number
): {
  totalMessage: string;
  weeklyMessage: string;
  dataQuality: 'minimal' | 'growing' | 'solid' | 'rich';
  suggestion: string;
} {
  let dataQuality: 'minimal' | 'growing' | 'solid' | 'rich';
  let suggestion: string;

  if (total < 7) {
    dataQuality = 'minimal';
    suggestion = 'A few more entries will help us spot patterns.';
  } else if (total < 30) {
    dataQuality = 'growing';
    suggestion = 'Good start! More data improves pattern accuracy.';
  } else if (total < 90) {
    dataQuality = 'solid';
    suggestion = 'Strong data foundation for meaningful insights.';
  } else {
    dataQuality = 'rich';
    suggestion = 'Excellent! Your data paints a detailed picture.';
  }

  const totalMessage = total === 0
    ? 'No entries yet—let\'s get started!'
    : total === 1
      ? 'Your first entry is in!'
      : `${total} entries recorded`;

  const weeklyMessage = thisWeek === 0
    ? 'None logged this week'
    : thisWeek === 1
      ? '1 entry this week'
      : thisWeek === 7
        ? 'Every day this week! 🌟'
        : `${thisWeek} entries this week`;

  return { totalMessage, weeklyMessage, dataQuality, suggestion };
}

// ============================================
// Best/Worst Day Context
// ============================================

export function describeBestDay(entry: PainEntry | undefined): {
  headline: string;
  context: string;
  insight: string;
} | null {
  if (!entry) return null;
  
  const pain = entry.baselineData.pain;
  const date = new Date(entry.timestamp);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return {
    headline: `Lowest at ${pain}/10`,
    context: `${dayName}, ${formattedDate}`,
    insight: pain <= 3 
      ? 'This was a really good day. What made it different?'
      : pain <= 5
        ? 'A more manageable day. Worth noting what helped.'
        : 'Even your best recent day had significant pain. Let\'s work on improving this baseline.',
  };
}

export function describeChallengingDay(entry: PainEntry | undefined): {
  headline: string;
  context: string;
  insight: string;
} | null {
  if (!entry) return null;
  
  const pain = entry.baselineData.pain;
  const date = new Date(entry.timestamp);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return {
    headline: `Peaked at ${pain}/10`,
    context: `${dayName}, ${formattedDate}`,
    insight: pain >= 8
      ? 'A very difficult day. Consider what might have triggered this spike.'
      : pain >= 6
        ? 'A harder day. Tracking triggers can help prevent similar days.'
        : 'Your toughest day wasn\'t too severe—that\'s encouraging!',
  };
}

// ============================================
// Time-Based Greetings & Context
// ============================================

export function getTimeBasedGreeting(): {
  greeting: string;
  suggestion: string;
} {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      suggestion: 'How did you sleep? Morning logs can capture overnight changes.',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      suggestion: 'Mid-day check-in: How has your pain evolved since morning?',
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good evening',
      suggestion: 'Evening is a good time to reflect on the day\'s patterns.',
    };
  }
  return {
    greeting: 'Hello',
    suggestion: 'Late-night logging? Make sure to prioritize rest.',
  };
}

// ============================================
// Improvement Rate Context
// ============================================

export function describeImprovementRate(rate: number): {
  label: string;
  description: string;
  tone: 'positive' | 'neutral' | 'attention';
  suggestion: string;
} {
  if (rate <= -20) {
    return {
      label: 'Major improvement',
      description: `Pain levels are down ${Math.abs(rate).toFixed(0)}% from before`,
      tone: 'positive',
      suggestion: 'Fantastic progress! Document what\'s working.',
    };
  }
  if (rate < -5) {
    return {
      label: 'Improving',
      description: `About ${Math.abs(rate).toFixed(0)}% better than last period`,
      tone: 'positive',
      suggestion: 'Steady improvement. Keep doing what works.',
    };
  }
  if (rate <= 5) {
    return {
      label: 'Stable',
      description: 'Pain levels are consistent',
      tone: 'neutral',
      suggestion: 'Stability is valuable. Note what maintains it.',
    };
  }
  if (rate <= 20) {
    return {
      label: 'Slight increase',
      description: `About ${rate.toFixed(0)}% higher than before`,
      tone: 'attention',
      suggestion: 'Worth monitoring. Any changes in routine?',
    };
  }
  return {
    label: 'Needs attention',
    description: `Pain is up ${rate.toFixed(0)}% recently`,
    tone: 'attention',
    suggestion: 'Consider discussing this trend with your care team.',
  };
}

// ============================================
// Generate Summary Paragraph
// ============================================

export function generateHumanizedSummary(
  avgPain: number,
  trend: number,
  streak: number,
  totalEntries: number
): string {
  const painDesc = describePainLevel(avgPain);
  const trendDesc = describeTrend(avgPain, avgPain - trend, totalEntries >= 7);
  
  if (totalEntries < 3) {
    return `You're just getting started with ${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'}. Keep logging to build a clearer picture of your pain patterns. Each entry helps us understand your unique experience better.`;
  }
  
  let summary = `Over the past week, your pain averaged around ${avgPain.toFixed(1)}/10, which falls in the "${painDesc.level}" range. `;
  
  if (trendDesc.direction === 'improving') {
    summary += `The good news: your pain has been trending downward. ${trendDesc.encouragement} `;
  } else if (trendDesc.direction === 'worsening') {
    summary += `We noticed pain has been trending upward recently. ${trendDesc.encouragement} `;
  } else {
    summary += `Your levels have been relatively stable. ${trendDesc.encouragement} `;
  }
  
  if (streak > 1) {
    summary += `With ${streak} days of consistent tracking, you're building valuable data for pattern recognition.`;
  } else {
    summary += `Regular tracking will help us spot patterns and provide better insights.`;
  }
  
  return summary;
}

// ============================================
// Time-of-Day Pattern Analysis
// ============================================

export interface TimeOfDayPattern {
  segment: 'morning' | 'afternoon' | 'evening' | 'night';
  avgPain: number;
  entryCount: number;
  trend: 'better' | 'worse' | 'neutral';
}

export interface TimeOfDayAnalysis {
  patterns: TimeOfDayPattern[];
  bestTimeOfDay: string | null;
  worstTimeOfDay: string | null;
  insight: string;
  recommendation: string;
  hasEnoughData: boolean;
}

function getTimeSegment(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const SEGMENT_LABELS: Record<string, string> = {
  morning: 'Morning (5am-12pm)',
  afternoon: 'Afternoon (12pm-5pm)',
  evening: 'Evening (5pm-10pm)',
  night: 'Night (10pm-5am)',
};

const SEGMENT_FRIENDLY: Record<string, string> = {
  morning: 'mornings',
  afternoon: 'afternoons',
  evening: 'evenings',
  night: 'nights',
};

export function analyzeTimeOfDayPatterns(entries: PainEntry[]): TimeOfDayAnalysis {
  if (entries.length < 5) {
    const seed = `tod|insufficient|${entries.length}`;
    return {
      patterns: [],
      bestTimeOfDay: null,
      worstTimeOfDay: null,
      insight: pickVariant(seed, [
        'We need more entries to analyze your time-of-day patterns in a meaningful way.',
        'We need more entries before we can confidently spot time-of-day patterns.',
        'We need more entries to see whether mornings, afternoons, or evenings tend to differ.',
      ]),
      recommendation: pickVariant(seed + '|rec', [
        'Try logging at different times throughout the day so the pattern is clearer.',
        'Try logging at a few different times in the day to make patterns easier to detect.',
        'If you can, add a few entries across different times of day to sharpen this analysis.',
      ]),
      hasEnoughData: false,
    };
  }

  // Group entries by time segment
  const segmentData: Record<string, { totalPain: number; count: number }> = {
    morning: { totalPain: 0, count: 0 },
    afternoon: { totalPain: 0, count: 0 },
    evening: { totalPain: 0, count: 0 },
    night: { totalPain: 0, count: 0 },
  };

  for (const entry of entries) {
    const hour = new Date(entry.timestamp).getHours();
    const segment = getTimeSegment(hour);
    segmentData[segment].totalPain += entry.baselineData.pain;
    segmentData[segment].count++;
  }

  // Calculate averages and build patterns
  const patterns: TimeOfDayPattern[] = [];
  let bestSegment: { segment: string; avg: number } | null = null;
  let worstSegment: { segment: string; avg: number } | null = null;

  for (const [segment, data] of Object.entries(segmentData)) {
    if (data.count >= 2) {
      const avgPain = data.totalPain / data.count;
      patterns.push({
        segment: segment as TimeOfDayPattern['segment'],
        avgPain,
        entryCount: data.count,
        trend: 'neutral', // Would need historical comparison for trend
      });

      if (!bestSegment || avgPain < bestSegment.avg) {
        bestSegment = { segment, avg: avgPain };
      }
      if (!worstSegment || avgPain > worstSegment.avg) {
        worstSegment = { segment, avg: avgPain };
      }
    }
  }

  // Only consider meaningful differences (> 1 point)
  const hasMeaningfulDifference = bestSegment && worstSegment && 
    (worstSegment.avg - bestSegment.avg) >= 1;

  const seed = [
    'tod',
    bestSegment?.segment ?? 'none',
    worstSegment?.segment ?? 'none',
    Math.round((bestSegment?.avg ?? 0) * 10),
    Math.round((worstSegment?.avg ?? 0) * 10),
    patterns.length,
  ].join('|');

  let insight: string;
  let recommendation: string;

  if (hasMeaningfulDifference && bestSegment && worstSegment) {
    const diff = (worstSegment.avg - bestSegment.avg).toFixed(1);
    insight = pickVariant(seed, [
      `Your pain tends to be ${diff} points higher in the ${SEGMENT_FRIENDLY[worstSegment.segment]} compared to ${SEGMENT_FRIENDLY[bestSegment.segment]}. This is a helpful pattern to plan around.`,
      `A clear time-of-day pattern shows up: pain is about ${diff} points higher in the ${SEGMENT_FRIENDLY[worstSegment.segment]} than in the ${SEGMENT_FRIENDLY[bestSegment.segment]}.`,
      `Your logs suggest pain runs higher in the ${SEGMENT_FRIENDLY[worstSegment.segment]} (by ~${diff} points) compared with the ${SEGMENT_FRIENDLY[bestSegment.segment]}.`,
    ]);
    
    if (worstSegment.segment === 'morning') {
      recommendation = pickVariant(seed + '|morning', [
        'Morning stiffness is common. Gentle stretching before bed and/or upon waking might help.',
        'If mornings are harder, try a gentle warm-up routine before getting moving.',
        'If mornings are rough, consider a slower start and gentle mobility work.',
      ]);
    } else if (worstSegment.segment === 'evening') {
      recommendation = pickVariant(seed + '|evening', [
        'Evening pain increases often relate to daily load. Consider pacing and a pre-evening wind-down routine.',
        'If evenings trend higher, pacing earlier in the day can soften the late-day spike.',
        'Try planning a lighter late afternoon if evenings are consistently harder.',
      ]);
    } else if (worstSegment.segment === 'night') {
      recommendation = pickVariant(seed + '|night', [
        'Night pain can affect sleep quality. Consider sleep positioning and discuss persistent sleep disruption with your care team.',
        'If nights are tougher, sleep positioning and a consistent wind-down routine may help.',
        'If night pain is frequent, consider tracking sleep setup and discussing it with your care team.',
      ]);
    } else {
      recommendation = pickVariant(seed + '|afternoon', [
        'Afternoon spikes might relate to activity levels. Try scheduling a short rest break before your usual peak.',
        'If afternoons are higher, a planned pause (even 5–10 minutes) can reduce build-up.',
        'Consider adding a short break or lighter task block before your typical afternoon peak.',
      ]);
    }
  } else {
    insight = pickVariant(seed + '|consistent', [
      'Your pain levels are relatively consistent throughout the day, without a strong time-based swing.',
      'Your pain looks fairly consistent across different times of day.',
      'Across the day, your pain seems consistent rather than clustering at a specific time.',
    ]);
    recommendation = pickVariant(seed + '|consistent|rec', [
      'Consistent patterns suggest steady management. Keep noting any variations and what seems to help.',
      'Since things look consistent, notes about triggers/relief can be especially useful for context.',
      'Even with consistent averages, outlier days matter — keep logging what was different.',
    ]);
  }

  return {
    patterns,
    bestTimeOfDay: bestSegment ? SEGMENT_LABELS[bestSegment.segment] : null,
    worstTimeOfDay: worstSegment ? SEGMENT_LABELS[worstSegment.segment] : null,
    insight,
    recommendation,
    hasEnoughData: patterns.length >= 2,
  };
}

// ============================================
// Day-of-Week Pattern Analysis
// ============================================

export interface DayOfWeekPattern {
  day: string;
  dayIndex: number;
  avgPain: number;
  entryCount: number;
}

export interface DayOfWeekAnalysis {
  patterns: DayOfWeekPattern[];
  bestDay: string | null;
  worstDay: string | null;
  weekdayAvg: number | null;
  weekendAvg: number | null;
  insight: string;
  hasEnoughData: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function analyzeDayOfWeekPatterns(entries: PainEntry[]): DayOfWeekAnalysis {
  if (entries.length < 7) {
    const seed = `dow|insufficient|${entries.length}`;
    return {
      patterns: [],
      bestDay: null,
      worstDay: null,
      weekdayAvg: null,
      weekendAvg: null,
      insight: pickVariant(seed, [
        'We need at least a week of entries to analyze daily patterns with confidence.',
        'We need at least a week of entries before daily patterns are reliable.',
        'We need at least a week of entries to spot whether certain days tend to run higher or lower.',
      ]),
      hasEnoughData: false,
    };
  }

  // Group by day of week
  const dayData: Array<{ totalPain: number; count: number }> = 
    Array.from({ length: 7 }, () => ({ totalPain: 0, count: 0 }));

  for (const entry of entries) {
    const dayIndex = new Date(entry.timestamp).getDay();
    dayData[dayIndex].totalPain += entry.baselineData.pain;
    dayData[dayIndex].count++;
  }

  // Build patterns
  const patterns: DayOfWeekPattern[] = [];
  let bestDay: { day: string; avg: number } | null = null;
  let worstDay: { day: string; avg: number } | null = null;
  let weekdayTotal = 0, weekdayCount = 0;
  let weekendTotal = 0, weekendCount = 0;

  for (let i = 0; i < 7; i++) {
    const data = dayData[i];
    if (data.count > 0) {
      const avgPain = data.totalPain / data.count;
      patterns.push({
        day: DAY_NAMES[i],
        dayIndex: i,
        avgPain,
        entryCount: data.count,
      });

      if (!bestDay || avgPain < bestDay.avg) {
        bestDay = { day: DAY_NAMES[i], avg: avgPain };
      }
      if (!worstDay || avgPain > worstDay.avg) {
        worstDay = { day: DAY_NAMES[i], avg: avgPain };
      }

      // Weekend vs weekday
      if (i === 0 || i === 6) {
        weekendTotal += data.totalPain;
        weekendCount += data.count;
      } else {
        weekdayTotal += data.totalPain;
        weekdayCount += data.count;
      }
    }
  }

  const weekdayAvg = weekdayCount > 0 ? weekdayTotal / weekdayCount : null;
  const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : null;

  // Generate insight
  let insight: string;

  const seed = [
    'dow',
    bestDay?.day ?? 'none',
    worstDay?.day ?? 'none',
    Math.round((weekdayAvg ?? 0) * 10),
    Math.round((weekendAvg ?? 0) * 10),
    patterns.length,
  ].join('|');
  
  if (weekdayAvg !== null && weekendAvg !== null) {
    const diff = weekendAvg - weekdayAvg;
    if (Math.abs(diff) >= 1) {
      if (diff > 0) {
        insight = pickVariant(seed, [
          `Interestingly, your pain averages ${Math.abs(diff).toFixed(1)} points higher on weekends. Activity changes or different routines might be a factor.`,
          `Weekends run higher by about ${Math.abs(diff).toFixed(1)} points on average. Routine shifts may be contributing.`,
          `Your weekends look higher (${Math.abs(diff).toFixed(1)} points on average). It may be worth reviewing weekend activities and pacing.`,
        ]);
      } else {
        insight = pickVariant(seed, [
          `Good news: weekends tend to be ${Math.abs(diff).toFixed(1)} points better for you. The change in routine seems to help.`,
          `Weekends look better by about ${Math.abs(diff).toFixed(1)} points on average — your routine shift may be helping.`,
          `Your weekends tend to be lower (${Math.abs(diff).toFixed(1)} points on average). Consider what changes on weekends that might be protective.`,
        ]);
      }
    } else if (bestDay && worstDay && (worstDay.avg - bestDay.avg) >= 1.5) {
      insight = pickVariant(seed, [
        `${worstDay.day}s tend to be your toughest (${worstDay.avg.toFixed(1)}/10), while ${bestDay.day}s are usually better (${bestDay.avg.toFixed(1)}/10).`,
        `A day-of-week pattern shows up: ${worstDay.day}s run highest (${worstDay.avg.toFixed(1)}/10) and ${bestDay.day}s run lowest (${bestDay.avg.toFixed(1)}/10).`,
        `Your logs suggest ${worstDay.day}s are hardest (${worstDay.avg.toFixed(1)}/10) and ${bestDay.day}s are easier (${bestDay.avg.toFixed(1)}/10).`,
      ]);
    } else {
      insight = pickVariant(seed, [
        'Your pain levels are fairly consistent across the week.',
        'Across the week, pain looks relatively consistent day to day.',
        'No strong day-of-week swing shows up — your week looks fairly consistent.',
      ]);
    }
  } else {
    insight = pickVariant(seed, [
      'Keep tracking to reveal weekly patterns.',
      'Keep logging — weekly patterns often emerge with a bit more history.',
      'More entries will make weekly patterns easier to detect.',
    ]);
  }

  return {
    patterns,
    bestDay: bestDay?.day ?? null,
    worstDay: worstDay?.day ?? null,
    weekdayAvg,
    weekendAvg,
    insight,
    hasEnoughData: patterns.length >= 5,
  };
}

// ============================================
// Trigger Correlation Analysis
// ============================================

export interface TriggerCorrelation {
  trigger: string;
  avgPainWith: number;
  avgPainWithout: number;
  occurrences: number;
  impact: 'strong' | 'moderate' | 'weak' | 'none';
  humanized: string;
}

export interface TriggerAnalysis {
  correlations: TriggerCorrelation[];
  topTrigger: string | null;
  insight: string;
  hasEnoughData: boolean;
}

export function analyzeTriggerPatterns(entries: PainEntry[]): TriggerAnalysis {
  if (entries.length < 10) {
    const seed = `trigger|insufficient|${entries.length}`;
    return {
      correlations: [],
      topTrigger: null,
      insight: pickVariant(seed, [
        'More entries needed to identify trigger patterns.',
        'More entries needed before trigger patterns are reliable.',
        'More entries needed — keep logging triggers so patterns can emerge.',
      ]),
      hasEnoughData: false,
    };
  }

  // Collect all triggers and their associated pain levels
  const triggerStats: Map<string, { totalPain: number; count: number }> = new Map();
  let totalPainAll = 0;
  let countAll = 0;

  for (const entry of entries) {
    const pain = entry.baselineData.pain;
    totalPainAll += pain;
    countAll++;

    const triggers = entry.triggers ?? [];
    for (const trigger of triggers) {
      const existing = triggerStats.get(trigger) ?? { totalPain: 0, count: 0 };
      existing.totalPain += pain;
      existing.count++;
      triggerStats.set(trigger, existing);
    }
  }

  const overallAvg = countAll > 0 ? totalPainAll / countAll : 0;

  // Build correlations
  const correlations: TriggerCorrelation[] = [];
  let strongestTrigger: { trigger: string; impact: number } | null = null;

  for (const [trigger, stats] of triggerStats) {
    if (stats.count >= 3) { // Need at least 3 occurrences
      const avgWithTrigger = stats.totalPain / stats.count;
      const entriesWithout = countAll - stats.count;
      const totalPainWithout = totalPainAll - stats.totalPain;
      const avgWithoutTrigger = entriesWithout > 0 ? totalPainWithout / entriesWithout : overallAvg;
      
      const impactScore = avgWithTrigger - avgWithoutTrigger;
      
      let impact: TriggerCorrelation['impact'];
      let humanized: string;

      const seed = [
        'trigger',
        trigger,
        Math.round(avgWithTrigger * 10),
        Math.round(avgWithoutTrigger * 10),
        Math.round(impactScore * 10),
      ].join('|');
      
      if (impactScore >= 2) {
        impact = 'strong';
        humanized = pickVariant(seed, [
          `When "${trigger}" is present, your pain averages ${impactScore.toFixed(1)} points higher. This is a significant pattern.`,
          `"${trigger}" stands out: pain runs about ${impactScore.toFixed(1)} points higher when it’s logged.`,
          `There’s a strong signal for "${trigger}": about ${impactScore.toFixed(1)} points higher pain on average when it appears.`,
        ]);
      } else if (impactScore >= 1) {
        impact = 'moderate';
        humanized = pickVariant(seed, [
          `"${trigger}" tends to coincide with about ${impactScore.toFixed(1)} points more pain.`,
          `When "${trigger}" shows up, pain is about ${impactScore.toFixed(1)} points higher on average.`,
          `"${trigger}" has a moderate association with higher pain (~${impactScore.toFixed(1)} points).`,
        ]);
      } else if (impactScore >= 0.5) {
        impact = 'weak';
        humanized = pickVariant(seed, [
          `"${trigger}" shows a slight association with higher pain levels.`,
          `"${trigger}" appears to be linked with a small uptick in pain.`,
          `A mild signal shows up for "${trigger}", but it’s not strong yet.`,
        ]);
      } else {
        impact = 'none';
        humanized = pickVariant(seed, [
          `"${trigger}" doesn't appear to significantly affect your pain levels.`,
          `"${trigger}" doesn’t show a clear pain difference in your logs so far.`,
          `No clear change shows up for "${trigger}" yet — keep logging for a stronger signal.`,
        ]);
      }

      correlations.push({
        trigger,
        avgPainWith: avgWithTrigger,
        avgPainWithout: avgWithoutTrigger,
        occurrences: stats.count,
        impact,
        humanized,
      });

      if (impactScore > 0 && (!strongestTrigger || impactScore > strongestTrigger.impact)) {
        strongestTrigger = { trigger, impact: impactScore };
      }
    }
  }

  // Sort by impact
  correlations.sort((a, b) => (b.avgPainWith - b.avgPainWithout) - (a.avgPainWith - a.avgPainWithout));

  // Generate insight
  let insight: string;
  const strongTriggers = correlations.filter(c => c.impact === 'strong' || c.impact === 'moderate');

  const insightSeed = [
    'trigger-insight',
    strongTriggers[0]?.trigger ?? 'none',
    strongTriggers.length,
    correlations.length,
  ].join('|');
  
  if (strongTriggers.length > 0) {
    const topTriggerNames = strongTriggers.slice(0, 3).map(c => `"${c.trigger}"`).join(', ');
    insight = pickVariant(insightSeed, [
      `Your data suggests ${topTriggerNames} ${strongTriggers.length === 1 ? 'has' : 'have'} the strongest correlation with higher pain levels. Consider discussing trigger management strategies.`,
      `The strongest trigger signals in your data are ${topTriggerNames}. If these are actionable, planning around them may help.`,
      `Triggers most linked with higher pain in your logs: ${topTriggerNames}. Consider pacing or mitigation strategies where possible.`,
    ]);
  } else if (correlations.length > 0) {
    // Keep required substring for unit tests.
    insight = pickVariant(insightSeed, [
      'No strong trigger patterns detected yet. Keep logging triggers to build more data.',
      'No strong trigger patterns detected yet. More consistent trigger notes will help clarify this.',
      'No strong trigger patterns detected yet. Keep logging — patterns often need more examples.',
    ]);
  } else {
    insight = pickVariant(insightSeed, [
      'Try adding triggers to your entries to help identify patterns.',
      'Try adding one or two triggers when you log — it helps patterns emerge.',
      'Add triggers when you can; even short notes can help spot patterns over time.',
    ]);
  }

  return {
    correlations: correlations.slice(0, 5), // Top 5
    topTrigger: strongestTrigger?.trigger ?? null,
    insight,
    hasEnoughData: correlations.length >= 2,
  };
}

// ============================================
// Comparative Insights (Week-over-Week)
// ============================================

export interface ComparativeInsight {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  humanized: string;
  trend: 'better' | 'worse' | 'same';
  encouragement: string;
}

export function generateComparativeInsight(
  currentWeekEntries: PainEntry[],
  previousWeekEntries: PainEntry[]
): ComparativeInsight | null {
  if (currentWeekEntries.length < 3 || previousWeekEntries.length < 3) {
    return null;
  }

  const currentAvg = currentWeekEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / currentWeekEntries.length;
  const previousAvg = previousWeekEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / previousWeekEntries.length;
  
  const change = currentAvg - previousAvg;
  const changePercent = previousAvg !== 0 ? (change / previousAvg) * 100 : 0;

  let trend: ComparativeInsight['trend'];
  let humanized: string;
  let encouragement: string;

  const seed = [
    'compare',
    Math.round(currentAvg * 10),
    Math.round(previousAvg * 10),
    Math.round(change * 10),
  ].join('|');

  if (change <= -1) {
    trend = 'better';
    // Keep required substring for unit tests: "lower"
    humanized = pickVariant(seed, [
      `This week's average (${currentAvg.toFixed(1)}/10) is ${Math.abs(change).toFixed(1)} points lower than last week (${previousAvg.toFixed(1)}/10).`,
      `Good news: your weekly average is lower (${currentAvg.toFixed(1)}/10) than last week (${previousAvg.toFixed(1)}/10) by ${Math.abs(change).toFixed(1)} points.`,
      `Compared with last week (${previousAvg.toFixed(1)}/10), this week is lower at ${currentAvg.toFixed(1)}/10 (down ${Math.abs(change).toFixed(1)} points).`,
    ]);
    encouragement = pickVariant(seed + '|enc', [
      'Real progress! Your efforts are paying off. Keep noting what helps.',
      'That’s a meaningful shift. Keep tracking what you did differently.',
      'Nice work — protecting the habits that help can keep this going.',
    ]);
  } else if (change >= 1) {
    trend = 'worse';
    // Keep required substring for unit tests: "tougher"
    humanized = pickVariant(seed, [
      `This week has been tougher—averaging ${currentAvg.toFixed(1)}/10 compared to ${previousAvg.toFixed(1)}/10 last week.`,
      `This week looks tougher (${currentAvg.toFixed(1)}/10) than last week (${previousAvg.toFixed(1)}/10).`,
      `It’s been a tougher week on average: ${currentAvg.toFixed(1)}/10 vs ${previousAvg.toFixed(1)}/10 last week.`,
    ]);
    encouragement = pickVariant(seed + '|enc', [
      'Setbacks happen. This data helps identify what to adjust.',
      'This is useful information — small adjustments may help bring things back down.',
      'If this continues, consider reviewing sleep, stress, pacing, and supports with your care team.',
    ]);
  } else {
    trend = 'same';
    // Keep required substring for unit tests: "similar"
    humanized = pickVariant(seed, [
      `Your average this week (${currentAvg.toFixed(1)}/10) is similar to last week (${previousAvg.toFixed(1)}/10).`,
      `This week is similar to last week: ${currentAvg.toFixed(1)}/10 vs ${previousAvg.toFixed(1)}/10.`,
      `Week over week, things look similar (${currentAvg.toFixed(1)}/10 vs ${previousAvg.toFixed(1)}/10).`,
    ]);
    encouragement = pickVariant(seed + '|enc', [
      'Consistency is valuable. Stable patterns help with treatment planning.',
      'Stability can be a win — keep noting what seems to maintain it.',
      'A steady week gives you a strong baseline for spotting future changes.',
    ]);
  }

  return {
    metric: 'Average Pain Level',
    currentValue: currentAvg,
    previousValue: previousAvg,
    changePercent,
    humanized,
    trend,
    encouragement,
  };
}

// ============================================
// Enhanced Data-Aware Greeting
// ============================================

export interface EnhancedGreeting {
  greeting: string;
  personalizedMessage: string;
  dataInsight: string | null;
  suggestion: string;
}

export function getEnhancedGreeting(
  recentEntries: PainEntry[],
  userName?: string
): EnhancedGreeting {
  const baseGreeting = getTimeBasedGreeting();
  
  // Personalize with name if available
  const greeting = userName 
    ? `${baseGreeting.greeting}, ${userName}`
    : baseGreeting.greeting;

  // Default personalized message
  let personalizedMessage = 'Ready to log how you\'re feeling?';
  let dataInsight: string | null = null;
  const suggestion = baseGreeting.suggestion;

  if (recentEntries.length === 0) {
    personalizedMessage = 'Start your tracking journey—your first entry awaits.';
  } else if (recentEntries.length < 3) {
    personalizedMessage = `You have ${recentEntries.length} ${recentEntries.length === 1 ? 'entry' : 'entries'} so far. A few more will help us spot patterns.`;
  } else {
    // Analyze recent data for personalized insight
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEntries = recentEntries.filter(e => new Date(e.timestamp) >= todayStart);
    const weekEntries = recentEntries.slice(0, Math.min(7, recentEntries.length));
    
    if (todayEntries.length > 0) {
      const todayAvg = todayEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / todayEntries.length;
      personalizedMessage = `You've logged ${todayEntries.length} ${todayEntries.length === 1 ? 'time' : 'times'} today.`;
      
      if (weekEntries.length >= 3) {
        const weekAvg = weekEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / weekEntries.length;
        const diff = todayAvg - weekAvg;
        
        if (diff <= -1) {
          dataInsight = `Today is trending better than your weekly average by ${Math.abs(diff).toFixed(1)} points.`;
        } else if (diff >= 1) {
          dataInsight = `Today has been ${diff.toFixed(1)} points higher than usual. Hope it eases soon.`;
        }
      }
    } else {
      personalizedMessage = 'No entries yet today. How are you feeling?';
      
      // Check last entry
      if (recentEntries.length > 0) {
        const lastEntry = recentEntries[0];
        const lastPain = lastEntry.baselineData.pain;
        const lastDate = new Date(lastEntry.timestamp);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince === 1) {
          dataInsight = `Yesterday you logged ${lastPain}/10. How does today compare?`;
        } else if (daysSince > 1 && daysSince <= 7) {
          dataInsight = `Your last entry was ${daysSince} days ago at ${lastPain}/10.`;
        }
      }
    }
  }

  return {
    greeting,
    personalizedMessage,
    dataInsight,
    suggestion,
  };
}

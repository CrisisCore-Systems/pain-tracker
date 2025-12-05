/**
 * Humanize Utility
 * 
 * Transforms raw pain tracking data into meaningful, empathetic language
 * that helps users understand their pain patterns in a supportive way.
 */

import type { PainEntry } from '../types';

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

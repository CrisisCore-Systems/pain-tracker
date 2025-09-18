/**
 * Hook for managing holistic progress tracking
 */

import { useState } from 'react';

interface Achievement {
  id: string;
  type: 'consistency' | 'self-care' | 'courage' | 'growth' | 'connection' | 'resilience';
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  celebrationLevel: 'gentle' | 'warm' | 'enthusiastic' | 'profound';
  personalMessage: string;
  suggestedReward?: string;
  shareableText?: string;
  timestamp: Date;
}

// Hook for managing holistic progress
export function useHolisticProgress() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyMetrics, setWeeklyMetrics] = useState<Record<string, number>>({});

  const recordAchievement = (achievement: Omit<Achievement, 'id' | 'timestamp'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: `${achievement.type}-${Date.now()}`,
      timestamp: new Date()
    };
    
    setAchievements(prev => [newAchievement, ...prev]);
    return newAchievement;
  };

  const updateWeeklyMetrics = (metrics: Record<string, number>) => {
    setWeeklyMetrics(prev => ({ ...prev, ...metrics }));
  };

  return {
    achievements,
    weeklyMetrics,
    recordAchievement,
    updateWeeklyMetrics
  };
}

export type { Achievement };

// Progress Celebration Component
// Celebrates achievements beyond pain reduction

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { localDayStart, isSameLocalDay } from '../../utils/dates';
import { Trophy, Star, Heart, Sparkles, Gift, Share2, Calendar, Target } from 'lucide-react';
import type { PainEntry } from '../../types';

interface ProgressCelebrationProps {
  entries: PainEntry[];
  onCelebrationShared?: (celebration: string) => void;
  onMilestoneReached?: (milestone: string) => void;
}

interface CelebrationAchievement {
  id: string;
  title: string;
  description: string;
  category: 'self_care' | 'awareness' | 'courage' | 'connection' | 'growth' | 'resilience';
  icon: string;
  celebrationMessage: string;
  achievedAt: string;
  shareableText: string;
  significance: 'daily' | 'weekly' | 'monthly' | 'milestone';
}

interface ProgressMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  celebrationThreshold: number;
}

export const ProgressCelebrationComponent: React.FC<ProgressCelebrationProps> = ({
  entries,
  onCelebrationShared,
  onMilestoneReached
}) => {
  const [achievements, setAchievements] = useState<CelebrationAchievement[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [selectedCelebration, setSelectedCelebration] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    generateAchievements();
    calculateProgressMetrics();
  }, [entries]);

  const generateAchievements = () => {
    const newAchievements: CelebrationAchievement[] = [];
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Daily achievements - use local-day comparison
  const todayEntries = entries.filter(entry => isSameLocalDay(entry.timestamp, today));

    if (todayEntries.length > 0) {
      newAchievements.push({
        id: 'daily-check-in',
        title: 'Daily Self-Care Check-in',
        description: 'You showed up for yourself today by tracking your experience',
        category: 'self_care',
        icon: '💚',
        celebrationMessage: 'Every time you check in with yourself, you\'re practicing self-compassion!',
        achievedAt: today.toISOString(),
        shareableText: 'I practiced self-care today by listening to my body and tracking my experience.',
        significance: 'daily'
      });
    }

  // Weekly achievements - use local-day start for comparison
  const weekEntries = entries.filter(entry => localDayStart(entry.timestamp) >= localDayStart(weekAgo));
    
    if (weekEntries.length >= 5) {
      newAchievements.push({
        id: 'consistent-week',
        title: 'Consistency Champion',
        description: 'You\'ve tracked consistently this week',
        category: 'growth',
        icon: '⭐',
        celebrationMessage: 'Your commitment to understanding yourself is truly admirable!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'ve been consistently tracking my health journey this week. Small steps, big progress!',
        significance: 'weekly'
      });
    }

    // Awareness achievements
    const entriesWithNotes = entries.filter(entry => entry.notes && entry.notes.length > 20);
    if (entriesWithNotes.length >= 3) {
      newAchievements.push({
        id: 'mindful-reflection',
        title: 'Mindful Reflection Master',
        description: 'You\'ve been thoughtfully documenting your experiences',
        category: 'awareness',
        icon: '🧠',
        celebrationMessage: 'Your self-awareness and reflection show incredible emotional intelligence!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'ve been practicing mindful reflection on my health journey.',
        significance: 'weekly'
      });
    }

    // Courage achievements
    const challengingDays = entries.filter(entry => entry.baselineData.pain >= 7);
    if (challengingDays.length > 0) {
      newAchievements.push({
        id: 'brave-tracking',
        title: 'Courage in Difficulty',
        description: 'You continued tracking even on challenging high-pain days',
        category: 'courage',
        icon: '🦁',
        celebrationMessage: 'It takes real courage to face difficult days with awareness and care!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'m showing courage by staying present with my experience, even on tough days.',
        significance: 'milestone'
      });
    }

    // Growth achievements
  const monthEntries = entries.filter(entry => localDayStart(entry.timestamp) >= localDayStart(monthAgo));
    if (monthEntries.length >= 20) {
      newAchievements.push({
        id: 'growth-journey',
        title: 'Growth Journey Explorer',
        description: 'A month of dedicated self-awareness and tracking',
        category: 'growth',
        icon: '🌱',
        celebrationMessage: 'Your dedication to growth and self-understanding is inspiring!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'ve been on a month-long journey of self-discovery and health awareness.',
        significance: 'milestone'
      });
    }

    // Connection achievements
    const communicationEntries = entries.filter(entry => 
      entry.notes && (
        entry.notes.toLowerCase().includes('talk') ||
        entry.notes.toLowerCase().includes('share') ||
        entry.notes.toLowerCase().includes('support')
      )
    );
    
    if (communicationEntries.length >= 3) {
      newAchievements.push({
        id: 'connection-builder',
        title: 'Connection Builder',
        description: 'You\'ve been reaching out and connecting with others',
        category: 'connection',
        icon: '🤝',
        celebrationMessage: 'Building connections and sharing your experience shows wisdom and strength!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'ve been building meaningful connections around my health journey.',
        significance: 'weekly'
      });
    }

    // Resilience achievements
    const recoveryDays = entries.filter((entry, index) => {
      if (index === 0) return false;
      const prevEntry = entries[index - 1];
      return prevEntry.baselineData.pain >= 7 && entry.baselineData.pain < 6;
    });

    if (recoveryDays.length >= 2) {
      newAchievements.push({
        id: 'resilience-champion',
        title: 'Resilience Champion',
        description: 'You\'ve shown recovery and resilience after difficult days',
        category: 'resilience',
        icon: '💪',
        celebrationMessage: 'Your ability to bounce back shows incredible inner strength!',
        achievedAt: today.toISOString(),
        shareableText: 'I\'m celebrating my resilience and ability to recover from challenging times.',
        significance: 'milestone'
      });
    }

    setAchievements(newAchievements);
  };

  const calculateProgressMetrics = () => {
    const metrics: ProgressMetric[] = [
      {
        name: 'Self-Awareness Days',
        value: entries.length,
        unit: 'days',
        description: 'Days you\'ve practiced mindful self-awareness',
        color: 'bg-purple-500',
        icon: <Heart className="w-4 h-4" />,
        celebrationThreshold: 30
      },
      {
        name: 'Reflection Entries',
        value: entries.filter(e => e.notes && e.notes.length > 10).length,
        unit: 'entries',
        description: 'Times you\'ve taken the time to reflect deeply',
        color: 'bg-blue-500',
        icon: <Star className="w-4 h-4" />,
        celebrationThreshold: 15
      },
      {
        name: 'Courage Moments',
        value: entries.filter(e => e.baselineData.pain >= 7).length,
        unit: 'moments',
        description: 'Times you\'ve shown courage during difficult experiences',
        color: 'bg-orange-500',
        icon: <Trophy className="w-4 h-4" />,
        celebrationThreshold: 5
      },
      {
        name: 'Growth Insights',
        value: entries.filter(e => e.notes && (
          e.notes.toLowerCase().includes('learn') ||
          e.notes.toLowerCase().includes('realize') ||
          e.notes.toLowerCase().includes('understand')
        )).length,
        unit: 'insights',
        description: 'Personal insights and learnings you\'ve gained',
        color: 'bg-green-500',
        icon: <Sparkles className="w-4 h-4" />,
        celebrationThreshold: 10
      }
    ];

    setProgressMetrics(metrics);
  };

  const handleCelebrate = (achievement: CelebrationAchievement) => {
    setSelectedCelebration(achievement.id);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setSelectedCelebration(null);
    }, 3000);

    if (achievement.significance === 'milestone') {
      onMilestoneReached?.(achievement.title);
    }
  };

  const handleShare = (achievement: CelebrationAchievement) => {
    onCelebrationShared?.(achievement.shareableText);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'self_care': return 'border-pink-300 bg-pink-50';
      case 'awareness': return 'border-purple-300 bg-purple-50';
      case 'courage': return 'border-orange-300 bg-orange-50';
      case 'connection': return 'border-blue-300 bg-blue-50';
      case 'growth': return 'border-green-300 bg-green-50';
      case 'resilience': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case 'self_care': return 'text-pink-700';
      case 'awareness': return 'text-purple-700';
      case 'courage': return 'text-orange-700';
      case 'connection': return 'text-blue-700';
      case 'growth': return 'text-green-700';
      case 'resilience': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-20 animate-pulse"></div>
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      {/* Progress Metrics */}
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Target className="w-5 h-5" />
            Your Progress Celebration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Celebrating achievements beyond pain scores
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progressMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg border">
                <div className={`w-12 h-12 ${metric.color} rounded-full flex items-center justify-center mx-auto mb-3 text-white`}>
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 mb-1">{metric.unit}</div>
                <div className="text-xs text-gray-500">{metric.description}</div>
                {metric.value >= metric.celebrationThreshold && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Milestone! 🎯
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
          <p className="text-sm text-gray-600">
            Celebrating your strength, courage, and growth
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCelebration === achievement.id
                    ? 'border-yellow-400 bg-yellow-50 transform scale-105'
                    : getCategoryColor(achievement.category)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryTextColor(achievement.category)} bg-white`}>
                          {achievement.category.replace('_', ' ')}
                        </span>
                        {achievement.significance === 'milestone' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                            Milestone!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="bg-white p-3 rounded-md border-l-4 border-l-yellow-400">
                        <p className="text-sm font-medium text-gray-800">
                          {achievement.celebrationMessage}
                        </p>
                      </div>
                      {selectedCelebration === achievement.id && (
                        <div className="mt-3 text-center">
                          <span className="inline-flex items-center gap-2 text-yellow-600 font-medium">
                            <Sparkles className="w-4 h-4" />
                            Celebrating You! 
                            <Sparkles className="w-4 h-4" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleCelebrate(achievement)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      disabled={selectedCelebration === achievement.id}
                    >
                      {selectedCelebration === achievement.id ? (
                        <Gift className="w-4 h-4" />
                      ) : (
                        <Trophy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(achievement)}
                      className="text-blue-600 border-blue-300"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {achievements.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Your Journey is Just Beginning
              </h3>
              <p className="text-gray-600">
                Every entry you make is an achievement worth celebrating. Keep going!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Celebration Summary */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Calendar className="w-5 h-5" />
            This Week's Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {entries.filter(e => localDayStart(e.timestamp) >= localDayStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).length}
                </div>
                <div className="text-xs text-gray-600">Days of Self-Care</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {achievements.filter(a => a.significance === 'weekly').length}
                </div>
                <div className="text-xs text-gray-600">Achievements</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {achievements.filter(a => a.significance === 'milestone').length}
                </div>
                <div className="text-xs text-gray-600">Milestones</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Every step on your journey matters and deserves recognition.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressCelebrationComponent;

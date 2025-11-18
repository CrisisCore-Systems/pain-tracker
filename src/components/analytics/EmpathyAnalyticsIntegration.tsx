// Empathy Analytics Integration Component
// Combines all empathy-driven analytics into a cohesive dashboard

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { Heart, Award, User, TrendingUp, Settings, Share2 } from 'lucide-react';
import EmpathyAnalyticsDashboard from './EmpathyAnalyticsDashboard';
import EmotionalValidationSystem from './EmotionalValidationSystem';
import ProgressCelebrationComponent from './ProgressCelebrationComponent';
import UserAgencyDashboard from './UserAgencyDashboard';
import type { PainEntry } from '../../types';
import type { Achievement } from '../../services/EmpathyDrivenAnalytics';

interface EmpathyAnalyticsIntegrationProps {
  userId: string;
  entries: PainEntry[];
  currentEntry?: PainEntry;
}

type AnalyticsView = 'overview' | 'validation' | 'celebration' | 'agency' | 'full-dashboard';

export const EmpathyAnalyticsIntegration: React.FC<EmpathyAnalyticsIntegrationProps> = ({
  userId,
  entries,
  currentEntry,
}) => {
  const [currentView, setCurrentView] = useState<AnalyticsView>('overview');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebratedAchievement, setCelebratedAchievement] = useState<Achievement | null>(null);

  const handleValidationGiven = useCallback((validationType: string) => {
    console.log('Validation given:', validationType);
    // In a real app, this would update analytics or trigger celebrations
  }, []);

  const handleInsightShared = useCallback((insight: string) => {
    console.log('Insight shared:', insight);
    // In a real app, this would handle sharing to community or healthcare team
  }, []);

  const handleCelebration = useCallback((achievement: Achievement) => {
    setCelebratedAchievement(achievement);
    setShowCelebrationModal(true);

    // Auto-close after celebration
    setTimeout(() => {
      setShowCelebrationModal(false);
      setCelebratedAchievement(null);
    }, 3000);
  }, []);

  const handleCelebrationShared = useCallback((celebration: string) => {
    console.log('Celebration shared:', celebration);
    // In a real app, this would share to social media or support network
  }, []);

  const handleMilestoneReached = useCallback((milestone: string) => {
    console.log('Milestone reached:', milestone);
    // In a real app, this would trigger special celebrations or notifications
  }, []);

  const handleChoiceMade = useCallback((choice: string, category: string) => {
    console.log('Choice made:', choice, 'in category:', category);
    // In a real app, this would update user preferences
  }, []);

  const handleGoalSet = useCallback((goal: string) => {
    console.log('Goal set:', goal);
    // In a real app, this would save to user profile
  }, []);

  const navigationItems = [
    {
      key: 'overview' as const,
      label: 'Overview',
      icon: TrendingUp,
      description: 'Quick snapshot of your empathy analytics',
    },
    {
      key: 'validation' as const,
      label: 'Emotional Support',
      icon: Heart,
      description: 'Validation and emotional feedback',
    },
    {
      key: 'celebration' as const,
      label: 'Achievements',
      icon: Award,
      description: 'Celebrate your progress and growth',
    },
    {
      key: 'agency' as const,
      label: 'Your Control',
      icon: User,
      description: 'Reinforce your autonomy and choices',
    },
    {
      key: 'full-dashboard' as const,
      label: 'Full Dashboard',
      icon: Settings,
      description: 'Complete analytics experience',
    },
  ];

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Welcome to Your Empathy Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              This space honors your full experience—not just your pain scores, but your courage,
              growth, insights, and strength. Every entry you make is an act of self-care and
              bravery.
            </p>
            <div className="flex justify-center space-x-2 text-2xl">
              <span>💜</span>
              <span>🌟</span>
              <span>🤗</span>
              <span>💪</span>
              <span>🌈</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">{entries.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Days of Self-Care</div>
            <div className="text-xs text-pink-700 mt-1">Every entry matters</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {entries.filter(e => e.notes && e.notes.length > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reflection Moments</div>
            <div className="text-xs text-blue-700 mt-1">Self-awareness is strength</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.floor(entries.length / 7)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Weeks of Journey</div>
            <div className="text-xs text-green-700 mt-1">Persistence pays off</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {entries.filter(e => e.baselineData.pain >= 7).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Courage Moments</div>
            <div className="text-xs text-orange-700 mt-1">Brave through the tough days</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Entry Validation */}
      {currentEntry && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Heart className="w-5 h-5" />
              Today's Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionalValidationSystem
              painEntry={currentEntry}
              onValidationGiven={handleValidationGiven}
              onInsightShared={handleInsightShared}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Navigation */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800 dark:text-gray-200">Explore Your Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {navigationItems.slice(1, 5).map(item => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.key}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left"
                  onClick={() => setCurrentView(item.key)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CelebrationModal = () => {
    if (!showCelebrationModal || !celebratedAchievement) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center space-y-4 animate-pulse">
          <div className="text-4xl">{celebratedAchievement.icon}</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {celebratedAchievement.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {celebratedAchievement.celebrationMessage}
          </p>
          <div className="text-2xl">🎉 ✨ 🌟</div>
          <Button
            onClick={() =>
              handleCelebrationShared(
                celebratedAchievement.shareableMessage || celebratedAchievement.celebrationMessage
              )
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share This Win
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 bg-white rounded-lg p-1 border shadow-sm">
            {navigationItems.map(item => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentView === item.key
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'overview' && <OverviewSection />}

          {currentView === 'validation' && currentEntry && (
            <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-700">
                  <Heart className="w-6 h-6" />
                  Emotional Validation & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmotionalValidationSystem
                  painEntry={currentEntry}
                  onValidationGiven={handleValidationGiven}
                  onInsightShared={handleInsightShared}
                />
              </CardContent>
            </Card>
          )}

          {currentView === 'celebration' && (
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Award className="w-6 h-6" />
                  Progress Celebration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressCelebrationComponent
                  entries={entries}
                  onCelebrationShared={handleCelebrationShared}
                  onMilestoneReached={handleMilestoneReached}
                />
              </CardContent>
            </Card>
          )}

          {currentView === 'agency' && (
            <UserAgencyDashboard
              entries={entries}
              userId={userId}
              onChoiceMade={handleChoiceMade}
              onGoalSet={handleGoalSet}
              onPreferenceUpdated={() => {}} // Placeholder for now
            />
          )}

          {currentView === 'full-dashboard' && (
            <EmpathyAnalyticsDashboard
              userId={userId}
              entries={entries}
              onCelebrate={handleCelebration}
              onShare={handleCelebrationShared}
            />
          )}
        </div>

        {/* Celebration Modal */}
        <CelebrationModal />
      </div>
    </div>
  );
};

export default EmpathyAnalyticsIntegration;

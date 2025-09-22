// Empathy-Driven Analytics Dashboard Component
// Displays emotional validation, progress celebration, and dignity-preserving analytics

import React, { useState, useEffect } from 'react';
import { formatNumber } from '../../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { Heart, Award, User, TrendingUp, Star, Sparkles, Trophy, MessageCircle } from 'lucide-react';
import { 
  EmpathyDrivenAnalyticsService,
  EmotionalValidationMetrics,
  ProgressCelebrationMetrics,
  UserAgencyMetrics,
  DignityPreservingReport,
  Achievement,
  Milestone 
} from '../../services/EmpathyDrivenAnalytics';
import type { PainEntry } from '../../types';

interface EmpathyAnalyticsDashboardProps {
  userId: string;
  entries: PainEntry[];
  onCelebrate?: (achievement: Achievement) => void;
  onShare?: (message: string) => void;
}

export const EmpathyAnalyticsDashboard: React.FC<EmpathyAnalyticsDashboardProps> = ({
  userId,
  entries,
  onCelebrate,
  onShare
}) => {
  const [analyticsService] = useState(() => new EmpathyDrivenAnalyticsService({
    validationThreshold: 70,
    celebrationFrequency: 'daily',
    reportingStyle: 'balanced',
    privacyLevel: 'personal',
    languagePreference: 'everyday'
  }));

  const [validationMetrics, setValidationMetrics] = useState<EmotionalValidationMetrics | null>(null);
  const [celebrationMetrics, setCelebrationMetrics] = useState<ProgressCelebrationMetrics | null>(null);
  const [agencyMetrics, setAgencyMetrics] = useState<UserAgencyMetrics | null>(null);
  const [dignityReport, setDignityReport] = useState<DignityPreservingReport | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [activeTab, setActiveTab] = useState<'validation' | 'celebration' | 'agency' | 'dignity'>('validation');

  useEffect(() => {
    loadAnalytics();
  }, [userId, entries, selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      const [validation, celebration, agency, dignity] = await Promise.all([
        analyticsService.calculateEmotionalValidation(userId, entries, selectedTimeframe),
        analyticsService.generateProgressCelebration(userId, entries),
        analyticsService.calculateUserAgency(userId, entries),
        analyticsService.generateDignityPreservingReport(userId, entries)
      ]);

      setValidationMetrics(validation);
      setCelebrationMetrics(celebration);
      setAgencyMetrics(agency);
      setDignityReport(dignity);
    } catch (error) {
      console.error('Failed to load empathy analytics:', error);
    }
  };

  const ValidationDashboard = () => (
    <div className="space-y-6">
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Heart className="w-5 h-5" />
            Emotional Validation Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-pink-600 mb-2">
              {validationMetrics ? formatNumber(validationMetrics.validationScore, 0) : '0'}%
            </div>
            <p className="text-gray-600">Your feelings and experiences are valid and acknowledged</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">
                {validationMetrics?.validationSources.selfValidation || 0}%
              </div>
              <p className="text-sm text-gray-600">Self-Validation</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-green-600">
                {validationMetrics?.validationSources.communitySupport || 0}%
              </div>
              <p className="text-sm text-gray-600">Community Support</p>
            </div>
          </div>

          {validationMetrics?.emotionalTrends.copingStrategiesUsed && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-700">Coping Strategies You've Used</h4>
              <div className="flex flex-wrap gap-2">
                {validationMetrics.emotionalTrends.copingStrategiesUsed.map((strategy, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize"
                  >
                    {strategy}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const CelebrationDashboard = () => (
    <div className="space-y-6">
      {/* Recent Achievements */}
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {celebrationMetrics?.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {achievement.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-sm font-medium text-yellow-700">{achievement.celebrationMessage}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-yellow-700 border-yellow-300"
                      onClick={() => onCelebrate?.(achievement)}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    {achievement.shareableMessage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-700 border-blue-300"
                        onClick={() => onShare?.(achievement.shareableMessage!)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Growth */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="w-5 h-5" />
            Personal Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-green-600">
                {celebrationMetrics?.personalGrowth.selfAwareness || 0}%
              </div>
              <p className="text-sm text-gray-600">Self-Awareness</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">
                {celebrationMetrics?.personalGrowth.copingSkills || 0}%
              </div>
              <p className="text-sm text-gray-600">Coping Skills</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">
                {celebrationMetrics?.personalGrowth.communicationImprovement || 0}%
              </div>
              <p className="text-sm text-gray-600">Communication</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-orange-600">
                {celebrationMetrics?.personalGrowth.boundarySettingProgress || 0}%
              </div>
              <p className="text-sm text-gray-600">Boundaries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      {celebrationMetrics?.milestones && celebrationMetrics.milestones.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Star className="w-5 h-5" />
              Recent Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {celebrationMetrics.milestones.slice(0, 2).map((milestone) => (
                <div key={milestone.id} className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  <p className="text-sm font-medium text-purple-700 mb-3">"{milestone.personalMeaning}"</p>
                  <div className="flex flex-wrap gap-1">
                    {milestone.nextSteps.map((step, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const AgencyDashboard = () => (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <User className="w-5 h-5" />
            Your Agency & Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {agencyMetrics ? formatNumber(agencyMetrics.decisionMakingPower, 0) : '0'}%
            </div>
            <p className="text-gray-600">You have control and choice in your journey</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-semibold text-green-600">
                {agencyMetrics ? formatNumber(agencyMetrics.selfAdvocacyScore, 0) : '0'}%
              </div>
              <p className="text-sm text-gray-600">Self-Advocacy</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">
                {agencyMetrics?.choiceExercised.dailyChoices || 0}
              </div>
              <p className="text-sm text-gray-600">Daily Choices Made</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-700">Areas of Empowerment</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Education Seeking</span>
                <span className="font-medium text-blue-600">
                  {agencyMetrics?.empowermentActivities.educationSeeking || 0} activities
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resource Utilization</span>
                <span className="font-medium text-green-600">
                  {agencyMetrics?.empowermentActivities.resourceUtilization || 0} resources
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Self-Care Initiatives</span>
                <span className="font-medium text-purple-600">
                  {agencyMetrics?.empowermentActivities.selfCareInitiatives || 0} initiatives
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DignityDashboard = () => (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Heart className="w-5 h-5" />
            Your Strengths & Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Your Strengths</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-emerald-700 mb-2">Resilience</h5>
                  <div className="space-y-1">
                    {dignityReport?.strengthsBased.resilience.map((strength, index) => (
                      <span 
                        key={index}
                        className="block text-xs text-gray-600 bg-emerald-50 px-2 py-1 rounded"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2">Wisdom</h5>
                  <div className="space-y-1">
                    {dignityReport?.strengthsBased.wisdom.map((wisdom, index) => (
                      <span 
                        key={index}
                        className="block text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded"
                      >
                        {wisdom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Values */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Your Values & Priorities</h4>
              <div className="flex flex-wrap gap-2">
                {dignityReport?.personCentered.values.map((value, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            {/* Growth & Learning */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Growth & Learning</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-purple-700 mb-2">Key Learnings</h5>
                  <div className="space-y-1">
                    {dignityReport?.growthOriented.learnings.map((learning, index) => (
                      <p key={index} className="text-sm text-gray-600 italic">
                        "{learning}"
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-2">New Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {dignityReport?.growthOriented.newSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Journey Dashboard</h1>
        <p className="text-gray-600">
          Celebrating your strength, honoring your experience, and recognizing your growth
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 border">
          {(['daily', 'weekly', 'monthly'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 border">
          {([
            { key: 'validation', label: 'Validation', icon: Heart },
            { key: 'celebration', label: 'Achievements', icon: Trophy },
            { key: 'agency', label: 'Your Agency', icon: User },
            { key: 'dignity', label: 'Strengths', icon: Star }
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'validation' && <ValidationDashboard />}
      {activeTab === 'celebration' && <CelebrationDashboard />}
      {activeTab === 'agency' && <AgencyDashboard />}
      {activeTab === 'dignity' && <DignityDashboard />}
    </div>
  );
};

export default EmpathyAnalyticsDashboard;

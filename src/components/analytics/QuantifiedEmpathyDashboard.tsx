/**
 * Quantified Empathy Metrics Dashboard
 * Comprehensive dashboard displaying all empathy-driven metrics with visualizations and insights
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatNumber } from '../../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { 
  Heart, Brain, Lightbulb, Target, TrendingUp, Award, 
  Battery, Star, Sparkles, 
  BarChart3, AlertTriangle
} from 'lucide-react';
import { 
  QuantifiedEmpathyMetrics,
  EmotionalStateMetrics,
  HolisticWellbeingMetrics,
  DigitalPacingSystem,
  MoodEntry,
  EmpathyInsight,
  EmpathyRecommendation
} from '../../types/quantified-empathy';
import { EmpathyDrivenAnalyticsService } from '../../services/EmpathyDrivenAnalytics';
import { EmotionalStateTracker } from '../../services/EmotionalStateTracker';
import { HolisticWellbeingService } from '../../services/HolisticWellbeingService';
import type { PainEntry } from '../../types';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { emptyStates } from '../../content/microcopy';

interface QuantifiedEmpathyDashboardProps {
  userId: string;
  painEntries: PainEntry[];
  moodEntries?: MoodEntry[];
  onInsightSelect?: (insight: EmpathyInsight) => void;
  onRecommendationAccept?: (recommendation: EmpathyRecommendation) => void;
  onShareMetrics?: (metrics: QuantifiedEmpathyMetrics) => void;
  showAdvancedMetrics?: boolean;
}

type DashboardView = 'overview' | 'emotional-intelligence' | 'wellbeing' | 'pacing' | 'insights' | 'trends';

export const QuantifiedEmpathyDashboard: React.FC<QuantifiedEmpathyDashboardProps> = ({
  userId,
  painEntries,
  moodEntries = [],
  onInsightSelect,
  onRecommendationAccept,
  onShareMetrics
}) => {
  // Adaptive tone copy
  const noTrendsHeadline = useAdaptiveCopy(emptyStates.noTrends.headline);
  const noTrendsSubtext = useAdaptiveCopy(emptyStates.noTrends.subtext);

  // Services
  const [analyticsService] = useState(() => new EmpathyDrivenAnalyticsService({
    validationThreshold: 70,
    celebrationFrequency: 'daily',
    reportingStyle: 'balanced',
    privacyLevel: 'personal',
    languagePreference: 'everyday'
  }));
  
  const [emotionalTracker] = useState(() => new EmotionalStateTracker());
  const [wellbeingService] = useState(() => new HolisticWellbeingService());

  // State
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Metrics state
  const [quantifiedEmpathy, setQuantifiedEmpathy] = useState<QuantifiedEmpathyMetrics | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalStateMetrics | null>(null);
  const [wellbeingMetrics, setWellbeingMetrics] = useState<HolisticWellbeingMetrics | null>(null);
  const [pacingSystem, setPacingSystem] = useState<DigitalPacingSystem | null>(null);
  const [insights, setInsights] = useState<EmpathyInsight[]>([]);
  const [recommendations, setRecommendations] = useState<EmpathyRecommendation[]>([]);

  // Track if we're already loading to prevent concurrent loads
  const loadingRef = useRef(false);

  // Load all metrics
  useEffect(() => {
    // Prevent concurrent loads
    if (loadingRef.current) return;
    
    const loadAllMetrics = async () => {
      loadingRef.current = true;
      setIsLoading(true);
      try {
        // Load emotional state metrics
        const emotionalMetrics = await emotionalTracker.calculateEmotionalStateMetrics(userId, painEntries);
        setEmotionalState(emotionalMetrics);

        // Load wellbeing metrics
        const wellbeing = await wellbeingService.calculateWellbeingMetrics(userId, painEntries, moodEntries);
        setWellbeingMetrics(wellbeing);

        // Load pacing system
        const pacing = await wellbeingService.calculateDigitalPacing(userId, painEntries, moodEntries);
        setPacingSystem(pacing);

        // Load quantified empathy metrics
        const empathyMetrics = await analyticsService.calculateQuantifiedEmpathy(
          userId, 
          painEntries, 
          moodEntries,
          emotionalMetrics,
          wellbeing,
          pacing
        );
        setQuantifiedEmpathy(empathyMetrics);

        // Generate insights and recommendations
        const generatedInsights = generateInsights(empathyMetrics, emotionalMetrics, wellbeing, pacing);
        const generatedRecommendations = generateRecommendations(empathyMetrics, emotionalMetrics, wellbeing, pacing);
        
        setInsights(generatedInsights);
        setRecommendations(generatedRecommendations);

      } catch (error) {
        console.error('Failed to load empathy metrics:', error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadAllMetrics();
    // Only depend on essential data that should trigger reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, timeframe]);

  // Generate insights from all metrics
  const generateInsights = useCallback((
    empathy: QuantifiedEmpathyMetrics,
    emotional: EmotionalStateMetrics,
    wellbeing: HolisticWellbeingMetrics,
    pacing: DigitalPacingSystem
  ): EmpathyInsight[] => {
    const insights: EmpathyInsight[] = [];

    // Emotional Intelligence insights
    if (empathy.emotionalIntelligence.selfAwareness > 80) {
      insights.push({
        id: 'high-self-awareness',
        type: 'celebration',
        title: 'Exceptional Self-Awareness',
        description: `Your self-awareness score of ${empathy.emotionalIntelligence.selfAwareness}% shows remarkable emotional intelligence. You have deep insight into your emotions and patterns.`,
        confidence: 95,
        actionable: true,
        personalized: true,
        timestamp: new Date(),
        dataPoints: ['emotional-intelligence', 'self-awareness']
      });
    }

    // Compassionate progress insights
    if (empathy.compassionateProgress.selfCompassion < 40) {
      insights.push({
        id: 'self-compassion-opportunity',
        type: 'concern',
        title: 'Self-Compassion Growth Opportunity',
        description: `Your self-compassion score of ${empathy.compassionateProgress.selfCompassion}% suggests you might benefit from being gentler with yourself during difficult times.`,
        confidence: 80,
        actionable: true,
        personalized: true,
        timestamp: new Date(),
        dataPoints: ['compassionate-progress', 'self-compassion']
      });
    }

    // Wellbeing insights
    if (wellbeing.qualityOfLife.overallSatisfaction > 75) {
      insights.push({
        id: 'high-life-satisfaction',
        type: 'celebration',
        title: 'Strong Life Satisfaction',
        description: `Your overall life satisfaction of ${formatNumber(wellbeing.qualityOfLife.overallSatisfaction, 0)}% reflects resilience and positive adaptation despite challenges.`,
        confidence: 90,
        actionable: false,
        personalized: true,
        timestamp: new Date(),
        dataPoints: ['quality-of-life', 'satisfaction']
      });
    }

    // Energy management insights
    if (pacing.energyManagement.currentEnergyLevel < 30) {
      insights.push({
        id: 'low-energy-pattern',
        type: 'concern',
        title: 'Energy Conservation Needed',
        description: `Your current energy level of ${pacing.energyManagement.currentEnergyLevel}% suggests implementing energy conservation strategies could be beneficial.`,
        confidence: 85,
        actionable: true,
        personalized: true,
        timestamp: new Date(),
        dataPoints: ['energy-management', 'current-energy']
      });
    }

    return insights;
  }, []);

  // Generate recommendations from metrics
  const generateRecommendations = useCallback((
    empathy: QuantifiedEmpathyMetrics,
    emotional: EmotionalStateMetrics,
    wellbeing: HolisticWellbeingMetrics,
    pacing: DigitalPacingSystem
  ): EmpathyRecommendation[] => {
    const recommendations: EmpathyRecommendation[] = [];

    // Self-compassion recommendations
    if (empathy.compassionateProgress.selfCompassion < 50) {
      recommendations.push({
        id: 'self-compassion-practice',
        category: 'emotional',
        priority: 'medium',
        title: 'Practice Self-Compassion',
        description: 'Develop a gentler inner voice and treat yourself with the same kindness you would show a good friend.',
        rationale: 'Self-compassion is linked to better emotional resilience and reduced stress.',
        steps: [
          'Practice self-compassion breaks during difficult moments',
          'Write yourself a compassionate letter',
          'Use kind, understanding language when talking to yourself',
          'Remember that suffering is part of the human experience'
        ],
        expectedBenefits: [
          'Reduced self-criticism',
          'Improved emotional resilience',
          'Better stress management',
          'Enhanced overall wellbeing'
        ],
        timeframe: '2-4 weeks of daily practice',
        effort: 'low',
        personalization: ['mindfulness-based', 'gentle-approach']
      });
    }

    // Energy management recommendations
    if (pacing.energyManagement.currentEnergyLevel < 40) {
      recommendations.push({
        id: 'energy-pacing',
        category: 'physical',
        priority: 'high',
        title: 'Implement Energy Pacing',
        description: 'Use strategic pacing to manage your energy more effectively throughout the day.',
        rationale: 'Energy conservation helps prevent crashes and maintains consistent functioning.',
        steps: [
          'Track energy levels throughout the day',
          'Plan high-energy activities for your best times',
          'Take regular breaks before feeling exhausted',
          'Use the spoon theory to budget energy for activities'
        ],
        expectedBenefits: [
          'More consistent energy levels',
          'Reduced post-activity crashes',
          'Better activity planning',
          'Improved quality of life'
        ],
        timeframe: '1-2 weeks to establish routine',
        effort: 'medium',
        personalization: ['energy-aware', 'activity-based']
      });
    }

    // Social connection recommendations
    if (empathy.empathyKPIs.connectionQuality < 50) {
      recommendations.push({
        id: 'social-connection',
        category: 'social',
        priority: 'medium',
        title: 'Strengthen Social Connections',
        description: 'Build and maintain meaningful relationships that provide mutual support and understanding.',
        rationale: 'Strong social connections are crucial for emotional wellbeing and pain management.',
        steps: [
          'Reach out to one supportive person this week',
          'Join a chronic illness support group',
          'Practice active listening in conversations',
          'Share your experiences with trusted friends or family'
        ],
        expectedBenefits: [
          'Reduced feelings of isolation',
          'Increased emotional support',
          'Better coping resources',
          'Enhanced sense of belonging'
        ],
        timeframe: '2-6 weeks to build routines',
        effort: 'medium',
        personalization: ['socially-focused', 'community-oriented']
      });
    }

    return recommendations;
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-500 animate-pulse" />
            <p className="text-gray-600">Calculating your empathy metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quantifiedEmpathy || !emotionalState || !wellbeingMetrics || !pacingSystem) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Brain className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">{noTrendsHeadline}</p>
            <p className="text-sm text-gray-500 mt-2">{noTrendsSubtext}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl text-purple-800">Quantified Empathy Metrics</CardTitle>
                <p className="text-purple-600 mt-1">
                  Your compassionate journey through data and insights
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {onShareMetrics && (
                <Button 
                  variant="secondary" 
                  onClick={() => onShareMetrics(quantifiedEmpathy)}
                  className="text-sm"
                >
                  Share Insights
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'emotional-intelligence', label: 'Emotional Intelligence', icon: Brain },
              { id: 'wellbeing', label: 'Holistic Wellbeing', icon: Star },
              { id: 'pacing', label: 'Energy & Pacing', icon: Battery },
              { id: 'insights', label: 'Insights', icon: Lightbulb },
              { id: 'trends', label: 'Trends', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentView === id ? 'default' : 'secondary'}
                onClick={() => setCurrentView(id as DashboardView)}
                className="flex items-center space-x-2 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeframe selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm text-gray-600">Timeframe:</span>
            {[
              { id: 'week', label: 'Past Week' },
              { id: 'month', label: 'Past Month' },
              { id: 'quarter', label: 'Past Quarter' }
            ].map(({ id, label }) => (
              <Button
                key={id}
                variant={timeframe === id ? 'default' : 'secondary'}
                onClick={() => setTimeframe(id as typeof timeframe)}
                className="text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Views */}
      {currentView === 'overview' && (
        <OverviewDashboard 
          empathy={quantifiedEmpathy}
          emotional={emotionalState}
          wellbeing={wellbeingMetrics}
          pacing={pacingSystem}
        />
      )}

      {currentView === 'emotional-intelligence' && (
        <EmotionalIntelligenceDashboard empathy={quantifiedEmpathy} />
      )}

      {currentView === 'wellbeing' && (
        <WellbeingDashboard wellbeing={wellbeingMetrics} />
      )}

      {currentView === 'pacing' && (
        <PacingDashboard pacing={pacingSystem} />
      )}

      {currentView === 'insights' && (
        <InsightsDashboard 
          insights={insights}
          recommendations={recommendations}
          onInsightSelect={onInsightSelect}
          onRecommendationAccept={onRecommendationAccept}
        />
      )}

      {currentView === 'trends' && (
        <TrendsDashboard 
          painEntries={painEntries}
          moodEntries={moodEntries}
          timeframe={timeframe}
        />
      )}
    </div>
  );
};

// Overview Dashboard Component
const OverviewDashboard: React.FC<{
  empathy: QuantifiedEmpathyMetrics;
  emotional: EmotionalStateMetrics;
  wellbeing: HolisticWellbeingMetrics;
  pacing: DigitalPacingSystem;
}> = ({ empathy, wellbeing, pacing }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Emotional Intelligence */}
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-blue-700 text-sm">
          <Brain className="w-4 h-4 mr-2" />
          Emotional Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round((
              empathy.emotionalIntelligence.selfAwareness +
              empathy.emotionalIntelligence.selfRegulation +
              empathy.emotionalIntelligence.motivation +
              empathy.emotionalIntelligence.empathy +
              empathy.emotionalIntelligence.socialSkills
            ) / 5)}%
          </div>
          <p className="text-sm text-gray-600">Overall EQ Score</p>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Self-Awareness</span>
              <span>{empathy.emotionalIntelligence.selfAwareness}%</span>
            </div>
            <div className="flex justify-between">
              <span>Self-Regulation</span>
              <span>{empathy.emotionalIntelligence.selfRegulation}%</span>
            </div>
            <div className="flex justify-between">
              <span>Motivation</span>
              <span>{empathy.emotionalIntelligence.motivation}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Compassionate Progress */}
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-green-700 text-sm">
          <Heart className="w-4 h-4 mr-2" />
          Compassionate Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round((
              empathy.compassionateProgress.selfCompassion +
              (100 - empathy.compassionateProgress.selfCriticism) +
              empathy.compassionateProgress.progressCelebration +
              empathy.compassionateProgress.setbackResilience +
              empathy.compassionateProgress.hopefulness
            ) / 5)}%
          </div>
          <p className="text-sm text-gray-600">Compassion Score</p>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Self-Compassion</span>
              <span>{empathy.compassionateProgress.selfCompassion}%</span>
            </div>
            <div className="flex justify-between">
              <span>Resilience</span>
              <span>{empathy.compassionateProgress.setbackResilience}%</span>
            </div>
            <div className="flex justify-between">
              <span>Hopefulness</span>
              <span>{empathy.compassionateProgress.hopefulness}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quality of Life */}
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-purple-700 text-sm">
          <Star className="w-4 h-4 mr-2" />
          Quality of Life
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(wellbeing.qualityOfLife.overallSatisfaction)}%
          </div>
          <p className="text-sm text-gray-600">Life Satisfaction</p>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Meaning & Purpose</span>
              <span>{Math.round(wellbeing.qualityOfLife.meaningAndPurpose)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Personal Growth</span>
              <span>{Math.round(wellbeing.qualityOfLife.personalGrowth)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Autonomy</span>
              <span>{Math.round(wellbeing.qualityOfLife.autonomy)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Energy Management */}
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-orange-700 text-sm">
          <Battery className="w-4 h-4 mr-2" />
          Energy Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {Math.round(pacing.energyManagement.currentEnergyLevel)}%
          </div>
          <p className="text-sm text-gray-600">Current Energy</p>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Available Spoons</span>
              <span>{pacing.energyManagement.spoonTheory.totalSpoons - pacing.energyManagement.spoonTheory.usedSpoons}</span>
            </div>
            <div className="flex justify-between">
              <span>Battery Charge</span>
              <span>{Math.round(pacing.energyManagement.batteryAnalogy.currentCharge)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Energy Budget</span>
              <span>{Math.round(pacing.energyManagement.energyBudget.daily.flexible)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Emotional Intelligence Dashboard Component
const EmotionalIntelligenceDashboard: React.FC<{
  empathy: QuantifiedEmpathyMetrics;
}> = ({ empathy }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <Brain className="w-5 h-5 mr-2" />
          Emotional Intelligence Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(empathy.emotionalIntelligence).map(([key, value]) => {
            const numeric = typeof value === 'number' ? value : 0;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${numeric}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{numeric}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <Heart className="w-5 h-5 mr-2" />
          Empathy KPIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(empathy.empathyKPIs).map(([key, value]) => {
            const numeric = typeof value === 'number' ? value : 0;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${numeric}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{numeric}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>

    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Sparkles className="w-5 h-5 mr-2" />
          Humanized Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(empathy.humanizedMetrics).slice(0, -1).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${typeof value === 'number' ? value : 50}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">
                    {typeof value === 'number' ? `${value}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Wisdom Gained</h4>
            <div className="space-y-2">
              {Array.isArray(empathy.humanizedMetrics.wisdomGained) && empathy.humanizedMetrics.wisdomGained.slice(0, 3).map((wisdom, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  "{typeof wisdom === 'string' ? (wisdom.length > 100 ? wisdom.substring(0, 100) + '...' : wisdom) : ''}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Additional dashboard components would be implemented similarly...
// For brevity, I'll create placeholder components for the remaining views

const WellbeingDashboard: React.FC<{ wellbeing: HolisticWellbeingMetrics }> = ({ wellbeing }) => (
  <Card>
    <CardHeader>
      <CardTitle>Holistic Wellbeing Metrics</CardTitle>
    </CardHeader>
    <CardContent>
  <p className="text-gray-600 mb-2">Overall satisfaction: {Math.round(wellbeing.qualityOfLife.overallSatisfaction)}%</p>
  <p className="text-gray-600 text-sm">Meaning & Purpose: {Math.round(wellbeing.qualityOfLife.meaningAndPurpose)}%</p>
    </CardContent>
  </Card>
);

const PacingDashboard: React.FC<{ pacing: DigitalPacingSystem }> = ({ pacing }) => (
  <Card>
    <CardHeader>
      <CardTitle>Energy & Pacing Dashboard</CardTitle>
    </CardHeader>
    <CardContent>
  <p className="text-gray-600 mb-2">Current energy: {Math.round(pacing.energyManagement.currentEnergyLevel)}%</p>
  <p className="text-gray-600 text-sm">Used spoons: {pacing.energyManagement.spoonTheory.usedSpoons}/{pacing.energyManagement.spoonTheory.totalSpoons}</p>
    </CardContent>
  </Card>
);

const InsightsDashboard: React.FC<{
  insights: EmpathyInsight[];
  recommendations: EmpathyRecommendation[];
  onInsightSelect?: (insight: EmpathyInsight) => void;
  onRecommendationAccept?: (recommendation: EmpathyRecommendation) => void;
}> = ({ insights, recommendations, onInsightSelect, onRecommendationAccept }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Personal Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => onInsightSelect?.(insight)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>Confidence: {insight.confidence}%</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{insight.type}</span>
                  </div>
                </div>
                {insight.type === 'celebration' && <Award className="w-5 h-5 text-yellow-500" />}
                {insight.type === 'concern' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                {insight.type === 'pattern' && <TrendingUp className="w-5 h-5 text-blue-500" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-500" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <div className="text-xs text-gray-500">
                    <p><strong>Timeframe:</strong> {rec.timeframe}</p>
                    <p><strong>Effort:</strong> {rec.effort}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onRecommendationAccept?.(rec)}
                  className="ml-4"
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const TrendsDashboard: React.FC<{
  painEntries: PainEntry[];
  moodEntries: MoodEntry[];
  timeframe: 'week' | 'month' | 'quarter';
}> = ({ painEntries, moodEntries, timeframe }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Trends Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-2">Entries: pain {painEntries.length} • mood {moodEntries.length} • timeframe {timeframe}</p>
      <p className="text-gray-500 text-sm">Detailed visualization placeholder.</p>
    </CardContent>
  </Card>
);

export default QuantifiedEmpathyDashboard;

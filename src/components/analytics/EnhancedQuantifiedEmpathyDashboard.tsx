/**
 * Enhanced Quantified Empathy Dashboard
 * Advanced AI-powered empathy visualization with interactive insights and personalized recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { 
  Heart, Brain, Lightbulb, Target, TrendingUp,
  Sparkles, BarChart3,
  Users, Zap, Clock, TreePine
} from 'lucide-react';
import { 
  QuantifiedEmpathyMetrics,
  MoodEntry,
  EmpathyInsight,
  EmpathyRecommendation
} from '../../types/quantified-empathy';
import { EmpathyDrivenAnalyticsService } from '../../services/EmpathyDrivenAnalytics';
import { useEmpathyMetrics } from '../../hooks/useEmpathyMetrics';
import { useEmpathyConsent } from '../../hooks/useEmpathyConsent';
import type { PainEntry } from '../../types';
import { PlannedFeatureNotice } from '../common/PlannedFeatureNotice';
import type { RoadmapKey } from '../../constants/roadmapLinks';

interface EnhancedEmpathyDashboardProps {
  userId: string;
  painEntries: PainEntry[];
  moodEntries?: MoodEntry[];
  onInsightSelect?: (insight: EmpathyInsight) => void;
  onRecommendationAccept?: (recommendation: EmpathyRecommendation) => void;
  onShareMetrics?: (metrics: QuantifiedEmpathyMetrics) => void;
  realTimeMode?: boolean;
}

type DashboardView = 
  | 'overview' 
  | 'empathy-intelligence' 
  | 'neural-patterns' 
  | 'wisdom-journey' 
  | 'temporal-analysis' 
  | 'predictive-insights' 
  | 'micro-moments'
  | 'cultural-empathy'
  | 'personalized-interventions';

const roadmapFeatureByView: Partial<Record<DashboardView, RoadmapKey>> = {
  'empathy-intelligence': 'empathyIntelligence',
  'neural-patterns': 'neuralPatterns',
  'wisdom-journey': 'wisdomJourney',
  'temporal-analysis': 'temporalAnalysis',
  'predictive-insights': 'predictiveInsights',
  'cultural-empathy': 'culturalEmpathy',
  'micro-moments': 'microMoments'
};

export const EnhancedQuantifiedEmpathyDashboard: React.FC<EnhancedEmpathyDashboardProps> = ({
  userId,
  painEntries,
  moodEntries = [],
  onInsightSelect,
  onRecommendationAccept,
  onShareMetrics,
  realTimeMode = false
}) => {
  // Services
  const [analyticsService] = useState(() => new EmpathyDrivenAnalyticsService({
    validationThreshold: 75,
    celebrationFrequency: 'daily',
    reportingStyle: 'balanced',
    privacyLevel: 'personal',
    languagePreference: 'everyday'
  }));
  

  // State
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced Metrics state
  const [quantifiedEmpathy, setQuantifiedEmpathy] = useState<QuantifiedEmpathyMetrics | null>(null);
  // legacy detailed state removed; metrics now provided by hook
  const [insights, setInsights] = useState<EmpathyInsight[]>([]);
  const [recommendations, setRecommendations] = useState<EmpathyRecommendation[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(realTimeMode);

  // Track if we're already loading to prevent concurrent loads

  const { consentGranted, grantConsent } = useEmpathyConsent();
  const metricsState = useEmpathyMetrics({ userId, painEntries, moodEntries, auto: true });
  useEffect(() => { setIsLoading(metricsState.loading); }, [metricsState.loading]);
  useEffect(() => { if (metricsState.data) setQuantifiedEmpathy(metricsState.data); }, [metricsState.data]);
  useEffect(() => { setInsights(metricsState.insights); }, [metricsState.insights]);
  useEffect(() => { setRecommendations(metricsState.recommendations); }, [metricsState.recommendations]);

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeActive || !quantifiedEmpathy) return;
    const interval = setInterval(async () => {
      try {
        const updatedMetrics = await analyticsService.calculateQuantifiedEmpathy(userId, painEntries, moodEntries);
        setQuantifiedEmpathy(updatedMetrics);
      } catch (error) {
        console.error('Error updating real-time empathy metrics:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isRealTimeActive, quantifiedEmpathy, userId, analyticsService, painEntries, moodEntries]);

  const handleInsightSelect = useCallback((insight: EmpathyInsight) => {
    onInsightSelect?.(insight);
  }, [onInsightSelect]);

  const handleRecommendationAccept = useCallback((recommendation: EmpathyRecommendation) => {
    onRecommendationAccept?.(recommendation);
  }, [onRecommendationAccept]);

  const handleShareMetrics = useCallback(() => {
    if (quantifiedEmpathy) {
      onShareMetrics?.(quantifiedEmpathy);
    }
  }, [quantifiedEmpathy, onShareMetrics]);

  const roadmapKey = roadmapFeatureByView[currentView];

  if (!consentGranted) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto text-purple-500" />
          <p className="text-gray-700 font-medium">Empathy analytics are privacy-protected.</p>
          <p className="text-sm text-gray-500">Grant consent to process and view Quantified Empathy Metrics. You can revoke anytime.</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={grantConsent} variant="default">Grant Consent</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Brain className="w-8 h-8 mx-auto mb-4 text-purple-500 animate-pulse" />
            <p className="text-gray-600">Analyzing your empathy patterns with AI...</p>
            <div className="mt-4 w-64 mx-auto bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quantifiedEmpathy) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Heart className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Building your empathy intelligence profile...</p>
            <p className="text-sm text-gray-500 mt-2">Continue tracking to unlock advanced insights!</p>
            <div className="mt-4"><Button size="sm" onClick={metricsState.refresh}>Retry</Button></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Header with AI Insights */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Brain className="w-10 h-10 text-purple-600" />
                {isRealTimeActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-800">
                  AI-Enhanced Empathy Intelligence
                </CardTitle>
                <p className="text-purple-600 mt-1">
                  Your personalized empathy journey with predictive insights
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={isRealTimeActive ? "default" : "secondary"}
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                className="text-sm"
              >
                {isRealTimeActive ? 'Live' : 'Static'}
              </Button>
              {onShareMetrics && (
                <Button 
                  variant="secondary" 
                  onClick={handleShareMetrics}
                  className="text-sm"
                >
                  Share Journey
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Empathy Intelligence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-700 text-sm">
              <Brain className="w-4 h-4 mr-2" />
              Empathy IQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {quantifiedEmpathy.empathyIntelligence?.empathyIQ || 150}
              </div>
              <p className="text-xs text-blue-600">AI-Calculated Intelligence</p>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((quantifiedEmpathy.empathyIntelligence?.empathyIQ || 150) / 200) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-700 text-sm">
              <TreePine className="w-4 h-4 mr-2" />
              Wisdom Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {quantifiedEmpathy.humanizedMetrics.wisdomGained?.integratedWisdom || 75}%
              </div>
              <p className="text-xs text-green-600">Integrated Wisdom</p>
              <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quantifiedEmpathy.humanizedMetrics.wisdomGained?.integratedWisdom || 75}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-700 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Neural Empathy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns ? Math.round((
                  quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.mirrorNeuronActivity +
                  quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.empathyFlexibility +
                  quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.empathyCalibration
                ) / 3) : 75}%
              </div>
              <p className="text-xs text-orange-600">Neural Pattern Activity</p>
              <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns ? Math.round((
                    quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.mirrorNeuronActivity +
                    quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.empathyFlexibility +
                    quantifiedEmpathy.emotionalIntelligence.neuralEmpathyPatterns.empathyCalibration
                  ) / 3) : 75}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-purple-700 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Future Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {quantifiedEmpathy.predictiveMetrics?.growthPotential?.currentGrowthTrajectory || 80}%
              </div>
              <p className="text-xs text-purple-600">Predicted Trajectory</p>
              <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quantifiedEmpathy.predictiveMetrics?.growthPotential?.currentGrowthTrajectory || 80}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Lightbulb className="w-5 h-5 mr-2" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight) => (
                <div 
                  key={insight.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleInsightSelect(insight)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.confidence > 80 ? 'bg-green-100 text-green-800' :
                      insight.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.type === 'celebration' ? 'bg-green-100 text-green-800' :
                      insight.type === 'improvement' ? 'bg-blue-100 text-blue-800' :
                      insight.type === 'concern' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.type}
                    </span>
                    {insight.actionable && (
                      <span className="text-xs text-blue-600 font-medium">Actionable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Target className="w-5 h-5 mr-2" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((recommendation) => (
                <div 
                  key={recommendation.id}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-green-800">{recommendation.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {recommendation.priority}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAccept(recommendation)}
                        className="text-xs"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
                  <p className="text-xs text-gray-600 mb-2"><strong>Rationale:</strong> {recommendation.rationale}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">
                      <strong>Timeframe:</strong> {recommendation.timeframe}
                    </span>
                    <span className="text-xs text-green-600">
                      <strong>Effort:</strong> {recommendation.effort}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderNavigationTabs = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'empathy-intelligence', label: 'Empathy IQ', icon: Brain },
            { id: 'neural-patterns', label: 'Neural Patterns', icon: Zap },
            { id: 'wisdom-journey', label: 'Wisdom Journey', icon: TreePine },
            { id: 'temporal-analysis', label: 'Time Patterns', icon: Clock },
            { id: 'predictive-insights', label: 'Future Insights', icon: TrendingUp },
            { id: 'cultural-empathy', label: 'Cultural Empathy', icon: Users },
            { id: 'micro-moments', label: 'Micro Moments', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={currentView === tab.id ? "default" : "secondary"}
                onClick={() => setCurrentView(tab.id as DashboardView)}
                className="text-sm flex items-center space-x-1"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6">
      {renderNavigationTabs()}
      
      {currentView === 'overview' && renderOverviewDashboard()}
      
      {/* Other views would be implemented here */}
      {currentView !== 'overview' && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-gray-600">
                This dashboard view is actively in development and will unlock deeper empathy insights soon.
              </p>
              {roadmapKey && (
                <PlannedFeatureNotice feature={roadmapKey} className="mx-auto max-w-xl" />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

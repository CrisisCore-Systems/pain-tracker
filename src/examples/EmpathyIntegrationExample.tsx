/**
 * Enhanced Empathy Analytics Integration Example
 * Demonstrates how to integrate and use the advanced empathy intelligence system
 */

import React, { useState, useEffect } from 'react';
import {
  EnhancedQuantifiedEmpathyDashboard,
  EmpathyDrivenAnalyticsService,
  RealTimeEmpathyMonitor
} from '../components/analytics';
import { 
  QuantifiedEmpathyMetrics,
  EmpathyInsight,
  EmpathyRecommendation,
  MoodEntry
} from '../types/quantified-empathy';
// Mock implementations for empathy services
interface EmpathyStateSnapshot {
  empathyLevel: number;
  empathyQuality: string;
  emotionalContagionRisk: number;
  burnoutRisk: number;
}

interface RealTimeAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// Comment out failing import - using RealTimeEmpathyMonitor from components/analytics
// import {
//   EmpathyStateSnapshot,
//   RealTimeAlert
// } from '@pain-tracker/services/RealTimeEmpathyMonitor';
import type { PainEntry } from '../types';

interface EmpathyIntegrationExampleProps {
  userId: string;
  painEntries: PainEntry[];
  moodEntries: MoodEntry[];
}

export const EmpathyIntegrationExample: React.FC<EmpathyIntegrationExampleProps> = ({
  userId,
  painEntries,
  moodEntries
}) => {
  // State for empathy analytics
  const [empathyMetrics, setEmpathyMetrics] = useState<QuantifiedEmpathyMetrics | null>(null);
  const [insights, setInsights] = useState<EmpathyInsight[]>([]);
  const [recommendations, setRecommendations] = useState<EmpathyRecommendation[]>([]);
  const [realTimeState, setRealTimeState] = useState<EmpathyStateSnapshot | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<RealTimeAlert[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // Services
  const [analyticsService] = useState(() => new EmpathyDrivenAnalyticsService({
    validationThreshold: 75,
    celebrationFrequency: 'daily',
    reportingStyle: 'balanced',
    privacyLevel: 'personal',
    languagePreference: 'everyday'
  }));

  const [empathyMonitor] = useState(() => new RealTimeEmpathyMonitor({
    monitoringInterval: 30000, // 30 seconds
    sentimentAnalysisEnabled: true,
    microInteractionTracking: true,
    emotionalContagionDetection: true,
    empathyBurnoutPrevention: true,
    culturalContextAwareness: true
  }));

  // Initialize empathy analytics
  useEffect(() => {
    const initializeEmpathyAnalytics = async () => {
      try {
        // Calculate advanced empathy metrics
        const metrics = await analyticsService.calculateQuantifiedEmpathy(
          userId,
          painEntries,
          moodEntries
        );
        setEmpathyMetrics(metrics);

        // Generate AI-powered insights
        const empathyInsights = await analyticsService.generateEmpathyInsights(
          userId,
          metrics,
          painEntries,
          moodEntries
        );
        setInsights(empathyInsights);

        // Generate personalized recommendations
        const empathyRecommendations = await analyticsService.generateEmpathyRecommendations(
          userId,
          metrics,
          empathyInsights
        );
        setRecommendations(empathyRecommendations);

      } catch (error) {
        console.error('Error initializing empathy analytics:', error);
      }
    };

    initializeEmpathyAnalytics();
  }, [userId, painEntries, moodEntries, analyticsService]);

  // Real-time monitoring setup
  useEffect(() => {
    if (isRealTimeEnabled) {
      // Start real-time monitoring
      empathyMonitor.startMonitoring(userId);

      // Add state listener
      const stateListener = (snapshot: EmpathyStateSnapshot) => {
        setRealTimeState(snapshot);
        
        // Check for new alerts
        const alerts = empathyMonitor.getActiveAlerts(userId);
        setActiveAlerts(alerts);
      };

      empathyMonitor.addStateListener(userId, stateListener);

      return () => {
        empathyMonitor.removeStateListener(userId, stateListener);
        empathyMonitor.stopMonitoring();
      };
    }
  }, [isRealTimeEnabled, userId, empathyMonitor]);

  // Handlers
  const handleInsightSelect = (insight: EmpathyInsight) => {
    console.log('Selected insight:', insight);
    
    // Example: Show detailed insight modal or navigate to specific view
    // You could also track user engagement with insights
    trackInsightEngagement(insight);
  };

  const handleRecommendationAccept = async (recommendation: EmpathyRecommendation) => {
    console.log('Accepted recommendation:', recommendation);
    
    // Example: Track recommendation acceptance
    await trackRecommendationAcceptance(recommendation);
    
    // Example: Set up intervention reminders
    if (recommendation.category === 'emotional') {
      scheduleEmotionalIntervention(recommendation);
    }
  };

  const handleShareMetrics = (metrics: QuantifiedEmpathyMetrics) => {
    console.log('Sharing empathy metrics:', metrics);
    
    // Example: Generate shareable empathy journey summary
    const shareableContent = generateShareableContent(metrics);
    
    // Example: Open share modal or copy to clipboard
    navigator.clipboard.writeText(shareableContent);
  };

  const handleTextInput = async (text: string, context: string) => {
    if (isRealTimeEnabled) {
      // Analyze text for empathy signals
      const analysis = await empathyMonitor.analyzeTextForEmpathy(userId, text, context);
      
      console.log('Text empathy analysis:', analysis);
      
      // Example: Show real-time feedback
      if (analysis.concerns.length > 0) {
        showEmpathyConcernAlert(analysis);
      }
    }
  };

  const handleMicroEmpathyMoment = async (interaction: {
    type: 'spontaneous' | 'requested' | 'reciprocal' | 'self-directed';
    trigger: string;
    response: string;
    duration: number;
    intensity: number;
  }) => {
    if (isRealTimeEnabled) {
      // Track micro-empathy moment
      await empathyMonitor.trackMicroEmpathyMoment(userId, interaction);
      
      console.log('Tracked micro-empathy moment:', interaction);
    }
  };

  const dismissAlert = (alertId: string) => {
    empathyMonitor.dismissAlert(userId, alertId);
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Example utility functions
  const trackInsightEngagement = (insight: EmpathyInsight) => {
    // Track which insights users find most valuable
    const engagement = {
      insightId: insight.id,
      timestamp: new Date(),
      userId,
      insightType: insight.type,
      confidence: insight.confidence
    };
    
    // Send to analytics service
    console.log('Tracking insight engagement:', engagement);
  };

  const trackRecommendationAcceptance = async (recommendation: EmpathyRecommendation) => {
    // Track recommendation effectiveness
    const acceptance = {
      recommendationId: recommendation.id,
      timestamp: new Date(),
      userId,
      category: recommendation.category,
      priority: recommendation.priority
    };
    
    // Send to analytics service
    console.log('Tracking recommendation acceptance:', acceptance);
  };

  const scheduleEmotionalIntervention = (recommendation: EmpathyRecommendation) => {
    // Example: Set up gentle reminders for emotional practices
    const intervention = {
      title: recommendation.title,
      steps: recommendation.steps,
      timeframe: recommendation.timeframe,
      userId
    };
    
    console.log('Scheduling intervention:', intervention);
  };

  const generateShareableContent = (metrics: QuantifiedEmpathyMetrics): string => {
    return `
🧠 My Empathy Intelligence Journey

Empathy IQ: ${metrics.empathyIntelligence?.empathyIQ || 'Developing'}
Wisdom Integration: ${metrics.humanizedMetrics.wisdomGained?.integratedWisdom || 75}%
Neural Empathy Activity: ${metrics.emotionalIntelligence.neuralEmpathyPatterns?.mirrorNeuronActivity || 80}%

"Growing in empathy, one moment at a time. 💝"

#EmpathyJourney #PersonalGrowth #PainTracker
    `.trim();
  };

  const showEmpathyConcernAlert = (analysis: { empathyLevel: number; sentiment: string; empathyIndicators: string[]; concerns: string[] }) => {
    // Example: Show gentle alert for empathy concerns
    console.log('Empathy concern detected:', analysis.concerns);
    
    // You could show a gentle notification or suggestion
    // "It seems like you might be feeling overwhelmed. Would you like some gentle boundary suggestions?"
  };

  return (
    <div className="empathy-integration-example">
      {/* Real-time empathy alerts */}
      {activeAlerts.length > 0 && (
        <div className="empathy-alerts mb-6 space-y-2">
          {activeAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                alert.severity === 'high' ? 'bg-orange-50 border-orange-400' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{alert.message}</h4>
                  <ul className="mt-2 text-sm text-gray-600">
                    {alert.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="mt-1">• {rec}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time empathy state display */}
      {realTimeState && (
        <div className="real-time-state mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Current Empathy State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Level:</span>
              <span className="ml-2 font-medium">{realTimeState.empathyLevel}%</span>
            </div>
            <div>
              <span className="text-gray-600">Quality:</span>
              <span className="ml-2 font-medium capitalize">{realTimeState.empathyQuality}</span>
            </div>
            <div>
              <span className="text-gray-600">Contagion Risk:</span>
              <span className="ml-2 font-medium">{realTimeState.emotionalContagionRisk}%</span>
            </div>
            <div>
              <span className="text-gray-600">Burnout Risk:</span>
              <span className="ml-2 font-medium">{realTimeState.burnoutRisk}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time monitoring toggle */}
      <div className="monitoring-controls mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRealTimeEnabled}
            onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Enable Real-time Empathy Monitoring</span>
        </label>
      </div>

      {/* Main empathy dashboard */}
      <EnhancedQuantifiedEmpathyDashboard
        userId={userId}
        painEntries={painEntries}
        moodEntries={moodEntries}
        onInsightSelect={handleInsightSelect}
        onRecommendationAccept={handleRecommendationAccept}
        onShareMetrics={handleShareMetrics}
        realTimeMode={isRealTimeEnabled}
      />

      {/* Example text input for sentiment analysis */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Test Empathy Text Analysis</h3>
        <textarea
          placeholder="Write about your empathy experience..."
          className="w-full p-3 border rounded-lg"
          onBlur={(e) => handleTextInput(e.target.value, 'journal_entry')}
        />
      </div>

      {/* Example micro-empathy moment tracker */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Track Micro-Empathy Moment</h3>
        <button
          onClick={() => handleMicroEmpathyMoment({
            type: 'spontaneous',
            trigger: 'Friend shared difficult news',
            response: 'Listened carefully and offered support',
            duration: 300, // 5 minutes
            intensity: 85
          })}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Record Example Empathy Moment
        </button>
      </div>

      {/* Debug information */}
      {((typeof (import.meta as any) !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.MODE === 'development' || (import.meta as any).env.NODE_ENV === 'development'))
        || (typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV === 'development')) && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="text-sm space-y-2">
            <div>Insights Count: {insights.length}</div>
            <div>Recommendations Count: {recommendations.length}</div>
            <div>Real-time Enabled: {isRealTimeEnabled ? 'Yes' : 'No'}</div>
            <div>Active Alerts: {activeAlerts.length}</div>
            {empathyMetrics && (
              <div>Empathy IQ: {empathyMetrics.empathyIntelligence?.empathyIQ || 'N/A'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpathyIntegrationExample;

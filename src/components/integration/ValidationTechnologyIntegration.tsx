/**
 * Validation Technology Integration Components
 * Connects emotional validation, progress tracking, and user agency features
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { BarChart3, Heart, Crown, TrendingUp, Shield, Star } from 'lucide-react';

// Import our new validation components
import { EmotionalValidation, ValidationHistory, type ValidationResponse } from '../../services/EmotionalValidationService';
import { HolisticProgressTracker } from '../progress/HolisticProgressTracker';
import { UserControlPanel, ChoiceEmphasis, EmpowermentMessageDisplay } from '../agency/UserAgencyComponents';
import { useEmotionalValidation } from '../../hooks/useEmotionalValidation';
import { validationIntegration } from '../../services/ValidationIntegrationService';

// Import existing components
import type { PainEntry } from '../../types';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';

interface DashboardData {
  recentValidations: ValidationResponse[];
  progressSummary: Array<{id: string; date: Date}>;
  insights: {
    validationEffectiveness: string;
    emotionalPatterns: string;
    progressHighlights: string;
    recommendations: string[];
  };
  metrics: {
    totalValidations: number;
    validationsByTone: Record<string, number>;
    averageResponseTime: number;
    emotionalTrends: Array<{date: string; positiveValidations: number; negativeValidations: number; supportiveValidations: number}>;
    userEngagement: {
      dismissed: number;
      interacted: number;
      followUpClicked: number;
    };
  };
}

interface ValidationIntegratedPainFormProps {
  onSubmit: (entry: Partial<PainEntry>) => void;
  painEntries: PainEntry[];
}

export function ValidationIntegratedPainForm({ 
  onSubmit, 
  painEntries 
}: ValidationIntegratedPainFormProps) {
  const { preferences } = useTraumaInformed();
  const { validationHistory, addValidation, clearHistory } = useEmotionalValidation();
  const [formData, setFormData] = useState({
    notes: '',
    painLevel: 5,
    mood: 5
  });
  const [showProgress, setShowProgress] = useState(false);

  // Initialize validation integration on mount
  useEffect(() => {
    // No initialization needed for simplified service
  }, []);

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  };

  const handleValidation = async (validation: ValidationResponse) => {
    addValidation(validation);
    await validationIntegration.saveValidation(validation);
  };

  const trackingChoices = [
    {
      id: 'quick',
      label: 'Quick Entry',
      description: 'Just the essentials - pain level and location',
      icon: Shield,
      recommended: preferences.simplifiedMode
    },
    {
      id: 'standard',
      label: 'Standard Entry',
      description: 'Comprehensive tracking with all sections',
      icon: BarChart3,
      recommended: !preferences.simplifiedMode
    },
    {
      id: 'wellness',
      label: 'Wellness Focus',
      description: 'Include emotional and functional wellbeing',
      icon: Heart,
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Empowerment Message */}
      <EmpowermentMessageDisplay context="starting" />
      
      {/* User Control Panel */}
      <UserControlPanel />
      
      {/* Tracking Choice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2 text-blue-600" />
            Choose Your Tracking Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChoiceEmphasis
            title="How would you like to track today?"
            choices={trackingChoices}
            onChoiceSelect={(choice) => {
              if (choice === 'wellness') {
                setShowProgress(true);
              }
              // Handle other choices...
            }}
          />
        </CardContent>
      </Card>

      {/* Main Pain Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Pain Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pain Level Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Level
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.painLevel}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  painLevel: parseInt(e.target.value) 
                }))}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium">
                {formData.painLevel}/10
              </span>
            </div>
          </div>

          {/* Notes with Real-time Validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Observations
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Describe your pain, what might have triggered it, or any other observations..."
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            {/* Real-time Emotional Validation */}
            <EmotionalValidation
              text={formData.notes}
              onValidationGenerated={handleValidation}
              isActive={preferences.realTimeValidation}
            />
          </div>

          {/* Mood Tracking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Mood
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mood: parseInt(e.target.value) 
                }))}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium">
                {formData.mood}/10
              </span>
            </div>
          </div>

          {/* Validation History */}
          {validationHistory.length > 0 && (
            <ValidationHistory 
              validations={validationHistory}
              onClear={clearHistory}
            />
          )}
        </CardContent>
      </Card>

      {/* Progress Tracking (if selected) */}
      {showProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Holistic Wellness Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HolisticProgressTracker 
              painEntries={painEntries}
              onProgressUpdate={async (entry) => {
                await validationIntegration.saveProgressEntry(entry);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            onSubmit({
              baselineData: {
                pain: formData.painLevel,
                locations: [],
                symptoms: []
              },
              notes: formData.notes,
              qualityOfLife: {
                moodImpact: formData.mood,
                sleepQuality: 0,
                socialImpact: []
              }
            });
            
            // Reset form
            setFormData({ notes: '', painLevel: 5, mood: 5 });
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Star className="w-4 h-4" />
          <span>Save Entry</span>
        </button>
      </div>
    </div>
  );
}

// Dashboard component showing validation insights
interface ValidationDashboardProps {
  painEntries: PainEntry[];
}

export function ValidationDashboard({ painEntries }: ValidationDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const insights = await validationIntegration.generateProgressInsights();
        const validations = await validationIntegration.getValidationHistory();
        const progress = await validationIntegration.getProgressHistory();
        
        setDashboardData({
          recentValidations: validations.slice(-5),
          progressSummary: progress.slice(-10).map(p => ({ id: p.id, date: new Date(p.date) })),
          insights: {
            validationEffectiveness: 'Validation system is providing consistent emotional support',
            emotionalPatterns: insights.trends.emotional === 'improving' ? 'Emotional wellbeing shows positive trends' : 
                             insights.trends.emotional === 'declining' ? 'Emotional wellbeing needs attention' : 
                             'Emotional wellbeing remains stable',
            progressHighlights: insights.achievements.join(', ') || 'Keep tracking to unlock achievements',
            recommendations: insights.recommendations
          },
          metrics: {
            totalValidations: validations.length,
            validationsByTone: validations.reduce((acc, v) => {
              acc[v.tone] = (acc[v.tone] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            averageResponseTime: 0.8, // Static for now
            emotionalTrends: [],
            userEngagement: {
              dismissed: 0,
              interacted: validations.length,
              followUpClicked: Math.floor(validations.length * 0.3)
            }
          }
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [painEntries]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No validation data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-pink-500" />
            Validation & Support Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.metrics.totalValidations}
              </div>
              <div className="text-sm text-blue-700">Supportive Messages</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.progressSummary.length}
              </div>
              <div className="text-sm text-green-700">Progress Entries</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {painEntries.length}
              </div>
              <div className="text-sm text-purple-700">Pain Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Your Journey Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Validation Effectiveness</h4>
              <p className="text-sm text-blue-700">{dashboardData.insights.validationEffectiveness}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Emotional Patterns</h4>
              <p className="text-sm text-green-700">{dashboardData.insights.emotionalPatterns}</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-1">Progress Highlights</h4>
              <p className="text-sm text-purple-700">{dashboardData.insights.progressHighlights}</p>
            </div>
          </div>

          {dashboardData.insights.recommendations.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Personalized Recommendations
              </h4>
              <ul className="space-y-1">
                {dashboardData.insights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empowerment Message */}
      <EmpowermentMessageDisplay context="progress" />
    </div>
  );
}

// Main integration wrapper component
interface ValidationTechnologyIntegrationProps {
  painEntries: PainEntry[];
  onPainEntrySubmit: (entry: Partial<PainEntry>) => void;
  showDashboard?: boolean;
}

export function ValidationTechnologyIntegration({
  painEntries,
  onPainEntrySubmit,
  showDashboard = false
}: ValidationTechnologyIntegrationProps) {
  const [activeView, setActiveView] = useState<'form' | 'dashboard'>('form');

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveView('form')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'form'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Track Pain
        </button>
        {showDashboard && (
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            View Insights
          </button>
        )}
      </div>

      {/* Content */}
      {activeView === 'form' ? (
        <ValidationIntegratedPainForm 
          onSubmit={onPainEntrySubmit}
          painEntries={painEntries}
        />
      ) : (
        <ValidationDashboard painEntries={painEntries} />
      )}
    </div>
  );
}

/**
 * Holistic Progress Tracking System
 * Tracks emotional wellbeing, activity improvements, coping strategies, and resilience metrics
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { 
  TrendingUp, TrendingDown, Minus, Heart, Activity, 
  Brain, Shield, Star, Target, Calendar, Award, BarChart3
} from 'lucide-react';
import type { PainEntry } from '../../types';

// Types for holistic progress tracking
export interface WellbeingMetrics {
  emotional: {
    mood: number; // 1-10 scale
    anxiety: number;
    stress: number;
    hopefulness: number;
    selfEfficacy: number;
  };
  functional: {
    mobilityScore: number;
    independenceLevel: number;
    activityTolerance: number;
    energyLevel: number;
    cognitiveClarity: number;
  };
  social: {
    socialEngagement: number;
    supportSystemStrength: number;
    communicationAbility: number;
    relationshipQuality: number;
  };
  coping: {
    strategyEffectiveness: number;
    resilienceScore: number;
    adaptabilityScore: number;
    selfAdvocacySkills: number;
  };
}

export interface ProgressMilestone {
  id: string;
  category: 'pain' | 'emotional' | 'functional' | 'social' | 'coping';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isAchieved: boolean;
  dateAchieved?: Date;
  importance: 'high' | 'medium' | 'low';
  userDefined: boolean;
}

export interface CopingStrategy {
  id: string;
  name: string;
  type: 'behavioral' | 'cognitive' | 'physical' | 'social' | 'spiritual';
  effectiveness: number; // 1-10
  frequency: 'daily' | 'weekly' | 'as-needed' | 'rarely';
  notes: string;
  lastUsed: Date;
  successRate: number; // percentage
  timeCommitment: 'low' | 'medium' | 'high';
}

export interface ProgressEntry {
  id: string;
  date: Date;
  wellbeingMetrics: WellbeingMetrics;
  milestones: ProgressMilestone[];
  copingStrategies: CopingStrategy[];
  reflections: {
    wins: string[];
    challenges: string[];
    insights: string[];
    gratitude: string[];
  };
  overallSatisfaction: number;
  notes: string;
}

// Progress tracking component
interface HolisticProgressTrackerProps {
  painEntries: PainEntry[];
  onProgressUpdate?: (entry: ProgressEntry) => void;
}

export function HolisticProgressTracker({ 
  painEntries, 
  onProgressUpdate 
}: HolisticProgressTrackerProps) {
  const [currentEntry, setCurrentEntry] = useState<Partial<ProgressEntry>>({
    wellbeingMetrics: {
      emotional: { mood: 5, anxiety: 5, stress: 5, hopefulness: 5, selfEfficacy: 5 },
      functional: { 
        mobilityScore: 5, 
        independenceLevel: 5, 
        activityTolerance: 5, 
        energyLevel: 5, 
        cognitiveClarity: 5 
      },
      social: { 
        socialEngagement: 5, 
        supportSystemStrength: 5, 
        communicationAbility: 5, 
        relationshipQuality: 5 
      },
      coping: { 
        strategyEffectiveness: 5, 
        resilienceScore: 5, 
        adaptabilityScore: 5, 
        selfAdvocacySkills: 5 
      }
    },
    reflections: { wins: [], challenges: [], insights: [], gratitude: [] },
    overallSatisfaction: 5,
    notes: ''
  });

  const [activeTab, setActiveTab] = useState<'metrics' | 'milestones' | 'coping' | 'insights'>('metrics');

  // Calculate trends from pain entries
  const calculateTrends = () => {
    if (painEntries.length < 2) return null;
    
    const recent = painEntries.slice(-7); // Last 7 entries
    const older = painEntries.slice(-14, -7); // Previous 7 entries
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / older.length 
      : recentAvg;
    
    const painTrend = recentAvg < olderAvg ? 'improving' : 
                     recentAvg > olderAvg ? 'worsening' : 'stable';
    
    return { painTrend, recentAvg, olderAvg };
  };

  const trends = calculateTrends();

  // Wellbeing Metrics Section
  const WellbeingMetricsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional Wellbeing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              Emotional Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(currentEntry.wellbeingMetrics?.emotional || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      wellbeingMetrics: {
                        ...prev.wellbeingMetrics!,
                        emotional: {
                          ...prev.wellbeingMetrics!.emotional,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm font-medium">{value}/10</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Functional Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Functional Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(currentEntry.wellbeingMetrics?.functional || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      wellbeingMetrics: {
                        ...prev.wellbeingMetrics!,
                        functional: {
                          ...prev.wellbeingMetrics!.functional,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm font-medium">{value}/10</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Wellbeing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              Social Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(currentEntry.wellbeingMetrics?.social || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      wellbeingMetrics: {
                        ...prev.wellbeingMetrics!,
                        social: {
                          ...prev.wellbeingMetrics!.social,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm font-medium">{value}/10</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coping & Resilience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Brain className="w-4 h-4 mr-2 text-purple-500" />
              Coping & Resilience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(currentEntry.wellbeingMetrics?.coping || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setCurrentEntry(prev => ({
                      ...prev,
                      wellbeingMetrics: {
                        ...prev.wellbeingMetrics!,
                        coping: {
                          ...prev.wellbeingMetrics!.coping,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm font-medium">{value}/10</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Reflections Section
  const ReflectionsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Today's Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="What went well today? Even small victories count..."
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={currentEntry.reflections?.wins.join('\n') || ''}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                reflections: {
                  ...prev.reflections!,
                  wins: e.target.value.split('\n').filter(line => line.trim())
                }
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Target className="w-4 h-4 mr-2 text-red-500" />
              Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="What challenges did you face? How did you handle them?"
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={currentEntry.reflections?.challenges.join('\n') || ''}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                reflections: {
                  ...prev.reflections!,
                  challenges: e.target.value.split('\n').filter(line => line.trim())
                }
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Brain className="w-4 h-4 mr-2 text-purple-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="What did you learn about yourself or your condition today?"
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={currentEntry.reflections?.insights.join('\n') || ''}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                reflections: {
                  ...prev.reflections!,
                  insights: e.target.value.split('\n').filter(line => line.trim())
                }
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              Gratitude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="What are you grateful for today?"
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={currentEntry.reflections?.gratitude.join('\n') || ''}
              onChange={(e) => setCurrentEntry(prev => ({
                ...prev,
                reflections: {
                  ...prev.reflections!,
                  gratitude: e.target.value.split('\n').filter(line => line.trim())
                }
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Award className="w-4 h-4 mr-2 text-indigo-500" />
            Overall Satisfaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">How satisfied are you with today overall?</label>
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry.overallSatisfaction || 5}
                onChange={(e) => setCurrentEntry(prev => ({
                  ...prev,
                  overallSatisfaction: parseInt(e.target.value)
                }))}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium">
                {currentEntry.overallSatisfaction}/10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                {trends.painTrend === 'improving' ? (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                ) : trends.painTrend === 'worsening' ? (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Pain Trend</p>
                  <p className="text-xs text-gray-600 capitalize">{trends.painTrend}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Recent Avg</p>
                  <p className="text-xs text-gray-600">{trends.recentAvg.toFixed(1)}/10</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Entries</p>
                  <p className="text-xs text-gray-600">{painEntries.length} total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'metrics', label: 'Wellbeing Metrics', icon: BarChart3 },
          { id: 'milestones', label: 'Milestones', icon: Target },
          { id: 'coping', label: 'Coping Strategies', icon: Shield },
          { id: 'insights', label: 'Reflections', icon: Brain }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'metrics' | 'milestones' | 'coping' | 'insights')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'metrics' && <WellbeingMetricsSection />}
      {activeTab === 'insights' && <ReflectionsSection />}
      
      {activeTab === 'milestones' && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-center">Milestones tracking coming soon...</p>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'coping' && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-center">Coping strategies tracking coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Save Progress */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            const entry: ProgressEntry = {
              id: `progress-${Date.now()}`,
              date: new Date(),
              wellbeingMetrics: currentEntry.wellbeingMetrics!,
              milestones: [],
              copingStrategies: [],
              reflections: currentEntry.reflections!,
              overallSatisfaction: currentEntry.overallSatisfaction!,
              notes: currentEntry.notes || ''
            };
            onProgressUpdate?.(entry);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Progress Entry
        </button>
      </div>
    </div>
  );
}

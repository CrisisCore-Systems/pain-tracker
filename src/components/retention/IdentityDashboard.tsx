/**
 * Identity Dashboard Component
 * 
 * Shows personalized journey narrative, patterns, and milestones.
 * Creates sense of identity around pain tracking practice.
 */

import React, { useEffect, useState } from 'react';
import { identityLockInService } from '@pain-tracker/services';
import type { PersonalPattern, JourneyInsight } from '@pain-tracker/services';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Heart, Sparkles, TrendingUp, Award, Calendar } from 'lucide-react';

interface IdentityDashboardProps {
  entries: any[];
  className?: string;
}

export const IdentityDashboard: React.FC<IdentityDashboardProps> = ({
  entries,
  className = '',
}) => {
  const [narrative, setNarrative] = useState<string>('');
  const [patterns, setPatterns] = useState<PersonalPattern[]>([]);
  const [insights, setInsights] = useState<JourneyInsight[]>([]);
  const [identityLanguage, setIdentityLanguage] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize journey
    identityLockInService.initializeJourney(entries);
    
    // Generate narrative
    const journeyNarrative = identityLockInService.generateJourneyNarrative(entries);
    setNarrative(journeyNarrative);
    
    // Discover patterns
    const newPatterns = identityLockInService.discoverPatterns(entries);
    if (newPatterns.length > 0) {
      setPatterns(identityLockInService.getIdentity().personalPatterns);
    }
    
    // Get insights
    const journeyInsights = identityLockInService.getIdentityInsights(entries);
    setInsights(journeyInsights);
    
    // Get language
    const language = identityLockInService.getIdentityLanguage(entries);
    setIdentityLanguage(language);
  }, [entries]);

  const getPatternIcon = (type: PersonalPattern['type']) => {
    switch (type) {
      case 'resilience':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'success':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'pain':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightIcon = (category: JourneyInsight['category']) => {
    switch (category) {
      case 'awareness':
        return '💡';
      case 'growth':
        return '🌱';
      case 'resilience':
        return '💪';
      case 'discovery':
        return '🔍';
      case 'connection':
        return '🤝';
      default:
        return '✨';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Journey Narrative */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {identityLanguage.title || 'Your Journey'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">{narrative}</p>
          {identityLanguage.subtitle && (
            <p className="text-sm text-purple-600 font-medium">
              {identityLanguage.subtitle}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Unique Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    {getPatternIcon(pattern.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{pattern.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                      <p className="text-xs text-purple-600 mt-2 italic">
                        {pattern.personalMeaning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Journey Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getInsightIcon(insight.category)}</span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{insight.insight}</p>
                      <p className="text-sm text-gray-600 mt-1">{insight.context}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

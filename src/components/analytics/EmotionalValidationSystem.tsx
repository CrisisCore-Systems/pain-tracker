// Emotional Validation Feedback System
// Provides real-time emotional support and validation

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { Heart, MessageCircle, Lightbulb, Users, CheckCircle, Star, Sparkles } from 'lucide-react';
import type { PainEntry } from '../../types';

interface EmotionalFeedbackProps {
  painEntry: PainEntry;
  onValidationGiven?: (validationType: string) => void;
  onInsightShared?: (insight: string) => void;
}

interface ValidationMessage {
  id: string;
  type: 'affirmation' | 'acknowledgment' | 'encouragement' | 'wisdom';
  message: string;
  context: 'high_pain' | 'low_mood' | 'progress' | 'struggle' | 'general';
}

interface EmotionalInsight {
  id: string;
  category: 'pattern' | 'strength' | 'coping' | 'growth';
  insight: string;
  actionable: string;
  affirmation: string;
}

export const EmotionalValidationSystem: React.FC<EmotionalFeedbackProps> = ({
  painEntry,
  onValidationGiven,
  onInsightShared
}) => {
  const [selectedValidation, setSelectedValidation] = useState<string | null>(null);
  const [showValidations, setShowValidations] = useState(true);
  const [personalizedMessages, setPersonalizedMessages] = useState<ValidationMessage[]>([]);
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);

  useEffect(() => {
    generatePersonalizedValidations();
    generateInsights();
  }, [painEntry]);

  const generatePersonalizedValidations = () => {
    const messages: ValidationMessage[] = [];
    const painLevel = painEntry.baselineData.pain;
    const hasNotes = painEntry.notes && painEntry.notes.length > 0;

    // High pain validation
    if (painLevel >= 7) {
      messages.push({
        id: 'high-pain-1',
        type: 'acknowledgment',
        message: "High pain days are incredibly challenging. Your experience is real and valid.",
        context: 'high_pain'
      });
      messages.push({
        id: 'high-pain-2',
        type: 'encouragement',
        message: "You're showing immense strength by continuing to track and care for yourself during difficult times.",
        context: 'high_pain'
      });
    }

    // Medium pain validation
    if (painLevel >= 4 && painLevel < 7) {
      messages.push({
        id: 'med-pain-1',
        type: 'affirmation',
        message: "Managing pain at this level while still functioning shows remarkable resilience.",
        context: 'general'
      });
    }

    // Progress acknowledgment
    if (painLevel < 4) {
      messages.push({
        id: 'progress-1',
        type: 'encouragement',
        message: "Having a lower pain day is worth celebrating. You deserve to feel good.",
        context: 'progress'
      });
    }

    // Notes appreciation
    if (hasNotes) {
      messages.push({
        id: 'notes-1',
        type: 'affirmation',
        message: "Taking time to reflect and document your experience shows incredible self-awareness.",
        context: 'general'
      });
    }

    // General validations
    messages.push(
      {
        id: 'general-1',
        type: 'wisdom',
        message: "Your pain doesn't define you, but your courage in facing it shows who you are.",
        context: 'general'
      },
      {
        id: 'general-2',
        type: 'affirmation',
        message: "Every day you live with pain and still choose to engage with life is an act of bravery.",
        context: 'general'
      }
    );

    setPersonalizedMessages(messages);
  };

  const generateInsights = () => {
    const newInsights: EmotionalInsight[] = [];

    // Pattern insights
    newInsights.push({
      id: 'pattern-1',
      category: 'pattern',
      insight: "You've been consistently tracking your pain, which shows commitment to understanding your experience.",
      actionable: "Consider looking for patterns in what helps or hinders your pain management.",
      affirmation: "Your dedication to self-awareness is a powerful tool for healing."
    });

    // Strength insights
    if (painEntry.notes && painEntry.notes.toLowerCase().includes('cope')) {
      newInsights.push({
        id: 'strength-1',
        category: 'strength',
        insight: "You're actively working on coping strategies, which demonstrates incredible resourcefulness.",
        actionable: "Keep exploring what works best for you - you're the expert on your own experience.",
        affirmation: "Your ability to adapt and find ways to cope is truly remarkable."
      });
    }

    // Coping insights
    newInsights.push({
      id: 'coping-1',
      category: 'coping',
      insight: "Each time you track your pain, you're practicing mindful awareness of your body.",
      actionable: "This awareness can become a foundation for developing personalized coping strategies.",
      affirmation: "Your mindful attention to your experience is a form of self-compassion."
    });

    // Growth insights
    newInsights.push({
      id: 'growth-1',
      category: 'growth',
      insight: "By consistently engaging with pain tracking, you're building emotional resilience.",
      actionable: "Consider celebrating small wins and progress, even on difficult days.",
      affirmation: "Your journey of growth and self-discovery is inspiring and valid."
    });

    setInsights(newInsights);
  };

  const handleValidationSelect = (message: ValidationMessage) => {
    setSelectedValidation(message.id);
    onValidationGiven?.(message.type);
    
    // Show confirmation
    setTimeout(() => {
      setSelectedValidation(null);
    }, 2000);
  };

  const handleInsightShare = (insight: EmotionalInsight) => {
    onInsightShared?.(insight.insight);
  };

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'affirmation': return <Heart className="w-4 h-4" />;
      case 'acknowledgment': return <CheckCircle className="w-4 h-4" />;
      case 'encouragement': return <Star className="w-4 h-4" />;
      case 'wisdom': return <Lightbulb className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getValidationColor = (type: string) => {
    switch (type) {
      case 'affirmation': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'acknowledgment': return 'text-green-600 bg-green-50 border-green-200';
      case 'encouragement': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'wisdom': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'pattern': return <MessageCircle className="w-4 h-4" />;
      case 'strength': return <Star className="w-4 h-4" />;
      case 'coping': return <Heart className="w-4 h-4" />;
      case 'growth': return <Sparkles className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Messages */}
      {showValidations && (
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Heart className="w-5 h-5" />
              Emotional Validation
            </CardTitle>
            <p className="text-sm text-gray-600">
              Your feelings and experiences are valid. Here are some personalized messages for you:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalizedMessages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedValidation === message.id
                      ? 'bg-green-100 border-green-300'
                      : getValidationColor(message.type)
                  }`}
                  onClick={() => handleValidationSelect(message)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {selectedValidation === message.id ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        getValidationIcon(message.type)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-700">{message.message}</p>
                      {selectedValidation === message.id && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ Validation received
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidations(false)}
                className="text-gray-600"
              >
                Hide for now
              </Button>
              <p className="text-xs text-gray-500">
                Click any message that resonates with you
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emotional Insights */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="w-5 h-5" />
            Personal Insights
          </CardTitle>
          <p className="text-sm text-gray-600">
            Reflections on your journey and growth
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1 text-blue-600">
                    {getInsightIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {insight.category} Insight
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.insight}</p>
                    <div className="bg-blue-50 p-3 rounded-md mb-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">ACTIONABLE:</p>
                      <p className="text-sm text-blue-800">{insight.actionable}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-md">
                      <p className="text-xs font-medium text-purple-700 mb-1">AFFIRMATION:</p>
                      <p className="text-sm text-purple-800 italic">"{insight.affirmation}"</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInsightShare(insight)}
                        className="text-blue-600 border-blue-300"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Support Widget */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Users className="w-5 h-5" />
            Community Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You're not alone in this journey. Connect with others who understand.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Support Groups
              </Button>
              <Button
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Peer Stories
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Your voice and experience matter to this community
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden validation messages toggle */}
      {!showValidations && (
        <Button
          onClick={() => setShowValidations(true)}
          className="w-full bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300"
        >
          <Heart className="w-4 h-4 mr-2" />
          Show Validation Messages
        </Button>
      )}
    </div>
  );
};

export default EmotionalValidationSystem;

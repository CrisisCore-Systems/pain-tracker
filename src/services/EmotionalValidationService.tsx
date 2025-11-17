/**
 * Real-Time Emotional Validation System
 * Provides immediate emotional acknowledgment and validation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Shield, CloudRain, Sun, Sparkles } from 'lucide-react';
import { useTraumaInformed } from '../components/accessibility/TraumaInformedHooks';

// Types for emotional validation
export interface EmotionalState {
  valence: 'positive' | 'neutral' | 'negative' | 'mixed';
  arousal: 'high' | 'medium' | 'low';
  keywords: string[];
  confidence: number;
  triggers?: string[];
}

export interface ValidationResponse {
  id: string;
  message: string;
  tone: 'supportive' | 'empathetic' | 'celebratory' | 'gentle';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  followUp?: string;
  timestamp: Date;
}

// Emotional analysis service
class EmotionalAnalysisService {
  private positiveKeywords = [
    'better', 'improved', 'good', 'great', 'healing', 'progress', 'relief',
    'comfortable', 'manageable', 'hopeful', 'grateful', 'thankful', 'blessed',
    'stronger', 'resilient', 'capable', 'empowered', 'peaceful', 'calm'
  ];

  private negativeKeywords = [
    'pain', 'hurt', 'suffering', 'agony', 'terrible', 'awful', 'unbearable',
    'frustrated', 'angry', 'sad', 'depressed', 'anxious', 'worried', 'scared',
    'overwhelmed', 'exhausted', 'defeated', 'hopeless', 'alone', 'isolated'
  ];

  private neutralKeywords = [
    'same', 'unchanged', 'stable', 'managing', 'coping', 'continuing',
    'routine', 'regular', 'normal', 'usual', 'consistent', 'steady'
  ];

  private triggerKeywords = [
    'flare', 'spike', 'increase', 'worse', 'worsening', 'setback',
    'episode', 'attack', 'breakthrough', 'sudden', 'intense', 'severe'
  ];

  analyzeText(text: string): EmotionalState {
    const words = text.toLowerCase().split(/\s+/);
    
    const positiveCount = words.filter(word => 
      this.positiveKeywords.some(keyword => word.includes(keyword))
    ).length;
    
    const negativeCount = words.filter(word =>
      this.negativeKeywords.some(keyword => word.includes(keyword))
    ).length;
    
    const neutralCount = words.filter(word =>
      this.neutralKeywords.some(keyword => word.includes(keyword))
    ).length;
    
    const triggerCount = words.filter(word =>
      this.triggerKeywords.some(keyword => word.includes(keyword))
    ).length;

    // Determine valence
    let valence: EmotionalState['valence'] = 'neutral';
    if (positiveCount > negativeCount && positiveCount > 0) valence = 'positive';
    else if (negativeCount > positiveCount && negativeCount > 0) valence = 'negative';
    else if (positiveCount > 0 && negativeCount > 0) valence = 'mixed';

    // Determine arousal based on intensity words and triggers
    const intensityWords = ['very', 'extremely', 'incredibly', 'really', 'so', 'quite'];
    const intensityCount = words.filter(word => intensityWords.includes(word)).length;
    
    let arousal: EmotionalState['arousal'] = 'low';
    if (triggerCount > 0 || intensityCount > 2) arousal = 'high';
    else if (intensityCount > 0 || negativeCount > 1) arousal = 'medium';

    const confidence = Math.min(
      (positiveCount + negativeCount + neutralCount) / Math.max(words.length / 4, 1),
      1
    );

    return {
      valence,
      arousal,
      keywords: words.filter(word => 
        this.positiveKeywords.concat(this.negativeKeywords, this.neutralKeywords)
          .some(keyword => word.includes(keyword))
      ),
      confidence,
      triggers: triggerCount > 0 ? words.filter(word =>
        this.triggerKeywords.some(keyword => word.includes(keyword))
      ) : undefined
    };
  }
}

// Validation message generator
class ValidationMessageGenerator {
  private supportiveMessages = [
    "I hear that you're going through a challenging time. Your experience is valid and important.",
    "Thank you for sharing what you're experiencing. It takes courage to track difficult moments.",
    "Your pain matters, and so do you. Taking time to document this shows incredible strength.",
    "I acknowledge how hard this must be for you right now. You're not alone in this journey.",
    "Your feelings about this experience are completely understandable and valid."
  ];

  private emphaticMessages = [
    "That sounds really difficult. I want you to know that your struggle is seen and recognized.",
    "I can sense this is a tough moment for you. Please be gentle with yourself.",
    "What you're experiencing sounds overwhelming. You're doing the best you can.",
    "This sounds like a particularly hard day. Remember that difficult days don't last forever.",
    "I hear the pain in your words. Your resilience in tracking this is remarkable."
  ];

  private celebratoryMessages = [
    "This sounds like positive progress! It's wonderful to hear things are improving for you.",
    "What encouraging news! Every step forward, no matter how small, is worth celebrating.",
    "I'm so glad to hear you're experiencing some relief. You deserve these better moments.",
    "This improvement is a testament to your strength and perseverance. Well done!",
    "It's beautiful to see progress in your healing journey. Keep nurturing yourself."
  ];

  private gentleMessages = [
    "Thank you for taking the time to track your experience. Every entry helps build understanding.",
    "I appreciate you sharing this with me. Your consistency in tracking is admirable.",
    "This information helps create a clearer picture of your journey. Thank you for your openness.",
    "Each entry you make is a step toward better understanding your patterns. Well done.",
    "Your commitment to tracking your experience shows real dedication to your wellbeing."
  ];

  generate(emotionalState: EmotionalState): ValidationResponse {
    let messages: string[];
    let tone: ValidationResponse['tone'];
    let icon: React.ComponentType<{ className?: string }>;
    let color: string;
    let followUp: string | undefined;

    switch (emotionalState.valence) {
      case 'positive':
        messages = this.celebratoryMessages;
        tone = 'celebratory';
        icon = Sun;
        color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
        followUp = "Would you like to note what contributed to this positive experience?";
        break;
      
      case 'negative':
        if (emotionalState.arousal === 'high') {
          messages = this.emphaticMessages;
          tone = 'empathetic';
          icon = CloudRain;
          color = 'text-blue-600 bg-blue-50 border-blue-200';
          followUp = "Remember, you have support available. Would you like to review your comfort resources?";
        } else {
          messages = this.supportiveMessages;
          tone = 'supportive';
          icon = Heart;
          color = 'text-pink-600 bg-pink-50 border-pink-200';
          followUp = "Taking care of yourself during difficult times is so important.";
        }
        break;
      
      case 'mixed':
        messages = this.gentleMessages;
        tone = 'gentle';
        icon = Sparkles;
        color = 'text-purple-600 bg-purple-50 border-purple-200';
        followUp = "Complex experiences deserve gentle acknowledgment.";
        break;
      
      default:
        messages = this.gentleMessages;
        tone = 'gentle';
        icon = Shield;
        color = 'text-green-600 bg-green-50 border-green-200';
        break;
    }

    return {
      id: `validation-${Date.now()}`,
      message: messages[Math.floor(Math.random() * messages.length)],
      tone,
      icon,
      color,
      followUp,
      timestamp: new Date()
    };
  }
}

// Main validation component
interface EmotionalValidationProps {
  text: string;
  onValidationGenerated?: (response: ValidationResponse) => void;
  isActive?: boolean;
  delay?: number;
}

export function EmotionalValidation({
  text,
  onValidationGenerated,
  isActive = true,
  delay = 2000
}: EmotionalValidationProps) {
  const { preferences } = useTraumaInformed();
  const [currentValidation, setCurrentValidation] = useState<ValidationResponse | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const analysisService = useRef(new EmotionalAnalysisService());
  const messageGenerator = useRef(new ValidationMessageGenerator());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const generateValidation = useCallback((inputText: string) => {
    if (!inputText.trim() || inputText.length < 10) return;
    
    const emotionalState = analysisService.current.analyzeText(inputText);
    if (emotionalState.confidence < 0.2) return;
    
    const validation = messageGenerator.current.generate(emotionalState);
    setCurrentValidation(validation);
    setIsVisible(true);
    onValidationGenerated?.(validation);
    
    // Auto-hide after 10 seconds unless it's high arousal negative
    if (emotionalState.valence !== 'negative' || emotionalState.arousal !== 'high') {
      setTimeout(() => setIsVisible(false), 10000);
    }
  }, [onValidationGenerated]);

  useEffect(() => {
    if (!isActive || !preferences.realTimeValidation) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      generateValidation(text);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isActive, delay, generateValidation, preferences.realTimeValidation]);

  if (!preferences.realTimeValidation || !currentValidation || !isVisible) {
    return null;
  }

  const IconComponent = currentValidation.icon;

  return (
    <div 
      className={`
        mt-3 p-4 rounded-lg border transition-all duration-300 ease-in-out
        ${currentValidation.color}
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">
            {currentValidation.message}
          </p>
          {currentValidation.followUp && (
            <p className="text-xs opacity-75">
              {currentValidation.followUp}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs opacity-50 hover:opacity-75 transition-opacity"
          aria-label="Dismiss validation message"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Validation history component
interface ValidationHistoryProps {
  validations: ValidationResponse[];
  onClear?: () => void;
}

export function ValidationHistory({ validations, onClear }: ValidationHistoryProps) {
  const { preferences } = useTraumaInformed();
  
  if (!preferences.realTimeValidation || validations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Validation Messages</h4>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            Clear History
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {validations.slice(-5).reverse().map((validation) => {
          const IconComponent = validation.icon;
          return (
            <div
              key={validation.id}
              className={`p-2 rounded text-xs border ${validation.color}`}
            >
              <div className="flex items-start space-x-2">
                <IconComponent className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p>{validation.message}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {validation.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

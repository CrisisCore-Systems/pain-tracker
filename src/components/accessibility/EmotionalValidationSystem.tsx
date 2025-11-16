/**
 * Emotional Validation Feedback Systems
 * Provides empathetic, supportive responses that acknowledge user feelings
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Zap,
  Feather,
  Star,
  HelpingHand,
  Target
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { useEmotionalValidation, type EmotionalState, type ValidationResponse } from './useEmotionalValidation';

interface EmotionalValidationProps {
  painLevel?: number;
  activityCompleted?: string;
  strugglingMoment?: boolean;
  smallVictory?: boolean;
  onEmotionalSupport?: (supportType: string) => void;
}

export function EmotionalValidationSystem({
  painLevel,
  activityCompleted,
  strugglingMoment,
  smallVictory,
  onEmotionalSupport
}: EmotionalValidationProps) {
  const { preferences } = useTraumaInformed();
  const { triggerValidation, processNextValidation } = useEmotionalValidation();
  const [currentValidation, setCurrentValidation] = useState<ValidationResponse | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Determine appropriate validation response based on context
  useEffect(() => {
    if (strugglingMoment) {
      triggerValidation('struggling');
    } else if (smallVictory) {
      triggerValidation('victory');
    } else if (painLevel !== undefined) {
      if (painLevel >= 7) {
        triggerValidation('pain-spike');
      } else if (painLevel <= 3) {
        triggerValidation('low-pain');
      }
    } else if (activityCompleted) {
      triggerValidation('consistency');
    }

    // Get the validation response
    const validation = processNextValidation();
    if (validation) {
      setCurrentValidation(validation);
      setShowValidation(true);
    }
  }, [painLevel, activityCompleted, strugglingMoment, smallVictory, triggerValidation, processNextValidation]);

  if (!showValidation || !currentValidation || preferences.simplifiedMode) {
    return null;
  }

  return (
    <div className="emotional-validation-container mb-6">
      <EmotionalValidationCard
        validation={currentValidation}
        onClose={() => setShowValidation(false)}
        onEmotionalSupport={onEmotionalSupport}
      />
    </div>
  );
}

// Main validation card component
function EmotionalValidationCard({
  validation,
  onClose,
  onEmotionalSupport
}: {
  validation: ValidationResponse;
  onClose: () => void;
  onEmotionalSupport?: (supportType: string) => void;
}) {
  const Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> = validation.icon;
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const supportTypeColors = {
    acknowledgment: 'bg-blue-50 border-blue-200 text-blue-800',
    encouragement: 'bg-green-50 border-green-200 text-green-800',
    practical: 'bg-purple-50 border-purple-200 text-purple-800',
    celebration: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className={`
      rounded-lg border-2 p-4 transition-all duration-300
      ${supportTypeColors[validation.supportType]}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6 mt-1" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-3 leading-relaxed">
            {validation.message}
          </p>
          
          {/* Affirmations */}
          {validation.affirmations && (
            <div className="mb-3">
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => setShowAffirmations(!showAffirmations)}
                className="text-xs mb-2 bg-white/50"
              >
                {showAffirmations ? 'Hide' : 'Show'} Affirmations ✨
              </TouchOptimizedButton>
              
              {showAffirmations && (
                <div className="space-y-1">
                  {validation.affirmations.map((affirmation, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="italic">{affirmation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Action Suggestions */}
          {validation.actionSuggestions && (
            <div className="mb-3">
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => setShowActions(!showActions)}
                className="text-xs mb-2 bg-white/50"
              >
                {showActions ? 'Hide' : 'Show'} Gentle Suggestions 🤲
              </TouchOptimizedButton>
              
              {showActions && (
                <div className="space-y-1">
                  {validation.actionSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <HelpingHand className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => {
                  if (onEmotionalSupport) onEmotionalSupport('helpful');
                }}
                className="text-xs bg-white/70"
              >
                This helps 💙
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                variant="secondary"
                onClick={() => {
                  if (onEmotionalSupport) onEmotionalSupport('more-support');
                }}
                className="text-xs bg-white/70"
              >
                I need more support
              </TouchOptimizedButton>
            </div>
            
            <TouchOptimizedButton
              variant="secondary"
              onClick={onClose}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </TouchOptimizedButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Emotion check-in component
export function EmotionalCheckIn({
  onEmotionalState,
  onValidationNeeded
}: {
  onEmotionalState?: (state: EmotionalState) => void;
  onValidationNeeded?: (context: string) => void;
}) {
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [painRelated, setPainRelated] = useState<boolean>(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const feelings = [
    { name: 'Frustrated', icon: Zap, color: 'text-gray-600' },
    { name: 'Tired', icon: Feather, color: 'text-blue-600' },
    { name: 'Hopeful', icon: Star, color: 'text-yellow-600' },
    { name: 'Overwhelmed', icon: Zap, color: 'text-red-600' },
    { name: 'Grateful', icon: Heart, color: 'text-pink-600' },
    { name: 'Proud', icon: Star, color: 'text-purple-600' },
    { name: 'Peaceful', icon: Feather, color: 'text-green-600' },
    { name: 'Determined', icon: Target, color: 'text-orange-600' }
  ];

  const submitEmotionalState = () => {
    const state: EmotionalState = {
      feeling: selectedFeeling,
      intensity,
      painRelated,
      needsSupport: intensity >= 7 || selectedFeeling === 'Overwhelmed' || selectedFeeling === 'Frustrated',
      timestamp: new Date()
    };

    if (onEmotionalState) onEmotionalState(state);
    if (onValidationNeeded && state.needsSupport) {
      onValidationNeeded('struggling');
    }

    setShowCheckIn(false);
    setSelectedFeeling('');
    setIntensity(5);
    setPainRelated(false);
  };

  if (!showCheckIn) {
    return (
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => setShowCheckIn(true)}
        className="w-full mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
      >
        <Heart className="w-4 h-4 mr-2" />
        How are you feeling right now?
      </TouchOptimizedButton>
    );
  }

  return (
    <div className="bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Heart className="w-5 h-5 mr-2 text-pink-500" />
        How are you feeling?
      </h3>
      
      {/* Feeling Selection */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose what feels closest:</p>
        <div className="grid grid-cols-2 gap-2">
          {feelings.map((feeling) => {
            const Icon = feeling.icon;
            return (
              <TouchOptimizedButton
                key={feeling.name}
                variant={selectedFeeling === feeling.name ? "primary" : "secondary"}
                onClick={() => setSelectedFeeling(feeling.name)}
                className="p-3 text-left"
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${feeling.color}`} />
                  <span className="text-sm">{feeling.name}</span>
                </div>
              </TouchOptimizedButton>
            );
          })}
        </div>
      </div>
      
      {/* Intensity */}
      {selectedFeeling && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">How intense is this feeling?</p>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Mild</span>
            <span className="font-medium">{intensity}/10</span>
            <span>Intense</span>
          </div>
        </div>
      )}
      
      {/* Pain Related */}
      {selectedFeeling && (
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={painRelated}
              onChange={(e) => setPainRelated(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">This feeling is related to my pain</span>
          </label>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex space-x-2">
        <TouchOptimizedButton
          variant="primary"
          onClick={submitEmotionalState}
          disabled={!selectedFeeling}
          className="flex-1"
        >
          Share my feelings
        </TouchOptimizedButton>
        
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => setShowCheckIn(false)}
          className="px-4"
        >
          Maybe later
        </TouchOptimizedButton>
      </div>
    </div>
  );
}

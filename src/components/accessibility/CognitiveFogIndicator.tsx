/**
 * Cognitive Fog Indicator for Pain-Related Brain Fog
 * Specialized indicators and support for cognitive challenges related to chronic pain
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  CloudRain, 
  Lightbulb, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Coffee,
  Pause,
  RotateCcw,
  Sun
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { useCrisisDetection } from './useCrisisDetection';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface CognitiveFogLevel {
  level: 'clear' | 'mild' | 'moderate' | 'severe' | 'overwhelming';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  suggestions: string[];
  adaptations: CognitiveAdaptation[];
}

interface CognitiveAdaptation {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

interface CognitiveFogIndicatorProps {
  painLevel?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  medicationEffects?: 'none' | 'mild' | 'moderate' | 'severe';
  stressLevel?: number;
  onAdaptationApplied?: (adaptationId: string) => void;
  showAdvancedOptions?: boolean;
}

const fogLevels: Record<string, CognitiveFogLevel> = {
  clear: {
    level: 'clear',
    description: 'Mind is clear and focused',
    icon: Sun,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    suggestions: ['Good time for complex tasks', 'Consider tackling detailed forms'],
    adaptations: []
  },
  mild: {
    level: 'mild',
    description: 'Slight mental cloudiness',
    icon: CloudRain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    suggestions: [
      'Take your time with decisions',
      'Use voice input if helpful',
      'Break tasks into smaller steps'
    ],
    adaptations: [
      {
        id: 'voice-input',
        title: 'Enable Voice Input',
        description: 'Use voice commands instead of typing',
        action: () => {},
        icon: Coffee
      },
      {
        id: 'larger-text',
        title: 'Increase Text Size',
        description: 'Make text easier to read',
        action: () => {},
        icon: Sun
      }
    ]
  },
  moderate: {
    level: 'moderate',
    description: 'Noticeable difficulty concentrating',
    icon: Brain,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    suggestions: [
      'Consider simplifying the interface',
      'Use memory aids and reminders',
      'Take breaks between sections',
      'Save progress frequently'
    ],
    adaptations: [
      {
        id: 'simplified-mode',
        title: 'Simplified Interface',
        description: 'Reduce visual complexity',
        action: () => {},
        icon: Lightbulb
      },
      {
        id: 'memory-aids',
        title: 'Memory Aids',
        description: 'Show helpful reminders',
        action: () => {},
        icon: CheckCircle
      },
      {
        id: 'auto-save',
        title: 'Auto-save',
        description: 'Save progress automatically',
        action: () => {},
        icon: Clock
      }
    ]
  },
  severe: {
    level: 'severe',
    description: 'Significant cognitive fog',
    icon: CloudRain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    suggestions: [
      'Strong recommendation to simplify',
      'Consider returning later',
      'Use emergency mode if needed',
      'Focus on essential information only'
    ],
    adaptations: [
      {
        id: 'emergency-mode',
        title: 'Emergency Mode',
        description: 'Simplified interface with essential functions only',
        action: () => {},
        icon: AlertTriangle
      },
      {
        id: 'break-mode',
        title: 'Take a Break',
        description: 'Pause and rest your mind',
        action: () => {},
        icon: Pause
      },
      {
        id: 'come-back-later',
        title: 'Save & Return Later',
        description: 'Complete this when feeling clearer',
        action: () => {},
        icon: RotateCcw
      }
    ]
  },
  overwhelming: {
    level: 'overwhelming',
    description: 'Severe brain fog - immediate support needed',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    suggestions: [
      'Immediate simplification recommended',
      'Emergency mode activated',
      'Essential functions only',
      'Consider getting support'
    ],
    adaptations: [
      {
        id: 'crisis-mode',
        title: 'Crisis Support',
        description: 'Activate crisis support interface',
        action: () => {},
        icon: AlertTriangle
      },
      {
        id: 'emergency-contact',
        title: 'Contact Support',
        description: 'Reach out for immediate help',
        action: () => {},
        icon: CheckCircle
      }
    ]
  }
};

export function CognitiveFogIndicator({
  painLevel = 0,
  timeOfDay = 'afternoon',
  medicationEffects = 'none',
  stressLevel = 0,
  onAdaptationApplied,
  showAdvancedOptions = true
}: CognitiveFogIndicatorProps) {
  const { updatePreferences } = useTraumaInformed();
  const { crisisLevel, behaviorData } = useCrisisDetection();
  const [currentFogLevel, setCurrentFogLevel] = useState<CognitiveFogLevel>(fogLevels.clear);
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedAdaptations, setAppliedAdaptations] = useState<Set<string>>(new Set());

  // Calculate cognitive fog level based on multiple factors
  const calculateFogLevel = useCallback(() => {
    let fogScore = 0;

    // Pain contributes to brain fog
    if (painLevel >= 8) fogScore += 3;
    else if (painLevel >= 6) fogScore += 2;
    else if (painLevel >= 4) fogScore += 1;

    // Time of day effects
    if (timeOfDay === 'morning' && painLevel > 5) fogScore += 1; // Morning stiffness
    if (timeOfDay === 'evening') fogScore += 1; // End of day fatigue
    if (timeOfDay === 'night') fogScore += 2; // Night time difficulties

    // Medication effects
    if (medicationEffects === 'severe') fogScore += 2;
    else if (medicationEffects === 'moderate') fogScore += 1;

    // Stress contributions
    if (stressLevel >= 8) fogScore += 2;
    else if (stressLevel >= 6) fogScore += 1;

    // Crisis state amplifies fog
    const isInCrisis = crisisLevel !== 'none';
    if (isInCrisis) fogScore += 1;

    // Current cognitive load from behavior
    const cognitiveLoad = (behaviorData.errorCount * 0.2 + behaviorData.rapidClicks * 0.1) / 10;
    if (cognitiveLoad >= 0.8) fogScore += 2;
    else if (cognitiveLoad >= 0.6) fogScore += 1;

    // Determine fog level
    if (fogScore === 0) return fogLevels.clear;
    if (fogScore <= 2) return fogLevels.mild;
    if (fogScore <= 4) return fogLevels.moderate;
    if (fogScore <= 6) return fogLevels.severe;
    return fogLevels.overwhelming;
  }, [painLevel, timeOfDay, medicationEffects, stressLevel, crisisLevel, behaviorData]);

  useEffect(() => {
    const newLevel = calculateFogLevel();
    setCurrentFogLevel(newLevel);
    
    // Auto-expand if fog is severe
    if (newLevel.level === 'severe' || newLevel.level === 'overwhelming') {
      setIsExpanded(true);
    }
  }, [calculateFogLevel]);

  // Apply cognitive adaptation
  const applyAdaptation = (adaptation: CognitiveAdaptation) => {
    switch (adaptation.id) {
      case 'voice-input':
        updatePreferences({ voiceInput: true });
        break;
      case 'larger-text':
        updatePreferences({ fontSize: 'large' });
        break;
      case 'simplified-mode':
        updatePreferences({ 
          simplifiedMode: true,
          showMemoryAids: true,
          autoSave: true
        });
        break;
      case 'memory-aids':
        updatePreferences({ showMemoryAids: true });
        break;
      case 'auto-save':
        updatePreferences({ autoSave: true });
        break;
      case 'emergency-mode':
        updatePreferences({
          simplifiedMode: true,
          showMemoryAids: true,
          autoSave: true,
          touchTargetSize: 'extra-large',
          confirmationLevel: 'high'
        });
        break;
      default:
        break;
    }

    setAppliedAdaptations(prev => new Set([...prev, adaptation.id]));
    
    if (onAdaptationApplied) {
      onAdaptationApplied(adaptation.id);
    }
  };

  // Don't show for clear fog unless user wants advanced options
  if (currentFogLevel.level === 'clear' && !showAdvancedOptions) {
    return null;
  }

  const Icon = currentFogLevel.icon;

  return (
    <div className={`
      rounded-lg border p-4 transition-all duration-200
      ${currentFogLevel.bgColor} ${currentFogLevel.borderColor}
    `}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${currentFogLevel.color}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-medium ${currentFogLevel.color}`}>
              Brain Fog: {currentFogLevel.level.charAt(0).toUpperCase() + currentFogLevel.level.slice(1)}
            </h4>
            
            <TouchOptimizedButton
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Less' : 'More'}
            </TouchOptimizedButton>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {currentFogLevel.description}
          </p>

          {/* Fog Contributing Factors */}
          <FogFactorsDisplay
            painLevel={painLevel}
            timeOfDay={timeOfDay}
            medicationEffects={medicationEffects}
            stressLevel={stressLevel}
            isInCrisis={crisisLevel !== 'none'}
          />
          
          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Suggestions */}
              {currentFogLevel.suggestions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Suggestions:</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {currentFogLevel.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Adaptations */}
              {currentFogLevel.adaptations.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Quick Adaptations:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentFogLevel.adaptations.map((adaptation) => {
                      const AdaptationIcon = adaptation.icon;
                      const isApplied = appliedAdaptations.has(adaptation.id);
                      
                      return (
                        <TouchOptimizedButton
                          key={adaptation.id}
                          variant={isApplied ? "primary" : "secondary"}
                          onClick={() => applyAdaptation(adaptation)}
                          disabled={isApplied}
                          className="text-xs p-3 h-auto"
                        >
                          <div className="flex items-center space-x-2">
                            <AdaptationIcon className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">{adaptation.title}</div>
                              <div className="text-xs opacity-75">
                                {adaptation.description}
                              </div>
                            </div>
                          </div>
                        </TouchOptimizedButton>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Display factors contributing to brain fog
function FogFactorsDisplay({
  painLevel,
  timeOfDay,
  medicationEffects,
  stressLevel,
  isInCrisis
}: {
  painLevel: number;
  timeOfDay: string;
  medicationEffects: string;
  stressLevel: number;
  isInCrisis: boolean;
}) {
  const factors = [];
  
  if (painLevel >= 6) factors.push(`High pain (${painLevel}/10)`);
  if (timeOfDay === 'evening' || timeOfDay === 'night') factors.push(`${timeOfDay} fatigue`);
  if (medicationEffects !== 'none') factors.push(`Medication effects`);
  if (stressLevel >= 6) factors.push(`High stress`);
  if (isInCrisis) factors.push(`Crisis state`);
  
  if (factors.length === 0) {
    return null;
  }
  
  return (
    <div className="text-xs text-gray-600 dark:text-gray-400">
      <span className="font-medium">Contributing factors: </span>
      {factors.join(', ')}
    </div>
  );
}

// Simple fog level indicator for forms and other components
export function SimpleFogIndicator({ 
  level, 
  onSimplify 
}: { 
  level: 'clear' | 'mild' | 'moderate' | 'severe' | 'overwhelming';
  onSimplify?: () => void;
}) {
  const config = fogLevels[level];
  const Icon = config.icon;
  
  if (level === 'clear') return null;
  
  return (
    <div className={`
      inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs
      ${config.bgColor} ${config.color}
    `}>
      <Icon className="w-3 h-3" />
      <span>Brain fog: {level}</span>
      {onSimplify && (level === 'severe' || level === 'overwhelming') && (
        <TouchOptimizedButton
          variant="secondary"
          onClick={onSimplify}
          className="text-xs ml-2"
        >
          Simplify
        </TouchOptimizedButton>
      )}
    </div>
  );
}

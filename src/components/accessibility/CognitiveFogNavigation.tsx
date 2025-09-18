/**
 * Cognitive Fog Navigation Components
 * Simplified navigation system for users experiencing cognitive difficulties
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton, MemoryAid } from './TraumaInformedUX';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Compass, 
  Check, 
  Clock,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Star,
  Target
} from 'lucide-react';

// Navigation Context Types
interface NavigationStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isCompleted: boolean;
  isOptional: boolean;
  estimatedTime: number; // in minutes
  helpText?: string;
  memoryAids?: string[];
}

interface NavigationSession {
  id: string;
  title: string;
  description: string;
  steps: NavigationStep[];
  currentStepIndex: number;
  startTime: Date;
  totalEstimatedTime: number;
  allowBackNavigation: boolean;
  showProgress: boolean;
}

// Cognitive Fog Breadcrumbs
interface CognitiveBreadcrumbsProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  showEstimatedTime?: boolean;
  allowBackNavigation?: boolean;
}

export function CognitiveBreadcrumbs({ 
  steps, 
  currentStep, 
  onStepClick,
  showEstimatedTime = true,
  allowBackNavigation = true
}: CognitiveBreadcrumbsProps) {
  const { preferences } = useTraumaInformed();
  
  return (
    <div className="cognitive-breadcrumbs bg-white border-b-2 border-blue-100 p-4 mb-6">
      <div className="max-w-4xl mx-auto">
        {/* Main breadcrumb trail */}
        <nav aria-label="Navigation steps" className="mb-3">
          <ol className="flex items-center space-x-2 text-sm">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                
                <button
                  onClick={() => allowBackNavigation && onStepClick?.(index)}
                  disabled={!allowBackNavigation || index > currentStep}
                  className={`
                    px-3 py-2 rounded-lg transition-colors
                    ${index === currentStep 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : index < currentStep 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-500'
                    }
                    ${allowBackNavigation && index <= currentStep ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {index < currentStep && <Check className="w-4 h-4" />}
                    {index === currentStep && <Target className="w-4 h-4" />}
                    <span>{step}</span>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Progress bar */}
        {preferences.showProgress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{currentStep + 1} of {steps.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Estimated time */}
        {showEstimatedTime && (
          <div className="text-xs text-gray-500 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Compass className="w-4 h-4" />
              <span>Take your time - no rush</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Step-by-Step Navigation Component
interface StepByStepNavigationProps {
  session: NavigationSession;
  onStepComplete: (stepId: string) => void;
  onNavigateBack: () => void;
  onNavigateNext: () => void;
  onSessionComplete: () => void;
  onSessionExit: () => void;
}

export function StepByStepNavigation({
  session,
  onStepComplete,
  onNavigateBack,
  onNavigateNext,
  onSessionComplete,
  onSessionExit
}: StepByStepNavigationProps) {
  const { preferences } = useTraumaInformed();
  const { trackHelpRequest } = useCrisisDetection();
  const [showHelp, setShowHelp] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const currentStep = session.steps[session.currentStepIndex];
  const isFirstStep = session.currentStepIndex === 0;
  const isLastStep = session.currentStepIndex === session.steps.length - 1;
  const canProceed = currentStep?.isCompleted || currentStep?.isOptional;
  const allStepsCompleted = session.steps.every(step => step.isCompleted || step.isOptional);

  // Track session time
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - session.startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  const handleStepComplete = () => {
    if (currentStep && !currentStep.isCompleted) {
      onStepComplete(currentStep.id);
    }
  };

  const handleHelpRequest = () => {
    trackHelpRequest();
    setShowHelp(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="step-by-step-navigation min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{session.title}</h1>
              <p className="text-gray-600">{session.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatTime(sessionTime)}
              </div>
              
              <TouchOptimizedButton
                onClick={handleHelpRequest}
                variant="secondary"
                size="normal"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Help
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                onClick={onSessionExit}
                variant="secondary"
                size="normal"
              >
                Exit
              </TouchOptimizedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <CognitiveBreadcrumbs
        steps={session.steps.map(step => step.title)}
        currentStep={session.currentStepIndex}
        onStepClick={(stepIndex) => {
          if (session.allowBackNavigation && stepIndex < session.currentStepIndex) {
            // Navigate to previous completed step
          }
        }}
        allowBackNavigation={session.allowBackNavigation}
        showEstimatedTime={true}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentStep && (
          <div className="step-content">
            {/* Step Header */}
            <div className="step-header bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                      ${currentStep.isCompleted ? 'bg-green-500' : 'bg-blue-500'}
                    `}>
                      {currentStep.isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        session.currentStepIndex + 1
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {currentStep.title}
                    </h2>
                    {currentStep.isOptional && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{currentStep.description}</p>
                  
                  {currentStep.estimatedTime > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {currentStep.estimatedTime} minute{currentStep.estimatedTime !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory Aids */}
              {preferences.showMemoryAids && currentStep.memoryAids && (
                <div className="memory-aids mb-4">
                  <MemoryAid
                    title="Remember:"
                    items={currentStep.memoryAids}
                  />
                </div>
              )}

              {/* Help Text */}
              {currentStep.helpText && showHelp && (
                <div className="help-text bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Help</h4>
                      <p className="text-blue-700 text-sm">{currentStep.helpText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="step-body bg-white rounded-xl shadow-sm p-6 mb-6">
              {currentStep.component}
            </div>

            {/* Step Actions */}
            <div className="step-actions bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {!isFirstStep && session.allowBackNavigation && (
                    <TouchOptimizedButton
                      onClick={onNavigateBack}
                      variant="secondary"
                      size="large"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Previous Step
                    </TouchOptimizedButton>
                  )}
                  
                  <TouchOptimizedButton
                    onClick={() => window.location.href = '/'}
                    variant="secondary"
                    size="large"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </TouchOptimizedButton>
                </div>

                <div className="flex space-x-3">
                  {!currentStep.isCompleted && !currentStep.isOptional && (
                    <TouchOptimizedButton
                      onClick={handleStepComplete}
                      variant="primary"
                      size="large"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark Complete
                    </TouchOptimizedButton>
                  )}

                  {isLastStep && allStepsCompleted ? (
                    <TouchOptimizedButton
                      onClick={onSessionComplete}
                      variant="primary"
                      size="large"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Finish Session
                    </TouchOptimizedButton>
                  ) : canProceed && !isLastStep ? (
                    <TouchOptimizedButton
                      onClick={onNavigateNext}
                      variant="primary"
                      size="large"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </TouchOptimizedButton>
                  ) : (
                    <TouchOptimizedButton
                      onClick={onNavigateNext}
                      variant="secondary"
                      size="large"
                      disabled={!currentStep.isOptional}
                    >
                      {currentStep.isOptional ? 'Skip Step' : 'Complete Step First'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </TouchOptimizedButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Context Preservation Component
interface ContextPreservationProps {
  children: React.ReactNode;
  contextKey: string;
  preserveFormData?: boolean;
  preserveScrollPosition?: boolean;
  autoSaveInterval?: number; // milliseconds
}

export function ContextPreservation({
  children,
  contextKey,
  preserveScrollPosition = true,
  autoSaveInterval = 30000 // 30 seconds
}: ContextPreservationProps) {
  const [contextData, setContextData] = useState<Record<string, unknown>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save context callback (hoisted above effects)
  const saveContext = useCallback(() => {
    const dataToSave = {
      ...contextData,
      timestamp: new Date().toISOString()
    };

    try {
      // Dynamic keys: ensure they pass allowed pattern by replacing non-alphanumerics with '-' for storage key suffix
      const safeKey = `context_${contextKey.replace(/[^a-z0-9_-]/gi,'-')}`;
      secureStorage.set(safeKey, dataToSave, { encrypt: true });
      setLastSaved(new Date());
    } catch (error) {
      console.warn('Failed to save context:', error);
    }
  }, [contextData, contextKey]);

  // Load preserved context on mount
  useEffect(() => {
    const safeKey = `context_${contextKey.replace(/[^a-z0-9_-]/gi,'-')}`;
    // Secure first
    const secure = secureStorage.get<Record<string, unknown>>(safeKey, { encrypt: true });
    if (secure) {
      setContextData(secure);
      if (secure.timestamp) try { setLastSaved(new Date(secure.timestamp as string)); } catch {/* ignore */}
      return;
    }
    // Legacy fallback
    try {
      const legacyRaw = localStorage.getItem(safeKey);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        secureStorage.set(safeKey, parsed, { encrypt: true });
        setContextData(parsed);
        if (parsed.timestamp) try { setLastSaved(new Date(parsed.timestamp)); } catch {/* ignore */}
      }
    } catch (error) {
      console.warn('Failed to load preserved context:', error);
    }
  }, [contextKey]);

  // Auto-save context
  useEffect(() => {
    if (autoSaveInterval > 0) {
      const interval = setInterval(() => {
        saveContext();
      }, autoSaveInterval);

      return () => clearInterval(interval);
    }
  }, [autoSaveInterval, saveContext]);

  // Preserve scroll position
  useEffect(() => {
    if (preserveScrollPosition && contextData.scrollPosition) {
      window.scrollTo(0, contextData.scrollPosition as number);
    }

    const handleScroll = () => {
      if (preserveScrollPosition) {
        setContextData(prev => ({
          ...prev,
          scrollPosition: window.pageYOffset
        }));
      }
    };

    if (preserveScrollPosition) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [preserveScrollPosition, contextData.scrollPosition]);
  
  const updateContext = useCallback((key: string, value: unknown) => {
    setContextData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearContext = useCallback(() => {
  const safeKey = `context_${contextKey.replace(/[^a-z0-9_-]/gi,'-')}`;
  secureStorage.remove(safeKey);
  try { localStorage.removeItem(safeKey); } catch {/* ignore */}
  setContextData({});
  setLastSaved(null);
  }, [contextKey]);

  return (
    <div className="context-preservation">
      {/* Context Status Bar */}
      <div className="context-status bg-blue-50 border-b border-blue-200 p-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-blue-700">
              <BookOpen className="w-4 h-4" />
              <span>Context preserved</span>
            </div>
            {lastSaved && (
              <div className="text-blue-600">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={saveContext}
              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
            >
              Save Now
            </button>
            <button
              onClick={clearContext}
              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="context-content">
        {React.cloneElement(children as React.ReactElement, {
          contextData,
          updateContext,
          saveContext
        })}
      </div>
    </div>
  );
}

// Simplified Choice Reducer
interface SimplifiedChoiceProps {
  title: string;
  description?: string;
  choices: Array<{
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    recommended?: boolean;
  }>;
  onSelect: (choiceId: string) => void;
  selectedId?: string;
  maxChoices?: number;
  showRecommended?: boolean;
}

export function SimplifiedChoice({
  title,
  description,
  choices,
  onSelect,
  selectedId,
  maxChoices = 3,
  showRecommended = true
}: SimplifiedChoiceProps) {
  const { preferences } = useTraumaInformed();
  const [showAll, setShowAll] = useState(false);

  // Reduce choices based on preferences
  const displayChoices = preferences.simplifiedMode && !showAll 
    ? choices.slice(0, maxChoices)
    : choices;

  // Sort to show recommended first
  const sortedChoices = showRecommended 
    ? displayChoices.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
    : displayChoices;

  return (
    <div className="simplified-choice bg-white rounded-xl shadow-sm p-6">
      <div className="choice-header mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      <div className="choice-options space-y-3">
        {sortedChoices.map((choice) => (
          <TouchOptimizedButton
            key={choice.id}
            onClick={() => onSelect(choice.id)}
            variant={selectedId === choice.id ? "primary" : "secondary"}
            size="large"
            className={`
              w-full text-left h-auto p-4
              ${selectedId === choice.id ? 'ring-2 ring-blue-300' : ''}
            `}
          >
            <div className="flex items-start space-x-4">
              {choice.icon && (
                <div className="flex-shrink-0 mt-1">
                  {choice.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-800">{choice.title}</h4>
                  {choice.recommended && showRecommended && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{choice.description}</p>
              </div>
            </div>
          </TouchOptimizedButton>
        ))}
      </div>

      {preferences.simplifiedMode && choices.length > maxChoices && (
        <div className="choice-toggle mt-4 text-center">
          <TouchOptimizedButton
            onClick={() => setShowAll(!showAll)}
            variant="secondary"
            size="normal"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Fewer Options
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All {choices.length} Options
              </>
            )}
          </TouchOptimizedButton>
        </div>
      )}
    </div>
  );
}

// Voice Guidance Component
interface VoiceGuidanceProps {
  text: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
}

export function VoiceGuidance({ 
  text, 
  autoPlay = false, 
  showControls = true,
  onComplete 
}: VoiceGuidanceProps) {
  const { preferences } = useTraumaInformed();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback(() => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      onComplete?.();
    };
    
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, text, onComplete]);

  useEffect(() => {
    if (autoPlay && isSupported && preferences.voiceInput) {
      speak();
    }
  }, [autoPlay, isSupported, preferences.voiceInput, speak]);

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported || !preferences.voiceInput) return null;

  return (
    <div className="voice-guidance bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Voice Guidance</span>
          </div>
          <p className="text-sm text-purple-700">{text}</p>
        </div>

        {showControls && (
          <div className="flex space-x-2">
            <TouchOptimizedButton
              onClick={isPlaying ? stop : speak}
              variant="secondary"
              size="normal"
              className="text-purple-600 hover:text-purple-800"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-1" />
                  Play
                </>
              )}
            </TouchOptimizedButton>
          </div>
        )}
      </div>
    </div>
  );
}

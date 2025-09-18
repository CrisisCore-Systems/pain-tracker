import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Check, 
  X, 
  Pause, 
  Play, 
  ChevronRight,
  ChevronLeft,
  Circle,
  CheckCircle,
  Clock,
  Lightbulb,
  HelpCircle,
  Target,
  Zap,
  Settings,
  Volume2,
  
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Cognitive impairment types and levels
type CognitiveImpairmentLevel = 'mild' | 'moderate' | 'severe';
type CognitiveFunction = 'attention' | 'memory' | 'processing' | 'executive' | 'language';

interface CognitiveState {
  impairmentLevel: CognitiveImpairmentLevel;
  affectedFunctions: CognitiveFunction[];
  fatigueLevel: number; // 1-10
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  stressLevel: number; // 1-10
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'input' | 'choice' | 'action' | 'confirmation';
  required: boolean;
  timeLimit?: number; // seconds
  cognitiveLoad: number; // 1-5
  alternatives?: string[]; // alternative ways to complete this step
  supportText?: string;
  visualAid?: string;
}

interface SimplifiedWorkflow {
  id: string;
  name: string;
  description: string;
  purpose: string;
  estimatedTime: number; // minutes
  cognitiveLoad: number; // 1-5 overall
  steps: WorkflowStep[];
  cognitiveSupport: {
    largeText: boolean;
    highContrast: boolean;
    audioSupport: boolean;
    progressIndicator: boolean;
    stepRepetition: boolean;
    pauseCapability: boolean;
    autoSave: boolean;
  };
}

type AdaptiveSettings = {
  textSize: 'normal' | 'large' | 'extra-large';
  voiceGuidance: boolean;
  autoAdvance: boolean;
  showProgress: boolean;
  allowBacktrack: boolean;
};

interface CognitiveWorkflowProps {
  onWorkflowComplete?: (workflowId: string, results: Record<string, unknown>) => void;
  onCognitiveStateChange?: (state: CognitiveState) => void;
  initialCognitiveState?: Partial<CognitiveState>;
  className?: string;
}

// Pre-defined simplified workflows
const simplifiedWorkflows: SimplifiedWorkflow[] = [
  {
    id: 'pain-entry-simple',
    name: 'Quick Pain Entry',
    description: 'Simple 3-step pain logging',
    purpose: 'Record current pain level and basic information',
    estimatedTime: 2,
    cognitiveLoad: 1,
    steps: [
  {
        id: 'pain-level',
        title: 'Pain Level',
        description: 'How much pain do you have right now?',
        type: 'input',
        required: true,
        cognitiveLoad: 1,
        supportText: 'Use the slider or say a number from 1 to 10'
      },
      {
        id: 'pain-location',
        title: 'Where is the pain?',
        description: 'Tap the area where it hurts',
        type: 'choice',
        required: true,
        cognitiveLoad: 2,
        alternatives: ['Point to your body', 'Describe in words'],
        supportText: 'Choose the main area where you feel pain'
      },
      {
        id: 'save-entry',
        title: 'Save',
        description: 'Save your pain information',
        type: 'confirmation',
        required: true,
        cognitiveLoad: 1,
        supportText: 'This will save your pain entry to your records'
      }
    ],
    cognitiveSupport: {
      largeText: true,
      highContrast: true,
      audioSupport: true,
      progressIndicator: true,
      stepRepetition: true,
      pauseCapability: true,
      autoSave: true
    }
  },
  {
    id: 'medication-reminder',
    name: 'Medication Check',
    description: 'Simple medication tracking',
    purpose: 'Track if you took your medication',
    estimatedTime: 1,
    cognitiveLoad: 1,
    steps: [
      {
        id: 'medication-taken',
        title: 'Did you take your medication?',
        description: 'Check if you took your scheduled medication',
        type: 'choice',
        required: true,
        cognitiveLoad: 1,
        supportText: 'Think about the last time you took your pills'
      },
      {
        id: 'medication-time',
        title: 'When did you take it?',
        description: 'What time did you take your medication?',
        type: 'input',
        required: false,
        cognitiveLoad: 2,
        supportText: 'If you remember, tell us when. If not, that\'s okay too.'
      }
    ],
    cognitiveSupport: {
      largeText: true,
      highContrast: true,
      audioSupport: true,
      progressIndicator: true,
      stepRepetition: true,
      pauseCapability: true,
      autoSave: true
    }
  },
  {
    id: 'mood-check',
    name: 'How Are You Feeling?',
    description: 'Simple mood and energy check',
    purpose: 'Track your emotional and energy state',
    estimatedTime: 2,
    cognitiveLoad: 2,
    steps: [
      {
        id: 'mood-rating',
        title: 'How do you feel?',
        description: 'Choose the face that matches how you feel',
        type: 'choice',
        required: true,
        cognitiveLoad: 1,
        supportText: 'Pick the emoji that looks like how you feel inside'
      },
      {
        id: 'energy-level',
        title: 'Energy Level',
        description: 'How much energy do you have?',
        type: 'input',
        required: true,
        cognitiveLoad: 2,
        supportText: 'Think about how tired or energetic you feel'
      },
      {
        id: 'notes',
        title: 'Anything else?',
        description: 'Any other thoughts or feelings?',
        type: 'input',
        required: false,
        cognitiveLoad: 3,
        supportText: 'You can skip this if you want, or tell us more'
      }
    ],
    cognitiveSupport: {
      largeText: true,
      highContrast: false,
      audioSupport: true,
      progressIndicator: true,
      stepRepetition: true,
      pauseCapability: true,
      autoSave: true
    }
  }
];

export function SimplifiedWorkflowsForCognitiveImpairment({
  onWorkflowComplete,
  onCognitiveStateChange,
  initialCognitiveState = {},
  className = ''
}: CognitiveWorkflowProps) {
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    impairmentLevel: 'mild',
    affectedFunctions: [],
    fatigueLevel: 3,
    timeOfDay: 'morning',
    stressLevel: 3,
    ...initialCognitiveState
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<SimplifiedWorkflow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflowResults, setWorkflowResults] = useState<Record<string, unknown>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showingHelp, setShowingHelp] = useState(false);
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    textSize: 'large',
    voiceGuidance: true,
    autoAdvance: false,
    showProgress: true,
    allowBacktrack: true
  });

  const adaptInterfaceToState = useCallback((state: CognitiveState) => {
     const adaptations: AdaptiveSettings = {
       textSize: state.impairmentLevel === 'severe' ? 'extra-large' : 
                 state.impairmentLevel === 'moderate' ? 'large' : 'normal',
       voiceGuidance: state.affectedFunctions.includes('language') || state.affectedFunctions.includes('processing'),
       autoAdvance: state.impairmentLevel === 'mild' && state.fatigueLevel < 5,
       showProgress: state.affectedFunctions.includes('executive') || state.impairmentLevel !== 'mild',
       allowBacktrack: state.affectedFunctions.includes('memory') || state.impairmentLevel !== 'mild'
     };

     setAdaptiveSettings(adaptations);
   }, []);

  // Adapt interface based on cognitive state
  useEffect(() => {
    adaptInterfaceToState(cognitiveState);
  }, [cognitiveState, adaptInterfaceToState]);

  

  const updateCognitiveState = (updates: Partial<CognitiveState>) => {
    const newState = { ...cognitiveState, ...updates };
    setCognitiveState(newState);
    
    if (onCognitiveStateChange) {
      onCognitiveStateChange(newState);
    }
  };

  const startWorkflow = (workflow: SimplifiedWorkflow) => {
    setSelectedWorkflow(workflow);
    setCurrentStepIndex(0);
    setWorkflowResults({});
    setIsPaused(false);
  };

  const nextStep = () => {
    if (selectedWorkflow && currentStepIndex < selectedWorkflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (selectedWorkflow) {
      completeWorkflow();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const completeWorkflow = () => {
    if (selectedWorkflow && onWorkflowComplete) {
      onWorkflowComplete(selectedWorkflow.id, workflowResults);
    }
    setSelectedWorkflow(null);
    setCurrentStepIndex(0);
    setWorkflowResults({});
  };

  const updateStepResult = (stepId: string, result: unknown) => {
    setWorkflowResults(prev => ({ ...prev, [stepId]: result }));
  };

  if (selectedWorkflow) {
    return (
      <WorkflowExecutionInterface
        workflow={selectedWorkflow}
        currentStepIndex={currentStepIndex}
        workflowResults={workflowResults}
        cognitiveState={cognitiveState}
        adaptiveSettings={adaptiveSettings}
        isPaused={isPaused}
        showingHelp={showingHelp}
        onStepResult={updateStepResult}
        onNextStep={nextStep}
        onPreviousStep={previousStep}
        onPause={() => setIsPaused(!isPaused)}
        onShowHelp={() => setShowingHelp(!showingHelp)}
        onExit={() => setSelectedWorkflow(null)}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Simplified Workflows for Cognitive Support
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Step-by-step guidance designed to reduce cognitive load and support you during 
            moments of brain fog, fatigue, or difficulty concentrating.
          </p>
        </div>
      </div>

      {/* Cognitive State Assessment */}
      <CognitiveStateAssessment
        cognitiveState={cognitiveState}
        onStateChange={updateCognitiveState}
      />

      {/* Workflow Selection */}
      <WorkflowSelection
        workflows={simplifiedWorkflows}
        cognitiveState={cognitiveState}
        onWorkflowStart={startWorkflow}
      />

      {/* Adaptive Settings */}
      <AdaptiveSettingsPanel
        settings={adaptiveSettings}
        onSettingsChange={setAdaptiveSettings}
        cognitiveState={cognitiveState}
      />
    </div>
  );
}

// Cognitive State Assessment Component
function CognitiveStateAssessment({
  cognitiveState,
  onStateChange
}: {
  cognitiveState: CognitiveState;
  onStateChange: (updates: Partial<CognitiveState>) => void;
}) {
  const impairmentLevels = [
    { level: 'mild' as CognitiveImpairmentLevel, label: 'Mild', description: 'Some difficulty concentrating' },
    { level: 'moderate' as CognitiveImpairmentLevel, label: 'Moderate', description: 'Noticeable brain fog' },
    { level: 'severe' as CognitiveImpairmentLevel, label: 'Severe', description: 'Significant cognitive challenges' }
  ];

  const cognitiveAreas = [
    { function: 'attention' as CognitiveFunction, label: 'Attention/Focus', icon: Target },
    { function: 'memory' as CognitiveFunction, label: 'Memory', icon: Brain },
    { function: 'processing' as CognitiveFunction, label: 'Processing Speed', icon: Zap },
    { function: 'executive' as CognitiveFunction, label: 'Planning/Organization', icon: Settings },
    { function: 'language' as CognitiveFunction, label: 'Language/Communication', icon: Volume2 }
  ];

  return (
    <div className="bg-purple-50 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">How are you feeling mentally today?</h3>
      </div>

      <div className="space-y-4">
        {/* Impairment Level */}
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Overall cognitive clarity
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {impairmentLevels.map((level) => {
              const isSelected = cognitiveState.impairmentLevel === level.level;
              return (
                <TouchOptimizedButton
                  key={level.level}
                  variant="secondary"
                  onClick={() => onStateChange({ impairmentLevel: level.level })}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    isSelected ? 'bg-purple-100 border-purple-300 text-purple-800' : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs opacity-75">{level.description}</div>
                  {isSelected && <Check className="w-4 h-4 mt-1" />}
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>

        {/* Affected Functions */}
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Areas that feel difficult today (select any that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cognitiveAreas.map((area) => {
              const Icon = area.icon;
              const isSelected = cognitiveState.affectedFunctions.includes(area.function);
              
              return (
                <TouchOptimizedButton
                  key={area.function}
                  variant="secondary"
                  onClick={() => {
                    const newFunctions = isSelected
                      ? cognitiveState.affectedFunctions.filter(f => f !== area.function)
                      : [...cognitiveState.affectedFunctions, area.function];
                    onStateChange({ affectedFunctions: newFunctions });
                  }}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    isSelected ? 'bg-purple-100 border-purple-300 text-purple-800' : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{area.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>

        {/* Fatigue and Stress Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Mental fatigue: {cognitiveState.fatigueLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={cognitiveState.fatigueLevel}
              onChange={(e) => onStateChange({ fatigueLevel: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Stress level: {cognitiveState.stressLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={cognitiveState.stressLevel}
              onChange={(e) => onStateChange({ stressLevel: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Workflow Selection Component
function WorkflowSelection({
  workflows,
  cognitiveState,
  onWorkflowStart
}: {
  workflows: SimplifiedWorkflow[];
  cognitiveState: CognitiveState;
  onWorkflowStart: (workflow: SimplifiedWorkflow) => void;
}) {
  // Filter and sort workflows based on cognitive state
  const suitableWorkflows = workflows
    .filter(w => w.cognitiveLoad <= (5 - Math.floor(cognitiveState.impairmentLevel === 'severe' ? 3 : cognitiveState.impairmentLevel === 'moderate' ? 2 : 1)))
    .sort((a, b) => a.cognitiveLoad - b.cognitiveLoad);

  const getCognitiveLoadColor = (load: number) => {
    if (load <= 2) return 'text-green-600 bg-green-100';
    if (load <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEstimatedDifficulty = (workflow: SimplifiedWorkflow) => {
    const baseLoad = workflow.cognitiveLoad;
    const affectedFunctionsInWorkflow = workflow.steps.reduce((count, step) => {
      // Check if this step might be affected by user's cognitive issues
      if (cognitiveState.affectedFunctions.includes('memory') && step.type === 'input') count++;
      if (cognitiveState.affectedFunctions.includes('executive') && step.type === 'choice') count++;
      if (cognitiveState.affectedFunctions.includes('attention') && step.timeLimit) count++;
      return count;
    }, 0);

    return Math.min(5, baseLoad + affectedFunctionsInWorkflow);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Choose a Simple Task</h3>
        <span className="text-sm text-gray-500">({suitableWorkflows.length} recommended for you)</span>
      </div>

      <div className="space-y-3">
        {suitableWorkflows.map((workflow) => {
          const adjustedDifficulty = getEstimatedDifficulty(workflow);
          
          return (
            <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{workflow.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{workflow.description}</p>
                  <p className="text-gray-500 text-xs mt-1">Purpose: {workflow.purpose}</p>
                </div>
                <TouchOptimizedButton
                  variant="primary"
                  onClick={() => onWorkflowStart(workflow)}
                  className="px-4 py-2"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </TouchOptimizedButton>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">~{workflow.estimatedTime} min</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Circle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{workflow.steps.length} steps</span>
                </div>

                <span className={`px-2 py-1 text-xs rounded-full ${getCognitiveLoadColor(adjustedDifficulty)}`}>
                  {adjustedDifficulty <= 2 ? 'Easy' : adjustedDifficulty <= 3 ? 'Medium' : 'Challenging'}
                </span>

                {workflow.cognitiveSupport.audioSupport && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Voice Support
                  </span>
                )}

                {workflow.cognitiveSupport.autoSave && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Auto-Save
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {suitableWorkflows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No workflows are recommended right now.</p>
            <p className="text-sm mt-1">Consider adjusting your cognitive state assessment or taking a break.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Workflow Execution Interface
function WorkflowExecutionInterface({
  workflow,
  currentStepIndex,
  workflowResults,
  cognitiveState,
  adaptiveSettings,
  isPaused,
  showingHelp,
  onStepResult,
  onNextStep,
  onPreviousStep,
  onPause,
  onShowHelp,
  onExit,
  className
}: {
  workflow: SimplifiedWorkflow;
  currentStepIndex: number;
  workflowResults: Record<string, unknown>;
  cognitiveState: CognitiveState;
  adaptiveSettings: AdaptiveSettings;
  isPaused: boolean;
  showingHelp: boolean;
  onStepResult: (stepId: string, result: unknown) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onPause: () => void;
  onShowHelp: () => void;
  onExit: () => void;
  className?: string;
}) {
  const currentStep = workflow.steps[currentStepIndex];
  const isLastStep = currentStepIndex === workflow.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const sizeMap: Record<AdaptiveSettings['textSize'], string> = {
    normal: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl'
  };
  const textSizeClass = sizeMap[adaptiveSettings.textSize] ?? 'text-base';

  return (
    <div className={`fixed inset-0 bg-white z-50 overflow-auto ${className}`}>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="bg-purple-100 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h1 className={`font-bold text-purple-900 ${textSizeClass}`}>{workflow.name}</h1>
                {adaptiveSettings.showProgress && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-sm text-purple-700">
                      Step {currentStepIndex + 1} of {workflow.steps.length}
                    </div>
                    <div className="flex space-x-1">
                      {workflow.steps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index < currentStepIndex ? 'bg-green-500' :
                            index === currentStepIndex ? 'bg-purple-500' :
                            'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TouchOptimizedButton
                variant="secondary"
                onClick={onShowHelp}
                className="px-3 py-2"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                variant="secondary"
                onClick={onPause}
                className="px-3 py-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                variant="secondary"
                onClick={onExit}
                className="px-3 py-2"
              >
                <X className="w-4 h-4 mr-1" />
                Exit
              </TouchOptimizedButton>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        {showingHelp && (
          <WorkflowHelpPanel
            workflow={workflow}
            currentStep={currentStep}
            cognitiveState={cognitiveState}
            onClose={() => onShowHelp()}
          />
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Pause className="w-5 h-5" />
              <span className="font-medium">Workflow Paused</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Take your time. Your progress is automatically saved. Click Resume when you're ready to continue.
            </p>
          </div>
        )}

        {/* Main Step Content */}
        {!isPaused && (
          <div className="max-w-4xl mx-auto">
            <WorkflowStepContent
              step={currentStep}
              workflowResults={workflowResults}
              cognitiveState={cognitiveState}
              onStepResult={onStepResult}
              textSizeClass={textSizeClass}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {!isFirstStep && adaptiveSettings.allowBacktrack && (
                  <TouchOptimizedButton
                    variant="secondary"
                    onClick={onPreviousStep}
                    className="px-6 py-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </TouchOptimizedButton>
                )}
              </div>

              <div>
                <TouchOptimizedButton
                  variant="primary"
                  onClick={onNextStep}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700"
                  disabled={currentStep.required && !workflowResults[currentStep.id]}
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </TouchOptimizedButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Workflow Step Content Component
function WorkflowStepContent({
  step,
  workflowResults,
  cognitiveState,
  onStepResult,
  textSizeClass
}: {
  step: WorkflowStep;
  workflowResults: Record<string, unknown>;
  cognitiveState: CognitiveState;
  onStepResult: (stepId: string, result: unknown) => void;
  textSizeClass: string;
}) {
  const [stepValue, setStepValue] = useState<unknown>(workflowResults[step.id] ?? '');

  const handleValueChange = (value: unknown) => {
    setStepValue(value);
    onStepResult(step.id, value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className={`font-semibold text-gray-900 mb-2 ${textSizeClass} md:text-2xl`}>
          {step.title}
        </h2>
        <p className={`text-gray-600 ${textSizeClass}`}>
          {step.description}
        </p>
        {step.supportText && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">{step.supportText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Step Input Based on Type */}
      <div className="space-y-4">
        {step.type === 'input' && (
          <StepInputField
            step={step}
            value={stepValue}
            onChange={handleValueChange}
            cognitiveState={cognitiveState}
            textSizeClass={textSizeClass}
          />
        )}

        {step.type === 'choice' && (
          <StepChoiceField
            step={step}
            value={stepValue}
            onChange={handleValueChange}
            cognitiveState={cognitiveState}
            textSizeClass={textSizeClass}
          />
        )}

        {step.type === 'confirmation' && (
          <StepConfirmationField
            step={step}
            value={stepValue}
            onChange={handleValueChange}
            textSizeClass={textSizeClass}
          />
        )}

        {step.type === 'info' && (
          <StepInfoDisplay
            step={step}
            textSizeClass={textSizeClass}
          />
        )}
      </div>

      {/* Alternative Methods */}
      {step.alternatives && step.alternatives.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Alternative ways to complete this step:</h4>
          <ul className="space-y-1">
            {step.alternatives.map((alt, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                <Circle className="w-2 h-2 fill-current" />
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Step Input Field Component
function StepInputField({
  step,
  value,
  onChange,
  cognitiveState: _cognitiveState,
  textSizeClass
}: {
  step: WorkflowStep;
  value: unknown;
  onChange: (value: unknown) => void;
  cognitiveState: CognitiveState;
  textSizeClass: string;
}) {
  // intentionally unused in current UI; reserved for future adaptive inputs
  void _cognitiveState;
  if (step.id === 'pain-level') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold text-purple-600 mb-4`}>
            {(typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value, 10) : 5)) || 5}/10
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value, 10) : 5)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-6 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>No Pain</span>
            <span>Worst Pain</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.id === 'energy-level') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold text-green-600 mb-4`}>
            {(typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value, 10) : 5)) || 5}/10
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value, 10) : 5)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-6 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>No Energy</span>
            <span>Full Energy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <textarea
  value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your response here..."
      className={`w-full p-4 border border-gray-300 rounded-lg ${textSizeClass}`}
      rows={3}
    />
  );
}

// Step Choice Field Component
function StepChoiceField({
  step,
  value,
  onChange,
  cognitiveState: _cognitiveState,
  textSizeClass
}: {
  step: WorkflowStep;
  value: unknown;
  onChange: (value: unknown) => void;
  cognitiveState: CognitiveState;
  textSizeClass: string;
}) {
  // intentionally unused in current UI; reserved for future adaptive inputs
  void _cognitiveState;
  if (step.id === 'pain-location') {
    const bodyParts = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Arms', 'Hands', 'Abdomen', 'Hips', 'Legs', 'Feet'];
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {bodyParts.map((part) => (
          <TouchOptimizedButton
            key={part}
            variant="secondary"
            onClick={() => onChange(part)}
            className={`p-4 text-center border-2 rounded-lg transition-all ${
              value === part ? 'bg-purple-100 border-purple-300 text-purple-800' : 'border-gray-200 hover:border-purple-200'
            } ${textSizeClass}`}
          >
            {part}
            {value === part && <Check className="w-4 h-4 mx-auto mt-1" />}
          </TouchOptimizedButton>
        ))}
      </div>
    );
  }

  if (step.id === 'medication-taken') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => onChange(true)}
          className={`p-6 text-center border-2 rounded-lg transition-all ${
            value === true ? 'bg-green-100 border-green-300 text-green-800' : 'border-gray-200 hover:border-green-200'
          } ${textSizeClass}`}
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          Yes, I took my medication
        </TouchOptimizedButton>
        
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => onChange(false)}
          className={`p-6 text-center border-2 rounded-lg transition-all ${
            value === false ? 'bg-red-100 border-red-300 text-red-800' : 'border-gray-200 hover:border-red-200'
          } ${textSizeClass}`}
        >
          <X className="w-8 h-8 mx-auto mb-2" />
          No, I haven't taken it yet
        </TouchOptimizedButton>
      </div>
    );
  }

  if (step.id === 'mood-rating') {
    const moods = [
      { emoji: '😢', label: 'Very Sad', value: 1 },
      { emoji: '😔', label: 'Sad', value: 2 },
      { emoji: '😐', label: 'Okay', value: 3 },
      { emoji: '🙂', label: 'Good', value: 4 },
      { emoji: '😊', label: 'Great', value: 5 }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {moods.map((mood) => (
          <TouchOptimizedButton
            key={mood.value}
            variant="secondary"
            onClick={() => onChange(mood.value)}
            className={`p-4 text-center border-2 rounded-lg transition-all ${
              value === mood.value ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="text-4xl mb-2">{mood.emoji}</div>
            <div className={`font-medium ${textSizeClass}`}>{mood.label}</div>
          </TouchOptimizedButton>
        ))}
      </div>
    );
  }

  return null;
}

// Step Confirmation Field Component
function StepConfirmationField({
  step: _step,
  value: _value,
  onChange,
  textSizeClass
}: {
  step: WorkflowStep;
  value: unknown;
  onChange: (value: unknown) => void;
  textSizeClass: string;
}) {
  // mark intentionally unused
  void _step; void _value;
  return (
    <div className="text-center space-y-4">
      <div className={`text-gray-700 ${textSizeClass}`}>
        Ready to save your information?
      </div>
      
      <TouchOptimizedButton
        variant="primary"
        onClick={() => onChange(true)}
        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
      >
        <Check className="w-5 h-5 mr-2" />
        Yes, Save It
      </TouchOptimizedButton>
    </div>
  );
}

// Step Info Display Component
function StepInfoDisplay({
  step,
  textSizeClass
}: {
  step: WorkflowStep;
  textSizeClass: string;
}) {
  return (
    <div className={`text-gray-700 ${textSizeClass} leading-relaxed`}>
      {step.description}
    </div>
  );
}

// Workflow Help Panel Component
function WorkflowHelpPanel({
  workflow: _workflow,
  currentStep,
  cognitiveState,
  onClose
}: {
  workflow: SimplifiedWorkflow;
  currentStep: WorkflowStep;
  cognitiveState: CognitiveState;
  onClose: () => void;
}) {
  void _workflow;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Help & Guidance</h3>
        </div>
        <TouchOptimizedButton
          variant="secondary"
          onClick={onClose}
          className="px-2 py-1"
        >
          <X className="w-4 h-4" />
        </TouchOptimizedButton>
      </div>

      <div className="space-y-3 text-sm text-blue-800">
        <div>
          <strong>Current Step:</strong> {currentStep.title}
        </div>
        
        {currentStep.supportText && (
          <div>
            <strong>Guidance:</strong> {currentStep.supportText}
          </div>
        )}

        {currentStep.alternatives && (
          <div>
            <strong>Alternative methods:</strong>
            <ul className="mt-1 space-y-1">
              {currentStep.alternatives.map((alt, index) => (
                <li key={index}>• {alt}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-blue-300">
          <strong>General Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Take your time - there's no rush</li>
            <li>• Your progress is automatically saved</li>
            <li>• You can pause at any time</li>
            <li>• Skip optional questions if they're too hard</li>
            {cognitiveState.affectedFunctions.includes('memory') && (
              <li>• You can go back to previous steps to review</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Adaptive Settings Panel Component
function AdaptiveSettingsPanel({
  settings,
  onSettingsChange,
  cognitiveState
}: {
  settings: AdaptiveSettings;
  onSettingsChange: (settings: AdaptiveSettings) => void;
  cognitiveState: CognitiveState;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Adaptive Support Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Size</label>
            <select
              value={settings.textSize}
              onChange={(e) => onSettingsChange({ ...settings, textSize: e.target.value as AdaptiveSettings['textSize'] })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Voice Guidance</label>
            <TouchOptimizedButton
              variant={settings.voiceGuidance ? "primary" : "secondary"}
              onClick={() => onSettingsChange({ ...settings, voiceGuidance: !settings.voiceGuidance })}
              className="px-3 py-1"
            >
              {settings.voiceGuidance ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show Progress</label>
            <TouchOptimizedButton
              variant={settings.showProgress ? "primary" : "secondary"}
              onClick={() => onSettingsChange({ ...settings, showProgress: !settings.showProgress })}
              className="px-3 py-1"
            >
              {settings.showProgress ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Auto Advance</label>
            <TouchOptimizedButton
              variant={settings.autoAdvance ? "primary" : "secondary"}
              onClick={() => onSettingsChange({ ...settings, autoAdvance: !settings.autoAdvance })}
              className="px-3 py-1"
            >
              {settings.autoAdvance ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Allow Going Back</label>
            <TouchOptimizedButton
              variant={settings.allowBacktrack ? "primary" : "secondary"}
              onClick={() => onSettingsChange({ ...settings, allowBacktrack: !settings.allowBacktrack })}
              className="px-3 py-1"
            >
              {settings.allowBacktrack ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>
        </div>
      </div>

      {cognitiveState.impairmentLevel !== 'mild' && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
          <div className="flex items-start space-x-2">
            <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-800">
              <strong>Cognitive Support Active:</strong> Settings have been optimized for your current 
              {cognitiveState.impairmentLevel === 'severe' ? ' severe' : ' moderate'} cognitive challenges.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimplifiedWorkflowsForCognitiveImpairment;

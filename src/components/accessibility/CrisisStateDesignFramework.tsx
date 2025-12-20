import React, { useState, createContext, useContext } from 'react';
import {
  AlertTriangle,
  Brain,
  Heart,
  Shield,
  Eye,
  Palette,
  Zap,
  Target,
  Check,
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Crisis state types
type CrisisLevel = 'stable' | 'elevated' | 'acute' | 'emergency';
type CognitiveState = 'clear' | 'foggy' | 'impaired' | 'overwhelmed';
type InterfaceMode = 'normal' | 'simplified' | 'emergency' | 'minimal';

interface CrisisStateConfig {
  level: CrisisLevel;
  cognitiveState: CognitiveState;
  interfaceMode: InterfaceMode;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  minimalUI: boolean;
  autoSave: boolean;
  emergencyMode: boolean;
}

interface ClarityControlsConfig {
  visualSimplification: number; // 0-100
  colorReduction: boolean;
  animationSpeed: number; // 0-100
  textSize: number; // 12-24
  spacing: number; // 0-100
  focusMode: boolean;
  distractionFilter: boolean;
}

interface CalmingConfig {
  breathingPrompts: boolean;
  gentleTransitions: boolean;
  softColors: boolean;
  reducedContrast: boolean;
  mindfulPacing: boolean;
  stressIndicators: boolean;
}

interface ControlConfig {
  quickActions: string[];
  emergencyContacts: boolean;
  oneClickSave: boolean;
  undoBuffer: boolean;
  confirmations: boolean;
  progressSaving: boolean;
}

// Crisis State Context
const CrisisStateContext = createContext<{
  crisisState: CrisisStateConfig;
  updateCrisisState: (updates: Partial<CrisisStateConfig>) => void;
  clarityControls: ClarityControlsConfig;
  updateClarityControls: (updates: Partial<ClarityControlsConfig>) => void;
  calmingConfig: CalmingConfig;
  updateCalmingConfig: (updates: Partial<CalmingConfig>) => void;
  controlConfig: ControlConfig;
  updateControlConfig: (updates: Partial<ControlConfig>) => void;
} | null>(null);

export function useCrisisState() {
  const context = useContext(CrisisStateContext);
  if (!context) {
    throw new Error('useCrisisState must be used within a CrisisStateProvider');
  }
  return context;
}

interface CrisisStateDesignFrameworkProps {
  onCrisisStateChange?: (state: CrisisStateConfig) => void;
  // framework is one of the named sections and config is the partial config for that section
  onFrameworkChange?: (
    framework: 'clarity' | 'calm' | 'control',
    config: Partial<ClarityControlsConfig | CalmingConfig | ControlConfig>
  ) => void;
  initialCrisisLevel?: CrisisLevel;
  className?: string;
}

export function CrisisStateDesignFramework({
  onCrisisStateChange,
  onFrameworkChange,
  initialCrisisLevel = 'stable',
  className = '',
}: CrisisStateDesignFrameworkProps) {
  const [crisisState, setCrisisState] = useState<CrisisStateConfig>({
    level: initialCrisisLevel,
    cognitiveState: 'clear',
    interfaceMode: 'normal',
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    minimalUI: false,
    autoSave: true,
    emergencyMode: false,
  });

  const [clarityControls, setClarityControls] = useState<ClarityControlsConfig>({
    visualSimplification: 0,
    colorReduction: false,
    animationSpeed: 50,
    textSize: 16,
    spacing: 50,
    focusMode: false,
    distractionFilter: false,
  });

  const [calmingConfig, setCalmingConfig] = useState<CalmingConfig>({
    breathingPrompts: false,
    gentleTransitions: true,
    softColors: false,
    reducedContrast: false,
    mindfulPacing: false,
    stressIndicators: true,
  });

  const [controlConfig, setControlConfig] = useState<ControlConfig>({
    quickActions: ['save', 'emergency', 'breathe'],
    emergencyContacts: true,
    oneClickSave: true,
    undoBuffer: true,
    confirmations: true,
    progressSaving: true,
  });

  const updateCrisisState = (updates: Partial<CrisisStateConfig>) => {
    const newState = { ...crisisState, ...updates };
    setCrisisState(newState);

    // Auto-adjust interface based on crisis level
    if (updates.level) {
      adjustInterfaceForCrisis(updates.level);
    }

    if (onCrisisStateChange) {
      onCrisisStateChange(newState);
    }
  };

  const updateClarityControls = (updates: Partial<ClarityControlsConfig>) => {
    const newControls = { ...clarityControls, ...updates };
    setClarityControls(newControls);

    if (onFrameworkChange) {
      onFrameworkChange('clarity', newControls);
    }
  };

  const updateCalmingConfig = (updates: Partial<CalmingConfig>) => {
    const newConfig = { ...calmingConfig, ...updates };
    setCalmingConfig(newConfig);

    if (onFrameworkChange) {
      onFrameworkChange('calm', newConfig);
    }
  };

  const updateControlConfig = (updates: Partial<ControlConfig>) => {
    const newConfig = { ...controlConfig, ...updates };
    setControlConfig(newConfig);

    if (onFrameworkChange) {
      onFrameworkChange('control', newConfig);
    }
  };

  const adjustInterfaceForCrisis = (level: CrisisLevel) => {
    switch (level) {
      case 'acute':
        updateClarityControls({
          visualSimplification: 70,
          colorReduction: true,
          focusMode: true,
          distractionFilter: true,
        });
        updateCalmingConfig({
          breathingPrompts: true,
          gentleTransitions: true,
          softColors: true,
        });
        break;
      case 'emergency':
        updateClarityControls({
          visualSimplification: 90,
          colorReduction: true,
          focusMode: true,
          distractionFilter: true,
          textSize: 20,
        });
        updateCalmingConfig({
          breathingPrompts: true,
          gentleTransitions: true,
          softColors: true,
          mindfulPacing: true,
        });
        setCrisisState(prev => ({ ...prev, interfaceMode: 'emergency', minimalUI: true }));
        break;
      case 'stable':
        updateClarityControls({
          visualSimplification: 0,
          colorReduction: false,
          focusMode: false,
          distractionFilter: false,
        });
        updateCalmingConfig({
          breathingPrompts: false,
          softColors: false,
        });
        break;
    }
  };

  const contextValue = {
    crisisState,
    updateCrisisState,
    clarityControls,
    updateClarityControls,
    calmingConfig,
    updateCalmingConfig,
    controlConfig,
    updateControlConfig,
  };

  return (
    <CrisisStateContext.Provider value={contextValue}>
      <div
        className={`bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-start space-x-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Crisis-State UX Design Framework
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Adaptive interface that provides clarity, calm, and control during pain crises and
              cognitive challenges. Automatically adjusts complexity and provides supportive
              features based on your current state.
            </p>
          </div>
        </div>

        {/* Crisis Level Indicator & Control */}
        <CrisisLevelControl crisisState={crisisState} onStateChange={updateCrisisState} />

        {/* Three C's Framework Sections */}
        <div className="space-y-6 mt-6">
          {/* Clarity Controls */}
          <ClarityFrameworkSection
            controls={clarityControls}
            onControlsChange={updateClarityControls}
            crisisLevel={crisisState.level}
          />

          {/* Calm Configuration */}
          <CalmFrameworkSection
            config={calmingConfig}
            onConfigChange={updateCalmingConfig}
            crisisLevel={crisisState.level}
          />

          {/* Control Configuration */}
          <ControlFrameworkSection
            config={controlConfig}
            onConfigChange={updateControlConfig}
            crisisLevel={crisisState.level}
          />
        </div>

        {/* Framework Preview */}
        <FrameworkPreview
          crisisState={crisisState}
          clarityControls={clarityControls}
          calmingConfig={calmingConfig}
          controlConfig={controlConfig}
        />
      </div>
    </CrisisStateContext.Provider>
  );
}

// Crisis Level Control Component
function CrisisLevelControl({
  crisisState,
  onStateChange,
}: {
  crisisState: CrisisStateConfig;
  onStateChange: (updates: Partial<CrisisStateConfig>) => void;
}) {
  const crisisLevels: { level: CrisisLevel; label: string; color: string; description: string }[] =
    [
      {
        level: 'stable',
        label: 'Stable',
        color: 'green',
        description: 'Normal functioning, standard interface',
      },
      {
        level: 'elevated',
        label: 'Elevated',
        color: 'yellow',
        description: 'Increased pain or stress, some simplification',
      },
      {
        level: 'acute',
        label: 'Acute',
        color: 'orange',
        description: 'High pain or cognitive fog, significant simplification',
      },
      {
        level: 'emergency',
        label: 'Emergency',
        color: 'red',
        description: 'Crisis state, minimal interface with emergency features',
      },
    ];

  const cognitiveStates: {
    state: CognitiveState;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { state: 'clear', label: 'Clear', icon: Brain },
    { state: 'foggy', label: 'Foggy', icon: Eye },
    { state: 'impaired', label: 'Impaired', icon: AlertTriangle },
    { state: 'overwhelmed', label: 'Overwhelmed', icon: Zap },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Current State Assessment
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crisis Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Crisis Level
          </label>
          <div className="space-y-2">
            {crisisLevels.map(level => {
              const isSelected = crisisState.level === level.level;
              const colorClasses = {
                green: isSelected
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'border-green-200 hover:border-green-300',
                yellow: isSelected
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  : 'border-yellow-200 hover:border-yellow-300',
                orange: isSelected
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'border-orange-200 hover:border-orange-300',
                red: isSelected
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'border-red-200 hover:border-red-300',
              };

              return (
                <TouchOptimizedButton
                  key={level.level}
                  variant="secondary"
                  onClick={() => onStateChange({ level: level.level })}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-all ${colorClasses[level.color as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs opacity-75">{level.description}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>

        {/* Cognitive State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cognitive State
          </label>
          <div className="space-y-2">
            {cognitiveStates.map(state => {
              const isSelected = crisisState.cognitiveState === state.state;
              const Icon = state.icon;

              return (
                <TouchOptimizedButton
                  key={state.state}
                  variant="secondary"
                  onClick={() => onStateChange({ cognitiveState: state.state })}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{state.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto" />}
                  </div>
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Clarity Framework Section
function ClarityFrameworkSection({
  controls,
  onControlsChange,
  crisisLevel,
}: {
  controls: ClarityControlsConfig;
  onControlsChange: (updates: Partial<ClarityControlsConfig>) => void;
  crisisLevel: CrisisLevel;
}) {
  const isHighCrisis = crisisLevel === 'acute' || crisisLevel === 'emergency';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Clarity Framework
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Reduce visual complexity and cognitive load
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Visual Simplification Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visual Simplification: {controls.visualSimplification}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.visualSimplification}
              onChange={e => onControlsChange({ visualSimplification: parseInt(e.target.value) })}
              className="w-full"
              disabled={isHighCrisis}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {controls.visualSimplification < 30
                ? 'Full interface'
                : controls.visualSimplification < 70
                  ? 'Simplified'
                  : 'Minimal'}
            </div>
          </div>

          {/* Text Size Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Size: {controls.textSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={controls.textSize}
              onChange={e => onControlsChange({ textSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Spacing Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UI Spacing: {controls.spacing}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.spacing}
              onChange={e => onControlsChange({ spacing: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          {/* Toggle Controls */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color Reduction
            </label>
            <TouchOptimizedButton
              variant={controls.colorReduction ? 'primary' : 'secondary'}
              onClick={() => onControlsChange({ colorReduction: !controls.colorReduction })}
              className="px-3 py-1"
            >
              {controls.colorReduction ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Focus Mode
            </label>
            <TouchOptimizedButton
              variant={controls.focusMode ? 'primary' : 'secondary'}
              onClick={() => onControlsChange({ focusMode: !controls.focusMode })}
              className="px-3 py-1"
            >
              {controls.focusMode ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Distraction Filter
            </label>
            <TouchOptimizedButton
              variant={controls.distractionFilter ? 'primary' : 'secondary'}
              onClick={() => onControlsChange({ distractionFilter: !controls.distractionFilter })}
              className="px-3 py-1"
            >
              {controls.distractionFilter ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          {isHighCrisis && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Auto-adjusted for crisis state
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Calm Framework Section
function CalmFrameworkSection({
  config,
  onConfigChange,
  crisisLevel,
}: {
  config: CalmingConfig;
  onConfigChange: (updates: Partial<CalmingConfig>) => void;
  crisisLevel: CrisisLevel;
}) {
  const isHighCrisis = crisisLevel === 'acute' || crisisLevel === 'emergency';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Calm Framework</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Reduce stress and provide emotional support
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Breathing Prompts
            </label>
            <TouchOptimizedButton
              variant={config.breathingPrompts ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ breathingPrompts: !config.breathingPrompts })}
              className="px-3 py-1"
            >
              {config.breathingPrompts ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gentle Transitions
            </label>
            <TouchOptimizedButton
              variant={config.gentleTransitions ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ gentleTransitions: !config.gentleTransitions })}
              className="px-3 py-1"
            >
              {config.gentleTransitions ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Soft Colors
            </label>
            <TouchOptimizedButton
              variant={config.softColors ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ softColors: !config.softColors })}
              className="px-3 py-1"
            >
              {config.softColors ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reduced Contrast
            </label>
            <TouchOptimizedButton
              variant={config.reducedContrast ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ reducedContrast: !config.reducedContrast })}
              className="px-3 py-1"
            >
              {config.reducedContrast ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mindful Pacing
            </label>
            <TouchOptimizedButton
              variant={config.mindfulPacing ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ mindfulPacing: !config.mindfulPacing })}
              className="px-3 py-1"
            >
              {config.mindfulPacing ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Stress Indicators
            </label>
            <TouchOptimizedButton
              variant={config.stressIndicators ? 'primary' : 'secondary'}
              onClick={() => onConfigChange({ stressIndicators: !config.stressIndicators })}
              className="px-3 py-1"
            >
              {config.stressIndicators ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>
        </div>
      </div>

      {isHighCrisis && config.breathingPrompts && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Crisis breathing support active</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Gentle breathing prompts will appear to help manage acute stress
          </p>
        </div>
      )}
    </div>
  );
}

// Control Framework Section
function ControlFrameworkSection({
  config,
  onConfigChange,
  crisisLevel: _crisisLevel,
}: {
  config: ControlConfig;
  onConfigChange: (updates: Partial<ControlConfig>) => void;
  crisisLevel: CrisisLevel;
}) {
  const availableQuickActions = [
    'save',
    'emergency',
    'breathe',
    'contact',
    'medication',
    'rest',
    'undo',
    'help',
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Control Framework
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Maintain user agency and quick access
        </span>
      </div>

      <div className="space-y-4">
        {/* Quick Actions Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Actions ({config.quickActions.length}/4 selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableQuickActions.map(action => {
              const isSelected = config.quickActions.includes(action);
              return (
                <TouchOptimizedButton
                  key={action}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onClick={() => {
                    const newActions = isSelected
                      ? config.quickActions.filter(a => a !== action)
                      : [...config.quickActions.slice(0, 3), action];
                    onConfigChange({ quickActions: newActions });
                  }}
                  className="px-2 py-1 text-sm capitalize"
                  disabled={!isSelected && config.quickActions.length >= 4}
                >
                  {action}
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>

        {/* Control Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Emergency Contacts
              </label>
              <TouchOptimizedButton
                variant={config.emergencyContacts ? 'primary' : 'secondary'}
                onClick={() => onConfigChange({ emergencyContacts: !config.emergencyContacts })}
                className="px-3 py-1"
              >
                {config.emergencyContacts ? 'On' : 'Off'}
              </TouchOptimizedButton>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                One-Click Save
              </label>
              <TouchOptimizedButton
                variant={config.oneClickSave ? 'primary' : 'secondary'}
                onClick={() => onConfigChange({ oneClickSave: !config.oneClickSave })}
                className="px-3 py-1"
              >
                {config.oneClickSave ? 'On' : 'Off'}
              </TouchOptimizedButton>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Undo Buffer
              </label>
              <TouchOptimizedButton
                variant={config.undoBuffer ? 'primary' : 'secondary'}
                onClick={() => onConfigChange({ undoBuffer: !config.undoBuffer })}
                className="px-3 py-1"
              >
                {config.undoBuffer ? 'On' : 'Off'}
              </TouchOptimizedButton>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmations
              </label>
              <TouchOptimizedButton
                variant={config.confirmations ? 'primary' : 'secondary'}
                onClick={() => onConfigChange({ confirmations: !config.confirmations })}
                className="px-3 py-1"
              >
                {config.confirmations ? 'On' : 'Off'}
              </TouchOptimizedButton>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress Saving
              </label>
              <TouchOptimizedButton
                variant={config.progressSaving ? 'primary' : 'secondary'}
                onClick={() => onConfigChange({ progressSaving: !config.progressSaving })}
                className="px-3 py-1"
              >
                {config.progressSaving ? 'On' : 'Off'}
              </TouchOptimizedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Framework Preview Component
function FrameworkPreview({
  crisisState,
  clarityControls,
  calmingConfig,
  controlConfig,
}: {
  crisisState: CrisisStateConfig;
  clarityControls: ClarityControlsConfig;
  calmingConfig: CalmingConfig;
  controlConfig: ControlConfig;
}) {
  const getPreviewStyle = () => {
    const baseStyle = 'transition-all duration-300';
    let style = baseStyle;

    // Apply clarity adjustments
    if (clarityControls.visualSimplification > 50) {
      style += ' shadow-sm';
    }
    if (clarityControls.colorReduction) {
      style += ' grayscale-50';
    }
    if (calmingConfig.softColors) {
      style += ' opacity-90';
    }

    return style;
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Framework Preview
        </h3>
      </div>

      <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${getPreviewStyle()}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Clarity Preview */}
          <div className="bg-white rounded p-3">
            <h4 className="font-medium text-blue-900 mb-2">Clarity</h4>
            <div className="space-y-2">
              <div className="text-sm">Simplification: {clarityControls.visualSimplification}%</div>
              <div className="text-sm">Text Size: {clarityControls.textSize}px</div>
              {clarityControls.focusMode && (
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Focus Mode Active
                </div>
              )}
            </div>
          </div>

          {/* Calm Preview */}
          <div className="bg-white rounded p-3">
            <h4 className="font-medium text-green-900 mb-2">Calm</h4>
            <div className="space-y-2">
              {calmingConfig.breathingPrompts && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Breathing Support
                </div>
              )}
              {calmingConfig.gentleTransitions && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Gentle Transitions
                </div>
              )}
              {calmingConfig.softColors && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Soft Colors
                </div>
              )}
            </div>
          </div>

          {/* Control Preview */}
          <div className="bg-white rounded p-3">
            <h4 className="font-medium text-purple-900 mb-2">Control</h4>
            <div className="space-y-2">
              <div className="text-sm">Quick Actions: {controlConfig.quickActions.length}</div>
              {controlConfig.emergencyContacts && (
                <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Emergency Ready
                </div>
              )}
              {controlConfig.oneClickSave && (
                <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Quick Save
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Crisis State Indicator */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current State:</span>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  crisisState.level === 'stable'
                    ? 'bg-green-100 text-green-800'
                    : crisisState.level === 'elevated'
                      ? 'bg-yellow-100 text-yellow-800'
                      : crisisState.level === 'acute'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                }`}
              >
                {crisisState.level}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {crisisState.cognitiveState}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrisisStateDesignFramework;

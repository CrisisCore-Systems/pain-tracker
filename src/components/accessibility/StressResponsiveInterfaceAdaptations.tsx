import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Zap,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  BarChart3,
  Timer,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Monitor
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Stress level types
type StressLevel = 'low' | 'moderate' | 'high' | 'critical';
// StressIndicator reserved for future use
// type _StressIndicator = 'heart_rate' | 'interaction_speed' | 'error_rate' | 'session_duration' | 'manual';

interface StressMetrics {
  level: StressLevel;
  confidence: number; // 0-100
  indicators: {
    heartRate?: number;
    interactionSpeed: number; // ms average
    errorRate: number; // 0-100
    sessionDuration: number; // minutes
    manualRating?: number; // 1-10
  };
  timestamp: Date;
}

interface InterfaceAdaptation {
  id: string;
  name: string;
  description: string;
  triggerStressLevel: StressLevel[];
  adaptations: {
    visualSimplification: number;
    animationSpeed: number;
    buttonSize: number;
    colorSaturation: number;
    contrast: number;
    spacing: number;
  };
  cognitiveSupport: {
    hideNonEssential: boolean;
    showProgress: boolean;
    reduceChoices: boolean;
    autoSave: boolean;
    confirmationDialogs: boolean;
  };
  emotionalSupport: {
    encouragingMessages: boolean;
    breathingPrompts: boolean;
    breakSuggestions: boolean;
    stressAcknowledgment: boolean;
  };
}

interface StressResponseInterfaceProps {
  onStressLevelChange?: (metrics: StressMetrics) => void;
  onInterfaceAdaptation?: (adaptation: InterfaceAdaptation) => void;
  enableAutoDetection?: boolean;
  className?: string;
}

// Predefined interface adaptations
const interfaceAdaptations: InterfaceAdaptation[] = [
  {
    id: 'low-stress',
    name: 'Standard Interface',
    description: 'Full functionality with standard complexity',
    triggerStressLevel: ['low'],
    adaptations: {
      visualSimplification: 0,
      animationSpeed: 100,
      buttonSize: 100,
      colorSaturation: 100,
      contrast: 100,
      spacing: 100
    },
    cognitiveSupport: {
      hideNonEssential: false,
      showProgress: true,
      reduceChoices: false,
      autoSave: false,
      confirmationDialogs: true
    },
    emotionalSupport: {
      encouragingMessages: false,
      breathingPrompts: false,
      breakSuggestions: false,
      stressAcknowledgment: false
    }
  },
  {
    id: 'moderate-stress',
    name: 'Simplified Interface',
    description: 'Reduced complexity with supportive features',
    triggerStressLevel: ['moderate'],
    adaptations: {
      visualSimplification: 30,
      animationSpeed: 80,
      buttonSize: 110,
      colorSaturation: 85,
      contrast: 110,
      spacing: 120
    },
    cognitiveSupport: {
      hideNonEssential: true,
      showProgress: true,
      reduceChoices: true,
      autoSave: true,
      confirmationDialogs: true
    },
    emotionalSupport: {
      encouragingMessages: true,
      breathingPrompts: false,
      breakSuggestions: true,
      stressAcknowledgment: true
    }
  },
  {
    id: 'high-stress',
    name: 'Crisis Support Interface',
    description: 'Minimal complexity with active stress support',
    triggerStressLevel: ['high'],
    adaptations: {
      visualSimplification: 60,
      animationSpeed: 50,
      buttonSize: 130,
      colorSaturation: 70,
      contrast: 130,
      spacing: 150
    },
    cognitiveSupport: {
      hideNonEssential: true,
      showProgress: true,
      reduceChoices: true,
      autoSave: true,
      confirmationDialogs: false
    },
    emotionalSupport: {
      encouragingMessages: true,
      breathingPrompts: true,
      breakSuggestions: true,
      stressAcknowledgment: true
    }
  },
  {
    id: 'critical-stress',
    name: 'Emergency Interface',
    description: 'Absolute minimal interface with emergency support',
    triggerStressLevel: ['critical'],
    adaptations: {
      visualSimplification: 90,
      animationSpeed: 0,
      buttonSize: 150,
      colorSaturation: 50,
      contrast: 150,
      spacing: 200
    },
    cognitiveSupport: {
      hideNonEssential: true,
      showProgress: false,
      reduceChoices: true,
      autoSave: true,
      confirmationDialogs: false
    },
    emotionalSupport: {
      encouragingMessages: true,
      breathingPrompts: true,
      breakSuggestions: true,
      stressAcknowledgment: true
    }
  }
];

export function StressResponsiveInterfaceAdaptations({
  onStressLevelChange,
  onInterfaceAdaptation,
  enableAutoDetection = true,
  className = ''
}: StressResponseInterfaceProps) {
  const [currentStressMetrics, setCurrentStressMetrics] = useState<StressMetrics>({
    level: 'low',
    confidence: 0,
    indicators: {
      interactionSpeed: 500,
      errorRate: 0,
      sessionDuration: 0
    },
    timestamp: new Date()
  });

  const [currentAdaptation, setCurrentAdaptation] = useState<InterfaceAdaptation>(interfaceAdaptations[0]);
  const [isMonitoring, setIsMonitoring] = useState(enableAutoDetection);
  const [stressHistory, setStressHistory] = useState<StressMetrics[]>([]);
  const [manualStressRating, setManualStressRating] = useState(5);

  // Interaction monitoring
  const interactionTimes = useRef<number[]>([]);
  const errorCount = useRef(0);
  const sessionStart = useRef(new Date());

  // Stress detection hook
  const detectStressLevel = useCallback(() => {
    const now = new Date();
    const sessionDuration = (now.getTime() - sessionStart.current.getTime()) / (1000 * 60); // minutes
    const avgInteractionSpeed = interactionTimes.current.length > 0
      ? interactionTimes.current.reduce((a, b) => a + b, 0) / interactionTimes.current.length
      : 500;
    const totalInteractions = interactionTimes.current.length + errorCount.current;
    const errorRate = totalInteractions > 0 ? (errorCount.current / totalInteractions) * 100 : 0;

    let stressLevel: StressLevel = 'low';
    let confidence = 0;

    if (avgInteractionSpeed < 200) {
      stressLevel = 'high';
      confidence += 30;
    } else if (avgInteractionSpeed < 300) {
      stressLevel = 'moderate';
      confidence += 20;
    }

    if (errorRate > 20) {
      stressLevel = 'critical';
      confidence += 40;
    } else if (errorRate > 10) {
      stressLevel = stressLevel === 'low' ? 'moderate' : 'high';
      confidence += 25;
    }

    if (sessionDuration > 30) {
      confidence += 15;
      if (stressLevel === 'low') stressLevel = 'moderate';
    }

    if (currentStressMetrics.indicators.manualRating) {
      const manual = currentStressMetrics.indicators.manualRating;
      if (manual >= 8) {
        stressLevel = 'critical';
        confidence += 50;
      } else if (manual >= 6) {
        stressLevel = stressLevel === 'low' ? 'moderate' : 'high';
        confidence += 30;
      }
    }

    const newMetrics: StressMetrics = {
      level: stressLevel,
      confidence: Math.min(confidence, 100),
      indicators: {
        interactionSpeed: avgInteractionSpeed,
        errorRate,
        sessionDuration,
        manualRating: currentStressMetrics.indicators.manualRating
      },
      timestamp: now
    };

    setCurrentStressMetrics(newMetrics);
    setStressHistory(prev => [...prev.slice(-9), newMetrics]);

    if (onStressLevelChange) {
      onStressLevelChange(newMetrics);
    }
  }, [currentStressMetrics.indicators.manualRating, onStressLevelChange]);

  useEffect(() => {
    if (!isMonitoring) return;

    const monitoringInterval = setInterval(() => {
      detectStressLevel();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(monitoringInterval);
  }, [isMonitoring, detectStressLevel]);

  // Auto-apply interface adaptations when stress level changes
  useEffect(() => {
    const adaptation = interfaceAdaptations.find(a => 
      a.triggerStressLevel.includes(currentStressMetrics.level)
    );
    
    if (adaptation && adaptation.id !== currentAdaptation.id) {
      setCurrentAdaptation(adaptation);
      if (onInterfaceAdaptation) {
        onInterfaceAdaptation(adaptation);
      }
    }
  }, [currentStressMetrics.level, currentAdaptation.id, onInterfaceAdaptation]);

  // Helpers kept for potential future use (intentionally unused for now)

  const updateManualStressRating = (rating: number) => {
    setManualStressRating(rating);
    setCurrentStressMetrics(prev => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        manualRating: rating
      }
    }));
  };

  const resetMonitoring = () => {
    interactionTimes.current = [];
    errorCount.current = 0;
    sessionStart.current = new Date();
    setStressHistory([]);
    setCurrentStressMetrics({
      level: 'low',
      confidence: 0,
      indicators: {
        interactionSpeed: 500,
        errorRate: 0,
        sessionDuration: 0
      },
      timestamp: new Date()
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Activity className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Stress-Responsive Interface Adaptations
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Automatically detects stress levels through interaction patterns and adapts the interface 
            to reduce cognitive load and provide appropriate support during difficult moments.
          </p>
        </div>
      </div>

      {/* Current Stress Status */}
      <StressStatusDisplay
        metrics={currentStressMetrics}
        adaptation={currentAdaptation}
        isMonitoring={isMonitoring}
        onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
        onReset={resetMonitoring}
      />

      {/* Manual Stress Rating */}
      <ManualStressRating
        currentRating={manualStressRating}
        onRatingChange={updateManualStressRating}
      />

      {/* Stress History & Trends */}
      <StressHistoryChart history={stressHistory} />

      {/* Interface Adaptation Preview */}
      <InterfaceAdaptationPreview
        adaptation={currentAdaptation}
        stressLevel={currentStressMetrics.level}
      />

      {/* Adaptation Controls */}
      <AdaptationControls
        adaptations={interfaceAdaptations}
        currentAdaptation={currentAdaptation}
        onAdaptationChange={setCurrentAdaptation}
      />

      {/* Stress Response Features */}
      <StressResponseFeatures
        adaptation={currentAdaptation}
        stressLevel={currentStressMetrics.level}
      />
    </div>
  );
}

// Stress Status Display Component
function StressStatusDisplay({
  metrics,
  adaptation,
  isMonitoring,
  onToggleMonitoring,
  onReset
}: {
  metrics: StressMetrics;
  adaptation: InterfaceAdaptation;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onReset: () => void;
}) {
  const getStressColor = (level: StressLevel) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getStressIcon = (level: StressLevel) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'moderate': return MinusCircle;
      case 'high': return AlertTriangle;
      case 'critical': return Zap;
    }
  };

  const StressIcon = getStressIcon(metrics.level);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <StressIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Current Stress Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          <TouchOptimizedButton
            variant={isMonitoring ? "primary" : "secondary"}
            onClick={onToggleMonitoring}
            className="px-3 py-1"
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Start Monitoring
              </>
            )}
          </TouchOptimizedButton>
          <TouchOptimizedButton
            variant="secondary"
            onClick={onReset}
            className="px-3 py-1"
          >
            <RotateCcw className="w-4 h-4" />
          </TouchOptimizedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stress Level Display */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Stress Level</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStressColor(metrics.level)}`}>
              {metrics.level.toUpperCase()}
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div>Confidence: {metrics.confidence}%</div>
            <div>Interface: {adaptation.name}</div>
            <div>Last Updated: {metrics.timestamp.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Metrics Display */}
        <div className="bg-white rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Detection Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Interaction Speed:</span>
              <span>{Math.round(metrics.indicators.interactionSpeed)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span>{Math.round(metrics.indicators.errorRate)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Session Duration:</span>
              <span>{Math.round(metrics.indicators.sessionDuration)}m</span>
            </div>
            {metrics.indicators.manualRating && (
              <div className="flex justify-between">
                <span>Manual Rating:</span>
                <span>{metrics.indicators.manualRating}/10</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Manual Stress Rating Component
function ManualStressRating({
  currentRating,
  onRatingChange
}: {
  currentRating: number;
  onRatingChange: (rating: number) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Manual Stress Check</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How stressed do you feel right now? (1 = very calm, 10 = extremely stressed)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={currentRating}
              onChange={(e) => onRatingChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">10</span>
          </div>
          <div className="text-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentRating <= 3 ? 'bg-green-100 text-green-800' :
              currentRating <= 6 ? 'bg-yellow-100 text-yellow-800' :
              currentRating <= 8 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentRating}/10
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Your manual rating helps improve automatic stress detection and ensures 
          appropriate interface adaptations are applied.
        </div>
      </div>
    </div>
  );
}

// Stress History Chart Component
function StressHistoryChart({ history }: { history: StressMetrics[] }) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Stress Trends</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No stress data collected yet. Start monitoring to see trends.
        </div>
      </div>
    );
  }

  const getStressNumeric = (level: StressLevel): number => {
    switch (level) {
      case 'low': return 1;
      case 'moderate': return 2;
      case 'high': return 3;
      case 'critical': return 4;
    }
  };

  const maxStress = Math.max(...history.map(h => getStressNumeric(h.level)));
  const trend = history.length >= 2 
    ? getStressNumeric(history[history.length - 1].level) - getStressNumeric(history[0].level)
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Stress Trends</h3>
        </div>
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-red-600" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4 text-green-600" />
          ) : (
            <MinusCircle className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm text-gray-600">
            {trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Visual chart representation */}
        <div className="h-24 flex items-end space-x-1">
          {history.map((metric, index) => {
            const height = (getStressNumeric(metric.level) / 4) * 100;
            const color = 
              metric.level === 'low' ? 'bg-green-400' :
              metric.level === 'moderate' ? 'bg-yellow-400' :
              metric.level === 'high' ? 'bg-orange-400' :
              'bg-red-400';
            
            return (
              <div
                key={index}
                className={`w-8 ${color} rounded-t`}
                style={{ height: `${height}%` }}
                title={`${metric.level} (${metric.timestamp.toLocaleTimeString()})`}
              />
            );
          })}
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">Average</div>
            <div className="text-gray-600">
              {(history.reduce((sum, h) => sum + getStressNumeric(h.level), 0) / history.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">Peak</div>
            <div className="text-gray-600">{maxStress}/4</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">Readings</div>
            <div className="text-gray-600">{history.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interface Adaptation Preview Component
function InterfaceAdaptationPreview({
  adaptation,
  stressLevel
}: {
  adaptation: InterfaceAdaptation;
  stressLevel: StressLevel;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Monitor className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Active Interface Adaptation</h3>
  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{stressLevel}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Adaptation Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{adaptation.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{adaptation.description}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Visual Simplification:</span>
              <span>{adaptation.adaptations.visualSimplification}%</span>
            </div>
            <div className="flex justify-between">
              <span>Button Size:</span>
              <span>{adaptation.adaptations.buttonSize}%</span>
            </div>
            <div className="flex justify-between">
              <span>Spacing:</span>
              <span>{adaptation.adaptations.spacing}%</span>
            </div>
            <div className="flex justify-between">
              <span>Animation Speed:</span>
              <span>{adaptation.adaptations.animationSpeed}%</span>
            </div>
          </div>
        </div>

        {/* Active Features */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Active Support Features</h4>
          <div className="space-y-2">
            {adaptation.cognitiveSupport.hideNonEssential && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Non-essential elements hidden</span>
              </div>
            )}
            {adaptation.cognitiveSupport.autoSave && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Auto-save enabled</span>
              </div>
            )}
            {adaptation.emotionalSupport.breathingPrompts && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Breathing prompts active</span>
              </div>
            )}
            {adaptation.emotionalSupport.stressAcknowledgment && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Stress acknowledgment</span>
              </div>
            )}
            {adaptation.emotionalSupport.breakSuggestions && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Break suggestions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Adaptation Controls Component
function AdaptationControls({
  adaptations,
  currentAdaptation,
  onAdaptationChange
}: {
  adaptations: InterfaceAdaptation[];
  currentAdaptation: InterfaceAdaptation;
  onAdaptationChange: (adaptation: InterfaceAdaptation) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Manual Override</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {adaptations.map((adaptation) => {
          const isActive = currentAdaptation.id === adaptation.id;
          const colorClass = 
            adaptation.triggerStressLevel[0] === 'low' ? 'border-green-200 hover:border-green-300' :
            adaptation.triggerStressLevel[0] === 'moderate' ? 'border-yellow-200 hover:border-yellow-300' :
            adaptation.triggerStressLevel[0] === 'high' ? 'border-orange-200 hover:border-orange-300' :
            'border-red-200 hover:border-red-300';

          return (
            <TouchOptimizedButton
              key={adaptation.id}
              variant="secondary"
              onClick={() => onAdaptationChange(adaptation)}
              className={`p-3 text-left border-2 rounded-lg transition-all ${
                isActive ? 'border-blue-300 bg-blue-50' : colorClass
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{adaptation.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{adaptation.description}</div>
                </div>
                {isActive && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </div>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
}

// Stress Response Features Component
function StressResponseFeatures({
  adaptation,
  stressLevel
}: {
  adaptation: InterfaceAdaptation;
  stressLevel: StressLevel;
}) {
  if (stressLevel === 'low') {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Heart className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Active Stress Support</h3>
      </div>

      <div className="space-y-3">
        {adaptation.emotionalSupport.stressAcknowledgment && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              I notice you might be experiencing some stress right now. That's completely normal when managing pain.
              The interface has been simplified to make things easier for you.
            </p>
          </div>
        )}

        {adaptation.emotionalSupport.breathingPrompts && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Take a moment to breathe:
            </p>
            <div className="text-xs text-blue-700">
              Breathe in slowly for 4 counts... hold for 4... breathe out for 6. Repeat as needed.
            </div>
          </div>
        )}

        {adaptation.emotionalSupport.breakSuggestions && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <Timer className="w-4 h-4 inline mr-1" />
              Consider taking a short break. Your data will be automatically saved.
            </p>
          </div>
        )}

        {adaptation.emotionalSupport.encouragingMessages && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              You're doing great by taking care of yourself and tracking your symptoms. 
              Every entry helps build a better understanding of your health.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StressResponsiveInterfaceAdaptations;

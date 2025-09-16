/**
 * Crisis Detection Hook
 * Monitors user behavior, stress indicators, and pain levels to detect crisis states
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTraumaInformed } from './TraumaInformedHooks';
import {
  CrisisState,
  CrisisTrigger,
  StressIndicators,
  StressMetrics,
  CrisisSession,
  EmergencyModeConfig,
  DEFAULT_CRISIS_CONFIG
} from './CrisisStateTypes';

interface CrisisDetectionConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  monitoringInterval: number; // milliseconds
  painThreshold: number; // 0-10
  stressThreshold: number; // 0-1
  cognitiveLoadThreshold: number; // 0-1
  autoActivateEmergencyMode: boolean;
}

interface UserBehaviorMetrics {
  clickFrequency: number;
  errorRate: number;
  taskCompletionTime: number;
  helpRequestsCount: number;
  backNavigationCount: number;
  timeSpentOnPage: number;
  inputErraticBehavior: number;
}

const DEFAULT_CONFIG: CrisisDetectionConfig = {
  enabled: true,
  sensitivity: 'medium',
  monitoringInterval: 10000, // 10 seconds
  painThreshold: 7,
  stressThreshold: 0.7,
  cognitiveLoadThreshold: 0.6,
  autoActivateEmergencyMode: true
};

export function useCrisisDetection(config: Partial<CrisisDetectionConfig> = {}) {
  const { updatePreferences } = useTraumaInformed();
  const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // State
  const [crisisState, setCrisisState] = useState<CrisisState>({
    isInCrisis: false,
    severity: 'mild',
    triggers: [],
    detectedAt: new Date(),
    duration: 0,
    previousEpisodes: 0
  });
  
  const [stressMetrics, setStressMetrics] = useState<StressMetrics>({
    current: {
      painLevel: 0,
      cognitiveLoad: 0,
      inputErraticBehavior: 0,
      timeSpentOnTasks: 0,
      errorRate: 0,
      frustrationMarkers: 0
    },
    baseline: {
      painLevel: 3,
      cognitiveLoad: 0.3,
      inputErraticBehavior: 0.2,
      timeSpentOnTasks: 1.0,
      errorRate: 0.1,
      frustrationMarkers: 0.1
    },
    trend: 'stable',
    lastUpdated: new Date()
  });
  
  const [currentSession, setCurrentSession] = useState<CrisisSession | null>(null);
  const [emergencyModeConfig] = useState<EmergencyModeConfig>(DEFAULT_CRISIS_CONFIG.emergencyMode);
  
  // Refs for tracking behavior
  const behaviorMetrics = useRef<UserBehaviorMetrics>({
    clickFrequency: 0,
    errorRate: 0,
    taskCompletionTime: 0,
    helpRequestsCount: 0,
    backNavigationCount: 0,
    timeSpentOnPage: 0,
    inputErraticBehavior: 0
  });
  
  const monitoringTimer = useRef<NodeJS.Timeout>();
  const lastActivity = useRef<Date>(new Date());
  const clickTimes = useRef<number[]>([]);
  const errorEvents = useRef<Date[]>([]);
  const helpRequests = useRef<Date[]>([]);
  
  // Behavior tracking functions
  const calculateCognitiveLoad = useCallback(() => {
    const recentErrors = errorEvents.current.filter(
      time => Date.now() - time.getTime() < 60000 // Last minute
    ).length;
    
    const recentHelp = helpRequests.current.filter(
      time => Date.now() - time.getTime() < 60000
    ).length;
    
    return Math.min(1, (recentErrors * 0.2 + recentHelp * 0.3 + behaviorMetrics.current.timeSpentOnPage * 0.1));
  }, []);
  
  const calculateInputErraticBehavior = useCallback(() => {
    if (clickTimes.current.length < 3) return 0;
    
    const recentClicks = clickTimes.current.filter(
      time => Date.now() - time < 30000 // Last 30 seconds
    );
    
    if (recentClicks.length < 3) return 0;
    
    // Calculate click frequency variance
    const intervals: number[] = [];
    for (let i = 1; i < recentClicks.length; i++) {
      intervals.push(recentClicks[i] - recentClicks[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return Math.min(1, variance / 10000); // Normalize variance
  }, []);
  
  const calculateTaskTime = useCallback(() => {
    return behaviorMetrics.current.timeSpentOnPage / 60000; // Convert to minutes
  }, []);
  
  const calculateErrorRate = useCallback(() => {
    const recentErrors = errorEvents.current.filter(
      time => Date.now() - time.getTime() < 300000 // Last 5 minutes
    ).length;
    
    return Math.min(1, recentErrors / 10); // Normalize to 0-1
  }, []);
  
  const calculateFrustrationMarkers = useCallback(() => {
    const backNavigation = behaviorMetrics.current.backNavigationCount;
    const helpRequestsCount = behaviorMetrics.current.helpRequestsCount;
    
    return Math.min(1, (backNavigation * 0.1 + helpRequestsCount * 0.2));
  }, []);

  // Emergency mode activation
  const activateEmergencyMode = useCallback(() => {
    updatePreferences({
      simplifiedMode: true,
      showMemoryAids: true,
      autoSave: true,
      touchTargetSize: 'extra-large',
      confirmationLevel: 'high',
      showComfortPrompts: true,
      showProgress: true
    });
    
    // Additional emergency mode configurations could be applied here
    console.log('Emergency mode activated');
  }, [updatePreferences]);
  
  // Crisis detection logic
  const detectCrisis = useCallback(() => {
    if (!fullConfig.enabled) return;
    
    const now = new Date();
    
    // Calculate current stress indicators
    const currentIndicators: StressIndicators = {
      painLevel: stressMetrics.current.painLevel,
      cognitiveLoad: calculateCognitiveLoad(),
      inputErraticBehavior: calculateInputErraticBehavior(),
      timeSpentOnTasks: calculateTaskTime(),
      errorRate: calculateErrorRate(),
      frustrationMarkers: calculateFrustrationMarkers()
    };
    
    // Detect triggers
    const triggers: CrisisTrigger[] = [];
    
    // Pain spike detection
    if (currentIndicators.painLevel >= fullConfig.painThreshold) {
      triggers.push({
        type: 'pain_spike',
        value: currentIndicators.painLevel / 10,
        threshold: fullConfig.painThreshold / 10,
        timestamp: now,
        context: `Pain level: ${currentIndicators.painLevel}/10`
      });
    }
    
    // Cognitive fog detection
    if (currentIndicators.cognitiveLoad >= fullConfig.cognitiveLoadThreshold) {
      triggers.push({
        type: 'cognitive_fog',
        value: currentIndicators.cognitiveLoad,
        threshold: fullConfig.cognitiveLoadThreshold,
        timestamp: now,
        context: 'High cognitive load detected'
      });
    }
    
    // Erratic input detection
    if (currentIndicators.inputErraticBehavior >= 0.7) {
      triggers.push({
        type: 'rapid_input',
        value: currentIndicators.inputErraticBehavior,
        threshold: 0.7,
        timestamp: now,
        context: 'Erratic input patterns detected'
      });
    }
    
    // Error pattern detection
    if (currentIndicators.errorRate >= 0.3) {
      triggers.push({
        type: 'error_pattern',
        value: currentIndicators.errorRate,
        threshold: 0.3,
        timestamp: now,
        context: 'High error rate detected'
      });
    }
    
    // Emotional distress detection (frustration markers)
    if (currentIndicators.frustrationMarkers >= 0.5) {
      triggers.push({
        type: 'emotional_distress',
        value: currentIndicators.frustrationMarkers,
        threshold: 0.5,
        timestamp: now,
        context: 'Signs of frustration detected'
      });
    }
    
    // Calculate overall stress level
    const overallStress = (
      currentIndicators.painLevel / 10 * 0.3 +
      currentIndicators.cognitiveLoad * 0.25 +
      currentIndicators.inputErraticBehavior * 0.2 +
      currentIndicators.errorRate * 0.15 +
      currentIndicators.frustrationMarkers * 0.1
    );
    
    // Determine crisis severity
    let severity: CrisisState['severity'] = 'mild';
    if (overallStress >= 0.8) severity = 'critical';
    else if (overallStress >= 0.6) severity = 'severe';
    else if (overallStress >= 0.4) severity = 'moderate';
    
    // Update crisis state
    const isInCrisis = triggers.length > 0 || overallStress >= fullConfig.stressThreshold;
    
    if (isInCrisis && !crisisState.isInCrisis) {
      // Crisis started
      const newSession: CrisisSession = {
        id: `crisis_${now.getTime()}`,
        startTime: now,
        triggers,
        responses: [],
        userActions: [],
        outcome: 'ongoing',
        duration: 0,
        effectiveInterventions: []
      };
      setCurrentSession(newSession);
    }
    
    setCrisisState(prev => ({
      ...prev,
      isInCrisis,
      severity,
      triggers,
      detectedAt: isInCrisis ? (prev.isInCrisis ? prev.detectedAt : now) : prev.detectedAt,
      duration: isInCrisis ? now.getTime() - (prev.isInCrisis ? prev.detectedAt : now).getTime() : 0,
      previousEpisodes: prev.previousEpisodes + (isInCrisis && !prev.isInCrisis ? 1 : 0)
    }));
    
    // Update stress metrics
    setStressMetrics(prev => {
      const trend = overallStress > 0.6 ? 'worsening' : 
                   overallStress < 0.3 ? 'improving' : 'stable';
      
      return {
        current: currentIndicators,
        baseline: prev.baseline, // Update baseline periodically in real implementation
        trend,
        lastUpdated: now
      };
    });
    
    // Auto-activate emergency mode if configured
    if (isInCrisis && fullConfig.autoActivateEmergencyMode && 
        emergencyModeConfig.autoActivate && severity === 'critical') {
      activateEmergencyMode();
    }
    
  }, [
    fullConfig,
    stressMetrics,
    crisisState.isInCrisis,
    emergencyModeConfig.autoActivate,
    calculateCognitiveLoad,
    calculateInputErraticBehavior,
    calculateTaskTime,
    calculateErrorRate,
    calculateFrustrationMarkers,
    activateEmergencyMode
  ]);
  
  // Event tracking functions
  const trackClick = useCallback(() => {
    const now = Date.now();
    clickTimes.current.push(now);
    
    // Keep only recent clicks
    clickTimes.current = clickTimes.current.filter(
      time => now - time < 60000 // Last minute
    );
    
    lastActivity.current = new Date();
  }, []);
  
  const trackError = useCallback(() => {
    errorEvents.current.push(new Date());
    behaviorMetrics.current.errorRate += 1;
    
    // Keep only recent errors
    errorEvents.current = errorEvents.current.filter(
      time => Date.now() - time.getTime() < 300000 // Last 5 minutes
    );
  }, []);
  
  const trackHelpRequest = useCallback(() => {
    helpRequests.current.push(new Date());
    behaviorMetrics.current.helpRequestsCount += 1;
    
    // Keep only recent help requests
    helpRequests.current = helpRequests.current.filter(
      time => Date.now() - time.getTime() < 300000 // Last 5 minutes
    );
  }, []);
  
  const trackBackNavigation = useCallback(() => {
    behaviorMetrics.current.backNavigationCount += 1;
  }, []);
  
  const updatePainLevel = useCallback((level: number) => {
    setStressMetrics(prev => ({
      ...prev,
      current: {
        ...prev.current,
        painLevel: level
      }
    }));
  }, []);
  
  const deactivateEmergencyMode = useCallback(() => {
    // Restore previous preferences or use defaults
    updatePreferences({
      simplifiedMode: false,
      touchTargetSize: 'large',
      confirmationLevel: 'standard'
    });
    
    console.log('Emergency mode deactivated');
  }, [updatePreferences]);
  
  // Crisis resolution
  const resolveCrisis = useCallback((outcome: CrisisSession['outcome'], feedback?: string) => {
    if (currentSession) {
      const resolvedSession: CrisisSession = {
        ...currentSession,
        endTime: new Date(),
        outcome,
        duration: Date.now() - currentSession.startTime.getTime(),
        userFeedback: feedback
      };
      
      setCurrentSession(null);
      
      // Store session for analytics (in real implementation)
      console.log('Crisis session resolved:', resolvedSession);
    }
    
    setCrisisState(prev => ({
      ...prev,
      isInCrisis: false,
      triggers: [],
      duration: 0
    }));
  }, [currentSession]);
  
  // Setup monitoring
  useEffect(() => {
    if (fullConfig.enabled) {
      monitoringTimer.current = setInterval(detectCrisis, fullConfig.monitoringInterval);
      
      return () => {
        if (monitoringTimer.current) {
          clearInterval(monitoringTimer.current);
        }
      };
    }
  }, [fullConfig.enabled, fullConfig.monitoringInterval, detectCrisis]);
  
  // Setup behavior tracking
  useEffect(() => {
    const handleClick = () => trackClick();
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        trackBackNavigation();
      }
    };
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [trackClick, trackBackNavigation]);
  
  return {
    // State
    crisisState,
    stressMetrics,
    currentSession,
    
    // Actions
    trackClick,
    trackError,
    trackHelpRequest,
    trackBackNavigation,
    updatePainLevel,
    activateEmergencyMode,
    deactivateEmergencyMode,
    resolveCrisis,
    
    // Computed values
    isInCrisis: crisisState.isInCrisis,
    crisisSeverity: crisisState.severity,
    overallStressLevel: (
      stressMetrics.current.painLevel / 10 * 0.3 +
      stressMetrics.current.cognitiveLoad * 0.25 +
      stressMetrics.current.inputErraticBehavior * 0.2 +
      stressMetrics.current.errorRate * 0.15 +
      stressMetrics.current.frustrationMarkers * 0.1
    ),
    
    // Configuration
    config: fullConfig
  };
}

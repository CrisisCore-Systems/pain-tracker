/**
 * Crisis Detection Hook
 * Monitors user behavior patterns to detect crisis states
 */

import { useState, useEffect, useCallback } from 'react';

type CrisisLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'emergency';

interface BehaviorData {
  rapidClicks: number;
  backNavigationCount: number;
  timeOnPage: number;
  errorCount: number;
  lastActive: number;
}

// Hook to detect crisis states based on user behavior
export function useCrisisDetection() {
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [behaviorData, setBehaviorData] = useState<BehaviorData>({
    rapidClicks: 0,
    backNavigationCount: 0,
    timeOnPage: 0,
    errorCount: 0,
    lastActive: Date.now()
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const trackBehavior = () => {
      setBehaviorData(prev => ({
        ...prev,
        timeOnPage: prev.timeOnPage + 1
      }));
      
      // Reset rapid clicks counter gradually
      setBehaviorData(prev => ({
        ...prev,
        rapidClicks: Math.max(0, prev.rapidClicks - 1)
      }));
    };

    const detectCrisisState = () => {
  const { rapidClicks, backNavigationCount, errorCount, timeOnPage } = behaviorData;
      
      // Emergency level indicators
  if (rapidClicks > 10 || backNavigationCount > 8) {
        setCrisisLevel('emergency');
        return;
      }
      
      // Severe level indicators
  if (rapidClicks > 7 || backNavigationCount > 5 || errorCount > 5) {
        setCrisisLevel('severe');
        return;
      }
      
      // Moderate level indicators
  if (rapidClicks > 4 || backNavigationCount > 3 || errorCount > 3) {
        setCrisisLevel('moderate');
        return;
      }
      
      // Mild level indicators
      if (rapidClicks > 2 || errorCount > 1 || timeOnPage > 300) {
        setCrisisLevel('mild');
        return;
      }
      
      setCrisisLevel('none');
    };

    interval = setInterval(() => {
      trackBehavior();
      detectCrisisState();
    }, 1000);

    // Event listeners for crisis indicators
    const handleRapidClick = () => {
      setBehaviorData(prev => ({
        ...prev,
        rapidClicks: prev.rapidClicks + 1,
        lastActive: Date.now()
      }));
    };

    const handleBackNavigation = () => {
      setBehaviorData(prev => ({
        ...prev,
  backNavigationCount: prev.backNavigationCount + 1
      }));
    };

    const handleError = () => {
      setBehaviorData(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    };

    // Add event listeners
    document.addEventListener('click', handleRapidClick);
    window.addEventListener('popstate', handleBackNavigation);
    window.addEventListener('error', handleError);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleRapidClick);
      window.removeEventListener('popstate', handleBackNavigation);
      window.removeEventListener('error', handleError);
    };
  }, [behaviorData]);

  const resetCrisisDetection = () => {
    setCrisisLevel('none');
    setBehaviorData({
      rapidClicks: 0,
  backNavigationCount: 0,
      timeOnPage: 0,
      errorCount: 0,
      lastActive: Date.now()
    });
  };

  const trackHelpRequest = useCallback(() => {
    // record that a help request occurred; use errorCount as a lightweight metric
    setBehaviorData(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
  }, []);

  return {
    crisisLevel,
    resetCrisisDetection,
    behaviorData
  , trackHelpRequest
  };
}

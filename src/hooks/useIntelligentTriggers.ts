import { useState, useEffect, useCallback } from 'react';
import type { PainEntry } from '../types';
import {
  intelligentTrigger,
  type IntelligentTrigger,
  initializeIntelligentTriggers,
  analyzeEntriesForTriggers,
  createDefaultIntelligentTriggers
} from '../utils/notifications/intelligent';

export interface UseIntelligentTriggersReturn {
  triggers: IntelligentTrigger[];
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
  analyzeTriggers: (entries: PainEntry[]) => Promise<void>;
  updateTrigger: (triggerId: string, updates: Partial<IntelligentTrigger>) => void;
  resetToDefaults: () => void;
  getTriggerStats: (triggerId: string) => { triggerCount: number; lastTriggered?: string } | null;
}

export const useIntelligentTriggers = (): UseIntelligentTriggersReturn => {
  const [triggers, setTriggers] = useState<IntelligentTrigger[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Initialize triggers on mount
  useEffect(() => {
    initializeIntelligentTriggers();
    setTriggers(intelligentTrigger.getActiveTriggers());
  }, []);

  // Analyze triggers with provided entries
  const analyzeTriggers = useCallback(async (entries: PainEntry[]) => {
    setIsAnalyzing(true);
    try {
      await analyzeEntriesForTriggers(entries);
      setLastAnalysis(new Date());
      // Refresh triggers to get updated stats
      setTriggers(intelligentTrigger.getActiveTriggers());
    } catch (error) {
      console.error('Failed to analyze triggers:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Update a specific trigger
  const updateTrigger = useCallback((triggerId: string, updates: Partial<IntelligentTrigger>) => {
    intelligentTrigger.updateTrigger(triggerId, updates);
    setTriggers(intelligentTrigger.getActiveTriggers());
  }, []);

  // Reset to default triggers
  const resetToDefaults = useCallback(() => {
    // Clear existing triggers
    const currentTriggers = intelligentTrigger.getActiveTriggers();
    currentTriggers.forEach((trigger: IntelligentTrigger) => {
      intelligentTrigger.unregisterTrigger(trigger.id);
    });

    // Register defaults
    const defaultTriggers = createDefaultIntelligentTriggers();
    defaultTriggers.forEach((trigger: IntelligentTrigger) => {
      intelligentTrigger.registerTrigger(trigger);
    });

    setTriggers(intelligentTrigger.getActiveTriggers());
  }, []);

  // Get stats for a specific trigger
  const getTriggerStats = useCallback((triggerId: string) => {
    return intelligentTrigger.getTriggerStats(triggerId);
  }, []);

  return {
    triggers,
    isAnalyzing,
    lastAnalysis,
    analyzeTriggers,
    updateTrigger,
    resetToDefaults,
    getTriggerStats
  };
};

// Hook for automatic trigger analysis based on data changes
export const useAutomaticTriggerAnalysis = (entries: PainEntry[], enabled: boolean = true) => {
  const { analyzeTriggers, isAnalyzing } = useIntelligentTriggers();

  useEffect(() => {
    if (!enabled || entries.length === 0) return;

    // Analyze triggers when entries change significantly
    const recentEntries = entries.slice(-10); // Last 10 entries
    const shouldAnalyze = recentEntries.length >= 3; // Need at least 3 entries for meaningful analysis

    if (shouldAnalyze && !isAnalyzing) {
      const timeoutId = setTimeout(() => {
        analyzeTriggers(recentEntries);
      }, 2000); // 2 second delay to avoid excessive analysis

      return () => clearTimeout(timeoutId);
    }
  }, [entries, enabled, analyzeTriggers, isAnalyzing]);

  return { isAnalyzing };
};

// Hook for trigger management UI
export interface TriggerManagementState {
  selectedTrigger: IntelligentTrigger | null;
  isEditing: boolean;
  showStats: boolean;
}

export const useTriggerManagement = () => {
  const [state, setState] = useState<TriggerManagementState>({
    selectedTrigger: null,
    isEditing: false,
    showStats: false
  });

  const selectTrigger = useCallback((trigger: IntelligentTrigger | null) => {
    setState(prev => ({
      ...prev,
      selectedTrigger: trigger,
      isEditing: false,
      showStats: false
    }));
  }, []);

  const startEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      showStats: false
    }));
  }, []);

  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false
    }));
  }, []);

  const openStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      showStats: true,
      isEditing: false
    }));
  }, []);

  const hideStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      showStats: false
    }));
  }, []);

  return {
    ...state,
    selectTrigger,
    startEditing,
    cancelEditing,
    openStats,
    hideStats
  };
};

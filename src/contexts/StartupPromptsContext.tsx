/**
 * StartupPromptsContext - Coordinates display of startup prompts to prevent "notification wall"
 * Ensures only one prompt appears at a time on initial app startup
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type PromptType = 'beta-warning' | 'notification-consent' | 'analytics-consent';

interface PromptRequest {
  type: PromptType;
  priority: number; // Lower number = higher priority
}

interface StartupPromptsContextType {
  requestPrompt: (type: PromptType, priority: number) => void;
  dismissPrompt: (type: PromptType) => void;
  canShowPrompt: (type: PromptType) => boolean;
  activePrompt: PromptType | null;
}

const StartupPromptsContext = createContext<StartupPromptsContextType | undefined>(undefined);

export function useStartupPrompts() {
  const context = useContext(StartupPromptsContext);
  if (!context) {
    throw new Error('useStartupPrompts must be used within StartupPromptsProvider');
  }
  return context;
}

interface StartupPromptsProviderProps {
  children: ReactNode;
}

export function StartupPromptsProvider({ children }: StartupPromptsProviderProps) {
  const [activePrompt, setActivePrompt] = useState<PromptType | null>(null);
  const [promptQueue, setPromptQueue] = useState<PromptRequest[]>([]);
  const [dismissedPrompts, setDismissedPrompts] = useState<Set<PromptType>>(new Set());

  // Process the queue when active prompt changes or queue updates
  useEffect(() => {
    if (activePrompt === null && promptQueue.length > 0) {
      // Sort by priority and show the highest priority prompt
      const sorted = [...promptQueue].sort((a, b) => a.priority - b.priority);
      const next = sorted[0];
      setActivePrompt(next.type);
      setPromptQueue(promptQueue.filter(p => p.type !== next.type));
    }
  }, [activePrompt, promptQueue]);

  const requestPrompt = useCallback((type: PromptType, priority: number) => {
    // Don't add if already dismissed or already in queue
    setPromptQueue(prev => {
      const alreadyQueued = prev.some(p => p.type === type);
      if (alreadyQueued) return prev;
      return [...prev, { type, priority }];
    });
  }, []);

  const dismissPrompt = useCallback((type: PromptType) => {
    setDismissedPrompts(prev => new Set(prev).add(type));
    if (activePrompt === type) {
      setActivePrompt(null);
    }
  }, [activePrompt]);

  const canShowPrompt = useCallback((type: PromptType) => {
    return activePrompt === type && !dismissedPrompts.has(type);
  }, [activePrompt, dismissedPrompts]);

  return (
    <StartupPromptsContext.Provider value={{ requestPrompt, dismissPrompt, canShowPrompt, activePrompt }}>
      {children}
    </StartupPromptsContext.Provider>
  );
}

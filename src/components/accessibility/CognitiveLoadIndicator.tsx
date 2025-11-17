/**
 * Cognitive Load Indicator
 * Visual indicators and helpers to show and manage cognitive complexity
 */

import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { useCognitiveLoadCalculator, calculateCognitiveLoad } from './cognitiveLoadUtils';

interface CognitiveLoadIndicatorProps {
  level: 'minimal' | 'moderate' | 'high' | 'overwhelming';
  description?: string;
  onReduce?: () => void;
  showSuggestions?: boolean;
  className?: string;
}

const loadLevelConfig = {
  minimal: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    message: 'This section is simple and easy to complete',
    suggestion: null
  },
  moderate: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    message: 'This section requires some focus',
    suggestion: 'Take your time and use the memory aids provided'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    message: 'This section has many options',
    suggestion: 'Consider using simplified mode or taking breaks'
  },
  overwhelming: {
    icon: Brain,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    message: 'This section might feel overwhelming',
    suggestion: 'We recommend simplifying or completing this later'
  }
};

export function CognitiveLoadIndicator({
  level,
  description,
  onReduce,
  showSuggestions = true,
  className = ''
}: CognitiveLoadIndicatorProps) {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isVisible, setIsVisible] = useState(true);
  
  const config = loadLevelConfig[level];
  const Icon = config.icon;

  // Don't show for minimal load if user prefers minimal indicators
  if (level === 'minimal' && preferences.simplifiedMode) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const handleSimplify = () => {
    updatePreferences({ simplifiedMode: true });
    if (onReduce) {
      onReduce();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className={`
      rounded-lg border p-4 transition-all duration-200
      ${config.bgColor} ${config.borderColor} ${className}
    `}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${config.color}`}>
              Cognitive Load: {level.charAt(0).toUpperCase() + level.slice(1)}
            </h4>
            
            <TouchOptimizedButton
              variant="secondary"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
              aria-label="Dismiss indicator"
            >
              ×
            </TouchOptimizedButton>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {description || config.message}
          </p>
          
          {showSuggestions && config.suggestion && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                💡 {config.suggestion}
              </p>
              
              {(level === 'high' || level === 'overwhelming') && (
                <div className="flex flex-wrap gap-2">
                  {!preferences.simplifiedMode && (
                    <TouchOptimizedButton
                      variant="secondary"
                      onClick={handleSimplify}
                      className="text-xs"
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Simplify Interface
                    </TouchOptimizedButton>
                  )}
                  
                  {onReduce && (
                    <TouchOptimizedButton
                      variant="secondary"
                      onClick={onReduce}
                      className="text-xs"
                    >
                      Show Less
                    </TouchOptimizedButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component that wraps content and automatically shows load indicator
interface CognitiveLoadWrapperProps {
  children: React.ReactNode;
  fieldsCount?: number;
  requiredFields?: number;
  hasComplexInteractions?: boolean;
  onSimplify?: () => void;
  showIndicator?: boolean;
}

export function CognitiveLoadWrapper({
  children,
  fieldsCount = 0,
  requiredFields = 0,
  hasComplexInteractions = false,
  onSimplify,
  showIndicator = true
}: CognitiveLoadWrapperProps) {
  const level = useCognitiveLoadCalculator(
    fieldsCount,
    requiredFields,
    hasComplexInteractions
  );
  
  return (
    <div className="space-y-4">
      {showIndicator && level !== 'minimal' && (
        <CognitiveLoadIndicator
          level={level}
          onReduce={onSimplify}
          showSuggestions={true}
        />
      )}
      {children}
    </div>
  );
}

// Real-time cognitive load monitor for forms
export function CognitiveLoadMonitor({
  formElement,
  onLoadChange
}: {
  formElement: React.RefObject<HTMLFormElement>;
  onLoadChange?: (level: CognitiveLoadIndicatorProps['level']) => void;
}) {
  useEffect(() => {
    if (!formElement.current) return;
    
    const form = formElement.current;
    const calculateCurrentLoad = () => {
      const fields = form.querySelectorAll('input, select, textarea');
      const visibleFields = Array.from(fields).filter(
        field => (field as HTMLElement).offsetParent !== null
      );
      const requiredFields = Array.from(fields).filter(
        field => (field as HTMLInputElement).required
      );
      
      const level = calculateCognitiveLoad(
        visibleFields.length,
        requiredFields.length,
        form.querySelectorAll('[data-complex]').length > 0
      );
      
      if (onLoadChange) {
        onLoadChange(level);
      }
    };
    
    // Calculate initial load
    calculateCurrentLoad();
    
    // Monitor for changes
    const observer = new MutationObserver(calculateCurrentLoad);
    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'hidden', 'disabled']
    });
    
    return () => observer.disconnect();
  }, [formElement, onLoadChange]);
  
  return null; // This is a monitoring component, no UI
}

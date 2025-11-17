/**
 * Crisis State Interface Adaptations
 * Specialized UI components that adapt when users are in crisis or distressed states
 */

import React, { useState } from 'react';
import {
  Heart,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle,
  Home,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface CrisisStateAdaptationProps {
  crisisLevel: 'none' | 'mild' | 'moderate' | 'severe' | 'emergency';
  onCrisisHelp?: () => void;
  onTakeBreak?: () => void;
  onSimplifyInterface?: () => void;
  children: React.ReactNode;
}

// Crisis level configurations
const crisisConfig = {
  none: {
    showAdaptations: false,
    backgroundColor: 'bg-white',
    borderColor: 'border-gray-200',
  },
  mild: {
    showAdaptations: true,
    backgroundColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    message: 'We notice you might be feeling stressed. Take your time.',
    actions: ['pause', 'simplify'],
  },
  moderate: {
    showAdaptations: true,
    backgroundColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    message: 'This seems overwhelming right now. Would you like to simplify or take a break?',
    actions: ['pause', 'simplify', 'save'],
  },
  severe: {
    showAdaptations: true,
    backgroundColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    message: 'We want to support you. Consider taking a break or reaching out for help.',
    actions: ['pause', 'help', 'emergency', 'save'],
  },
  emergency: {
    showAdaptations: true,
    backgroundColor: 'bg-red-50',
    borderColor: 'border-red-300',
    message: 'Your safety is most important. Here are immediate resources.',
    actions: ['emergency', 'help', 'save'],
  },
};

export function CrisisStateAdaptation({
  crisisLevel,
  onCrisisHelp,
  onTakeBreak,
  onSimplifyInterface,
  children,
}: CrisisStateAdaptationProps) {
  const { updatePreferences } = useTraumaInformed();
  const [isMinimized, setIsMinimized] = useState(false);
  const config = crisisConfig[crisisLevel];

  if (crisisLevel === 'none' || !config.showAdaptations) {
    return <>{children}</>;
  }

  const handlePause = () => {
    if (onTakeBreak) {
      onTakeBreak();
    }
  };

  const handleSimplify = () => {
    updatePreferences({
      simplifiedMode: true,
      showMemoryAids: true,
      gentleLanguage: true,
    });
    if (onSimplifyInterface) {
      onSimplifyInterface();
    }
  };

  const handleHelp = () => {
    if (onCrisisHelp) {
      onCrisisHelp();
    }
  };

  const handleEmergency = () => {
    // This would typically open emergency resources
    window.open('tel:988', '_self'); // Suicide & Crisis Lifeline
  };

  if (isMinimized) {
    return (
      <div className="relative">
        <div
          className={`
          fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg
          ${config.backgroundColor} ${config.borderColor} border-2
        `}
        >
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => setIsMinimized(false)}
            className="text-sm"
          >
            <Heart className="w-4 h-4 mr-2" />
            Support Available
          </TouchOptimizedButton>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`
      min-h-screen transition-all duration-300
      ${config.backgroundColor} ${config.borderColor}
    `}
    >
      {/* Crisis Support Header */}
      <div
        className={`
        border-b-2 p-4 sticky top-0 z-40
        ${config.backgroundColor} ${config.borderColor}
      `}
      >
        <CrisisAlert
          level={crisisLevel}
          message={'message' in config ? config.message : ''}
          actions={'actions' in config ? config.actions : []}
          onPause={handlePause}
          onSimplify={handleSimplify}
          onHelp={handleHelp}
          onEmergency={handleEmergency}
          onMinimize={() => setIsMinimized(true)}
        />
      </div>

      {/* Main Content with Crisis-Aware Styling */}
      <div className="container mx-auto px-4 py-6">{children}</div>
    </div>
  );
}

// Crisis Alert Banner Component
interface CrisisAlertProps {
  level: 'mild' | 'moderate' | 'severe' | 'emergency';
  message?: string;
  actions?: string[];
  onPause?: () => void;
  onSimplify?: () => void;
  onHelp?: () => void;
  onEmergency?: () => void;
  onMinimize?: () => void;
}

function CrisisAlert({
  level,
  message,
  actions = [],
  onPause,
  onSimplify,
  onHelp,
  onEmergency,
  onMinimize,
}: CrisisAlertProps) {
  const getIcon = () => {
    switch (level) {
      case 'mild':
        return <Heart className="w-5 h-5 text-blue-600" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'severe':
        return <Shield className="w-5 h-5 text-orange-600" />;
      case 'emergency':
        return <Phone className="w-5 h-5 text-red-600" />;
      default:
        return <Heart className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3">
      {getIcon()}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{message}</p>

        <div className="flex flex-wrap gap-2">
          {actions.includes('pause') && (
            <TouchOptimizedButton variant="secondary" onClick={onPause} className="text-sm">
              <Pause className="w-4 h-4 mr-1" />
              Take a Break
            </TouchOptimizedButton>
          )}

          {actions.includes('simplify') && (
            <TouchOptimizedButton variant="secondary" onClick={onSimplify} className="text-sm">
              <RotateCcw className="w-4 h-4 mr-1" />
              Simplify
            </TouchOptimizedButton>
          )}

          {actions.includes('help') && (
            <TouchOptimizedButton variant="secondary" onClick={onHelp} className="text-sm">
              <Heart className="w-4 h-4 mr-1" />
              Get Support
            </TouchOptimizedButton>
          )}

          {actions.includes('emergency') && (
            <TouchOptimizedButton
              variant="primary"
              onClick={onEmergency}
              className="text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-1" />
              Crisis Line (988)
            </TouchOptimizedButton>
          )}

          {actions.includes('save') && (
            <TouchOptimizedButton
              variant="secondary"
              onClick={() => {
                /* Auto-save functionality */
              }}
              className="text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Save Progress
            </TouchOptimizedButton>
          )}
        </div>
      </div>

      <TouchOptimizedButton
        variant="secondary"
        onClick={onMinimize}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
        aria-label="Minimize crisis support"
      >
        <Home className="w-4 h-4" />
      </TouchOptimizedButton>
    </div>
  );
}

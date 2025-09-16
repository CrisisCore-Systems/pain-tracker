/**
 * Trauma-Aware Content Warnings
 * Provides content warnings and safe disclosure of potentially triggering content
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Shield, 
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface ContentWarningProps {
  level: 'mild' | 'moderate' | 'severe';
  triggerTypes: string[];
  title?: string;
  description?: string;
  children: React.ReactNode;
  onProceed?: () => void;
  onSkip?: () => void;
  showCustomization?: boolean;
}

const warningConfig = {
  mild: {
    icon: Eye,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    message: 'This content contains topics that some may find difficult'
  },
  moderate: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    message: 'This content contains potentially distressing information'
  },
  severe: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    message: 'This content contains sensitive material that may be triggering'
  }
};

export function ContentWarning({
  level,
  triggerTypes,
  title = 'Content Warning',
  description,
  children,
  onProceed,
  onSkip,
  showCustomization = true
}: ContentWarningProps) {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  const config = warningConfig[level];
  const Icon = config.icon;

  // Don't show warning if user has disabled them and it's mild
  if (!preferences.hideDistressingContent && level === 'mild') {
    return <>{children}</>;
  }

  // Don't show if user has dismissed
  if (!isVisible) {
    return <>{children}</>;
  }

  // Show content if user chose to proceed
  if (showContent) {
    return (
      <div className="space-y-4">
        <ContentWarningBanner 
          level={level}
          onHide={() => setShowContent(false)}
        />
        {children}
      </div>
    );
  }

  const handleProceed = () => {
    setShowContent(true);
    if (onProceed) {
      onProceed();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) {
      onSkip();
    }
  };

  const handleDisableWarnings = () => {
    updatePreferences({ hideDistressingContent: false });
    setShowContent(true);
  };

  return (
    <div className={`
      rounded-lg border-2 p-6 transition-all duration-200
      ${config.bgColor} ${config.borderColor}
    `}>
      <div className="flex items-start space-x-4">
        <Icon className={`w-6 h-6 mt-1 flex-shrink-0 ${config.color}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {title}
            </h3>
            
            <TouchOptimizedButton
              variant="secondary"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </TouchOptimizedButton>
          </div>
          
          <p className="text-gray-700 mb-4">
            {description || config.message}
          </p>
          
          {triggerTypes.length > 0 && (
            <TriggerTypesList types={triggerTypes} />
          )}
          
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-3">
              <TouchOptimizedButton
                variant="primary"
                onClick={handleProceed}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                I Understand, Continue
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                variant="secondary"
                onClick={handleSkip}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Skip This Section
              </TouchOptimizedButton>
            </div>
            
            {showCustomization && (
              <ContentWarningCustomization
                onDisableWarnings={handleDisableWarnings}
                currentLevel={level}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Display list of trigger types
function TriggerTypesList({ types }: { types: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayTypes = isExpanded ? types : types.slice(0, 3);
  
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Content includes:
        </span>
        {types.length > 3 && (
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            {isExpanded ? 'Show Less' : `+${types.length - 3} more`}
          </TouchOptimizedButton>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayTypes.map((type, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

// Content warning customization options
function ContentWarningCustomization({
  onDisableWarnings,
  currentLevel
}: {
  onDisableWarnings: () => void;
  currentLevel: 'mild' | 'moderate' | 'severe';
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isExpanded) {
    return (
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => setIsExpanded(true)}
        className="text-xs text-gray-600"
      >
        <ChevronRight className="w-3 h-3 mr-1" />
        Customize Warnings
      </TouchOptimizedButton>
    );
  }
  
  return (
    <div className="border-t pt-3 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Warning Settings
        </span>
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => setIsExpanded(false)}
          className="text-xs"
        >
          <ChevronDown className="w-3 h-3" />
        </TouchOptimizedButton>
      </div>
      
      <div className="space-y-2 text-sm">
        {currentLevel === 'mild' && (
          <TouchOptimizedButton
            variant="secondary"
            onClick={onDisableWarnings}
            className="text-xs w-full justify-start"
          >
            Don't show warnings for mild content
          </TouchOptimizedButton>
        )}
        
        <p className="text-xs text-gray-600">
          You can always adjust warning preferences in Settings
        </p>
      </div>
    </div>
  );
}

// Minimal banner shown when content is displayed after warning
function ContentWarningBanner({
  level,
  onHide
}: {
  level: 'mild' | 'moderate' | 'severe';
  onHide: () => void;
}) {
  const config = warningConfig[level];
  
  return (
    <div className={`
      rounded-md border px-4 py-2 flex items-center justify-between
      ${config.bgColor} ${config.borderColor}
    `}>
      <div className="flex items-center space-x-2">
        <Shield className={`w-4 h-4 ${config.color}`} />
        <span className="text-sm text-gray-700">
          Content warning acknowledged
        </span>
      </div>
      
      <TouchOptimizedButton
        variant="secondary"
        onClick={onHide}
        className="text-xs"
      >
        <EyeOff className="w-3 h-3 mr-1" />
        Hide Content
      </TouchOptimizedButton>
    </div>
  );
}

// Quick content warning for inline use
export function InlineContentWarning({
  triggerType,
  children
}: {
  triggerType: string;
  children: React.ReactNode;
}) {
  const [showContent, setShowContent] = useState(false);
  
  if (showContent) {
    return <>{children}</>;
  }
  
  return (
    <span className="inline-flex items-center">
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => setShowContent(true)}
        className="text-xs mr-1"
      >
        <Eye className="w-3 h-3 mr-1" />
        Show {triggerType}
      </TouchOptimizedButton>
      <span className="text-gray-500 text-sm">[hidden]</span>
    </span>
  );
}

// Wrapper for automatic content warning based on content analysis
export function AutoContentWarning({
  children,
  analysisText = '',
  customTriggers = []
}: {
  children: React.ReactNode;
  analysisText?: string;
  customTriggers?: string[];
}) {
  const { triggerTypes, level } = analyzeContentForTriggers(
    analysisText, 
    customTriggers
  );
  
  if (triggerTypes.length === 0) {
    return <>{children}</>;
  }
  
  return (
    <ContentWarning
      level={level}
      triggerTypes={triggerTypes}
      description="This content has been automatically flagged as potentially sensitive"
    >
      {children}
    </ContentWarning>
  );
}

// Simple content trigger analysis
function analyzeContentForTriggers(
  text: string, 
  customTriggers: string[]
): { triggerTypes: string[], level: 'mild' | 'moderate' | 'severe' } {
  const triggers = [...customTriggers];
  let score = 0;
  
  const textLower = text.toLowerCase();
  
  // Pain-related triggers
  const painTriggers = ['severe pain', 'chronic pain', 'disability', 'injury'];
  painTriggers.forEach(trigger => {
    if (textLower.includes(trigger)) {
      triggers.push('Pain descriptions');
      score += 1;
    }
  });
  
  // Medical triggers
  const medicalTriggers = ['surgery', 'hospital', 'emergency', 'diagnosis'];
  medicalTriggers.forEach(trigger => {
    if (textLower.includes(trigger)) {
      triggers.push('Medical procedures');
      score += 1;
    }
  });
  
  // Emotional triggers
  const emotionalTriggers = ['depression', 'anxiety', 'stress', 'trauma'];
  emotionalTriggers.forEach(trigger => {
    if (textLower.includes(trigger)) {
      triggers.push('Mental health');
      score += 2;
    }
  });
  
  // Determine severity level
  let level: 'mild' | 'moderate' | 'severe' = 'mild';
  if (score >= 4) level = 'severe';
  else if (score >= 2) level = 'moderate';
  
  return {
    triggerTypes: [...new Set(triggers)], // Remove duplicates
    level
  };
}

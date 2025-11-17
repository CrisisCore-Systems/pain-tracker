/**
 * Trauma-Informed UX Components
 * Designed for cognitive fog, physical limitations, and emotional safety
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Shield,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';

// Progressive Disclosure Component
interface ProgressiveDisclosureProps {
  title: string;
  level: 'essential' | 'helpful' | 'advanced';
  children: ReactNode;
  defaultOpen?: boolean;
  memoryAid?: string;
}

export function ProgressiveDisclosure({
  title,
  level,
  children,
  defaultOpen = false,
  memoryAid,
}: ProgressiveDisclosureProps) {
  const { preferences } = useTraumaInformed();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open essential items in simplified mode
  const shouldAutoOpen = preferences.simplifiedMode && level === 'essential';

  const levelColors = {
    essential: 'border-l-blue-500 bg-blue-50',
    helpful: 'border-l-yellow-500 bg-yellow-50',
    advanced: 'border-l-gray-500 bg-gray-50',
  };

  const levelLabels = {
    essential: 'Essential',
    helpful: 'Helpful',
    advanced: 'Advanced',
  };

  return (
    <div className={`border-l-4 ${levelColors[level]} rounded-r-md mb-4`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ minHeight: 'var(--ti-touch-size)' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {levelLabels[level]}
              </span>
            </div>
          </div>
          {preferences.showMemoryAids && memoryAid && (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              💡 {memoryAid}
            </div>
          )}
        </div>
      </button>

      {(isOpen || shouldAutoOpen) && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// Memory Aid Component
interface MemoryAidProps {
  text?: string;
  type?: 'tip' | 'reminder' | 'example';
  // New props used by CognitiveFogNavigation
  title?: string;
  items?: string[];
}

export function MemoryAid({ text, type = 'tip', title, items }: MemoryAidProps) {
  const { preferences } = useTraumaInformed();

  if (!preferences.showMemoryAids) return null;

  const icons = {
    tip: '💡',
    reminder: '🔔',
    example: '📝',
  };

  if (title && items) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
        <div className="font-medium text-blue-800 mb-2">{title}</div>
        <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
      <div className="flex items-start space-x-2">
        <span className="text-lg">{icons[type]}</span>
        <p className="text-sm text-blue-800">{text}</p>
      </div>
    </div>
  );
}

// Gentle Validation Component
interface GentleValidationProps {
  field: string;
  error?: string;
  success?: string;
  children: ReactNode;
}

export function GentleValidation({ field, error, success, children }: GentleValidationProps) {
  const { preferences } = useTraumaInformed();

  const getMessage = () => {
    if (error && preferences.gentleLanguage) {
      return `It looks like the ${field} field might need a little attention. No worries - take your time.`;
    }
    if (success && preferences.gentleLanguage) {
      return `Great job with the ${field} field! You're doing well.`;
    }
    return error || success;
  };

  return (
    <div className="space-y-2">
      {children}
      {(error || success) && (
        <div
          className={`flex items-start space-x-2 p-2 rounded ${
            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {error ? (
            <Heart className="w-4 h-4 mt-0.5 text-red-500" />
          ) : (
            <Shield className="w-4 h-4 mt-0.5 text-green-500" />
          )}
          <p className="text-sm">{getMessage()}</p>
        </div>
      )}
    </div>
  );
}

// Auto-Save Indicator
interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  isSaving?: boolean;
}

export function AutoSaveIndicator({ lastSaved, isSaving }: AutoSaveIndicatorProps) {
  const { preferences } = useTraumaInformed();

  if (!preferences.autoSave) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
      {isSaving ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Shield className="w-3 h-3 text-green-500" />
          <span>Saved {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>Auto-save enabled</span>
        </>
      )}
    </div>
  );
}

// Comfort Prompt Component
interface ComfortPromptProps {
  intensity?: 'gentle' | 'standard' | 'strong';
}

export function ComfortPrompt({ intensity = 'gentle' }: ComfortPromptProps) {
  const { preferences } = useTraumaInformed();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (preferences.showComfortPrompts) {
      const timer = setTimeout(() => setIsVisible(true), 30000); // Show after 30 seconds
      return () => clearTimeout(timer);
    }
  }, [preferences.showComfortPrompts]);

  if (!preferences.showComfortPrompts || !isVisible) return null;

  const messages = {
    gentle: "Take your time. There's no rush with tracking your health.",
    standard: 'Remember to take breaks if you need them. Your wellbeing comes first.',
    strong: "If you're feeling overwhelmed, it's okay to save and continue later.",
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{messages[intensity]}</p>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Touch-Optimized Button
interface TouchOptimizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gentle';
  size?: 'normal' | 'large';
  disabled?: boolean;
  className?: string;
}

export function TouchOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  className = '',
}: TouchOptimizedButtonProps) {
  const { preferences } = useTraumaInformed();

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    gentle: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
  };

  const sizeClass =
    size === 'large' || preferences.touchTargetSize !== 'normal'
      ? `px-6 py-4 text-lg min-h-[var(--ti-touch-size)]`
      : `px-4 py-2 text-base min-h-[44px]`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClass} ${className}`}
      style={{
        fontSize: 'var(--ti-font-size)',
        transition: preferences.reduceMotion ? 'none' : 'all var(--ti-transition-duration)',
      }}
    >
      {children}
    </button>
  );
}

// Cognitive Load Reducer
interface CognitiveLoadReducerProps {
  children: ReactNode;
  maxItems?: number;
  showToggle?: boolean;
}

export function CognitiveLoadReducer({
  children,
  maxItems = 5,
  showToggle = true,
}: CognitiveLoadReducerProps) {
  const { preferences } = useTraumaInformed();
  const [showAll, setShowAll] = useState(!preferences.simplifiedMode);

  const childArray = React.Children.toArray(children);
  const shouldLimit = preferences.simplifiedMode && childArray.length > maxItems;
  const displayChildren = shouldLimit && !showAll ? childArray.slice(0, maxItems) : childArray;

  return (
    <div>
      {displayChildren}
      {shouldLimit && showToggle && (
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full"
        >
          {showAll ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show {childArray.length - maxItems} More Options
            </>
          )}
        </TouchOptimizedButton>
      )}
    </div>
  );
}

// Trauma-Informed Form Wrapper
interface TraumaInformedFormProps {
  children: ReactNode;
  title: string;
  description?: string;
  onSave?: (data: Record<string, unknown>) => void;
  autoSave?: boolean;
}

export function TraumaInformedForm({
  children,
  title,
  description,
  autoSave = true,
}: TraumaInformedFormProps) {
  const { preferences } = useTraumaInformed();
  const [lastSaved] = useState<Date>();
  const [isSaving] = useState(false);

  return (
    <Card className="trauma-informed-form">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ fontSize: 'var(--ti-font-size)' }}>{title}</CardTitle>
            {description && (
              <p
                className="text-gray-600 dark:text-gray-400 mt-1"
                style={{ fontSize: 'calc(var(--ti-font-size) * 0.875)' }}
              >
                {description}
              </p>
            )}
          </div>
          {preferences.autoSave && autoSave && (
            <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">{children}</div>

        {preferences.showComfortPrompts && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-blue-700">
                Remember: You're in control. You can save and come back anytime.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

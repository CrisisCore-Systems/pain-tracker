/**
 * Stress-Responsive UI Components
 * UI components that adapt based on detected stress levels and crisis states
 */

import React, { useState, useEffect } from 'react';
import { useCrisisDetection } from './useCrisisDetection';
import { AlertTriangle, Heart, Zap } from 'lucide-react';

// Stress-responsive theme configurations
interface StressTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    warning: string;
  };
  animation: {
    duration: number;
    intensity: 'minimal' | 'reduced' | 'normal';
    enableTransitions: boolean;
  };
  layout: {
    spacing: 'tight' | 'normal' | 'relaxed';
    density: 'compact' | 'normal' | 'spacious';
    buttonSize: 'normal' | 'large' | 'extra-large';
  };
  visual: {
    contrast: 'normal' | 'high' | 'maximum';
    blur: number;
    brightness: number;
    saturation: number;
  };
}

const STRESS_THEMES: Record<string, StressTheme> = {
  calm: {
    colors: {
      primary: '#10b981',
      secondary: '#06b6d4',
      background: '#f9fafb',
      text: '#374151',
      accent: '#8b5cf6',
      warning: '#f59e0b',
    },
    animation: {
      duration: 300,
      intensity: 'normal',
      enableTransitions: true,
    },
    layout: {
      spacing: 'normal',
      density: 'normal',
      buttonSize: 'normal',
    },
    visual: {
      contrast: 'normal',
      blur: 0,
      brightness: 1,
      saturation: 1,
    },
  },
  mild: {
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      background: '#f8fafc',
      text: '#1f2937',
      accent: '#6366f1',
      warning: '#f59e0b',
    },
    animation: {
      duration: 200,
      intensity: 'reduced',
      enableTransitions: true,
    },
    layout: {
      spacing: 'relaxed',
      density: 'normal',
      buttonSize: 'large',
    },
    visual: {
      contrast: 'normal',
      blur: 0,
      brightness: 1.1,
      saturation: 0.9,
    },
  },
  moderate: {
    colors: {
      primary: '#f97316',
      secondary: '#eab308',
      background: '#fffbeb',
      text: '#92400e',
      accent: '#d97706',
      warning: '#dc2626',
    },
    animation: {
      duration: 150,
      intensity: 'reduced',
      enableTransitions: true,
    },
    layout: {
      spacing: 'relaxed',
      density: 'spacious',
      buttonSize: 'large',
    },
    visual: {
      contrast: 'high',
      blur: 0,
      brightness: 1.2,
      saturation: 0.8,
    },
  },
  severe: {
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      background: '#fef2f2',
      text: '#7f1d1d',
      accent: '#b91c1c',
      warning: '#dc2626',
    },
    animation: {
      duration: 100,
      intensity: 'minimal',
      enableTransitions: false,
    },
    layout: {
      spacing: 'relaxed',
      density: 'spacious',
      buttonSize: 'extra-large',
    },
    visual: {
      contrast: 'high',
      blur: 0,
      brightness: 1.3,
      saturation: 0.7,
    },
  },
  emergency: {
    colors: {
      primary: '#991b1b',
      secondary: '#dc2626',
      background: '#fef2f2',
      text: '#7f1d1d',
      accent: '#b91c1c',
      warning: '#dc2626',
    },
    animation: {
      duration: 0,
      intensity: 'minimal',
      enableTransitions: false,
    },
    layout: {
      spacing: 'relaxed',
      density: 'spacious',
      buttonSize: 'extra-large',
    },
    visual: {
      contrast: 'maximum',
      blur: 0,
      brightness: 1.4,
      saturation: 0.6,
    },
  },
};

// Stress-Responsive Container
interface StressResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enableStressAdaptation?: boolean;
  overrideTheme?: StressTheme;
}

export function StressResponsiveContainer({
  children,
  className = '',
  enableStressAdaptation = true,
  overrideTheme,
}: StressResponsiveContainerProps) {
  const { crisisLevel } = useCrisisDetection();

  const theme =
    overrideTheme || (enableStressAdaptation ? STRESS_THEMES[crisisLevel] : STRESS_THEMES.calm);

  const containerStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
    filter: `brightness(${theme.visual.brightness}) saturate(${theme.visual.saturation}) blur(${theme.visual.blur}px)`,
    ...(theme.layout.spacing === 'tight' && { padding: '0.5rem' }),
    ...(theme.layout.spacing === 'relaxed' && { padding: '1.5rem' }),
    ...(theme.layout.spacing === 'normal' && { padding: '1rem' }),
  };

  useEffect(() => {
    // Apply theme to document root for global stress adaptations
    if (enableStressAdaptation) {
      const root = document.documentElement;
      root.style.setProperty('--stress-primary', theme.colors.primary);
      root.style.setProperty('--stress-secondary', theme.colors.secondary);
      root.style.setProperty('--stress-background', theme.colors.background);
      root.style.setProperty('--stress-text', theme.colors.text);
      root.style.setProperty('--stress-accent', theme.colors.accent);
      root.style.setProperty('--stress-warning', theme.colors.warning);
      root.style.setProperty('--stress-animation-duration', `${theme.animation.duration}ms`);
    }
  }, [theme, enableStressAdaptation]);

  return (
    <div
      style={containerStyle}
      className={`stress-responsive-container ${className}`}
      data-stress-level={crisisLevel}
      data-contrast={theme.visual.contrast}
    >
      {children}
    </div>
  );
}

// Stress-Adaptive Button
interface StressAdaptiveButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'emergency';
  disabled?: boolean;
  className?: string;
  size?: 'normal' | 'large' | 'extra-large';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export function StressAdaptiveButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  size,
  urgency = 'low',
}: StressAdaptiveButtonProps) {
  const { crisisLevel } = useCrisisDetection();
  const theme = STRESS_THEMES[crisisLevel];

  // Determine button size based on stress level and explicit size
  const buttonSize = size || theme.layout.buttonSize;

  // Urgency-based styling
  const urgencyStyles = {
    low: { animation: 'none' },
    medium: { animation: crisisLevel !== 'emergency' ? 'pulse 2s infinite' : 'none' },
    high: { animation: crisisLevel !== 'emergency' ? 'pulse 1s infinite' : 'none' },
    critical: { animation: crisisLevel !== 'emergency' ? 'pulse 0.5s infinite' : 'none' },
  };

  const buttonStyle = {
    backgroundColor:
      variant === 'emergency'
        ? theme.colors.warning
        : variant === 'secondary'
          ? theme.colors.secondary
          : theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
    transform: 'scale(1)',
    boxShadow:
      urgency === 'critical'
        ? '0 0 20px rgba(220, 38, 38, 0.5)'
        : urgency === 'high'
          ? '0 0 15px rgba(245, 158, 11, 0.5)'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
    ...urgencyStyles[urgency],
    ...(buttonSize === 'large' && {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      minHeight: '3rem',
      minWidth: '8rem',
    }),
    ...(buttonSize === 'extra-large' && {
      padding: '1.5rem 3rem',
      fontSize: '1.25rem',
      minHeight: '4rem',
      minWidth: '10rem',
    }),
    ...(buttonSize === 'normal' && {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      minHeight: '2.5rem',
      minWidth: '6rem',
    }),
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      className={`stress-adaptive-button ${className}`}
      data-urgency={urgency}
      data-stress-level={crisisLevel}
      onMouseEnter={e => {
        if (!disabled && theme.animation.enableTransitions) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && theme.animation.enableTransitions) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {children}
    </button>
  );
}

// Stress-Responsive Text
interface StressResponsiveTextProps {
  children: React.ReactNode;
  level?: 'heading' | 'subheading' | 'body' | 'caption';
  emphasis?: 'normal' | 'medium' | 'high';
  className?: string;
}

export function StressResponsiveText({
  children,
  level = 'body',
  emphasis = 'normal',
  className = '',
}: StressResponsiveTextProps) {
  const { crisisLevel } = useCrisisDetection();
  const theme = STRESS_THEMES[crisisLevel];

  const getTextSize = () => {
    const baseSize = {
      heading: '1.5rem',
      subheading: '1.25rem',
      body: '1rem',
      caption: '0.875rem',
    };

    const multiplier =
      theme.layout.density === 'spacious' ? 1.2 : theme.layout.density === 'compact' ? 0.9 : 1;

    return `calc(${baseSize[level]} * ${multiplier})`;
  };

  const textStyle = {
    color: theme.colors.text,
    fontSize: getTextSize(),
    fontWeight: emphasis === 'high' ? '700' : emphasis === 'medium' ? '600' : '400',
    lineHeight:
      theme.layout.spacing === 'relaxed'
        ? '1.75'
        : theme.layout.spacing === 'tight'
          ? '1.4'
          : '1.6',
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
  };

  const Component =
    level === 'heading'
      ? 'h2'
      : level === 'subheading'
        ? 'h3'
        : level === 'caption'
          ? 'small'
          : 'p';

  return (
    <Component
      style={textStyle}
      className={`stress-responsive-text ${className}`}
      data-level={level}
      data-emphasis={emphasis}
      data-stress-level={crisisLevel}
    >
      {children}
    </Component>
  );
}

// Stress Level Indicator
interface StressLevelIndicatorProps {
  showLabel?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
}

export function StressLevelIndicator({
  showLabel = true,
  position = 'top-right',
  size = 'medium',
}: StressLevelIndicatorProps) {
  const { crisisLevel } = useCrisisDetection();
  const theme = STRESS_THEMES[crisisLevel];

  const getIcon = () => {
    switch (crisisLevel) {
      case 'emergency':
        return <AlertTriangle className="w-full h-full text-red-600" />;
      case 'severe':
        return <Zap className="w-full h-full text-orange-600" />;
      case 'moderate':
        return <Heart className="w-full h-full text-yellow-600" />;
      case 'mild':
        return <Heart className="w-full h-full text-blue-600" />;
      default:
        return <Heart className="w-full h-full text-green-600" />;
    }
  };

  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    };
    return positions[position];
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16',
    };
    return sizes[size];
  };

  const indicatorStyle = {
    backgroundColor: theme.colors.primary,
    borderRadius: '50%',
    padding: size === 'small' ? '0.25rem' : size === 'large' ? '0.75rem' : '0.5rem',
    boxShadow: `0 0 20px ${theme.colors.primary}40`,
    animation:
      crisisLevel === 'emergency'
        ? 'pulse 1s infinite'
        : crisisLevel === 'severe'
          ? 'pulse 2s infinite'
          : 'none',
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div
        className={`${getSizeClasses()} flex items-center justify-center`}
        style={indicatorStyle}
        title={`Stress Level: ${crisisLevel}`}
      >
        {getIcon()}
      </div>
      {showLabel && (
        <div className="mt-2 text-xs font-medium text-center" style={{ color: theme.colors.text }}>
          {crisisLevel.charAt(0).toUpperCase() + crisisLevel.slice(1)}
        </div>
      )}
    </div>
  );
}

// Stress-Responsive Card
interface StressResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function StressResponsiveCard({
  children,
  title,
  priority = 'low',
  className = '',
  collapsible = false,
  defaultExpanded = true,
}: StressResponsiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { crisisLevel } = useCrisisDetection();
  const theme = STRESS_THEMES[crisisLevel];

  // Auto-expand high priority cards during crisis
  useEffect(() => {
    if (
      (priority === 'high' || priority === 'emergency') &&
      (crisisLevel === 'severe' || crisisLevel === 'emergency')
    ) {
      setIsExpanded(true);
    }
  }, [priority, crisisLevel]);

  const getBorderColor = () => {
    switch (priority) {
      case 'emergency':
        return theme.colors.warning;
      case 'high':
        return theme.colors.accent;
      case 'medium':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const cardStyle = {
    backgroundColor: theme.colors.background,
    border: `2px solid ${getBorderColor()}`,
    borderRadius: '0.75rem',
    padding:
      theme.layout.spacing === 'relaxed'
        ? '1.5rem'
        : theme.layout.spacing === 'tight'
          ? '0.75rem'
          : '1rem',
    boxShadow:
      priority === 'emergency'
        ? `0 0 30px ${theme.colors.warning}40`
        : priority === 'high'
          ? `0 0 20px ${theme.colors.accent}30`
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
    animation:
      priority === 'emergency' && crisisLevel === 'emergency' ? 'pulse 2s infinite' : 'none',
  };

  return (
    <div
      className={`stress-responsive-card ${className}`}
      style={cardStyle}
      data-priority={priority}
      data-stress-level={crisisLevel}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <StressResponsiveText level="subheading" emphasis="medium">
            {title}
          </StressResponsiveText>
          {collapsible && (
            <StressAdaptiveButton
              onClick={() => setIsExpanded(!isExpanded)}
              size="normal"
              className="ml-2"
            >
              {isExpanded ? '−' : '+'}
            </StressAdaptiveButton>
          )}
        </div>
      )}
      {(!collapsible || isExpanded) && <div className="stress-card-content">{children}</div>}
    </div>
  );
}

// Crisis Alert Banner
interface CrisisAlertBannerProps {
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    action: () => void;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
  }>;
  autoHide?: boolean;
  hideDelay?: number;
}

export function CrisisAlertBanner({
  onDismiss,
  actions = [],
  autoHide = false,
  hideDelay = 10000,
}: CrisisAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { crisisLevel } = useCrisisDetection();
  const theme = STRESS_THEMES[crisisLevel];

  useEffect(() => {
    if (autoHide && hideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, hideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, onDismiss]);

  if (!isVisible || crisisLevel === 'none') {
    return null;
  }

  const getMessage = () => {
    switch (crisisLevel) {
      case 'emergency':
        return 'Emergency mode activated. Simplified interface enabled.';
      case 'severe':
        return 'High stress detected. Extra support features enabled.';
      case 'moderate':
        return 'Moderate stress detected. Comfort features activated.';
      case 'mild':
        return 'Mild stress detected. Additional support available.';
      default:
        return '';
    }
  };

  const bannerStyle = {
    backgroundColor: theme.colors.warning,
    color: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: `0 0 20px ${theme.colors.warning}40`,
    animation: crisisLevel === 'emergency' ? 'pulse 2s infinite' : 'none',
    transition: theme.animation.enableTransitions
      ? `all ${theme.animation.duration}ms ease-out`
      : 'none',
  };

  return (
    <div
      className="crisis-alert-banner fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
      style={bannerStyle}
      data-crisis-level={crisisLevel}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">{getMessage()}</span>
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="ml-2 text-white hover:text-gray-200 dark:text-gray-700 transition-colors"
          >
            ×
          </button>
        )}
      </div>
      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <StressAdaptiveButton
              key={index}
              onClick={action.action}
              size="normal"
              urgency={action.urgency}
              className="text-xs py-1 px-2"
            >
              {action.label}
            </StressAdaptiveButton>
          ))}
        </div>
      )}
    </div>
  );
}

export default {
  StressResponsiveContainer,
  StressAdaptiveButton,
  StressResponsiveText,
  StressLevelIndicator,
  StressResponsiveCard,
  CrisisAlertBanner,
};

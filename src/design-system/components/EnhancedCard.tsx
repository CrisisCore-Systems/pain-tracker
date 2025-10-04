/**
 * Enhanced Card Components with Modern Visual Effects
 * Premium card variants with glassmorphism, gradients, and animations
 */

import React from 'react';
import { cn } from '../utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'glow';
  hoverable?: boolean;
  animated?: boolean;
  glowColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export function EnhancedCard({ 
  children, 
  className, 
  variant = 'default',
  hoverable = false,
  animated = false,
  glowColor,
  ...props 
}: EnhancedCardProps) {
  const variantClasses = {
    default: 'bg-card border border-border shadow-md',
    glass: 'backdrop-blur-xl bg-card/50 border border-white/20 dark:border-gray-800/50 shadow-xl',
    gradient: 'bg-gradient-to-br from-card via-card/95 to-primary/5 border border-border/50 shadow-lg',
    elevated: 'bg-card border border-border shadow-2xl shadow-black/10',
    glow: cn(
      'bg-card border border-border shadow-xl',
      glowColor === 'primary' && 'shadow-blue-500/20 border-blue-500/30',
      glowColor === 'success' && 'shadow-emerald-500/20 border-emerald-500/30',
      glowColor === 'warning' && 'shadow-amber-500/20 border-amber-500/30',
      glowColor === 'danger' && 'shadow-red-500/20 border-red-500/30'
    ),
  };

  const hoverClasses = hoverable
    ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'
    : '';

  const animationClasses = animated
    ? 'animate-[fadeInUp_0.5s_ease-out]'
    : '';

  return (
    <div
      className={cn(
        'rounded-lg p-6',
        variantClasses[variant],
        hoverClasses,
        animationClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function EnhancedCardHeader({ 
  children, 
  className, 
  icon, 
  badge,
  ...props 
}: EnhancedCardHeaderProps) {
  return (
    <div 
      className={cn('flex items-center justify-between mb-4', className)} 
      {...props}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}

interface EnhancedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export function EnhancedCardTitle({ 
  children, 
  className, 
  gradient = false,
  ...props 
}: EnhancedCardTitleProps) {
  return (
    <h3 
      className={cn(
        'text-lg font-semibold tracking-tight',
        gradient && 'bg-gradient-to-r from-foreground to-primary/90 bg-clip-text text-transparent',
        !gradient && 'text-foreground',
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  );
}

interface EnhancedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function EnhancedCardDescription({ 
  children, 
  className, 
  ...props 
}: EnhancedCardDescriptionProps) {
  return (
    <p 
      className={cn('text-sm text-muted-foreground mt-1', className)} 
      {...props}
    >
      {children}
    </p>
  );
}

interface EnhancedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function EnhancedCardContent({ 
  children, 
  className, 
  ...props 
}: EnhancedCardContentProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

interface EnhancedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function EnhancedCardFooter({ 
  children, 
  className, 
  ...props 
}: EnhancedCardFooterProps) {
  return (
    <div 
      className={cn(
        'mt-6 pt-4 border-t border-border/50 flex items-center justify-between',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Metric Card - Special card for displaying statistics
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  variant = 'default'
}: MetricCardProps) {
  const variantColors = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <EnhancedCard variant="glass" hoverable animated className="group">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground transition-transform group-hover:scale-110">
            {value}
          </p>
          {change && (
            <p className={cn('text-xs font-medium', trendColors[trend])}>
              {change.value > 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex items-center justify-center w-16 h-16 rounded-full transition-transform group-hover:scale-110 group-hover:rotate-6',
            variantColors[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </EnhancedCard>
  );
}

// Action Card - Card with prominent call-to-action
interface ActionCardProps {
  title: string;
  description: string;
  action: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function ActionCard({ 
  title, 
  description, 
  action, 
  icon,
  variant = 'primary' 
}: ActionCardProps) {
  return (
    <EnhancedCard 
      variant="gradient" 
      hoverable 
      animated
      className="group cursor-pointer"
      onClick={action.onClick}
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
          <div className="mt-4">
            <span className={cn(
              'inline-flex items-center text-sm font-medium transition-colors',
              variant === 'primary' && 'text-primary group-hover:text-primary/80',
              variant === 'secondary' && 'text-foreground group-hover:text-muted-foreground'
            )}>
              {action.label}
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
}

/**
 * Page Transition Wrapper Component
 * Provides smooth animations when switching between pages/views
 */

import React, { useEffect, useState } from 'react';
import { cn } from '../utils';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number; // in milliseconds
  className?: string;
  onTransitionEnd?: () => void;
}

export function PageTransition({
  children,
  type = 'fade',
  duration = 300,
  className,
  onTransitionEnd,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Small delay to ensure CSS transition triggers

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible && onTransitionEnd) {
      const timer = setTimeout(onTransitionEnd, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onTransitionEnd]);

  const transitionClasses = {
    fade: {
      enter: 'opacity-0',
      enterActive: 'opacity-100',
      exit: 'opacity-100',
      exitActive: 'opacity-0',
    },
    slide: {
      enter: 'opacity-0 translate-x-8',
      enterActive: 'opacity-100 translate-x-0',
      exit: 'opacity-100 translate-x-0',
      exitActive: 'opacity-0 -translate-x-8',
    },
    scale: {
      enter: 'opacity-0 scale-95',
      enterActive: 'opacity-100 scale-100',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-95',
    },
    slideUp: {
      enter: 'opacity-0 translate-y-8',
      enterActive: 'opacity-100 translate-y-0',
      exit: 'opacity-100 translate-y-0',
      exitActive: 'opacity-0 -translate-y-8',
    },
    slideDown: {
      enter: 'opacity-0 -translate-y-8',
      enterActive: 'opacity-100 translate-y-0',
      exit: 'opacity-100 translate-y-0',
      exitActive: 'opacity-0 translate-y-8',
    },
    none: {
      enter: '',
      enterActive: '',
      exit: '',
      exitActive: '',
    },
  };

  const transitions = transitionClasses[type];
  const currentClass = isExiting
    ? transitions.exitActive
    : isVisible
      ? transitions.enterActive
      : transitions.enter;

  return (
    <div
      className={cn('transition-all', currentClass, className)}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// View Switcher with Transitions
interface ViewSwitcherProps<T extends string> {
  activeView: T;
  views: Record<T, React.ReactNode>;
  transitionType?: TransitionType;
  duration?: number;
  className?: string;
}

export function ViewSwitcher<T extends string>({
  activeView,
  views,
  transitionType = 'fade',
  duration = 300,
  className,
}: ViewSwitcherProps<T>) {
  const [currentView, setCurrentView] = useState(activeView);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (activeView !== currentView) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentView(activeView);
        setIsTransitioning(false);
      }, duration / 2);
      return () => clearTimeout(timer);
    }
  }, [activeView, currentView, duration]);

  return (
    <PageTransition
      type={transitionType}
      duration={duration}
      className={className}
      key={currentView}
    >
      {views[currentView]}
    </PageTransition>
  );
}

// Staggered Children Animation
interface StaggeredChildrenProps {
  children: React.ReactNode;
  delay?: number; // delay between each child in milliseconds
  className?: string;
}

export function StaggeredChildren({ children, delay = 50, className }: StaggeredChildrenProps) {
  return (
    <div
      className={cn('stagger-children', className)}
      style={{ '--stagger-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Route Transition Wrapper
interface RouteTransitionProps {
  children: React.ReactNode;
  location: string; // Unique identifier for the current route/view
  type?: TransitionType;
  duration?: number;
}

export function RouteTransition({
  children,
  location,
  type = 'slideUp',
  duration = 300,
}: RouteTransitionProps) {
  return (
    <PageTransition key={location} type={type} duration={duration}>
      {children}
    </PageTransition>
  );
}

// Fade In/Out Component
interface FadeProps {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function Fade({ show, children, duration = 300, className }: FadeProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn('transition-opacity', show ? 'opacity-100' : 'opacity-0', className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Slide In/Out Component
interface SlideProps {
  show: boolean;
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  className?: string;
}

export function Slide({ show, children, direction = 'up', duration = 300, className }: SlideProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const directionClasses = {
    up: show ? 'translate-y-0' : 'translate-y-full',
    down: show ? 'translate-y-0' : '-translate-y-full',
    left: show ? 'translate-x-0' : '-translate-x-full',
    right: show ? 'translate-x-0' : 'translate-x-full',
  };

  return (
    <div
      className={cn(
        'transition-all',
        show ? 'opacity-100' : 'opacity-0',
        directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Scale In/Out Component
interface ScaleProps {
  show: boolean;
  children: React.ReactNode;
  origin?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  duration?: number;
  className?: string;
}

export function Scale({
  show,
  children,
  origin = 'center',
  duration = 300,
  className,
}: ScaleProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const originClasses = {
    center: 'origin-center',
    top: 'origin-top',
    bottom: 'origin-bottom',
    left: 'origin-left',
    right: 'origin-right',
  };

  return (
    <div
      className={cn(
        'transition-all',
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        originClasses[origin],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

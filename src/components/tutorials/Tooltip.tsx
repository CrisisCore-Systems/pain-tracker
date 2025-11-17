/**
 * Tooltip - Accessible tooltip component for contextual help
 */

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const placementClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-popover',
    bottom:
      'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-popover',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-popover',
    right:
      'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-popover',
  };

  const handleShow = () => {
    if (!isDismissed) {
      setIsVisible(true);
    }
  };

  const handleHide = () => {
    setIsVisible(false);
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleHide();
      triggerRef.current?.focus();
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleHide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  const triggerProps = {
    hover: {
      onMouseEnter: handleShow,
      onMouseLeave: handleHide,
      onFocus: handleShow,
      onBlur: handleHide,
    },
    click: {
      onClick: handleToggle,
    },
    focus: {
      onFocus: handleShow,
      onBlur: handleHide,
    },
  };

  if (isDismissed) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        className="inline-flex items-center justify-center p-1 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-describedby={isVisible ? 'tooltip' : undefined}
        aria-expanded={isVisible}
        {...triggerProps[trigger]}
      >
        {children || <HelpCircle className="h-4 w-4 text-muted-foreground" />}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`absolute z-50 ${placementClasses[placement]}`}
          onKeyDown={handleKeyDown}
        >
          <div className="bg-popover text-popover-foreground border rounded-md shadow-lg p-3 max-w-xs">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{content}</p>
              {trigger === 'click' && (
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss tooltip"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[placement]}`} />
        </div>
      )}
    </div>
  );
}

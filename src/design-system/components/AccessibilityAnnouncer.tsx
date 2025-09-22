import React from 'react';

/**
 * Accessibility announcement component for screen readers
 */
export interface AccessibilityAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export function AccessibilityAnnouncer({
  message,
  politeness = 'polite',
  'aria-live': ariaLive,
}: AccessibilityAnnouncerProps) {
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={liveRegionRef}
      aria-live={ariaLive || politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
}

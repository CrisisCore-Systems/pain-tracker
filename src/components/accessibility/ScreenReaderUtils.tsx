import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({ 
  message, 
  priority = 'polite',
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && ref.current) {
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = message;
          // Clear after a short delay to allow re-announcement of the same message
          setTimeout(() => {
            if (ref.current) {
              ref.current.textContent = '';
            }
          }, 1000);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message, delay]);

  return (
    <div
      ref={ref}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
};

// Hook for programmatic announcements
export const useScreenReader = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const AnnouncementElement = () => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, AnnouncementElement };
};

// Skip Link Component with Mobile Optimization
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
    >
      {children}
    </a>
  );
};

// Visually Hidden Component (for screen readers only)
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

// Enhanced Button with Screen Reader Support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  describedBy?: string;
  loadingText?: string;
  isLoading?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  describedBy,
  loadingText = 'Loading',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-describedby={describedBy}
      aria-busy={isLoading}
      className={`
        ${className}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        ${disabled && !isLoading ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      {isLoading ? (
        <>
          <VisuallyHidden>{loadingText}</VisuallyHidden>
          <span aria-hidden="true">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Enhanced Form Field with Accessibility
interface AccessibleFieldProps {
  label: string;
  id: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  id,
  error,
  description,
  required = false,
  children
}) => {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <label 
        htmlFor={id}
        className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700 dark:text-gray-300'}`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': ariaDescribedBy || undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required,
          className: `${(children as React.ReactElement).props.className || ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

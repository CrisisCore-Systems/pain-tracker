/**
 * LoadingSpinner - Animated loading component with screen reader support
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Custom loading message for screen readers */
  loadingText?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  loadingText = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={loadingText}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{loadingText}</span>
    </div>
  );
}

/**
 * LoadingComplete - Announces loading completion to screen readers
 * Use this component when loading finishes to announce success
 */
export function LoadingComplete({ 
  message = 'Content loaded successfully' 
}: { 
  message?: string 
}) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="sr-only"
    >
      {message}
    </div>
  );
}

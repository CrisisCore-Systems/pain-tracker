/**
 * Enhanced Input Component
 * Modern input component with consistent styling and improved accessibility
 */

import React from 'react';
import { cn } from '../utils';
import { Eye, EyeOff } from 'lucide-react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  mobileOptimized?: boolean;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autoComplete?: string;
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  autoCorrect?: 'off' | 'on';
  spellCheck?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    fullWidth = false,
    variant = 'default',
    mobileOptimized = true,
    inputMode,
    autoComplete,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    id,
    required,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputId] = React.useState(id || `input-${Math.random().toString(36).substr(2, 9)}`);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (type === 'password' && showPassword) {
        setInputType('text');
      } else {
        setInputType(type);
      }
    }, [type, showPassword]);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    // Mobile-specific input attributes
    const getMobileAttributes = () => {
      if (!mobileOptimized) return {};

      const baseAttributes: Record<string, any> = {
        // Prevent zoom on iOS
        style: { fontSize: '16px' },
        // Better touch targets
        'data-mobile-optimized': 'true',
      };

      // Input mode for better keyboard
      if (inputMode) {
        baseAttributes.inputMode = inputMode;
      } else if (type === 'number') {
        baseAttributes.inputMode = 'decimal';
      } else if (type === 'email') {
        baseAttributes.inputMode = 'email';
      } else if (type === 'tel') {
        baseAttributes.inputMode = 'tel';
      } else if (type === 'url') {
        baseAttributes.inputMode = 'url';
      }

      // Autocomplete attributes
      if (autoComplete) {
        baseAttributes.autoComplete = autoComplete;
      }

      // Text input attributes
      if (autoCapitalize) {
        baseAttributes.autoCapitalize = autoCapitalize;
      }
      if (autoCorrect !== undefined) {
        baseAttributes.autoCorrect = autoCorrect;
      }
      if (spellCheck !== undefined) {
        baseAttributes.spellCheck = spellCheck;
      }

      return baseAttributes;
    };

    const mobileAttributes = getMobileAttributes();

    const baseInputClasses = cn(
  'flex h-12 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  variant === 'filled' && 'bg-muted/50 border-muted',
  variant === 'outlined' && 'border-2',
  error && 'border-red-500 focus:ring-red-500 focus-visible:ring-red-500',
  startIcon && 'pl-12',
  (endIcon || type === 'password') && 'pr-12',
  fullWidth && 'w-full',
  mobileOptimized && 'mobile-keyboard-optimized touch-manipulation'
    );

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', mobileOptimized && 'mobile-form-spacing')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            type={inputType}
            className={cn(baseInputClasses, className)}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` :
              helperText ? `${inputId}-helper` :
              undefined
            }
            {...mobileAttributes}
            {...props}
          />

          {type === 'password' && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {endIcon && type !== 'password' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
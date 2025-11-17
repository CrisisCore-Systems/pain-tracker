/**
 * FormField - Enhanced form field with validation, animations, and accessibility
 */

import { useState, useId, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../design-system';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search';
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  success?: boolean;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showPasswordToggle?: boolean;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  success,
  hint,
  required,
  disabled,
  placeholder,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  className = '',
  inputClassName = '',
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const hasValue = String(value).length > 0;
  const actualType = type === 'password' && showPassword ? 'text' : type;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const getInputClasses = () => {
    let classes = 'peer w-full transition-all duration-200 ';

    if (error) {
      classes += 'border-red-500 focus:border-red-500 focus:ring-red-500/20 ';
    } else if (success) {
      classes += 'border-green-500 focus:border-green-500 focus:ring-green-500/20 ';
    } else {
      classes += 'border-input focus:border-primary focus:ring-primary/20 ';
    }

    if (leftIcon) classes += 'pl-10 ';
    if (rightIcon || showPasswordToggle || error || success) classes += 'pr-10 ';

    return classes + inputClassName;
  };

  const getLabelClasses = () => {
    let classes = 'absolute left-3 transition-all duration-200 pointer-events-none ';

    if (focused || hasValue) {
      classes += 'top-0 -translate-y-1/2 text-xs bg-background px-2 ';
      if (error) {
        classes += 'text-red-600 ';
      } else if (focused) {
        classes += 'text-primary ';
      } else {
        classes += 'text-muted-foreground ';
      }
    } else {
      classes += 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground ';
    }

    if (leftIcon && !focused && !hasValue) {
      classes += 'left-10 ';
    }

    return classes;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <Input
          id={id}
          type={actualType}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={focused ? placeholder : ''}
          className={getInputClasses()}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim()}
          aria-invalid={!!error}
          aria-required={required}
        />

        {/* Animated label */}
        <label htmlFor={id} className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Right icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {/* Password toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {/* Validation icons */}
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
          {success && !error && <CheckCircle className="h-4 w-4 text-green-500" />}

          {/* Custom right icon */}
          {rightIcon && !error && !success && (
            <div className="text-muted-foreground">{rightIcon}</div>
          )}
        </div>
      </div>

      {/* Help text */}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={errorId} className="text-xs text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

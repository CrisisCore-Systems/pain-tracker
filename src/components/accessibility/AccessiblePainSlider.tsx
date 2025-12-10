import React, { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '../../design-system/utils';

/**
 * Accessible Pain Slider - WCAG 2.2 AA Compliant
 * 
 * Features:
 * - Full keyboard navigation (Arrow keys, Home, End, Page Up/Down)
 * - ARIA labels with descriptive pain level text
 * - Touch-optimized with large tap targets (≥56px)
 * - Visual and haptic feedback
 * - Screen reader announcements
 * - High contrast mode support
 * - Direct numeric input option
 */

const PAIN_LABELS: Record<number, string> = {
  0: 'No pain',
  1: 'Barely noticeable',
  2: 'Minor discomfort',
  3: 'Noticeable pain',
  4: 'Moderate pain',
  5: 'Moderately severe',
  6: 'Severe pain',
  7: 'Very severe',
  8: 'Intense pain',
  9: 'Unbearable',
  10: 'Worst possible',
};

const PAIN_COLORS: Record<number, string> = {
  0: 'bg-emerald-500',
  1: 'bg-emerald-400',
  2: 'bg-lime-400',
  3: 'bg-yellow-400',
  4: 'bg-amber-400',
  5: 'bg-orange-400',
  6: 'bg-orange-500',
  7: 'bg-red-400',
  8: 'bg-red-500',
  9: 'bg-red-600',
  10: 'bg-red-700',
};

interface AccessiblePainSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  id?: string;
  disabled?: boolean;
  showDirectInput?: boolean;
  className?: string;
}

export function AccessiblePainSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label = 'Pain intensity',
  id = 'pain-slider',
  disabled = false,
  showDirectInput = true,
  className,
}: AccessiblePainSliderProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [announcement, setAnnouncement] = useState('');
  const sliderRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with slider value
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  // Handle slider change
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onChange(newValue);
      triggerHaptic();
      setAnnouncement(`Pain level: ${newValue} out of ${max}, ${PAIN_LABELS[newValue]}`);
    },
    [onChange, max, triggerHaptic]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let newValue = value;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(value + step, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(value - step, min);
          break;
        case 'PageUp':
          newValue = Math.min(value + 2, max);
          break;
        case 'PageDown':
          newValue = Math.max(value - 2, min);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      onChange(newValue);
      triggerHaptic();
      setAnnouncement(`Pain level: ${newValue} out of ${max}, ${PAIN_LABELS[newValue]}`);
    },
    [value, step, min, max, onChange, triggerHaptic]
  );

  // Handle direct numeric input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
      setAnnouncement(`Pain level set to ${numValue}, ${PAIN_LABELS[numValue]}`);
    } else {
      setInputValue(value.toString());
    }
    setShowInput(false);
  }, [inputValue, min, max, onChange, value]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      } else if (e.key === 'Escape') {
        setInputValue(value.toString());
        setShowInput(false);
        sliderRef.current?.focus();
      }
    },
    [handleInputBlur, value]
  );

  // Stepper buttons for fine control
  const handleDecrement = useCallback(() => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    triggerHaptic();
    setAnnouncement(`Pain level: ${newValue}, ${PAIN_LABELS[newValue]}`);
  }, [value, step, min, onChange, triggerHaptic]);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    triggerHaptic();
    setAnnouncement(`Pain level: ${newValue}, ${PAIN_LABELS[newValue]}`);
  }, [value, step, max, onChange, triggerHaptic]);

  const painLabel = PAIN_LABELS[value] || `Level ${value}`;
  const painColor = PAIN_COLORS[value] || 'bg-gray-500';
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Label and current value */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-200"
        >
          {label}
        </label>
        {showDirectInput ? (
          showInput ? (
            <input
              ref={inputRef}
              type="number"
              min={min}
              max={max}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-16 px-2 py-1 text-center text-lg font-bold bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={`${label}, enter value between ${min} and ${max}`}
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setShowInput(true);
                setTimeout(() => inputRef.current?.select(), 0);
              }}
              className={cn(
                'min-w-[60px] px-3 py-1 text-lg font-bold rounded-lg',
                'bg-slate-800 border border-slate-600',
                'hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500',
                'transition-colors duration-200'
              )}
              aria-label={`Current pain level: ${value}. Click to enter a specific value.`}
            >
              {value}
            </button>
          )
        ) : (
          <span className="text-2xl font-bold text-slate-200">{value}</span>
        )}
      </div>

      {/* Slider with stepper buttons */}
      <div className="flex items-center gap-3">
        {/* Decrement button */}
        <button
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            'w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl',
            'flex items-center justify-center',
            'bg-slate-800 border border-slate-600',
            'text-2xl font-bold text-slate-300',
            'hover:bg-slate-700 hover:border-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          aria-label={`Decrease ${label} by ${step}`}
        >
          −
        </button>

        {/* Slider track */}
        <div className="flex-1 relative">
          <input
            ref={sliderRef}
            type="range"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'w-full h-3 appearance-none rounded-full cursor-pointer',
              'bg-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:shadow-lg',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-white',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:shadow-lg',
              '[&::-moz-range-thumb]:cursor-pointer'
            )}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value} of ${max}, ${painLabel}`}
          />
          
          {/* Progress fill */}
          <div
            className={cn(
              'absolute top-0 left-0 h-3 rounded-full pointer-events-none',
              'transition-all duration-150',
              painColor
            )}
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Increment button */}
        <button
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(
            'w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl',
            'flex items-center justify-center',
            'bg-slate-800 border border-slate-600',
            'text-2xl font-bold text-slate-300',
            'hover:bg-slate-700 hover:border-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          aria-label={`Increase ${label} by ${step}`}
        >
          +
        </button>
      </div>

      {/* Pain level description */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{PAIN_LABELS[min]}</span>
        <span className={cn('font-medium px-3 py-1 rounded-full', painColor, 'text-white')}>
          {painLabel}
        </span>
        <span className="text-slate-400">{PAIN_LABELS[max]}</span>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-500" id={`${id}-hint`}>
        Use arrow keys to adjust. Press Home for minimum, End for maximum.
      </p>
    </div>
  );
}

export default AccessiblePainSlider;

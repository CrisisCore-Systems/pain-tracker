import { useState, useRef, useCallback, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface TouchOptimizedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

export function TouchOptimizedSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  showValue = true,
  hapticFeedback = true,
  className = '',
}: TouchOptimizedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartValue, setTouchStartValue] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
  }, [hapticFeedback]);

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return value;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step, value]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setTouchStartValue(value);
      triggerHaptic();
    },
    [value, triggerHaptic]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const newValue = getValueFromPosition(e.touches[0].clientX);

      if (newValue !== value) {
        onChange(newValue);
        if (Math.abs(newValue - touchStartValue) >= step) {
          triggerHaptic();
        }
      }
    },
    [isDragging, value, onChange, getValueFromPosition, touchStartValue, step, triggerHaptic]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setTouchStartValue(value);

      const newValue = getValueFromPosition(e.clientX);
      if (newValue !== value) {
        onChange(newValue);
        triggerHaptic();
      }
    },
    [value, onChange, getValueFromPosition, triggerHaptic]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(e.clientX);
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [isDragging, value, onChange, getValueFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      onChange(newValue);
      triggerHaptic();
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      onChange(newValue);
      triggerHaptic();
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`touch-optimized-slider ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {showValue && <span className="text-lg font-bold text-primary">{value}</span>}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Decrease value"
        >
          <Minus className="h-5 w-5" />
        </button>

        {/* Slider Track */}
        <div ref={sliderRef} className="flex-1 relative h-12 flex items-center touch-manipulation">
          <div
            ref={trackRef}
            className="w-full h-3 bg-muted rounded-full relative cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            {/* Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />

            {/* Thumb */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary border-2 border-background rounded-full shadow-lg cursor-pointer transition-all duration-150 ${
                isDragging ? 'scale-125 shadow-xl' : 'hover:scale-110'
              }`}
              style={{ left: `calc(${percentage}% - 12px)` }}
            />

            {/* Touch Target Enhancement */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full opacity-0"
              style={{ left: `calc(${percentage}% - 24px)` }}
            />
          </div>

          {/* Tick Marks */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(tickValue => (
              <div
                key={tickValue}
                className={`w-0.5 h-2 ${
                  tickValue <= value ? 'bg-primary' : 'bg-muted-foreground/30'
                } rounded-full`}
              />
            ))}
          </div>
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Increase value"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Value Display on Mobile */}
      {showValue && (
        <div className="mt-2 text-center sm:hidden">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {max}</span>
        </div>
      )}
    </div>
  );
}

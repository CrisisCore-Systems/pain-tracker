/**
 * Enhanced Button Component
 * Modern button component with multiple variants, sizes, and improved accessibility
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-[0.98] select-none touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:bg-destructive/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/50',
        link: 'underline-offset-4 hover:underline text-primary shadow-none hover:shadow-none active:text-primary/80',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md active:bg-success/80',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md active:bg-warning/80',
        gradient: 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl active:from-primary/80 active:to-accent/80',
      },
      size: {
        xs: 'h-8 px-2 text-xs rounded-md min-h-[32px] min-w-[32px]',
        sm: 'h-9 px-3 text-xs rounded-md min-h-[36px] min-w-[36px]',
        default: 'h-12 py-2 px-4 min-h-[44px] min-w-[44px]',
  lg: 'h-12 px-6 text-base rounded-lg min-h-[48px] min-w-[48px]',
        xl: 'h-16 px-8 text-lg rounded-xl min-h-[56px] min-w-[56px]',
        icon: 'h-12 w-12 min-h-[44px] min-w-[44px]',
        'icon-sm': 'h-9 w-9 min-h-[36px] min-w-[36px]',
        'icon-lg': 'h-14 w-14 min-h-[48px] min-w-[48px]',
      },
      shape: {
        default: '',
        square: 'rounded-none',
        pill: 'rounded-full',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  longPress?: boolean;
  onLongPress?: () => void;
  longPressDelay?: number;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    shape,
    type = 'button',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    hapticFeedback = true,
    longPress = false,
    onLongPress,
    longPressDelay = 500,
    ripple = true,
    disabled,
    onClick,
    onTouchStart,
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const longPressTimerRef = React.useRef<NodeJS.Timeout>();
    const [isPressed, setIsPressed] = React.useState(false);
    const [isLongPressing, setIsLongPressing] = React.useState(false);
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    // Haptic feedback function
    const triggerHapticFeedback = React.useCallback(() => {
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, [hapticFeedback]);

    // Touch event handlers
    const handleTouchStart = React.useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      
      setIsPressed(true);
      onTouchStart?.(e);
      
      if (longPress && onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPressing(true);
          triggerHapticFeedback();
          onLongPress();
        }, longPressDelay);
      }
    }, [isDisabled, longPress, onLongPress, longPressDelay, onTouchStart, triggerHapticFeedback]);

    const handleTouchEnd = React.useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      setIsLongPressing(false);
      onTouchEnd?.(e);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }, [onTouchEnd]);

    // Mouse event handlers (for desktop testing)
    const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      
      setIsPressed(true);
      onMouseDown?.(e);
      
      if (longPress && onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPressing(true);
          onLongPress();
        }, longPressDelay);
      }
    }, [isDisabled, longPress, onLongPress, longPressDelay, onMouseDown]);

    const handleMouseUp = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      setIsLongPressing(false);
      onMouseUp?.(e);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }, [onMouseUp]);

    // Click handler with haptic feedback
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || isLongPressing) return;
      
      // Add ripple effect
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { x, y, id }]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
      }
      
      triggerHapticFeedback();
      onClick?.(e);
    }, [isDisabled, isLongPressing, ripple, triggerHapticFeedback, onClick]);

    // Cleanup timer on unmount
    React.useEffect(() => {
      return () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
      };
    }, []);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, shape, className }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          isPressed && 'scale-95',
          isLongPressing && 'ring-2 ring-primary ring-opacity-50',
          ripple && 'relative overflow-hidden',
          'touch-manipulation select-none'
        )}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-pressed={isPressed}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {/* Ripple effects */}
        {ripple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={cn(
          'flex items-center justify-center',
          loading && 'opacity-70'
        )}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
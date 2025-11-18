/**
 * Loading Component
 * Modern loading component with multiple variants and sizes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';

const loadingVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, text, fullScreen = false, overlay = false, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          overlay && 'absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-lg',
          className
        )}
        {...props}
      >
        <Loader2 className={cn(loadingVariants({ size, variant }))} />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    );

    if (fullScreen || overlay) {
      return content;
    }

    return <div className="flex items-center justify-center p-4">{content}</div>;
  }
);
Loading.displayName = 'Loading';

const LoadingDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex space-x-1', className)} {...props}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
    </div>
  )
);
LoadingDots.displayName = 'LoadingDots';

const LoadingSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    lines?: number;
    height?: string;
  }
>(({ className, lines = 1, height = 'h-4', ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-muted animate-pulse rounded',
          height,
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

export { Loading, LoadingDots, LoadingSkeleton, loadingVariants };

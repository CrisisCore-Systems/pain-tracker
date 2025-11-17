/**
 * Badge Component
 * Modern badge component with multiple variants and sizes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { X } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        info: 'border-transparent bg-info text-info-foreground hover:bg-info/80',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, removable = false, onRemove, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        <span className="flex items-center">
          {children}
          {removable && onRemove && (
            <button
              onClick={onRemove}
              className="ml-1 rounded-full hover:bg-black/10 p-0.5 -mr-1"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

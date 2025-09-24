/**
 * Enhanced Card Component
 * Modern card component with consistent styling and multiple variants
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-md transition-all duration-200',
  {
    variants: {
      variant: {
        // default now includes a subtle border for clearer separation
        default: 'border-border',
        elevated: 'shadow-2xl hover:shadow-2xl/80',
        outlined: 'border-2 shadow-none',
        filled: 'bg-muted/50 border-muted',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'bg-gradient-to-br from-card to-muted/50 border-muted/50',
        // accented provides a stronger border and depth for emphasis
        accented: 'border-2 border-primary/40 shadow-2xl hover:shadow-2xl/80',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1.5 hover:shadow-2xl/70',
        glow: 'hover:shadow-2xl hover:shadow-primary/15',
        scale: 'hover:scale-[1.02] hover:shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      hover: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Optional severity indicator for color-coding cards */
  severity?: 'low' | 'medium' | 'high' | 'critical' | null;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, hover, className }))} {...props}>
      {/* severity indicator: small colored bar at the top-left */}
      {('severity' in props) && props.severity ? (
        <div
          aria-hidden
          className={cn(
            'absolute -top-2 -left-2 h-2 w-12 rounded-b-md',
            props.severity === 'low' && 'bg-emerald-400',
            props.severity === 'medium' && 'bg-amber-400',
            props.severity === 'high' && 'bg-orange-500',
            props.severity === 'critical' && 'bg-red-600'
          )}
        />
      ) : null}
      {props.children}
    </div>
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between space-x-3 pb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// New Card variants for specific use cases
const CardAction = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}
      {...props}
    />
  )
);
CardAction.displayName = 'CardAction';

const CardStats = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      className={cn('text-center', className)}
      {...props}
    >
      {children}
    </Card>
  )
);
CardStats.displayName = 'CardStats';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardStats,
  cardVariants
};
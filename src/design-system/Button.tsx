import React from 'react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'outline'
  | 'default'
  | 'success'
  | 'warning'
  | 'gradient';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** optional leading icon */
  leftIcon?: React.ReactNode;
  /** optional trailing icon */
  rightIcon?: React.ReactNode;
  /** size controls height and padding; default ensures 44px touch target */
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

// Keep layout/interaction classes in variants but move colors to runtime styles
const variants: Record<Variant, string> = {
  primary: '',
  secondary: 'border',
  ghost: '',
  destructive: '',
  outline: 'border',
  default: '',
  success: '',
  warning: '',
  gradient: '',
};

// Runtime color styles using CSS custom properties defined in src/index.css
const colorStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'rgb(var(--color-primary))',
    color: 'rgb(var(--color-primary-foreground))',
  },
  secondary: {
    backgroundColor: 'rgb(var(--color-card))',
    color: 'rgb(var(--color-card-foreground))',
    borderColor: 'rgb(var(--color-border))',
  },
  ghost: { backgroundColor: 'transparent', color: 'rgb(var(--color-primary))' },
  destructive: {
    backgroundColor: 'rgb(var(--color-destructive))',
    color: 'rgb(var(--color-destructive-foreground))',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'rgb(var(--color-foreground))',
    borderColor: 'rgb(var(--color-border))',
  },
  default: {
    backgroundColor: 'rgb(var(--color-primary))',
    color: 'rgb(var(--color-primary-foreground))',
  },
  success: {
    backgroundColor: 'rgb(var(--color-secondary))',
    color: 'rgb(var(--color-secondary-foreground))',
  },
  warning: {
    backgroundColor: 'rgb(var(--color-accent))',
    color: 'rgb(var(--color-accent-foreground))',
  },
  gradient: {
    background: 'linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-accent)))',
    color: 'rgb(var(--color-primary-foreground))',
  },
};

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm', // h-11 ≈ 44px touch target
  lg: 'h-12 px-5 text-base',
};

// export variants so other tooling or docs can reference them
export const buttonVariants = variants;

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      className = '',
      children,
      disabled,
      leftIcon,
      rightIcon,
      ...rest
    },
    ref
  ) => {
    const classes = `${base} ${variants[variant]} ${sizes[size]} min-w-[44px] ${className}`.trim();

    const style: React.CSSProperties = { ...(colorStyles[variant] || {}), ...rest.style };

    return (
      <button
        ref={ref}
        className={classes}
        style={style}
        disabled={disabled}
        // assistive tech: make disabled state explicit
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

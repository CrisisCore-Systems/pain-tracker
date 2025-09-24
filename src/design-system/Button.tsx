import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** size controls height and padding; default ensures 44px touch target */
  size?: 'sm' | 'md' | 'lg';
}

const base = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-indigo-500',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm', // h-11 ≈ 44px touch target
  lg: 'h-12 px-5 text-base',
};

// export variants so other tooling or docs can reference them
export const buttonVariants = variants;

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...rest }, ref) => {
    const classes = `${base} ${variants[variant]} ${sizes[size]} min-w-[44px] ${className}`.trim();

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        // assistive tech: make disabled state explicit
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

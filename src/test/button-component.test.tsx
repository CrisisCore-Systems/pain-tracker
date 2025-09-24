import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../design-system/components/Button';

// Simple mapping to assert variant classname presence
type VariantName = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
const variantExpectations: Array<{ variant: VariantName; contains: string }> = [
  { variant: 'default', contains: 'bg-primary' },
  { variant: 'destructive', contains: 'bg-destructive' },
  { variant: 'outline', contains: 'border' },
  { variant: 'secondary', contains: 'bg-secondary' },
  { variant: 'ghost', contains: 'hover:bg-accent' },
  { variant: 'link', contains: 'underline' },
];

describe('Button component', () => {
  it('renders default button', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('applies size classes', () => {
    render(<Button size="lg">Big</Button>);
    const btn = screen.getByRole('button', { name: 'Big' });
    // design-system defines lg size as h-12
    expect(btn.className).toMatch(/h-12/);
  });

  it.each(variantExpectations)('applies $variant variant style', ({ variant, contains }) => {
    render(<Button variant={variant}>Var</Button>);
    const btn = screen.getByRole('button', { name: 'Var' });
    expect(btn.className).toContain(contains);
  });

  it('has focus-visible styling for keyboard navigation', () => {
    render(<Button>Focus Test</Button>);
    const btn = screen.getByRole('button', { name: 'Focus Test' });

    // Check that focus-visible classes are present
    expect(btn.className).toMatch(/focus-visible:ring-2/);
    expect(btn.className).toMatch(/focus-visible:ring-offset-2/);
  });

  it('maintains consistent focus-visible styling across variants', () => {
    const variants: Array<'primary' | 'secondary' | 'ghost' | 'destructive'> = [
      'primary', 'secondary', 'ghost', 'destructive'
    ];

    variants.forEach(variant => {
      const { rerender } = render(<Button variant={variant}>Test {variant}</Button>);
      const btn = screen.getByRole('button', { name: `Test ${variant}` });

      // All variants should have consistent focus-visible behavior
      expect(btn.className).toMatch(/focus-visible:ring/);
      expect(btn.className).toMatch(/focus-visible:ring-offset/);

      // Clean up for next iteration
      rerender(<></>);
    });
  });
});

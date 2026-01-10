import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from '../design-system/components/Button';

// Simple mapping to assert variant classname presence
type VariantName =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'
  | 'gradient';
const variantExpectations: Array<{ variant: VariantName; contains: string }> = [
  { variant: 'default', contains: 'bg-primary' },
  { variant: 'destructive', contains: 'bg-destructive' },
  { variant: 'outline', contains: 'border' },
  { variant: 'secondary', contains: 'bg-secondary' },
  { variant: 'ghost', contains: 'hover:bg-accent' },
  { variant: 'link', contains: 'underline' },
];

describe('Button component', () => {
  const originalVibrate = (navigator as unknown as { vibrate?: unknown }).vibrate;
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    // JSDOM often has a non-function vibrate property; ensure clicks never throw.
    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore vibrate if a test overwrote it
    if (typeof originalVibrate === 'function') {
      Object.defineProperty(navigator, 'vibrate', { value: originalVibrate, configurable: true });
    } else {
      // Best-effort cleanup; OK if delete fails in some environments.
      delete (navigator as unknown as { vibrate?: unknown }).vibrate;
    }
  });

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
    const variants: Array<'default' | 'secondary' | 'ghost' | 'destructive'> = [
      'default',
      'secondary',
      'ghost',
      'destructive',
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

  it('disables interactions and shows spinner when loading', () => {
    const onClick = vi.fn();
    render(
      <Button
        loading
        onClick={onClick}
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Save
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    // Left/right icons should not render during loading
    expect(screen.queryByTestId('left-icon')).toBeNull();
    expect(screen.queryByTestId('right-icon')).toBeNull();
    // Spinner should render
    const spinner = btn.querySelector('svg.animate-spin');
    expect(spinner).not.toBeNull();

    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button', { name: 'Wide' }).className).toContain('w-full');
  });

  it('creates and clears a ripple on click when enabled', () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Ripple</Button>);
    const btn = screen.getByRole('button', { name: 'Ripple' });

    // JSDOM gives 0s by default; we just need deterministic rect values
    Object.defineProperty(btn, 'getBoundingClientRect', {
      value: () => ({ left: 10, top: 10, width: 100, height: 40, right: 110, bottom: 50 }),
    });

    fireEvent.click(btn, { clientX: 20, clientY: 20 });
    expect(onClick).toHaveBeenCalledTimes(1);

    // Ripple span should exist immediately
    expect(container.querySelectorAll('span.animate-ripple').length).toBe(1);

    // After animation timeout, ripple should clear
    act(() => {
      vi.advanceTimersByTime(601);
    });
    expect(container.querySelectorAll('span.animate-ripple').length).toBe(0);
  });

  it('calls haptic feedback (navigator.vibrate) on click when available', () => {
    render(<Button>Tap</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(vibrateMock).toHaveBeenCalledWith(50);
  });

  it('does not call haptic feedback when hapticFeedback is false', () => {
    render(<Button hapticFeedback={false}>No Haptics</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'No Haptics' }));
    expect(vibrateMock).not.toHaveBeenCalled();
  });

  it('invokes optional pointer/touch handlers when provided', () => {
    const onTouchStart = vi.fn();
    const onTouchEnd = vi.fn();
    const onMouseDown = vi.fn();
    const onMouseUp = vi.fn();

    render(
      <Button onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        Handlers
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Handlers' });

    fireEvent.touchStart(btn);
    fireEvent.touchEnd(btn);
    fireEvent.mouseDown(btn);
    fireEvent.mouseUp(btn);

    expect(onTouchStart).toHaveBeenCalledTimes(1);
    expect(onTouchEnd).toHaveBeenCalledTimes(1);
    expect(onMouseDown).toHaveBeenCalledTimes(1);
    expect(onMouseUp).toHaveBeenCalledTimes(1);
  });

  it('does not invoke touch/mouse handlers when disabled', () => {
    const onTouchStart = vi.fn();
    const onMouseDown = vi.fn();

    render(
      <Button disabled onTouchStart={onTouchStart} onMouseDown={onMouseDown}>
        Disabled
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.touchStart(btn);
    fireEvent.mouseDown(btn);

    expect(onTouchStart).not.toHaveBeenCalled();
    expect(onMouseDown).not.toHaveBeenCalled();
  });

  it('calls onMouseDown when enabled and provided', () => {
    const onMouseDown = vi.fn();
    render(<Button onMouseDown={onMouseDown}>Mouse</Button>);
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Mouse' }));
    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });

  it('does not schedule long-press when longPress is true but onLongPress is missing', () => {
    render(
      <Button longPress longPressDelay={10}>
        No Handler
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'No Handler' });

    fireEvent.touchStart(btn);
    act(() => {
      vi.advanceTimersByTime(11);
    });

    // Should not have triggered haptic feedback from the long-press timer.
    expect(vibrateMock).not.toHaveBeenCalled();

    fireEvent.touchEnd(btn);
  });

  it('supports long-press and suppresses click after a long press triggers', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();

    render(
      <Button longPress onLongPress={onLongPress} longPressDelay={10} onClick={onClick}>
        Hold
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Hold' });

    fireEvent.mouseDown(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');

    act(() => {
      vi.advanceTimersByTime(11);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);

    // Now click should be ignored because isLongPressing is true
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.mouseUp(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders left and right icons when not loading', () => {
    render(
      <Button leftIcon={<span data-testid="left">L</span>} rightIcon={<span data-testid="right">R</span>}>
        Icons
      </Button>
    );

    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('does not create ripple spans when ripple is disabled', () => {
    const { container } = render(
      <Button ripple={false} onClick={vi.fn()}>
        No Ripple
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'No Ripple' });

    fireEvent.click(btn, { clientX: 20, clientY: 20 });
    expect(container.querySelectorAll('span.animate-ripple').length).toBe(0);
    expect(btn.className).not.toContain('overflow-hidden');
  });

  it('triggers long-press on touch and cancels if released early', () => {
    const onLongPress = vi.fn();

    const { rerender } = render(
      <Button longPress onLongPress={onLongPress} longPressDelay={50}>
        Touch Hold
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Touch Hold' });
    fireEvent.touchStart(btn);

    // Release early: should cancel timer
    act(() => {
      vi.advanceTimersByTime(25);
    });
    fireEvent.touchEnd(btn);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    // Now hold long enough
    rerender(
      <Button longPress onLongPress={onLongPress} longPressDelay={10}>
        Touch Hold
      </Button>
    );
    const btn2 = screen.getByRole('button', { name: 'Touch Hold' });
    fireEvent.touchStart(btn2);
    act(() => {
      vi.advanceTimersByTime(11);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    // Haptic should have fired as part of long press
    expect(vibrateMock).toHaveBeenCalledWith(50);
    fireEvent.touchEnd(btn2);
  });
});

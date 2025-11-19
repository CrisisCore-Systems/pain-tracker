import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

// Test component that uses the theme
const ThemeConsumer = () => {
  const { mode, colors } = useTheme();
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <div data-testid="theme-background">{colors.background}</div>
    </div>
  );
};

describe('ThemeProvider - Light Mode Enforcement', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Save original matchMedia
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('should always use light mode regardless of system preference', () => {
    // Mock matchMedia to simulate dark mode preference
    window.matchMedia = (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Even with dark mode system preference, should be light
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });

  it('should always use light mode even with high contrast preference', () => {
    // Mock matchMedia to simulate high contrast preference
    window.matchMedia = (query: string) => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });

  it('should set data-theme attribute to light on mount', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should never add dark class to document root', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should provide light theme colors', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const background = screen.getByTestId('theme-background').textContent;
    // Light mode should have a light background color
    expect(background).toBeTruthy();
    expect(background).not.toContain('15 23 42'); // Not dark mode background
  });

  it('should ignore toggleMode calls and stay in light mode', () => {
    const TestComponent = () => {
      const { mode, toggleMode } = useTheme();
      
      return (
        <div>
          <div data-testid="mode">{mode}</div>
          <button onClick={toggleMode} data-testid="toggle">Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const modeBefore = screen.getByTestId('mode').textContent;
    expect(modeBefore).toBe('light');

    // Try to toggle theme
    screen.getByTestId('toggle').click();

    const modeAfter = screen.getByTestId('mode').textContent;
    // Should still be light mode
    expect(modeAfter).toBe('light');
  });

  it('should ignore setMode calls and stay in light mode', () => {
    const TestComponent = () => {
      const { mode, setMode } = useTheme();
      
      return (
        <div>
          <div data-testid="mode">{mode}</div>
          <button onClick={() => setMode('dark')} data-testid="set-dark">Set Dark</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const modeBefore = screen.getByTestId('mode').textContent;
    expect(modeBefore).toBe('light');

    // Try to set dark mode
    screen.getByTestId('set-dark').click();

    const modeAfter = screen.getByTestId('mode').textContent;
    // Should still be light mode
    expect(modeAfter).toBe('light');
  });
});

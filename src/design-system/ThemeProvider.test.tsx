import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ThemeProvider,
  useTheme,
  useThemeMode,
  useIsDark,
  useIsHighContrast,
  useThemeColors,
} from './ThemeProvider';

// Test component that uses the theme
const ThemeConsumer = () => {
  const { mode, colors, isDark, isHighContrast, isTransitioning } = useTheme();
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <div data-testid="theme-background">{colors.background}</div>
      <div data-testid="is-dark">{String(isDark)}</div>
      <div data-testid="is-high-contrast">{String(isHighContrast)}</div>
      <div data-testid="is-transitioning">{String(isTransitioning)}</div>
    </div>
  );
};

// Test component for selector hooks
const SelectorHooksConsumer = () => {
  const mode = useThemeMode();
  const isDark = useIsDark();
  const isHighContrast = useIsHighContrast();
  const colors = useThemeColors();

  return (
    <div>
      <div data-testid="hook-mode">{mode}</div>
      <div data-testid="hook-is-dark">{String(isDark)}</div>
      <div data-testid="hook-is-high-contrast">{String(isHighContrast)}</div>
      <div data-testid="hook-colors">{colors.background}</div>
    </div>
  );
};

describe('ThemeProvider - Dark Mode First Design', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Save original matchMedia
    originalMatchMedia = window.matchMedia;
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
  });

  it('should default to dark mode when no preference is set', () => {
    // Mock matchMedia to simulate no specific preference
    window.matchMedia = (query: string) => ({
      matches: false, // No preference matches
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

    // Should default to dark mode
    expect(screen.getByTestId('theme-mode').textContent).toBe('dark');
  });

  it('should respect system light mode preference', () => {
    // Mock matchMedia to simulate light mode preference
    window.matchMedia = (query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
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

  it('should respect saved theme preference over system preference', () => {
    // Save light mode preference
    localStorage.setItem('pain-tracker:theme-mode', 'light');
    
    // Mock matchMedia to simulate dark mode system preference
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

    // Should use saved preference (light) over system preference (dark)
    expect(screen.getByTestId('theme-mode').textContent).toBe('light');
  });

  it('should set data-theme attribute on mount', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
  });

  it('should add dark class in dark mode', () => {
    // Mock matchMedia - no light preference
    window.matchMedia = (query: string) => ({
      matches: false,
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

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should allow toggling between light and dark mode', () => {
    const TestComponent = () => {
      const { mode, toggleMode } = useTheme();
      
      return (
        <div>
          <div data-testid="mode">{mode}</div>
          <button onClick={toggleMode} data-testid="toggle">Toggle</button>
        </div>
      );
    };

    // Start with dark mode preference saved
    localStorage.setItem('pain-tracker:theme-mode', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const modeBefore = screen.getByTestId('mode').textContent;
    expect(modeBefore).toBe('dark');

    // Toggle theme
    fireEvent.click(screen.getByTestId('toggle'));

    const modeAfter = screen.getByTestId('mode').textContent;
    expect(modeAfter).toBe('light');
  });

  it('should allow setMode to change theme', () => {
    const TestComponent = () => {
      const { mode, setMode } = useTheme();
      
      return (
        <div>
          <div data-testid="mode">{mode}</div>
          <button onClick={() => setMode('light')} data-testid="set-light">Set Light</button>
          <button onClick={() => setMode('dark')} data-testid="set-dark">Set Dark</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Set to light mode
    fireEvent.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('mode').textContent).toBe('light');

    // Set back to dark mode
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('should persist theme preference to localStorage', () => {
    const TestComponent = () => {
      const { setMode } = useTheme();
      
      return (
        <button onClick={() => setMode('light')} data-testid="set-light">Set Light</button>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-light'));
    
    expect(localStorage.getItem('pain-tracker:theme-mode')).toBe('light');
  });

  it('should expose isDark correctly for dark and high-contrast modes', () => {
    const TestComponent = () => {
      const { isDark, setMode } = useTheme();

      return (
        <div>
          <div data-testid="is-dark">{String(isDark)}</div>
          <button onClick={() => setMode('dark')} data-testid="set-dark">
            Dark
          </button>
          <button onClick={() => setMode('light')} data-testid="set-light">
            Light
          </button>
          <button onClick={() => setMode('high-contrast')} data-testid="set-hc">
            High Contrast
          </button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Dark mode - isDark should be true
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('is-dark').textContent).toBe('true');

    // Light mode - isDark should be false
    fireEvent.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('is-dark').textContent).toBe('false');

    // High contrast - isDark should be true (high-contrast is treated as dark)
    fireEvent.click(screen.getByTestId('set-hc'));
    expect(screen.getByTestId('is-dark').textContent).toBe('true');
  });

  it('should expose isHighContrast correctly', () => {
    const TestComponent = () => {
      const { isHighContrast, setMode } = useTheme();

      return (
        <div>
          <div data-testid="is-hc">{String(isHighContrast)}</div>
          <button onClick={() => setMode('high-contrast')} data-testid="set-hc">
            HC
          </button>
          <button onClick={() => setMode('dark')} data-testid="set-dark">
            Dark
          </button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Default - not high contrast
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('is-hc').textContent).toBe('false');

    // Set high contrast
    fireEvent.click(screen.getByTestId('set-hc'));
    expect(screen.getByTestId('is-hc').textContent).toBe('true');
  });

  it('should provide selector hooks that work correctly', () => {
    render(
      <ThemeProvider>
        <SelectorHooksConsumer />
      </ThemeProvider>
    );

    // Verify selector hooks return expected values
    expect(screen.getByTestId('hook-mode')).toBeTruthy();
    expect(screen.getByTestId('hook-is-dark')).toBeTruthy();
    expect(screen.getByTestId('hook-is-high-contrast')).toBeTruthy();
    expect(screen.getByTestId('hook-colors')).toBeTruthy();
  });

  it('should track isTransitioning state during theme changes', async () => {
    vi.useFakeTimers();

    const TestComponent = () => {
      const { isTransitioning, setMode } = useTheme();

      return (
        <div>
          <div data-testid="transitioning">{String(isTransitioning)}</div>
          <button onClick={() => setMode('light')} data-testid="change">
            Change
          </button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially not transitioning
    expect(screen.getByTestId('transitioning').textContent).toBe('false');

    // Trigger theme change
    await act(async () => {
      fireEvent.click(screen.getByTestId('change'));
    });

    // Should be transitioning
    expect(screen.getByTestId('transitioning').textContent).toBe('true');

    // Advance timers past transition duration
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Should no longer be transitioning
    expect(screen.getByTestId('transitioning').textContent).toBe('false');

    vi.useRealTimers();
  });

  it('should throw error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BadComponent = () => {
      useTheme();
      return <div>Should not render</div>;
    };

    expect(() => render(<BadComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );

    consoleSpy.mockRestore();
  });
});

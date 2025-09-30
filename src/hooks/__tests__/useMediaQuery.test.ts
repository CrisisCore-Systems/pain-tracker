/**
 * Tests for useMediaQuery hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery, useBreakpoint, useResponsive, useIsTouchDevice } from '../useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial match state', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when query does not match', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should update when media query changes', async () => {
    let eventHandler: ((event: MediaQueryListEvent) => void) | null = null;
    
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          eventHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);

    // Simulate media query change
    if (eventHandler) {
      eventHandler({ matches: true } as MediaQueryListEvent);
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    const matchMediaMock = vi.fn((query: string) => ({
      matches: query.includes('768px') ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should detect md breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint('md'));
    expect(result.current).toBe(true);
  });

  it('should detect sm breakpoint', () => {
    const matchMediaMock = vi.fn((query: string) => ({
      matches: query.includes('640px') ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useBreakpoint('sm'));
    expect(result.current).toBe(true);
  });
});

describe('useResponsive', () => {
  it('should detect mobile viewport', () => {
    const matchMediaMock = vi.fn((query: string) => ({
      matches: false, // All breakpoints return false = mobile
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect desktop viewport', () => {
    const matchMediaMock = vi.fn((query: string) => ({
      matches: true, // All breakpoints return true = large desktop
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isWidescreen).toBe(true);
  });
});

describe('useIsTouchDevice', () => {
  it('should detect touch device', () => {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: {},
    });

    const { result } = renderHook(() => useIsTouchDevice());
    expect(result.current).toBe(true);
  });

  it('should return boolean value', () => {
    // Just check that it returns a boolean - actual value depends on test environment
    const { result } = renderHook(() => useIsTouchDevice());
    expect(typeof result.current).toBe('boolean');
  });
});

/**
 * Tests for StartupPromptsContext
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StartupPromptsProvider, useStartupPrompts } from '../StartupPromptsContext';

describe('StartupPromptsContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StartupPromptsProvider>{children}</StartupPromptsProvider>
  );

  beforeEach(() => {
    // Reset state between tests
  });

  it('should allow only one prompt to be active at a time', () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    // Request multiple prompts
    act(() => {
      result.current.requestPrompt('beta-warning', 1);
      result.current.requestPrompt('notification-consent', 2);
      result.current.requestPrompt('analytics-consent', 3);
    });

    // Only the highest priority prompt should be active
    expect(result.current.activePrompt).toBe('beta-warning');
    expect(result.current.canShowPrompt('beta-warning')).toBe(true);
    expect(result.current.canShowPrompt('notification-consent')).toBe(false);
    expect(result.current.canShowPrompt('analytics-consent')).toBe(false);
  });

  it('should show next prompt after dismissing current one', async () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    // Request multiple prompts
    act(() => {
      result.current.requestPrompt('beta-warning', 1);
      result.current.requestPrompt('notification-consent', 2);
      result.current.requestPrompt('analytics-consent', 3);
    });

    // Dismiss the first prompt
    act(() => {
      result.current.dismissPrompt('beta-warning');
    });

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // The next prompt in priority order should be active
    expect(result.current.activePrompt).toBe('notification-consent');
    expect(result.current.canShowPrompt('notification-consent')).toBe(true);
  });

  it('should respect priority ordering', () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    // Request prompts in non-priority order
    act(() => {
      result.current.requestPrompt('analytics-consent', 3);
      result.current.requestPrompt('notification-consent', 2);
      result.current.requestPrompt('beta-warning', 1);
    });

    // Highest priority (lowest number) should be active
    expect(result.current.activePrompt).toBe('beta-warning');
  });

  it('should not re-add dismissed prompts', () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    act(() => {
      result.current.requestPrompt('beta-warning', 1);
    });

    act(() => {
      result.current.dismissPrompt('beta-warning');
    });

    // Try to request the same prompt again
    act(() => {
      result.current.requestPrompt('beta-warning', 1);
    });

    // It should not be shown again
    expect(result.current.canShowPrompt('beta-warning')).toBe(false);
  });

  it('should handle empty queue', () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    // Initially no active prompt
    expect(result.current.activePrompt).toBe(null);
  });

  it('should process entire queue sequentially', async () => {
    const { result } = renderHook(() => useStartupPrompts(), { wrapper });

    // Request all prompts
    act(() => {
      result.current.requestPrompt('beta-warning', 1);
      result.current.requestPrompt('notification-consent', 2);
      result.current.requestPrompt('analytics-consent', 3);
    });

    // First prompt
    expect(result.current.activePrompt).toBe('beta-warning');

    // Dismiss and check second prompt
    act(() => {
      result.current.dismissPrompt('beta-warning');
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(result.current.activePrompt).toBe('notification-consent');

    // Dismiss and check third prompt
    act(() => {
      result.current.dismissPrompt('notification-consent');
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(result.current.activePrompt).toBe('analytics-consent');

    // Dismiss final prompt
    act(() => {
      result.current.dismissPrompt('analytics-consent');
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(result.current.activePrompt).toBe(null);
  });
});

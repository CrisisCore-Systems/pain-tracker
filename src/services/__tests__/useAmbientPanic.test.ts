import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAmbientPanic } from '../useAmbientPanic';

const mockExecuteSoftPanic = vi.fn().mockResolvedValue(undefined);
const mockHasDeepVaultAccess = vi.fn().mockReturnValue(true);

vi.mock('../DuressVaultService', () => ({
  executeSoftPanic: () => mockExecuteSoftPanic(),
  hasDeepVaultAccess: () => mockHasDeepVaultAccess(),
}));

describe('useAmbientPanic', () => {
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalVisibilityState = Object.getOwnPropertyDescriptor(document, 'visibilityState');

  beforeEach(() => {
    vi.useFakeTimers();
    mockExecuteSoftPanic.mockClear();
    mockHasDeepVaultAccess.mockReturnValue(true);
    sessionStorage.setItem('vault:deep_access', 'test-key');
    sessionStorage.removeItem('vault:decoy_mode');

    // Mock DeviceOrientationEvent for tests
    (window as unknown as Window & { DeviceOrientationEvent: unknown }).DeviceOrientationEvent = {};
  });

  afterEach(() => {
    vi.useRealTimers();
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('does not trigger when vault is locked', () => {
    mockHasDeepVaultAccess.mockReturnValue(false);

    renderHook(() => useAmbientPanic({ isVaultUnlocked: false }));

    // Simulate visibility change
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);

    expect(mockExecuteSoftPanic).not.toHaveBeenCalled();
  });

  it('triggers soft panic on visibility hidden when unlocked', () => {
    renderHook(() => useAmbientPanic({ isVaultUnlocked: true }));

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);

    expect(mockExecuteSoftPanic).toHaveBeenCalled();
  });

  it('returns isUnlocked state', () => {
    const { result } = renderHook(() => useAmbientPanic({ isVaultUnlocked: true }));

    expect(result.current.isActive).toBe(true);
  });
});
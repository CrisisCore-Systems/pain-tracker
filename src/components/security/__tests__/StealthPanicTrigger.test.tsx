import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { StealthPanicTrigger } from '../StealthPanicTrigger';

const mockExecuteSoftPanic = vi.fn().mockResolvedValue(undefined);
const mockHasDeepVaultAccess = vi.fn().mockReturnValue(true);

vi.mock('../../../services/DuressVaultService', () => ({
  executeSoftPanic: () => mockExecuteSoftPanic(),
  hasDeepVaultAccess: () => mockHasDeepVaultAccess(),
}));

describe('StealthPanicTrigger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.setItem('vault:deep_access', 'test-key');
    mockHasDeepVaultAccess.mockReturnValue(true);
    mockExecuteSoftPanic.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders children without modification when not pressing', () => {
    render(
      <StealthPanicTrigger>
        <span>System Status: Ready</span>
      </StealthPanicTrigger>
    );

    expect(screen.getByText('System Status: Ready')).toBeInTheDocument();
  });

  it('applies stealth style during press with desaturation', async () => {
    render(
      <StealthPanicTrigger>
        <span>Footer text</span>
      </StealthPanicTrigger>
    );

    const wrapper = screen.getByText('Footer text').parentElement;

    fireEvent.mouseDown(wrapper!);

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    const style = wrapper?.getAttribute('style') || '';
    expect(style).toContain('saturate');
    expect(style).toContain('opacity');
  });

  it('triggers soft panic after hold duration', async () => {
    render(
      <StealthPanicTrigger>
        <span>Status row</span>
      </StealthPanicTrigger>
    );

    const wrapper = screen.getByText('Status row').parentElement;

    fireEvent.mouseDown(wrapper!);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockExecuteSoftPanic).toHaveBeenCalled();
  });

  it('cancels on mouse up before duration', async () => {
    render(
      <StealthPanicTrigger>
        <span>Footer link</span>
      </StealthPanicTrigger>
    );

    const wrapper = screen.getByText('Footer link').parentElement;

    fireEvent.mouseDown(wrapper!);
    fireEvent.mouseUp(wrapper!);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockExecuteSoftPanic).not.toHaveBeenCalled();
  });

  it('does not trigger on secondary mouse button', async () => {
    render(
      <StealthPanicTrigger>
        <span>Text</span>
      </StealthPanicTrigger>
    );

    const wrapper = screen.getByText('Text').parentElement;

    fireEvent.mouseDown(wrapper!, { button: 2 });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockExecuteSoftPanic).not.toHaveBeenCalled();
  });

  it('does not render when deep vault access is absent', () => {
    mockHasDeepVaultAccess.mockReturnValue(false);

    render(
      <StealthPanicTrigger>
        <span>Secret trigger</span>
      </StealthPanicTrigger>
    );

    expect(screen.queryByText('Secret trigger')).not.toBeInTheDocument();
  });

  it('calls onTrigger callback after activation', async () => {
    const onTriggerMock = vi.fn();

    render(
      <StealthPanicTrigger onTrigger={onTriggerMock}>
        <span>Footer</span>
      </StealthPanicTrigger>
    );

    const wrapper = screen.getByText('Footer').parentElement;

    fireEvent.mouseDown(wrapper!);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(onTriggerMock).toHaveBeenCalled();
  });
});
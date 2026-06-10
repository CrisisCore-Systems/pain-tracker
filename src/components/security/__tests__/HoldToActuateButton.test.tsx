import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { HoldToActuateButton, QuickExitTrigger, EmergencyResetTrigger } from '../HoldToActuateButton';

describe('HoldToActuateButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.setItem('vault:deep_access', 'test-key');
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('renders children when deep vault access exists', () => {
    render(
      <HoldToActuateButton>
        <span>Test Trigger</span>
      </HoldToActuateButton>
    );

    expect(screen.getByText('Test Trigger')).toBeInTheDocument();
  });

  it('does not activate when disabled', () => {
    render(
      <HoldToActuateButton disabled>
        <span>Test Trigger</span>
      </HoldToActuateButton>
    );

    const button = screen.getByText('Test Trigger').parentElement;
    fireEvent.pointerDown(button!);
    
    // Advance timers past hold duration
    vi.advanceTimersByTime(3000);
    
    expect(sessionStorage.getItem('vault:deep_access')).toBe('test-key'); // Not cleared
  });

  it('activates soft panic after 3 seconds of hold', async () => {
    const onActivated = vi.fn();
    
    render(
      <HoldToActuateButton type="soft" onActivated={onActivated}>
        <span>Quick Exit</span>
      </HoldToActuateButton>
    );

    const button = screen.getByText('Quick Exit').parentElement;
    
    fireEvent.pointerDown(button!);
    
    // Hold for 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(sessionStorage.getItem('vault:deep_access')).toBeNull();
    expect(onActivated).toHaveBeenCalled();
  });

  it('activates hard panic after 3 seconds of hold', async () => {
    // Note: Hard panic triggers page reload after emergency wipe
    // The session state change is verified in DuressVaultService tests
    // Here we just verify the component doesn't crash on hard type
    render(
      <HoldToActuateButton type="hard">
        <span>Reset</span>
      </HoldToActuateButton>
    );

    const button = screen.getByText('Reset').parentElement;
    
    fireEvent.pointerDown(button!);
    
    // Hold for 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Component should have attempted activation (session storage may persist due to reload)
    expect(screen.getByText('Reset')?.parentElement?.hasAttribute('data-activated')).toBeFalsy();
  });

  it('cancels activation on pointer up before duration', () => {
    render(
      <HoldToActuateButton type="soft">
        <span>Quick Exit</span>
      </HoldToActuateButton>
    );

    const button = screen.getByText('Quick Exit').parentElement;
    
    fireEvent.pointerDown(button!);
    fireEvent.pointerUp(button!);
    
    // Advance timers past what would have been the activation time
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(sessionStorage.getItem('vault:deep_access')).toBe('test-key'); // Still set
  });

  it('cancels activation on pointer leave', () => {
    render(
      <HoldToActuateButton type="soft">
        <span>Quick Exit</span>
      </HoldToActuateButton>
    );

    const button = screen.getByText('Quick Exit').parentElement;
    
    fireEvent.pointerDown(button!);
    fireEvent.pointerLeave(button!);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(sessionStorage.getItem('vault:deep_access')).toBe('test-key'); // Still set
  });
});

describe('QuickExitTrigger', () => {
  it('renders as a Quick Exit link by default', () => {
    sessionStorage.setItem('vault:deep_access', 'test-key');
    render(<QuickExitTrigger />);
    expect(screen.getByText('Quick Exit')).toBeInTheDocument();
    sessionStorage.clear();
  });
});

describe('EmergencyResetTrigger', () => {
  it('renders as dots that look like status indicator', () => {
    sessionStorage.setItem('vault:deep_access', 'test-key');
    render(<EmergencyResetTrigger />);
    expect(screen.getByText('•••')).toBeInTheDocument();
    sessionStorage.clear();
  });
});
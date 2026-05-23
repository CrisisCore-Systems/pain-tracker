import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionAwarePainEntryForm } from './SubscriptionAwarePainEntryForm';

const mockUseSubscriptionEntry = vi.fn();

vi.mock('../../hooks/useSubscriptionEntry', () => ({
  useSubscriptionEntry: (userId: string) => mockUseSubscriptionEntry(userId),
}));

vi.mock('../subscription/FeatureGates', () => ({
  UsageWarning: () => <div>Usage warning</div>,
}));

vi.mock('./PainEntryForm', () => ({
  PainEntryForm: () => <div>Pain entry form</div>,
}));

describe('SubscriptionAwarePainEntryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only the normalized quota message when the entry limit is reached', () => {
    mockUseSubscriptionEntry.mockReturnValue({
      addPainEntry: vi.fn(),
      isQuotaExceeded: true,
      quotaMessage: "You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room.",
      isLoading: false,
    });

    render(<SubscriptionAwarePainEntryForm userId="user-1" />);

    expect(screen.getByText('Entry Limit Reached')).toBeInTheDocument();
    expect(
      screen.getByText("You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/upgrade your plan to continue tracking your pain without limits/i)
    ).not.toBeInTheDocument();
  });
});
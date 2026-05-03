import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PricingPage } from '../pages/PricingPage';

const { createCheckoutSessionMock } = vi.hoisted(() => ({
  createCheckoutSessionMock: vi.fn(),
}));

let vaultState: 'locked' | 'unlocked' = 'unlocked';

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({
    currentTier: 'free',
  }),
}));

vi.mock('../hooks/useVault', () => ({
  useVaultStatus: () => ({
    state: vaultState,
  }),
}));

vi.mock('../utils/stripe-checkout', () => ({
  createCheckoutSession: createCheckoutSessionMock,
  getTierForCheckout: (tier: string) => {
    if (tier === 'basic' || tier === 'pro') {
      return tier;
    }

    return null;
  },
}));

vi.mock('../utils/user-identity', () => ({
  getLocalUserId: () => 'local-user-123',
}));

vi.mock('../components/subscription/FeatureGates', () => ({
  TierBadge: ({ tier }: { tier: string }) => <span>{tier}</span>,
}));

vi.mock('../components/seo/applyPageMetadata', () => ({
  applyPageMetadata: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

describe('PricingPage checkout messaging', () => {
  beforeEach(() => {
    vaultState = 'unlocked';
    createCheckoutSessionMock.mockReset();
    createCheckoutSessionMock.mockResolvedValue(undefined);
  });

  it('shows a clear message when checkout is canceled', () => {
    render(
      <MemoryRouter initialEntries={['/pricing?checkout=canceled']}>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('status', { name: '' })
    ).toHaveTextContent('Checkout was canceled. Your current plan has not changed.');
  });

  it('shows a confirmation message when checkout returns successfully', () => {
    render(
      <MemoryRouter initialEntries={['/pricing?checkout=success']}>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checkout completed. Your subscription status will refresh on this device as soon as Stripe confirms the payment.'
    );
  });

  it('sends locked users to start with a resume checkout redirect', () => {
    vaultState = 'locked';

    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/start" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Get Basic' }));

    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      '/start?redirect=%2Fpricing%3FresumeCheckout%3D1%26tier%3Dbasic%26interval%3Dmonthly'
    );
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('resumes checkout after unlock when pricing receives a pending checkout intent', async () => {
    render(
      <MemoryRouter initialEntries={['/pricing?resumeCheckout=1&tier=basic&interval=yearly']}>
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(createCheckoutSessionMock).toHaveBeenCalledWith({
        userId: 'local-user-123',
        tier: 'basic',
        interval: 'yearly',
      });
    });

    expect(createCheckoutSessionMock).toHaveBeenCalledTimes(1);
  });
});
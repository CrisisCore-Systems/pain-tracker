import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationConsentPrompt from '../NotificationConsentPrompt';

const mockRequestPrompt = vi.fn();
const mockDismissPrompt = vi.fn();
const mockCanShowPrompt = vi.fn(() => false);

const mockBottomLeft = {
  info: vi.fn(),
};

const mockUsePainTrackerStore = vi.fn();

vi.mock('../feedback', () => ({
  useToast: () => ({
    bottomLeft: mockBottomLeft,
  }),
}));

vi.mock('../../contexts/StartupPromptsContext', () => ({
  useStartupPrompts: () => ({
    requestPrompt: mockRequestPrompt,
    dismissPrompt: mockDismissPrompt,
    canShowPrompt: mockCanShowPrompt,
  }),
}));

vi.mock('../../stores/pain-tracker-store', () => ({
  usePainTrackerStore: (selector: (state: { ui: { showOnboarding: boolean; showWalkthrough: boolean } }) => unknown) =>
    mockUsePainTrackerStore(selector),
}));

describe('NotificationConsentPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUsePainTrackerStore.mockImplementation(
      (selector: (state: { ui: { showOnboarding: boolean; showWalkthrough: boolean } }) => unknown) =>
        selector({
          ui: {
            showOnboarding: false,
            showWalkthrough: false,
          },
        })
    );

    vi.stubGlobal('Notification', {
      requestPermission: vi.fn().mockResolvedValue('granted'),
    });
  });

  it('does not request notification prompt while onboarding is active', () => {
    mockUsePainTrackerStore.mockImplementation(
      (selector: (state: { ui: { showOnboarding: boolean; showWalkthrough: boolean } }) => unknown) =>
        selector({
          ui: {
            showOnboarding: true,
            showWalkthrough: false,
          },
        })
    );

    render(<NotificationConsentPrompt />);

    expect(mockRequestPrompt).not.toHaveBeenCalled();
    expect(mockBottomLeft.info).not.toHaveBeenCalled();
  });

  it('does not request notification prompt while walkthrough is active', () => {
    mockUsePainTrackerStore.mockImplementation(
      (selector: (state: { ui: { showOnboarding: boolean; showWalkthrough: boolean } }) => unknown) =>
        selector({
          ui: {
            showOnboarding: false,
            showWalkthrough: true,
          },
        })
    );

    render(<NotificationConsentPrompt />);

    expect(mockRequestPrompt).not.toHaveBeenCalled();
    expect(mockBottomLeft.info).not.toHaveBeenCalled();
  });

  it('requests notification prompt when onboarding and walkthrough are not active', () => {
    render(<NotificationConsentPrompt />);

    expect(mockRequestPrompt).toHaveBeenCalledWith('notification-consent', 2);
  });
});

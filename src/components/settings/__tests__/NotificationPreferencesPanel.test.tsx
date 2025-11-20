import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import NotificationPreferencesPanel from '../NotificationPreferencesPanel';
import { secureStorage } from '../../../lib/storage/secureStorage';

describe('NotificationPreferencesPanel', () => {
  beforeEach(() => {
    // clear storage between tests
    localStorage.clear();
  });

  it('renders and toggles preferences', () => {
    render(<NotificationPreferencesPanel />);

    expect(screen.getByText(/Notification Preferences/i)).toBeInTheDocument();

    const browserToggle = screen.getByRole('switch', { name: /Browser notifications/i });
    expect(browserToggle).toBeInTheDocument();
    expect(browserToggle).toBeChecked();

    // Toggle off
    fireEvent.click(browserToggle);
    expect(browserToggle).not.toBeChecked();

    // Verify storage updated
    const stored = secureStorage.get('pain-tracker:notification-preferences');
    expect(stored).toBeTruthy();
    if (stored && typeof stored === 'object') {
      // @ts-expect-error allow property check in test
      expect(stored.deliveryMethods.browser).toBe(false);
    }
  });
});

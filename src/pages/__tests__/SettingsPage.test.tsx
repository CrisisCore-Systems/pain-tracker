import React from 'react';
import { render, screen } from '../../test/test-utils';
import SettingsPage from '../SettingsPage';

describe('SettingsPage', () => {
  it('renders settings sections', () => {
    render(<SettingsPage />);

    // Accessibility panel
    expect(screen.getByText(/Accessibility & Comfort Settings/i)).toBeInTheDocument();

    // Notifications management
    expect(screen.getByText(/Manage notifications/i)).toBeInTheDocument();

  // Backup & Export (section heading)
  expect(screen.getByRole('heading', { level: 3, name: /Backup & Export/i })).toBeInTheDocument();

    // Alerts settings
    expect(screen.getByText(/Alerts settings/i)).toBeInTheDocument();
  });
});

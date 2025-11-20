import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import CloudBackupSettings from '../CloudBackupSettings';

describe('CloudBackupSettings', () => {
  it('renders and allows backup', async () => {
    render(<CloudBackupSettings />);

  expect(screen.getByRole('heading', { name: /Cloud Backup/i })).toBeInTheDocument();

  // Enable checkbox
  const enableCheckbox = screen.getByRole('checkbox', { name: /Enable/i });
    fireEvent.click(enableCheckbox);

    const backupButton = screen.getByRole('button', { name: /Back up now/i });
    fireEvent.click(backupButton);

    // Wait for last backup text
    expect(await screen.findByText(/Last backup:/i)).toBeInTheDocument();
  });
});

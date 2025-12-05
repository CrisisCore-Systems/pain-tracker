import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import BackupSettings from '../BackupSettings';

describe('BackupSettings', () => {
  it('renders and performs export', async () => {
    render(<BackupSettings />);

    // Look for the heading by role to be more specific
    expect(screen.getByRole('heading', { level: 4, name: /Local Backup/i })).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: /Export backup/i });
    fireEvent.click(exportButton);

    // Wait for success message to update
    expect(await screen.findByText(/Export completed/i)).toBeInTheDocument();
  });
});

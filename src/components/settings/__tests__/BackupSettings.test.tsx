import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import BackupSettings from '../BackupSettings';

describe('BackupSettings', () => {
  it('renders and performs export', async () => {
    render(<BackupSettings />);

    expect(screen.getByText(/Backup & Export/i)).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: /Export backup/i });
    fireEvent.click(exportButton);

    // Wait for success message to update
    expect(await screen.findByText(/Export completed/i)).toBeInTheDocument();
  });
});

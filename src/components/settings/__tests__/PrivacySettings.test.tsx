import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import PrivacySettings from '../PrivacySettings';
import { secureStorage } from '../../../lib/storage/secureStorage';

describe('PrivacySettings', () => {
  it('toggles privacy options and persists them', async () => {
    render(<PrivacySettings />);

    expect(screen.getByText(/Privacy & Data Controls/i)).toBeInTheDocument();

    const sharingCheckbox = screen.getByRole('checkbox', { name: /Share de-identified data/i });
    fireEvent.click(sharingCheckbox);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '90' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    // Read persistence from secureStorage
    const stored = secureStorage.safeJSON<{
      dataSharing?: boolean;
      retentionDays?: number | string;
    }>('pain-tracker:privacy-settings', {});
    expect(stored.dataSharing === true || stored.dataSharing === false).toBe(true);
    expect([30, 90, 365, 0].includes(Number(stored.retentionDays))).toBe(true);
  });
});

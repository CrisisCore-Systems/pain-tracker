import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import BackupSettings from '../BackupSettings';

const mockStorage = new Map<string, unknown>();

vi.mock('../../../lib/storage/secureStorage', () => ({
  secureStorage: {
    keys: () => Array.from(mockStorage.keys()),
    get: (key: string) => mockStorage.get(key),
    safeJSON: (key: string, fallback: unknown) => {
      const value = mockStorage.get(key);
      return value ?? fallback;
    },
    set: (key: string, value: unknown) => {
      mockStorage.set(key, value);
      return { success: true, bytes: 0 };
    },
    remove: (key: string) => mockStorage.delete(key),
  },
}));

function makeBackupFile(data: Record<string, unknown>) {
    schema: 'paintracker.settings-backup',
    version: 1,
    createdAt: new Date().toISOString(),
    data,
  });

  const file = new File([json], 'settings-backup.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', {
    value: vi.fn().mockResolvedValue(json),
  });
  return file;
}

describe('BackupSettings', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockStorage.set('pain-tracker:theme', 'calm');
    mockStorage.set('theme:mode', 'light');
    mockStorage.set('vault:secret', 'blocked');
  });

  it('renders and performs export', async () => {
    render(<BackupSettings />);

    // Look for the heading by role to be more specific
    expect(screen.getByRole('heading', { level: 4, name: /Local Backup/i })).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: /Export backup/i });
    fireEvent.click(exportButton);

    // Wait for success message to update
    expect(await screen.findByText(/Export completed/i)).toBeInTheDocument();
  });

  it('shows import preview and allows cancel before any write occurs', async () => {
    const setSpy = vi.spyOn(mockStorage, 'set');
    render(<BackupSettings />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const backup = makeBackupFile({
      'theme:mode': 'dark',
      'prefs:contrast': 'high',
      'vault:secret': 'do-not-import',
    });

    fireEvent.change(fileInput, { target: { files: [backup] } });

    expect(await screen.findByText(/Import preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Blocked: 1\./i)).toBeInTheDocument();
    expect(screen.getByText('theme:mode')).toBeInTheDocument();
    expect(screen.getByText('prefs:contrast')).toBeInTheDocument();
    expect(screen.getByText('vault:secret')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Import preview/i)).not.toBeInTheDocument();
    });
    expect(setSpy).not.toHaveBeenCalledWith('prefs:contrast', 'high');
  });

  it('requires IMPORT confirmation before applying a safe backup import', async () => {
    const user = userEvent.setup();
    render(<BackupSettings />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const backup = makeBackupFile({
      'theme:mode': 'dark',
      'prefs:contrast': 'high',
    });

    fireEvent.change(fileInput, { target: { files: [backup] } });

    const applyButton = await screen.findByRole('button', { name: /Apply import/i });
    expect(applyButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Type IMPORT to apply/i), 'IMPORT');
    expect(applyButton).toBeEnabled();

    await user.click(applyButton);

    expect(await screen.findByText(/Import applied \(2 keys\)\./i)).toBeInTheDocument();
    expect(mockStorage.get('theme:mode')).toBe('dark');
    expect(mockStorage.get('prefs:contrast')).toBe('high');
  });
});

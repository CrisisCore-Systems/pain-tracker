import React from 'react';
import { render, screen, fireEvent, createMockPainEntry } from '../../../test/test-utils';
import ExportSettings from '../ExportSettings';
import * as exportUtils from '../../../utils/pain-tracker/export';
import { usePainTrackerStore } from '../../../stores/pain-tracker-store';

describe('ExportSettings', () => {
  it('allows selecting CSV and triggers download', async () => {
    // Ensure there is at least one entry so exports have content
    usePainTrackerStore.setState({ entries: [createMockPainEntry({ id: 'test', baselineData: { pain: 5, locations: [], symptoms: [] } })] });

  const downloadSpy = vi.spyOn(exportUtils, 'downloadData').mockImplementation(() => {});

    render(<ExportSettings />);

    expect(screen.getByText(/Export & Sharing/i)).toBeInTheDocument();

    // Select CSV format option
    const csvRadio = screen.getByRole('radio', { name: /CSV/i });
    fireEvent.click(csvRadio);

    // Click export button
    const exportButton = screen.getByRole('button', { name: /Export now/i });
    fireEvent.click(exportButton);

    // Expect downloadData to be called
    expect(downloadSpy).toHaveBeenCalled();

    downloadSpy.mockRestore();
  });
});

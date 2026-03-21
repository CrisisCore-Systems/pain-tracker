/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataExportModal } from './DataExportModal';
import type { PainEntry } from '../../types';
import {
  exportToPDF,
  downloadData,
  clearExportArtifacts,
} from '../../utils/pain-tracker/export';

vi.mock('../../utils/pain-tracker/export', () => ({
  exportToCSV: vi.fn(() => 'Date,Time,Pain Level\n2024-01-01,08:00,5'),
  exportToJSON: vi.fn(() => '[{"id":1}]'),
  exportToPDF: vi.fn(async () => 'data:application/pdf;base64,JVBERi0xLjQ='),
  downloadData: vi.fn(),
  clearExportArtifacts: vi.fn(),
}));

function makeEntry(overrides: Partial<PainEntry> = {}): PainEntry {
  return {
    id: 1,
    timestamp: '2024-01-01T08:00:00Z',
    baselineData: {
      pain: 5,
      symptoms: ['Burning'],
      locations: ['Lower Back'],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: [
        {
          name: 'Ibuprofen',
          dosage: '200mg',
          frequency: 'BID',
          effectiveness: 'moderate',
        },
      ],
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: 6,
      moodImpact: 5,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: 'Private note',
    ...overrides,
  };
}

describe('DataExportModal integration hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps export button disabled until warning gate is acknowledged', async () => {
    const user = userEvent.setup();

    render(<DataExportModal isOpen onClose={vi.fn()} entries={[makeEntry()]} />);

    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    expect(exportButton).toBeDisabled();

    const warningCheckbox = screen.getByRole('checkbox', {
      name: /I understand this export leaves app protection once saved to my device\./i,
    });

    await user.click(warningCheckbox);

    expect(exportButton).toBeEnabled();
  });

  it('routes Minimal policy to PDF export generator', async () => {
    const user = userEvent.setup();

    render(<DataExportModal isOpen onClose={vi.fn()} entries={[makeEntry()]} />);

    await user.click(screen.getByRole('button', { name: /PDF \(Report\)/i }));
    await user.click(screen.getByRole('radio', { name: /Minimal \(clinical\/compliance\)/i }));
    await user.click(
      screen.getByRole('checkbox', {
        name: /I understand this export leaves app protection once saved to my device\./i,
      })
    );

    await user.click(screen.getByRole('button', { name: /Export PDF/i }));

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalledWith(expect.any(Array), 'minimal');
      expect(downloadData).toHaveBeenCalled();
    });
  });

  it('routes Full policy to PDF export generator', async () => {
    const user = userEvent.setup();

    render(<DataExportModal isOpen onClose={vi.fn()} entries={[makeEntry()]} />);

    await user.click(screen.getByRole('button', { name: /PDF \(Report\)/i }));
    await user.click(screen.getByRole('radio', { name: /Full \(personal\/diagnostic\)/i }));
    await user.click(
      screen.getByRole('checkbox', {
        name: /I understand this export leaves app protection once saved to my device\./i,
      })
    );

    await user.click(screen.getByRole('button', { name: /Export PDF/i }));

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalledWith(expect.any(Array), 'full');
      expect(downloadData).toHaveBeenCalled();
    });
  });

  it('invokes cleanup routine when closing export after success', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DataExportModal isOpen onClose={onClose} entries={[makeEntry()]} />);

    await user.click(
      screen.getByRole('checkbox', {
        name: /I understand this export leaves app protection once saved to my device\./i,
      })
    );
    await user.click(screen.getByRole('button', { name: /Export CSV/i }));

    const closeAndClearButton = await screen.findByRole('button', {
      name: /Close Export & Clear Memory/i,
    });

    await user.click(closeAndClearButton);

    expect(clearExportArtifacts).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

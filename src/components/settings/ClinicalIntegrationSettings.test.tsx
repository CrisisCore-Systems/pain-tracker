import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClinicalIntegrationSettings } from './ClinicalIntegrationSettings';
import QRCode from 'qrcode';

// Mock the store
vi.mock('../../stores/pain-tracker-store', () => ({
  usePainTrackerStore: () => ({
    entries: [
      { id: 1, timestamp: '2023-01-01', notes: 'Test Note' }
    ]
  })
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockQRCode')
  }
}));

describe('ClinicalIntegrationSettings', () => {
  it('renders the component and initial state', () => {
    render(<ClinicalIntegrationSettings />);
    expect(screen.getByText(/Clinical Connect/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Clinical Code/i)).toBeInTheDocument();
  });

  it('toggles note privacy', () => {
    render(<ClinicalIntegrationSettings />);
    const toggle = screen.getByLabelText(/Include notes in clinical export/i);
    expect(toggle).not.toBeChecked(); // Default false
    
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByText(/⚠️ Your personal journal notes WILL be visible/i)).toBeInTheDocument();
  });

  it('generates QR code when button is clicked', async () => {
    render(<ClinicalIntegrationSettings />);
    
    const generateBtn = screen.getByText(/Generate Clinical Code/i);
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(screen.getByAltText('Clinical Data QR Code')).toBeInTheDocument();
    });
  });
});

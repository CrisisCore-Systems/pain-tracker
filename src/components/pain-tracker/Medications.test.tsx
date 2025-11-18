import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Medications from './Medications';

describe('Medications Component', () => {
  const mockMedications = {
    current: [
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Twice daily',
        effectiveness: 'Moderately Effective',
      },
    ],
    changes: '',
    effectiveness: 'Moderately Effective',
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);
    expect(screen.getByText('Current Medications')).toBeInTheDocument();
  });

  it('displays existing medications', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.getByText('400mg')).toBeInTheDocument();
    expect(screen.getByText('Twice daily')).toBeInTheDocument();
  });

  it('allows adding new medication', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Medication name'), {
      target: { value: 'Aspirin' },
    });
    fireEvent.change(screen.getByPlaceholderText('Dosage'), {
      target: { value: '500mg' },
    });
    fireEvent.change(screen.getByPlaceholderText('Frequency'), {
      target: { value: 'Once daily' },
    });

    // Click add button
    fireEvent.click(screen.getByText('Add Medication'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMedications,
      current: [
        ...mockMedications.current,
        {
          name: 'Aspirin',
          dosage: '500mg',
          frequency: 'Once daily',
          effectiveness: 'Not Rated',
        },
      ],
    });
  });

  it('allows removing medication', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);

    const removeButton = screen.getByRole('button', { name: /remove medication/i });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMedications,
      current: [],
    });
  });

  it('updates medication changes', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);

    fireEvent.change(
      screen.getByPlaceholderText('Describe any recent changes to your medications...'),
      {
        target: { value: 'Stopped taking ibuprofen' },
      }
    );

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMedications,
      changes: 'Stopped taking ibuprofen',
    });
  });

  it('updates overall effectiveness', () => {
    render(<Medications medications={mockMedications} onChange={mockOnChange} />);

    // Find the Overall Effectiveness section and its select element
    const overallEffectivenessSection = screen.getByText('Overall Effectiveness').closest('div');
    const select = overallEffectivenessSection?.querySelector('select');
    if (select) {
      fireEvent.change(select, {
        target: { value: 'Very Effective' },
      });
    }

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMedications,
      effectiveness: 'Very Effective',
    });
  });
});

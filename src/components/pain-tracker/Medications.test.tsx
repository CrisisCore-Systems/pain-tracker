import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  const mockOnChange = jest.fn();

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

    // Select effectiveness
    fireEvent.change(screen.getByText('Select Effectiveness'), {
      target: { value: 'Very Effective' },
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
          effectiveness: 'Very Effective',
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

    const select = screen.getByRole('combobox', { name: '' });
    fireEvent.change(select, {
      target: { value: 'Very Effective' },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMedications,
      effectiveness: 'Very Effective',
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EmergencyPanel from './EmergencyPanel';
import { EmergencyPanelData } from '../../types';

describe('EmergencyPanel Component', () => {
  const mockData: EmergencyPanelData = {
    contacts: [
      {
        id: 1,
        name: 'Dr. Smith',
        relationship: 'Primary Care Physician',
        phoneNumber: '555-0123',
        email: 'dr.smith@example.com',
        isHealthcareProvider: true,
        specialty: 'Family Medicine',
        notes: 'Available Mon-Fri'
      }
    ],
    protocols: [
      {
        painThreshold: 8,
        symptoms: ['Severe Pain', 'Numbness'],
        medications: [
          {
            name: 'Emergency Pain Relief',
            dosage: '10mg',
            instructions: 'Take with water'
          }
        ],
        immediateActions: ['Rest', 'Apply ice'],
        contactPriority: [1],
        additionalInstructions: 'Seek immediate medical attention if symptoms persist'
      }
    ],
    medicalHistory: {
      conditions: ['Chronic Back Pain'],
      allergies: ['Penicillin'],
      previousIncidents: [
        {
          date: '2024-01-01',
          description: 'Severe pain episode',
          outcome: 'Resolved with medication'
        }
      ]
    },
    currentPainLevel: 5,
    lastUpdated: new Date().toISOString()
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
  });

  it('displays emergency contact information', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('555-0123')).toBeInTheDocument();
    expect(screen.getByText('Primary Care Physician')).toBeInTheDocument();
  });

  it('shows emergency alert when pain level exceeds threshold', () => {
    const highPainData = {
      ...mockData,
      currentPainLevel: 9
    };

    render(<EmergencyPanel data={highPainData} onChange={mockOnChange} />);
    expect(screen.getByText('Emergency Protocol Activated')).toBeInTheDocument();
    expect(screen.getByText(/Pain level exceeds threshold/)).toBeInTheDocument();
  });

  it('allows adding new emergency contact', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    
    // Fill in contact form
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Jane Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('Relationship'), {
      target: { value: 'Family Member' }
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '555-9876' }
    });
    
    // Add contact
    fireEvent.click(screen.getByText('Add Contact'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      contacts: [
        ...mockData.contacts,
        expect.objectContaining({
          name: 'Jane Doe',
          relationship: 'Family Member',
          phoneNumber: '555-9876'
        })
      ]
    });
  });

  it('allows removing emergency contact', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    
    const removeButton = screen.getByRole('button', { name: /remove contact/i });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockData,
      contacts: [],
      protocols: [
        {
          ...mockData.protocols[0],
          contactPriority: []
        }
      ]
    });
  });

  it('displays medical history', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Medical History')).toBeInTheDocument();
    expect(screen.getByText('Chronic Back Pain')).toBeInTheDocument();
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
  });

  it('displays previous incidents', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Severe pain episode')).toBeInTheDocument();
    expect(screen.getByText('Resolved with medication')).toBeInTheDocument();
  });

  it('shows healthcare provider badge', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Healthcare Provider')).toBeInTheDocument();
  });

  it('allows toggling healthcare provider status for new contact', () => {
    render(<EmergencyPanel data={mockData} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(screen.getByPlaceholderText('Medical Specialty')).toBeInTheDocument();
  });
}); 
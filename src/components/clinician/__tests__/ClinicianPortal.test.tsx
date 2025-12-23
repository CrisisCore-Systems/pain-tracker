import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClinicianPortal from '../ClinicianPortal';

describe('ClinicianPortal', () => {
  test('renders consent flow', () => {
    render(<ClinicianPortal />);
    expect(screen.getByText(/Clinician Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/I consent to local export/i)).toBeInTheDocument();
  });
  test('consent enables export', () => {
    render(<ClinicianPortal />);
    fireEvent.click(screen.getByText(/I consent to local export/i));
    expect(screen.getByText(/Export my data/i)).toBeInTheDocument();
    expect(screen.getByText(/Revoke consent/i)).toBeInTheDocument();
  });
});
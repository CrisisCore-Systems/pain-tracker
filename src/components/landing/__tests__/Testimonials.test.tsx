import React from 'react';
import { render, screen } from '../../../test/test-utils';
import { Testimonials } from '../Testimonials';

describe('Testimonials component', () => {
  it('renders the testimonials header and content', async () => {
    render(<Testimonials />);

    // header
    expect(screen.getByRole('heading', { name: /Trusted by Patients & Clinicians/i })).toBeInTheDocument();

    // Subheader text (updated to match current copy)
    expect(
      screen.getByText(/How Pain Tracker Pro helps people manage chronic pain/i)
    ).toBeInTheDocument();

    // Should render testimonials badge
    expect(screen.getByText(/Testimonials/i)).toBeInTheDocument();
    
    // Disclaimer for illustrative examples
    expect(screen.getByText(/\*Illustrative examples/i)).toBeInTheDocument();
  });
});

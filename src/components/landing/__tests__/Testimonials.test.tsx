import React from 'react';
import { render, screen } from '../../../test/test-utils';
import { Testimonials } from '../Testimonials';

describe('Testimonials component', () => {
  it('renders the testimonials header and content', async () => {
    render(<Testimonials />);

    // header
    expect(screen.getByRole('heading', { name: /Designed for Patients & Clinicians/i })).toBeInTheDocument();

    // Subheader text
    expect(
      screen.getByText(/Illustrative examples of how Pain Tracker Pro can help/i)
    ).toBeInTheDocument();

    // Should render use cases badge
    expect(screen.getByText(/Use Cases/i)).toBeInTheDocument();
  });
});

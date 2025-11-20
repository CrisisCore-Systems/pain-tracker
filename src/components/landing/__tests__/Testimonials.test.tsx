import React from 'react';
import { render, screen } from '../../../test/test-utils';
import { Testimonials } from '../Testimonials';

describe('Testimonials component', () => {
  it('renders the testimonials header and verification flow', async () => {
    render(<Testimonials />);

    // header
    expect(screen.getByRole('heading', { name: /Trusted by Patients & Clinicians/i })).toBeInTheDocument();

    // disclosure / consent note
    expect(
      screen.getByText(/We only publish verified testimonials with explicit consent/i)
    ).toBeInTheDocument();

    // submit a story mailto link
    const link = screen.getByRole('link', { name: /submit a story/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('mailto:'));

    // Verification tag present within testimonial cards
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
  });
});

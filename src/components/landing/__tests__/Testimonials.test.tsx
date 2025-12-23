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
      screen.getByText(/Representative scenarios showing how people use Pain Tracker Pro/i)
    ).toBeInTheDocument();

    // Should render testimonials badge
    expect(screen.getByText(/Use-Case Snapshots/i)).toBeInTheDocument();

    // Disclaimer for illustrative examples
    expect(screen.getByText(/These are illustrative examples, not verified customer quotes/i)).toBeInTheDocument();
  });
});

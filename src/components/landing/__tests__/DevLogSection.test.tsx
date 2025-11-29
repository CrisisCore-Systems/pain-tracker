import React from 'react';
import { render, screen } from '../../../test/test-utils';
import { DevLogSection } from '../DevLogSection';

describe('DevLogSection component', () => {
  it('renders the dev log header and blog posts', () => {
    render(<DevLogSection />);

    // header
    expect(screen.getByRole('heading', { name: /From the Dev Log/i })).toBeInTheDocument();

    // description
    expect(
      screen.getByText(/Stories and breakdowns from building PainTracker/i)
    ).toBeInTheDocument();

    // blog post titles
    expect(screen.getByText(/Trauma-Informed Design/i)).toBeInTheDocument();
    expect(screen.getByText(/Building Software That Actually Gives a Damn/i)).toBeInTheDocument();
    expect(screen.getByText(/Healthcare PWA That Works/i)).toBeInTheDocument();

    // view all posts link
    const viewAllLink = screen.getByRole('link', { name: /View all blog posts/i });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', 'https://paintracker.hashnode.dev');
  });

  it('renders blog post cards with correct links', () => {
    render(<DevLogSection />);

    // Check that blog cards link to hashnode
    const blogLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('paintracker.hashnode.dev')
    );
    
    expect(blogLinks.length).toBeGreaterThanOrEqual(3); // 3 posts + 1 view all
  });
});

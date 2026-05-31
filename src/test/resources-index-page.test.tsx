import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResourcesIndexPage } from '../pages/resources/ResourcesIndexPage';

describe('ResourcesIndexPage SEO guards', () => {
  it('renders the resources hub with the search-intent headline', () => {
    const { getAllByRole, getAllByText, getByRole, getByText } = render(
      <MemoryRouter initialEntries={['/resources']}>
        <Routes>
          <Route path="/resources" element={<ResourcesIndexPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByRole('heading', { level: 1 })).toHaveTextContent(
      'Free Pain Tracker Templates, Printable Pain Journals, and Private Tracking Guides'
    );
    expect(document.title).toBe(
      'Free Pain Tracker Templates & Pain Journal Printables | PainTracker.ca'
    );
    expect(
      getAllByRole('link', { name: 'Download the Free Pain Tracking Starter Pack ZIP' }).every(
        link => link.getAttribute('href') === '/assets/free-pain-tracking-starter-pack.zip'
      )
    ).toBe(true);
    expect(getByText('Choose the right pain tracker')).toBeInTheDocument();
    expect(getByText('How to start tracking pain without overthinking it')).toBeInTheDocument();
    expect(getByText('What is a pain tracker template?')).toBeInTheDocument();
    expect(getAllByText('free private pain tracker app')[0].closest('a')).toHaveAttribute(
      'href',
      '/'
    );
    expect(getAllByText('daily pain tracker printable')[0].closest('a')).toHaveAttribute(
      'href',
      '/resources/daily-pain-tracker-printable'
    );
    expect(getAllByText('what to include in a pain journal')[0].closest('a')).toHaveAttribute(
      'href',
      '/resources/what-to-include-in-pain-journal'
    );
    expect(getAllByText('7-day pain diary template')[0].closest('a')).toHaveAttribute(
      'href',
      '/resources/7-day-pain-diary-template'
    );
    expect(getAllByText('monthly pain tracker printable')[0].closest('a')).toHaveAttribute(
      'href',
      '/resources/monthly-pain-tracker-printable'
    );
    expect(getByText('best pain tracking apps').closest('a')).toHaveAttribute(
      'href',
      'https://blog.paintracker.ca/best-pain-tracking-apps'
    );
  });

  it('marks query-based resource searches as noindex', () => {
    render(
      <MemoryRouter initialEntries={['/resources?q=pain+diary']}>
        <Routes>
          <Route path="/resources" element={<ResourcesIndexPage />} />
        </Routes>
      </MemoryRouter>
    );

    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
    expect(robots.replaceAll(/\s+/g, '').toLowerCase()).toBe('noindex,follow');
  });

  it('does not leave a noindex tag behind for the clean resources hub', () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <Routes>
          <Route path="/resources" element={<ResourcesIndexPage />} />
        </Routes>
      </MemoryRouter>
    );

    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
    expect(robots.replaceAll(/\s+/g, '').toLowerCase()).not.toBe('noindex,follow');
  });
});

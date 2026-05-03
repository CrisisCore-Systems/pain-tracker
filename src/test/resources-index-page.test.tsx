import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResourcesIndexPage } from '../pages/resources/ResourcesIndexPage';

describe('ResourcesIndexPage SEO guards', () => {
  it('marks query-based resource searches as noindex', () => {
    render(
      <MemoryRouter initialEntries={['/resources?q=pain+diary']}>
        <Routes>
          <Route path="/resources" element={<ResourcesIndexPage />} />
        </Routes>
      </MemoryRouter>
    );

    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
    expect(robots.replace(/\s+/g, '').toLowerCase()).toBe('noindex,follow');
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
    expect(robots.replace(/\s+/g, '').toLowerCase()).not.toBe('noindex,follow');
  });
});

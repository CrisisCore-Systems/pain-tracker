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

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });

  it('does not leave a noindex tag behind for the clean resources hub', () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <Routes>
          <Route path="/resources" element={<ResourcesIndexPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).not.toBe('noindex, follow');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { StartRedirect } from '../components/security/StartRedirect';

describe('StartRedirect', () => {
  it('uses the requested in-app redirect after unlock', () => {
    render(
      <MemoryRouter initialEntries={['/start?redirect=%2Fpricing%3FresumeCheckout%3D1%26tier%3Dbasic%26interval%3Dmonthly']}>
        <Routes>
          <Route path="/start" element={<StartRedirect />} />
          <Route path="/pricing" element={<div>pricing destination</div>} />
          <Route path="/app" element={<div>app destination</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('pricing destination')).toBeInTheDocument();
  });

  it('falls back to the app shell for unsafe redirects', () => {
    render(
      <MemoryRouter initialEntries={['/start?redirect=https%3A%2F%2Fevil.example']}>
        <Routes>
          <Route path="/start" element={<StartRedirect />} />
          <Route path="/app" element={<div>app destination</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('app destination')).toBeInTheDocument();
  });
});
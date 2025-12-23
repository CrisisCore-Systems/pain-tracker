import React from 'react';
import { render, screen } from '@testing-library/react';
import CrisisBanner from '../CrisisBanner';
describe('CrisisBanner', () => {
  test('renders gracefully with no entries', () => {
    render(<CrisisBanner />);
    expect(screen.queryByText(/High pain alert/i)).toBeNull();
  });
});

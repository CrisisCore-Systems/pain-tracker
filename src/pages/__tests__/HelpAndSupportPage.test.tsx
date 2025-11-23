import React from 'react';
import { render, screen } from '../../test/test-utils';
import HelpAndSupportPage from '../HelpAndSupportPage';

describe('HelpAndSupportPage', () => {
  it('renders support cards', () => {
    render(<HelpAndSupportPage />);
    expect(screen.getByText(/Help & Support/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Getting started/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /FAQs/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Contact Support/i })).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import PHQ9 from '../PHQ9';

describe('PHQ9', () => {
  test('renders questions', () => {
    render(<PHQ9 />);
    expect(screen.getByText(/PHQ-9 screening/i)).toBeInTheDocument();
  });
});

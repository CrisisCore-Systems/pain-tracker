import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PainEntryForm from '../PainEntryForm';

describe('PainEntryForm', () => {
  it('shows inline error and announces it when required field is empty', async () => {
    render(<PainEntryForm />);

    const button = screen.getByRole('button', { name: /save entry/i });
    fireEvent.click(button);

    const error = await screen.findByText(/please tell us briefly what hurts/i);
    expect(error).toBeInTheDocument();

    // The announcer uses aria-live with role=status; ensure the message is present in DOM
    const announcer = document.querySelector('[role="status"]');
    expect(announcer?.textContent).toMatch(/form has an error/i);
  });
});

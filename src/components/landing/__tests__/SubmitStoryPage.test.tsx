import React from 'react';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { MemoryRouter } from 'react-router-dom';
import SubmitStoryPage from '../../../pages/SubmitStoryPage';
import { vi } from 'vitest';

describe('SubmitStoryPage', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global as any).fetch = undefined;
  });

  it('renders the submit story form and submits', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    (global as any).fetch = mockFetch;

  render(<SubmitStoryPage />, { wrapper: MemoryRouter });

    const storyInput = screen.getByLabelText(/Your Story/i);
    const consentCheckbox = screen.getByLabelText(/I consent to my story/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(storyInput, { target: { value: 'This is my story' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);

    // Wait for fetch to be called
    expect(mockFetch).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('/api/landing/testimonial', expect.anything());

    // Success UI
    expect(await screen.findByText(/Thank you for sharing/i)).toBeInTheDocument();
  });
});

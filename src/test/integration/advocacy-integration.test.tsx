import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { PainTracker } from '../../components/pain-tracker/index';
// Mock crypto for the store
global.crypto.randomUUID = (() => '11111111-1111-1111-1111-111111111111') as any;

describe('Advocacy Integration', () => {
    it('opens and closes advocacy flash cards from the dashboard', async () => {
        render(<PainTracker />);

        // 1. Verify Section Header
        expect(await screen.findByText('Digital Advocacy Cards')).toBeInTheDocument();

        // 2. Click the default card
        const cardButton = screen.getByText('Non-Verbal / Pain Episode');
        fireEvent.click(cardButton);

        // 3. Verify Flash Card Overlay
        // Look for the big text, targeting the heading specifically to distinguish from the button description
        await waitFor(() => {
             const headings = screen.getAllByRole('heading', { level: 1 });
             const flashCardHeading = headings.find(h => h.textContent === 'I am having a Chronic Pain Flare.');
             expect(flashCardHeading).toBeInTheDocument();
        });
        
        // Look for "Power: Advocacy Mode" footer
        expect(screen.getByText(/Advocacy Mode/)).toBeInTheDocument();

        // 4. Close the card
        const closeButton = screen.getByLabelText('Close Flash Card');
        fireEvent.click(closeButton);

        // 5. Verify it's gone
        await waitFor(() => {
            // Verify the unique footer text of the modal is gone
            expect(screen.queryByText(/Advocacy Mode/)).not.toBeInTheDocument();
             
            // Also ensure the button describing the flare is still there (dashboard is visible)
            expect(screen.getByText('Non-Verbal / Pain Episode')).toBeInTheDocument();
        });
    });
});

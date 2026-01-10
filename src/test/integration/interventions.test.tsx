import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { PainTracker } from '../../components/pain-tracker/index';

describe('Intervention Tools', () => {
    it('opens the Box Breathing tool from dashboard', async () => {
        render(<PainTracker />);

        // 1. Verify Card matches
        expect(await screen.findByText('Crisis Intervention')).toBeInTheDocument();
        
        // 2. Click Tool
        fireEvent.click(screen.getByText('Box Breathing'));

        // 3. Verify Modal Content
        expect(await screen.findByText('Breathing Pacer')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();

        // 4. Interaction (Start pacer)
        // Note: The Start button has text 'Start' inside it
        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);
        
        // Expect state change
        expect(await screen.findByText('Pause')).toBeInTheDocument();
        
        // 5. Close Modal (assuming close button exists on Modal or we can press Escape)
        // The accessible Modal usually has a close button.
        const closeButtons = screen.getAllByLabelText('Close modal'); 
        if (closeButtons.length > 0) {
            fireEvent.click(closeButtons[0]);
        } else {
            // Fallback: Press Escape
            fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
        }

        // 6. Verify closed
        await waitFor(() => {
             expect(screen.queryByRole('dialog', { name: 'Breathing Pacer' })).not.toBeInTheDocument();
        });
    });
});

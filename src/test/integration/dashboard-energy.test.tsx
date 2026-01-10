import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { PainTracker } from '../../components/pain-tracker/index'; // Explicit index import

// Mock dependencies if needed, e.g. IndexedDB or complex children
// For now, let's see if it renders with default mocks in test-utils

describe('Dashboard Energy Integration', () => {
    it('displays the Energy Budget Card on the main dashboard', async () => {
        console.log('PainTracker component:', PainTracker);
        render(<PainTracker />);
        
        // Check for the card title
        expect(await screen.findByText('Daily Energy')).toBeInTheDocument();
        
        // Check for the button
        expect(screen.getByText('Log Activity')).toBeInTheDocument();
    });
});

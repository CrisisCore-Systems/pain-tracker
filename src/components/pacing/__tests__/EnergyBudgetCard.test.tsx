import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { EnergyBudgetCard } from '../EnergyBudgetCard';
import { useEnergyStore } from '../../../stores/energy-store';
import { format } from 'date-fns';

describe('EnergyBudgetCard', () => {
    beforeEach(() => {
        useEnergyStore.setState({
            settings: { defaultDailyCapacity: 10, enableAlerts: true, alertThreshold: 0.8, autoResetTime: '04:00' },
            history: {}
        });
    });

    it('renders budget information', () => {
        render(<EnergyBudgetCard />);
        
        // 10.0 remaining / 10 capacity
        expect(screen.getByText('10.0')).toBeInTheDocument();
        expect(screen.getByText('/ 10')).toBeInTheDocument();
        expect(screen.getByText('Daily Energy')).toBeInTheDocument();
    });

    it('opens log modal when button is clicked', async () => {
        render(<EnergyBudgetCard />);
        
        const button = screen.getByText('Log Activity');
        fireEvent.click(button);
        
        expect(screen.getByText('Log Energy Activity')).toBeInTheDocument();
        expect(screen.getByLabelText(/Activity Name/i)).toBeInTheDocument();
    });

    it('updates budget when activity is logged', async () => {
        render(<EnergyBudgetCard />);
        
        // Open modal
        fireEvent.click(screen.getByText('Log Activity'));
        
        // Fill form
        const nameInput = screen.getByLabelText(/Activity Name/i);
        fireEvent.change(nameInput, { target: { value: 'Running' } });
        
        // Set cost (range input is tricky to change in jsdom, we rely on default or simple change)
        // Default cost is 1. The input is type='range'.
        
        // Submit
        const saveButton = screen.getByText('Save Entry');
        fireEvent.click(saveButton);
        
        // Modal should close
        await waitFor(() => {
             expect(screen.queryByText('Log Energy Activity')).not.toBeInTheDocument();
        });
        
        // Budget should decrease. 10 - 1 = 9.0
        expect(screen.getByText('9.0')).toBeInTheDocument();
    });
});

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AlertsActivityLog, { saveAlert, clearAlerts, acknowledgeAlert } from '../AlertsActivityLog';

describe('AlertsActivityLog', () => {
  beforeEach(() => {
    localStorage.removeItem('pain-tracker:alerts-log');
    vi.useRealTimers();
    // mock confirm to always return true for acknowledge and clear
    vi.stubGlobal('confirm', (msg: string) => true as any);
  });

  afterEach(() => {
    localStorage.removeItem('pain-tracker:alerts-log');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('renders no alerts placeholder', () => {
    const { container } = render(<AlertsActivityLog />);
    // Click the button to open the dialog
    const button = screen.getByText('Recent Alerts');
    fireEvent.click(button);
    expect(container.textContent).toContain('No recent alerts');
  });

  test('saveAlert shows alert and acknowledge clears single', () => {
    saveAlert({ id: 'a1', time: new Date().toISOString(), message: 'Test alert' });
    render(<AlertsActivityLog />);
    // Click the button to open the dialog
    const button = screen.getByText('Recent Alerts');
    fireEvent.click(button);
    expect(screen.getByText('Test alert')).toBeTruthy();
    const ack = screen.getByText('Acknowledge');
    fireEvent.click(ack);
    // after acknowledging (confirm mocked true), the list updates
    expect(screen.queryByText('Test alert')).toBeNull();
  });

  test('clearAlerts removes all alerts', async () => {
    saveAlert({ id: 'a1', time: new Date().toISOString(), message: 'One' });
    saveAlert({ id: 'a2', time: new Date().toISOString(), message: 'Two' });
    render(<AlertsActivityLog />);
    // Click the button to open the dialog
    const button = screen.getByText('Recent Alerts');
    fireEvent.click(button);
    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
    const clear = screen.getByText('Clear all');
    fireEvent.click(clear);
    // confirm dialog opens; our confirm is stubbed true; the modal will then clear and show Undo
    const yes = await screen.findByText('Yes, clear');
    fireEvent.click(yes);
    // Undo banner appears (wait for Undo button)
    const undo = await screen.findByText('Undo');
    fireEvent.click(undo);
    // original alerts restored
    expect(await screen.findByText('One')).toBeTruthy();
    expect(await screen.findByText('Two')).toBeTruthy();
  });
});

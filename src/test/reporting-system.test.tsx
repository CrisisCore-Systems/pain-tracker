import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { ReportingSystem } from '../components/reporting/ReportingSystem';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

vi.mock('../utils/pdfReportGenerator', () => ({
  generatePDFReport: vi.fn().mockResolvedValue(new Blob()),
  downloadPDF: vi.fn(),
}));
import { hipaaComplianceService } from '../services/HIPAACompliance';
import { generatePDFReport } from '../utils/pdfReportGenerator';

describe('Reporting System UI', () => {
  beforeEach(() => {
    // Reset scheduled reports
    usePainTrackerStore.setState({ scheduledReports: [] });
  });

  it('creates a scheduled report from the UI', async () => {
    render(<ReportingSystem entries={[]} />);

    // Select template in dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly-summary' } });

  // Click the Schedule button within the selected template card
  const titleElements = screen.getAllByText(/Weekly Pain Summary/i);
  const selectedTitle = titleElements.find(el => el.tagName === 'H4' || el.tagName === 'h4');
  const selectedContainer = selectedTitle?.closest('div');
  if (!selectedContainer) throw new Error('Selected template container not found');
  const { getByRole } = within(selectedContainer as HTMLElement);
  const scheduleButton = getByRole('button', { name: /Schedule/i });
  fireEvent.click(scheduleButton);

    // Modal should open with name input and recipients field
    const nameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    const recipientsInput = screen.getByPlaceholderText(/email@example.com/i);
    fireEvent.change(nameInput, { target: { value: 'Automated Weekly' } });
    fireEvent.change(recipientsInput, { target: { value: 'user@example.com' } });

  // Ensure modal is open by locating the Schedule Name label and querying within the modal
  const modalLabel = screen.getByText(/Schedule Name/i);
  const modalContainer = modalLabel.closest('div');
  if (!modalContainer) throw new Error('Modal container not found');
  // Find the modal's primary Schedule Report button (primary styled instead of outline)
  const sendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
  const modalSendButton = sendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
  if (!modalSendButton) throw new Error('Modal Schedule Report button not found');
  fireEvent.click(modalSendButton);

    await waitFor(() => {
      expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1);
    });

    const scheduled = usePainTrackerStore.getState().scheduledReports[0];
    expect(scheduled.name).toContain('Automated Weekly');
    expect(scheduled.recipients).toContain('user@example.com');
  });

  it('updates a scheduled report from the UI', async () => {
    render(<ReportingSystem entries={[]} />);

    // Create a schedule first
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly-summary' } });
    const titleElements = screen.getAllByText(/Weekly Pain Summary/i);
    const selectedTitle = titleElements.find(el => el.tagName === 'H4' || el.tagName === 'h4');
    const selectedContainer = selectedTitle?.closest('div');
    if (!selectedContainer) throw new Error('Selected template container not found');
    const { getByRole } = within(selectedContainer as HTMLElement);
    const scheduleButton = getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleButton);
    const nameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    const recipientsInput = screen.getByPlaceholderText(/email@example.com/i);
    fireEvent.change(nameInput, { target: { value: 'Editable Weekly' } });
    fireEvent.change(recipientsInput, { target: { value: 'edit@example.com' } });
    // Click Schedule Report button in modal
    const sendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
    const modalSendButton = sendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
    if (!modalSendButton) throw new Error('Modal Schedule Report button not found');
    fireEvent.click(modalSendButton);

    await waitFor(() => expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1));

    // Now edit the schedule
  const scheduleTitleEl = screen.getByText(/Editable Weekly/i);
  const scheduleCard = scheduleTitleEl.closest('div')?.parentElement;
    expect(scheduleCard).toBeTruthy();
    const { getAllByRole: getAllByRoleWithin } = within(scheduleCard as HTMLElement);
    const editButton = getAllByRoleWithin('button').find(b => b.textContent?.toLowerCase().includes('edit'));
    if (!editButton) throw new Error('Edit button not found');
    fireEvent.click(editButton as HTMLElement);

    // Modal should be open with values prefilled; change name and frequency
    const modalNameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    fireEvent.change(modalNameInput, { target: { value: 'Updated Weekly' } });
  const freqSelect = screen.getByLabelText(/Frequency/i);
  fireEvent.change(freqSelect, { target: { value: 'monthly' } });

    // Save changes
    const modalSendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
    const modalSend = modalSendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
    if (!modalSend) throw new Error('Modal Schedule Report button not found');
    fireEvent.click(modalSend);

    await waitFor(() => {
      const updated = usePainTrackerStore.getState().scheduledReports[0];
      expect(updated.name).toContain('Updated Weekly');
      expect(updated.frequency).toBe('monthly');
    });
  });

  it('toggles a schedule active/inactive via the UI', async () => {
    render(<ReportingSystem entries={[]} />);

    // Create a schedule first
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly-summary' } });
    const titleElements = screen.getAllByText(/Weekly Pain Summary/i);
    const selectedTitle = titleElements.find(el => el.tagName === 'H4' || el.tagName === 'h4');
    const selectedContainer = selectedTitle?.closest('div');
    if (!selectedContainer) throw new Error('Selected template container not found');
    const { getByRole } = within(selectedContainer as HTMLElement);
    const scheduleButton = getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleButton);
    const nameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    const recipientsInput = screen.getByPlaceholderText(/email@example.com/i);
    fireEvent.change(nameInput, { target: { value: 'Toggle Weekly' } });
    fireEvent.change(recipientsInput, { target: { value: 'toggle@example.com' } });
    const sendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
    const modalSendButton = sendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
    if (!modalSendButton) throw new Error('Modal Schedule Report button not found');
    fireEvent.click(modalSendButton);

    await waitFor(() => expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1));

  const toggleTitleEl = screen.getByText(/Toggle Weekly/i);
  const toggleCard = toggleTitleEl.closest('div')?.parentElement;
    expect(toggleCard).toBeTruthy();
  const { getAllByRole: getRolesWithin } = within(toggleCard as HTMLElement);
  const toggleBtn = getRolesWithin('switch').find(s => (s as HTMLElement).getAttribute('aria-label')?.toLowerCase().includes('toggle schedule'));
    if (!toggleBtn) throw new Error('Toggle button not found');

    // Toggle state
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      const schedule = usePainTrackerStore.getState().scheduledReports[0];
      expect(schedule.isActive).toBe(false);
    });
    // Toggle back
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      const schedule = usePainTrackerStore.getState().scheduledReports[0];
      expect(schedule.isActive).toBe(true);
    });
  });

  it('deletes a scheduled report via the UI', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    try {
      render(<ReportingSystem entries={[]} />);

    // Create a schedule
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly-summary' } });
    const titleElements = screen.getAllByText(/Weekly Pain Summary/i);
    const selectedTitle = titleElements.find(el => el.tagName === 'H4' || el.tagName === 'h4');
    const selectedContainer = selectedTitle?.closest('div');
    if (!selectedContainer) throw new Error('Selected template container not found');
    const { getByRole } = within(selectedContainer as HTMLElement);
    const scheduleButton = getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleButton);
    const nameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    const recipientsInput = screen.getByPlaceholderText(/email@example.com/i);
    fireEvent.change(nameInput, { target: { value: 'Deletable Weekly' } });
    fireEvent.change(recipientsInput, { target: { value: 'delete@example.com' } });
    const sendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
    const modalSendButton = sendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
    if (!modalSendButton) throw new Error('Modal Schedule Report button not found');
    fireEvent.click(modalSendButton);

    await waitFor(() => expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1));

    // Switch to fake timers only for the delayed-delete window.
    vi.useFakeTimers();

    // Delete the schedule via the icon button
    const titleEl = screen.getByText(/Deletable Weekly/i);
    const outer = titleEl.closest('div')?.parentElement;
    if (!outer) throw new Error('Schedule container not found');
    const { getAllByRole } = within(outer as HTMLElement);
    const deleteButton = getAllByRole('button').find(b => (b as HTMLButtonElement).getAttribute('aria-label')?.toLowerCase().includes('delete'));
    if (!deleteButton) throw new Error('Delete button not found');
    fireEvent.click(deleteButton);

    // Deletion is delayed to allow an undo window.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(0);
    } finally {
      confirmSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('runs a scheduled report via the UI', async () => {
  // generatePDFReport is mocked already via vi.mock at top; we'll assert it being called directly
    const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);

    render(<ReportingSystem entries={[]} />);

    // Create a schedule
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly-summary' } });
    const titleElements = screen.getAllByText(/Weekly Pain Summary/i);
    const selectedTitle = titleElements.find(el => el.tagName === 'H4' || el.tagName === 'h4');
    const selectedContainer = selectedTitle?.closest('div');
    if (!selectedContainer) throw new Error('Selected template container not found');
    const { getByRole } = within(selectedContainer as HTMLElement);
    const scheduleButton = getByRole('button', { name: /Schedule/i });
    fireEvent.click(scheduleButton);
    const nameInput = screen.getByPlaceholderText(/e.g., Weekly Summary Report/i);
    const recipientsInput = screen.getByPlaceholderText(/email@example.com/i);
    fireEvent.change(nameInput, { target: { value: 'Runnable Weekly' } });
    fireEvent.change(recipientsInput, { target: { value: 'run@example.com' } });
    const sendButtons = screen.getAllByRole('button', { name: /Schedule Report/i });
    const modalSendButton = sendButtons.find(b => (b as HTMLButtonElement).className.includes('bg-primary') || (b as HTMLButtonElement).className.includes('text-primary-foreground'));
    if (!modalSendButton) throw new Error('Modal Schedule Report button not found');
    fireEvent.click(modalSendButton);

    await waitFor(() => expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1));

    // Run the schedule via the UI Run now button
    const titleEl = screen.getByText(/Runnable Weekly/i);
    const outer = titleEl.closest('div')?.parentElement;
    if (!outer) throw new Error('Schedule container not found');
    const { getAllByRole } = within(outer as HTMLElement);
    const runButton = getAllByRole('button').find(b => (b as HTMLButtonElement).getAttribute('aria-label')?.toLowerCase().includes('run now'));
    if (!runButton) throw new Error('Run now button not found');
    fireEvent.click(runButton);

  await waitFor(() => expect(generatePDFReport).toHaveBeenCalled());
    // Last run should be updated
    await waitFor(() => expect(usePainTrackerStore.getState().scheduledReports[0].lastRun).toBeDefined());
    expect(auditSpy).toHaveBeenCalled();
    auditSpy.mockRestore();
  });
});

import { usePainTrackerStore } from '../stores/pain-tracker-store';
import { hipaaComplianceService } from '../services/HIPAACompliance';
import * as pdfGen from '../utils/pdfReportGenerator';

describe('Scheduled Reports Store Actions', () => {
  beforeEach(() => {
    // Reset store to a clean state by clearing existing scheduledReports
    usePainTrackerStore.setState({ scheduledReports: [] });
  });

  it('adds a scheduled report', () => {
    const newReport = {
      id: 'test-1',
      templateId: 'weekly-summary',
      name: 'Weekly Summary Test',
      frequency: 'weekly' as const,
      recipients: ['test@example.com'],
      nextRun: new Date().toISOString(),
      lastRun: undefined,
      isActive: true,
    };

  const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);
  usePainTrackerStore.getState().addScheduledReport(newReport);
    const current = usePainTrackerStore.getState().scheduledReports;
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe('test-1');
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'create', resourceType: 'ScheduledReport', resourceId: 'test-1' }));
    auditSpy.mockRestore();
  });

  it('deletes a scheduled report', () => {
    const newReport = {
      id: 'test-2',
      templateId: 'progress-report',
      name: 'Progress Test',
      frequency: 'monthly' as const,
      recipients: ['a@example.com'],
      nextRun: new Date().toISOString(),
      lastRun: undefined,
      isActive: true,
    };

  const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);
  usePainTrackerStore.getState().addScheduledReport(newReport);
    expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(1);

  usePainTrackerStore.getState().deleteScheduledReport('test-2');
    expect(usePainTrackerStore.getState().scheduledReports).toHaveLength(0);
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'delete', resourceType: 'ScheduledReport', resourceId: 'test-2' }));
    auditSpy.mockRestore();
  });

  it('updates a scheduled report', () => {
    const newReport = {
      id: 'test-3',
      templateId: 'monthly-clinical',
      name: 'Monthly Clinical',
      frequency: 'monthly' as const,
      recipients: ['b@example.com'],
      nextRun: new Date().toISOString(),
      lastRun: undefined,
      isActive: true,
    };

  const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);
  usePainTrackerStore.getState().addScheduledReport(newReport);
  usePainTrackerStore.getState().updateScheduledReport('test-3', { name: 'Updated Name' });
    const updated = usePainTrackerStore.getState().scheduledReports.find(s => s.id === 'test-3');
    expect(updated?.name).toBe('Updated Name');
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'update', resourceType: 'ScheduledReport', resourceId: 'test-3' }));
    auditSpy.mockRestore();
  });

  it('toggles active state of a scheduled report', () => {
    const newReport = {
      id: 'test-4',
      templateId: 'weekly-summary',
      name: 'Toggle Test',
      frequency: 'weekly' as const,
      recipients: ['c@example.com'],
      nextRun: new Date().toISOString(),
      lastRun: undefined,
      isActive: true,
    };
  const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);
  usePainTrackerStore.getState().addScheduledReport(newReport);
  usePainTrackerStore.getState().updateScheduledReport('test-4', { isActive: false });
    const updated = usePainTrackerStore.getState().scheduledReports.find(s => s.id === 'test-4');
    expect(updated?.isActive).toBe(false);
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'update', resourceType: 'ScheduledReport', resourceId: 'test-4' }));
    auditSpy.mockRestore();
  });

  it('runs a scheduled report and logs audit and updates lastRun', async () => {
    const auditSpy = vi.spyOn(hipaaComplianceService, 'logAuditEvent').mockResolvedValue(undefined);
  const pdfSpy = vi.spyOn(pdfGen, 'generatePDFReport').mockResolvedValue(new Blob());

    const newReport = {
      id: 'test-5',
      templateId: 'weekly-summary',
      name: 'Run Now Test',
      frequency: 'weekly' as const,
      recipients: ['d@example.com'],
      nextRun: new Date().toISOString(),
      lastRun: undefined,
      isActive: true,
    };
    usePainTrackerStore.getState().addScheduledReport(newReport);
    await usePainTrackerStore.getState().runScheduledReport('test-5');

    const updated = usePainTrackerStore.getState().scheduledReports.find(s => s.id === 'test-5');
    expect(updated?.lastRun).toBeDefined();
    expect(pdfSpy).toHaveBeenCalled();
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'export', resourceType: 'ScheduledReport', resourceId: 'test-5' }));
    auditSpy.mockRestore();
    pdfSpy.mockRestore();
  });
});

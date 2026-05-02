import { describe, expect, it } from 'vitest';
import {
  buildClinicalExportNoEntriesMessage,
  buildExportDownloadedMessage,
  buildExportFailedMessage,
  buildExportLimitMessage,
  buildExportNoDataMessage,
  buildExportWorkspaceMessage,
} from './exportCopy';

describe('exportCopy', () => {
  it('builds consistent downloaded copy', () => {
    expect(buildExportDownloadedMessage('PDF report')).toBe('Your PDF report has been downloaded.');
  });

  it('builds consistent failed copy', () => {
    expect(buildExportFailedMessage('clinical PDF report')).toBe(
      'Unable to generate the clinical PDF report. Please try again.'
    );
  });

  it('builds consistent no-data copy', () => {
    expect(buildExportNoDataMessage('report')).toBe(
      'There are no entries to export for the selected date range.'
    );
    expect(buildExportNoDataMessage('entries')).toBe(
      'There are no entries to include in this report.'
    );
    expect(buildClinicalExportNoEntriesMessage()).toBe(
      'There are no pain entries to include in this export yet.'
    );
  });

  it('builds consistent limit and workspace copy', () => {
    expect(buildExportLimitMessage('basic')).toBe(
      "You have reached this plan's export limit. Upgrade to Basic or higher for more export room."
    );
    expect(buildExportWorkspaceMessage('Clinical PDF export')).toBe(
      'Clinical PDF export stays in Reports & Export. Open the Reports page to generate it.'
    );
  });
});
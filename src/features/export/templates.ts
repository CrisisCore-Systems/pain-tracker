export const REPORT_TEMPLATES = {
  generalPractitioner: {
    id: 'gp-brief',
    title: 'GP Brief Summary',
    description: 'One-page summary for general practitioners with recent pain entries and trends',
    fields: ['patientName', 'dateRange', 'painSummary', 'medications', 'recentEntries']
  },
  physio: {
    id: 'physio-detailed',
    title: 'Physiotherapist Detailed Report',
    description: 'Detailed report with activity limitations and range-of-motion notes',
    fields: ['patientName', 'dateRange', 'painOverTime', 'activityLimitations', 'therapyNotes']
  },
  occupationalTherapist: {
    id: 'ot-workfit',
    title: 'Occupational Therapy / Work Fit',
    description: 'Work-focused report for workplace accommodations and return-to-work planning',
    fields: ['patientName', 'dateRange', 'workImpact', 'recommendations', 'wcbReportIncluded']
  }
};

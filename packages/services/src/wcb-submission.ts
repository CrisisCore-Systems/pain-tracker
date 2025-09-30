import type { WCBReport } from './types';

export async function submitToWCB(_report: WCBReport, _options?: any) {
  return { success: false, error: 'API key required' };
}

export async function getSubmissionStatus(_submissionId: string) { return { status: 'pending' }; }

export async function updateSubmission(_submissionId: string, _report: WCBReport) { return { success: false }; }

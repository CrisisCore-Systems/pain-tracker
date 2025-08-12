import type { WCBReport } from '../types';

interface SubmissionResponse {
  success: boolean;
  submissionId?: string;
  error?: string;
}

interface SubmissionOptions {
  endpoint?: string;
  apiKey?: string;
  isDraft?: boolean;
}

const DEFAULT_ENDPOINT = process.env.VITE_WCB_API_ENDPOINT || 'https://api.wcb.gov/submissions';

export async function submitToWCB(
  report: WCBReport,
  options: SubmissionOptions = {}
): Promise<SubmissionResponse> {
  const {
    endpoint = DEFAULT_ENDPOINT,
    apiKey = undefined /* proxy-auth */,
    isDraft = false,
  } = options;

  if (!apiKey) {
    throw new Error('WCB API key is required for submission');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization moved to proxy
        'X-Submission-Type': isDraft ? 'draft' : 'final',
      },
      body: JSON.stringify({
        report,
        metadata: {
          submittedAt: new Date().toISOString(),
          isDraft,
          version: '1.0',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit report to WCB');
    }

    const data = await response.json();
    return {
      success: true,
      submissionId: data.submissionId,
    };
  } catch (error) {
    console.error('WCB submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getSubmissionStatus(
  submissionId: string,
  options: Pick<SubmissionOptions, 'endpoint' | 'apiKey'> = {}
): Promise<{
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  message?: string;
}> {
  const { endpoint = DEFAULT_ENDPOINT, apiKey = undefined /* proxy-auth */ } = options;

  if (!apiKey) {
    throw new Error('WCB API key is required to check submission status');
  }

  const response = await fetch(`${endpoint}/status/${submissionId}`, {
    headers: {
      // Authorization moved to proxy
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch submission status');
  }

  return response.json();
}

export async function updateSubmission(
  submissionId: string,
  report: WCBReport,
  options: SubmissionOptions = {}
): Promise<SubmissionResponse> {
  const {
    endpoint = DEFAULT_ENDPOINT,
    apiKey = undefined /* proxy-auth */,
    isDraft = false,
  } = options;

  if (!apiKey) {
    throw new Error('WCB API key is required to update submission');
  }

  try {
    const response = await fetch(`${endpoint}/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Authorization moved to proxy
        'X-Submission-Type': isDraft ? 'draft' : 'final',
      },
      body: JSON.stringify({
        report,
        metadata: {
          updatedAt: new Date().toISOString(),
          isDraft,
          version: '1.0',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update WCB submission');
    }

    const data = await response.json();
    return {
      success: true,
      submissionId: data.submissionId,
    };
  } catch (error) {
    console.error('WCB update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

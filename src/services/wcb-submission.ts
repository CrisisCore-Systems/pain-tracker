import type { WCBReport } from '../types';
import { validateWCBReport } from '../lib/validation';

interface SubmissionResponse {
  success: boolean;
  submissionId?: string;
  error?: string;
  retryAfter?: number;
  validationErrors?: Array<{ field: string; message: string }>;
}

interface SubmissionOptions {
  isDraft?: boolean;
  retryCount?: number;
}

interface QueuedSubmission {
  id: string;
  report: WCBReport;
  options: SubmissionOptions;
  timestamp: number;
  retryCount: number;
}

// Circuit breaker state
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 60000; // 1 minute

  canExecute(): boolean {
    if (this.state === 'closed') return true;
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    
    return true; // half-open
  }

  onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      nextRetryAt: this.state === 'open' ? this.lastFailureTime + this.resetTimeout : null
    };
  }
}

// Local submission queue for failed requests
class SubmissionQueue {
  private queue: QueuedSubmission[] = [];
  private readonly storageKey = 'wcb_submission_queue';

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load submission queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save submission queue:', error);
    }
  }

  add(submission: Omit<QueuedSubmission, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedSubmission: QueuedSubmission = {
      ...submission,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.queue.push(queuedSubmission);
    this.saveQueue();
  }

  getAll(): QueuedSubmission[] {
    return [...this.queue];
  }

  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  incrementRetry(id: string): void {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.retryCount++;
      this.saveQueue();
    }
  }

  clear(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// Global instances
const circuitBreaker = new CircuitBreaker();
const submissionQueue = new SubmissionQueue();

// Exponential backoff utility
function calculateBackoffDelay(retryCount: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const API_PROXY_ENDPOINT = '/api/wcb';

export async function submitToWCB(
  report: WCBReport,
  options: SubmissionOptions = {}
): Promise<SubmissionResponse> {
  const { isDraft = false, retryCount = 0 } = options;
  
  // Validate the report data before submission
  const validation = validateWCBReport(report);
  if (!validation.valid) {
    return {
      success: false,
      error: 'Report validation failed',
      validationErrors: validation.errors
    };
  }
  
  // Use validated data
  const validatedReport = validation.data;
  
  // Check circuit breaker
  if (!circuitBreaker.canExecute()) {
    const status = circuitBreaker.getStatus();
    const retryAfter = status.nextRetryAt ? Math.ceil((status.nextRetryAt - Date.now()) / 1000) : 60;
    
    // Queue for later retry
    submissionQueue.add({ report: validatedReport, options });
    
    return {
      success: false,
      error: 'Service temporarily unavailable due to repeated failures',
      retryAfter
    };
  }

  try {
    const response = await fetch(`${API_PROXY_ENDPOINT}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Submission-Type': isDraft ? 'draft' : 'final'
      },
      body: JSON.stringify({
        report: validatedReport,
        metadata: {
          submittedAt: new Date().toISOString(),
          isDraft,
          version: '1.0'
        }
      })
    });

    if (!response.ok) {
      let error;
      try {
        const errorData = await response.json();
        error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } catch {
        error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw error;
    }

    const data = await response.json();
    
    // Success - record it with circuit breaker
    circuitBreaker.onSuccess();
    
    return {
      success: true,
      submissionId: data.submissionId
    };
    
  } catch (error) {
    console.error('WCB submission error:', error);
    
    // Record failure with circuit breaker
    circuitBreaker.onFailure();
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // For retryable errors, add exponential backoff
    if (retryCount < 3 && (
      errorMessage.includes('network') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('500') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503')
    )) {
      const delay = calculateBackoffDelay(retryCount);
      
      // Add to queue for later retry
      submissionQueue.add({ report: validatedReport, options: { ...options, retryCount: retryCount + 1 } });
      
      return {
        success: false,
        error: `${errorMessage}. Retrying in ${Math.ceil(delay / 1000)} seconds...`,
        retryAfter: Math.ceil(delay / 1000)
      };
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function getSubmissionStatus(
  submissionId: string
): Promise<{
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  message?: string;
}> {
  // Check circuit breaker
  if (!circuitBreaker.canExecute()) {
    throw new Error('Service temporarily unavailable due to repeated failures');
  }

  try {
    const response = await fetch(`${API_PROXY_ENDPOINT}/submissions/status/${submissionId}`);

    if (!response.ok) {
      circuitBreaker.onFailure();
      throw new Error('Failed to fetch submission status');
    }

    circuitBreaker.onSuccess();
    return response.json();
  } catch (error) {
    circuitBreaker.onFailure();
    throw error;
  }
}

export async function updateSubmission(
  submissionId: string,
  report: WCBReport,
  options: SubmissionOptions = {}
): Promise<SubmissionResponse> {
  const { isDraft = false, retryCount = 0 } = options;
  
  // Check circuit breaker
  if (!circuitBreaker.canExecute()) {
    const status = circuitBreaker.getStatus();
    const retryAfter = status.nextRetryAt ? Math.ceil((status.nextRetryAt - Date.now()) / 1000) : 60;
    
    return {
      success: false,
      error: 'Service temporarily unavailable due to repeated failures',
      retryAfter
    };
  }

  try {
    const response = await fetch(`${API_PROXY_ENDPOINT}/submissions/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Submission-Type': isDraft ? 'draft' : 'final'
      },
      body: JSON.stringify({
        report,
        metadata: {
          updatedAt: new Date().toISOString(),
          isDraft,
          version: '1.0'
        }
      })
    });

    if (!response.ok) {
      let error;
      try {
        const errorData = await response.json();
        error = new Error(errorData.message || 'Failed to update WCB submission');
      } catch {
        error = new Error('Failed to update WCB submission');
      }
      throw error;
    }

    const data = await response.json();
    
    // Success
    circuitBreaker.onSuccess();
    
    return {
      success: true,
      submissionId: data.submissionId
    };
  } catch (error) {
    console.error('WCB update error:', error);
    circuitBreaker.onFailure();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Queue management functions
export function getQueuedSubmissions(): QueuedSubmission[] {
  return submissionQueue.getAll();
}

export function clearSubmissionQueue(): void {
  submissionQueue.clear();
}

export function getCircuitBreakerStatus() {
  return circuitBreaker.getStatus();
}

// Process queued submissions (should be called periodically)
export async function processQueuedSubmissions(): Promise<void> {
  const queued = submissionQueue.getAll();
  
  for (const item of queued) {
    // Don't retry items that have exceeded max retry count
    if (item.retryCount >= 3) {
      submissionQueue.remove(item.id);
      continue;
    }
    
    // Apply exponential backoff
    const timeSinceLastTry = Date.now() - item.timestamp;
    const backoffDelay = calculateBackoffDelay(item.retryCount);
    
    if (timeSinceLastTry < backoffDelay) {
      continue; // Too soon to retry
    }
    
    try {
      const result = await submitToWCB(item.report, {
        ...item.options,
        retryCount: item.retryCount + 1
      });
      
      if (result.success) {
        // Success - remove from queue
        submissionQueue.remove(item.id);
      } else if (!result.retryAfter) {
        // Permanent failure - remove from queue
        submissionQueue.remove(item.id);
      } else {
        // Update retry count for next attempt
        submissionQueue.incrementRetry(item.id);
      }
    } catch (error) {
      // Increment retry count and continue
      submissionQueue.incrementRetry(item.id);
    }
  }
} 
import { wcbBreaker } from './circuit-breaker';
import { z } from 'zod';

// Define custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Input validation schemas
const SubmissionDataSchema = z.object({
  painEntries: z.array(z.object({
    intensity: z.number().min(0).max(10),
    location: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    timestamp: z.string().datetime(),
    medications: z.array(z.string()).optional(),
    symptoms: z.array(z.string()).optional(),
  })),
  personalInfo: z.object({
    claimNumber: z.string().optional(),
    name: z.string().min(1).max(100),
    dateOfBirth: z.string().optional(),
  }).optional(),
  reportType: z.enum(['pain-tracking', 'wcb-submission']).default('pain-tracking'),
});

type SubmissionData = z.infer<typeof SubmissionDataSchema>;

// Configuration
const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  baseUrl: import.meta.env.VITE_WCB_API_ENDPOINT || '/api/wcb',
};

// Helper function for delays
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Enhanced fetch with timeout and retry logic
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeout: number = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timeout', error);
    }
    throw new NetworkError('Network request failed', error as Error);
  }
}

// Main API submission function with comprehensive error handling
export async function wcbSubmit(data: SubmissionData): Promise<unknown> {
  // Check circuit breaker first
  if (wcbBreaker.isOpen) {
    throw new ApiError(
      'Service temporarily unavailable: Too many API failures. Please try again later.',
      503,
      'CIRCUIT_BREAKER_OPEN'
    );
  }

  // Validate input data
  try {
    SubmissionDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Invalid ${firstError.path.join('.')}: ${firstError.message}`,
        firstError.path.join('.')
      );
    }
    throw new ValidationError('Invalid input data');
  }

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${API_CONFIG.baseUrl}/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
          },
          body: JSON.stringify(data),
        }
      );

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        wcbBreaker.failure();
        
        if (response.status >= 400 && response.status < 500) {
          // Client errors - don't retry
          throw new ApiError(
            `Request failed: ${errorText}`,
            response.status,
            response.status === 401 ? 'UNAUTHORIZED' : 
            response.status === 403 ? 'FORBIDDEN' : 
            response.status === 404 ? 'NOT_FOUND' : 
            'CLIENT_ERROR'
          );
        } else {
          // Server errors - may retry
          throw new ApiError(
            `Server error: ${errorText}`,
            response.status,
            'SERVER_ERROR'
          );
        }
      }

      // Success
      wcbBreaker.success();
      return await response.json();

    } catch (error) {
      lastError = error as Error;
      wcbBreaker.failure();

      // Don't retry on client errors or validation errors
      if (error instanceof ApiError && error.status && error.status < 500) {
        throw error;
      }
      if (error instanceof ValidationError) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < API_CONFIG.retryAttempts) {
        await delay(API_CONFIG.retryDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  // All retries failed
  throw lastError || new ApiError('Request failed after all retries', 500, 'MAX_RETRIES_EXCEEDED');
}

import { ApiError, NetworkError } from '../api-client';

export interface FetcherOptions extends RequestInit {
  timeout?: number; // ms
  retries?: number;
  retryDelay?: number; // ms
}

const DEFAULTS = { timeout: 15000, retries: 2, retryDelay: 500 };

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function fetcher<T = unknown>(url: string, opts: FetcherOptions = {}): Promise<T> {
  const { timeout = DEFAULTS.timeout, retries = DEFAULTS.retries, retryDelay = DEFAULTS.retryDelay, ...rest } = opts;

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...rest, signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        // map 4xx to ApiError with status
        throw new ApiError(text || res.statusText || 'HTTP error', res.status);
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return (await res.json()) as T;
      // otherwise return text as unknown
      return (await res.text()) as unknown as T;
    } catch (err) {
      clearTimeout(id);
      if (err instanceof Error && err.name === 'AbortError') {
        lastErr = new NetworkError('Request timeout', err);
      } else if (err instanceof ApiError) {
        // don't retry client errors
        if (err.status && err.status < 500) throw err;
        lastErr = err;
      } else if (err instanceof Error) {
        lastErr = new NetworkError(err.message, err);
      } else {
        lastErr = new NetworkError('Unknown network error');
      }

      if (attempt < retries) await delay(retryDelay * Math.pow(2, attempt));
    }
  }

  throw lastErr || new NetworkError('Request failed');
}

export default fetcher;

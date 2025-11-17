import { useCallback, useRef } from 'react';

export interface UseAsyncRetryOptions {
  retries?: number;
  retryDelay?: number;
}

export function useAsyncRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  opts: UseAsyncRetryOptions = {}
) {
  const { retries = 2, retryDelay = 500 } = opts;
  const running = useRef(false);

  const run = useCallback(
    async (...args: Parameters<T>) => {
      if (running.current) return;
      running.current = true;
      let lastErr: unknown;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const out = await fn(...args);
          running.current = false;
          return out;
        } catch (e) {
          lastErr = e;
          if (attempt < retries)
            await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
        }
      }
      running.current = false;
      throw lastErr;
    },
    [fn, retries, retryDelay]
  );

  return { run };
}

export default useAsyncRetry;

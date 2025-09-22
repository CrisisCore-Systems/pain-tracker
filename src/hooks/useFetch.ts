import { useState, useEffect, useCallback } from 'react';
import fetcher from '../lib/http/fetcher';
import useIsMounted from './useIsMounted';

export function useFetch<T = unknown>(url?: string, opts?: Parameters<typeof fetcher>[1]) {
  const mounted = useIsMounted();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (u?: string) => {
    if (!u) return;
    setLoading(true);
    setError(null);
    try {
      const out = await fetcher<T>(u, opts);
      if (mounted.current) setData(out);
      return out;
    } catch (e) {
      if (mounted.current) setError(e);
      throw e;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [opts, mounted]);

  useEffect(() => {
    if (!url) return;
    void load(url);
  }, [url, load]);

  return { data, loading, error, reload: () => load(url) };
}

export default useFetch;

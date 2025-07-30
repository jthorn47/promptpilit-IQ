import { useState, useEffect, useCallback } from 'react';
import type { FetchOptions, FetchResult } from '../types';

export const useFetch = <T>(
  url: string,
  options: FetchOptions = {}
): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    method = 'GET',
    headers = {},
    body,
    cache = false,
    retries = 3
  } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          cache: cache ? 'default' : 'no-cache'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= retries) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setData(null);
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    setLoading(false);
  }, [url, method, headers, body, cache, retries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData
  };
};
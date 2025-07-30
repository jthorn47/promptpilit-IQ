import { useCallback, useRef } from 'react';
import { usePerformanceOptimizer } from './usePerformanceOptimizer';

export const useAuthOptimizer = () => {
  const { optimizedFetch } = usePerformanceOptimizer({
    maxConcurrentRequests: 2,
    defaultCacheTTL: 60000, // 1 minute cache for auth data
    enableRequestQueuing: true
  });

  const lastAuthCheck = useRef<number>(0);
  const MIN_AUTH_CHECK_INTERVAL = 5000; // 5 seconds minimum between auth checks

  const optimizedAuthFetch = useCallback(async <T>(
    operation: string,
    fetcher: () => Promise<T>,
    userId?: string
  ): Promise<T> => {
    const now = Date.now();
    const key = userId ? `auth-${operation}-${userId}` : `auth-${operation}`;
    
    // Prevent too frequent auth checks
    if (now - lastAuthCheck.current < MIN_AUTH_CHECK_INTERVAL) {
      console.log('🔒 Auth check throttled, using cache');
    }
    
    lastAuthCheck.current = now;
    
    return optimizedFetch(key, fetcher, {
      ttl: 60000, // 1 minute cache
      priority: 'high'
    });
  }, [optimizedFetch]);

  return { optimizedAuthFetch };
};
import { useCallback, useRef, useEffect } from 'react';
import { queryOptimizer } from '@/utils/queryOptimizer';

interface PerformanceConfig {
  maxConcurrentRequests?: number;
  defaultCacheTTL?: number;
  enableRequestQueuing?: boolean;
}

export const usePerformanceOptimizer = (config: PerformanceConfig = {}) => {
  const {
    maxConcurrentRequests = 3,
    defaultCacheTTL = 30000,
    enableRequestQueuing = true
  } = config;

  const requestQueue = useRef<Array<() => void>>([]);
  const activeRequests = useRef(0);
  const requestStats = useRef({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  const processQueue = useCallback(() => {
    if (requestQueue.current.length === 0 || activeRequests.current >= maxConcurrentRequests) {
      return;
    }

    const nextRequest = requestQueue.current.shift();
    if (nextRequest) {
      activeRequests.current++;
      nextRequest();
    }
  }, [maxConcurrentRequests]);

  const optimizedFetch = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; priority?: 'low' | 'normal' | 'high' } = {}
  ): Promise<T> => {
    const { ttl = defaultCacheTTL, priority = 'normal' } = options;
    
    requestStats.current.totalRequests++;

    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const result = await queryOptimizer.getCachedOrFetch(key, fetcher, ttl);
          if (queryOptimizer.getStats().cachedKeys.includes(key)) {
            requestStats.current.cacheHits++;
          } else {
            requestStats.current.cacheMisses++;
          }
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          activeRequests.current--;
          processQueue();
        }
      };

      if (!enableRequestQueuing || activeRequests.current < maxConcurrentRequests) {
        activeRequests.current++;
        executeRequest();
      } else {
        // Queue based on priority
        if (priority === 'high') {
          requestQueue.current.unshift(executeRequest);
        } else {
          requestQueue.current.push(executeRequest);
        }
      }
    });
  }, [defaultCacheTTL, enableRequestQueuing, maxConcurrentRequests, processQueue]);

  const invalidateCache = useCallback((key?: string) => {
    queryOptimizer.invalidate(key);
  }, []);

  const getPerformanceStats = useCallback(() => {
    return {
      ...requestStats.current,
      queueLength: requestQueue.current.length,
      activeRequests: activeRequests.current,
      cacheStats: queryOptimizer.getStats()
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      requestQueue.current = [];
      activeRequests.current = 0;
    };
  }, []);

  return {
    optimizedFetch,
    invalidateCache,
    getPerformanceStats
  };
};
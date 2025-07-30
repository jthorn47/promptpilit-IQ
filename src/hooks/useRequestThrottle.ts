import { useRef, useCallback } from 'react';

interface PendingRequest {
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

/**
 * Hook to prevent duplicate requests by throttling and deduplicating identical requests
 */
export const useRequestThrottle = () => {
  const pendingRequests = useRef<Map<string, PendingRequest>>(new Map());
  const lastRequestTime = useRef<Map<string, number>>(new Map());

  const throttledRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>,
    throttleMs: number = 500
  ): Promise<T> => {
    const now = Date.now();
    const lastTime = lastRequestTime.current.get(key) || 0;

    // If we have a pending request for this key, return the existing promise
    if (pendingRequests.current.has(key)) {
      console.log('🔄 Deduplicating request:', key);
      return pendingRequests.current.get(key)!.promise;
    }

    // If request is too recent, throttle it
    if (now - lastTime < throttleMs) {
      console.log('🛑 Throttling request:', key, 'wait:', throttleMs - (now - lastTime), 'ms');
      await new Promise(resolve => setTimeout(resolve, throttleMs - (now - lastTime)));
    }

    // Create new request
    console.log('🚀 Making new request:', key);
    lastRequestTime.current.set(key, Date.now());

    let resolve: (value: T) => void;
    let reject: (error: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const pendingRequest: PendingRequest = {
      promise,
      resolve: resolve!,
      reject: reject!
    };

    pendingRequests.current.set(key, pendingRequest);

    try {
      const result = await requestFn();
      pendingRequest.resolve(result);
      return result;
    } catch (error) {
      pendingRequest.reject(error);
      throw error;
    } finally {
      pendingRequests.current.delete(key);
    }
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      pendingRequests.current.delete(key);
      lastRequestTime.current.delete(key);
    } else {
      pendingRequests.current.clear();
      lastRequestTime.current.clear();
    }
  }, []);

  return { throttledRequest, clearCache };
};
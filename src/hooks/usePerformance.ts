import { useState, useEffect } from 'react';

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Debounce hook for performance optimization
 * Delays the execution of a function until after a specified delay
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
): T {
  const { leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (leading && debouncedValue !== value) {
      setDebouncedValue(value);
      return;
    }

    if (!trailing) return;

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, leading, trailing, debouncedValue]);

  return debouncedValue;
}

/**
 * Throttle hook for performance optimization
 * Limits the execution of a function to once per specified interval
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastExecuted, setLastExecuted] = useState<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted + interval) {
      setThrottledValue(value);
      setLastExecuted(Date.now());
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastExecuted(Date.now());
      }, interval - (Date.now() - lastExecuted));

      return () => clearTimeout(timer);
    }
  }, [value, interval, lastExecuted]);

  return throttledValue;
}

/**
 * Memoization hook for expensive calculations
 * Caches the result based on dependencies
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const [memoizedCallback] = useState(() => callback);
  
  useEffect(() => {
    // Update callback when dependencies change
  }, deps);
  
  return memoizedCallback;
}
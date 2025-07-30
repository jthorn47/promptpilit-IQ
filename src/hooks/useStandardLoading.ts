import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  loading: boolean;
  loadingStates: Record<string, boolean>;
}

interface UseStandardLoadingReturn extends LoadingState {
  setLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  isAnyLoading: () => boolean;
  withLoading: <T>(
    fn: () => Promise<T>,
    key?: string
  ) => Promise<T>;
  clearAllLoading: () => void;
}

/**
 * Standardized loading state management hook
 * Provides consistent loading indicators and async operation wrapping
 */
export const useStandardLoading = (): UseStandardLoadingReturn => {
  const [loading, setGlobalLoading] = useState(false);
  const [loadingStates, setLoadingStatesMap] = useState<Record<string, boolean>>({});
  const operationCounterRef = useRef(0);

  const setLoading = useCallback((isLoading: boolean) => {
    setGlobalLoading(isLoading);
  }, []);

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoadingStatesMap(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isAnyLoading = useCallback(() => {
    return loading || Object.values(loadingStates).some(Boolean);
  }, [loading, loadingStates]);

  const clearAllLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingStatesMap({});
  }, []);

  const withLoading = useCallback(async <T>(
    fn: () => Promise<T>,
    key?: string
  ): Promise<T> => {
    const operationId = key || `operation-${++operationCounterRef.current}`;
    
    try {
      if (key) {
        setLoadingState(key, true);
      } else {
        setLoading(true);
      }
      
      const result = await fn();
      return result;
    } finally {
      if (key) {
        setLoadingState(key, false);
      } else {
        setLoading(false);
      }
    }
  }, [setLoading, setLoadingState]);

  return {
    loading,
    loadingStates,
    setLoading,
    setLoadingState,
    isAnyLoading,
    withLoading,
    clearAllLoading
  };
};
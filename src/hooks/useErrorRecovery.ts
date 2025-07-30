
import { useState, useCallback, useEffect } from 'react';
import { errorReporter } from '@/services/errorReporting';

interface UseErrorRecoveryOptions {
  component?: string;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

export const useErrorRecovery = (options: UseErrorRecoveryOptions = {}) => {
  const {
    component = 'Unknown',
    maxRetries = 3,
    retryDelay = 1000,
    onError
  } = options;

  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    error?: Error;
    retryCount: number;
    canRetry: boolean;
  }>({
    hasError: false,
    retryCount: 0,
    canRetry: true
  });

  const reportError = useCallback((error: Error, context?: any) => {
    const errorId = errorReporter.reportError(error, {
      component,
      ...context
    }, 'medium');

    setErrorState(prev => ({
      hasError: true,
      error,
      retryCount: prev.retryCount,
      canRetry: prev.retryCount < maxRetries
    }));

    onError?.(error);
    return errorId;
  }, [component, maxRetries, onError]);

  const retry = useCallback(async () => {
    if (errorState.retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) exceeded for ${component}`);
      return false;
    }

    setErrorState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1
    }));

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    setErrorState({
      hasError: false,
      retryCount: errorState.retryCount + 1,
      canRetry: errorState.retryCount + 1 < maxRetries
    });

    return true;
  }, [errorState.retryCount, maxRetries, component, retryDelay]);

  const reset = useCallback(() => {
    setErrorState({
      hasError: false,
      retryCount: 0,
      canRetry: true
    });
  }, []);

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    try {
      const result = await operation();
      // Reset on success
      if (errorState.hasError) {
        reset();
      }
      return result;
    } catch (error) {
      reportError(error as Error, context);
      return null;
    }
  }, [errorState.hasError, reportError, reset]);

  return {
    ...errorState,
    reportError,
    retry,
    reset,
    withErrorHandling
  };
};

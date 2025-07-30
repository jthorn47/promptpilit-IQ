import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string | null;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: string;
  fallbackMessage?: string;
}

interface UseStandardErrorReturn extends ErrorState {
  setError: (error: Error | null) => void;
  clearError: () => void;
  handleError: (error: unknown, options?: ErrorHandlerOptions) => void;
  wrapAsync: <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
}

/**
 * Standardized error handling hook
 * Provides consistent error state management and user feedback
 */
export const useStandardError = (): UseStandardErrorReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: null
  });
  
  const { toast } = useToast();

  const setError = useCallback((error: Error | null) => {
    setErrorState({
      error,
      isError: !!error,
      errorMessage: error?.message || null
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: null
    });
  }, []);

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      context = 'Unknown',
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    let processedError: Error;

    // Normalize error to Error instance
    if (error instanceof Error) {
      processedError = error;
    } else if (typeof error === 'string') {
      processedError = new Error(error);
    } else if (error && typeof error === 'object' && 'message' in error) {
      processedError = new Error(String(error.message));
    } else {
      processedError = new Error(fallbackMessage);
    }

    // Set error state
    setError(processedError);

    // Log error if enabled
    if (logError) {
      logger.error(`Error in ${context}`, {
        error: processedError,
        context,
        stack: processedError.stack
      });
    }

    // Show toast if enabled
    if (showToast) {
      toast({
        title: 'Error',
        description: processedError.message,
        variant: 'destructive'
      });
    }
  }, [setError, toast]);

  const wrapAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [clearError, handleError]);

  return {
    ...errorState,
    setError,
    clearError,
    handleError,
    wrapAsync
  };
};
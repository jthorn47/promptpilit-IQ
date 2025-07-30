import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

/**
 * Enhanced Supabase mutation hook with proper error handling and logging
 */
export function useSupabaseMutation<TData = any, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData | null; error: any }>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      logger.api.debug('Executing Supabase mutation', { variables });
      
      const result = await mutationFn(variables);
      
      if (result.error) {
        logger.api.error('Supabase mutation failed', result.error, { variables });
        throw new Error(result.error.message || 'Database operation failed');
      }
      
      logger.api.debug('Supabase mutation successful', { variables });
      return result.data;
    },
    ...options,
  });
}
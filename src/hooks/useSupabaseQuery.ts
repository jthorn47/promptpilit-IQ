import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Enhanced Supabase query hook with proper error handling and logging
 */
export function useSupabaseQuery<T = any>(
  queryKey: string | string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      logger.api.debug('Executing Supabase query', { queryKey });
      
      const result = await queryFn();
      
      if (result.error) {
        logger.api.error('Supabase query failed', result.error, { queryKey });
        throw new Error(result.error.message || 'Database query failed');
      }
      
      logger.api.debug('Supabase query successful', { queryKey, dataLength: Array.isArray(result.data) ? result.data.length : 'single' });
      return result.data;
    },
    ...options,
  });
}
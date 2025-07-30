import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import { APP_CONFIG } from "@/config/app";
import { logger } from "@/lib/logger";

// Default query options
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: APP_CONFIG.query.staleTime,
    gcTime: APP_CONFIG.query.cacheTime,
    retry: APP_CONFIG.query.retry,
    refetchOnWindowFocus: APP_CONFIG.query.refetchOnWindowFocus,
    throwOnError: false,
  },
  mutations: {
    retry: false,
    throwOnError: false,
    onError: (error) => {
      logger.api.error('Mutation failed', error);
    },
  },
};

/**
 * Creates a configured QueryClient instance
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions,
  });
};
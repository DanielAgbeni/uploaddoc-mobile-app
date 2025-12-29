import { QueryClient } from '@tanstack/react-query';

// Configure QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data will be considered stale after 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests twice
      retry: 2,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: __DEV__ ? false : true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

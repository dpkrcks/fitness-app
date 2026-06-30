import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide TanStack Query client. Conservative mobile defaults: retry once on
 * failure and treat data as fresh for 30s to avoid refetch storms on re-focus.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

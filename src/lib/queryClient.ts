import { QueryClient } from '@tanstack/react-query';

// Create optimized query client with intelligent caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for important data
      refetchOnWindowFocus: true,
      // Background refetch to keep data fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query key factories for consistent cache keys
export const queryKeys = {
  bills: {
    all: ['bills'] as const,
    lists: () => [...queryKeys.bills.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.bills.lists(), filters] as const,
    details: () => [...queryKeys.bills.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.bills.details(), id] as const,
  },
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.members.details(), id] as const,
  },
  committees: {
    all: ['committees'] as const,
    lists: () => [...queryKeys.committees.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.committees.lists(), filters] as const,
    details: () => [...queryKeys.committees.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.committees.details(), id] as const,
  },
  search: {
    all: ['search'] as const,
    results: (term: string) => [...queryKeys.search.all, term] as const,
  },
} as const;

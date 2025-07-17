
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { optimizedBillsService, BillFilters } from "@/services/optimizedBillsService";
import { queryKeys } from "@/lib/queryClient";
import { useDebounce } from "./useDebounce";

export const useOptimizedBillsData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo((): BillFilters => ({
    searchTerm: debouncedSearchTerm,
    sponsorFilter,
    committeeFilter,
    dateRangeFilter,
    limit: 50,
  }), [debouncedSearchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

  // Infinite query for pagination
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.bills.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      optimizedBillsService.getBills({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length : undefined,
    initialPageParam: 0,
  });

  // Get filter options with separate caching
  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: ['billFilterOptions'],
    queryFn: optimizedBillsService.getFilterOptions,
    staleTime: 10 * 60 * 1000, // Cache filter options for 10 minutes
  });

  // Flatten paginated data
  const bills = useMemo(() => {
    return data?.pages.flatMap(page => page.bills) || [];
  }, [data]);

  const totalBills = data?.pages[0]?.totalCount || 0;

  return {
    bills,
    loading: isLoading,
    error: error?.message || null,
    searchTerm,
    setSearchTerm,
    sponsorFilter,
    setSponsorFilter,
    committeeFilter,
    setCommitteeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    loadMoreBills: fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingMore: isFetchingNextPage,
    totalBills,
    currentPageBills: bills.length,
    committees: filterOptions?.committees || [],
    sponsors: filterOptions?.sponsors || [],
    filterOptionsLoading,
    refetch: () => {
      // Invalidate and refetch current query
      return fetchNextPage({ cancelRefetch: false });
    },
  };
};

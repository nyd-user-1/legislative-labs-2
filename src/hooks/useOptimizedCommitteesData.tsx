
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { optimizedCommitteesService, CommitteeFilters } from "@/services/optimizedCommitteesService";
import { queryKeys } from "@/lib/queryClient";
import { useDebounce } from "./useDebounce";

export const useOptimizedCommitteesData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filters = useMemo((): CommitteeFilters => ({
    searchTerm: debouncedSearchTerm,
    chamberFilter,
    limit: 100,
  }), [debouncedSearchTerm, chamberFilter]);

  const {
    data: committeesData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.committees.list(filters),
    queryFn: () => optimizedCommitteesService.getCommittees(filters),
  });

  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: ['committeeFilterOptions'],
    queryFn: optimizedCommitteesService.getFilterOptions,
    staleTime: 10 * 60 * 1000,
  });

  const committees = committeesData?.committees || [];
  const totalCommittees = committeesData?.totalCount || 0;
  const filteredCount = committees.length;

  return {
    committees,
    loading: isLoading,
    error: error?.message || null,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    fetchCommittees: refetch,
    totalCommittees,
    filteredCount,
    chambers: filterOptions?.chambers || [],
    filterOptionsLoading,
  };
};

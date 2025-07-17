
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { optimizedMembersService, MemberFilters } from "@/services/optimizedMembersService";
import { queryKeys } from "@/lib/queryClient";
import { useDebounce } from "./useDebounce";

export const useOptimizedMembersData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("all");
  const [partyFilter, setPartyFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filters = useMemo((): MemberFilters => ({
    searchTerm: debouncedSearchTerm,
    chamberFilter,
    partyFilter,
    districtFilter,
    page: currentPage - 1, // Convert to 0-based pagination
    limit: 50,
  }), [debouncedSearchTerm, chamberFilter, partyFilter, districtFilter, currentPage]);

  const {
    data: membersData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.members.list(filters),
    queryFn: () => optimizedMembersService.getMembers(filters),
  });

  const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
    queryKey: ['memberFilterOptions'],
    queryFn: optimizedMembersService.getFilterOptions,
    staleTime: 10 * 60 * 1000,
  });

  const members = membersData?.members || [];
  const totalCount = membersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 50);

  return {
    members,
    loading: isLoading,
    error: error?.message || null,
    chambers: filterOptions?.chambers || [],
    parties: filterOptions?.parties || [],
    districts: filterOptions?.districts || [],
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    partyFilter,
    setPartyFilter,
    districtFilter,
    setDistrictFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    filterOptionsLoading,
    fetchMembers: refetch,
  };
};


import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { fetchOptimizedSearchContent } from "@/utils/optimizedSearchDataFetcher";
import { filterSearchResults } from "@/utils/searchHelpers";
import { queryKeys } from "@/lib/queryClient";

export const useOptimizedSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch all content with intelligent caching
  const { data: allContent = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.search.all,
    queryFn: fetchOptimizedSearchContent,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for search
  });

  // Filter content based on search term (client-side for instant results)
  const filteredResults = useMemo(() => {
    return filterSearchResults(allContent, searchTerm);
  }, [searchTerm, allContent]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching search content:', error);
      toast({
        title: "Error fetching content",
        description: "Failed to load your content for search.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults: filteredResults,
    isLoading,
    clearSearch,
    refreshContent: refetch,
  };
};

export type { SearchResult };

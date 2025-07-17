
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { fetchOptimizedSearchContent } from "@/utils/optimizedSearchDataFetcher";
import { filterSearchResults } from "@/utils/searchHelpers";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

export const usePerformanceEnhancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { recordSearchQuery, recordDataFetch, startTimer } = usePerformanceMonitor();

  // Enhanced fetch with performance monitoring
  const fetchAllContent = async () => {
    const endTimer = startTimer('Search Content Fetch');
    
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      const results = await fetchOptimizedSearchContent();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      recordDataFetch('search_content_fetch', duration);
      setAllContent(results);
      
      console.log(`Search content loaded: ${results.length} items in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('Error fetching search content:', error);
      toast({
        title: "Error fetching content",
        description: "Failed to load your content for search.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      endTimer();
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Enhanced search with performance monitoring
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const startTime = performance.now();
    const results = filterSearchResults(allContent, searchTerm);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    recordSearchQuery(duration);
    
    return results;
  }, [searchTerm, allContent, recordSearchQuery]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults: filteredResults,
    isLoading,
    clearSearch,
    refreshContent: fetchAllContent,
  };
};

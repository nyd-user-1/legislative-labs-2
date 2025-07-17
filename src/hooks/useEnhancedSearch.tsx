
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/types/search";
import { fetchAllSearchContent } from "@/utils/searchDataFetcher";
import { filterSearchResults } from "@/utils/searchHelpers";
import { useEnhancedDebounce } from "./useEnhancedDebounce";

export const useEnhancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const { toast } = useToast();
  
  const abortControllerRef = useRef<AbortController>();
  const resultsCache = useRef<Map<string, SearchResult[]>>(new Map());
  
  const debouncedSearchTerm = useEnhancedDebounce(searchTerm, {
    delay: 300,
    enableCaching: true,
    cacheSize: 100
  });

  // Fetch all user content on mount
  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();
      
      const results = await fetchAllSearchContent();
      
      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }
      
      setAllContent(results);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      console.error('Error fetching content:', error);
      toast({
        title: "Error fetching content",
        description: "Failed to load your content for search.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized filter function to avoid recalculation
  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    
    // Check cache first
    const cacheKey = `${debouncedSearchTerm}_${allContent.length}`;
    if (resultsCache.current.has(cacheKey)) {
      return resultsCache.current.get(cacheKey)!;
    }
    
    const results = filterSearchResults(allContent, debouncedSearchTerm);
    
    // Cache results (limit cache size)
    if (resultsCache.current.size >= 50) {
      const firstKey = resultsCache.current.keys().next().value;
      resultsCache.current.delete(firstKey);
    }
    resultsCache.current.set(cacheKey, results);
    
    return results;
  }, [debouncedSearchTerm, allContent]);

  useEffect(() => {
    setSearchResults(filteredResults);
  }, [filteredResults]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    resultsCache.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    clearSearch,
    refreshContent: fetchAllContent
  };
};

export type { SearchResult };


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./useDebounce";

interface ProblemChat {
  id: string;
  problem_number: string;
  title: string;
  problem_statement: string;
  current_state: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useProblemsData = () => {
  const [problemChats, setProblemChats] = useState<ProblemChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const PROBLEMS_PER_PAGE = 50;

  const fetchProblems = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching problems with filters:", { searchTerm, stateFilter, currentPage });
      
      // Start with basic problems query - get count for pagination
      let countQuery = supabase
        .from("problem_chats")
        .select("*", { count: 'exact', head: true });
      
      // Start with basic problems query for data
      let query = supabase
        .from("problem_chats")
        .select("*");

      // Apply search filter - search in title and problem statement
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
        const searchFilter = `title.ilike.%${debouncedSearchTerm}%,problem_statement.ilike.%${debouncedSearchTerm}%,problem_number.ilike.%${debouncedSearchTerm}%`;
        query = query.or(searchFilter);
        countQuery = countQuery.or(searchFilter);
      }

      // Apply state filter
      if (stateFilter) {
        query = query.eq("current_state", stateFilter);
        countQuery = countQuery.eq("current_state", stateFilter);
      }

      // Get total count first
      const { count: totalCountResult } = await countQuery;
      setTotalCount(totalCountResult || 0);

      // Order by created date, most recent first
      query = query.order("created_at", {
        ascending: false
      });

      // Apply pagination
      const from = loadMore ? problemChats.length : (currentPage - 1) * PROBLEMS_PER_PAGE;
      const to = from + PROBLEMS_PER_PAGE - 1;
      query = query.range(from, to);
      
      const { data: problemsData, error } = await query;
      
      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      console.log("Problems fetched successfully:", problemsData?.length || 0, "problems");
      
      if (loadMore) {
        setProblemChats(prevProblems => [...prevProblems, ...(problemsData || [])]);
      } else {
        setProblemChats(problemsData || []);
      }
      
      // Check if there are more pages
      const totalFetched = loadMore ? problemChats.length + (problemsData?.length || 0) : (problemsData?.length || 0);
      setHasNextPage(totalFetched < (totalCountResult || 0));
    } catch (err) {
      console.error("Error fetching problems:", err);
      setError("Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProblems();
  }, [debouncedSearchTerm, stateFilter]);

  const loadMoreProblems = () => {
    if (hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
      fetchProblems(true);
    }
  };

  return {
    problemChats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    stateFilter,
    setStateFilter,
    fetchProblems,
    loadMoreProblems,
    hasNextPage,
    totalProblems: totalCount,
    currentPageProblems: problemChats.length,
    currentPage,
  };
};

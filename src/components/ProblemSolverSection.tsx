
import { useState, useEffect } from "react";
import { useProblemsData } from "@/hooks/useProblemsData";
import { 
  ProblemsHeader, 
  ProblemsSearchFilters, 
  ProblemsGrid, 
  ProblemsLoadingSkeleton, 
  ProblemsErrorState, 
  ProblemsEmptyState 
} from "@/components/problems";

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

interface ProblemSolverSectionProps {
  onProblemGenerated?: (problem: string) => void;
  onDraftBill?: (problem: string) => void;
}

export const ProblemSolverSection = ({
  onProblemGenerated,
  onDraftBill
}: ProblemSolverSectionProps) => {
  const [selectedProblem, setSelectedProblem] = useState<ProblemChat | null>(null);
  
  const {
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
    totalProblems,
    currentPageProblems,
  } = useProblemsData();

  const handleProblemSelect = (problemChat: ProblemChat) => {
    setSelectedProblem(problemChat);
    // You can add navigation logic here if needed
    console.log("Selected problem:", problemChat);
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    state: string;
  }) => {
    setSearchTerm(newFilters.search);
    setStateFilter(newFilters.state);
  };

  const handleCreateNew = () => {
    // This could trigger opening a modal or navigating to create a new problem
    console.log("Create new problem statement");
  };

  if (loading) {
    return <ProblemsLoadingSkeleton />;
  }

  if (error) {
    return <ProblemsErrorState error={error} onRetry={fetchProblems} />;
  }

  const hasFilters = searchTerm !== "" || stateFilter !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <ProblemsHeader problemsCount={totalProblems} />
        
        <ProblemsSearchFilters
          filters={{
            search: searchTerm,
            state: stateFilter,
          }}
          onFiltersChange={handleFiltersChange}
        />

        {problemChats.length === 0 ? (
          <ProblemsEmptyState hasFilters={hasFilters} onCreateNew={handleCreateNew} />
        ) : (
          <div className="space-y-6">
            <ProblemsGrid 
              problemChats={problemChats} 
              onProblemSelect={handleProblemSelect}
              onRefresh={fetchProblems}
            />
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPageProblems} of {totalProblems.toLocaleString()} problems
              </div>
              
              {hasNextPage && (
                <button
                  onClick={loadMoreProblems}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More Problems"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

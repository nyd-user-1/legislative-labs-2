import { useState } from "react";
import { useCommitteesData } from "@/hooks/useCommitteesData";
import { CommitteesHeader } from "@/components/committees/CommitteesHeader";
import { CommitteesSearchFilters } from "@/components/committees/CommitteesSearchFilters";
import { CommitteesGrid } from "@/components/committees/CommitteesGrid";
import { CommitteesEmptyState } from "@/components/committees/CommitteesEmptyState";
import { CommitteesLoadingSkeleton } from "@/components/committees/CommitteesLoadingSkeleton";
import { CommitteesErrorState } from "@/components/committees/CommitteesErrorState";
import { CommitteeDetail } from "@/components/CommitteeDetail";

type Committee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
};

const Committees = () => {
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const {
    committees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCommittees,
    totalCommittees,
  } = useCommitteesData();

  if (loading) {
    return <CommitteesLoadingSkeleton />;
  }

  if (error) {
    return <CommitteesErrorState error={error} onRetry={fetchCommittees} />;
  }

  // Show committee detail if one is selected
  if (selectedCommittee) {
    return (
      <CommitteeDetail 
        committee={selectedCommittee} 
        onBack={() => setSelectedCommittee(null)} 
      />
    );
  }

  const hasFilters = searchTerm !== "";

  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          <CommitteesHeader committeesCount={totalCommittees} />

          <CommitteesSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {committees.length === 0 ? (
            <CommitteesEmptyState hasFilters={hasFilters} />
          ) : (
            <CommitteesGrid 
              committees={committees} 
              onCommitteeSelect={setSelectedCommittee}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Committees;
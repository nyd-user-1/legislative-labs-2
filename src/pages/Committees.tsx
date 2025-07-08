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
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
};

const Committees = () => {
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const {
    committees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    committeeTypeFilter,
    setCommitteeTypeFilter,
    fetchCommittees,
    totalCommittees,
    chambers,
    committeeTypes,
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

  const handleFiltersChange = (newFilters: {
    search: string;
    chamber: string;
    committeeType: string;
  }) => {
    setSearchTerm(newFilters.search);
    setChamberFilter(newFilters.chamber);
    setCommitteeTypeFilter(newFilters.committeeType);
  };

  const hasFilters = searchTerm !== "" || chamberFilter !== "" || committeeTypeFilter !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <CommitteesHeader committeesCount={totalCommittees} />

        <CommitteesSearchFilters
          filters={{
            search: searchTerm,
            chamber: chamberFilter,
            committeeType: committeeTypeFilter,
          }}
          onFiltersChange={handleFiltersChange}
          chambers={chambers}
          committeeTypes={committeeTypes}
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
  );
};

export default Committees;
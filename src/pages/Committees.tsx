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
  committee_id: number;
  name: string;
  memberCount: string;
  billCount: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  chamber: string;
  committee_url?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  upcoming_agenda?: string;
  address?: string;
  slug?: string;
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
    fetchCommittees,
    totalCommittees,
    chambers,
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
  }) => {
    setSearchTerm(newFilters.search);
  };

  const hasFilters = searchTerm !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <CommitteesHeader 
          committeesCount={totalCommittees}
          chamberFilter={chamberFilter}
          onChamberFilterChange={setChamberFilter}
          chambers={chambers}
        />

        <CommitteesSearchFilters
          filters={{
            search: searchTerm,
          }}
          onFiltersChange={handleFiltersChange}
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
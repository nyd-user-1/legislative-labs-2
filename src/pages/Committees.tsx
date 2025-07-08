import { useState } from "react";
import { useEnhancedCommitteesData } from "@/hooks/useEnhancedCommitteesData";
import { CommitteesHeader } from "@/components/committees/CommitteesHeader";
import { CommitteesSearchFilters } from "@/components/committees/CommitteesSearchFilters";
import { CommitteesGrid } from "@/components/committees/CommitteesGrid";
import { CommitteesEmptyState } from "@/components/committees/CommitteesEmptyState";
import { CommitteesLoadingSkeleton } from "@/components/committees/CommitteesLoadingSkeleton";
import { CommitteesErrorState } from "@/components/committees/CommitteesErrorState";
import { EnhancedCommitteeDetail } from "@/components/EnhancedCommitteeDetail";
import { NYSMember } from "@/types/nysApi";

type EnhancedCommittee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
  meetingDateTime?: string;
  location?: string;
  agendaNo?: number;
  year?: number;
  members?: NYSMember[];
  upcomingMeetings?: Array<{
    date: string;
    location: string;
    agenda: any;
  }>;
};

const Committees = () => {
  const [selectedCommittee, setSelectedCommittee] = useState<EnhancedCommittee | null>(null);

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
  } = useEnhancedCommitteesData();

  if (loading) {
    return <CommitteesLoadingSkeleton />;
  }

  if (error) {
    return <CommitteesErrorState error={error} onRetry={fetchCommittees} />;
  }

  // Show committee detail if one is selected
  if (selectedCommittee) {
    return (
      <EnhancedCommitteeDetail 
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
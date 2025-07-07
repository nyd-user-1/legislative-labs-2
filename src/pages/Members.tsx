import { useState } from "react";
import { useMembersData } from "@/hooks/useMembersData";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MembersSearchFilters } from "@/components/members/MembersSearchFilters";
import { MembersGrid } from "@/components/members/MembersGrid";
import { MembersEmptyState } from "@/components/members/MembersEmptyState";
import { MembersLoadingSkeleton } from "@/components/members/MembersLoadingSkeleton";
import { MembersErrorState } from "@/components/members/MembersErrorState";
import { MemberDetail } from "@/components/MemberDetail";

const Members = () => {
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const {
    members,
    loading,
    error,
    chambers,
    parties,
    districts,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    partyFilter,
    setPartyFilter,
    districtFilter,
    setDistrictFilter,
    fetchMembers,
  } = useMembersData();

  if (loading) {
    return <MembersLoadingSkeleton />;
  }

  if (error) {
    return <MembersErrorState error={error} onRetry={fetchMembers} />;
  }

  // Show member detail if one is selected
  if (selectedMember) {
    return (
      <MemberDetail 
        member={selectedMember} 
        onBack={() => setSelectedMember(null)} 
      />
    );
  }

  const hasFilters = searchTerm !== "" || chamberFilter !== "all" || partyFilter !== "all" || districtFilter !== "all";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <MembersHeader 
          membersCount={members.length} 
          chambersCount={chambers.length} 
        />

        <MembersSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          chamberFilter={chamberFilter}
          setChamberFilter={setChamberFilter}
          partyFilter={partyFilter}
          setPartyFilter={setPartyFilter}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          chambers={chambers}
          parties={parties}
          districts={districts}
        />

        {members.length === 0 ? (
          <MembersEmptyState hasFilters={hasFilters} />
        ) : (
          <MembersGrid 
            members={members} 
            onMemberSelect={setSelectedMember}
          />
        )}
      </div>
    </div>
  );
}

export default Members;

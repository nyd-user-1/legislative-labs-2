import { useMembersData } from "@/hooks/useMembersData";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MembersSearchFilters } from "@/components/members/MembersSearchFilters";
import { MembersGrid } from "@/components/members/MembersGrid";
import { MembersEmptyState } from "@/components/members/MembersEmptyState";
import { MembersLoadingSkeleton } from "@/components/members/MembersLoadingSkeleton";
import { MembersErrorState } from "@/components/members/MembersErrorState";

const Members = () => {
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
          <MembersGrid members={members} />
        )}
      </div>
    </div>
  );
}

export default Members;

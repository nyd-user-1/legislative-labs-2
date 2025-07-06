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
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    fetchMembers,
  } = useMembersData();

  if (loading) {
    return <MembersLoadingSkeleton />;
  }

  if (error) {
    return <MembersErrorState error={error} onRetry={fetchMembers} />;
  }

  const hasFilters = searchTerm !== "" || chamberFilter !== "all";

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <MembersHeader 
          membersCount={members.length} 
          chambersCount={chambers.length} 
        />

        <MembersSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          chamberFilter={chamberFilter}
          setChamberFilter={setChamberFilter}
          chambers={chambers}
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

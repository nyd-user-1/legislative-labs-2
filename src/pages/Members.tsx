
import { useState, useEffect } from "react";
import { useMembersData } from "@/hooks/useMembersData";
import { useMemberFavorites } from "@/hooks/useMemberFavorites";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MembersSearchFilters } from "@/components/members/MembersSearchFilters";
import { MembersGrid } from "@/components/members/MembersGrid";
import { MembersEmptyState } from "@/components/members/MembersEmptyState";
import { MembersLoadingSkeleton } from "@/components/members/MembersLoadingSkeleton";
import { MembersErrorState } from "@/components/members/MembersErrorState";
import { MemberDetail } from "@/components/MemberDetail";
import { AIChatSheet } from "@/components/AIChatSheet";
import { supabase } from "@/integrations/supabase/client";

const Members = () => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMemberForChat, setSelectedMemberForChat] = useState<any>(null);
  const [membersWithAIChat, setMembersWithAIChat] = useState<Set<number>>(new Set());

  const { favoriteMemberIds, toggleFavorite } = useMemberFavorites();

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

  // Fetch members that have AI chat sessions
  useEffect(() => {
    const fetchMembersWithAIChat = async () => {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("member_id")
          .not("member_id", "is", null);

        if (sessions) {
          const memberIdsWithChat = new Set(
            sessions.map(session => session.member_id).filter(Boolean)
          );
          setMembersWithAIChat(memberIdsWithChat);
        }
      } catch (error) {
        console.error("Error fetching AI chat sessions:", error);
      }
    };

    fetchMembersWithAIChat();
  }, []);

  const handleFavorite = async (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(member.people_id);
  };

  const handleAIAnalysis = (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberForChat(member);
    setChatOpen(true);
    
    // Add this member to the set of members with AI chat
    setMembersWithAIChat(prev => new Set([...prev, member.people_id]));
  };

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
    <>
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
              onFavorite={handleFavorite}
              onAIAnalysis={handleAIAnalysis}
              favoriteMembers={favoriteMemberIds}
              membersWithAIChat={membersWithAIChat}
            />
          )}
        </div>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        member={selectedMemberForChat}
      />
    </>
  );
}

export default Members;

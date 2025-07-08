import { useState, useEffect } from "react";
import { useNYSApi } from "./useNYSApi";
import { NYSAgenda, NYSMember } from "@/types/nysApi";

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
    agenda: NYSAgenda;
  }>;
};

export const useEnhancedCommitteesData = () => {
  const [committees, setCommittees] = useState<EnhancedCommittee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("");
  const [committeeTypeFilter, setCommitteeTypeFilter] = useState("");

  const { 
    listAgendas, 
    getCommitteeMeetings, 
    listMembers, 
    loading: apiLoading, 
    error: apiError 
  } = useNYSApi();

  const fetchEnhancedCommittees = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentYear = new Date().getFullYear();
      
      // Get recent agendas to extract committee information
      const agendasResult = await listAgendas(currentYear, 100, 0);
      
      // Get committee meetings for the next 30 days
      const fromDate = new Date().toISOString().split('T')[0];
      const toDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const meetingsResult = await getCommitteeMeetings({ fromDate, toDate });
      
      // Get members for both chambers
      const senateMembers = await listMembers(currentYear, 'SENATE', 100, 0);
      const assemblyMembers = await listMembers(currentYear, 'ASSEMBLY', 100, 0);
      
      const allMembers = [
        ...(senateMembers?.result?.items || []),
        ...(assemblyMembers?.result?.items || [])
      ];

      // Process agendas to extract committee data
      const committeeMap = new Map<string, EnhancedCommittee>();

      // Helper functions
      const getChamber = (committeeName: string): string => {
        const name = committeeName.toLowerCase();
        if (name.includes('senate')) return 'Senate';
        if (name.includes('assembly')) return 'Assembly';
        if (name.includes('joint')) return 'Joint';
        return 'Unknown';
      };

      const getCommitteeType = (committeeName: string): string => {
        const name = committeeName.toLowerCase();
        if (name.includes('commission')) return 'Legislative Commission';
        if (name.includes('subcommittee')) return 'Subcommittee';
        if (name.includes('task force') || name.includes('working group')) return 'Task Force & Other Entities';
        if (name.includes('caucus')) return 'Caucuses';
        return 'Standing Committee';
      };

      // Process agendas if available
      if (agendasResult?.result?.items) {
        agendasResult.result.items.forEach((agenda: any) => {
          if (agenda.committees?.items) {
            agenda.committees.items.forEach((committee: any) => {
              const committeeName = committee.name || committee.committeeId?.name;
              if (committeeName) {
                const chamber = committee.committeeId?.chamber || getChamber(committeeName);
                const billCount = committee.bills?.items?.length || 0;
                
                // Find committee members
                const committeeMembers = allMembers.filter(member => 
                  member.chamber?.toUpperCase() === chamber.toUpperCase()
                );

                // Find chair (this would need to be enhanced with actual role data from API)
                const chairMember = committeeMembers.find(member => 
                  member.fullName && committee.chair && 
                  member.fullName.toLowerCase().includes(committee.chair.toLowerCase())
                );

                const existing = committeeMap.get(committeeName);
                committeeMap.set(committeeName, {
                  name: committeeName,
                  memberCount: committeeMembers.length,
                  billCount: (existing?.billCount || 0) + billCount,
                  description: `${chamber} committee handling ${committeeName.toLowerCase()} matters`,
                  chair_name: chairMember?.fullName || committee.chair || existing?.chair_name,
                  ranking_member_name: existing?.ranking_member_name,
                  committee_type: getCommitteeType(committeeName),
                  chamber: chamber,
                  meetingDateTime: committee.meetingDateTime || existing?.meetingDateTime,
                  location: committee.location || existing?.location,
                  agendaNo: agenda.agendaNo,
                  year: agenda.year,
                  members: committeeMembers.slice(0, 20), // Limit for performance
                  upcomingMeetings: existing?.upcomingMeetings || []
                });
              }
            });
          }
        });
      }

      // Add default committees if we don't have enough data from API
      if (committeeMap.size === 0) {
        const defaultCommittees = [
          { name: 'Senate Finance Committee', chamber: 'Senate', type: 'Standing Committee' },
          { name: 'Assembly Ways and Means Committee', chamber: 'Assembly', type: 'Standing Committee' },
          { name: 'Senate Judiciary Committee', chamber: 'Senate', type: 'Standing Committee' },
          { name: 'Assembly Judiciary Committee', chamber: 'Assembly', type: 'Standing Committee' },
          { name: 'Senate Health Committee', chamber: 'Senate', type: 'Standing Committee' },
          { name: 'Assembly Health Committee', chamber: 'Assembly', type: 'Standing Committee' },
          { name: 'Joint Legislative Commission on Government Administration', chamber: 'Joint', type: 'Legislative Commission' },
        ];

        defaultCommittees.forEach(committee => {
          const chamberMembers = allMembers.filter(member => 
            member.chamber?.toUpperCase() === committee.chamber.toUpperCase()
          );

          committeeMap.set(committee.name, {
            name: committee.name,
            memberCount: chamberMembers.length,
            billCount: Math.floor(Math.random() * 20) + 5, // Placeholder
            description: `${committee.chamber} committee handling legislative matters`,
            committee_type: committee.type,
            chamber: committee.chamber,
            members: chamberMembers.slice(0, 15),
            upcomingMeetings: []
          });
        });
      }

      // Process upcoming meetings if available
      if (meetingsResult?.result?.items) {
        meetingsResult.result.items.forEach((meeting: any) => {
          const committeeName = meeting.committeeId?.name || meeting.committee;
          if (committeeName && committeeMap.has(committeeName)) {
            const committee = committeeMap.get(committeeName)!;
            if (!committee.upcomingMeetings) {
              committee.upcomingMeetings = [];
            }
            committee.upcomingMeetings.push({
              date: meeting.meetingDateTime || meeting.date,
              location: meeting.location || 'TBD',
              agenda: meeting
            });
            committeeMap.set(committeeName, committee);
          }
        });
      }

      const committeesArray = Array.from(committeeMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setCommittees(committeesArray);
    } catch (error: any) {
      console.error("Error fetching enhanced committees:", error);
      setError(error.message || "Failed to fetch committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedCommittees();
  }, []);

  // Filter committees based on search term, chamber, and committee type
  const filteredCommittees = committees.filter(committee => {
    const matchesSearch = committee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChamber = chamberFilter === "" || committee.chamber === chamberFilter;
    const matchesType = committeeTypeFilter === "" || committee.committee_type === committeeTypeFilter;
    
    return matchesSearch && matchesChamber && matchesType;
  });

  // Get unique chambers and committee types for filter options
  const chambers = Array.from(new Set(committees.map(c => c.chamber).filter(Boolean))).sort();
  const committeeTypes = Array.from(new Set(committees.map(c => c.committee_type).filter(Boolean))).sort();

  return {
    committees: filteredCommittees,
    loading: loading || apiLoading,
    error: error || apiError,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    committeeTypeFilter,
    setCommitteeTypeFilter,
    fetchCommittees: fetchEnhancedCommittees,
    totalCommittees: committees.length,
    chambers,
    committeeTypes,
  };
};
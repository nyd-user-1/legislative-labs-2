import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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

export const useCommitteesData = () => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("");
  const [committeeTypeFilter, setCommitteeTypeFilter] = useState("");

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get unique committees from Bills table with bill counts
      const { data: billCommittees, error: billError } = await supabase
        .from("Bills")
        .select("committee")
        .not("committee", "is", null);

      if (billError) throw billError;

      // Get committee member counts from People table
      const { data: memberCommittees, error: memberError } = await supabase
        .from("People")
        .select("committee_id")
        .not("committee_id", "is", null);

      if (memberError) throw memberError;

      // Process and combine the data
      const committeeMap = new Map<string, Committee>();

      // Helper function to determine chamber from committee name
      const getChamber = (committeeName: string): string => {
        const name = committeeName.toLowerCase();
        if (name.includes('senate')) return 'Senate';
        if (name.includes('assembly')) return 'Assembly';
        if (name.includes('joint')) return 'Joint';
        return 'Unknown';
      };

      // Helper function to determine committee type
      const getCommitteeType = (committeeName: string): string => {
        const name = committeeName.toLowerCase();
        if (name.includes('commission')) return 'Legislative Commission';
        if (name.includes('subcommittee')) return 'Subcommittee';
        if (name.includes('task force') || name.includes('working group')) return 'Task Force & Other Entities';
        if (name.includes('caucus')) return 'Caucuses';
        return 'Standing Committee';
      };

      // Process bill committees
      billCommittees?.forEach((bill) => {
        if (bill.committee) {
          const existing = committeeMap.get(bill.committee);
          committeeMap.set(bill.committee, {
            name: bill.committee,
            memberCount: existing?.memberCount || 0,
            billCount: (existing?.billCount || 0) + 1,
            description: `Legislative committee handling ${bill.committee.toLowerCase()} matters`,
            chair_name: existing?.chair_name,
            ranking_member_name: existing?.ranking_member_name,
            committee_type: getCommitteeType(bill.committee),
            chamber: getChamber(bill.committee)
          });
        }
      });

      // Process member committees (by committee_id)
      memberCommittees?.forEach((member) => {
        if (member.committee_id) {
          // Find existing committee by name or create new one
          let committeeName = member.committee_id;
          const existing = Array.from(committeeMap.values()).find(c => 
            c.name.toLowerCase().includes(member.committee_id!.toLowerCase()) ||
            member.committee_id!.toLowerCase().includes(c.name.toLowerCase())
          );
          
          if (existing) {
            committeeName = existing.name;
          }
          
          const committee = committeeMap.get(committeeName);
          committeeMap.set(committeeName, {
            name: committeeName,
            memberCount: (committee?.memberCount || 0) + 1,
            billCount: committee?.billCount || 0,
            description: committee?.description || `Legislative committee with ID: ${member.committee_id}`,
            chair_name: committee?.chair_name,
            ranking_member_name: committee?.ranking_member_name,
            committee_type: committee?.committee_type || getCommitteeType(committeeName),
            chamber: committee?.chamber || getChamber(committeeName)
          });
        }
      });

      const committeesArray = Array.from(committeeMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setCommittees(committeesArray);
    } catch (error: any) {
      console.error("Error fetching committees:", error);
      setError(error.message || "Failed to fetch committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
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
    loading,
    error,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    committeeTypeFilter,
    setCommitteeTypeFilter,
    fetchCommittees,
    totalCommittees: committees.length,
    chambers,
    committeeTypes,
  };
};
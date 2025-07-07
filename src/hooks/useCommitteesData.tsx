import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Committee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
};

export const useCommitteesData = () => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

      // Process bill committees
      billCommittees?.forEach((bill) => {
        if (bill.committee) {
          const existing = committeeMap.get(bill.committee);
          committeeMap.set(bill.committee, {
            name: bill.committee,
            memberCount: existing?.memberCount || 0,
            billCount: (existing?.billCount || 0) + 1,
            description: `Legislative committee handling ${bill.committee.toLowerCase()} matters`
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
            description: committee?.description || `Legislative committee with ID: ${member.committee_id}`
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

  // Filter committees based on search term
  const filteredCommittees = committees.filter(committee =>
    committee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    committees: filteredCommittees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCommittees,
    totalCommittees: committees.length,
  };
};
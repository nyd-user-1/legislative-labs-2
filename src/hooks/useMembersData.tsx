import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  party: string;
  chamber: string;
  district: string;
  role: string;
  email: string;
  phone_capitol: string;
  phone_district: string;
  address: string;
  bio_short: string;
  ballotpedia: string;
}

export const useMembersData = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chambers, setChambers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchChambers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, chamberFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("People")
        .select(`
          people_id,
          name,
          first_name,
          last_name,
          photo_url,
          party,
          chamber,
          district,
          role,
          email,
          phone_capitol,
          phone_district,
          address,
          bio_short,
          ballotpedia
        `)
        .not("chamber", "is", null)
        .not("name", "is", null)
        .order("last_name", { ascending: true })
        .limit(100);

      if (error) throw error;

      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChambers = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("chamber")
        .not("chamber", "is", null)
        .order("chamber");

      if (data) {
        const uniqueChambers = Array.from(
          new Set(data.map(item => item.chamber).filter(Boolean))
        ) as string[];
        setChambers(uniqueChambers);
      }
    } catch (error) {
      console.error("Error fetching chambers:", error);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(term) ||
        member.first_name?.toLowerCase().includes(term) ||
        member.last_name?.toLowerCase().includes(term) ||
        member.party?.toLowerCase().includes(term) ||
        member.district?.toLowerCase().includes(term) ||
        member.role?.toLowerCase().includes(term)
      );
    }

    if (chamberFilter !== "all") {
      filtered = filtered.filter(member => member.chamber === chamberFilter);
    }

    setFilteredMembers(filtered);
  };

  return {
    members: filteredMembers,
    loading,
    error,
    chambers,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    fetchMembers,
  };
};
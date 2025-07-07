import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface BillFilters {
  search: string;
  sponsor: string;
  committee: string;
  dateRange: string;
}

export const useBillsData = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching bills with filters:", { searchTerm, sponsorFilter, committeeFilter, dateRangeFilter });
      
      // Start with basic bills query
      let query = supabase
        .from("Bills")
        .select("*");

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,bill_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sponsor filter
      if (sponsorFilter) {
        // First find people with matching names
        const { data: people } = await supabase
          .from("People")
          .select("people_id")
          .eq("name", sponsorFilter);
        
        if (people && people.length > 0) {
          // Then find bills sponsored by these people
          const peopleIds = people.map(p => p.people_id);
          const { data: sponsorBills } = await supabase
            .from("Sponsors")
            .select("bill_id")
            .in("people_id", peopleIds);
          
          if (sponsorBills && sponsorBills.length > 0) {
            const billIds = sponsorBills.map(sb => sb.bill_id);
            query = query.in("bill_id", billIds);
          } else {
            // No bills found for this sponsor, return empty result
            setBills([]);
            return;
          }
        } else {
          // No people found with this name, return empty result
          setBills([]);
          return;
        }
      }

      // Apply committee filter
      if (committeeFilter) {
        query = query.eq("committee", committeeFilter);
      }

      // Apply date filter
      if (dateRangeFilter) {
        const daysAgo = parseInt(dateRangeFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        query = query.gte("last_action_date", cutoffDate.toISOString().split('T')[0]);
      }

      // Order by last action date, most recent first
      query = query.order("last_action_date", {
        ascending: false,
        nullsFirst: false
      });

      // Limit results for performance
      query = query.limit(100);
      const { data: billsData, error } = await query;
      
      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      // Fetch sponsor information for each bill
      const billsWithSponsors = await Promise.all(
        (billsData || []).map(async (bill) => {
          // Fetch sponsors for this bill
          const { data: sponsorsData } = await supabase
            .from("Sponsors")
            .select("people_id, position")
            .eq("bill_id", bill.bill_id)
            .order("position", { ascending: true });

          // If we have sponsors, fetch their details
          let sponsors: Array<{ name: string | null; party: string | null; chamber: string | null; }> = [];
          
          if (sponsorsData && sponsorsData.length > 0) {
            const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
            if (peopleIds.length > 0) {
              const { data: peopleData } = await supabase
                .from("People")
                .select("people_id, name, party, chamber")
                .in("people_id", peopleIds);
              
              sponsors = sponsorsData.map(sponsor => {
                const person = peopleData?.find(p => p.people_id === sponsor.people_id);
                return {
                  name: person?.name || null,
                  party: person?.party || null,
                  chamber: person?.chamber || null
                };
              }).filter(s => s.name) || [];
            }
          }

          return {
            ...bill,
            sponsors
          };
        })
      );

      console.log("Bills fetched successfully:", billsWithSponsors?.length || 0, "bills");
      setBills(billsWithSponsors);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [searchTerm, sponsorFilter, committeeFilter, dateRangeFilter]);

  // Filter bills based on current filters
  const filteredBills = bills.filter(bill => {
    if (searchTerm && !bill.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !bill.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return {
    bills: filteredBills,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sponsorFilter,
    setSponsorFilter,
    committeeFilter,
    setCommitteeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    fetchBills,
    totalBills: bills.length,
  };
};
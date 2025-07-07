import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

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
      
      // Start with basic bills query first
      let query = supabase
        .from("Bills")
        .select("*");

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,bill_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Skip sponsor filter for now - sponsor data not loaded
      // TODO: Re-implement sponsor filtering when sponsor data is properly joined

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
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error("Query error:", error);
        throw error;
      }
      console.log("Bills fetched successfully:", data?.length || 0, "bills");
      setBills(data || []);
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
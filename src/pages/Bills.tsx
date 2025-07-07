import { useState, useEffect } from "react";
import { BillDetail } from "@/components/BillDetail";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useBillsData } from "@/hooks/useBillsData";
import { 
  BillsHeader, 
  BillsSearchFilters, 
  BillsGrid, 
  BillsLoadingSkeleton, 
  BillsErrorState, 
  BillsEmptyState 
} from "@/components/bills";

type Bill = Tables<"Bills">;

console.log("Bills.tsx file is loading");

const Bills = () => {
  console.log("Bills page component rendering");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [committees, setCommittees] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<string[]>([]);
  
  const {
    bills,
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
    totalBills,
  } = useBillsData();

  useEffect(() => {
    fetchCommittees();
    fetchSponsors();
  }, []);

  const fetchCommittees = async () => {
    try {
      const { data } = await supabase
        .from("Bills")
        .select("committee")
        .not("committee", "is", null)
        .order("committee");

      if (data) {
        const uniqueCommittees = Array.from(
          new Set(data.map(item => item.committee).filter(Boolean))
        ) as string[];
        setCommittees(uniqueCommittees);
      }
    } catch (error) {
      console.error("Error fetching committees:", error);
    }
  };

  const fetchSponsors = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("name")
        .not("name", "is", null)
        .order("name");

      if (data) {
        const uniqueSponsors = Array.from(
          new Set(data.map(item => item.name).filter(Boolean))
        ) as string[];
        setSponsors(uniqueSponsors);
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };

  const handleBillSelect = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const handleBackToBills = () => {
    setSelectedBill(null);
  };

  const handleFiltersChange = (newFilters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  }) => {
    setSearchTerm(newFilters.search);
    setSponsorFilter(newFilters.sponsor);
    setCommitteeFilter(newFilters.committee);
    setDateRangeFilter(newFilters.dateRange);
  };

  if (selectedBill) {
    return (
      <BillDetail bill={selectedBill} onBack={handleBackToBills} />
    );
  }

  if (loading) {
    return (
      <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="content-wrapper max-w-7xl mx-auto">
          <div className="space-y-6">
            <BillsHeader billsCount={0} />
            <BillsLoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="content-wrapper max-w-7xl mx-auto">
          <div className="space-y-6">
            <BillsHeader billsCount={0} />
            <BillsErrorState error={error} onRetry={fetchBills} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          <BillsHeader billsCount={totalBills} />
          
          <BillsSearchFilters
            filters={{
              search: searchTerm,
              sponsor: sponsorFilter,
              committee: committeeFilter,
              dateRange: dateRangeFilter,
            }}
            onFiltersChange={handleFiltersChange}
            committees={committees}
            sponsors={sponsors}
          />

          {bills.length === 0 ? (
            <BillsEmptyState />
          ) : (
            <BillsGrid bills={bills} onBillSelect={handleBillSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Bills;
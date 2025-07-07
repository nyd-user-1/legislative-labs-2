import { useState, useEffect } from "react";
import { BillFilters } from "@/components/BillFilters";
import { BillsList } from "@/components/BillsList";
import { BillDetail } from "@/components/BillDetail";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

console.log("Bills.tsx file is loading");

const Bills = () => {
  console.log("Bills page component rendering");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [committees, setCommittees] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    sponsor: "",
    committee: "",
    dateRange: ""
  });

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

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (selectedBill) {
    return (
      <BillDetail bill={selectedBill} onBack={handleBackToBills} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bills
            </h1>
          </div>

          <BillFilters
            onFiltersChange={handleFiltersChange}
            committees={committees}
            sponsors={sponsors}
          />

          <BillsList 
            filters={filters}
            onBillSelect={handleBillSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Bills;
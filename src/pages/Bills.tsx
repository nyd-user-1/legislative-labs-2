import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { BillFilters } from "@/components/BillFilters";
import { BillsList } from "@/components/BillsList";
import { BillDetail } from "@/components/BillDetail";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

const Bills = () => {
  console.log("Bills page component rendering");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [committees, setCommittees] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    committee: "",
    dateRange: ""
  });

  useEffect(() => {
    fetchCommittees();
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
      <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Bill Details</h1>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">Detailed view of legislative bill</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6">
          <BillDetail bill={selectedBill} onBack={handleBackToBills} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-50/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Legislative Bills</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">Track legislative progress and details</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Legislative Bills</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore and track legislative bills, their progress, and related information.
            </p>
          </div>

          <BillFilters 
            onFiltersChange={handleFiltersChange}
            committees={committees}
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
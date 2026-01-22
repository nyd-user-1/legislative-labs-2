import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BillDetail } from "@/components/BillDetail";
import { Button } from "@/components/ui/button";
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
  const [searchParams] = useSearchParams();
  const { billNumber } = useParams<{ billNumber: string }>();
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billNotFound, setBillNotFound] = useState(false);
  const [committees, setCommittees] = useState<Array<{ name: string; chamber: string }>>([]);
  const [sponsors, setSponsors] = useState<Array<{ name: string; chamber: string; party: string }>>([]);
  
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
    loadMoreBills,
    hasNextPage,
    totalBills,
    currentPageBills,
  } = useBillsData();

  // Handle URL parameter for selected bill
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && bills && bills.length > 0) {
      const bill = bills.find(b => b.bill_id.toString() === selectedId);
      if (bill) {
        setSelectedBill(bill);
      }
    }
  }, [searchParams, bills]);

  // Handle direct bill number from URL route (e.g., /bills/S00270)
  useEffect(() => {
    const fetchBillByNumber = async () => {
      if (billNumber) {
        setBillNotFound(false);
        try {
          // Try exact match first
          let { data, error } = await supabase
            .from("Bills")
            .select("*")
            .ilike("bill_number", billNumber)
            .single();

          // If not found, try without leading zeros (e.g., S00270 -> S270)
          if (!data && !error?.message?.includes('multiple')) {
            const strippedNumber = billNumber.replace(/^([A-Z]+)0+/, '$1');
            if (strippedNumber !== billNumber) {
              const result = await supabase
                .from("Bills")
                .select("*")
                .ilike("bill_number", strippedNumber)
                .single();
              data = result.data;
              error = result.error;
            }
          }

          if (data && !error) {
            setSelectedBill(data);
          } else {
            console.error("Bill not found:", billNumber);
            setSelectedBill(null);
            setBillNotFound(true);
          }
        } catch (error) {
          console.error("Error fetching bill:", error);
          setSelectedBill(null);
          setBillNotFound(true);
        }
      } else {
        setSelectedBill(null);
        setBillNotFound(false);
      }
    };

    fetchBillByNumber();
  }, [billNumber]);

  useEffect(() => {
    fetchCommittees();
    fetchSponsors();
  }, []);

  const fetchCommittees = async () => {
    try {
      const { data } = await supabase
        .from("Committees")
        .select("committee_name, chamber")
        .not("committee_name", "is", null)
        .order("committee_name");

      if (data) {
        const committees = data.map(item => ({
          name: item.committee_name || "",
          chamber: item.chamber || ""
        })).filter(c => c.name);
        setCommittees(committees);
      }
    } catch (error) {
      console.error("Error fetching committees:", error);
    }
  };

  const fetchSponsors = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("name, chamber, party")
        .not("name", "is", null)
        .order("name");

      if (data) {
        const sponsors = data.map(item => ({
          name: item.name || "",
          chamber: item.chamber || "",
          party: item.party || ""
        })).filter(s => s.name);
        setSponsors(sponsors);
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

  // Show "Bill not found" when URL has billNumber but no bill was found
  if (billNumber && billNotFound) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/bills')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bills
        </Button>
        <p className="text-muted-foreground">Bill not found: {billNumber}</p>
      </div>
    );
  }

  if (loading) {
    return <BillsLoadingSkeleton />;
  }

  if (error) {
    return <BillsErrorState error={error} onRetry={fetchBills} />;
  }

  const hasFilters = searchTerm !== "" || sponsorFilter !== "" || committeeFilter !== "" || dateRangeFilter !== "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
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
          <BillsEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-6">
            <BillsGrid bills={bills} onBillSelect={handleBillSelect} />
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPageBills} of {totalBills.toLocaleString()} bills
              </div>
              
              {hasNextPage && (
                <button
                  onClick={loadMoreBills}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More Bills"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
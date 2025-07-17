
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { LazyBillDetail } from "@/components/LazyComponents";
import { Tables } from "@/integrations/supabase/types";
import { useOptimizedBillsData } from "@/hooks/useOptimizedBillsData";
import { 
  BillsHeader, 
  BillsSearchFilters, 
  BillsLoadingSkeleton, 
  BillsErrorState, 
  BillsEmptyState 
} from "@/components/bills";
import { OptimizedBillsGrid } from "@/components/bills/OptimizedBillsGrid";

type Bill = Tables<"Bills">;

const OptimizedBills = () => {
  const [searchParams] = useSearchParams();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
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
    loadMoreBills,
    hasNextPage,
    isFetchingMore,
    totalBills,
    currentPageBills,
    committees,
    sponsors,
    filterOptionsLoading,
  } = useOptimizedBillsData();

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
      <Suspense fallback={<BillsLoadingSkeleton />}>
        <LazyBillDetail bill={selectedBill} onBack={handleBackToBills} />
      </Suspense>
    );
  }

  if (loading && bills.length === 0) {
    return <BillsLoadingSkeleton />;
  }

  if (error) {
    return <BillsErrorState error={error} onRetry={() => window.location.reload()} />;
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
            <OptimizedBillsGrid bills={bills} onBillSelect={handleBillSelect} />
            
            {/* Load More Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPageBills} of {totalBills.toLocaleString()} bills
              </div>
              
              {hasNextPage && (
                <button
                  onClick={() => loadMoreBills()}
                  disabled={isFetchingMore}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isFetchingMore ? "Loading..." : "Load More Bills"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedBills;

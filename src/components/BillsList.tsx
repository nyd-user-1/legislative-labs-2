import { Tables } from "@/integrations/supabase/types";
import { useBillsData } from "@/hooks/useBillsData";
import { BillCard, BillsLoadingSkeleton, BillsErrorState, BillsEmptyState } from "./bills";

type Bill = Tables<"Bills">;

interface BillsListProps {
  filters: {
    search: string;
    sponsor: string;
    committee: string;
    dateRange: string;
  };
  onBillSelect: (bill: Bill) => void;
}

export const BillsList = ({
  filters,
  onBillSelect
}: BillsListProps) => {
  const { bills, loading, error, fetchBills } = useBillsData(filters);

  if (loading) {
    return <BillsLoadingSkeleton />;
  }

  if (error) {
    return <BillsErrorState error={error} onRetry={fetchBills} />;
  }

  return (
    <div className="space-y-6">
      {bills.length === 0 ? (
        <BillsEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map(bill => (
            <BillCard 
              key={bill.bill_id} 
              bill={bill} 
              onBillSelect={onBillSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
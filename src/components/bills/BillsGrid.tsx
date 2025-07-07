import { BillCard } from "./BillCard";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface BillsGridProps {
  bills: Bill[];
  onBillSelect: (bill: Bill) => void;
}

export const BillsGrid = ({ bills, onBillSelect }: BillsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bills.map((bill) => (
        <BillCard
          key={bill.bill_id}
          bill={bill}
          onBillSelect={onBillSelect}
        />
      ))}
    </div>
  );
};
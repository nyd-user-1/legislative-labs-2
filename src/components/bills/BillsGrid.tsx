import { BillCard } from "./BillCard";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;

interface BillsGridProps {
  bills: Bill[];
  onBillSelect: (bill: Bill) => void;
}

export const BillsGrid = ({ bills, onBillSelect }: BillsGridProps) => {
  return (
    <section className="grid-container grid grid-cols-1 lg:grid-cols-2 gap-6">
      {bills.map((bill) => (
        <BillCard
          key={bill.bill_id}
          bill={bill}
          onBillSelect={onBillSelect}
        />
      ))}
    </section>
  );
};
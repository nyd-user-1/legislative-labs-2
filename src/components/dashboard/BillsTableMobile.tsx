import { Card, CardContent } from "@/components/ui/card";
import { BillCard } from "./BillCard";
import { Bill, BillsTableProps } from "./types";

interface BillsTableMobileProps extends BillsTableProps {
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
}

export const BillsTableMobile = ({
  bills,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds
}: BillsTableMobileProps) => {
  return (
    <div className="block sm:hidden space-y-3">
      {bills.map((bill) => (
        <BillCard
          key={bill.bill_id}
          bill={bill}
          onBillSelect={onBillSelect}
          onAIAnalysis={onAIAnalysis}
          onFavorite={onFavorite}
          isFavorited={favoriteBillIds.has(bill.bill_id)}
        />
      ))}
      {bills.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No recent bills found
          </CardContent>
        </Card>
      )}
    </div>
  );
};
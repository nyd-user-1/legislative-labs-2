import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BillTableRow } from "./BillTableRow";
import { Bill, BillsTableProps } from "./types";

interface BillsTableDesktopProps extends BillsTableProps {
  onAIAnalysis: (bill: Bill, e: React.MouseEvent) => void;
  onFavorite: (bill: Bill, e: React.MouseEvent) => void;
  favoriteBillIds: Set<number>;
}

export const BillsTableDesktop = ({
  bills,
  onBillSelect,
  onAIAnalysis,
  onFavorite,
  favoriteBillIds
}: BillsTableDesktopProps) => {
  return (
    <div className="hidden sm:block rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Bill Number</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[110px]">Last Action</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <BillTableRow
                key={bill.bill_id}
                bill={bill}
                onBillSelect={onBillSelect}
                onAIAnalysis={onAIAnalysis}
                onFavorite={onFavorite}
                isFavorited={favoriteBillIds.has(bill.bill_id)}
              />
            ))}
            {bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No recent bills found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
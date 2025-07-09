import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface BillsTableProps {
  bills: Bill[];
  onBillSelect?: (bill: Bill) => void;
}

export const BillsTable = ({ bills, onBillSelect }: BillsTableProps) => {
  const getChamberFromBillNumber = (billNumber: string | null): string => {
    if (!billNumber) return "Unknown";
    if (billNumber.startsWith("S")) return "Senate";
    if (billNumber.startsWith("A")) return "Assembly";
    return "Unknown";
  };

  const formatLastAction = (dateString: string | null): string => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    if (!status) return "secondary";
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes("passed") || lowercaseStatus.includes("signed")) return "default";
    if (lowercaseStatus.includes("committee")) return "outline";
    if (lowercaseStatus.includes("withdrawn") || lowercaseStatus.includes("died")) return "destructive";
    return "secondary";
  };

  return (
    <div className="w-full">
      {/* Mobile view */}
      <div className="block sm:hidden space-y-3">
        {bills.map((bill) => (
          <Card 
            key={bill.bill_id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onBillSelect && onBillSelect(bill)}
          >
            <CardContent className="p-4 min-h-[120px] flex flex-col">
              <div className="flex items-start justify-between gap-3 flex-1">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {bill.bill_number || "No Number"}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm leading-tight line-clamp-2">
                    {bill.title || "No Title"}
                  </h3>
                </div>
                <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs flex-shrink-0">
                  {bill.status_desc || "Unknown"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-end pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    // AI analysis functionality would go here
                  }}
                  title="AI Analysis"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {bills.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No recent bills found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop/Tablet view */}
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
                <TableRow 
                  key={bill.bill_id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onBillSelect && onBillSelect(bill)}
                >
                  <TableCell className="font-medium">
                    {bill.bill_number || "No Number"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs">
                      {bill.status_desc || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatLastAction(bill.last_action_date)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[250px] truncate text-sm" title={bill.title || ""}>
                      {bill.title || "No Title"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          // AI analysis functionality would go here
                        }}
                        title="AI Analysis"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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
    </div>
  );
};
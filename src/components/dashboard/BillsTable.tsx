import { Tables } from "@/integrations/supabase/types";
import { AIIcon } from "@/components/AIIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill Number</TableHead>
            <TableHead>Chamber</TableHead>
            <TableHead>Sponsor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Action</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
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
                <Badge variant="outline">
                  {getChamberFromBillNumber(bill.bill_number)}
                </Badge>
              </TableCell>
              <TableCell>
                {bill.sponsors && bill.sponsors.length > 0 ? (
                  <span className="text-sm font-medium">
                    {bill.sponsors[0].name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">No Sponsor</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(bill.status_desc)}>
                  {bill.status_desc || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatLastAction(bill.last_action_date)}
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate" title={bill.title || ""}>
                  {bill.title || "No Title"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onBillSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBillSelect(bill);
                      }}
                    >
                      View
                    </Button>
                  )}
                  {bill.state_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={bill.state_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // AI analysis functionality would go here
                    }}
                    title="AI Analysis"
                  >
                    <AIIcon size={12} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {bills.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No recent bills found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
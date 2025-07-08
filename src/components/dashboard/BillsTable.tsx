import { Tables } from "@/integrations/supabase/types";
import { AIIcon } from "@/components/AIIcon";
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
    <div className="w-full">
      {/* Mobile view */}
      <div className="block sm:hidden space-y-3">
        {bills.map((bill) => (
          <Card 
            key={bill.bill_id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onBillSelect && onBillSelect(bill)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {bill.bill_number || "No Number"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getChamberFromBillNumber(bill.bill_number)}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm leading-tight line-clamp-2">
                    {bill.title || "No Title"}
                  </h3>
                </div>
                <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs flex-shrink-0">
                  {bill.status_desc || "Unknown"}
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>
                    Sponsor: {bill.sponsors && bill.sponsors.length > 0 ? bill.sponsors[0].name : "No Sponsor"}
                  </span>
                  <span>{formatLastAction(bill.last_action_date)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBillSelect && onBillSelect(bill);
                  }}
                >
                  View Details
                </Button>
                {bill.state_link && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="px-3"
                  >
                    <a
                      href={bill.state_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
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
                  <AIIcon size={12} />
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
                <TableHead className="min-w-[100px]">Chamber</TableHead>
                <TableHead className="min-w-[150px]">Sponsor</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[110px]">Last Action</TableHead>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
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
                    <Badge variant="outline" className="text-xs">
                      {getChamberFromBillNumber(bill.bill_number)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bill.sponsors && bill.sponsors.length > 0 ? (
                      <span className="text-sm font-medium">
                        {bill.sponsors[0].name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">No Sponsor</span>
                    )}
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
                    <div className="flex gap-1 justify-end">
                      {onBillSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2"
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
                          className="px-2"
                        >
                          <a
                            href={bill.state_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
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
                        <AIIcon size={14} />
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
      </div>
    </div>
  );
};
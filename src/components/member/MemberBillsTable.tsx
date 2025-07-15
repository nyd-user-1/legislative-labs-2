import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberBillsTableProps {
  member: Member;
}

// Mock data for demonstration - in real app this would come from API
const mockBillData = [
  {
    bill_id: 1,
    bill_number: "A05254",
    title: "Enacts the \"New York open water data act...",
    status: "Introduced",
    committee: "Assembly Ways and Means",
    last_action: "print number 5254a",
    last_action_date: "2024-01-15"
  },
  {
    bill_id: 2,
    bill_number: "A06452", 
    title: "Requires the superintendent of state polic...",
    status: "Introduced",
    committee: "Assembly Governmental Operations",
    last_action: "print number 6452b",
    last_action_date: "2024-01-18"
  },
  {
    bill_id: 3,
    bill_number: "A02193",
    title: "Provides technical corrections to provision...",
    status: "Introduced", 
    committee: "Assembly Codes",
    last_action: "print number 2193a",
    last_action_date: "2024-01-12"
  },
  {
    bill_id: 4,
    bill_number: "A04179",
    title: "Includes digital health care service platfor...",
    status: "Introduced",
    committee: "Assembly Health", 
    last_action: "print number 4179a",
    last_action_date: "2024-01-20"
  },
  {
    bill_id: 5,
    bill_number: "A05600",
    title: "Relates to certain voidable transfers affect...",
    status: "Introduced",
    committee: "Assembly Rules",
    last_action: "amend and recommit to rules 5600a",
    last_action_date: "2024-01-25"
  }
];

export const MemberBillsTable = ({ member }: MemberBillsTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const handleAIAnalysis = (bill: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBill(bill);
    setChatOpen(true);
  };

  const handleFavorite = (bill: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle favorite functionality here
    console.log("Favoriting bill:", bill.bill_number);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Member Bills</CardTitle>
          <Button variant="outline" size="sm">
            View All Bills
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillData.map((bill) => (
                <TableRow key={bill.bill_id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{bill.bill_number}</TableCell>
                  <TableCell className="max-w-xs truncate">{bill.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{bill.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{bill.committee}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {bill.last_action}
                  </TableCell>
                  <TableCell>
                    <CardActionButtons
                      onFavorite={(e) => handleFavorite(bill, e)}
                      onAIAnalysis={(e) => handleAIAnalysis(bill, e)}
                      isFavorited={false}
                      hasAIChat={false}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBill}
      />
    </>
  );
};
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { useMemberBills } from "@/hooks/useMemberBills";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberBillsTableProps {
  member: Member;
}


export const MemberBillsTable = ({ member }: MemberBillsTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const { bills, loading, error } = useMemberBills(member.people_id);

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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading bills...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : bills.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No bills found for this member</div>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Bill</TableHead>
                      <TableHead className="min-w-[300px]">Title</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[200px]">Committee</TableHead>
                      <TableHead className="min-w-[250px]">Last Action</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.bill_id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{bill.bill_number}</TableCell>
                        <TableCell className="max-w-xs">{bill.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{bill.status_desc || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell>{bill.committee || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {bill.last_action || "No action recorded"}
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
              </div>
            </ScrollArea>
          )}
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
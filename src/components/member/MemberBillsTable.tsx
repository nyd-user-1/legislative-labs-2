
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { Search } from "lucide-react";
import { useMemberBills } from "@/hooks/useMemberBills";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Member = Tables<"People">;

interface MemberBillsTableProps {
  member: Member;
}

export const MemberBillsTable = ({ member }: MemberBillsTableProps) => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { bills, loading, error } = useMemberBills(member.people_id);

  const handleBillClick = (bill: any) => {
    navigate(`/bills?selected=${bill.bill_id}`);
  };

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

  // Filter bills
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    
    const query = searchQuery.toLowerCase();
    return bills.filter(bill => 
      bill.bill_number?.toLowerCase().includes(query) ||
      bill.title?.toLowerCase().includes(query) ||
      bill.description?.toLowerCase().includes(query) ||
      bill.last_action?.toLowerCase().includes(query) ||
      bill.committee?.toLowerCase().includes(query) ||
      bill.status_desc?.toLowerCase().includes(query)
    );
  }, [bills, searchQuery]);

  return (
    <>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Member Bills</CardTitle>
            <Button variant="outline" size="sm">
              View All Bills
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bills by number, title, description, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading bills...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? "No bills found matching your search" : "No bills found for this member"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Bill</TableHead>
                    <TableHead className="min-w-[300px]">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead className="min-w-[200px]">Last Action</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow 
                      key={bill.bill_id} 
                      className="cursor-pointer" 
                      onClick={() => handleBillClick(bill)}
                    >
                      <TableCell className="font-medium">{bill.bill_number}</TableCell>
                      <TableCell>{bill.title}</TableCell>
                      <TableCell>
                        <Badge variant={bill.status_desc?.toLowerCase() === "passed" ? "success" : "secondary"}>
                          {bill.status_desc || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{bill.committee || "N/A"}</TableCell>
                      <TableCell className="text-sm">{bill.last_action || "No action recorded"}</TableCell>
                      <TableCell className="text-sm">{formatDate(bill.last_action_date)}</TableCell>
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

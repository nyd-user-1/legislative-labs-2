import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useMemberBills } from "@/hooks/useMemberBills";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Member = Tables<"People">;

interface MemberBillsTableProps {
  member: Member;
}


type SortField = 'bill_number' | 'title' | 'status_desc' | 'committee' | 'last_action' | 'last_action_date';
type SortDirection = 'asc' | 'desc' | null;

export const MemberBillsTable = ({ member }: MemberBillsTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Filter and sort bills
  const filteredAndSortedBills = useMemo(() => {
    let filtered = bills;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = bills.filter(bill => 
        bill.bill_number?.toLowerCase().includes(query) ||
        bill.title?.toLowerCase().includes(query) ||
        bill.description?.toLowerCase().includes(query) ||
        bill.last_action?.toLowerCase().includes(query) ||
        bill.committee?.toLowerCase().includes(query) ||
        bill.status_desc?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField] || '';
        let bValue: any = b[sortField] || '';
        
        // Special handling for dates
        if (sortField === 'last_action_date') {
          const aDate = new Date(aValue || 0);
          const bDate = new Date(bValue || 0);
          if (sortDirection === 'asc') {
            return aDate.getTime() - bDate.getTime();
          } else {
            return bDate.getTime() - aDate.getTime();
          }
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        }
      });
    }

    return filtered;
  }, [bills, searchQuery, sortField, sortDirection]);

  return (
    <>
      <Card>
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
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading bills...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : filteredAndSortedBills.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? "No bills found matching your search" : "No bills found for this member"}
              </div>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('bill_number')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Bill {getSortIcon('bill_number')}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[300px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('title')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Title {getSortIcon('title')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('status_desc')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Status {getSortIcon('status_desc')}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('committee')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Committee {getSortIcon('committee')}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('last_action')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Last Action {getSortIcon('last_action')}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('last_action_date')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Date {getSortIcon('last_action_date')}
                        </Button>
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedBills.map((bill) => (
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
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(bill.last_action_date)}
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
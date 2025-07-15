
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { AIChatSheet } from "@/components/AIChatSheet";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, HelpCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Member = Tables<"People">;

interface MemberVotesTableProps {
  member: Member;
}

type SortField = 'bill_number' | 'description' | 'vote_date' | 'vote_type' | 'sponsor' | 'committee';
type SortDirection = 'asc' | 'desc' | null;

// Enhanced mock vote data with additional searchable fields
const mockVoteData = [
  {
    id: 1,
    bill_number: "S08298",
    vote_type: "Yes",
    vote_date: "2025-01-05",
    description: "Clarifies the definition of business records and the use of such records in grand jury proceedings.",
    bill_id: 1001,
    sponsor: "Senator John Smith",
    co_sponsors: ["Senator Jane Doe", "Senator Bob Johnson"],
    committee: "Judiciary Committee",
    bill_text: "An act to amend the criminal procedure law in relation to business records and grand jury proceedings",
    status: "Passed Senate"
  },
  {
    id: 2,
    bill_number: "A05254",
    vote_type: "No", 
    vote_date: "2025-01-04",
    description: "Enacts the 'New York open water data act'",
    bill_id: 1002,
    sponsor: "Assemblymember Sarah Wilson",
    co_sponsors: ["Assemblymember Mike Davis"],
    committee: "Environmental Conservation Committee",
    bill_text: "An act to establish open data requirements for water quality information",
    status: "In Committee"
  },
  {
    id: 3,
    bill_number: "A06452",
    vote_type: "Absent",
    vote_date: "2025-01-03", 
    description: "Requires the superintendent of state police to study and report on hate crimes",
    bill_id: 1003,
    sponsor: "Assemblymember Lisa Rodriguez",
    co_sponsors: ["Assemblymember Tom Chen", "Assemblymember Amy Martinez"],
    committee: "Codes Committee",
    bill_text: "An act requiring comprehensive hate crime reporting and analysis",
    status: "Referred to Committee"
  },
  {
    id: 4,
    bill_number: "S07123",
    vote_type: "Yes",
    vote_date: "2025-01-02",
    description: "Establishes renewable energy standards for state buildings",
    bill_id: 1004,
    sponsor: "Senator Emily Green",
    co_sponsors: ["Senator Robert Brown"],
    committee: "Energy and Telecommunications Committee",
    bill_text: "An act establishing renewable energy requirements for government facilities",
    status: "Passed Senate"
  },
  {
    id: 5,
    bill_number: "A04789",
    vote_type: "No",
    vote_date: "2025-01-01",
    description: "Modifies regulations on small business tax incentives",
    bill_id: 1005,
    sponsor: "Assemblymember David Lee",
    co_sponsors: ["Assemblymember Karen White", "Assemblymember Joe Black"],
    committee: "Small Business Committee",
    bill_text: "An act to modify tax incentive programs for small businesses",
    status: "In Assembly"
  }
];

export const MemberVotesTable = ({ member }: MemberVotesTableProps) => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleVoteClick = (vote: any) => {
    navigate(`/bills?selected=${vote.bill_id}`);
  };

  const handleAIAnalysis = (vote: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat({
      bill_id: vote.bill_id,
      bill_number: vote.bill_number,
      title: vote.description,
    });
    setChatOpen(true);
  };

  const handleFavorite = async (vote: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality for votes/bills
    console.log("Favorite vote:", vote);
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

  const getVoteBadgeVariant = (voteType: string) => {
    switch (voteType.toLowerCase()) {
      case 'yes':
        return 'success';
      case 'no':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Filter and sort votes with comprehensive search
  const filteredAndSortedVotes = useMemo(() => {
    let filtered = mockVoteData;

    // Apply robust search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = mockVoteData.filter(vote => 
        // Basic bill information
        vote.bill_number?.toLowerCase().includes(query) ||
        vote.description?.toLowerCase().includes(query) ||
        vote.bill_text?.toLowerCase().includes(query) ||
        vote.status?.toLowerCase().includes(query) ||
        
        // Sponsor and co-sponsor search
        vote.sponsor?.toLowerCase().includes(query) ||
        vote.co_sponsors?.some(coSponsor => 
          coSponsor.toLowerCase().includes(query)
        ) ||
        
        // Committee search
        vote.committee?.toLowerCase().includes(query) ||
        
        // Vote type search
        vote.vote_type?.toLowerCase().includes(query) ||
        
        // Date search (supports partial matches like "2025" or "01/05")
        vote.vote_date?.includes(query) ||
        formatDate(vote.vote_date)?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField] || '';
        let bValue: any = b[sortField] || '';
        
        // Special handling for dates
        if (sortField === 'vote_date') {
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
  }, [searchQuery, sortField, sortDirection]);

  return (
    <>
      <TooltipProvider>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Member Votes</CardTitle>
              <Button variant="outline" size="sm">
                View All Votes
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search votes by bill number, description, sponsor, co-sponsor, committee, vote type, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedVotes.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  {searchQuery ? "No votes found matching your search" : "No voting records found"}
                </div>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
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
                            onClick={() => handleSort('description')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Description {getSortIcon('description')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('vote_date')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Vote Date {getSortIcon('vote_date')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('vote_type')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Vote Type {getSortIcon('vote_type')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedVotes.map((vote) => (
                        <TableRow 
                          key={vote.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleVoteClick(vote)}
                        >
                          <TableCell className="font-medium">{vote.bill_number}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="line-clamp-2 text-sm">{vote.description}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(vote.vote_date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getVoteBadgeVariant(vote.vote_type)}>
                              {vote.vote_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CardActionButtons
                              onFavorite={(e) => handleFavorite(vote, e)}
                              onAIAnalysis={(e) => handleAIAnalysis(vote, e)}
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
      </TooltipProvider>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </>
  );
};

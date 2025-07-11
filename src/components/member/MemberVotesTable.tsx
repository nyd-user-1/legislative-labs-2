
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";
import { AIChatSheet } from "@/components/AIChatSheet";

type Member = Tables<"People">;

interface MemberVotesTableProps {
  member: Member;
}

// Mock vote data for now - replace with real data when available
const mockVoteData = [
  {
    id: 1,
    bill_number: "S08298",
    vote_type: "Yes",
    vote_date: "2025-01-05",
    description: "Clarifies the definition of business records and the use of such records in grand jury proceedings.",
    bill_id: 1001
  },
  {
    id: 2,
    bill_number: "A05254",
    vote_type: "No", 
    vote_date: "2025-01-04",
    description: "Enacts the 'New York open water data act'",
    bill_id: 1002
  },
  {
    id: 3,
    bill_number: "A06452",
    vote_type: "Absent",
    vote_date: "2025-01-03", 
    description: "Requires the superintendent of state police to study and report on hate crimes",
    bill_id: 1003
  }
];

export const MemberVotesTable = ({ member }: MemberVotesTableProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<any>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Member Votes</h3>
        <Button variant="outline" size="sm">
          View All Votes
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Bill</TableHead>
                <TableHead className="min-w-[120px]">Vote Type</TableHead>
                <TableHead className="min-w-[110px]">Vote Date</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVoteData.map((vote) => (
                <TableRow 
                  key={vote.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => console.log("Navigate to bill:", vote.bill_id)}
                >
                  <TableCell className="font-medium">
                    {vote.bill_number}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      vote.vote_type === 'Yes' 
                        ? 'bg-green-100 text-green-700'
                        : vote.vote_type === 'No'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {vote.vote_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(vote.vote_date)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {vote.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <CardActionButtons
                      onFavorite={(e) => handleFavorite(vote, e)}
                      onAIAnalysis={(e) => handleAIAnalysis(vote, e)}
                      variant="ghost"
                      size="sm"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {mockVoteData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No voting records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </div>
  );
};

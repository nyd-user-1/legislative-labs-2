import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  History,
  Users,
  Vote
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { MemberVotesTable } from "./MemberVotesTable";
import { MemberCommitteesTable } from "./MemberCommitteesTable";

type Member = Tables<"People">;

interface MemberTabsProps {
  member: Member;
}

export const MemberTabs = ({ member }: MemberTabsProps) => {
  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  return (
    <Tabs defaultValue="history" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
        <TabsTrigger value="history" className="h-10 rounded-md text-sm font-medium">
          History
        </TabsTrigger>
        <TabsTrigger value="documents" className="h-10 rounded-md text-sm font-medium">
          Documents
        </TabsTrigger>
        <TabsTrigger value="committees" className="h-10 rounded-md text-sm font-medium">
          Committees
        </TabsTrigger>
        <TabsTrigger value="votes" className="h-10 rounded-md text-sm font-medium">
          Votes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Member History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 border-b border-border">
                <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                  Recent
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {member.chamber && (
                      <Badge variant="outline" className="text-xs">
                        {member.chamber}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{getLatestAction()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Current status in legislative system</p>
                </div>
              </div>
              <p className="text-muted-foreground text-center py-8">
                Detailed member history tracking coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Member Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Document management coming soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="committees">
        <MemberCommitteesTable member={member} />
      </TabsContent>

      <TabsContent value="votes">
        <MemberVotesTable member={member} />
      </TabsContent>
    </Tabs>
  );
};
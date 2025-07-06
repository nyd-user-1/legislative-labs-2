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
    <Tabs defaultValue="history" className="space-y-4 w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto flex-wrap sm:flex-nowrap">
        <TabsTrigger value="history" className="flex items-center gap-2 text-xs sm:text-sm p-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2 text-xs sm:text-sm p-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </TabsTrigger>
        <TabsTrigger value="committees" className="flex items-center gap-2 text-xs sm:text-sm p-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Committees</span>
        </TabsTrigger>
        <TabsTrigger value="votes" className="flex items-center gap-2 text-xs sm:text-sm p-2">
          <Vote className="h-4 w-4" />
          <span className="hidden sm:inline">Votes</span>
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
        <Card>
          <CardHeader>
            <CardTitle>Committee Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {member.committee_id ? (
              <div className="space-y-2">
                <p className="font-medium">Committee ID: {member.committee_id}</p>
                <p className="text-muted-foreground text-sm">
                  Full committee details coming soon.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No committee assignments found.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="votes">
        <Card>
          <CardHeader>
            <CardTitle>Voting Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Vote tracking functionality coming soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
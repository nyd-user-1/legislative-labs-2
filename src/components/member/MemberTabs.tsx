
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  User,
  Users,
  Vote
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { MemberVotesTable } from "./MemberVotesTable";
import { MemberCommitteesTable } from "./MemberCommitteesTable";
import { MemberBillsTable } from "./MemberBillsTable";

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

  const getStatusBadgeVariant = () => {
    if (member.committee_id) return "default";
    if (member.chamber) return "secondary";
    return "outline";
  };

  return (
    <Tabs defaultValue="bio" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
        <TabsTrigger value="bio" className="h-10 rounded-md text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Bio
        </TabsTrigger>
        <TabsTrigger value="bills" className="h-10 rounded-md text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Bills
        </TabsTrigger>
        <TabsTrigger value="committees" className="h-10 rounded-md text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Committees
        </TabsTrigger>
        <TabsTrigger value="votes" className="h-10 rounded-md text-sm font-medium flex items-center gap-2">
          <Vote className="h-4 w-4" />
          Votes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bio">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Member Biography</CardTitle>
              <Badge variant={getStatusBadgeVariant()}>
                {getLatestAction()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member.bio_long ? (
                <div className="prose max-w-none">
                  <p className="text-sm leading-relaxed text-foreground">{member.bio_long}</p>
                </div>
              ) : member.bio_short ? (
                <div className="prose max-w-none">
                  <p className="text-sm leading-relaxed text-foreground">{member.bio_short}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Biography information is not available for this member.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Additional biographical details may be available through the New York State Legislature website.
                  </p>
                </div>
              )}
              
              {/* Additional member details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {member.chamber && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Chamber:</span>
                    <p className="text-sm text-foreground capitalize">{member.chamber.toLowerCase()}</p>
                  </div>
                )}
                {member.district && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">District:</span>
                    <p className="text-sm text-foreground">{member.district}</p>
                  </div>
                )}
                {member.party && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Party:</span>
                    <p className="text-sm text-foreground">{member.party}</p>
                  </div>
                )}
                {member.role && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Role:</span>
                    <p className="text-sm text-foreground">{member.role}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bills">
        <MemberBillsTable member={member} />
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

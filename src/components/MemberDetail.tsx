import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { 
  MemberInformation, 
  MemberStatusProgress, 
  MemberTabs 
} from "./member";

type Member = Tables<"People">;

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl leading-tight">
                {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
              </CardTitle>
              {member.bio_short && (
                <p className="text-muted-foreground mt-2 text-lg">{member.bio_short}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MemberInformation member={member} />
          <MemberStatusProgress member={member} />
        </CardContent>
      </Card>

      <MemberTabs member={member} />
    </div>
  );
};
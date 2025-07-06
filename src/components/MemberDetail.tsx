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
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Members</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl leading-tight break-words">
                {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
              </CardTitle>
              {member.bio_short && (
                <p className="text-muted-foreground mt-2 text-base sm:text-lg break-words">{member.bio_short}</p>
              )}
            </div>
            <div className="flex-shrink-0 self-start">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MemberInformation member={member} />
          <MemberStatusProgress member={member} />
        </CardContent>
      </Card>

      <MemberTabs member={member} />
    </div>
  );
};
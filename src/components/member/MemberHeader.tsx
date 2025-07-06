import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberHeaderProps {
  member: Member;
}

export const MemberHeader = ({ member }: MemberHeaderProps) => {
  return (
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
  );
};
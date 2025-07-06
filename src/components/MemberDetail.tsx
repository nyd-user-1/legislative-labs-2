import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { 
  MemberHeader, 
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
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      <Card className="overflow-hidden">
        <MemberHeader member={member} />
        <CardContent className="p-4 sm:p-6">
          <MemberInformation member={member} />
          <MemberStatusProgress member={member} />
        </CardContent>
      </Card>

      <MemberTabs member={member} />
    </div>
  );
};
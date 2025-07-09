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
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Members</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Combined Member Header and Information Section */}
        <section className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words mb-2">
                {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
              </h1>
              {member.bio_short && (
                <p className="text-gray-600 text-base sm:text-lg break-words">{member.bio_short}</p>
              )}
            </div>
            <div className="flex-shrink-0 self-start">
              <Badge 
                variant="secondary" 
                className={member.chamber?.toLowerCase() === 'senate' 
                  ? "bg-purple-100 text-purple-700 border-purple-200" 
                  : "bg-green-100 text-green-700 border-green-200"
                }
              >
                {member.chamber || "Active"}
              </Badge>
            </div>
          </div>

          {/* Member Information */}
          <div className="max-w-2xl">
            <MemberInformation member={member} />
          </div>
        </section>

        {/* Member Tabs Section */}
        <section>
          <MemberTabs member={member} />
        </section>
      </div>
    </div>
  );
};
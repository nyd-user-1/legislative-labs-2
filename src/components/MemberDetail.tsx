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
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack} 
                className="btn-secondary border border-gray-300 hover:border-gray-400 active:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Members</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </section>

          {/* Member Header Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </section>

          {/* Member Information Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <MemberInformation member={member} />
          </section>

          {/* Member Status Progress Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <MemberStatusProgress member={member} />
          </section>

          {/* Member Tabs Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <MemberTabs member={member} />
          </section>
        </div>
      </div>
    </div>
  );
};
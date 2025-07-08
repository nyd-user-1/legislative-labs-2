import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Target, Folder, ExternalLink, Calendar, Users } from "lucide-react";
import { NYSMember } from "@/types/nysApi";

type EnhancedCommittee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
  meetingDateTime?: string;
  location?: string;
  agendaNo?: number;
  year?: number;
  members?: NYSMember[];
  upcomingMeetings?: Array<{
    date: string;
    location: string;
    agenda: any;
  }>;
};

interface CommitteeCardProps {
  committee: EnhancedCommittee;
  onCommitteeSelect: (committee: EnhancedCommittee) => void;
}

export const CommitteeCard = ({ committee, onCommitteeSelect }: CommitteeCardProps) => {
  const getChamberColor = (chamber: string) => {
    if (!chamber) return "bg-muted text-muted-foreground";
    const chamberLower = chamber.toLowerCase();
    if (chamberLower.includes("senate")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (chamberLower.includes("assembly")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (chamberLower.includes("joint")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card 
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onCommitteeSelect(committee)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {committee.name}
            </h3>
          </div>
          
          {committee.chamber && (
            <Badge variant="outline" className={`${getChamberColor(committee.chamber)} w-fit`}>
              {committee.chamber}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 py-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{committee.memberCount}</span>
              <span className="text-muted-foreground">members</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Folder className="h-4 w-4 text-green-600" />
              <span className="font-medium">{committee.billCount}</span>
              <span className="text-muted-foreground">bills</span>
            </div>
          </div>

          <div className="space-y-2">
            {committee.chair_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-medium">{committee.chair_name}</span>
                <span className="text-muted-foreground">(Chair)</span>
              </div>
            )}

            {committee.ranking_member_name && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{committee.ranking_member_name}</span>
                <span className="text-muted-foreground">(Ranking Member)</span>
              </div>
            )}

            {committee.committee_type && (
              <div className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{committee.committee_type}</span>
              </div>
            )}

            {/* Meeting Information */}
            {committee.meetingDateTime && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="truncate text-purple-700 font-medium">Next Meeting</span>
              </div>
            )}

            {committee.upcomingMeetings && committee.upcomingMeetings.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span className="truncate text-orange-700 font-medium">
                  {committee.upcomingMeetings.length} upcoming meeting{committee.upcomingMeetings.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="pt-1">
              <div
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                View Details
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
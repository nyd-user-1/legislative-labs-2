
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { MapPin, Users, Calendar, Mail } from "lucide-react";

type Committee = {
  committee_id: number;
  name: string;
  memberCount: string;
  billCount: string;
  description?: string;
  chair_name?: string;
  chair_email?: string;
  chamber: string;
  committee_url?: string;
  meeting_schedule?: string;
  next_meeting?: string;
  upcoming_agenda?: string;
  address?: string;
  slug?: string;
};

interface CommitteeCardProps {
  committee: Committee;
  onCommitteeSelect: (committee: Committee) => void;
  onAIAnalysis?: (committee: Committee, e: React.MouseEvent) => void;
  onFavorite?: (committee: Committee, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

export const CommitteeCard = ({ 
  committee, 
  onCommitteeSelect,
  onAIAnalysis,
  onFavorite,
  isFavorited = false,
  hasAIChat = false
}: CommitteeCardProps) => {
  const getChamberColor = (chamber: string | null) => {
    if (!chamber) return "bg-muted text-muted-foreground";
    const chamberLower = chamber.toLowerCase();
    if (chamberLower.includes("senate")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (chamberLower.includes("assembly")) {
      return "bg-green-100 text-green-800 border-green-200";
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
              {committee.name || "Unknown Committee"}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {committee.chamber && (
              <Badge variant="outline" className={`${getChamberColor(committee.chamber)} w-fit`}>
                {committee.chamber}
              </Badge>
            )}
            
            <CardActionButtons
              onFavorite={onFavorite ? (e) => onFavorite(committee, e) : undefined}
              onAIAnalysis={onAIAnalysis ? (e) => onAIAnalysis(committee, e) : undefined}
              isFavorited={isFavorited}
              hasAIChat={hasAIChat}
              showFavorite={!!onFavorite}
              showAIAnalysis={!!onAIAnalysis}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {committee.chair_name && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium">Chair: {committee.chair_name}</span>
            </div>
          )}

          {committee.chair_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{committee.chair_email}</span>
            </div>
          )}

          {committee.meeting_schedule && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{committee.meeting_schedule}</span>
            </div>
          )}

          {committee.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{committee.address}</span>
            </div>
          )}

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Members: {committee.memberCount || "N/A"}</span>
            <span>Bills: {committee.billCount || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

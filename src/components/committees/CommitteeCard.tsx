
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { User, Users, FileText, ExternalLink } from "lucide-react";

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
          {/* Row 1: Chair */}
          {committee.chair_name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium">{committee.chair_name}</span>
              <span className="text-muted-foreground">(Chair)</span>
            </div>
          )}

          {/* Row 2: Member Count */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{committee.memberCount} members</span>
          </div>

          {/* Row 3: Bill Count */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{committee.billCount} active bills</span>
          </div>

          {/* Row 4: External Link */}
          <div className="pt-1">
            <div
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (committee.committee_url) {
                  window.open(committee.committee_url, '_blank');
                }
              }}
            >
              <ExternalLink className="h-3 w-3" />
              View Committee Page
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

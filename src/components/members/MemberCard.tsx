
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

type Member = {
  people_id: number;
  name: string | null;
  party: string | null;
  chamber: string | null;
  district: string | null;
  role: string | null;
  email: string | null;
  phone_capitol: string | null;
  address: string | null;
  photo_url: string | null;
  bio_short: string | null;
};

interface MemberCardProps {
  member: Member;
  onMemberSelect: (member: Member) => void;
  onAIAnalysis?: (member: Member, e: React.MouseEvent) => void;
  onFavorite?: (member: Member, e: React.MouseEvent) => void;
  isFavorited?: boolean;
  hasAIChat?: boolean;
}

export const MemberCard = ({ 
  member, 
  onMemberSelect,
  onAIAnalysis,
  onFavorite,
  isFavorited = false,
  hasAIChat = false
}: MemberCardProps) => {
  const getPartyColor = (party: string | null) => {
    if (!party) return "bg-muted text-muted-foreground";
    const partyLower = party.toLowerCase();
    if (partyLower.includes("democrat") || partyLower.includes("democratic")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (partyLower.includes("republican")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (partyLower.includes("independent")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card 
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onMemberSelect(member)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {member.name || "Unknown Member"}
            </h3>
          </div>
          
          <CardActionButtons
            onFavorite={onFavorite ? (e) => onFavorite(member, e) : undefined}
            onAIAnalysis={onAIAnalysis ? (e) => onAIAnalysis(member, e) : undefined}
            isFavorited={isFavorited}
            hasAIChat={hasAIChat}
            showFavorite={!!onFavorite}
            showAIAnalysis={!!onAIAnalysis}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Party and District badges */}
          <div className="flex items-center gap-2">
            {member.chamber && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                {member.chamber}
              </Badge>
            )}
            {member.party && (
              <Badge variant="outline" className={`${getPartyColor(member.party)} w-fit`}>
                {member.party.charAt(0)}
              </Badge>
            )}
          </div>

          {/* District */}
          {member.district && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">District {member.district}</span>
            </div>
          )}

          {/* Email */}
          {member.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}

          {/* Phone */}
          {member.phone_capitol && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{member.phone_capitol}</span>
            </div>
          )}

          {/* View Full Bio link */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            <span>View Full Bio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

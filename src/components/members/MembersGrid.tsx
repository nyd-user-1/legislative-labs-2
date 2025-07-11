
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardActionButtons } from "@/components/ui/CardActionButtons";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  party: string;
  chamber: string;
  district: string;
  role: string;
  email: string;
  phone_capitol: string;
  phone_district: string;
  address: string;
  bio_short: string;
  ballotpedia: string;
}

interface MembersGridProps {
  members: Member[];
  onMemberSelect?: (member: Member) => void;
  onFavorite?: (member: Member, e: React.MouseEvent) => void;
  onAIAnalysis?: (member: Member, e: React.MouseEvent) => void;
  favoriteMembers?: Set<number>;
  membersWithAIChat?: Set<number>;
}

export const MembersGrid = ({ 
  members, 
  onMemberSelect,
  onFavorite,
  onAIAnalysis,
  favoriteMembers = new Set(),
  membersWithAIChat = new Set()
}: MembersGridProps) => {
  const getPartyColor = (party: string) => {
    if (!party) return "bg-muted";
    const partyLower = party.toLowerCase();
    if (partyLower.includes("republican") || partyLower.includes("r")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (partyLower.includes("democratic") || partyLower.includes("d")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-muted text-muted-foreground";
  };

  const getChamberColor = (chamber: string) => {
    if (!chamber) return "bg-muted text-muted-foreground";
    const chamberLower = chamber.toLowerCase();
    if (chamberLower.includes("senate")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (chamberLower.includes("assembly")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <Card 
          key={member.people_id} 
          className="card hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onMemberSelect?.(member)}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight mb-2">
                  {member.name}
                </h3>
                
                <div className="flex gap-2 flex-wrap">
                  {member.chamber && (
                    <Badge variant="outline" className={`${getChamberColor(member.chamber)} w-fit`}>
                      {member.chamber}
                    </Badge>
                  )}
                  
                  {member.party && (
                    <Badge variant="outline" className={`${getPartyColor(member.party)} w-fit`}>
                      {member.party}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CardActionButtons
                  onFavorite={onFavorite ? (e) => onFavorite(member, e) : undefined}
                  onAIAnalysis={onAIAnalysis ? (e) => onAIAnalysis(member, e) : undefined}
                  isFavorited={favoriteMembers.has(member.people_id)}
                  hasAIChat={membersWithAIChat.has(member.people_id)}
                  showFavorite={!!onFavorite}
                  showAIAnalysis={!!onAIAnalysis}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-2 pt-2 border-t">
                {member.district && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>District {member.district}</span>
                  </div>
                )}
                
                {member.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${member.email}`}
                      className="text-primary hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.email}
                    </a>
                  </div>
                )}
                
                {(member.phone_capitol || member.phone_district) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {member.phone_capitol || member.phone_district}
                    </span>
                  </div>
                )}
                
                {member.ballotpedia && (
                  <div className="pt-1">
                    <a
                      href={member.ballotpedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Bio
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

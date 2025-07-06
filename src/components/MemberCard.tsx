import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

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

interface MemberCardProps {
  member: Member;
  onClick: (member: Member) => void;
}

export const MemberCard = ({ member, onClick }: MemberCardProps) => {
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
    if (!chamber) return "bg-muted";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" onClick={() => onClick(member)}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${member.photo_url ? 'hidden' : ''} text-lg font-semibold text-muted-foreground`}>
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {member.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {member.chamber && (
                <Badge variant="outline" className={getChamberColor(member.chamber)}>
                  {member.chamber}
                </Badge>
              )}
              {member.party && (
                <Badge variant="outline" className={getPartyColor(member.party)}>
                  {member.party}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {member.role && (
            <p className="text-sm text-muted-foreground font-medium">
              {member.role}
            </p>
          )}
          
          {member.district && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>District {member.district}</span>
            </div>
          )}
          
          {member.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {(member.phone_capitol || member.phone_district) && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{member.phone_capitol || member.phone_district}</span>
            </div>
          )}
          
          {member.bio_short && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {member.bio_short}
            </p>
          )}
          
          {member.ballotpedia && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(member.ballotpedia, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Bio
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
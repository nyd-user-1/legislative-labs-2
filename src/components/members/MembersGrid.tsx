import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export const MembersGrid = ({ members }: MembersGridProps) => {
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

  return (
    <div className="grid-container">
      {members.map((member) => (
        <Card key={member.people_id} className="card-interactive">
          <CardHeader className="card-header">
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
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {member.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {member.party && (
                    <Badge variant="outline" className={getPartyColor(member.party)}>
                      {member.party}
                    </Badge>
                  )}
                  {member.chamber && (
                    <Badge variant="secondary">
                      {member.chamber}
                    </Badge>
                  )}
                </div>
                {member.role && (
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="card-body">
            <div className="space-y-3">
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
                <div className="pt-2">
                  <a
                    href={member.ballotpedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Full Bio
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
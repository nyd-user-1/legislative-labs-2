import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

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

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
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
    <div className="space-y-6">
      <Button 
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
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
              <div className={`${member.photo_url ? 'hidden' : ''} text-2xl font-semibold text-muted-foreground`}>
                {member.first_name?.[0]}{member.last_name?.[0]}
              </div>
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{member.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 mb-4">
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
                {member.role && (
                  <Badge variant="secondary">
                    {member.role}
                  </Badge>
                )}
              </div>
              
              {member.district && (
                <div className="flex items-center gap-2 text-lg mb-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>District {member.district}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {member.bio_short && (
            <div>
              <h3 className="font-semibold mb-2">Biography</h3>
              <p className="text-muted-foreground">{member.bio_short}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {member.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={`mailto:${member.email}`}
                      className="text-primary hover:underline"
                    >
                      {member.email}
                    </a>
                  </div>
                )}
                
                {member.phone_capitol && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>Capitol: {member.phone_capitol}</span>
                  </div>
                )}
                
                {member.phone_district && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>District: {member.phone_district}</span>
                  </div>
                )}
                
                {member.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span>{member.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Additional Resources</h3>
              <div className="space-y-3">
                {member.ballotpedia && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(member.ballotpedia, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Biography on Ballotpedia
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
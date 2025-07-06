import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberInformationProps {
  member: Member;
}

export const MemberInformation = ({ member }: MemberInformationProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Party & Chamber
            </h4>
            <p className="text-muted-foreground break-words">
              {member.party && member.chamber ? `${member.party} - ${member.chamber}` : member.party || member.chamber || "Not specified"}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              District
            </h4>
            <p className="text-muted-foreground">
              {member.district ? `District ${member.district}` : "Not assigned"}
            </p>
          </div>

          {member.email && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </h4>
              <p className="text-muted-foreground break-all">
                <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                  {member.email}
                </a>
              </p>
            </div>
          )}

          {(member.phone_capitol || member.phone_district) && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </h4>
              <div className="space-y-1">
                {member.phone_capitol && (
                  <p className="text-muted-foreground">
                    <a href={`tel:${member.phone_capitol}`} className="text-primary hover:underline">
                      Capitol: {member.phone_capitol}
                    </a>
                  </p>
                )}
                {member.phone_district && (
                  <p className="text-muted-foreground">
                    <a href={`tel:${member.phone_district}`} className="text-primary hover:underline">
                      District: {member.phone_district}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {member.ballotpedia && (
            <div className="space-y-2">
              <h4 className="font-medium">External Link</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(member.ballotpedia, '_blank')}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
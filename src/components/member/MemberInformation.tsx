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
  const memberName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`;
  
  return (
    <div className="space-y-6">
      {/* Member Name Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">{memberName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Party & Chamber */}
          {(member.party || member.chamber) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <User className="h-4 w-4" />
                <span>Party & Chamber</span>
              </div>
              <div className="text-gray-600 ml-6">
                {member.party && member.chamber ? `${member.party} - ${member.chamber}` : member.party || member.chamber}
              </div>
            </div>
          )}

          {/* District */}
          {member.district && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <MapPin className="h-4 w-4" />
                <span>District</span>
              </div>
               <div className="text-gray-600 ml-6">
                 {member.district}
               </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Email */}
          {member.email && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <div className="text-gray-600 ml-6">
                <a 
                  href={`mailto:${member.email}`} 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {member.email}
                </a>
              </div>
            </div>
          )}

          {/* Phone */}
          {(member.phone_capitol || member.phone_district) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <div className="text-gray-600 ml-6 space-y-1">
                {member.phone_capitol && (
                  <div>Capitol: {member.phone_capitol}</div>
                )}
                {member.phone_district && (
                  <div>District: {member.phone_district}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* External Link */}
      {member.ballotpedia && (
        <div className="space-y-2">
          <div className="text-gray-900 font-medium">
            External Link
          </div>
          <div className="ml-0">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <a 
                href={member.ballotpedia} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
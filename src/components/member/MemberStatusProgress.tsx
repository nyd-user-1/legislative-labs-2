import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberStatusProgressProps {
  member: Member;
}

export const MemberStatusProgress = ({ member }: MemberStatusProgressProps) => {
  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  const getMemberStatus = () => {
    if (member.committee_id && member.chamber) return 4; // Active
    if (member.chamber) return 3; // Verified
    if (member.people_id) return 2; // Registered
    return 1; // Draft
  };

  const getStatusSteps = () => {
    const currentStatus = getMemberStatus();
    return [
      { number: 1, label: "Registered", active: currentStatus >= 1 },
      { number: 2, label: "Verified", active: currentStatus >= 2 },
      { number: 3, label: "Committee", active: currentStatus >= 3 },
      { number: 4, label: "Active", active: currentStatus >= 4 },
      { number: 5, label: "Leadership", active: member.role?.toLowerCase().includes("leader") || member.role?.toLowerCase().includes("chair") }
    ];
  };

  const statusSteps = getStatusSteps();

  return (
    <div className="mt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Current Member Status</h3>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
        
        <div className="w-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 gap-2 min-w-0">
            {statusSteps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step.active 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-muted text-muted-foreground border-muted'
                }`}>
                  {step.active ? '✓' : step.number}
                </div>
                <span className="text-xs text-center mt-2 truncate w-full">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">Latest Action</div>
          <div className="font-semibold text-primary break-words">{getLatestAction()}</div>
        </div>
      </div>
    </div>
  );
};
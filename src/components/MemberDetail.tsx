import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  History,
  Users,
  Vote,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl leading-tight">
                {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
              </CardTitle>
              {member.bio_short && (
                <p className="text-muted-foreground mt-2 text-lg">{member.bio_short}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Party & Chamber
                </h4>
                <p className="text-muted-foreground">
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
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Role</h4>
                <p className="text-muted-foreground">
                  {member.role || "Not specified"}
                </p>
              </div>

              {member.email && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </h4>
                  <p className="text-muted-foreground">
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
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Member Status</h3>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                {statusSteps.map((step, index) => (
                  <div key={step.label} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      step.active 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted text-muted-foreground border-muted'
                    }`}>
                      {step.active ? '✓' : step.number}
                    </div>
                    <span className="text-xs text-center mt-2 max-w-16">{step.label}</span>
                    {index < statusSteps.length - 1 && (
                      <div className={`absolute w-full h-0.5 top-5 left-1/2 transform -translate-y-1/2 -z-10 ${
                        statusSteps[index + 1].active ? 'bg-primary' : 'bg-muted'
                      }`} style={{ width: 'calc(100% - 2.5rem)' }}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Latest Action</div>
                <div className="font-semibold text-primary">{getLatestAction()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="committees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committees
          </TabsTrigger>
          <TabsTrigger value="votes" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Votes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Member History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-border">
                  <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                    Recent
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {member.chamber && (
                        <Badge variant="outline" className="text-xs">
                          {member.chamber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{getLatestAction()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Current status in legislative system</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-center py-8">
                  Detailed member history tracking coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Member Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Document management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="committees">
          <Card>
            <CardHeader>
              <CardTitle>Committee Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {member.committee_id ? (
                <div className="space-y-2">
                  <p className="font-medium">Committee ID: {member.committee_id}</p>
                  <p className="text-muted-foreground text-sm">
                    Full committee details coming soon.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No committee assignments found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle>Voting Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Vote tracking functionality coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
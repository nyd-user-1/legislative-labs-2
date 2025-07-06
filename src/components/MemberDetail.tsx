import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  FileText, 
  History,
  Users,
  Vote,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/dateUtils";

type Member = Tables<"People">;

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
  const [loading, setLoading] = useState(false);

  const getMemberStatusSteps = () => {
    const steps = [
      { label: "Registered", status: "completed" },
      { label: "Verified", status: member.chamber ? "completed" : "current" },
      { label: "Committee Assigned", status: member.committee_id ? "completed" : "pending" },
      { label: "Active", status: member.role ? "completed" : "pending" },
      { label: "Leadership", status: member.role?.toLowerCase().includes("leader") || member.role?.toLowerCase().includes("chair") ? "completed" : "pending" }
    ];
    return steps;
  };

  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  const statusSteps = getMemberStatusSteps();

  return (
    <div className="member-detail-container space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="back-button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
      </div>

      <div className="member-content-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="member-info-card">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="member-id text-2xl leading-tight">
                    {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
                  </CardTitle>
                  {member.bio_short && (
                    <p className="member-description text-muted-foreground mt-2 text-lg">{member.bio_short}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="status-badge active">
                    Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="member-info-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="info-item committee space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Party & Chamber
                    </h4>
                    <p className="text-muted-foreground">
                      {member.party && member.chamber ? `${member.party} - ${member.chamber}` : member.party || member.chamber || "Not specified"}
                    </p>
                  </div>

                  <div className="info-item last-activity space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      District
                    </h4>
                    <p className="text-muted-foreground">
                      {member.district ? `District ${member.district}` : "Not assigned"}
                    </p>
                  </div>

                  {member.email && (
                    <div className="info-item space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </h4>
                      <p className="text-muted-foreground">{member.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="info-item session-id space-y-2">
                    <h4 className="font-medium">Role</h4>
                    <p className="text-muted-foreground">
                      {member.role || "Not specified"}
                    </p>
                  </div>

                  {member.phone_capitol && (
                    <div className="info-item space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Capitol Phone
                      </h4>
                      <p className="text-muted-foreground">{member.phone_capitol}</p>
                    </div>
                  )}

                  {(member.ballotpedia || member.photo_url) && (
                    <div className="info-item external-link space-y-2">
                      <h4 className="font-medium">External Link</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(member.ballotpedia || '#', '_blank')}
                        className="external-link-button flex items-center gap-2"
                        disabled={!member.ballotpedia}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="member-status-section">
            <CardHeader>
              <CardTitle>Current Member Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="status-progress space-y-4">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center flex-1">
                      <div className={`status-step w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                        step.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : step.status === 'current'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-xs text-center mt-2 max-w-16">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="latest-action mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Latest Action</h4>
                <p className="action-text text-sm font-medium text-primary">
                  {getLatestAction()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {member.photo_url && (
            <Card>
              <CardContent className="p-6">
                <img 
                  src={member.photo_url} 
                  alt={`${member.name || 'Member'} photo`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.phone_district && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>District: {member.phone_district}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{member.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="history" className="tab-navigation space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="tab-button flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="documents" className="tab-button flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="committees" className="tab-button flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committees
          </TabsTrigger>
          <TabsTrigger value="voting" className="tab-button flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Voting Record
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="member-history">
            <CardHeader>
              <CardTitle className="section-title">Member History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="history-entry flex gap-4 pb-4 border-b border-border">
                  <div className="history-date flex-shrink-0 w-24 text-sm text-muted-foreground">
                    Recent
                  </div>
                  <div className="flex-1">
                    <p className="history-action text-sm font-medium">{getLatestAction()}</p>
                    <p className="history-details text-sm text-muted-foreground mt-1">
                      Current status in legislative system
                    </p>
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

        <TabsContent value="voting">
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
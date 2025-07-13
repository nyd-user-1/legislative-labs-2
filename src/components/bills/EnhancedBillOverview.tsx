
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Users, Vote, Clock } from "lucide-react";
import { BillStatusBadge } from "@/components/BillStatusBadge";

interface EnhancedBillDetails {
  basePrintNo: string;
  session: number;
  printNo: string;
  billType: {
    chamber: string;
    desc: string;
    resolution: boolean;
  };
  title: string;
  summary?: string;
  status: {
    statusType: string;
    statusDesc: string;
    actionDate: string;
    committeeName?: string;
    billCalNo?: number;
  };
  sponsor?: {
    member: {
      memberId: number;
      shortName: string;
      fullName: string;
      districtCode: number;
    };
    budget: boolean;
    rules: boolean;
  };
  coSponsors: Array<{
    member: {
      memberId: number;
      shortName: string;
      fullName: string;
      districtCode: number;
    };
  }>;
  activeVersion: string;
  votes: Array<any>;
  actions: Array<any>;
  publishedDateTime: string;
}

interface EnhancedBillOverviewProps {
  enhancedDetails: EnhancedBillDetails;
}

export const EnhancedBillOverview = ({ enhancedDetails }: EnhancedBillOverviewProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to safely convert vote counts to numbers
  const getVoteCount = (votes: Array<any>, voteType: string): number => {
    return votes.reduce((sum, vote) => {
      const count = vote[voteType];
      return sum + (typeof count === 'number' ? count : parseInt(count) || 0);
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Bill Summary */}
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enhanced Bill Summary
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{enhancedDetails.billType.chamber}</Badge>
              {enhancedDetails.billType.resolution && (
                <Badge variant="secondary">Resolution</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Bill Number</h4>
            <p className="text-lg font-semibold">{enhancedDetails.printNo}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Title</h4>
            <p className="text-sm leading-relaxed">{enhancedDetails.title}</p>
          </div>
          
          {enhancedDetails.summary && (
            <div className="flex-1">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Summary</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {enhancedDetails.summary}
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t mt-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Session</h4>
                <p className="text-sm">{enhancedDetails.session}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Version</h4>
                <p className="text-sm">{enhancedDetails.activeVersion}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Status & Tracking */}
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <div className="text-right">
                <BillStatusBadge 
                  status={enhancedDetails.status.statusType} 
                  statusDesc={enhancedDetails.status.statusDesc} 
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Last Action</span>
              <span className="text-sm font-medium">{formatDate(enhancedDetails.status.actionDate)}</span>
            </div>
            
            {enhancedDetails.status.committeeName && (
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Committee</span>
                <span className="text-sm font-medium">{enhancedDetails.status.committeeName}</span>
              </div>
            )}
            
            {enhancedDetails.status.billCalNo && (
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Calendar No.</span>
                <span className="text-sm font-medium">{enhancedDetails.status.billCalNo}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Published</span>
              <span className="text-sm font-medium">{formatDate(enhancedDetails.publishedDateTime)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Total Actions</span>
              <span className="text-sm font-medium">{enhancedDetails.actions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Sponsor Information */}
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Sponsor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {enhancedDetails.sponsor && (
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Primary Sponsor</h4>
                <div className="flex gap-2">
                  {enhancedDetails.sponsor.budget && (
                    <Badge variant="outline" className="text-xs">Budget</Badge>
                  )}
                  {enhancedDetails.sponsor.rules && (
                    <Badge variant="outline" className="text-xs">Rules</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">{enhancedDetails.sponsor.member.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {enhancedDetails.sponsor.member.shortName} • District {enhancedDetails.sponsor.member.districtCode}
                </p>
              </div>
            </div>
          )}
          
          {enhancedDetails.coSponsors.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Co-Sponsors ({enhancedDetails.coSponsors.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {enhancedDetails.coSponsors.slice(0, 5).map((coSponsor, index) => (
                  <div key={index} className="text-sm p-2 bg-muted/30 rounded">
                    <p className="font-medium">{coSponsor.member.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      District {coSponsor.member.districtCode}
                    </p>
                  </div>
                ))}
                {enhancedDetails.coSponsors.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{enhancedDetails.coSponsors.length - 5} more co-sponsors
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voting Summary */}
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Voting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enhancedDetails.votes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">
                    {getVoteCount(enhancedDetails.votes, 'aye')}
                  </p>
                  <p className="text-sm text-green-600">Yes Votes</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">
                    {getVoteCount(enhancedDetails.votes, 'nay')}
                  </p>
                  <p className="text-sm text-red-600">No Votes</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-2xl font-bold text-gray-700">
                    {getVoteCount(enhancedDetails.votes, 'absent')}
                  </p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {enhancedDetails.votes.length} vote record{enhancedDetails.votes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Voting Records</h3>
              <p className="text-muted-foreground text-sm">
                No votes have been recorded for this bill yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

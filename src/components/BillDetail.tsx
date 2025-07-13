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
  Vote
} from "lucide-react";
import { BillStatusBadge } from "./BillStatusBadge";
import { BillJourney } from "./BillJourney";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Document = Tables<"Documents">;
type HistoryEntry = Tables<"History Table">;
type Sponsor = Tables<"Sponsors">;
type Person = Tables<"People">;
type RollCall = Tables<"Roll Call">;
type Vote = Tables<"Votes">;

interface BillDetailProps {
  bill: Bill;
  onBack: () => void;
}

export const BillDetail = ({ bill, onBack }: BillDetailProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sponsors, setSponsors] = useState<(Sponsor & { person?: Person })[]>([]);
  const [rollCalls, setRollCalls] = useState<(RollCall & { votes?: (Vote & { person?: Person })[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetails();
  }, [bill.bill_id]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);

      // Fetch documents
      const { data: documentsData } = await supabase
        .from("Documents")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("document_id");

      // Fetch history
      const { data: historyData } = await supabase
        .from("History Table")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("date", { ascending: false });

      // Fetch sponsors and people data separately
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("position");

      // Fetch people data for sponsors
      let sponsorsWithPeople: (Sponsor & { person?: Person })[] = [];
      if (sponsorsData && sponsorsData.length > 0) {
        const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
        
        if (peopleIds.length > 0) {
          const { data: peopleData } = await supabase
            .from("People")
            .select("*")
            .in("people_id", peopleIds);

          sponsorsWithPeople = sponsorsData.map(sponsor => ({
            ...sponsor,
            person: peopleData?.find(p => p.people_id === sponsor.people_id)
          }));
        } else {
          sponsorsWithPeople = sponsorsData.map(sponsor => ({ ...sponsor }));
        }
      }

      // Fetch roll call votes for this bill
      const { data: rollCallData } = await supabase
        .from("Roll Call")
        .select("*")
        .eq("bill_id", bill.bill_id)
        .order("date", { ascending: false });

      // Fetch detailed vote records for each roll call
      let rollCallsWithVotes: (RollCall & { votes?: (Vote & { person?: Person })[] })[] = [];
      if (rollCallData && rollCallData.length > 0) {
        rollCallsWithVotes = await Promise.all(
          rollCallData.map(async (rollCall) => {
            // Get votes for this roll call
            const { data: votesData } = await supabase
              .from("Votes")
              .select("*")
              .eq("roll_call_id", rollCall.roll_call_id);

            // Get person data for the votes
            let votesWithPeople: (Vote & { person?: Person })[] = [];
            if (votesData && votesData.length > 0) {
              const voterIds = votesData.map(v => v.people_id);
              const { data: votersData } = await supabase
                .from("People")
                .select("*")
                .in("people_id", voterIds);

              votesWithPeople = votesData.map(vote => ({
                ...vote,
                person: votersData?.find(p => p.people_id === vote.people_id)
              }));
            }

            return {
              ...rollCall,
              votes: votesWithPeople
            };
          })
        );
      }

      setDocuments(documentsData || []);
      setHistory(historyData || []);
      setSponsors(sponsorsWithPeople);
      setRollCalls(rollCallsWithVotes);

    } catch (error) {
      console.error("Error fetching bill details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="page-container min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <Button 
            variant="outline" 
            onClick={onBack}
            className="btn-secondary border border-gray-300 hover:border-gray-400 active:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>


          {/* Bill Tabs Section */}
          <section>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="flex items-center gap-2 h-10 rounded-md text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sponsors" className="flex items-center gap-2 h-10 rounded-md text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Sponsors
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 h-10 rounded-md text-sm font-medium">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="votes" className="flex items-center gap-2 h-10 rounded-md text-sm font-medium">
                  <Vote className="h-4 w-4" />
                  Votes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bill Summary Card */}
                  <Card className="min-h-[320px] flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">Bill Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm leading-relaxed">
                          {bill.description || bill.title || "No description available for this bill."}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t mt-auto">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Session</h4>
                          <p className="text-sm">{bill.session_id || "Not specified"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Committee</h4>
                          <p className="text-sm">{bill.committee || "Not assigned"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Information Card */}
                  <Card className="min-h-[320px] flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Information</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 flex-1 flex flex-col justify-evenly">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Bill Number</span>
                          <span className="text-sm font-medium">{bill.bill_number || "Not available"}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <div className="text-right">
                            {bill.status !== null ? (
                              <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                            ) : (
                              <span className="text-sm">Unknown</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Last Action</span>
                          <span className="text-sm font-medium">{formatDate(bill.last_action_date)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Total Sponsors</span>
                          <span className="text-sm font-medium">{sponsors.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Bill Sponsors</h2>
                    <Badge variant="secondary" className="text-xs">
                      {sponsors.length} {sponsors.length === 1 ? 'Sponsor' : 'Sponsors'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : sponsors.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        No sponsors information available for this bill.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sponsors.map((sponsor, index) => (
                          <div key={sponsor.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                                {sponsor.position === 1 && (
                                  <Badge variant="default" className="text-xs">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              {sponsor.position && (
                                <span className="text-xs text-muted-foreground">#{sponsor.position}</span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                {sponsor.person?.name || 
                                 `${sponsor.person?.first_name || ''} ${sponsor.person?.last_name || ''}`.trim() ||
                                 `Person ID: ${sponsor.people_id}`}
                              </h4>
                              
                              <div className="flex flex-wrap gap-2">
                                {sponsor.person?.party && (
                                  <Badge variant="outline" className="text-xs">
                                    {sponsor.person.party}
                                  </Badge>
                                )}
                                {sponsor.person?.chamber && (
                                  <Badge variant="outline" className="text-xs">
                                    {sponsor.person.chamber}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {sponsor.person?.role && (
                                  <p>{sponsor.person.role}</p>
                                )}
                                {sponsor.person?.district && (
                                  <p>District {sponsor.person.district}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Legislative History</h2>
                    <Badge variant="secondary" className="text-xs">
                      {history.length} {history.length === 1 ? 'Action' : 'Actions'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">
                        No legislative history available for this bill.
                      </p>
                    ) : (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-6 top-6 bottom-6 w-px bg-border"></div>
                          
                          <div className="space-y-6">
                            {history.map((entry, index) => (
                              <div key={`${entry.date}-${entry.sequence}`} className="relative flex gap-6">
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full mt-2 relative z-10"></div>
                                
                                <div className="flex-1 pb-6">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-sm">
                                      {formatDate(entry.date)}
                                    </h4>
                                    {entry.chamber && (
                                      <Badge variant="outline" className="text-xs">
                                        {entry.chamber}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      Sequence {entry.sequence}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {entry.action || "No action recorded"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="votes" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Voting Records</h2>
                    <Badge variant="secondary" className="text-xs">
                      {rollCalls.length} {rollCalls.length === 1 ? 'Vote' : 'Votes'}
                    </Badge>
                  </div>
                  <div>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : rollCalls.length === 0 ? (
                      <div className="text-center py-12">
                        <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Voting Records</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                          No roll call votes have been recorded for this bill yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {rollCalls.map((rollCall, index) => (
                          <div key={rollCall.roll_call_id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-sm">
                                    {formatDate(rollCall.date)}
                                  </h4>
                                  {rollCall.chamber && (
                                    <Badge variant="outline" className="text-xs">
                                      {rollCall.chamber}
                                    </Badge>
                                  )}
                                </div>
                                {rollCall.description && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {rollCall.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium">{rollCall.yea || 0} Yes</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-medium">{rollCall.nay || 0} No</span>
                                  </div>
                                  {rollCall.absent && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                      <span className="font-medium">{rollCall.absent} Absent</span>
                                    </div>
                                  )}
                                  {rollCall.nv && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                      <span className="font-medium">{rollCall.nv} NV</span>
                                    </div>
                                  )}
                                  <div className="text-muted-foreground">
                                    Total: {rollCall.total || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {rollCall.votes && rollCall.votes.length > 0 && (
                              <div className="border-t border-border pt-4">
                                <h5 className="font-medium text-sm mb-3">Individual Votes</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                  {rollCall.votes.map((vote, voteIndex) => (
                                    <div key={`${vote.people_id}-${vote.roll_call_id}`} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                                      <span className="font-medium">
                                        {vote.person?.name || `Person ${vote.people_id}`}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {vote.person?.party && (
                                          <Badge variant="outline" className="text-xs px-1 py-0">
                                            {vote.person.party}
                                          </Badge>
                                        )}
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          vote.vote_desc === 'Yes' || vote.vote_desc === 'Yea' ? 'bg-green-100 text-green-800' :
                                          vote.vote_desc === 'No' || vote.vote_desc === 'Nay' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {vote.vote_desc || 'Unknown'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};
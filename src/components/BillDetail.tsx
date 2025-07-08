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

interface BillDetailProps {
  bill: Bill;
  onBack: () => void;
}

export const BillDetail = ({ bill, onBack }: BillDetailProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sponsors, setSponsors] = useState<(Sponsor & { person?: Person })[]>([]);
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

      setDocuments(documentsData || []);
      setHistory(historyData || []);
      setSponsors(sponsorsWithPeople);

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
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Navigation Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="btn-secondary border border-gray-300 hover:border-gray-400 active:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bills
              </Button>
            </div>
          </section>

          {/* Bill Header Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl leading-tight">
                  {bill.bill_number || "No Bill Number"}
                </CardTitle>
                {bill.title && (
                  <p className="text-muted-foreground mt-2 text-lg">{bill.title}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {bill.status !== null && (
                  <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                )}
              </div>
            </div>
          </section>

          {/* Bill Metadata Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Committee
                  </h4>
                  <p className="text-muted-foreground">
                    {bill.committee || "Not assigned"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Action Date
                  </h4>
                  <p className="text-muted-foreground">
                    {formatDate(bill.last_action_date)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Session ID</h4>
                  <p className="text-muted-foreground">
                    {bill.session_id || "Not specified"}
                  </p>
                </div>

                {bill.url && (
                  <div className="space-y-2">
                    <h4 className="font-medium">External Link</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(bill.url!, '_blank')}
                      className="btn-secondary border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Official Site
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Bill Status Progress Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <BillJourney 
              status={bill.status}
              statusDesc={bill.status_desc}
              lastAction={bill.last_action}
            />
          </section>

          {/* Bill Tabs Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">Bill Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm leading-relaxed">
                          {bill.description || bill.title || "No description available for this bill."}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
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
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">Key Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
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

                {/* Recent Activity */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No recent activity available.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history.slice(0, 5).map((entry, index) => (
                          <div key={`${entry.date}-${entry.sequence}`} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                            <div className="flex-shrink-0 w-20 text-xs text-muted-foreground mt-1">
                              {formatDate(entry.date)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {entry.chamber && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.chamber}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground break-words">{entry.action || "No action recorded"}</p>
                            </div>
                          </div>
                        ))}
                        {history.length > 5 && (
                          <div className="text-center pt-2">
                            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                              View all history ({history.length} total)
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sponsors" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Bill Sponsors</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {sponsors.length} {sponsors.length === 1 ? 'Sponsor' : 'Sponsors'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Legislative History</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {history.length} {history.length === 1 ? 'Action' : 'Actions'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="votes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Voting Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Vote Tracking Coming Soon</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        We're working on bringing you detailed voting records and roll call information for this bill.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};
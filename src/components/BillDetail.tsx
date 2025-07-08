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
import { BillProgress } from "./BillProgress";
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
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        {/* Navigation */}
        <Card>
          <CardContent className="p-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bills
            </Button>
          </CardContent>
        </Card>

        {/* Bill Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {bill.bill_number || "No Bill Number"}
                </h1>
                {bill.title && (
                  <p className="text-lg text-muted-foreground">{bill.title}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {bill.status !== null && (
                  <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Content Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sponsors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sponsors
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="votes" className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  Votes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Bill Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">CURRENT STATUS</h3>
                        <div className="flex items-center gap-2">
                          {bill.status !== null && (
                            <BillStatusBadge status={bill.status} statusDesc={bill.status_desc} />
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">LAST ACTION</h3>
                        <p className="text-sm">
                          {bill.last_action || "No recent action"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(bill.last_action_date)}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">COMMITTEE</h3>
                        <p className="text-sm">
                          {bill.committee || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">SESSION</h3>
                        <p className="text-sm">
                          {bill.session_id || "Not specified"}
                        </p>
                      </div>

                      {bill.url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(bill.url!, '_blank')}
                          className="w-full flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View on Legislature Site
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Bill Progress */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-4">BILL PROGRESS</h3>
                      <BillProgress status={bill.status} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sponsors">
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : sponsors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No sponsors information available for this bill.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sponsors.map((sponsor, index) => (
                        <div key={sponsor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">
                                  {sponsor.person?.name || 
                                   `${sponsor.person?.first_name || ''} ${sponsor.person?.last_name || ''}`.trim() ||
                                   `Person ID: ${sponsor.people_id}`}
                                </h4>
                                <Badge variant={sponsor.position === 1 ? "default" : "secondary"} className="text-xs">
                                  {sponsor.position === 1 ? "Primary Sponsor" : "Co-Sponsor"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {sponsor.person?.party && (
                                  <span>{sponsor.person.party}</span>
                                )}
                                {sponsor.person?.district && (
                                  <span>• District {sponsor.person.district}</span>
                                )}
                                {sponsor.person?.chamber && (
                                  <span>• {sponsor.person.chamber}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No history available for this bill.
                    </p>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {history.map((entry, index) => (
                          <div key={`${entry.date}-${entry.sequence}`} className="relative pl-8 pb-6 last:pb-0">
                            {/* Timeline line */}
                            {index !== history.length - 1 && (
                              <div className="absolute left-2 top-6 w-px h-full bg-border"></div>
                            )}
                            
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-2 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {formatDate(entry.date)}
                                </span>
                                {entry.chamber && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.chamber}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {entry.action || "No action recorded"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="votes">
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Voting Records</h3>
                    <p className="text-muted-foreground">
                      Detailed voting records and roll call information will be available here once the bill reaches the voting stage.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
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
                <TabsTrigger value="sponsors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sponsors
                </TabsTrigger>
                <TabsTrigger value="votes" className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  Votes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Bill History</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {history.map((entry, index) => (
                            <div key={`${entry.date}-${entry.sequence}`} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                              <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                                {formatDate(entry.date)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {entry.chamber && (
                                    <Badge variant="outline" className="text-xs">
                                      {entry.chamber}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    Seq: {entry.sequence}
                                  </span>
                                </div>
                                <p className="text-sm">{entry.action || "No action recorded"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Related Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : documents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No documents available for this bill.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.document_id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                {doc.document_desc || `Document ${doc.document_id}`}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {doc.document_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {doc.document_type}
                                  </Badge>
                                )}
                                {doc.document_mime && (
                                  <span>{doc.document_mime}</span>
                                )}
                                {doc.document_size && (
                                  <span>{formatFileSize(doc.document_size)}</span>
                                )}
                              </div>
                            </div>
                            {doc.url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.url!, '_blank')}
                                className="btn-secondary border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sponsors">
                <Card>
                  <CardHeader>
                    <CardTitle>Bill Sponsors</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                      <div className="space-y-4">
                        {sponsors.map((sponsor) => (
                          <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                {sponsor.person?.name || 
                                 `${sponsor.person?.first_name || ''} ${sponsor.person?.last_name || ''}`.trim() ||
                                 `Person ID: ${sponsor.people_id}`}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {sponsor.person?.party && (
                                  <Badge variant="outline" className="text-xs">
                                    {sponsor.person.party}
                                  </Badge>
                                )}
                                {sponsor.person?.role && (
                                  <span>{sponsor.person.role}</span>
                                )}
                                {sponsor.person?.district && (
                                  <span>District {sponsor.person.district}</span>
                                )}
                                {sponsor.position && (
                                  <span>Position {sponsor.position}</span>
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
          </section>
        </div>
      </div>
    </div>
  );
};
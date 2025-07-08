import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, FileText, Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { useNYSApi } from "@/hooks/useNYSApi";
import { NYSMember, NYSBill } from "@/types/nysApi";
import { formatDistanceToNow } from "date-fns";

type EnhancedCommittee = {
  name: string;
  memberCount: number;
  billCount: number;
  description?: string;
  chair_name?: string;
  ranking_member_name?: string;
  committee_type: string;
  chamber: string;
  meetingDateTime?: string;
  location?: string;
  agendaNo?: number;
  year?: number;
  members?: NYSMember[];
  upcomingMeetings?: Array<{
    date: string;
    location: string;
    agenda: any;
  }>;
};

interface EnhancedCommitteeDetailProps {
  committee: EnhancedCommittee;
  onBack: () => void;
}

export const EnhancedCommitteeDetail = ({ committee, onBack }: EnhancedCommitteeDetailProps) => {
  const [recentBills, setRecentBills] = useState<NYSBill[]>([]);
  const [agendaItems, setAgendaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchBills, getAgenda } = useNYSApi();

  useEffect(() => {
    const fetchCommitteeData = async () => {
      setLoading(true);
      
      try {
        // Search for bills related to this committee
        const billsResult = await searchBills({
          term: `committee:"${committee.name}"`,
          limit: 10,
          offset: 0
        });

        if (billsResult?.result?.items) {
          setRecentBills(billsResult.result.items);
        }

        // Fetch agenda if available
        if (committee.year && committee.agendaNo) {
          const agendaResult = await getAgenda(committee.year, committee.agendaNo, committee.name);
          if (agendaResult?.bills?.items) {
            setAgendaItems(agendaResult.bills.items);
          }
        }
      } catch (error) {
        console.error("Error fetching committee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeData();
  }, [committee.name, committee.year, committee.agendaNo, searchBills, getAgenda]);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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
                <span className="hidden sm:inline">Back to Committees</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </section>

          {/* Committee Header Section */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl leading-tight break-words">
                  {committee.name}
                </CardTitle>
                {committee.description && (
                  <p className="text-muted-foreground mt-2 text-base sm:text-lg break-words">
                    {committee.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {committee.chamber}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {committee.committee_type}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Committee Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{committee.memberCount}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{committee.billCount}</div>
                    <div className="text-sm text-gray-600">Active Bills</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{committee.upcomingMeetings?.length || 0}</div>
                    <div className="text-sm text-gray-600">Upcoming Meetings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {committee.meetingDateTime ? 'Scheduled' : 'TBD'}
                    </div>
                    <div className="text-sm text-gray-600">Next Meeting</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <section className="section-container bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="bills">Bills</TabsTrigger>
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  {committee.chair_name && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Committee Leadership</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Chair:</span>
                          <p className="font-medium">{committee.chair_name}</p>
                        </div>
                        {committee.ranking_member_name && (
                          <div>
                            <span className="text-sm text-gray-600">Ranking Member:</span>
                            <p className="font-medium">{committee.ranking_member_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {committee.meetingDateTime && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Next Meeting</h4>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(committee.meetingDateTime)}</span>
                      </div>
                      {committee.location && (
                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                          <MapPin className="h-4 w-4" />
                          <span>{committee.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <div className="space-y-3">
                  {committee.members && committee.members.length > 0 ? (
                    committee.members.map((member) => (
                      <div
                        key={member.memberId}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.chamber} - District {member.districtCode}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {member.chamber}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">Loading member information...</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bills" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : recentBills.length > 0 ? (
                    recentBills.map((bill) => (
                      <div
                        key={bill.printNo}
                        className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">
                            <span className="text-blue-600 mr-2">{bill.printNo}</span>
                            {bill.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Sponsor: {bill.sponsor?.member?.fullName}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Published: {formatDistanceToNow(new Date(bill.publishedDateTime))} ago
                          </div>
                        </div>
                        <Badge variant="outline" className="border-gray-300 text-gray-700 ml-3 flex-shrink-0">
                          {bill.status?.statusDesc}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No recent bills found for this committee.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="meetings" className="mt-6">
                <div className="space-y-3">
                  {committee.upcomingMeetings && committee.upcomingMeetings.length > 0 ? (
                    committee.upcomingMeetings.map((meeting, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {formatDateTime(meeting.date)}
                          </div>
                          <Badge variant="outline">Upcoming</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No upcoming meetings scheduled.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : agendaItems.length > 0 ? (
                    agendaItems.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="font-medium text-gray-900">
                          {item.billId?.printNo} - Cal No. {item.billCalNo}
                        </div>
                        {item.high && (
                          <Badge variant="outline" className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-700">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No current agenda items available.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
};
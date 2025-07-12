import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { AIChatSheet } from "@/components/AIChatSheet";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  chamber?: string;
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface RecentLegislativeActivityProps {
  onViewAllBills: () => void;
}

export const RecentLegislativeActivity = ({ onViewAllBills }: RecentLegislativeActivityProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const [billsWithAIChat, setBillsWithAIChat] = useState<Set<number>>(new Set());
  
  const { favoriteBillIds, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 10;
  const MAX_BILLS = 50;

  useEffect(() => {
    fetchBillsWithAIChat();
  }, []);

  useEffect(() => {
    fetchRecentBills();
  }, [currentPage]);

  const fetchBillsWithAIChat = async () => {
    try {
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("bill_id")
        .not("bill_id", "is", null);

      if (sessions) {
        const billIdsWithChat = new Set(
          sessions.map(session => session.bill_id).filter(Boolean)
        );
        setBillsWithAIChat(billIdsWithChat);
      }
    } catch (error) {
      console.error("Error fetching AI chat sessions:", error);
    }
  };

  const fetchRecentBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate offset for pagination
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      // Fetch bills with pagination - using API approach for freshest data
      const { data: billsData, count } = await supabase
        .from("Bills")
        .select("*", { count: "exact" })
        .not("last_action_date", "is", null)
        .order("last_action_date", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .limit(Math.min(MAX_BILLS, ITEMS_PER_PAGE));

      if (billsData) {
        // Enhance bills with sponsor information
        const billsWithSponsors = await Promise.all(
          billsData.map(async (bill) => {
            // Determine chamber from bill number
            let chamber = "Unknown";
            if (bill.bill_number?.toUpperCase().startsWith('A')) {
              chamber = "Assembly";
            } else if (bill.bill_number?.toUpperCase().startsWith('S')) {
              chamber = "Senate";
            }

            // Fetch sponsors
            const { data: sponsorsData } = await supabase
              .from("Sponsors")
              .select("people_id, position")
              .eq("bill_id", bill.bill_id)
              .order("position", { ascending: true })
              .limit(2); // Limit to primary sponsors

            let sponsors: Array<{ name: string | null; party: string | null; chamber: string | null; }> = [];
            
            if (sponsorsData && sponsorsData.length > 0) {
              const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);
              if (peopleIds.length > 0) {
                const { data: peopleData } = await supabase
                  .from("People")
                  .select("people_id, name, party, chamber")
                  .in("people_id", peopleIds);
                
                sponsors = sponsorsData.map(sponsor => {
                  const person = peopleData?.find(p => p.people_id === sponsor.people_id);
                  return {
                    name: person?.name || null,
                    party: person?.party || null,
                    chamber: person?.chamber || null
                  };
                }).filter(s => s.name);
              }
            }

            return { ...bill, chamber, sponsors };
          })
        );

        setBills(billsWithSponsors);
        
        // Calculate total pages based on max bills limit
        const totalBills = Math.min(count || 0, MAX_BILLS);
        setTotalPages(Math.ceil(totalBills / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error("Error fetching recent bills:", err);
      setError("Failed to load recent legislative activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBillClick = (bill: Bill) => {
    navigate(`/bills?selected=${bill.bill_id}`);
  };

  const handleAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setChatOpen(true);
    setBillsWithAIChat(prev => new Set([...prev, bill.bill_id]));
  };

  const handleFavorite = async (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bill.bill_id);
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getStatusColor = (statusDesc: string | null) => {
    if (!statusDesc) return "bg-gray-100 text-gray-700";
    
    const status = statusDesc.toLowerCase();
    if (status.includes("passed") || status.includes("signed")) {
      return "bg-green-100 text-green-700";
    } else if (status.includes("committee")) {
      return "bg-blue-100 text-blue-700";
    } else if (status.includes("senate") || status.includes("assembly")) {
      return "bg-purple-100 text-purple-700";
    } else if (status.includes("vetoed") || status.includes("defeated")) {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  if (loading && currentPage === 1) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Legislative Activity</CardTitle>
            <Button variant="outline" size="sm" disabled>
              View All Bills
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg">Recent Legislative Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Last {MAX_BILLS} bills
            </Badge>
          </div>
          <Button variant="outline" onClick={onViewAllBills} size="sm" className="self-start sm:self-auto">
            View All Bills
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchRecentBills()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[600px] w-full pr-4">
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div
                    key={bill.bill_id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleBillClick(bill)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{bill.bill_number}</span>
                          {bill.chamber && (
                            <Badge variant="outline" className="text-xs">
                              {bill.chamber}
                            </Badge>
                          )}
                          {bill.status_desc && (
                            <Badge className={`text-xs ${getStatusColor(bill.status_desc)}`}>
                              {bill.status_desc}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">
                          {bill.title || "Untitled Bill"}
                        </h3>
                        
                        {bill.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {bill.description}
                          </p>
                        )}
                        
                        {bill.sponsors && bill.sponsors.length > 0 && (
                          <p className="text-xs text-gray-500 mb-2">
                            Sponsor{bill.sponsors.length > 1 ? 's' : ''}: {bill.sponsors.map(s => s.name).join(', ')}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(bill.last_action_date)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleFavorite(bill, e)}
                              className="h-8 w-8 p-0"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favoriteBillIds.has(bill.bill_id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400"
                                }`}
                              />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleAIAnalysis(bill, e)}
                              className="h-8 w-8 p-0"
                            >
                              <MessageSquare
                                className={`h-4 w-4 ${
                                  billsWithAIChat.has(bill.bill_id)
                                    ? "fill-blue-500 text-blue-500"
                                    : "text-gray-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && currentPage > 1 && (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    </PaginationItem>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={currentPage === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loading}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <span className="px-2 text-sm text-gray-500">...</span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            variant={currentPage === totalPages ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={loading}
                          >
                            {totalPages}
                          </Button>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>

      <AIChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        bill={selectedBillForChat}
      />
    </Card>
  );
};